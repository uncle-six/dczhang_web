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

## 访客 IP 记录（Vercel）

正式域名 `dczhang.me` / `www.dczhang.me` 的页面在首次变为可见时，自动向 `/api/visit` 发送一次空的 POST 请求。接口 `api/visit.js` 从 Vercel 提供的可信请求头获取公网 IPv4 / IPv6，将 IP 和服务器生成的 UTC 时间写入私有运行日志。不请求定位权限，不读取 GPS，也不保存页面路径、查询参数或浏览器提交的 IP；上报请求不携带 Cookie 或来源页面。开发环境和预览域名不自动上报。

查看方法：打开 **Vercel → 当前项目 → Logs**，选择 **Production** 环境，搜索 `visitor-ip`，展开对应的 `/api/visit` 函数日志。记录格式如下（示例地址不代表真实访客）：

```json
{"event":"visitor-ip","at":"2026-11-03T12:00:00.000Z","ip":"203.0.113.10"}
```

此版本不需要数据库或额外环境变量，但日志不是永久保存：按 [Vercel 运行日志文档](https://vercel.com/docs/logs/runtime)，Hobby 目前保留 1 小时，Pro 保留 1 天；实际以账户套餐为准。需要长期留存时应接入数据库或日志存储服务，不能把运行日志当作长期档案。日志不会提供给公开网页查询。

接口只在 Vercel 运行时接受记录，拒绝跨站上报；优先读取 `x-vercel-forwarded-for`，仅在该可信地址属于 Cloudflare 官方代理网段时，使用 `CF-Connecting-IP` 恢复原始访客地址。网段来自 [IPv4 列表](https://www.cloudflare.com/ips-v4) 与 [IPv6 列表](https://www.cloudflare.com/ips-v6)，变更时需同步更新 `api/visit.js`。无法获取有效 IP 时返回 503，不写入假的地址。不要把本接口直接部署到其他平台并信任任意来访请求头。

脚本被拦截、JavaScript 被禁用、请求失败或不执行脚本的爬虫访问，可能不会留下这类记录；它不是所有 HTTP 请求的完整访问日志。IP 只代表网络出口，无法确定具体个人或街道门牌。页脚已注明记录用途。

运行 `npm test` 检查接口的 IP 来源验证、IPv6、跨站拒绝和响应不泄露记录等行为；`npm run build` 检查博客构建。`astro dev` / `astro preview` 只提供静态站点，不运行根目录下的 Vercel API，接口需在 Vercel 部署后验证。

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
