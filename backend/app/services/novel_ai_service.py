"""网文专属AI功能服务 - 敏感词检测、钩子评分、标题/简介生成、对话润色"""
import re
from typing import Optional


# 网文敏感词库（常见被屏蔽词汇）
SENSITIVE_WORDS = [
    # 政治敏感
    '国家领导人', '政治敏感', '反动', '颠覆政权',
    # 色情低俗
    '做爱', '性交', '裸体', '性爱', '嫖娼', '卖淫',
    # 暴力血腥
    '屠杀', '血腥', '残忍杀害', '分尸',
    # 毒品相关
    '吸毒', '贩毒', '制毒', '冰毒', '海洛因',
    # 赌博相关
    '赌博', '赌场', '赌球',
    # 宗教敏感
    '邪教', '法轮',
    # 其他
    '自杀方法', '炸弹制作',
]

# 替代建议映射
WORD_SUGGESTIONS = {
    '做爱': '亲热/温存',
    '性交': '亲密接触',
    '裸体': '赤身/不着寸缕',
    '性爱': '鱼水之欢',
    '屠杀': '杀戮/大战',
    '血腥': '惨烈',
    '吸毒': '吸食禁药',
    '赌博': '博弈',
}


def detect_sensitive_words(text: str) -> dict:
    """检测文本中的敏感词"""
    found_words = []
    
    for word in SENSITIVE_WORDS:
        if word in text:
            positions = []
            start = 0
            while True:
                pos = text.find(word, start)
                if pos == -1:
                    break
                positions.append(pos)
                start = pos + 1
            
            found_words.append({
                'word': word,
                'count': len(positions),
                'positions': positions[:10],
                'suggestion': WORD_SUGGESTIONS.get(word, '建议修改为更委婉的表达'),
            })
    
    return {
        'has_sensitive': len(found_words) > 0,
        'total_count': sum(w['count'] for w in found_words),
        'words': found_words,
    }


def calculate_hook_score(text: str) -> dict:
    """计算章节开头的钩子/吸引力评分"""
    if not text or len(text.strip()) < 50:
        return {'score': 0, 'level': '无内容', 'suggestions': ['请添加更多内容']}
    
    first_500 = text[:500]
    score = 0
    suggestions = []
    
    # 1. 开头是否有悬念/冲突（+20分）
    suspense_patterns = [
        r'突然', r'忽然', r'没想到', r'竟然', r'居然',
        r'！', r'？', r'\.\.\.', r'……',
        r'危险', r'紧急', r'糟糕', r'不好',
    ]
    if any(re.search(p, first_500[:100]) for p in suspense_patterns):
        score += 20
    else:
        suggestions.append('开头可以加入更多悬念或冲突元素')
    
    # 2. 是否有对话（+15分）
    dialogue_pattern = r'[""「」『』].+?[""「」『』]'
    dialogue_matches = re.findall(dialogue_pattern, first_500)
    if len(dialogue_matches) >= 2:
        score += 15
    elif len(dialogue_matches) == 1:
        score += 8
    else:
        suggestions.append('适当加入对话可以增加代入感')
    
    # 3. 是否有感官描写（+15分）
    sensory_patterns = [
        r'看到', r'听到', r'闻到', r'感觉到', r'触摸',
        r'光芒', r'声音', r'气味', r'温度',
    ]
    if any(re.search(p, first_500) for p in sensory_patterns):
        score += 15
    else:
        suggestions.append('加入感官描写让场景更生动')
    
    # 4. 是否有情绪表达（+15分）
    emotion_patterns = [
        r'心中', r'内心', r'情绪', r'感到',
        r'愤怒', r'喜悦', r'悲伤', r'恐惧', r'惊讶',
        r'紧张', r'兴奋', r'失落',
    ]
    if any(re.search(p, first_500) for p in emotion_patterns):
        score += 15
    else:
        suggestions.append('描写角色情绪可以增强共鸣')
    
    # 5. 节奏感 - 句子长度变化（+15分）
    sentences = re.split(r'[。！？…]', first_500)
    sentences = [s.strip() for s in sentences if s.strip()]
    if len(sentences) >= 3:
        lengths = [len(s) for s in sentences[:10]]
        avg_len = sum(lengths) / len(lengths)
        variance = sum((l - avg_len) ** 2 for l in lengths) / len(lengths)
        if variance > 20:
            score += 15
        elif variance > 10:
            score += 8
        else:
            suggestions.append('句子长度可以更富有变化，增强节奏感')
    else:
        suggestions.append('内容较少，建议丰富开头部分')
    
    # 6. 是否设置了疑问/未解之谜（+20分）
    mystery_patterns = [
        r'为什么', r'怎么回事', r'发生了什么', r'难道',
        r'秘密', r'真相', r'谜', r'未知',
    ]
    if any(re.search(p, first_500) for p in mystery_patterns):
        score += 20
    else:
        suggestions.append('设置一些悬念或疑问可以吸引读者继续阅读')
    
    # 确定等级
    if score >= 80:
        level = '优秀'
    elif score >= 60:
        level = '良好'
    elif score >= 40:
        level = '一般'
    else:
        level = '待改进'
    
    return {
        'score': min(100, score),
        'level': level,
        'suggestions': suggestions[:5],
    }


