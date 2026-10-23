// 嘤鸣文学评论社 — LeanCloud 国内登录评论区
(function () {
    'use strict';

    const root = document.getElementById('leancloud-comments');
    if (!root) return;
    const config = window.LEANCLOUD_CONFIG || {};
    const maxLength = 1000;
    const isWorksPage = !!document.querySelector('[data-work]');

    function escapeHTML(value) {
        return String(value).replace(/[&<>'"]/g, function (char) {
            return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char];
        });
    }

    function pageKey() {
        const hash = window.location.hash.replace(/^#/, '');
        let title = '';
        try { title = decodeURIComponent(hash); } catch (e) { title = hash; }
        return isWorksPage && title ? window.location.pathname + '#' + title : window.location.pathname;
    }

    function showMessage(message, type) {
        const el = root.querySelector('.lc-message');
        if (el) { el.textContent = message; el.className = 'lc-message ' + (type || ''); }
    }

    function setupNotice() {
        root.innerHTML = '<div class="lc-notice"><strong>国内讨论区还差一步配置</strong><p>请在 LeanCloud 创建应用后，把 App ID 和 App Key 填入 <code>js/leancloud-config.js</code>。</p><p>暂时也可以使用 <a href="' + escapeHTML(config.githubBackup || '#') + '" target="_blank" rel="noopener">GitHub 备用讨论区</a>。</p></div>';
    }

    if (!config.appId || !config.appKey || typeof window.AV === 'undefined') { setupNotice(); return; }
    try { window.AV.init({ appId: config.appId, appKey: config.appKey, serverURL: config.serverURL || undefined }); }
    catch (error) { setupNotice(); return; }

    const Comment = AV.Object.extend('LiteraryComment');

    function render() {
        const user = AV.User.current();
        root.innerHTML = '<div class="lc-heading"><div><h2>💬 文学讨论</h2><p>使用邮箱注册即可参与讨论，评论按页面分别保存。</p></div>' + (user ? '<button class="lc-button lc-ghost" id="lc-logout">退出登录</button>' : '') + '</div>' + (user ? commentForm(user) : authForm()) + '<div class="lc-message" aria-live="polite"></div><div class="lc-list" id="lc-list"><p class="lc-loading">正在加载评论……</p></div>';
        if (user) {
            document.getElementById('lc-logout').addEventListener('click', function () { AV.User.logOut().then(render); });
            document.getElementById('lc-comment-form').addEventListener('submit', submitComment);
        } else {
            document.getElementById('lc-login-form').addEventListener('submit', login);
            document.getElementById('lc-signup-form').addEventListener('submit', signup);
        }
        loadComments();
    }

    function authForm() {
        return '<div class="lc-auth-grid"><form id="lc-login-form" class="lc-card"><h3>登录</h3><input name="email" type="email" placeholder="邮箱" required autocomplete="email"><input name="password" type="password" placeholder="密码" required autocomplete="current-password"><button class="lc-button" type="submit">登录后评论</button></form><form id="lc-signup-form" class="lc-card"><h3>注册</h3><input name="nickname" maxlength="30" placeholder="昵称" required><input name="email" type="email" placeholder="邮箱" required autocomplete="email"><input name="password" type="password" minlength="6" placeholder="密码（至少 6 位）" required autocomplete="new-password"><button class="lc-button" type="submit">注册账号</button></form></div>';
    }

    function commentForm(user) {
        return '<form id="lc-comment-form" class="lc-card lc-comment-form"><label for="lc-content">' + escapeHTML(user.get('nickname') || user.getUsername()) + '，写下你的想法</label><textarea id="lc-content" name="content" maxlength="' + maxLength + '" placeholder="和大家聊聊这篇作品……" required></textarea><div class="lc-form-row"><span>最多 ' + maxLength + ' 字</span><button class="lc-button" type="submit">发表评论</button></div></form>';
    }

    function login(event) {
        event.preventDefault();
        const form = new FormData(event.target);
        showMessage('正在登录……');
        AV.User.logIn(form.get('email'), form.get('password')).then(render).catch(function (error) { showMessage(error.message || '登录失败，请检查邮箱和密码。', 'error'); });
    }

    function signup(event) {
        event.preventDefault();
        const form = new FormData(event.target);
        const user = new AV.User();
        user.setUsername(form.get('email')); user.setEmail(form.get('email')); user.setPassword(form.get('password')); user.set('nickname', form.get('nickname'));
        showMessage('正在创建账号……');
        user.signUp().then(render).catch(function (error) { showMessage(error.message || '注册失败，请稍后再试。', 'error'); });
    }

    function submitComment(event) {
        event.preventDefault();
        const content = new FormData(event.target).get('content').trim();
        if (!content || content.length > maxLength) return showMessage('评论不能为空，且不能超过 ' + maxLength + ' 字。', 'error');
        const comment = new Comment();
        comment.set('pageKey', pageKey()); comment.set('content', content); comment.set('nickname', AV.User.current().get('nickname') || AV.User.current().getUsername());
        const acl = new AV.ACL(AV.User.current()); acl.setPublicReadAccess(true); comment.setACL(acl);
        showMessage('正在发表……');
        comment.save().then(render).catch(function (error) { showMessage(error.message || '发表失败，请稍后再试。', 'error'); });
    }

    function loadComments() {
        const query = new AV.Query('LiteraryComment');
        query.equalTo('pageKey', pageKey()); query.descending('createdAt'); query.limit(100);
        query.find().then(function (comments) {
            const list = document.getElementById('lc-list'); if (!list) return;
            if (!comments.length) { list.innerHTML = '<p class="lc-empty">还没有评论，来写第一条吧～</p>'; return; }
            list.innerHTML = comments.map(function (comment) { const date = comment.createdAt ? comment.createdAt.toLocaleString('zh-CN') : ''; return '<article class="lc-comment"><div class="lc-comment-meta"><strong>' + escapeHTML(comment.get('nickname') || '文学社成员') + '</strong><time>' + escapeHTML(date) + '</time></div><p>' + escapeHTML(comment.get('content') || '') + '</p></article>'; }).join('');
        }).catch(function () { const list = document.getElementById('lc-list'); if (list) list.innerHTML = '<p class="lc-error">评论加载失败，请检查 LeanCloud 应用配置。</p>'; });
    }

    render();
})();
