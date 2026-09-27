# Twikoo 接入配置（腾讯云 EdgeOne Pages 版）

> 用途：替换原来的 Cloudflare Worker + Waline，让校园网**不挂梯子**也能评论。
> 原理：Twikoo 后端跑在**腾讯云 EdgeOne Pages**（国内节点），前端只需要一个 `envId`。

---

## 唯一需要你改的地方

在腾讯云部署完成、拿到 EdgeOne Pages 域名后，把下面的地址填进来：

```js
window.TWIKOO_ENV_ID = '';
```

例如：

```js
window.TWIKOO_ENV_ID = 'https://twikoo-xxx.edgeone.app';
```

**没填之前**，页面会显示「讨论区即将开放」的占位提示，不会报错。

---

## 接入的页面

| 页面 | 用途 | 话题 key |
| --- | --- | --- |
| `discussion.html` | 全站文学讨论 | 固定为 `/discussion.html` |
| `works/index.html` | 分作品讨论 | `/works#作品名`（点「来聊聊这篇」切换） |

---

## 部署步骤（腾讯云侧，需你自己操作）

1. 注册腾讯云账号并完成**实名认证**
2. 领取 **EdgeOne 免费版套餐**（搜索「EdgeOne 免费版」或到活动页领取）
3. 开通 **EdgeOne Pages** 服务
4. 创建 Pages 项目 → 选「从 Git 仓库导入」→ 关联 `twikoo-eo` 仓库
   （推荐 fork 一份到你自己账号：`Mintimate/twikoo-eo`）
5. 创建 **KV 命名空间**，绑定到项目，环境变量名填 `TWIKOO_KV`
6. （可选）配置 `CORS_ALLOW_ORIGIN` = `wwwcjj.github.io`
7. 部署完成后，拿到 Pages 域名（形如 `https://xxx.edgeone.app`）
8. 把域名填入 `js/twikoo-config.js` 的 `TWIKOO_ENV_ID`

详细官方文档：https://pages.edgeone.ai/zh/document

---

## 回滚方案

原 Waline 方案未被删除，如需切回：

- Waline 配置保留在 `js/comments.js`（`SERVER_URL`）
- 后端 Worker 仍在运行：`https://waline-on-worker.can4gaa1zeon3wwwcjj.workers.dev`
- 数据库备份：`docs/waline-db-backup-20260925.sql`

**注意**：切回 Waline 意味着又要挂梯子，所以仅在 Twikoo 出问题时临时使用。
