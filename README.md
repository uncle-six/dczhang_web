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

正式域名 `dczhang.me` / `www.dczhang.me` 的页面在首次变为可见时，自动向 `/api/visit` 发送一次空的 POST 请求。接口 `api/visit.js` 从 Vercel 提供的可信请求头获取公网 IPv4 / IPv6，将 IP 和服务器生成的 UTC 时间写入 Upstash Redis，并保留一份私有运行日志。不请求定位权限，不读取 GPS，也不保存页面路径、查询参数或浏览器提交的 IP；上报请求不携带 Cookie 或来源页面。开发环境和预览域名不自动上报。

### 连接长期存储

1. 在 **Vercel → 当前项目 → Storage / Marketplace** 中连接一个 Upstash Redis 数据库；可以复用以前题库使用的实例。按 [官方集成说明](https://upstash.com/docs/redis/howto/vercelintegration) 将数据库连接到项目的 **Production** 环境。
2. 确认 Vercel 项目中有成对的 `UPSTASH_REDIS_REST_URL` 和 `UPSTASH_REDIS_REST_TOKEN`。代码也支持旧配置 `KV_REST_API_URL` / `KV_REST_API_TOKEN`，以及 `UPSTASH_REDIS_REST_KV_REST_API_URL` / `UPSTASH_REDIS_REST_KV_REST_API_TOKEN`。如果想独立存放访客记录，可设置优先级更高的 `VISITOR_IP_REDIS_REST_URL` / `VISITOR_IP_REDIS_REST_TOKEN`。只使用完整的 URL / Token 配对，不跨前缀拼接。需要可写 Token，不能使用只读 Token。
3. 重新部署项目，让生产环境获得这些变量。密钥只配置在服务端环境变量中；不要写入前端、README 或 Git。仓库中的 `.env.example` 仅展示变量名。

数据库默认不设置记录过期时间，不按天清理、不覆盖或裁剪旧记录；每次访问以一条 JSON 追加到 Redis List `visitor:ips:v1`，最新的在前。[Upstash 提供持久化存储](https://upstash.com/docs/redis/features/durability)，数据不会随 Vercel 日志过期而消失。保留数据库的 **Eviction 关闭**（[默认如此](https://upstash.com/docs/redis/features/eviction)），避免容量不足时淘汰历史数据；长期数据仍受数据库存续、容量及套餐限制，需要自行安排备份。

### 查看与验证

打开数据库的 Data Browser / Redis Console，查看键 `visitor:ips:v1`。可运行以下只读命令；列表很大时按页查看，避免一次读取全部 IP：

```text
LLEN visitor:ips:v1
LRANGE visitor:ips:v1 0 99
LRANGE visitor:ips:v1 100 199
TTL visitor:ips:v1
```

`LLEN` 返回总记录数，`LRANGE` 返回指定范围的记录；`TTL` 应为 `-1`（无过期时间），`-2` 表示该键尚未创建。每条记录的格式如下（示例地址不代表真实访客）：

```json
{"event":"visitor-ip","at":"2026-11-03T12:00:00.000Z","ip":"203.0.113.10"}
```

线上 `/api/visit` 返回 **204** 且响应头 `x-visitor-ip-storage: redis`，才代表数据库已确认写入。未配置数据库、写入超时、凭据错误或容量用尽时，接口返回 **503** 和 `x-visitor-ip-storage: runtime-log`，并保留临时日志；不能据此声称已长期保存。数据库未连好时，原来的临时记录仍在。

临时日志查看方法：**Vercel → 当前项目 → Logs → Production**，搜索 `visitor-ip`；存储失败时还会出现 `visitor-ip-storage-unavailable`，原因可能是 `missing-config`、`invalid-config` 或 `write-failed`。错误日志不会包含数据库密钥或上游原始错误。按 [Vercel 运行日志文档](https://vercel.com/docs/logs/runtime)，Hobby 目前保留 1 小时、Pro 保留 1 天；临时日志不能替代数据库。数据库记录和临时日志都没有公开读取接口。

仅新版本部署后且数据库写入成功的访问会长期保存；旧运行日志中已过期的记录无法通过本次改动恢复。

接口只在 Vercel 运行时接受记录，拒绝跨站上报；优先读取 `x-vercel-forwarded-for`，仅在该可信地址属于 Cloudflare 官方代理网段时，使用 `CF-Connecting-IP` 恢复原始访客地址。网段来自 [IPv4 列表](https://www.cloudflare.com/ips-v4) 与 [IPv6 列表](https://www.cloudflare.com/ips-v6)，变更时需同步更新 `api/visit.js`。无法获取有效 IP 时返回 503，不写入假的地址。不要把本接口直接部署到其他平台并信任任意来访请求头。

脚本被拦截、JavaScript 被禁用、请求失败或不执行脚本的爬虫访问，可能不会留下这类记录；它不是所有 HTTP 请求的完整访问日志。IP 只代表网络出口，无法确定具体个人或街道门牌。

运行 `npm test` 检查 IP 来源验证、IPv6、跨站拒绝、数据库追加、配置兼容与写入失败等行为；测试使用模拟存储，不会请求生产数据库。`npm run build` 检查博客构建。`astro dev` / `astro preview` 只提供静态站点，不运行根目录下的 Vercel API，接口需在 Vercel 部署后验证。

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
