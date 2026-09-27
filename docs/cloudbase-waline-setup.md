# Waline 部署到腾讯云 CloudBase —— 完整操作文档

> 目标：把 Waline 评论后端部署到**腾讯云 CloudBase（云开发）**，让校园网**不挂梯子**也能评论。
> 适用：宁波大学「嘤鸣文学评论社」官网内测（约 30 人）。
> 前端已改造完毕，**唯一待填**：`js/waline-config.js` 里的 `WALINE_SERVER_URL`。

---

## 零、方案概览

| 部分 | 是什么 | 状态 |
| --- | --- | --- |
| 前端 | GitHub Pages 上的社团网站 | ✅ 已完成，不用动 |
| 评论客户端 | `vendor/waline/waline.js`（本地，无 CDN 依赖） | ✅ 已就位 |
| 评论后端 | **腾讯云 CloudBase 上的 Waline** | ⏳ 待部署 |
| 数据存储 | CloudBase 云数据库（自动创建） | ⏳ 随部署创建 |

上一版方案（Cloudflare Worker）因 `.workers.dev` 在校园网 DNS 被污染而弃用；
Cloudflare 数据已备份在 `docs/waline-db-backup-20260925.sql`，如需迁移评论可导入。

---

## 一、为什么选 CloudBase

| 对比项 | CloudBase | EdgeOne KV + Twikoo |
| --- | --- | --- |
| 要等审核吗 | ❌ 即时开通 | ✅ 要，可能数周 |
| 30 人注册名额限制 | ✅ Waline 原生支持 | ❌ Twikoo 无此功能 |
| 前端改动 | ✅ 已完成 | ✅ 已完成 |
| 费用 | 有免费额度，超出极便宜 | 免费（1GB） |

> 结论：因为你**要「限定 30 人注册」的内测功能**，Waline 才是原生支持的方案。

---

## 二、部署步骤（推荐：一键部署）

### 步骤 1：开通 CloudBase 环境

