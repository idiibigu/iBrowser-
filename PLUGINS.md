# دليل إضافات iBrowser (Plugins / Modules)

iBrowser مفتوح المصدر ويدعم نظام إضافات خفيف الوزن يتيح لأي مطوّر إضافة أزرار،
وظائف، وتكاملات جديدة دون الحاجة لتعديل الكود الأساسي للمتصفح.

> **ملاحظة أمان:** الإضافات تعمل داخل سياق واجهة المستخدم للتطبيق (نفس صفحة
> `index.html`) وليست معزولة (sandboxed) كإضافات المتصفحات التقليدية (Chrome
> Extensions). ثبّت فقط إضافات تثق بمصدرها.

## هيكل الإضافة

كل إضافة عبارة عن مجلد يحتوي على:

```
my-plugin/
├── plugin.json   # البيانات الوصفية
└── index.js      # كود الإضافة
```

### `plugin.json`

```json
{
  "id": "my-plugin",
  "name": "اسم الإضافة",
  "version": "1.0.0",
  "description": "وصف مختصر لما تفعله الإضافة",
  "author": "اسمك",
  "icon": "fa-star",
  "main": "index.js"
}
```

| الحقل | إلزامي | الوصف |
|---|---|---|
| `id` | نعم | معرّف فريد (يُستخدم كمفتاح للتخزين والتفعيل/التعطيل) |
| `main` | نعم | اسم ملف JS الذي سيتم تحميله (نسبي لمجلد الإضافة) |
| `name`, `description`, `author`, `version`, `icon` | لا | تُعرض في صفحة الإعدادات > الإضافات. `icon` هو اسم أيقونة من [Font Awesome](https://fontawesome.com/icons) (بدون بادئة `fa-solid`, فقط مثل `fa-note-sticky`) |

### `index.js`

يجب أن يستدعي الإضافةُ الدالةَ العامة `IBrowserPlugins.register`:

```js
IBrowserPlugins.register('my-plugin', (api) => {
  api.addToolbarButton({
    icon: 'fa-star',
    title: 'وظيفتي',
    onClick: () => {
      api.notify('تم الضغط على الزر!');
    }
  });
});
```

## واجهة برمجة التطبيقات (Plugin API)

الكائن `api` الممرَّر إلى `register()` يوفر:

- **`api.addToolbarButton({ icon, title, onClick })`** — يضيف زرًا في شريط
  أدوات الإضافات بجانب زر الذكاء الاصطناعي والقائمة.
- **`api.storage.get(key, fallback)`** / **`api.storage.set(key, value)`** —
  تخزين دائم خاص بالإضافة (مبني على مخزن إعدادات iBrowser)، غير مشترك مع
  إضافات أخرى.
- **`api.notify(message)`** — يعرض إشعارًا داخل التطبيق.
- **`api.getActiveTabUrl()`** — يعيد رابط التبويب النشط حاليًا.
- **`api.onNavigate(callback)`** — يستدعي `callback(url)` عند كل تنقل ناجح في
  التبويب النشط.

## أين توضع الإضافات؟

- **إضافات مدمجة** تأتي مع التطبيق داخل `src/plugins/` (مثال: `quick-notes`).
- **إضافات المستخدم** توضع في مجلد بيانات التطبيق:
  - Windows: `%APPDATA%/iBrowser/plugins/`
  - macOS: `~/Library/Application Support/iBrowser/plugins/`
  - Linux: `~/.config/iBrowser/plugins/`

  يمكن فتح هذا المجلد مباشرة من **الإعدادات > الإضافات > فتح مجلد الإضافات**.

## التفعيل والتعطيل

من **الإعدادات > الإضافات** يمكنك تفعيل/تعطيل أي إضافة مثبتة. تُحفظ حالة
كل إضافة في مخزن إعدادات iBrowser، وتحتاج الإضافة إلى إعادة تشغيل التطبيق
لتُحمَّل بعد تفعيلها لأول مرة.

## مثال كامل

راجع `src/plugins/quick-notes/` كمثال عملي كامل (زر شريط أدوات + تخزين دائم).
