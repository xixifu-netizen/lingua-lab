# Lingua Lab — AI 英语学习网站

一个 AI 驱动的英语听说训练网站：真实视频跟读复述（Session A）+ 话题讨论（Session B），集成了 DeepSeek AI 评测、词汇收藏、艾宾浩斯记忆曲线复习，以及基于 Supabase 的真实账号与云端数据。

## 技术栈

- **前端/框架**：Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS v4
- **AI**：DeepSeek（OpenAI 兼容接口），服务端代理 `/api/ai`
- **语音**：Web Speech API（浏览器免费语音识别 + 语音合成）
- **后端/数据**：Supabase（Postgres 数据库 + Auth 登录 + Storage 录音桶）
- **部署**：Vercel

## 环境变量

复制 `.env.example` 为 `.env.local`，填入真实值：

| 变量 | 说明 |
|---|---|
| `DEEPSEEK_API_KEY` | DeepSeek API Key（仅服务端） |
| `DEEPSEEK_BASE_URL` | 默认 `https://api.deepseek.com` |
| `DEEPSEEK_MODEL` | 默认 `deepseek-chat` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL（公开） |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase publishable/anon key（公开） |

## 数据库初始化

在 Supabase 后台 **SQL Editor** 运行 `supabase/schema.sql`，会创建 10 张表 + RLS 行级安全策略 + 触发器 + 录音存储桶。

## 本地开发

```bash
npm install
npm run dev
```

打开 http://localhost:3000

## 部署到 Vercel

1. 将本项目推送到一个 GitHub 仓库（`main` 分支）。
2. 打开 [Vercel](https://vercel.com) → **Add New → Project** → 导入该 GitHub 仓库。
3. 在 **Environment Variables** 里添加上面的 5 个环境变量（`.env.local` 的值）。
4. 点击 **Deploy**。

部署完成后即可通过 Vercel 分配的网址访问。
