# dczhang.me

基于 Astro 与 Markdown 的个人博客。

## 本地运行

```bash
npm install
npm run dev
```

新文章放在 `src/content/posts/`，文件头部的字段示例：

```md
---
title: 文章标题
description: 一句话摘要
publishedAt: 2026-08-14
tags: [随笔]
---

正文写在这里。
```

## 修改联系方式

右上角“联系”菜单的数据在 `src/config/site.ts` 中维护。每项填写展示名称、说明和链接；站外链接请设置 `external: true`。

## 部署到 Cloudflare Pages

1. 将此目录初始化为 Git 仓库并推送至 GitHub。
2. Cloudflare Dashboard → Workers & Pages → Create application → Pages → Connect to Git。
3. 构建设置填写：
   - Framework preset: `Astro`
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Node.js version: `20.15.0` 或更高
4. 首次部署成功后，在 Pages 项目的 **Custom domains** 中添加 `dczhang.me` 和 `www.dczhang.me`，按 Cloudflare 提示配置域名 DNS。
5. 建议将 `www.dczhang.me` 重定向到 `dczhang.me`，把根域名作为唯一公开地址。

## 部署到 Vercel（备选）

导入 GitHub 仓库，Vercel 会自动识别 Astro。然后在 Project Settings → Domains 添加 `dczhang.me` 和 `www.dczhang.me`，根据它给出的 DNS 记录完成配置。

### dczhang.me 的平滑切换

目前 `dczhang.me` 已经在 Vercel 上运行一个 NotionNext 网站，并从根域名跳转到 `www.dczhang.me`。不要在新站部署前修改 DNS。

1. 先把本项目作为一个**新 Vercel Project**部署，使用 Vercel 生成的 `*.vercel.app` 地址验收页面。
2. 确认无误后，在旧 Project 的 Domains 页面移除 `dczhang.me` 与 `www.dczhang.me`，立即添加到新 Project。
3. 在新 Project 中将 `www.dczhang.me` 配置为跳转至 `dczhang.me`。若 DNS 仍指向 Vercel，通常无需改动 DNS 记录；若 Vercel 有提示，以它给出的记录为准。

> 部署前，请将 `src/pages/about.astro` 中的联系邮箱换成你实际使用的地址。
