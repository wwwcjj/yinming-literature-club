// 嘤鸣文学评论社 — Twikoo 评论区配置
//
// 【唯一需要修改的地方】
// 在腾讯云 EdgeOne Pages 部署好 Twikoo 后端后，把域名填进 TWIKOO_ENV_ID。
// 例如: window.TWIKOO_ENV_ID = 'https://twikoo-xxx.edgeone.app';
// 还没部署时保持空字符串 ''，页面会显示「讨论区即将开放」的占位提示。
window.TWIKOO_ENV_ID = '';

// Twikoo 边界与语言
window.TWIKOO_LOCALE = 'zh-CN';

// 未配置后端时的提示文案
window.TWIKOO_NOT_READY =
    '📝 讨论区即将开放，敬请期待～ 社团正在搭建讨论模块，稍后就可以在这里畅聊文学啦。';
