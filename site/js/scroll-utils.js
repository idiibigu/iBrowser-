/**
 * وحدة التمرير الموحدة
 * Unified scroll utilities that combine progress bar and scrollbar functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    // إنشاء شريط التقدم
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress-bar';
    const progressIndicator = document.createElement('div');
    progressIndicator.className = 'scroll-progress-indicator';
    progressBar.appendChild(progressIndicator);
    document.body.appendChild(progressBar);

    // تحديث التقدم وتحسين الأداء
    let ticking = false;
    let lastScrollTop = 0;
    let animationFrame;

    function updateScroll() {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrollPercent = (scrollTop / scrollHeight) * 100;

        // تحديث شريط التقدم
        progressIndicator.style.width = `${scrollPercent}%`;
        
        // إضافة تأثيرات
        if (scrollTop > 50) {
            progressBar.style.opacity = '1';
            progressBar.classList.add('active');
        } else {
            progressBar.style.opacity = '0.8';
            progressBar.classList.remove('active');
        }

        // تحديث حلقة الشعار إذا كانت موجودة
        const brandLogo = document.querySelector('.navbar-brand');
        if (brandLogo) {
            if (scrollTop > 0) {
                brandLogo.classList.add('scrolling');
            } else {
                brandLogo.classList.remove('scrolling');
            }
        }

        ticking = false;
    }

    // معالجة حدث التمرير بكفاءة
    function onScroll() {
        lastScrollTop = window.scrollY || document.documentElement.scrollTop;
        if (!ticking) {
            window.requestAnimationFrame(function() {
                updateScroll();
                ticking = false;
            });
            ticking = true;
        }
    }

    // إضافة مستمعات الأحداث
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    document.addEventListener('readystatechange', onScroll);

    // التحديث الأولي
    setTimeout(updateScroll, 100);
});