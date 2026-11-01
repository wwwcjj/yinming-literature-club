(function () {
    'use strict';
    const form = document.getElementById('submission-form');
    const status = document.getElementById('submission-status');
    if (!form || !status) return;

    form.addEventListener('submit', function (event) {
        event.preventDefault();
        const data = new FormData(form);
        const title = String(data.get('title') || '').trim();
        const author = String(data.get('author') || '').trim();
        const category = String(data.get('category') || '').trim();
        const content = String(data.get('content') || '').trim();
        const contact = String(data.get('contact') || '').trim();
        if (!title || !author || !content) return;

        const body = ['投稿类型：' + category, '投稿标题：' + title, '投稿署名：' + author, contact ? '联系方式：' + contact : '', '', '正文：', content].filter(Boolean).join('\n');
        const email = String(window.SUBMISSION_EMAIL || '').trim();
        if (!email) {
            status.textContent = '投稿邮箱还未配置，请联系网站管理员。';
            status.className = 'submission-status error';
            return;
        }
        const mailto = 'mailto:' + encodeURIComponent(email) + '?subject=' + encodeURIComponent('[文学投稿] ' + title) + '&body=' + encodeURIComponent(body);
        window.location.href = mailto;
        status.textContent = '已打开邮件客户端，请检查内容后发送。';
        status.className = 'submission-status success';
    });
})();
