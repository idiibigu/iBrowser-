/**
 * وظائف لعرض التاريخ والوقت بشكل ديناميكي
 */

document.addEventListener('DOMContentLoaded', function() {
    // تحديث السنة في حقوق النشر
    updateCopyrightYear();

    // تحديث الساعة كل ثانية
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);

    // إضافة عناصر الساعة والسنة إذا لم تكن موجودة
    addDateTimeElements();
});

/**
 * تحديث السنة في حقوق النشر
 */
function updateCopyrightYear() {
    const currentYear = new Date().getFullYear();
    const copyrightElements = document.querySelectorAll('.copyright-year');

    copyrightElements.forEach(element => {
        element.textContent = currentYear;
    });
}

/**
 * تحديث الساعة الحالية
 */
function updateCurrentTime() {
    const now = new Date();
    const timeElements = document.querySelectorAll('.current-time');

    timeElements.forEach(element => {
        // تنسيق الوقت بالساعات والدقائق والثواني
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');

        // تحديث نص العنصر
        element.textContent = `${hours}:${minutes}:${seconds}`;
    });
}

/**
 * إضافة عناصر الساعة والسنة إذا لم تكن موجودة
 */
function addDateTimeElements() {
    // البحث عن عنصر حقوق النشر
    const copyrightElements = document.querySelectorAll('.copyright p');

    copyrightElements.forEach(element => {
        // التحقق مما إذا كان النص يحتوي على سنة ثابتة
        if (element.innerHTML.includes('2023') && !element.innerHTML.includes('copyright-year')) {
            // تحديد اللغة
            const isArabic = document.documentElement.lang === 'ar';
            const timeLabel = isArabic ? 'الساعة الآن:' : 'Current time:';

            // استبدال السنة الثابتة بعنصر ديناميكي
            let newContent = element.innerHTML.replace(/2023/g, '<span class="copyright-year">2023</span>');

            // إضافة عنصر الساعة إذا لم يكن موجودًا
            if (!element.innerHTML.includes('current-time')) {
                newContent = newContent.replace(/\.<\/p>|\.$/g, '. <span class="current-time-wrapper">' + timeLabel + ' <span class="current-time">00:00:00</span></span></p>');
            }

            // تحديث المحتوى
            element.innerHTML = newContent;
        }
    });
}
