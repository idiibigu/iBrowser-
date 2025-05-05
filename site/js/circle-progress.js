/**
 * حلقة تقدم دائرية حول الشعار تتغير مع التمرير
 */

document.addEventListener('DOMContentLoaded', function() {
    // البحث عن الشعار
    const brandLogo = document.querySelector('.navbar-brand');
    if (!brandLogo) return;

    // إنشاء عنصر SVG للحلقة
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("class", "progress-circle");
    svg.setAttribute("viewBox", "0 0 100 100");

    // إنشاء الدائرة الخلفية
    const circleBg = document.createElementNS(svgNS, "circle");
    circleBg.setAttribute("class", "progress-circle-bg");
    circleBg.setAttribute("cx", "50");
    circleBg.setAttribute("cy", "50");
    circleBg.setAttribute("r", "45");

    // إنشاء دائرة التقدم
    const circlePath = document.createElementNS(svgNS, "circle");
    circlePath.setAttribute("class", "progress-circle-path");
    circlePath.setAttribute("cx", "50");
    circlePath.setAttribute("cy", "50");
    circlePath.setAttribute("r", "45");

    // حساب محيط الدائرة
    const radius = 45;
    const circumference = 2 * Math.PI * radius;

    // تعيين خصائص الدائرة
    circlePath.style.strokeDasharray = circumference;
    circlePath.style.strokeDashoffset = circumference;

    // إضافة الدوائر إلى SVG
    svg.appendChild(circleBg);
    svg.appendChild(circlePath);

    // إضافة SVG إلى الشعار
    brandLogo.appendChild(svg);

    // تحديث حلقة التقدم عند التمرير
    function updateProgress() {
        // حساب نسبة التمرير
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrollPercentage = (scrollTop / scrollHeight) * 100;

        // تحديث حلقة التقدم
        const offset = circumference - (scrollPercentage / 100 * circumference);
        circlePath.style.strokeDashoffset = offset;

        // إضافة تأثيرات عند التمرير
        if (scrollPercentage > 0) {
            brandLogo.classList.add('scrolling');
        } else {
            brandLogo.classList.remove('scrolling');
        }

        // يمكن تفعيل معلومات التصحيح عند الحاجة
        // console.log(`Scroll: ${scrollPercentage.toFixed(2)}%, Offset: ${offset.toFixed(2)}`);
    }

    // تمرير سلس (smooth scrolling)
    let lastScrollTop = 0;
    let ticking = false;
    let animationFrame;
    let currentOffset = circumference;
    let targetOffset = circumference;

    // معامل السلاسة (0-1)
    const smoothFactor = 0.1;

    // وظيفة التحريك السلس
    function smoothAnimation() {
        // حساب الفرق بين القيمة الحالية والهدف
        const diff = targetOffset - currentOffset;

        // إذا كان الفرق صغيرًا جدًا، نتوقف عن التحريك
        if (Math.abs(diff) < 0.5) {
            currentOffset = targetOffset;
            circlePath.style.strokeDashoffset = currentOffset;
            return;
        }

        // تحريك القيمة الحالية نحو الهدف بشكل سلس
        currentOffset += diff * smoothFactor;

        // تطبيق القيمة الجديدة
        circlePath.style.strokeDashoffset = currentOffset;

        // استمرار التحريك
        animationFrame = requestAnimationFrame(smoothAnimation);
    }

    window.addEventListener('scroll', function() {
        lastScrollTop = window.scrollY || document.documentElement.scrollTop;

        if (!ticking) {
            window.requestAnimationFrame(function() {
                // حساب نسبة التمرير
                const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
                const scrollPercentage = (lastScrollTop / scrollHeight) * 100;

                // تحديث القيمة الهدف
                targetOffset = circumference - (scrollPercentage / 100 * circumference);

                // إضافة تأثيرات عند التمرير
                if (scrollPercentage > 0) {
                    brandLogo.classList.add('scrolling');
                } else {
                    brandLogo.classList.remove('scrolling');
                }

                // بدء التحريك السلس إذا لم يكن جاريًا
                if (!animationFrame) {
                    animationFrame = requestAnimationFrame(smoothAnimation);
                }

                ticking = false;
            });

            ticking = true;
        }
    });

    // تحديث عند تحميل الصفحة
    updateProgress();

    // تحديث عند تغيير حجم النافذة
    window.addEventListener('resize', updateProgress);
});
