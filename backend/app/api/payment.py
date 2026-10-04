"""支付管理API"""
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import PlainTextResponse
from pydantic import BaseModel
from typing import Optional

from app.models.user import User
from app.api.auth import get_current_user
from app.services import payment_service
from app.services.easy_pay_gateway import get_pay_gateway
from app.config import settings

router = APIRouter(prefix="/payment", tags=["支付管理"])


class CreateOrderRequest(BaseModel):
    level: str
    period: str


class CreateOrderResponse(BaseModel):
    order_id: str
    amount: int
    amount_yuan: float
    subscription_level: str
    subscription_name: str
    period: str
    period_label: str
    months: int
    expire_at: str


class OrderStatusResponse(BaseModel):
    order_id: str
    subscription_level: str
    subscription_name: str
    period: str
    amount: int
    amount_yuan: float
    payment_method: Optional[str] = None
    status: str
    trade_no: Optional[str] = None
    paid_at: Optional[str] = None
    created_at: Optional[str] = None


class SimulatePaymentRequest(BaseModel):
    order_id: str
    payment_method: str = 'alipay'


@router.post("/create-order", response_model=CreateOrderResponse)
async def create_order(
    req: CreateOrderRequest,
    current_user: User = Depends(get_current_user),
):
    """创建支付订单"""
    try:
        result = await payment_service.create_order(
            user_id=current_user['user_id'],
            level=req.level,
            period=req.period,
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/order/{order_id}", response_model=OrderStatusResponse)
async def get_order_status(
    order_id: str,
    current_user: User = Depends(get_current_user),
):
    """查询订单状态"""
    result = await payment_service.get_order(order_id, current_user['user_id'])
    if not result:
        raise HTTPException(status_code=404, detail="订单不存在")
    return result


@router.get("/orders")
async def list_orders(
    limit: int = 20,
    current_user: User = Depends(get_current_user),
):
    """查询订单列表"""
    orders = await payment_service.list_orders(current_user['user_id'], limit)
    return {"orders": orders}


@router.post("/simulate")
async def simulate_payment(
    req: SimulatePaymentRequest,
    current_user: User = Depends(get_current_user),
):
    """模拟支付（仅开发/测试环境）"""
    try:
        result = await payment_service.simulate_payment(
            order_id=req.order_id,
            user_id=current_user['user_id'],
            payment_method=req.payment_method,
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/get-pay-url")
async def get_pay_url(
    req: SimulatePaymentRequest,
    current_user: User = Depends(get_current_user),
):
    """获取支付跳转链接（对接易支付）"""
    pay_gateway = get_pay_gateway()
    if not pay_gateway:
        raise HTTPException(status_code=400, detail="支付功能未启用")
    
    try:
        # 获取订单信息
        order = await payment_service.get_order(req.order_id, current_user['user_id'])
        if not order:
            raise HTTPException(status_code=404, detail="订单不存在")
        if order['status'] != 'pending':
            raise HTTPException(status_code=400, detail="订单状态异常")
        
        # 构建支付参数
        payment_method = 'alipay' if req.payment_method == 'alipay' else 'wechat'
        
        # 获取回调地址
        frontend_url = settings.FRONTEND_URL.rstrip('/')
        notify_url = f"{frontend_url}/api/payment/notify"
        return_url = f"{frontend_url}/payment?order_id={req.order_id}&status=success"
        
        # 创建支付链接
        pay_url = pay_gateway.create_payment_url(
            out_trade_no=req.order_id,
            total_amount=order['amount_yuan'],
            subject=f"墨小语-{order['subscription_name']}-{order['period_label']}",
            notify_url=notify_url,
            return_url=return_url,
            payment_method=payment_method,
        )
        
        return {'pay_url': pay_url}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/notify")
async def payment_notify(request: Request):
    """易支付异步回调"""
    pay_gateway = get_pay_gateway()
    if not pay_gateway:
        return PlainTextResponse("fail", status_code=400)
    
    try:
        params = dict(request.query_params)
        if not params:
            body = await request.body()
            body_str = body.decode()
            import urllib.parse
            params = dict(urllib.parse.parse_qsl(body_str))
        
        # 验证签名
        if not pay_gateway.verify_callback(params):
            return PlainTextResponse("fail")
        
        # 解析回调
        result = pay_gateway.parse_callback(params)
        
        if result['trade_status'] == 'success':
            # 处理支付成功逻辑
            await payment_service.simulate_payment(
                order_id=result['out_trade_no'],
                user_id="",  # 从订单中获取
                payment_method=result['type'],
            )
            return PlainTextResponse("success")
        else:
            return PlainTextResponse("fail")
    except Exception as e:
        from app.logger import get_logger
        logger = get_logger(__name__)
        logger.error(f"支付回调处理失败: {e}")
        return PlainTextResponse("fail")
