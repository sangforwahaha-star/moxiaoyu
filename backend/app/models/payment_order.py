"""支付订单模型"""
from sqlalchemy import Column, String, Integer, DateTime, Text
from sqlalchemy.sql import func
from app.database import Base


class PaymentOrder(Base):
    """支付订单"""
    __tablename__ = "payment_orders"

    order_id = Column(String(64), primary_key=True, comment="订单ID")
    user_id = Column(String(100), nullable=False, index=True, comment="用户ID")
    subscription_level = Column(String(20), nullable=False, comment="订阅级别")
    period = Column(String(10), nullable=False, comment="计费周期：monthly/yearly")
    amount = Column(Integer, nullable=False, comment="支付金额（分）")
    payment_method = Column(String(20), nullable=True, comment="支付方式：alipay/wechat")
    status = Column(String(20), nullable=False, default='pending', comment="订单状态：pending/paid/failed/expired")
    trade_no = Column(String(128), nullable=True, comment="第三方支付流水号")
    paid_at = Column(DateTime(timezone=True), nullable=True, comment="支付时间")
    expire_at = Column(DateTime(timezone=True), nullable=True, comment="订单过期时间")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), comment="创建时间")
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), comment="更新时间")
