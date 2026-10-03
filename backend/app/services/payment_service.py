"""支付服务 - 处理订单创建、支付确认和订阅激活"""
import uuid
from datetime import datetime, timedelta, timezone
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from app.database import get_engine
from app.models.user import User
from app.models.payment_order import PaymentOrder
from app.services.subscription_service import SUBSCRIPTION_TIERS, update_subscription


ORDER_EXPIRE_MINUTES = 30


async def _get_session(user_id: str) -> tuple:
    engine = await get_engine(user_id)
    factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    session = factory()
    return session, engine


def _generate_order_id() -> str:
    return f"mxy_{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}_{uuid.uuid4().hex[:8]}"


def _get_price(level: str, period: str) -> int:
    """获取价格（单位：分）"""
    tier = SUBSCRIPTION_TIERS.get(level)
    if not tier:
        raise ValueError("无效的订阅级别")
    if period == 'yearly':
        return tier['price_yearly'] * 100
    return tier['price_monthly'] * 100


def _get_months(period: str) -> int:
    return 12 if period == 'yearly' else 1


async def create_order(user_id: str, level: str, period: str) -> dict:
    """创建支付订单"""
    if level not in SUBSCRIPTION_TIERS or level == 'free':
        raise ValueError("无效的订阅级别")
    if period not in ('monthly', 'yearly'):
        raise ValueError("无效的计费周期")

    amount = _get_price(level, period)
    order_id = _generate_order_id()
    now = datetime.now(timezone.utc)
    expire_at = now + timedelta(minutes=ORDER_EXPIRE_MINUTES)

    session = None
    try:
        session, _ = await _get_session(user_id)
        order = PaymentOrder(
            order_id=order_id,
            user_id=user_id,
            subscription_level=level,
            period=period,
            amount=amount,
            status='pending',
            expire_at=expire_at,
        )
        session.add(order)
        await session.commit()

        tier = SUBSCRIPTION_TIERS[level]
        return {
            'order_id': order_id,
            'amount': amount,
            'amount_yuan': amount / 100,
            'subscription_level': level,
            'subscription_name': tier['name'],
            'period': period,
            'period_label': '年付' if period == 'yearly' else '月付',
            'months': _get_months(period),
            'expire_at': expire_at.isoformat(),
        }
    finally:
        if session:
            await session.close()


async def get_order(order_id: str, user_id: str) -> dict | None:
    """查询订单"""
    session = None
    try:
        session, _ = await _get_session(user_id)
        result = await session.execute(
            select(PaymentOrder).where(
                PaymentOrder.order_id == order_id,
                PaymentOrder.user_id == user_id,
            )
        )
        order = result.scalar_one_or_none()
        if not order:
            return None

        now = datetime.now(timezone.utc)
        if order.status == 'pending' and order.expire_at and order.expire_at < now:
            await session.execute(
                update(PaymentOrder)
                .where(PaymentOrder.order_id == order_id)
                .values(status='expired')
            )
            await session.commit()
            order.status = 'expired'

        tier = SUBSCRIPTION_TIERS.get(order.subscription_level, {})
        return {
            'order_id': order.order_id,
            'subscription_level': order.subscription_level,
            'subscription_name': tier.get('name', ''),
            'period': order.period,
            'amount': order.amount,
            'amount_yuan': order.amount / 100,
            'payment_method': order.payment_method,
            'status': order.status,
            'trade_no': order.trade_no,
            'paid_at': order.paid_at.isoformat() if order.paid_at else None,
            'created_at': order.created_at.isoformat() if order.created_at else None,
        }
    finally:
        if session:
            await session.close()


async def list_orders(user_id: str, limit: int = 20) -> list[dict]:
    """查询用户订单列表"""
    session = None
    try:
        session, _ = await _get_session(user_id)
        result = await session.execute(
            select(PaymentOrder)
            .where(PaymentOrder.user_id == user_id)
            .order_by(PaymentOrder.created_at.desc())
            .limit(limit)
        )
        orders = result.scalars().all()

        now = datetime.now(timezone.utc)
        expired_ids = []
        for o in orders:
            if o.status == 'pending' and o.expire_at and o.expire_at < now:
                expired_ids.append(o.order_id)
                o.status = 'expired'

        if expired_ids:
            await session.execute(
                update(PaymentOrder)
                .where(PaymentOrder.order_id.in_(expired_ids))
                .values(status='expired')
            )
            await session.commit()

        return [
            {
                'order_id': o.order_id,
                'subscription_level': o.subscription_level,
                'subscription_name': SUBSCRIPTION_TIERS.get(o.subscription_level, {}).get('name', ''),
                'period': o.period,
                'amount': o.amount,
                'amount_yuan': o.amount / 100,
                'payment_method': o.payment_method,
                'status': o.status,
                'paid_at': o.paid_at.isoformat() if o.paid_at else None,
                'created_at': o.created_at.isoformat() if o.created_at else None,
            }
            for o in orders
        ]
    finally:
        if session:
            await session.close()


async def simulate_payment(order_id: str, user_id: str, payment_method: str = 'alipay') -> dict:
    """模拟支付（开发/测试用）。生产环境替换为真实支付网关回调。"""
    session = None
    try:
        session, _ = await _get_session(user_id)
        result = await session.execute(
            select(PaymentOrder).where(
                PaymentOrder.order_id == order_id,
                PaymentOrder.user_id == user_id,
            )
        )
        order = result.scalar_one_or_none()
        if not order:
            raise ValueError("订单不存在")
        if order.status != 'pending':
            raise ValueError(f"订单状态异常：{order.status}")

        now = datetime.now(timezone.utc)
        trade_no = f"SIM_{uuid.uuid4().hex[:16].upper()}"

        await session.execute(
            update(PaymentOrder)
            .where(PaymentOrder.order_id == order_id)
            .values(
                status='paid',
                payment_method=payment_method,
                trade_no=trade_no,
                paid_at=now,
            )
        )
        await session.commit()

        months = _get_months(order.period)
        expire_at = now + timedelta(days=30 * months)
        await update_subscription(user_id, order.subscription_level, expire_at)

        return {
            'success': True,
            'order_id': order_id,
            'trade_no': trade_no,
            'message': f"支付成功，已激活{SUBSCRIPTION_TIERS[order.subscription_level]['name']}",
            'expire_at': expire_at.isoformat(),
        }
    finally:
        if session:
            await session.close()
