/**
 * ملف ويدجيت لوضع اسكريبتات الإضافات
 * يتم تضمين هذا الملف في جميع صفحات الموقع
 * يمكن إضافة أي سكريبت هنا وسيتم تنفيذه في جميع الصفحات
 */

// تنفيذ الكود عند اكتمال تحميل DOM
document.addEventListener('DOMContentLoaded', function() {
    // كائن لتخزين جميع الويدجيت
    const idiibiWidgets = {
        // مصفوفة لتخزين الإحصائيات
        stats: [],
        
        // مصفوفة لتخزين سكريبتات التتبع
        trackingScripts: [],
        
        // مصفوفة لتخزين سكريبتات الإعلانات
        adScripts: [],
        
        // دالة لإضافة سكريبت إحصائيات
        addStats: function(scriptObj) {
            this.stats.push(scriptObj);
            this.injectScript(scriptObj);
        },
        
        // دالة لإضافة سكريبت تتبع
        addTracking: function(scriptObj) {
            this.trackingScripts.push(scriptObj);
            this.injectScript(scriptObj);
        },
        
        // دالة لإضافة سكريبت إعلانات
        addAd: function(scriptObj) {
            this.adScripts.push(scriptObj);
            this.injectScript(scriptObj);
        },
        
        // دالة لإضافة سكريبت مخصص
        addCustomScript: function(scriptObj) {
            this.injectScript(scriptObj);
        },
        
        // دالة لحقن السكريبت في الصفحة
        injectScript: function(scriptObj) {
            // التحقق من نوع السكريبت
            if (scriptObj.type === 'inline') {
                // إنشاء عنصر سكريبت جديد
                const script = document.createElement('script');
                script.textContent = scriptObj.content;
                
                // إضافة السمات إذا كانت موجودة
                if (scriptObj.attributes) {
                    for (const attr in scriptObj.attributes) {
                        script.setAttribute(attr, scriptObj.attributes[attr]);
                    }
                }
                
                // إضافة السكريبت إلى الهيدر
                document.head.appendChild(script);
            } else if (scriptObj.type === 'external') {
                // إنشاء عنصر سكريبت جديد
                const script = document.createElement('script');
                script.src = scriptObj.src;
                
                // إضافة السمات إذا كانت موجودة
                if (scriptObj.attributes) {
                    for (const attr in scriptObj.attributes) {
                        script.setAttribute(attr, scriptObj.attributes[attr]);
                    }
                }
                
                // إضافة السكريبت إلى الهيدر
                document.head.appendChild(script);
            } else if (scriptObj.type === 'meta') {
                // إنشاء عنصر ميتا جديد
                const meta = document.createElement('meta');
                
                // إضافة السمات
                for (const attr in scriptObj.attributes) {
                    meta.setAttribute(attr, scriptObj.attributes[attr]);
                }
                
                // إضافة الميتا إلى الهيدر
                document.head.appendChild(meta);
            }
        }
    };
    
    // تعريف الكائن عالمياً ليكون متاحاً للاستخدام من أي مكان
    window.idiibiWidgets = idiibiWidgets;
    
    // مثال على إضافة سكريبت إحصائيات (يمكن تعديله أو إزالته)
    /*
    idiibiWidgets.addStats({
        type: 'external',
        src: 'https://www.googletagmanager.com/gtag/js?id=YOUR-ID',
        attributes: {
            async: true
        }
    });
    
    idiibiWidgets.addStats({
        type: 'inline',
        content: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'YOUR-ID');
        `
    });
    */
    
    // مثال على إضافة سكريبت مخصص (يمكن تعديله أو إزالته)
    /*
    idiibiWidgets.addCustomScript({
        type: 'inline',
        content: `
            console.log('تم تحميل سكريبت مخصص');
        `
    });
    */
});

/**
 * دالة لإضافة سكريبت من خارج هذا الملف
 * يمكن استدعاؤها من أي مكان في الموقع
 * @param {Object} scriptObj - كائن يحتوي على معلومات السكريبت
 * @param {string} category - فئة السكريبت (stats, tracking, ad, custom)
 */
function addWidgetScript(scriptObj, category = 'custom') {
    // التأكد من وجود كائن idiibiWidgets
    if (window.idiibiWidgets) {
        switch(category) {
            case 'stats':
                window.idiibiWidgets.addStats(scriptObj);
                break;
            case 'tracking':
                window.idiibiWidgets.addTracking(scriptObj);
                break;
            case 'ad':
                window.idiibiWidgets.addAd(scriptObj);
                break;
            default:
                window.idiibiWidgets.addCustomScript(scriptObj);
        }
    } else {
        // إذا لم يكن الكائن موجوداً، قم بإضافة السكريبت إلى قائمة الانتظار
        document.addEventListener('DOMContentLoaded', function() {
            if (window.idiibiWidgets) {
                switch(category) {
                    case 'stats':
                        window.idiibiWidgets.addStats(scriptObj);
                        break;
                    case 'tracking':
                        window.idiibiWidgets.addTracking(scriptObj);
                        break;
                    case 'ad':
                        window.idiibiWidgets.addAd(scriptObj);
                        break;
                    default:
                        window.idiibiWidgets.addCustomScript(scriptObj);
                }
            }
        });
    }
}
