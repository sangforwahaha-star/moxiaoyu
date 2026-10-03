"""网文专属AI功能API"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from app.models.user import User
from app.api.auth import get_current_user
from app.services.novel_ai_service import (
    detect_sensitive_words,
    calculate_hook_score,
    generate_title_suggestions,
    generate_intro_suggestion,
    polish_dialogue,
)
from fastapi import Depends

router = APIRouter(prefix="/novel-ai", tags=["网文AI功能"])


class SensitiveWordRequest(BaseModel):
    text: str


class HookScoreRequest(BaseModel):
    text: str


class TitleGenerateRequest(BaseModel):
    genre: str = ''
    theme: str = ''
    keywords: str = ''


class IntroGenerateRequest(BaseModel):
    title: str
    genre: str = ''
    summary: str = ''


class DialoguePolishRequest(BaseModel):
    text: str
    style: str = 'natural'


@router.post("/sensitive-words")
async def check_sensitive_words(
    request: SensitiveWordRequest,
    current_user: User = Depends(get_current_user),
):
    """检测文本中的敏感词"""
    if not request.text or len(request.text.strip()) < 2:
        raise HTTPException(status_code=400, detail="文本内容太短")
    
    result = detect_sensitive_words(request.text)
    return result


@router.post("/hook-score")
async def get_hook_score(
    request: HookScoreRequest,
    current_user: User = Depends(get_current_user),
):
    """计算章节开头的钩子/吸引力评分"""
    if not request.text:
        raise HTTPException(status_code=400, detail="请提供文本内容")
    
    result = calculate_hook_score(request.text)
    return result


@router.post("/generate-titles")
async def get_title_suggestions(
    request: TitleGenerateRequest,
    current_user: User = Depends(get_current_user),
):
    """生成小说标题建议"""
    suggestions = generate_title_suggestions(
        genre=request.genre,
        theme=request.theme,
        keywords=request.keywords,
    )
    return {'suggestions': suggestions}


@router.post("/generate-intro")
async def get_intro_suggestion(
    request: IntroGenerateRequest,
    current_user: User = Depends(get_current_user),
):
    """生成小说简介建议"""
    if not request.title:
        raise HTTPException(status_code=400, detail="请提供小说标题")
    
    intro = generate_intro_suggestion(
        title=request.title,
        genre=request.genre,
        summary=request.summary,
    )
    return {'intro': intro}


@router.post("/polish-dialogue")
async def polish_dialogue_text(
    request: DialoguePolishRequest,
    current_user: User = Depends(get_current_user),
):
    """润色对话内容"""
    if not request.text or len(request.text.strip()) < 10:
        raise HTTPException(status_code=400, detail="文本内容太短")
    
    result = polish_dialogue(request.text, request.style)
    return result
