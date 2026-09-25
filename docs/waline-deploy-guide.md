# Waline 讨论区部署指南（站长专用）

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
SECURE_DOMAINS = "wwwcjj.github.io"
```

改完必须重新部署才生效：

```bash
npx wrangler deploy
```

### 5. 部署

```bash
npx wrangler deploy
```

输出中的 `https://waline-on-worker.<子域>.workers.dev` 就是后端地址。

---

## 三、前端接入

- **全站讨论页** `discussion.html`：

  ```js
  const serverURL = 'https://waline-on-worker.can4gaa1zeon3wwwcjj.workers.dev';
  ```

  未填写时页面显示「讨论区即将开放」占位提示。

- **分作品讨论** `works/index.html` + `js/comments.js`：

  ```js
  const SERVER_URL = 'https://waline-on-worker.can4gaa1zeon3wwwcjj.workers.dev';
  ```

  点作品卡片下的「来聊聊这篇 →」会切换到该作品独立的话题路径
  （`works/index.html#作品名`）。

---

## 四、注册管理员（重要）

1. 打开**已部署到 GitHub Pages 的**讨论页：
   `https://wwwcjj.github.io/yinming-literature-club/discussion.html`
2. 点评论框的「登录」→ 切到「注册」，用你的邮箱注册。
3. **第一个注册的用户会自动成为管理员**，所以务必抢在他人之前注册。
4. 管理面板：`https://waline-on-worker.can4gaa1zeon3wwwcjj.workers.dev/ui`
   可审核、置顶、删除评论，管理用户。

> 注意：管理员注册应在**公网页面**上完成，不要只在 `127.0.0.1` 本地预览里注册，
> 否则绑定的域名/来源可能不符。

---

## 五、常见问题

- **评论发不出去？** 检查 `SECURE_DOMAINS` 是否包含网站的准确域名
  （当前 `wwwcjj.github.io`），改完要 `npx wrangler deploy` 重新部署。
- **页面显示「尚未连接/即将开放」？** 说明 `serverURL` 还是占位符，或 Worker 地址写错。
- **`.workers.dev` 打不开？** 本地 DNS 污染所致，开代理/梯子即可；
  也可用 SSH over 443 推送代码（`ssh.github.com:443`）。
- **想换数据库？** 本方案用 Cloudflare D1，不是 LeanCloud；如需迁移可导出评论后重灌。
- **国内访问慢？** Cloudflare 香港节点一般可接受；必要时绑定自定义域名。

---

## 六、日常维护

| 操作 | 命令 |
| --- | --- |
| 重新部署后端 | `npx wrangler deploy` |
| 查看线上日志 | `npx wrangler tail` |
| 备份评论数据 | 管理面板导出，或 `npx wrangler d1 export waline-db --remote --output bak.sql` |
| 修改数据库结构 | 改 `schema.sql` 后重新 `d1 execute` |
