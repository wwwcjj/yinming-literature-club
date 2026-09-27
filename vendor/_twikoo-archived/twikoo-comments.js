// 嘤鸣文学评论社 — 评论区逻辑（Twikoo）
//
// 功能：一个页面里只挂一个评论区实例。
//   · discussion.html    → 全部留言共用同一个话题（/discussion.html）
//   · works/index.html   → 点「来聊聊这篇」切换到该作品的话题；
//                          打开页面时按 URL 里的 #hash 自动选中对应作品
//
// 依赖：
//   · vendor/twikoo/twikoo.all.min.js  （本地，自带样式）
//   · js/twikoo-config.js              （配置：TWIKOO_ENV_ID）
//
// 说明：Twikoo 用 envId + path 标识话题，path 相同即共享同一串评论。

(function () {
    'use strict';

    const el = document.getElementById('waline') || document.getElementById('tcomment');
    if (!el) return;

    const ENV_ID = (window.TWIKOO_ENV_ID || '').trim();
    const NOT_READY = window.TWIKOO_NOT_READY || '📝 讨论区即将开放，敬请期待～';

    // --- 未配置后端：先给个柔和的占位提示 ---
    if (!ENV_ID) {
        el.innerHTML = '<p class="comment-notice">' + NOT_READY + '</p>';
        console.warn('[twikoo] TWIKOO_ENV_ID 为空，评论未加载。');
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

    // --- 等 twikoo 脚本就绪后初始化 ---
    function boot() {
        if (typeof window.twikoo === 'undefined' || !window.twikoo.init) {
            // 脚本尚未加载完成，稍后重试一次
            setTimeout(boot, 200);
            return;
        }
        window.twikoo.init({
            envId: ENV_ID,
            el: el,
            path: topicPath(),
            lang: window.TWIKOO_LOCALE || 'zh-CN',
        });
        highlightActiveWork();
    }

    function highlightActiveWork() {
        if (!isWorksPage) return;
        document.querySelectorAll('[data-work]').forEach(function (a) {
            const on = a.getAttribute('data-work') === workTitle;
            a.classList.toggle('work-link-active', on);
        });
        const hint = document.querySelector('.comment-hint');
        if (hint && workTitle) {
            hint.textContent = '正在讨论：《' + workTitle + '》—— 换个话题点上面的链接就好～';
        }
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
        // Twikoo 支持重新 init 切换 path：先清空容器再初始化
        el.innerHTML = '';
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
