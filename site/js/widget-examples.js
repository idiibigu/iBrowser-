/**
 * أمثلة على استخدام ملف الويدجيت
 * يمكن استخدام هذه الأمثلة كمرجع لإضافة سكريبتات مختلفة
 */

// انتظر حتى يتم تحميل DOM بالكامل
document.addEventListener('DOMContentLoaded', function() {
    // التأكد من وجود كائن idiibiWidgets
    if (window.idiibiWidgets) {
        
        // مثال 1: إضافة سكريبت Google Analytics
        /*
        idiibiWidgets.addStats({
            type: 'external',
            src: 'https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX',
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
                gtag('config', 'G-XXXXXXXXXX');
            `
        });
        */
        
        // مثال 2: إضافة سكريبت Facebook Pixel
        /*
        idiibiWidgets.addTracking({
            type: 'inline',
            content: `
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', 'XXXXXXXXXXXXXXXXX');
                fbq('track', 'PageView');
            `
        });
        */
        
        // مثال 3: إضافة سكريبت Hotjar
        /*
        idiibiWidgets.addCustomScript({
            type: 'inline',
            content: `
                (function(h,o,t,j,a,r){
                    h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
                    h._hjSettings={hjid:XXXXXXX,hjsv:6};
                    a=o.getElementsByTagName('head')[0];
                    r=o.createElement('script');r.async=1;
                    r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
                    a.appendChild(r);
                })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
            `
        });
        */
        
        // مثال 4: إضافة سكريبت Tawk.to للدردشة المباشرة
        /*
        idiibiWidgets.addCustomScript({
            type: 'inline',
            content: `
                var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
                (function(){
                    var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
                    s1.async=true;
                    s1.src='https://embed.tawk.to/XXXXXXXXXXXXXXXXXXXXXXXXXX/default';
                    s1.charset='UTF-8';
                    s1.setAttribute('crossorigin','*');
                    s0.parentNode.insertBefore(s1,s0);
                })();
            `
        });
        */
        
        // مثال 5: إضافة سكريبت Google Tag Manager
        /*
        idiibiWidgets.addCustomScript({
            type: 'inline',
            content: `
                (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','GTM-XXXXXXX');
            `
        });
        */
        
        // مثال 6: إضافة سكريبت Microsoft Clarity
        /*
        idiibiWidgets.addCustomScript({
            type: 'inline',
            content: `
                (function(c,l,a,r,i,t,y){
                    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
                })(window, document, "clarity", "script", "XXXXXXXXXX");
            `
        });
        */
        
        // مثال 7: إضافة سكريبت LinkedIn Insight Tag
        /*
        idiibiWidgets.addTracking({
            type: 'inline',
            content: `
                _linkedin_partner_id = "XXXXXXX";
                window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
                window._linkedin_data_partner_ids.push(_linkedin_partner_id);
                (function(l) {
                    if (!l){window.lintrk = function(a,b){window.lintrk.q.push([a,b])};
                    window.lintrk.q=[]}
                    var s = document.getElementsByTagName("script")[0];
                    var b = document.createElement("script");
                    b.type = "text/javascript";b.async = true;
                    b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
                    s.parentNode.insertBefore(b, s);
                })(window.lintrk);
            `
        });
        */
        
        // مثال 8: إضافة سكريبت Twitter Pixel
        /*
        idiibiWidgets.addTracking({
            type: 'inline',
            content: `
                !function(e,t,n,s,u,a){e.twq||(s=e.twq=function(){s.exe?s.exe.apply(s,arguments):s.queue.push(arguments);
                },s.version='1.1',s.queue=[],u=t.createElement(n),u.async=!0,u.src='https://static.ads-twitter.com/uwt.js',
                a=t.getElementsByTagName(n)[0],a.parentNode.insertBefore(u,a))}(window,document,'script');
                twq('init','XXXXXXXXXX');
                twq('track','PageView');
            `
        });
        */
        
        // مثال 9: إضافة سكريبت Snapchat Pixel
        /*
        idiibiWidgets.addTracking({
            type: 'inline',
            content: `
                (function(e,t,n){if(e.snaptr)return;var a=e.snaptr=function()
                {a.handleRequest?a.handleRequest.apply(a,arguments):a.queue.push(arguments)};
                a.queue=[];var s='script';r=t.createElement(s);r.async=!0;
                r.src=n;var c=t.getElementsByTagName(s)[0];
                c.parentNode.insertBefore(r,c);})(window,document,
                'https://sc-static.net/scevent.min.js');
                snaptr('init', 'XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX', {
                    'user_email': '__INSERT_USER_EMAIL__'
                });
                snaptr('track', 'PAGE_VIEW');
            `
        });
        */
        
        // مثال 10: إضافة سكريبت TikTok Pixel
        /*
        idiibiWidgets.addTracking({
            type: 'inline',
            content: `
                !function (w, d, t) {
                    w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
                    ttq.load('XXXXXXXXXXXXXXXXX');
                    ttq.page();
                }(window, document, 'ttq');
            `
        });
        */
    }
});
