"""订阅管理API"""
from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime, timedelta, timezone
from typing import Optional
from pydantic import BaseModel

from app.models.user import User
from app.services.subscription_service import (
    get_user_subscription,
    check_and_increment_usage,
    update_subscription,
    SUBSCRIPTION_TIERS,
)
from app.api.auth import get_current_user

router = APIRouter(prefix="/subscription", tags=["订阅管理"])


class SubscriptionInfoResponse(BaseModel):
    subscription_level: str
    subscription_name: str
    subscription_expire_at: Optional[str]
    daily_generation_used: int
    daily_generation_limit: int
    daily_generation_remaining: int
    monthly_word_limit: int = 0
    project_limit: int = 2
    price_monthly: int = 0
    price_yearly: int = 0
    features: list[str] = []


class UsageCheckResponse(BaseModel):
    allowed: bool
    reason: Optional[str] = None
    daily_generation_used: Optional[int] = None
    daily_generation_limit: Optional[int] = None
    daily_generation_remaining: Optional[int] = None
    upgrade_hint: Optional[str] = None


class SubscriptionTierInfo(BaseModel):
    level: str
    name: str
    daily_limit: int
    monthly_word_limit: int = 0
    project_limit: int = 2
    price_monthly: int = 0
    price_yearly: int = 0
    recommended: bool = False
    features: list[str] = []


@router.get("/info", response_model=SubscriptionInfoResponse)
async def get_subscription_info(current_user: User = Depends(get_current_user)):
    """获取当前用户的订阅信息"""
    sub_info = await get_user_subscription(current_user['user_id'])
    if not sub_info:
        raise HTTPException(status_code=404, detail="用户不存在")
    return sub_info


@router.get("/tiers", response_model=list[SubscriptionTierInfo])
async def get_subscription_tiers():
    """获取所有订阅级别信息"""
    tiers = []
    for level, info in SUBSCRIPTION_TIERS.items():
        tiers.append(SubscriptionTierInfo(
            level=level,
            name=info['name'],
            daily_limit=info['daily_limit'],
            monthly_word_limit=info.get('monthly_word_limit', 0),
            project_limit=info.get('project_limit', 2),
            price_monthly=info.get('price_monthly', 0),
            price_yearly=info.get('price_yearly', 0),
            recommended=info.get('recommended', False),
            features=info.get('features', []),
        ))
    return tiers


@router.post("/check-usage", response_model=UsageCheckResponse)
async def check_usage(current_user: User = Depends(get_current_user)):
    """检查是否可以使用生成次数（不实际扣减）"""
    sub_info = await get_user_subscription(current_user['user_id'])
    if not sub_info:
        raise HTTPException(status_code=404, detail="用户不存在")
    
    allowed = sub_info['daily_generation_remaining'] > 0
    return UsageCheckResponse(
        allowed=allowed,
        reason=None if allowed else "今日生成次数已用完",
        daily_generation_used=sub_info['daily_generation_used'],
        daily_generation_limit=sub_info['daily_generation_limit'],
        daily_generation_remaining=sub_info['daily_generation_remaining'],
        upgrade_hint=f"升级到{SUBSCRIPTION_TIERS['basic']['name']}可获得每日{SUBSCRIPTION_TIERS['basic']['daily_limit']}次生成机会" if not allowed else None,
    )


@router.post("/increment-usage", response_model=UsageCheckResponse)
async def increment_usage(current_user: User = Depends(get_current_user)):
    """增加使用次数并返回是否允许"""
    result = await check_and_increment_usage(current_user['user_id'])
    return result


@router.post("/upgrade")
async def upgrade_subscription(
    level: str,
    months: int = 1,
    current_user: User = Depends(get_current_user),
):
    """升级订阅（模拟支付，实际生产环境需要集成支付网关）"""
    if level not in SUBSCRIPTION_TIERS:
        raise HTTPException(status_code=400, detail="无效的订阅级别")
    
    if level == 'free':
        raise HTTPException(status_code=400, detail="不能降级到免费版，请联系客服")
    
    expire_at = datetime.now(timezone.utc) + timedelta(days=30 * months)
    success = await update_subscription(current_user['user_id'], level, expire_at)
    
    if not success:
        raise HTTPException(status_code=500, detail="更新订阅失败")
    
    return {
        "success": True,
        "message": f"已成功升级到{SUBSCRIPTION_TIERS[level]['name']}",
        "expire_at": expire_at.isoformat(),
    }
