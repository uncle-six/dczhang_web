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

## 访客访问记录（Vercel）

正式域名 `dczhang.me` / `www.dczhang.me` 的页面在首次变为可见时，通过 `src/scripts/visit-tracker.js` 向 `/api/visit` 上报访问。接口 `api/visit.js` 从 Vercel 可信请求头获取公网 IPv4 / IPv6 和 User-Agent，清理前端提交的元数据，将记录写入现有 Upstash Redis，并保留一份私有运行日志。开发环境和预览域名不自动上报。

记录包含下列字段：

| 字段 | 含义 |
| --- | --- |
| `event` | `visitor-pageview` 为页面访问，`visitor-engagement` 为后续进度更新；旧记录仍是 `visitor-ip` |
| `at` / `ip` | 服务端生成的 UTC 时间 / 平台提供的公网 IP，不接受浏览器伪造的同名字段 |
| `visitId` | 每个页面实例随机生成的 UUID，只保存在内存中，用于关联此次访问的更新 |
| `path` | 访问页面路径，移除查询参数和锚点 |
| `referrer` | 来源网站的域名；没有来源时为 `null`，不保存来源 URL 中的路径、查询参数或锚点 |
| `browser` / `os` | 根据请求 User-Agent 推测的浏览器与系统名称，不保存完整 User-Agent；无法识别时为 `Unknown` |
| `device` | 推测的 `mobile` / `tablet` / `desktop` / `unknown`；iPad 桌面模式辅以前端平板提示 |
| `language` | 浏览器语言，如 `zh-CN`；无效或缺失时为 `null` |
| `durationSeconds` | 此页面实例累计的前台可见停留秒数，切到后台暂停计时，最多记录 86400 秒 |
| `scrollPercent` | 本次访问看到的文章正文最深位置（0–100）；非文章页面为 `null`，并不代表实际读完 |

不读取 GPS，不请求精确定位权限，不收集姓名、手机号等身份信息；不设置 Cookie、不使用 localStorage，也不把页面访问 ID 用于跨页面识别个人。上报请求通过 `fetch(..., { keepalive: true, credentials: 'omit', referrerPolicy: 'no-referrer' })` 发出。浏览器、系统、设备类型、语言和滚动进度可能受伪造、浏览器设置或环境影响，均作参考。

页面访问先立即记一条 `visitor-pageview`；前台停留期间每 30 秒，以及切到后台或离开页面时，追加一条有变化的 `visitor-engagement`。更新中的停留时间与进度均为累计值：**按 `visitId` 查看最大累计值，不要把各条更新的秒数相加，也不要将更新条数算作访问人数。**浏览器强制退出、断网等情况可能丢失最后的更新；前台可见时间也不等于真实阅读时间。页面从前进后退缓存恢复后继续使用原来的访问 ID，避免重复记一次页面访问。

### 连接长期存储

