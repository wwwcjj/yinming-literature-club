// 嘤鸣文学评论社 — 评论区逻辑（Waline）
//
// 功能：一个页面里只挂一个评论区实例。
//   · discussion.html    → 全部留言共用同一个话题（按页面 URL 自动区分）
//   · works/index.html   → 点「来聊聊这篇」切换到该作品的话题；
//                          打开页面时按 URL 里的 #hash 自动选中对应作品
//
// 依赖：
//   · vendor/waline/waline.js   （本地，样式由 vendor/waline/waline.css 提供）
//   · js/waline-config.js       （配置：WALINE_SERVER_URL）
//
// 说明：Waline 用 serverURL + path 标识话题，path 相同即共享同一串评论。

(function () {
    'use strict';

    const el = document.getElementById('waline');
    if (!el) return;

    const SERVER_URL = (window.WALINE_SERVER_URL || '').trim();
    const NOT_READY = window.WALINE_NOT_READY || '📝 讨论区即将开放，敬请期待～';

    // --- 未配置后端：先给个柔和的占位提示 ---
    if (!SERVER_URL) {
        el.innerHTML = '<p class="comment-notice">' + NOT_READY + '</p>';
        console.warn('[waline] WALINE_SERVER_URL 为空，评论未加载。');
        return;
    }

    // --- 话题标识 ---
    function currentPath() {
        return window.location.pathname + window.location.search;
    }

    function decodeHash() {
        const raw = window.location.hash.replace(/^#/, '');
        try {
            return decodeURIComponent(raw);
        } catch (e) {
            return raw;
        }
    }

    const isWorksPage = !!document.querySelector('[data-work]');
    let workTitle = decodeHash();

    function topicPath() {
        return isWorksPage && workTitle ? currentPath() + '#' + workTitle : currentPath();
    }

    // --- 等 Waline 脚本就绪后初始化 ---
    function boot() {
        if (typeof window.Waline === 'undefined' || !window.Waline.init) {
            // 脚本尚未加载完成，稍后重试一次
            setTimeout(boot, 200);
            return;
        }
        el.innerHTML = '';
        window.Waline.init({
            el: el,
            serverURL: SERVER_URL,
            path: topicPath(),
            lang: window.WALINE_LOCALE || 'zh-CN',
            pageview: false,
            emoji: true,
        });
        highlightActiveWork();
    }

    function highlightActiveWork() {
        if (!isWorksPage) return;
        document.querySelectorAll('[data-work]').forEach(function (a) {
            const on = a.getAttribute('data-work') === workTitle;
            a.classList.toggle('work-link-active', on);
        });
    }

    function scrollToComments() {
        const box = document.getElementById('comments');
        if (box) box.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // --- 作品页：点卡片里的链接 → 切话题 + 平滑滚动 ---
    function switchWork(title) {
        if (title === workTitle) {
            scrollToComments();
            return;
        }
        workTitle = title;
        try {
            history.replaceState(null, '', '#' + encodeURIComponent(title));
        } catch (e) {}
        boot();
        scrollToComments();
    }

    if (isWorksPage) {
        document.querySelectorAll('[data-work]').forEach(function (a) {
            a.addEventListener('click', function (ev) {
                ev.preventDefault();
                switchWork(a.getAttribute('data-work'));
            });
        });
    }

    boot();
})();
