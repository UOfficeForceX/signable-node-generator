// 整合 SortableJS 實作站點排序；若 CDN 載入失敗則保留左欄的上移/下移按鈕作為備援。

function initDragDrop() {
  const container = document.getElementById('siteList');
  if (typeof Sortable === 'undefined') {
    console.warn('SortableJS 未載入，改用上移 / 下移按鈕作為排序備援。');
    return;
  }
  Sortable.create(container, {
    animation: 150,
    handle: '.drag-handle',
    onEnd(evt) {
      if (evt.oldIndex === evt.newIndex || evt.oldIndex == null || evt.newIndex == null) return;
      reorderNodes(evt.oldIndex, evt.newIndex);
      renderAll();
    }
  });
}
