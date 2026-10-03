"""订阅管理服务 - 处理用户订阅级别和生成次数限制"""
from datetime import datetime, date, timezone
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from app.database import get_engine
from app.models.user import User


SUBSCRIPTION_TIERS = {
    'free': {
        'name': '免费版',
        'daily_limit': 3,
        'monthly_word_limit': 10000,
        'project_limit': 2,
        'price_monthly': 0,
        'price_yearly': 0,
        'features': [
            '最多创建2个项目',
            '每月AI生成字数：1万字',
            '基础模型调用',
            '世界设定、角色管理',
            '基础大纲生成',
            '社区支持',
        ],
    },
    'basic': {
        'name': '基础版',
        'daily_limit': 30,
        'monthly_word_limit': 100000,
        'project_limit': 999999,
        'price_monthly': 29,
        'price_yearly': 299,
        'features': [
            '无限项目数',
            '每月AI生成字数：10万字',
            '全部基础模型',
            '全部功能模块',
            '导出TXT/Word',
            '邮件支持',
            '无广告',
        ],
    },
    'pro': {
        'name': '专业版',
        'daily_limit': 999999,
        'monthly_word_limit': 500000,
        'project_limit': 999999,
        'price_monthly': 59,
        'price_yearly': 599,
        'recommended': True,
        'features': [
            '无限项目数',
            '每月AI生成字数：50万字',
            '全部高级模型（GPT-4o、Claude 3.5、Gemini 2.0）',
            '全部功能模块',
            '批量生成章节',
            '角色关系图谱',
            '剧情分析',
            '优先客服支持',
            '导出TXT/Word/PDF',
            '自定义提示词模板',
        ],
    },
    'enterprise': {
        'name': '企业版',
        'daily_limit': 999999,
        'monthly_word_limit': 999999999,
        'project_limit': 999999,
        'price_monthly': 199,
        'price_yearly': 1999,
        'features': [
            '5个团队席位',
            '无限AI生成字数',
            '全部高级模型',
            '团队协作功能',
            '权限管理',
            '专属客服',
            'API接口',
            '数据导出',
            '定制化功能',
        ],
    },
}


async def _get_session(user_id: str) -> tuple:
    engine = await get_engine(user_id)
    factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    session = factory()
    return session, engine


async def get_user_subscription(user_id: str) -> dict:
    """获取用户订阅信息"""
    session = None
    try:
        session, _ = await _get_session(user_id)
        result = await session.execute(
            select(User).where(User.user_id == user_id)
        )
        user = result.scalar_one_or_none()

        if not user:
            return None

        today = date.today()
        if user.last_generation_reset_date != today:
            await session.execute(
                update(User)
                .where(User.user_id == user_id)
                .values(daily_generation_used=0, last_generation_reset_date=today)
            )
            await session.commit()
            user.daily_generation_used = 0
            user.last_generation_reset_date = today

        if user.subscription_expire_at:
            expire_at = user.subscription_expire_at
            if expire_at.tzinfo is not None:
                now = datetime.now(timezone.utc)
            else:
                now = datetime.now()
            if expire_at < now:
                await session.execute(
                    update(User)
                    .where(User.user_id == user_id)
                    .values(
                        subscription_level='free',
                        daily_generation_limit=SUBSCRIPTION_TIERS['free']['daily_limit']
                    )
                )
                await session.commit()
                user.subscription_level = 'free'
                user.daily_generation_limit = SUBSCRIPTION_TIERS['free']['daily_limit']

        tier_info = SUBSCRIPTION_TIERS.get(user.subscription_level, SUBSCRIPTION_TIERS['free'])

        return {
            'subscription_level': user.subscription_level,
            'subscription_name': tier_info['name'],
            'subscription_expire_at': user.subscription_expire_at.isoformat() if user.subscription_expire_at else None,
            'daily_generation_used': user.daily_generation_used,
            'daily_generation_limit': user.daily_generation_limit,
            'daily_generation_remaining': max(0, user.daily_generation_limit - user.daily_generation_used),
            'monthly_word_limit': tier_info.get('monthly_word_limit', 0),
            'project_limit': tier_info.get('project_limit', 2),
            'price_monthly': tier_info.get('price_monthly', 0),
            'price_yearly': tier_info.get('price_yearly', 0),
            'features': tier_info.get('features', []),
        }
    finally:
        if session:
            await session.close()


async def check_and_increment_usage(user_id: str) -> dict:
    """检查并增加使用次数，返回是否允许生成"""
    session = None
    try:
        session, _ = await _get_session(user_id)
        result = await session.execute(
            select(User).where(User.user_id == user_id)
        )
        user = result.scalar_one_or_none()

        if not user:
            return {'allowed': False, 'reason': '用户不存在'}

        today = date.today()
        if user.last_generation_reset_date != today:
            await session.execute(
                update(User)
                .where(User.user_id == user_id)
                .values(daily_generation_used=0, last_generation_reset_date=today)
            )
            await session.commit()
            user.daily_generation_used = 0
            user.last_generation_reset_date = today

        if user.daily_generation_used >= user.daily_generation_limit:
            tier_info = SUBSCRIPTION_TIERS.get(user.subscription_level, SUBSCRIPTION_TIERS['free'])
            next_level = 'basic' if user.subscription_level == 'free' else 'pro'
            next_tier = SUBSCRIPTION_TIERS[next_level]
            return {
                'allowed': False,
                'reason': '今日生成次数已用完',
                'subscription_level': user.subscription_level,
                'daily_generation_used': user.daily_generation_used,
                'daily_generation_limit': user.daily_generation_limit,
                'upgrade_hint': f'升级到{next_tier["name"]}可获得每日{next_tier["daily_limit"]}次生成机会'
            }

        await session.execute(
            update(User)
            .where(User.user_id == user_id)
            .values(daily_generation_used=user.daily_generation_used + 1)
        )
        await session.commit()

        return {
            'allowed': True,
            'daily_generation_used': user.daily_generation_used + 1,
            'daily_generation_limit': user.daily_generation_limit,
            'daily_generation_remaining': max(0, user.daily_generation_limit - user.daily_generation_used - 1),
        }
    finally:
        if session:
            await session.close()


async def update_subscription(user_id: str, level: str, expire_at: datetime = None) -> bool:
    """更新用户订阅级别"""
    if level not in SUBSCRIPTION_TIERS:
        return False

    tier_info = SUBSCRIPTION_TIERS[level]
    session = None
    try:
        session, _ = await _get_session(user_id)
        await session.execute(
            update(User)
            .where(User.user_id == user_id)
            .values(
                subscription_level=level,
                subscription_expire_at=expire_at,
                daily_generation_limit=tier_info['daily_limit']
            )
        )
        await session.commit()
        return True
    finally:
        if session:
            await session.close()
