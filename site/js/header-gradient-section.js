/**
 * إضافة قسم الأزرار المتدرجة إلى الهيدر في جميع الصفحات
 */

document.addEventListener('DOMContentLoaded', function() {
    // التحقق من وجود الهيدر
    const header = document.querySelector('.new-header');
    if (!header) return;
    
    // إنشاء حاوية القسم المتدرج
    const gradientContainer = document.createElement('div');
    gradientContainer.className = 'header-gradient-container';
    
    // إنشاء القسم المتدرج
    const gradientSection = document.createElement('div');
    gradientSection.className = 'header-gradient-section';
    
    // إنشاء العنوان
    const gradientTitle = document.createElement('div');
    gradientTitle.className = 'header-gradient-title';
    
    // إنشاء حاوية الأزرار
    const gradientButtons = document.createElement('div');
    gradientButtons.className = 'header-gradient-buttons';
    
    // تحديد النصوص بناءً على لغة الصفحة
    const isEnglish = document.documentElement.lang === 'en';
    
    // تعيين النصوص
    if (isEnglish) {
        gradientTitle.textContent = 'This is our role - we provide an innovative and integrated infrastructure for your digital business';
        
        // إنشاء الأزرار
        const exploreButton = document.createElement('a');
        exploreButton.href = 'services.html';
        exploreButton.className = 'btn-header-explore';
        exploreButton.textContent = 'Explore Our Services';
        
        const contactButton = document.createElement('a');
        contactButton.href = 'contact.html';
        contactButton.className = 'btn-header-secondary';
        contactButton.textContent = 'Contact Us';
        
        // إضافة الأزرار إلى الحاوية
        gradientButtons.appendChild(exploreButton);
        gradientButtons.appendChild(contactButton);
    } else {
        gradientTitle.textContent = 'هذا هو دورنا - نقدم بنية تحتية متكاملة ومبتكرة لأعمالك الرقمية';
        
        // إنشاء الأزرار
        const exploreButton = document.createElement('a');
        exploreButton.href = 'services.html';
        exploreButton.className = 'btn-header-explore';
        exploreButton.textContent = 'استكشف خدماتنا';
        
        const contactButton = document.createElement('a');
        contactButton.href = 'contact.html';
        contactButton.className = 'btn-header-secondary';
        contactButton.textContent = 'تواصل معنا';
        
        // إضافة الأزرار إلى الحاوية
        gradientButtons.appendChild(exploreButton);
        gradientButtons.appendChild(contactButton);
    }
    
    // تجميع العناصر
    gradientSection.appendChild(gradientTitle);
    gradientSection.appendChild(gradientButtons);
    gradientContainer.appendChild(gradientSection);
    
    // إضافة القسم إلى الهيدر
    const headerContainer = header.querySelector('.container');
    headerContainer.appendChild(gradientContainer);
});
