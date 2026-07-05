// 綁定表單事件，將輸入值同步到 state
// 規則：
// - 文字類輸入（input/textarea）使用 'input' 事件，只更新 state，不重繪整個編輯表單，避免輸入焦點被打斷。
// - checkbox / radio / select 使用 'change' 事件，更新 state 後重新渲染整個畫面（可能改變欄位顯示/隱藏）。
// - 按鈕（新增/刪除 custom、欄位權限）使用 'click' 事件，更新 state 後重新渲染整個畫面。

function initFormBinder() {
  const editor = document.getElementById('editorContainer');
  editor.addEventListener('input', handleEditorInput);
  editor.addEventListener('change', handleEditorChange);
  editor.addEventListener('click', handleEditorClick);
}

function handleEditorInput(e) {
  const el = e.target;
  const isTextLike = el.matches('input[type="text"][data-path], textarea[data-path]');
  if (!isTextLike) return;

  const node = getSelectedNode();
  if (!node) return;

  let value = el.value;
  if (el.dataset.nullIfEmpty === 'true' && value.trim() === '') {
    value = null;
  }
  setPath(node, el.dataset.path, value);

  renderSiteList();
  renderJsonPreview();
  renderValidationMessages();
}

function handleEditorChange(e) {
  const el = e.target;
  const node = getSelectedNode();
  if (!node) return;

  if (el.matches('[data-role="user-type-checkbox"]')) {
    toggleUserType(node, el.dataset.value);
    renderAll();
    return;
  }

  if (el.matches('[data-role="field-kind"]')) {
    setApproverFieldKind(node, el.value);
    renderAll();
    return;
  }

  if (el.matches('[data-role="branch-type"]')) {
    const branchSetting = getPath(node, el.dataset.branchPath);
    const typeKey = el.dataset.typeKey;
    branchSetting[typeKey] = parseInt(el.value, 10);
    if (branchSetting[typeKey] === 2) {
      if (!Array.isArray(branchSetting.custom)) branchSetting.custom = [];
    } else {
      branchSetting.custom = null;
    }
    renderAll();
    return;
  }

  if (el.matches('[data-role="allow-type"]')) {
    const target = getPath(node, el.dataset.targetPath);
    target.allowType = parseInt(el.value, 10);
    if (target.allowType === 1) {
      if (!Array.isArray(target.custom)) target.custom = [];
    } else {
      target.custom = null;
    }
    renderAll();
    return;
  }

  if (el.matches('[data-role="custom-item-type"]')) {
    const arr = getPath(node, el.dataset.target);
    const idx = parseInt(el.dataset.index, 10);
    setCustomItemType(arr[idx], parseInt(el.value, 10));
    renderAll();
    return;
  }

  if (el.matches('input[type="checkbox"][data-path]')) {
    setPath(node, el.dataset.path, el.checked);
    renderAll();
    return;
  }

  if (el.matches('input[type="radio"][data-path]')) {
    const value = el.dataset.type === 'int' ? parseInt(el.value, 10) : el.value;
    setPath(node, el.dataset.path, value);
    renderAll();
    return;
  }

  if (el.matches('select[data-path]')) {
    let value = el.value;
    if (el.dataset.type === 'int') value = value === '' ? null : parseInt(value, 10);
    setPath(node, el.dataset.path, value);
    renderAll();
  }
}

function handleEditorClick(e) {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const node = getSelectedNode();
  if (!node) return;
  const action = btn.dataset.action;

  if (action === 'add-custom') {
    const arr = getPath(node, btn.dataset.target);
    addCustomItem(arr);
    renderAll();
  } else if (action === 'remove-custom') {
    const arr = getPath(node, btn.dataset.target);
    removeCustomItem(arr, parseInt(btn.dataset.index, 10));
    renderAll();
  } else if (action === 'add-field-permission') {
    addFieldPermission(node);
    renderAll();
  } else if (action === 'remove-field-permission') {
    removeFieldPermission(node, parseInt(btn.dataset.index, 10));
    renderAll();
  }
}