1. 登录 [腾讯云控制台](https://console.cloud.tencent.com/)
2. 搜索并进入 **云开发 CloudBase**
3. 点**开通** → **创建环境**（名字随意，如 `yinming`）
4. 计费方式选**按量计费**（有免费额度；用量小几乎不产生费用）
5. 记下**环境 ID**（形如 `yinming-1a2b3c4d`）

> 💡 新用户通常在活动页有「0 元包年包月」免费套餐，可以先领。

### 步骤 2：一键部署 Waline（推荐）

Waline 官方提供了 CloudBase 一键部署入口，点这个链接：

```
https://console.cloud.tencent.com/tcb/env/index?action=CreateAndDeployCloudBaseProject&appUrl=https%3A%2F%2Fgithub.com%2Fwalinejs%2Ftcb-starter&branch=master&appName=walineCloudBase
```

然后：

1. 选择**部署到已有环境**（选步骤 1 创建的环境）
2. 点 **下一步：应用配置** → 点 **完成**
3. 界面提示「**构建中，预计 3-5 分钟**」，等待
4. 构建完成后，条目右侧出现 **访问 / 管理** 按钮
5. 点 **访问** → 得到后端地址，形如：
   ```
   https://<环境ID>.service.tcloudbase.com/waline
   ```
   （也可能是 `https://xxx.tcloudbaseapp.com/waline` 之类，以实际显示为准）

### 步骤 2-备选：手动部署（一键部署不可用时）

1. 在环境详情页 → **云函数** → **新建云函数**
2. 运行环境选 **Node.js 18**，内存 **128M**，名称如 `waline`
3. 把 `walinejs/tcb-starter` 仓库里的 `app.js`、`cloudbaserc.json`、`package.json` 三个文件内容复制进去
4. 函数入口代码填（模板仓库提供的适配器）：

```javascript
module.exports.main = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  const entry = (() => {
    const result = require('./app.js');
    return result;
  })();
  const serverless = require('serverless-http');
  let app = entry;
  if (entry && entry.tcbGetApp && typeof entry.tcbGetApp === 'function') {
    app = await entry.tcbGetApp();
  }
  return serverless(app, {
    binary: [
      'application/javascript', 'application/json', 'application/octet-stream',
      'application/xml', 'font/eot', 'font/opentype', 'font/otf',
      'image/*', 'video/*', 'audio/*',
      'text/comma-separated-values', 'text/css', 'text/javascript',
      'text/plain', 'text/text', 'text/xml',
    ],
  })(event, context);
};
```

5. 点 **保存并安装依赖**（会转一会儿，等它完成）
6. 进入 **HTTP 访问服务** → **新建** → 触发路径填 `/waline`（**末尾不要加斜杠**）
7. 等待构建完成，访问地址 = **默认域名 + 触发路径**

### 步骤 3：配置（必需）

在云函数 → 编辑 → **环境变量** 里，按需添加：

| 变量名 | 值 | 说明 |
| --- | --- | --- |
| `JWT_TOKEN` | 一串随机字符串 | 登录令牌签名密钥（**建议一定设**） |
| `SITE_NAME` | `嘤鸣文学评论社` | 站点名 |
| `SITE_URL` | `https://wwwcjj.github.io/yinming-literature-club` | 站点地址 |
| `SECURE_DOMAINS` | `wwwcjj.github.io` | 允许评论的域名（防跨站调用） |

> ⚠️ `SECURE_DOMAINS` 在 Waline 里填**不带 `https://` 的域名**。
> 这点跟自建 Worker 版不同，注意区分。

**安全域名白名单**（很关键，否则前端会报跨域）：
在 **环境 → 安全配置 → WEB 安全域名** 里，把你的网站域名加进去：

```
wwwcjj.github.io
```

本地调试的话再加 `localhost`、`127.0.0.1`。

### 步骤 4：注册管理员

1. 部署完成后，浏览器打开 **后端地址 + `/ui/register`**，例如：
   ```
   https://<你的后端地址>/ui/register
   ```
2. 用你自己的邮箱注册 —— **第一个注册的用户自动成为管理员**
3. 管理面板入口：**后端地址 + `/ui`**

### 步骤 5：接入网站

把后端地址填进 `js/waline-config.js`：

```js
window.WALINE_SERVER_URL = 'https://<你的后端地址>';
```

例如：

```js
window.WALINE_SERVER_URL = 'https://yinming-1a2b3c4d.service.tcloudbase.com/waline';
```

然后提交推送到 GitHub，网站刷新即可评论。

---

## 三、内测人数说明（无需技术限制）

**结论：不做技术上限，30 人靠口头约定控制。**

理由：内测名额只是告知性质，参与的是社团内部同学，不需要在代码层面拦截。
因此无需配置任何人数上限，也无需改动 Waline 服务端。

对外口径可以写成：

> 本站评论区正在内测，**首批开放 30 个注册名额**，先到先得。

若将来确实需要硬限制，再改 Waline 服务端源码（`@waline/cloudbase` 包的注册逻辑），
参考 `Waline_On_Worker/src/router/user.ts` 里 `MAX_USERS` 的已实现写法。

---

## 四、常见问题

| 现象 | 原因 | 解决 |
| --- | --- | --- |
| 评论框显示「尚未配置」占位 | `WALINE_SERVER_URL` 还是空的 | 填后端地址 |
| 评论框加载但报跨域 | 安全域名没加 | 在云开发「WEB 安全域名」加入 `wwwcjj.github.io` |
| 能看评论但发不出 | `SECURE_DOMAINS` 不对 | 检查环境变量，只填域名不带 `https://` |
| 后端地址 404 | 触发路径写错 | 确认 HTTP 访问服务路径，末尾不带 `/` |
| 部署卡在「构建中」 | 正常现象 | 等 3-5 分钟 |
| 默认域名限流 | CloudBase 默认域名仅供测试 | 内测够用；正式推广需绑自定义域名（要备案） |

---

## 五、费用说明

| 项目 | 费用 |
| --- | --- |
| CloudBase 环境 | 有免费额度（新用户常有 0 元套餐） |
| 云函数调用 | 有免费额度，30 人内测用量极小 |
| 云数据库 | 有免费额度，评论是纯文本，占用极小 |
| 超出部分 | 按量计费，低至 0.21 元/天量级 |

> 实际内测阶段大概率**不产生费用**。

---

## 六、回滚与备选

| 备选 | 状态 |
| --- | --- |
| Cloudflare Worker + Waline | 后端仍在运行，数据已备份；但校园网不可达 |
| EdgeOne Pages + Twikoo | 已申请 KV，等审核；代码已写好并归档在 `vendor/_twikoo-archived/` |
| 前端切换 | 三个方案的配置都集中在 `js/*-config.js`，改动极小 |

**已归档资源**：

```
vendor/_waline-archived/    原 Waline 前端（当前已恢复启用）
vendor/_twikoo-archived/    Twikoo 前端与配置（等待 EdgeOne 审核）
```
