"""支付管理API"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional

from app.models.user import User
from app.api.auth import get_current_user
from app.services import payment_service

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
