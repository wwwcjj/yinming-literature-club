# Waline 部署指南（Cloudflare Workers + D1）—— 历史方案存档

> ⚠️ **已弃用**。校园网无法访问 `.workers.dev`，评论区已切换到 **Twikoo + 腾讯云 EdgeOne Pages**。
> 保留本文档仅作存档与回滚参考。新方案见 `docs/twikoo-setup.md`。
>
> 回滚所需信息：Worker 地址 `https://waline-on-worker.can4gaa1zeon3wwwcjj.workers.dev`，
> 数据库备份 `docs/waline-db-backup-20260925.sql`。

---

> 目标：让网站「文学讨论」页面真正可用。
> **实际方案：Cloudflare Workers + D1**（不是 Vercel + LeanCloud）。
> 现状：**已部署完成**，本站 `discussion.html` 已接入。
> 预计耗时：首次约 20 分钟；日常维护几乎为零。

---

## 一、当前架构（已上线）

| 部分 | 内容 |
| --- | --- |
| 后端 | `Waline_On_Worker`（Cloudflare Workers + D1 SQLite） |
| 后端地址 | `https://waline-on-worker.can4gaa1zeon3wwwcjj.workers.dev` |
| 数据库 | Cloudflare D1，库名 `waline-db` |
| 前端 | `discussion.html`（全站讨论）+ `works/index.html`（分作品讨论） |
| 前端接入点 | `discussion.html` 内 `serverURL`；`js/comments.js` 内 `SERVER_URL` |
| 源码仓库 | `https://github.com/wwwcjj/yinming-literature-club` |

---

## 二、首次部署步骤（已执行，留档备查）

### 1. 准备环境

```bash
cd Waline_On_Worker
npm install            # 依赖：hono、bcryptjs；dev：wrangler、vitest
npx wrangler login     # 浏览器点 Allow 授权
npx wrangler whoami    # 确认已登录、含 workers/d1 写权限
```

### 2. 创建并初始化 D1 数据库

`wrangler.toml` 中 `[[d1_databases]]` 的 `binding` 必须保持为 `DB`：

```toml
[[d1_databases]]
binding = "DB"
database_name = "waline-db"
database_id = "f0dfe641-53fa-4ed2-b612-2554b159eef6"
```

建表（远程库）：

```bash
npx wrangler d1 execute waline-db --file=./schema.sql --remote
```

验证表已建好：

```bash
npx wrangler d1 execute waline-db --remote \
  --command "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;"
```

应看到 `wl_Comment`、`wl_Counter`、`wl_Settings`、`wl_Users`。

### 3. 设置 JWT 密钥

```bash
npx wrangler secret put JWT_SECRET
```

提示 `? Enter a secret value:` 时粘贴一串随机密钥（例如
`head -c 48 /dev/urandom | base64 | tr -d '/+=' | head -c 48` 生成），回车即可。

### 4. 限定跨域来源（防止别人白嫖你的后端）

`wrangler.toml`：

```toml
[vars]
SECURE_DOMAINS = "https://wwwcjj.github.io"
```

> ⚠️ 坑：源码用的是**完整 Origin 头**做比较（`origin === d`），所以必须**带 `https://`**。
> 只写 `wwwcjj.github.io` 会被判定为不匹配、拒绝跨域。

改完必须重新部署才生效：

```bash
npx wrangler deploy
```

### 5. 注册名额限制（内测用）

`wrangler.toml`：

```toml
[vars]
MAX_USERS = "30"
```

满额后注册接口返回 403。改动在 `src/router/user.ts` 的 `POST /api/user`。

### 6. 部署

```bash
npx wrangler deploy
```

输出中的 `https://waline-on-worker.<子域>.workers.dev` 就是后端地址。

---

## 三、前端接入（Waline 版，已弃用）

- **全站讨论页** `discussion.html`：`serverURL` 指向 Worker
- **分作品讨论** `works/index.html` + `js/comments.js`：`SERVER_URL` 指向 Worker
- 前端资源已本地化到 `vendor/waline/`（`waline.js` + `waline.css`），不依赖外部 CDN
- 深棕主题皮肤：`css/waline-theme.css`

---

## 四、注册管理员

1. 打开**已部署到 GitHub Pages 的**讨论页：
   `https://wwwcjj.github.io/yinming-literature-club/discussion.html`
2. 点评论框的「登录」→ 切到「注册」，用你的邮箱注册。
3. **第一个注册的用户会自动成为管理员**，所以务必抢在他人之前注册。
4. 管理面板：`https://waline-on-worker.can4gaa1zeon3wwwcjj.workers.dev/ui`

---

## 五、常见问题

- **评论发不出去？** 检查 `SECURE_DOMAINS` 是否包含网站的准确域名**且带 scheme**，改完要重新部署。
- **`.workers.dev` 打不开？** 本地 DNS 污染所致，开代理/梯子即可；也可用 SSH over 443 推送代码。
- **校园网访问不了？** 这是本方案被弃用的**根本原因**——`.workers.dev` 在国内 DNS 被污染，校园网完全不通。
- **想换数据库？** 本方案用 Cloudflare D1，不是 LeanCloud；如需迁移可导出评论后重灌。

---

## 六、日常维护

| 操作 | 命令 |
| --- | --- |
| 重新部署后端 | `npx wrangler deploy` |
| 查看线上日志 | `npx wrangler tail` |
| 备份评论数据 | `npx wrangler d1 export waline-db --remote --output bak.sql` |
| 查看用户数 | `npx wrangler d1 execute waline-db --remote --command "SELECT COUNT(*) FROM wl_Users;"` |
