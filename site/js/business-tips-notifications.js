/**
 * Business Tips Notifications
 * Displays helpful tips for business owners about idiibi services
 * Shows a different tip each time the page is refreshed for users who have enabled notifications
 */
document.addEventListener('DOMContentLoaded', function() {
    // Debug log to check if script is loaded
    console.log('Business Tips Notifications script loaded');
    // Array of business tips in Arabic
    const businessTipsAr = [
        // تصميم المواقع
        "تصميم موقع احترافي يزيد من ثقة العملاء في علامتك التجارية بنسبة تصل إلى 75%",
        "المواقع سريعة التحميل تقلل من معدل الارتداد بنسبة 40% وتزيد من معدلات التحويل",
        "تصميم واجهات المستخدم UX/UI الاحترافي يزيد من معدلات التحويل بنسبة تصل إلى 200%",
        "تحسين تجربة المستخدم يقلل من معدل الارتداد ويزيد من وقت البقاء على موقعك",
        "موقع متوافق مع الجوال يصل إلى 67% من جمهورك المستهدف الذين يتصفحون عبر الهواتف الذكية",
        "تصميم موقع بهوية بصرية متناسقة يزيد من تذكر علامتك التجارية بنسبة 80%",
        "المواقع المتوافقة مع معايير الويب تحسن ترتيبك في محركات البحث بنسبة تصل إلى 50%",

        // أنظمة الإدارة
        "أنظمة إدارة العملاء CRM تساعد في زيادة المبيعات بنسبة تصل إلى 29% وتحسين إنتاجية المبيعات بنسبة 34%",
        "أنظمة نقاط البيع POS المتكاملة تقلل من وقت المعاملات بنسبة 30% وتحسن تجربة العملاء",
        "تكامل أنظمة العمل يوفر الوقت والجهد ويقلل من الأخطاء البشرية بنسبة تصل إلى 40%",
        "أتمتة العمليات الإدارية توفر ما يصل إلى 20 ساعة أسبوعياً من وقت فريق العمل",
        "نظام إدارة المخزون الذكي يقلل من تكاليف التخزين بنسبة تصل إلى 25%",
        "أنظمة إدارة الموارد البشرية تزيد من إنتاجية الموظفين بنسبة تصل إلى 27%",
        "برامج إدارة المشاريع تحسن معدل إنجاز المهام في الوقت المحدد بنسبة 44%",

        // التسويق الرقمي
        "التسويق الرقمي المتكامل يمكن أن يزيد من معدل التحويل بنسبة تصل إلى 50%",
        "تحسين محركات البحث SEO يمكن أن يزيد من حركة المرور العضوية إلى موقعك بنسبة تصل إلى 200%",
        "التسويق عبر وسائل التواصل الاجتماعي يزيد من الوعي بعلامتك التجارية ويوسع قاعدة عملائك",
        "أتمتة التسويق عبر البريد الإلكتروني يمكن أن تحقق عائد استثمار يصل إلى 4400%",
        "حملات إعلانية مستهدفة على جوجل تزيد من معدل النقر بنسبة تصل إلى 300%",
        "استراتيجية محتوى متكاملة تزيد من حركة المرور العضوية بنسبة 83%",
        "التسويق بالفيديو يزيد من فهم المنتج بنسبة 74% ويزيد احتمالية الشراء",

        // خدمات الاستضافة
        "استضافة المواقع الموثوقة تضمن توفر موقعك بنسبة 99.9% وتحسن من سرعة التحميل",
        "خدمات الاستضافة السحابية توفر ما يصل إلى 30% من تكاليف البنية التحتية التقليدية",
        "استضافة ووردبريس المُدارة تزيد من أمان موقعك وتقلل من مخاطر الاختراق بنسبة 95%",
        "النسخ الاحتياطي اليومي يحمي بياناتك من الفقدان ويضمن استمرارية عملك",
        "شهادات SSL المجانية تزيد من ثقة العملاء وتحسن ترتيبك في محركات البحث",
        "الدعم الفني على مدار الساعة يضمن استمرارية عملك دون انقطاع",

        // تطبيقات الجوال
        "تطبيقات الجوال تزيد من ولاء العملاء وتفتح قنوات تسويقية جديدة لعملك",
        "تطبيقات الجوال المخصصة تزيد من معدل الاحتفاظ بالعملاء بنسبة تصل إلى 35%",
        "الإشعارات الفورية في تطبيقات الجوال تزيد من معدلات التفاعل بنسبة 88%",
        "تطبيقات الجوال تتيح لك الوصول إلى عملائك في أي وقت ومكان",
        "تطبيقات الهايبرد توفر ما يصل إلى 30% من تكاليف التطوير مقارنة بالتطبيقات الأصلية",

        // المتاجر الإلكترونية
        "المتاجر الإلكترونية تتيح لك الوصول إلى عملاء جدد وزيادة المبيعات على مدار 24 ساعة",
        "منصات التجارة الإلكترونية تقلل من تكاليف التشغيل بنسبة تصل إلى 50% مقارنة بالمتاجر التقليدية",
        "سلة شراء سهلة الاستخدام تقلل من معدل التخلي عنها بنسبة 35%",
        "خيارات دفع متعددة تزيد من معدلات إتمام عمليات الشراء بنسبة 30%",
        "برامج الولاء في المتاجر الإلكترونية تزيد من قيمة العميل مدى الحياة بنسبة 40%",

        // خدمات أخرى
        "تحليلات البيانات تساعدك على اتخاذ قرارات أفضل وتحسين استراتيجيات عملك",
        "الحماية من الهجمات الإلكترونية تحمي بيانات عملك وتعزز ثقة العملاء",
        "تطوير تطبيقات مخصصة يلبي احتياجات عملك الفريدة ويعزز كفاءة العمليات",
        "الاستثمار في التقنيات الحديثة يضعك في مقدمة المنافسين ويفتح أسواقاً جديدة",
        "الشراكة مع idiibi تضمن لك حلولاً متكاملة تناسب احتياجات عملك وميزانيتك",
        "الدعم الفني عن بعد يوفر ما يصل إلى 60% من تكاليف الصيانة التقليدية",
        "خدمات Google Workspace تزيد من إنتاجية فريق العمل بنسبة تصل إلى 20%"
    ];

    // Array of business tips in English
    const businessTipsEn = [
        // Web Design
        "A professional website increases customer trust in your brand by up to 75%",
        "Fast-loading websites reduce bounce rates by 40% and increase conversion rates",
        "Professional UX/UI design increases conversion rates by up to 200%",
        "Improving user experience reduces bounce rate and increases time spent on your site",
        "A mobile-responsive website reaches 67% of your target audience who browse on smartphones",
        "A website with consistent visual identity increases brand recall by 80%",
        "Web-standard compliant sites improve your search engine ranking by up to 50%",

        // Management Systems
        "CRM systems help increase sales by up to 29% and improve sales productivity by 34%",
        "Integrated POS systems reduce transaction time by 30% and improve customer experience",
        "System integration saves time and effort and reduces human error by up to 40%",
        "Administrative process automation saves up to 20 hours per week of team time",
        "Smart inventory management systems reduce storage costs by up to 25%",
        "HR management systems increase employee productivity by up to 27%",
        "Project management software improves on-time task completion rates by 44%",

        // Digital Marketing
        "Integrated digital marketing can increase conversion rates by up to 50%",
        "SEO can increase organic traffic to your site by up to 200%",
        "Social media marketing increases brand awareness and expands your customer base",
        "Email marketing automation can achieve an ROI of up to 4400%",
        "Targeted Google ad campaigns increase click-through rates by up to 300%",
        "An integrated content strategy increases organic traffic by 83%",
        "Video marketing increases product understanding by 74% and increases purchase likelihood",

        // Hosting Services
        "Reliable web hosting ensures 99.9% uptime for your site and improves loading speed",
        "Cloud hosting services save up to 30% compared to traditional infrastructure costs",
        "Managed WordPress hosting increases your site security and reduces hack risks by 95%",
        "Daily backups protect your data from loss and ensure business continuity",
        "Free SSL certificates increase customer trust and improve search engine ranking",
        "24/7 technical support ensures business continuity without interruption",

        // Mobile Apps
        "Mobile apps increase customer loyalty and open new marketing channels for your business",
        "Custom mobile apps increase customer retention rates by up to 35%",
        "Push notifications in mobile apps increase engagement rates by 88%",
        "Mobile apps allow you to reach your customers anytime, anywhere",
        "Hybrid apps save up to 30% in development costs compared to native apps",

        // E-commerce
        "E-commerce stores allow you to reach new customers and increase sales 24/7",
        "E-commerce platforms reduce operating costs by up to 50% compared to traditional stores",
        "User-friendly shopping carts reduce abandonment rates by 35%",
        "Multiple payment options increase checkout completion rates by 30%",
        "E-commerce loyalty programs increase customer lifetime value by 40%",

        // Other Services
        "Data analytics help you make better decisions and improve your business strategies",
        "Protection against cyber attacks protects your business data and enhances customer trust",
        "Custom application development meets your unique business needs and enhances operational efficiency",
        "Investing in modern technologies puts you ahead of competitors and opens new markets",
        "Partnering with idiibi ensures integrated solutions that suit your business needs and budget",
        "Remote technical support saves up to 60% compared to traditional maintenance costs",
        "Google Workspace services increase team productivity by up to 20%"
    ];

    // Function to show notification
    function showNotification(message) {
        console.log("Showing notification: " + message);

        // Check if the browser supports notifications
        if (!("Notification" in window)) {
            console.log("This browser does not support desktop notifications");
            // Fallback to in-app notification
            showInAppNotification(message);
            return;
        }

        // Check if permission is already granted
        if (Notification.permission === "granted") {
            createNotification(message);
        }
        // Otherwise, request permission
        else if (Notification.permission !== "denied") {
            Notification.requestPermission().then(function (permission) {
                if (permission === "granted") {
                    createNotification(message);
                } else {
                    // Fallback to in-app notification
                    showInAppNotification(message);
                }
            });
        } else {
            // Permission denied, show in-app notification
            showInAppNotification(message);
        }
    }

    // Function to create notification
    function createNotification(message) {
        // Create notification based on device
        if ("Notification" in window) {
            // Get notification title based on language
            const title = document.documentElement.lang === 'ar' ? "نصيحة من idiibi" : "Tip from idiibi";

            // Check if we're in English folder
            const isEnglish = window.location.pathname.includes('/en/');

            // Create options for notification
            const options = {
                body: message,
                icon: isEnglish ? "../icons/icon-192x192.png" : "icons/icon-192x192.png",
                badge: isEnglish ? "../icons/icon-72x72.png" : "icons/icon-72x72.png",
                vibrate: [100, 50, 100],
                tag: "business-tip",
                renotify: true,
                requireInteraction: true, // Keep notification until user interacts with it
                actions: [
                    {
                        action: 'explore',
                        title: document.documentElement.lang === 'ar' ? 'استكشف خدماتنا' : 'Explore Our Services'
                    }
                ]
            };

            // Desktop notification
            const notification = new Notification(title, options);

            // Close notification after 15 seconds if user doesn't interact
            setTimeout(() => {
                notification.close();
            }, 15000);

            // Handle notification click
            notification.onclick = function(event) {
                // If the action button was clicked
                if (event.action === 'explore') {
                    // Redirect to services page
                    const isEnglish = window.location.pathname.includes('/en/');
                    if (isEnglish) {
                        window.location.href = 'services.html';
                    } else {
                        window.location.href = document.documentElement.lang === 'ar' ? 'services.html' : 'en/services.html';
                    }
                } else {
                    // Just focus the window
                    window.focus();
                }
                notification.close();
            };
        } else {
            // Fallback for browsers/devices without notification support
            showInAppNotification(message);
        }
    }

    // Function to show in-app notification
    function showInAppNotification(message) {
        // Check if notification container already exists
        let notificationContainer = document.getElementById('in-app-notification');

        // If not, create it
        if (!notificationContainer) {
            notificationContainer = document.createElement('div');
            notificationContainer.id = 'in-app-notification';
            notificationContainer.style.position = 'fixed';
            notificationContainer.style.bottom = '80px';
            notificationContainer.style.right = document.documentElement.lang === 'ar' ? '20px' : 'auto';
            notificationContainer.style.left = document.documentElement.lang === 'ar' ? 'auto' : '20px';
            notificationContainer.style.backgroundColor = '#038387';
            notificationContainer.style.color = 'white';
            notificationContainer.style.padding = '15px 20px';
            notificationContainer.style.borderRadius = '10px';
            notificationContainer.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
            notificationContainer.style.zIndex = '9999';
            notificationContainer.style.maxWidth = '350px';
            notificationContainer.style.fontWeight = '500';
            notificationContainer.style.transform = 'translateY(100px)';
            notificationContainer.style.opacity = '0';
            notificationContainer.style.transition = 'all 0.3s ease-out';
            notificationContainer.style.direction = document.documentElement.lang === 'ar' ? 'rtl' : 'ltr';
            notificationContainer.style.textAlign = document.documentElement.lang === 'ar' ? 'right' : 'left';

            // Add close button
            const closeButton = document.createElement('button');
            closeButton.innerHTML = '×';
            closeButton.style.position = 'absolute';
            closeButton.style.top = '5px';
            closeButton.style.right = document.documentElement.lang === 'ar' ? 'auto' : '5px';
            closeButton.style.left = document.documentElement.lang === 'ar' ? '5px' : 'auto';
            closeButton.style.background = 'none';
            closeButton.style.border = 'none';
            closeButton.style.color = 'white';
            closeButton.style.fontSize = '20px';
            closeButton.style.cursor = 'pointer';
            closeButton.style.padding = '0 5px';

            closeButton.onclick = function() {
                hideInAppNotification();
            };

            notificationContainer.appendChild(closeButton);

            // Add content container
            const contentContainer = document.createElement('div');
            contentContainer.style.marginTop = '5px';
            contentContainer.style.marginBottom = '15px';
            notificationContainer.appendChild(contentContainer);

            // Add to document
            document.body.appendChild(notificationContainer);
        }

        // Update notification content
        const contentContainer = notificationContainer.querySelector('div');

        // Create the header
        const header = document.createElement('div');
        header.style.display = 'flex';
        header.style.alignItems = 'center';
        header.style.marginBottom = '10px';

        const icon = document.createElement('img');
        // Check if we're in English folder
        const isEnglish = window.location.pathname.includes('/en/');
        icon.src = isEnglish ? '../icons/icon-72x72.png' : 'icons/icon-72x72.png';
        icon.alt = 'idiibi';
        icon.style.width = '24px';
        icon.style.height = '24px';
        icon.style.marginRight = document.documentElement.lang === 'ar' ? '0' : '10px';
        icon.style.marginLeft = document.documentElement.lang === 'ar' ? '10px' : '0';

        const title = document.createElement('strong');
        title.textContent = document.documentElement.lang === 'ar' ? 'نصيحة من idiibi' : 'Tip from idiibi';

        header.appendChild(icon);
        header.appendChild(title);

        // Create the message content
        const messageContent = document.createElement('div');
        messageContent.textContent = message;
        messageContent.style.marginBottom = '15px';

        // Create the action button
        const actionButton = document.createElement('button');
        actionButton.textContent = document.documentElement.lang === 'ar' ? 'استكشف خدماتنا' : 'Explore Our Services';
        actionButton.style.backgroundColor = 'white';
        actionButton.style.color = '#038387';
        actionButton.style.border = 'none';
        actionButton.style.borderRadius = '5px';
        actionButton.style.padding = '8px 12px';
        actionButton.style.cursor = 'pointer';
        actionButton.style.fontWeight = 'bold';
        actionButton.style.fontSize = '14px';
        actionButton.style.transition = 'all 0.2s ease';
        actionButton.style.display = 'block';
        actionButton.style.width = '100%';
        actionButton.style.textAlign = 'center';

        // Add hover effect
        actionButton.onmouseover = function() {
            this.style.backgroundColor = '#f0f0f0';
        };
        actionButton.onmouseout = function() {
            this.style.backgroundColor = 'white';
        };

        // Add click event
        actionButton.onclick = function() {
            const isEnglish = window.location.pathname.includes('/en/');
            if (isEnglish) {
                window.location.href = 'services.html';
            } else {
                window.location.href = document.documentElement.lang === 'ar' ? 'services.html' : 'en/services.html';
            }
            hideInAppNotification();
        };

        // Clear previous content and add new elements
        contentContainer.innerHTML = '';
        contentContainer.appendChild(header);
        contentContainer.appendChild(messageContent);
        contentContainer.appendChild(actionButton);

        // Show notification with animation
        setTimeout(() => {
            notificationContainer.style.transform = 'translateY(0)';
            notificationContainer.style.opacity = '1';
        }, 100);

        // Hide notification after 15 seconds
        setTimeout(hideInAppNotification, 15000);
    }

    // Function to hide in-app notification
    function hideInAppNotification() {
        const notificationContainer = document.getElementById('in-app-notification');
        if (notificationContainer) {
            notificationContainer.style.transform = 'translateY(100px)';
            notificationContainer.style.opacity = '0';

            // Remove from DOM after animation completes
            setTimeout(() => {
                if (notificationContainer.parentNode) {
                    notificationContainer.parentNode.removeChild(notificationContainer);
                }
            }, 300);
        }
    }

    // Function to show random tip
    function showRandomTip() {
        const tips = document.documentElement.lang === 'ar' ? businessTipsAr : businessTipsEn;

        // Get previously shown tips from localStorage
        let shownTips = JSON.parse(localStorage.getItem('idiibi_shown_tips') || '[]');

        // If all tips have been shown, reset the list
        if (shownTips.length >= tips.length - 1) {
            shownTips = [];
        }

        // Filter out tips that have already been shown
        const availableTips = tips.filter((_, index) => !shownTips.includes(index));

        // Select a random tip from available tips
        const randomIndex = Math.floor(Math.random() * availableTips.length);
        const tip = availableTips[randomIndex];

        // Find the original index of this tip
        const originalIndex = tips.indexOf(tip);

        // Add this tip to shown tips
        shownTips.push(originalIndex);
        localStorage.setItem('idiibi_shown_tips', JSON.stringify(shownTips));

        // Show notification if page is visible
        if (document.visibilityState === 'visible') {
            showNotification(tip);
        }
    }

    // Check if notification permission is already granted
    if (Notification.permission === "granted") {
        // Show tip after 5 seconds (give page time to load)
        setTimeout(showRandomTip, 5000);
    }
    // We won't show the permission button as the Service Worker already handles this
    // Instead, we'll just show in-app notifications for users who haven't granted permission
    else {
        // Show in-app notification after 10 seconds
        setTimeout(() => {
            const tips = document.documentElement.lang === 'ar' ? businessTipsAr : businessTipsEn;
            const randomIndex = Math.floor(Math.random() * tips.length);
            showInAppNotification(tips[randomIndex]);
        }, 10000);
    }

    // Show tip when page is loaded (if permission is granted)
    // We'll show a tip on every page load for simplicity
    window.addEventListener('load', function() {
        console.log("Page loaded, checking notification permission");
        if (Notification.permission === "granted") {
            console.log("Notification permission granted, showing tip after delay");
            // Show a tip after a short delay
            setTimeout(showRandomTip, 3000);
        } else {
            console.log("Notification permission not granted: " + Notification.permission);
        }
    });
});
