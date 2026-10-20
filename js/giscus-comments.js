// GitHub Discussions + Giscus 讨论区逻辑
(function () {
    'use strict';

    const container = document.getElementById('giscus');
    if (!container) return;

    const config = window.GISCUS_CONFIG || {};
    const isWorksPage = !!document.querySelector('[data-work]');

    function currentTopic() {
        const hash = window.location.hash.replace(/^#/, '');
        let title = '';
        try { title = decodeURIComponent(hash); } catch (e) { title = hash; }
        return isWorksPage && title ? 'works/' + title : 'discussion';
    }

    function showSetupNotice() {
        container.innerHTML = '<p class="comment-notice">📝 讨论区正在连接 GitHub Discussions。管理员完成 GitHub 设置后，这里就可以留言啦～</p>';
    }

    function render() {
        if (!config.repoId || !config.categoryId) {
            showSetupNotice();
            return;
        }

        container.innerHTML = '';
        const script = document.createElement('script');
        script.src = 'https://giscus.app/client.js';
        script.async = true;
        script.crossOrigin = 'anonymous';
        script.setAttribute('data-repo', config.repo);
        script.setAttribute('data-repo-id', config.repoId);
        script.setAttribute('data-category', config.category);
        script.setAttribute('data-category-id', config.categoryId);
        script.setAttribute('data-mapping', 'specific');
        script.setAttribute('data-term', currentTopic());
        script.setAttribute('data-strict', '1');
        script.setAttribute('data-reactions-enabled', '1');
        script.setAttribute('data-emit-metadata', '0');
        script.setAttribute('data-input-position', 'top');
        script.setAttribute('data-theme', config.theme || 'light');
        script.setAttribute('data-lang', config.lang || 'zh-CN');
        container.appendChild(script);
    }

    function updateActiveWork() {
        if (!isWorksPage) return;
        const title = currentTopic().replace(/^works\//, '');
        document.querySelectorAll('[data-work]').forEach(function (link) {
            link.classList.toggle('work-link-active', link.getAttribute('data-work') === title);
        });
        const hint = document.querySelector('.comment-hint');
        if (hint && title) hint.textContent = '正在讨论：《' + title + '》—— 换个话题点上面的链接就好～';
    }

    if (isWorksPage) {
        document.querySelectorAll('[data-work]').forEach(function (link) {
            link.addEventListener('click', function (event) {
                event.preventDefault();
                history.replaceState(null, '', '#' + encodeURIComponent(link.getAttribute('data-work')));
                updateActiveWork();
                render();
                document.getElementById('comments').scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        });
    }

    updateActiveWork();
    render();
})();