def generate_title_suggestions(genre: str = '', theme: str = '', keywords: str = '') -> list:
    """生成小说标题建议（基于模板）"""
    suggestions = []
    
    # 玄幻/仙侠类模板
    xuanhuan_templates = [
        '《{keyword}之巅》',
        '《{keyword}神帝》',
        '《{keyword}传说》',
        '《{keyword}录》',
        '《绝世{keyword}》',
        '《{keyword}至尊》',
        '《{keyword}仙途》',
        '《{keyword}大陆》',
    ]
    
    # 都市类模板
    dushi_templates = [
        '《{keyword}风云》',
        '《{keyword}人生》',
        '《{keyword}传奇》',
        '《{keyword}时代》',
        '《{keyword}逆袭》',
        '《{keyword}之路》',
    ]
    
    # 言情类模板
    yanqing_templates = [
        '《{keyword}情深》',
        '《{keyword}缘》',
        '《{keyword}恋歌》',
        '《{keyword}心事》',
        '《{keyword}如故》',
        '《{keyword}时光》',
    ]
    
    keyword = keywords.split(',')[0].strip() if keywords else '龙'
    
    if '玄幻' in genre or '仙侠' in genre or genre == '':
        templates = xuanhuan_templates
    elif '都市' in genre:
        templates = dushi_templates
    elif '言情' in genre or '现言' in genre:
        templates = yanqing_templates
    else:
        templates = xuanhuan_templates + dushi_templates
    
    for template in templates[:6]:
        title = template.replace('{keyword}', keyword)
        suggestions.append(title)
    
    return suggestions


def generate_intro_suggestion(title: str, genre: str = '', summary: str = '') -> str:
    """生成小说简介建议"""
    if summary:
        return f"""【简介】
{summary}

---
提示：好的简介应该包含：
1. 主角的身份和处境
2. 核心冲突或目标
3. 一个吸引读者的悬念
"""
    
    templates = [
        f"""{title}

天地不仁，以万物为刍狗。
当一个少年从微末中崛起，他将如何搅动这风云变幻的天下？
且看他一步步踏上巅峰，书写属于自己的传奇！""",
        
        f"""{title}

这是一个关于成长与冒险的故事。
主角从一个平凡的身份起步，经历了无数磨难与挑战，
最终揭开了隐藏在黑暗中的真相……
一切，从这里开始。""",
    ]
    
    return templates[0]


def polish_dialogue(text: str, style: str = 'natural') -> dict:
    """润色对话内容"""
    # 提取对话
    dialogue_pattern = r'([""「」『』])(.+?)([""「」『』])'
    dialogues = re.findall(dialogue_pattern, text)
    
    if not dialogues:
        return {
            'polished': text,
            'changes': [],
            'suggestions': ['未检测到对话内容'],
        }
    
    changes = []
    polished_text = text
    suggestions = []
    
    # 检查常见问题
    # 1. 对话标签单一（总是"说"）
    say_count = text.count('说道') + text.count('说：') + text.count('说，')
    if say_count > 3:
        suggestions.append(f'对话标签"说"出现{say_count}次，建议替换为更多样的表达，如：问道、答道、冷声道、笑道、叹息道等')
    
    # 2. 缺少动作/表情描写
    dialogue_segments = re.split(dialogue_pattern, text)
    for i, seg in enumerate(dialogue_segments):
        if seg and seg[0] in '""「」『』' and i > 0:
            prev = dialogue_segments[i-1] if i > 0 else ''
            if prev and len(prev.strip()) < 5 and not re.search(r'[\u4e00-\u9fff]', prev[-5:]):
                suggestions.append('部分对话缺少动作或表情描写，可以适当添加')
                break
    
    # 3. 对话过长
    for _, content, _ in dialogues:
        if len(content) > 100:
            suggestions.append('部分对话过长，建议拆分为多段，增加节奏感')
            break
    
    return {
        'polished': polished_text,
        'changes': changes,
        'suggestions': suggestions[:5] if suggestions else ['对话整体质量不错，继续保持！'],
        'dialogue_count': len(dialogues),
    }