1. 在 **Vercel → 当前项目 → Storage / Marketplace** 中连接一个 Upstash Redis 数据库；可以复用以前题库使用的实例。按 [官方集成说明](https://upstash.com/docs/redis/howto/vercelintegration) 将数据库连接到项目的 **Production** 环境。
2. 确认 Vercel 项目中有成对的 `UPSTASH_REDIS_REST_URL` 和 `UPSTASH_REDIS_REST_TOKEN`。代码也支持旧配置 `KV_REST_API_URL` / `KV_REST_API_TOKEN`，以及 `UPSTASH_REDIS_REST_KV_REST_API_URL` / `UPSTASH_REDIS_REST_KV_REST_API_TOKEN`。如果想独立存放访客记录，可设置优先级更高的 `VISITOR_IP_REDIS_REST_URL` / `VISITOR_IP_REDIS_REST_TOKEN`。只使用完整的 URL / Token 配对，不跨前缀拼接。需要可写 Token，不能使用只读 Token。
3. 重新部署项目，让生产环境获得这些变量。密钥只配置在服务端环境变量中；不要写入前端、README 或 Git。仓库中的 `.env.example` 仅展示变量名。

数据库默认不设置记录过期时间，不按天清理、不覆盖或裁剪旧记录；页面访问和进度更新分别以 JSON 追加到原来的 Redis List `visitor:ips:v1`，最新的在前。[Upstash 提供持久化存储](https://upstash.com/docs/redis/features/durability)，数据不会随 Vercel 日志过期而消失。保留数据库的 **Eviction 关闭**（[默认如此](https://upstash.com/docs/redis/features/eviction)），避免容量不足时淘汰历史数据；长期数据仍受数据库存续、容量及套餐限制，需要自行安排备份。

### 查看与验证

打开数据库的 Data Browser / Redis Console，查看键 `visitor:ips:v1`。可运行以下只读命令；列表很大时按页查看，避免一次读取全部 IP：

```text
LLEN visitor:ips:v1
LRANGE visitor:ips:v1 0 99
LRANGE visitor:ips:v1 100 199
TTL visitor:ips:v1
```

`LLEN` 返回总记录数（包含进度更新），`LRANGE` 返回指定范围的记录；`TTL` 应为 `-1`（无过期时间），`-2` 表示该键尚未创建。新记录的格式如下（示例地址不代表真实访客）：

```json
{"event":"visitor-engagement","at":"2026-11-03T12:00:30.000Z","ip":"203.0.113.10","visitId":"a3669714-221b-453c-9688-4ab17d2233c7","path":"/posts/知与行之间/","referrer":null,"browser":"Safari","os":"iOS","device":"mobile","language":"zh-CN","durationSeconds":30,"scrollPercent":45}
```

线上 `/api/visit` 返回 **204** 且响应头 `x-visitor-ip-storage: redis`，才代表数据库已确认写入。未配置数据库、写入超时、凭据错误或容量用尽时，接口返回 **503** 和 `x-visitor-ip-storage: runtime-log`，并保留临时日志；不能据此声称已长期保存。数据库未连好时，原来的临时记录仍在。

临时日志查看方法：**Vercel → 当前项目 → Logs → Production**，搜索 `visitor-pageview` 或 `visitor-engagement`；旧客户端的记录可搜索 `visitor-ip`。存储失败时还会出现 `visitor-ip-storage-unavailable`，原因可能是 `missing-config`、`invalid-config` 或 `write-failed`。错误日志不会包含数据库密钥或上游原始错误。按 [Vercel 运行日志文档](https://vercel.com/docs/logs/runtime)，Hobby 目前保留 1 小时、Pro 保留 1 天；临时日志不能替代数据库。数据库记录和临时日志都没有公开读取接口。

仅新版本部署后且数据库写入成功的访问会长期保存；旧运行日志中已过期的记录无法通过本次改动恢复。新字段只适用于更新后的浏览器页面，历史记录无法补出以前的访问页面或停留时间；接口仍兼容旧版的空 POST 请求。

接口只在 Vercel 运行时接受记录，拒绝跨站上报；优先读取 `x-vercel-forwarded-for`，仅在该可信地址属于 Cloudflare 官方代理网段时，使用 `CF-Connecting-IP` 恢复原始访客地址。网段来自 [IPv4 列表](https://www.cloudflare.com/ips-v4) 与 [IPv6 列表](https://www.cloudflare.com/ips-v6)，变更时需同步更新 `api/visit.js`。无法获取有效 IP 时返回 503，不写入假的地址。JSON 请求体最多 4096 字节，元数据不合法时返回 400，超出限制时返回 413，均不入库。不要把本接口直接部署到其他平台并信任任意来访请求头。

脚本被拦截、JavaScript 被禁用、请求失败或不执行脚本的爬虫访问，可能不会留下这类记录；它不是所有 HTTP 请求的完整访问日志。IP 只代表网络出口，无法确定具体个人或街道门牌。

运行 `npm test` 检查 IP 来源验证、IPv6、跨站拒绝、元数据清理、数据库追加、前后台计时、累计阅读进度、页面缓存恢复、配置兼容与写入失败等行为；测试使用模拟存储与页面事件，不会请求生产数据库。`npm run build` 检查博客构建。`astro dev` / `astro preview` 只提供静态站点，不运行根目录下的 Vercel API，接口需在 Vercel 部署后验证。

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
