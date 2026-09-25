// 嘤鸣文学评论社 — 评论区配置文件
//
// 功能：一个页面里只挂一个评论区实例。
//   · guestbook.html          → 全部留言共用同一个话题
//   · works/index.html        → 点「来聊聊这篇」切换到一个作品的话题；
//                              打开页面时按 URL 里的 #hash 自动选中对应作品
//
// 【唯一需要修改的地方】
// 后端部署完成后，把 SERVER_URL 换成你的 Cloudflare Worker URL，例如：
//   https://waline-on-worker.your-name.workers.dev
// 还没部署时保持空字符串 ''，页面会显示「评论系统尚未连接」的提示。
const SERVER_URL = 'https://waline-on-worker.can4gaa1zeon3wwwcjj.workers.dev';

// 未配置后端时的提示文案
const NOT_READY_NOTICE = '💬 评论系统尚未连接：把 js/comments.js 里的 SERVER_URL 换成你的 Cloudflare Worker URL 就可以了～';

(function () {
    'use strict';

    const el = document.getElementById('waline');
    if (!el) return;

    // --- 未配置后端：先给个漂亮占位 ---
    if (!SERVER_URL) {
        el.innerHTML = '<p class="comment-notice">' + NOT_READY_NOTICE + '</p>';
        console.warn('[comments] SERVER_URL 为空，评论区未加载。');
        return;
    }

    // --- 加载 Waline 客户端（CSS + JS）---
    (function loadWalineClient() {
        const css = document.createElement('link');
        css.rel = 'stylesheet';
        css.href = 'https://unpkg.com/@waline/client@3/dist/waline.css';
        document.head.appendChild(css);

        const js = document.createElement('script');
        js.type = 'module';
        js.textContent = [
            "import { init } from 'https://unpkg.com/@waline/client@3/dist/waline.mjs';",
            'window.__initWaline = init;',
            "window.dispatchEvent(new Event('waline-ready'));"
        ].join('\n');
        document.head.appendChild(js);
    })();

    // --- 话题切换（仅作品页需要）---
    function currentPath() {
        return window.location.pathname + window.location.search;
    }

    function decodeHash() {
        const raw = window.location.hash.replace(/^#/, '');
        try { return decodeURIComponent(raw); } catch (e) { return raw; }
    }

    const workTitle = decodeHash();
    const isWorksPage = !!document.querySelector('[data-work]');
    const instance = {
        path: (isWorksPage && workTitle) ? currentPath() + '#' + workTitle : currentPath()
    };

    function boot() {
        if (typeof window.__initWaline !== 'function') return;
        window.__initWaline({
            el: '#waline',
            serverURL: SERVER_URL,
            path: instance.path,
            lang: 'zh-CN',
            locale: window.WALINE_LOCALE,
            reaction: false,
            meta: ['nick', 'mail'],
            requiredMeta: [],
            pageSize: 10,
            dark: false
        });
        highlightActiveWork();
    }

    window.addEventListener('waline-ready', boot, { once: true });

    // --- 作品页：点卡片里的链接 → 切话题 + 平滑滚动 ---
    function switchWork(title) {
        const next = currentPath() + '#' + encodeURIComponent(title);
        if (next === instance.path) { scrollToComments(); return; }
        instance.path = next;
        // 让地址栏同步（方便复制链接分享讨论）
        try { history.replaceState(null, '', '#' + encodeURIComponent(title)); } catch (e) {}
        if (window.__walineInstance && window.__walineInstance.update) {
            window.__walineInstance.update({ path: instance.path });
        } else {
            boot();
        }
        highlightActiveWork();
        scrollToComments();
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

    if (isWorksPage) {
        document.querySelectorAll('[data-work]').forEach(function (a) {
            a.addEventListener('click', function (ev) {
                ev.preventDefault();
                switchWork(a.getAttribute('data-work'));
            });
        });
        window.addEventListener('hashchange', function () {
            const t = decodeHash();
            if (t && t !== workTitle) {
                location.reload();
            }
        });
    }
})();

// 评论区的界面文字（中文）
window.WALINE_LOCALE = {
    placeholder: '留下你的文字吧……（支持 Markdown）',
    sofa: '还没有人留言，来做第一个吧 ✨',
    submit: '发表',
    login: '登录',
    anonymous: '匿名留言',
    commentCount: '条留言',
    reaction0: '赞同',
    reaction1: '不同意见',
    reaction2: '很有趣',
    reaction3: '想读原文',
    reaction4: '收藏',
    reaction5: '谢谢',
    nick: '昵称',
    mail: '邮箱（不会公开）',
    link: '网站（可选）',
    reactionTitle: '你觉得这篇怎么样？',
    comment: '留言',
    reply: '回复',
    replyTo: '回复 @',
    cancelReply: '取消回复',
    cancel: '取消',
    like: '赞同',
    sofaOr: '暂无留言',
    loading: '加载中……'
};
