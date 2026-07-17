// Example iBrowser plugin: a tiny persistent notepad.
// Demonstrates: toolbar buttons, scoped storage, and notify().
IBrowserPlugins.register('quick-notes', (api) => {
  const STORAGE_KEY = 'note';

  api.addToolbarButton({
    icon: 'fa-note-sticky',
    title: 'ملاحظات سريعة',
    onClick: async () => {
      const current = (await api.storage.get(STORAGE_KEY, '')) || '';
      const next = prompt('ملاحظتك السريعة:', current);
      if (next === null) return;
      await api.storage.set(STORAGE_KEY, next);
      api.notify(next ? 'تم حفظ الملاحظة' : 'تم مسح الملاحظة');
    }
  });
});
