# 墨小语 📚✨

<div align="center">

![Version](https://img.shields.io/badge/version-1.5.6-blue.svg)
![Python](https://img.shields.io/badge/python-3.12-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109.0-green.svg)
![React](https://img.shields.io/badge/react-18.3.1-blue.svg)
![License](https://img.shields.io/badge/license-GPL%20v3-blue.svg)

**基于 AI 的智能小说创作助手**

[在线体验](https://www.moxiaoyu.pro) • [特性](#-特性) • [快速开始](#-快速开始) • [配置说明](#-配置说明)

</div>

---

## ✨ 特性

- 🤖 **多 AI 模型** - 支持 OpenAI、Gemini、Claude 等主流模型
- 📝 **智能向导** - AI 自动生成大纲、角色和世界观
- 👥 **角色管理** - 人物关系、组织架构可视化管理
- 📖 **章节编辑** - 支持创建、编辑、重新生成和润色
- 🌐 **世界观设定** - 构建完整的故事背景
- 🔗 **思维链与章节关系图谱** - 可视化章节逻辑关系
- 📋 **伏笔管理** - 智能追踪剧情伏笔，可视化伏笔时间线
- 🎭 **职业等级体系** - 支持修仙境界、魔法等级等多种自定义体系
- 💅 **自定义写作风格** - 支持自定义 AI 写作风格
- 📚 **拆书功能** - 一键拆书，提取书籍结构与内容
- 🔧 **Prompt 模板** - 可视化编辑 Prompt 模板，提示词工坊社区分享
- 💰 **订阅付费系统** - 4 级订阅（免费/基础/专业/企业），支持支付宝/微信支付
- 🔐 **多种登录** - LinuxDO OAuth 或本地账户登录
- 💾 **PostgreSQL** - 生产级数据库，多用户数据隔离
- 🐳 **Docker 部署** - 一键启动，开箱即用

## 🚀 快速开始

### 前置要求

- Docker 和 Docker Compose
- 至少一个 AI 服务的 API Key（OpenAI/Gemini/Claude）

### 方式一：Docker Compose 从源码部署

```bash
# 1. 克隆项目
git clone https://github.com/sangforwahaha-star/moxiaoyu.git
cd moxiaoyu

# 2. 配置环境变量
cp backend/.env.example .env
# 编辑 .env 文件，填入 API Key、数据库密码等配置

# 3. 启动服务
docker-compose up -d

# 4. 访问应用
# 浏览器打开 http://localhost:8000
```

### 方式二：Docker Hub 镜像部署（推荐新手）

```bash
# 1. 拉取最新镜像
docker pull moxiaoyu/moxiaoyu:latest

# 2. 创建 .env 配置文件
# 参考下方配置说明

# 3. 使用 docker-compose 启动
docker-compose up -d
```

镜像已包含所有依赖和模型文件，无需额外下载。

## ⚙️ 配置说明

创建 `.env` 文件，配置以下参数：

### 必需配置

```bash
# 数据库
POSTGRES_PASSWORD=your_secure_password

# AI 服务（至少配置一个）
OPENAI_API_KEY=your_openai_key
OPENAI_BASE_URL=https://api.openai.com/v1
DEFAULT_AI_PROVIDER=openai
DEFAULT_MODEL=gpt-4o-mini

# 本地账户登录
LOCAL_AUTH_ENABLED=true
LOCAL_AUTH_USERNAME=admin
LOCAL_AUTH_PASSWORD=your_password
```

### 可选配置

```bash
# LinuxDO OAuth
LINUXDO_CLIENT_ID=your_client_id
LINUXDO_CLIENT_SECRET=your_client_secret

# 中转 API（支持所有 OpenAI 兼容格式）
OPENAI_BASE_URL=https://your-proxy-service.com/v1

# LinuxDO 专用代理
LINUXDO_PROXY_URL=http://127.0.0.1:7890

# 本地/内网 LLM（默认关闭）
ALLOW_PRIVATE_AI_ENDPOINTS=true
ALLOWED_AI_HOSTS=host.docker.internal,127.0.0.1

# Cookie Secure（HTTP 部署设为 false）
SESSION_COOKIE_SECURE=true
```

## 💻 硬件要求

| 场景 | CPU | 内存 | 存储 |
|------|-----|------|------|
| 个人/开发 | 2 核 | 2 GB | 10 GB |
| 小型团队 | 4 核 | 8 GB | 20 GB SSD |
| 高并发(80-150用户) | 8 核 | 16 GB | 50 GB+ SSD |

> 本项目依赖外部 AI API，不需要本地 GPU。

## 🛠️ 技术栈

**后端**: FastAPI · PostgreSQL · SQLAlchemy · OpenAI/Claude/Gemini SDK

**前端**: React 18 · TypeScript · Ant Design · Zustand · Vite

## 📖 使用指南

1. **登录系统** - 使用本地账户或 LinuxDO 账户
2. **创建项目** - 选择"使用向导创建"
3. **AI 生成** - 输入基本信息，AI 自动生成大纲和角色
4. **编辑完善** - 管理角色关系，生成和编辑章节

API 文档：`http://localhost:8000/docs`

---

<div align="center">

**如果这个项目对你有帮助，请给个 ⭐️ Star！**

</div>
