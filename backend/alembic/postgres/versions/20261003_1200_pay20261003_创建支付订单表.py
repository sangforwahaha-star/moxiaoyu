"""创建支付订单表

Revision ID: pay20261003
Revises: sub20261003
Create Date: 2026-10-03 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'pay20261003'
down_revision = 'sub20261003'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'payment_orders',
        sa.Column('order_id', sa.String(64), primary_key=True, comment='订单ID'),
        sa.Column('user_id', sa.String(100), nullable=False, index=True, comment='用户ID'),
        sa.Column('subscription_level', sa.String(20), nullable=False, comment='订阅级别'),
        sa.Column('period', sa.String(10), nullable=False, comment='计费周期：monthly/yearly'),
        sa.Column('amount', sa.Integer(), nullable=False, comment='支付金额（分）'),
        sa.Column('payment_method', sa.String(20), nullable=True, comment='支付方式：alipay/wechat'),
        sa.Column('status', sa.String(20), nullable=False, server_default='pending', comment='订单状态：pending/paid/failed/expired'),
        sa.Column('trade_no', sa.String(128), nullable=True, comment='第三方支付流水号'),
        sa.Column('paid_at', sa.DateTime(timezone=True), nullable=True, comment='支付时间'),
        sa.Column('expire_at', sa.DateTime(timezone=True), nullable=True, comment='订单过期时间'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), comment='创建时间'),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), comment='更新时间'),
    )


def downgrade() -> None:
    op.drop_table('payment_orders')
