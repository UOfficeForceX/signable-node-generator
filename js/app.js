// 應用程式初始化、事件註冊

document.addEventListener('DOMContentLoaded', () => {
  initState();
  initFormBinder();
  initSiteListEvents();
  initDragDrop();
  initLayoutResizer();
  initTopLevelButtons();
  renderAll();
});

function initSiteListEvents() {
  const container = document.getElementById('siteList');
  container.addEventListener('click', (e) => {
    const target = e.target.closest('[data-action]');
    if (!target) return;
    const action = target.dataset.action;
    const index = parseInt(target.dataset.index, 10);

    if (action === 'select-node') {
      selectNode(index);
      renderAll();
    } else if (action === 'move-up') {
      moveNodeUp(index);
      renderAll();
    } else if (action === 'move-down') {
      moveNodeDown(index);
      renderAll();
    } else if (action === 'duplicate-node') {
      duplicateNode(index);
      renderAll();
    } else if (action === 'delete-node') {
      if (window.confirm('確定要刪除這個站點嗎？')) {
        deleteNode(index);
        renderAll();
      }
    }
  });
}

function initTopLevelButtons() {
  document.getElementById('btnAddNode').addEventListener('click', () => {
    addNode();
    renderAll();
  });
  document.getElementById('btnImport').addEventListener('click', openImportModal);
  document.getElementById('btnConfirmImport').addEventListener('click', handleImportConfirm);
  document.getElementById('btnExportJson').addEventListener('click', downloadJson);
  document.getElementById('btnCopyJson').addEventListener('click', copyJsonToClipboard);
  document.getElementById('btnClosePreview').addEventListener('click', closeJsonPreview);
  document.getElementById('btnOpenPreview').addEventListener('click', openJsonPreview);
}
