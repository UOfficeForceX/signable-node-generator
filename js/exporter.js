// 下載 JSON、複製 JSON 到剪貼簿

function downloadJson() {
  const data = generateOutputJson();
  const result = validateExportData(data);
  renderValidationMessages();
  if (!result.valid) {
    showToast('匯出失敗，請修正驗證錯誤後再試一次。', true);
    return;
  }

  const jsonText = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonText], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = EXPORT_FILENAME;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('已下載 JSON 檔案。');
}

async function copyJsonToClipboard() {
  const data = generateOutputJson();
  const result = validateExportData(data);
  renderValidationMessages();
  if (!result.valid) {
    showToast('複製失敗，請修正驗證錯誤後再試一次。', true);
    return;
  }

  const jsonText = JSON.stringify(data, null, 2);
  try {
    if (!navigator.clipboard || !navigator.clipboard.writeText) {
      throw new Error('Clipboard API 不可用');
    }
    await navigator.clipboard.writeText(jsonText);
    showToast('已複製 JSON 到剪貼簿。');
  } catch (err) {
    const pre = document.getElementById('jsonPreview');
    const range = document.createRange();
    range.selectNodeContents(pre);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    showToast('無法自動複製，已為您選取內容，請按 Ctrl+C 複製。', true);
  }
}

function showToast(message, isError) {
  const container = document.getElementById('toastContainer');
  const toastEl = document.createElement('div');
  toastEl.className = `toast align-items-center text-bg-${isError ? 'danger' : 'success'} border-0`;
  toastEl.setAttribute('role', 'alert');
  toastEl.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">${escapeHtml(message)}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>`;
  container.appendChild(toastEl);
  const toast = new bootstrap.Toast(toastEl, { delay: 2500 });
  toast.show();
  toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
}
