"""易支付网关服务"""
import hashlib
import time
from typing import Optional
from urllib.parse import urlencode
from app.logger import get_logger

logger = get_logger(__name__)


class EasyPayGateway:
    """易支付网关对接"""

    def __init__(
        self,
        pid: str,
        api_key: str,
        gateway_url: str,
    ):
        self.pid = pid
        self.api_key = api_key
        self.gateway_url = gateway_url.rstrip('/')

    def create_payment_url(
        self,
        out_trade_no: str,
        total_amount: float,
        subject: str,
        notify_url: str,
        return_url: Optional[str] = None,
        payment_method: str = 'alipay',
    ) -> str:
        """
        创建支付链接
        
        Args:
            out_trade_no: 商户订单号
            total_amount: 支付金额（元）
            subject: 商品名称
            notify_url: 异步回调地址
            return_url: 同步跳转地址
            payment_method: 支付方式 (alipay, wechat)
        
        Returns:
            支付跳转URL
        """
        params = {
            'pid': self.pid,
            'type': payment_method,
            'out_trade_no': out_trade_no,
            'money': str(total_amount),
            'notify_url': notify_url,
            'return_url': return_url or notify_url,
            'sitename': '墨小语',
        }
        
        # 生成签名
        sign_str = urlencode(sorted(params.items())) + self.api_key
        sign = hashlib.md5(sign_str.encode()).hexdigest()
        params['sign'] = sign
        params['sign_type'] = 'MD5'
        
        # 构建支付URL
        pay_url = f"{self.gateway_url}/submit.aspx?" + urlencode(params)
        logger.info(f"[EasyPay] 创建支付订单: {out_trade_no}, 金额: {total_amount}元")
        
        return pay_url

    def verify_callback(self, params: dict) -> bool:
        """
        验证回调签名
        
        Args:
            params: 回调参数
        
        Returns:
            签名是否有效
        """
        sign = params.get('sign', '')
        sign_type = params.get('sign_type', 'MD5')
        
        # 移除sign和sign_type
        filtered = {k: v for k, v in params.items() if k not in ('sign', 'sign_type')}
        
        # 按key排序并拼接
        sign_str = urlencode(sorted(filtered.items())) + self.api_key
        
        if sign_type == 'MD5':
            expected_sign = hashlib.md5(sign_str.encode()).hexdigest()
        elif sign_type == 'SHA256':
            expected_sign = hashlib.sha256(sign_str.encode()).hexdigest()
        else:
            return False
        
        return sign.lower() == expected_sign.lower()

    def parse_callback(self, params: dict) -> dict:
        """
        解析回调参数
        
        Returns:
            包含 trade_status, trade_no, out_trade_no, amount 等字段的字典
        """
        return {
            'trade_status': params.get('trade_status', ''),  # success, fail
            'trade_no': params.get('trade_no', ''),  # 易支付订单号
            'out_trade_no': params.get('out_trade_no', ''),  # 商户订单号
            'amount': float(params.get('money', 0)),
            'type': params.get('type', ''),  # alipay, wechat
            'time': params.get('time', ''),
        }


# 全局支付网关实例（通过环境变量或配置初始化）
_pay_gateway: Optional[EasyPayGateway] = None


def init_pay_gateway(
    pid: str = None,
    api_key: str = None,
    gateway_url: str = None,
) -> Optional[EasyPayGateway]:
    """初始化支付网关"""
    global _pay_gateway
    
    if pid and api_key and gateway_url:
        _pay_gateway = EasyPayGateway(
            pid=pid,
            api_key=api_key,
            gateway_url=gateway_url,
        )
        logger.info(f"[EasyPay] 支付网关已初始化: {gateway_url}")
    else:
        logger.warning("[EasyPay] 支付网关未配置，跳过初始化")
    
    return _pay_gateway


def get_pay_gateway() -> Optional[EasyPayGateway]:
    """获取支付网关实例"""
    return _pay_gateway
