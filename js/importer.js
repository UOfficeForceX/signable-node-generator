// 讀取檔案或貼上文字，解析並驗證匯入 JSON

function openImportModal() {
  document.getElementById('importFileInput').value = '';
  document.getElementById('importTextInput').value = '';
  document.getElementById('importErrors').innerHTML = '';
  const modalEl = document.getElementById('importModal');
  bootstrap.Modal.getOrCreateInstance(modalEl).show();
}

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

async function handleImportConfirm() {
  const fileInput = document.getElementById('importFileInput');
  const textInput = document.getElementById('importTextInput');

  let rawText = '';
  try {
    if (fileInput.files && fileInput.files.length > 0) {
      rawText = await readFileAsText(fileInput.files[0]);
    } else {
      rawText = textInput.value;
    }
  } catch (err) {
    showImportErrors(['讀取檔案失敗，請重新選擇檔案。']);
    return;
  }

  if (!rawText || !rawText.trim()) {
    showImportErrors(['請選擇 .json 檔案或貼上 JSON 文字。']);
    return;
  }

  let data;
  try {
    data = JSON.parse(rawText);
  } catch (err) {
    showImportErrors([`JSON 格式錯誤，無法解析：${err.message}`]);
    return;
  }

  const rootErrors = validateRoot(data);
  if (rootErrors.length > 0) {
    showImportErrors(rootErrors.map((e) => e.message));
    return;
  }

  const nodeErrors = [];
  data.signableNodes.forEach((node, idx) => {
    nodeErrors.push(...validateNode(node, idx));
  });
  if (nodeErrors.length > 0) {
    showImportErrors(nodeErrors.map((e) => e.message));
    return;
  }

  appState.signableNodes = data.signableNodes.map(hydrateImportedNode);
  appState.selectedNodeIndex = appState.signableNodes.length > 0 ? 0 : null;
  renderAll();

  bootstrap.Modal.getOrCreateInstance(document.getElementById('importModal')).hide();
  showToast('匯入成功。');
}

function hydrateImportedNode(rawNode) {
  const node = deepClone(rawNode);
  node._uid = generateUid();
  const hasDeptSignType = !!(node.approverSetting && node.approverSetting.field && node.approverSetting.field.signType != null);
  node._ui = { approverFieldKind: hasDeptSignType ? 'dept' : 'person' };
  return node;
}

function showImportErrors(messages) {
  const container = document.getElementById('importErrors');
  container.innerHTML = `<ul class="mb-0 ps-3">${messages.map((m) => `<li>${escapeHtml(m)}</li>`).join('')}</ul>`;
}
