# Waline 讨论区部署指南（站长专用）

> 目标：让网站「文学讨论」页面真正可用。
> 需要：一个 Vercel 账号（用 GitHub 登录）+ 一个 LeanCloud 国际版账号（免费）。
> 预计耗时：15 分钟。配好后把 Vercel 地址发给唯酱，她填入网站即可激活。

## 第一步：注册 Vercel 并部署 Waline 后端

1. 打开 https://vercel.com  → 点 **Sign Up** → 选 **Continue with GitHub**（用你的 GitHub 账号登录，30 秒）。
2. 登录后，点击这个一键部署链接：
   `https://vercel.com/new/clone?repository-url=https://github.com/walinejs/vercel`
   （如果链接失效，就打开 Waline 官方文档 https://waline.js.org/guide/get-started/ 找「Vercel 部署」按钮）
3. Vercel 会让你选仓库名（随便，比如 `waline-server`），点 **Create** 开始部署。
4. 部署完成后，记下你的后端地址，形如：`https://waline-server-xxxx.vercel.app`
   （先别关页面，下一步要回去配环境变量）

## 第二步：注册 LeanCloud 国际版（免费数据库）

1. 打开 https://console.leancloud.app/  → 注册账号（邮箱即可，国际版免费、无需实名）。
2. 登录后点 **创建应用** → 名字随便填（比如 `yinming-discussion`）→ 选「开发版」（免费）。
3. 进入应用 → 左侧菜单 **设置 → 应用凭证**，记下三个值：
   - **AppID**（形如 `xxx-xxx-xxx`）
   - **AppKey**
   - **MasterKey**
4. 注意：国际版不要勾选/使用「华东/华北节点」的国内版配置，保持默认国际版即可。

## 第三步：把数据库信息告诉 Waline 后端

1. 回到 Vercel 控制台 → 找到刚部署的项目 → **Settings → Environment Variables**（环境变量）。
2. 添加三个变量：
   - `LEAN_ID` = 你的 AppID
   - `LEAN_KEY` = 你的 AppKey
   - `LEAN_MASTER_KEY` = 你的 MasterKey
3. 添加完后，回到 **Deployments** → 找到最新部署 → 点 **Redeploy**（重新部署）让它生效。

## 第四步：注册管理员

1. 浏览器打开 `https://你的地址.vercel.app/ui/register`（第一次访问会创建管理员账号）。
2. 注册一个管理员（用你自己的邮箱），以后可以在这里删帖、置顶、管理讨论区。

## 第五步：激活网站讨论区

把后端地址发给唯酱（形如 `https://waline-server-xxxx.vercel.app`），她会：
- 替换 `discussion.html` 里的 `serverURL`
- 重新部署网站
- 讨论区正式开放 🎉

## 常见问题

- **评论发不出去？** 检查 LeanCloud 的三个 Key 是否填对、Vercel 是否 Redeploy 过。
- **想换数据库？** Waline 也支持 MongoDB 等，但 LeanCloud 免费版对社团完全够用。
- **国内访问 Vercel 慢？** 一般可以接受；如果太慢，后续可考虑绑定自定义域名或换国内托管。
