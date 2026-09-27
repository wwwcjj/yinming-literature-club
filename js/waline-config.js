// 嘤鸣文学评论社 — Waline 评论区配置
//
// 【唯一需要修改的地方】
// 在腾讯云 CloudBase 部署好 Waline 后端后，把服务地址填进 WALINE_SERVER_URL。
// 例如: window.WALINE_SERVER_URL = 'https://your-env.tcloudbaseapp.com';
// 还没部署时保持空字符串 ''，页面会显示「讨论区即将开放」的占位提示。
//
// 备选：若仍使用 Cloudflare Worker 后端，可填
//   https://waline-on-worker.can4gaa1zeon3wwwcjj.workers.dev
// （注意：该域名在校园网不可达，仅作备用）
window.WALINE_SERVER_URL = '';

// Waline 语言
window.WALINE_LOCALE = 'zh-CN';

// 未配置后端时的提示文案
window.WALINE_NOT_READY =
    '📝 讨论区即将开放，敬请期待～ 社团正在搭建讨论模块，稍后就可以在这里畅聊文学啦。';
