"""添加订阅付费相关字段

Revision ID: sub20261003
Revises: f0e1d2c3b4a5
Create Date: 2026-10-03 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'sub20261003'
down_revision = 'f0e1d2c3b4a5'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 添加订阅相关字段到 users 表
    op.add_column('users', sa.Column('subscription_level', sa.String(20), server_default='free', comment='订阅级别：free/basic/pro'))
    op.add_column('users', sa.Column('subscription_expire_at', sa.DateTime(timezone=True), nullable=True, comment='订阅过期时间'))
    op.add_column('users', sa.Column('daily_generation_used', sa.Integer(), server_default='0', comment='今日已使用生成次数'))
    op.add_column('users', sa.Column('daily_generation_limit', sa.Integer(), server_default='3', comment='每日生成次数限制'))
    op.add_column('users', sa.Column('last_generation_reset_date', sa.Date(), nullable=True, comment='上次重置生成次数的日期'))


def downgrade() -> None:
    # 删除订阅相关字段
    op.drop_column('users', 'last_generation_reset_date')
    op.drop_column('users', 'daily_generation_limit')
    op.drop_column('users', 'daily_generation_used')
    op.drop_column('users', 'subscription_expire_at')
    op.drop_column('users', 'subscription_level')
