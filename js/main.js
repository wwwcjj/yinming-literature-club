// 未名文学社 — 脚本文件

document.addEventListener('DOMContentLoaded', function() {

    // --- 页面加载动画 ---
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);

    // --- 导航栏滚动效果 ---
    const navbar = document.querySelector('.navbar');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        if (currentScroll > 100) {
            navbar.style.boxShadow = '0 2px 20px rgba(0,0,0,0.06)';
        } else {
            navbar.style.boxShadow = 'none';
        }
        lastScroll = currentScroll;
    });

    // --- 新闻卡片交互提示 ---
    const cards = document.querySelectorAll('.news-card, .work-card');
    cards.forEach(card => {
        card.addEventListener('click', function() {
            // 以后可以在这里加跳转到详情页的逻辑
            const title = this.querySelector('.news-title, .work-title');
            if (title) {
                console.log('📖 点击了:', title.textContent);
            }
        });
    });

    console.log('📚 未名文学社网站已加载完成，欢迎来访！');
});
