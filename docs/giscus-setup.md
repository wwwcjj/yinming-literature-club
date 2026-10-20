# GitHub Discussions + Giscus 配置

当前网站使用 Giscus，把评论保存到 GitHub 仓库的 Discussions 中，不需要腾讯云数据库或服务器。

## 一次性设置

1. 打开仓库 `https://github.com/wwwcjj/yinming-literature-club` 的 **Settings → General → Features**，启用 **Discussions**。
2. 打开 `https://giscus.app/`，仓库填写 `wwwcjj/yinming-literature-club`。
3. 在 GitHub 安装并授权 **giscus** App，选择这个仓库。
4. 在 Giscus 页面选择 `Announcements` 分类，复制生成配置里的 `data-category-id`。
5. 把 `categoryId` 填入 `js/giscus-config.js`。
6. 提交并推送网站。

`repoId` 已经填好。没有填 `categoryId` 时，网站会显示设置提示，不会报错。

## 当前讨论分区

- `discussion.html` 使用 `discussion` 话题。
- `works/index.html` 会按作品标题创建独立话题，例如 `works/秋日的巴赫`。

访客需要使用 GitHub 登录后发表评论；管理员可以直接在仓库 Discussions 中管理内容。
