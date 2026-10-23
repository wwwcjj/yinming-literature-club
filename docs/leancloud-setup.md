# LeanCloud 国内评论区配置

主讨论区使用 LeanCloud 国内版，GitHub Discussions + Giscus 保留为备用入口。

## 一次性配置

1. 打开 [LeanCloud 控制台](https://console.leancloud.cn/)，创建国内版应用。
2. 在应用设置中找到 `App ID` 和 `App Key`。
3. 填入 `js/leancloud-config.js`：

```js
window.LEANCLOUD_CONFIG = {
    appId: '你的 App ID',
    appKey: '你的 App Key',
    serverURL: ''
};
```

4. 推送网站后，第一次注册或发表评论会自动创建 `LiteraryComment` 数据表。

当前登录方式是邮箱 + 密码，不需要 GitHub，也不需要短信验证码。以后要改成手机号登录时，再接入短信验证码即可。

GitHub 备用讨论区：
`https://github.com/wwwcjj/yinming-literature-club/discussions`
