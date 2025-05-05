/**
 * سكريبت محسن لشاشة التحميل
 * يوفر تجربة تحميل سريعة ومتناسقة ومتجاوبة مع جميع الأجهزة
 * تم تحديثه لإزالة الشعار وتبسيط الواجهة
 */

// تنفيذ الكود فور تحميل DOM
document.addEventListener('DOMContentLoaded', function() {
    // الحصول على عنصر شاشة التحميل
    const loadingScreen = document.getElementById('loading-screen');

    if (loadingScreen) {
        // إضافة عنصر الجزيئات
        const particlesContainer = document.createElement('div');
        particlesContainer.className = 'loading-particles';
        loadingScreen.querySelector('.loading-content').appendChild(particlesContainer);

        // إنشاء عدد أقل من الجزيئات لتحسين الأداء (10 بدلاً من 15)
        for (let i = 0; i < 10; i++) {
            createParticle(particlesContainer);
        }

        // تحديث شريط التقدم بشكل أسرع
        updateProgressBar();

        // تحسين سرعة إخفاء شاشة التحميل
        const hideLoadingScreen = () => {
            // إضافة فئة الإخفاء
            loadingScreen.classList.add('hidden');

            // إزالة شاشة التحميل من DOM بعد انتهاء التأثير
            setTimeout(() => {
                if (loadingScreen.parentNode) {
                    loadingScreen.remove();
                }
            }, 400); // تقليل وقت الانتظار بعد الإخفاء
        };

        // استخدام requestAnimationFrame لتحسين الأداء
        if (window.requestAnimationFrame) {
            requestAnimationFrame(() => {
                // تحقق مما إذا كانت الصفحة محملة بالفعل
                if (document.readyState === 'complete') {
                    // إخفاء شاشة التحميل بعد 600 مللي ثانية (أسرع من قبل)
                    setTimeout(hideLoadingScreen, 600);
                } else {
                    // إضافة مستمع لحدث load
                    window.addEventListener('load', () => {
                        setTimeout(hideLoadingScreen, 600);
                    });
                }
            });
        } else {
            // للمتصفحات القديمة التي لا تدعم requestAnimationFrame
            if (document.readyState === 'complete') {
                setTimeout(hideLoadingScreen, 600);
            } else {
                window.addEventListener('load', () => {
                    setTimeout(hideLoadingScreen, 600);
                });
            }
        }
    }
});

/**
 * وظيفة لإنشاء جزيء
 * @param {HTMLElement} container - حاوية الجزيئات
 */
function createParticle(container) {
    // إنشاء عنصر الجزيء
    const particle = document.createElement('div');
    particle.className = 'particle';

    // تعيين موقع عشوائي
    const x = Math.random() * 100;
    const y = Math.random() * 100;

    // تعيين حجم وشفافية عشوائية
    const size = Math.random() * 3 + 2; // حجم أصغر لتحسين الأداء
    const opacity = Math.random() * 0.4 + 0.1;

    // تعيين خصائص الجزيء
    Object.assign(particle.style, {
        left: `${x}%`,
        top: `${y}%`,
        width: `${size}px`,
        height: `${size}px`,
        opacity: opacity
    });

    // إضافة الجزيء إلى الحاوية
    container.appendChild(particle);

    // تحريك الجزيء
    moveParticle(particle);
}

/**
 * وظيفة لتحريك الجزيء
 * @param {HTMLElement} particle - عنصر الجزيء
 */
function moveParticle(particle) {
    // تعيين موقع جديد عشوائي
    const newX = Math.random() * 100;
    const newY = Math.random() * 100;

    // تعيين مدة انتقال أقصر لتحسين الأداء
    const duration = Math.random() * 10 + 5;

    // تطبيق الانتقال
    particle.style.transition = `left ${duration}s linear, top ${duration}s linear`;
    particle.style.left = `${newX}%`;
    particle.style.top = `${newY}%`;

    // تكرار الحركة بعد انتهاء المدة
    setTimeout(() => {
        // التحقق من وجود الجزيء في DOM قبل تحريكه مرة أخرى
        if (particle.parentNode) {
            moveParticle(particle);
        }
    }, duration * 1000);
}

/**
 * وظيفة لتحديث شريط التقدم
 * تستخدم requestAnimationFrame لتحسين الأداء
 */
function updateProgressBar() {
    const progressBar = document.querySelector('.progress-bar');

    if (progressBar) {
        let width = 0;
        let lastTime = 0;

        // استخدام requestAnimationFrame لتحسين الأداء
        const animate = (timestamp) => {
            // حساب الوقت المنقضي
            if (!lastTime) lastTime = timestamp;
            const elapsed = timestamp - lastTime;

            // تحديث العرض كل 10 مللي ثانية
            if (elapsed > 10) {
                // زيادة العرض بشكل أسرع (2 بدلاً من 1)
                width += 2;

                // التأكد من عدم تجاوز 100%
                if (width > 100) width = 100;

                // تطبيق العرض الجديد
                progressBar.style.width = width + '%';

                // تحديث الوقت الأخير
                lastTime = timestamp;

                // إيقاف الرسوم المتحركة عند الوصول إلى 100%
                if (width >= 100) return;
            }

            // استمرار الرسوم المتحركة
            requestAnimationFrame(animate);
        };

        // بدء الرسوم المتحركة
        if (window.requestAnimationFrame) {
            requestAnimationFrame(animate);
        } else {
            // للمتصفحات القديمة التي لا تدعم requestAnimationFrame
            const interval = setInterval(() => {
                width += 2;
                if (width >= 100) {
                    clearInterval(interval);
                    width = 100;
                }
                progressBar.style.width = width + '%';
            }, 20);
        }
    }
}
