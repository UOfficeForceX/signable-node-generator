// 三欄寬度拖拉調整、JSON 預覽關閉與重新開啟

function updateGridTemplate() {
  const appLayout = document.getElementById('appLayout');
  const colRight = document.getElementById('colRight');
  const resizerRight = document.getElementById('resizerRight');
  const { leftWidth, middleWidth, rightWidth, jsonPreviewVisible } = appState.layout;

  if (jsonPreviewVisible) {
    appLayout.style.gridTemplateColumns = `${leftWidth}% 6px ${middleWidth}% 6px ${rightWidth}%`;
    colRight.style.display = '';
    resizerRight.style.display = '';
  } else {
    appLayout.style.gridTemplateColumns = `${leftWidth}% 6px ${middleWidth}%`;
    colRight.style.display = 'none';
    resizerRight.style.display = 'none';
  }
}

function closeJsonPreview() {
  appState.layout.lastLeftWidth = appState.layout.leftWidth;
  appState.layout.lastMiddleWidth = appState.layout.middleWidth;
  appState.layout.lastRightWidth = appState.layout.rightWidth;

  appState.layout.jsonPreviewVisible = false;
  appState.layout.leftWidth = DEFAULT_LAYOUT_COLLAPSED.leftWidth;
  appState.layout.middleWidth = DEFAULT_LAYOUT_COLLAPSED.middleWidth;

  updateGridTemplate();
  document.getElementById('btnOpenPreview').classList.remove('d-none');
}

function openJsonPreview() {
  appState.layout.jsonPreviewVisible = true;
  appState.layout.leftWidth = appState.layout.lastLeftWidth || DEFAULT_LAYOUT.leftWidth;
  appState.layout.middleWidth = appState.layout.lastMiddleWidth || DEFAULT_LAYOUT.middleWidth;
  appState.layout.rightWidth = appState.layout.lastRightWidth || DEFAULT_LAYOUT.rightWidth;

  updateGridTemplate();
  document.getElementById('btnOpenPreview').classList.add('d-none');
  renderJsonPreview();
  renderValidationMessages();
}

function initLayoutResizer() {
  updateGridTemplate();
  bindResizer(document.getElementById('resizerLeft'), 'left');
  bindResizer(document.getElementById('resizerRight'), 'right');
}

function bindResizer(resizerEl, side) {
  let dragging = false;

  resizerEl.addEventListener('mousedown', (e) => {
    dragging = true;
    resizerEl.classList.add('active');
    e.preventDefault();
  });

  window.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    handleResize(side, e.clientX);
  });

  window.addEventListener('mouseup', () => {
    if (dragging) {
      dragging = false;
      resizerEl.classList.remove('active');
    }
  });
}

function handleResize(side, clientX) {
  const appLayout = document.getElementById('appLayout');
  const rect = appLayout.getBoundingClientRect();
  const totalPx = rect.width;
  if (!totalPx) return;

  const minLeftPct = (MIN_WIDTH_PX.left / totalPx) * 100;
  const minMiddlePct = (MIN_WIDTH_PX.middle / totalPx) * 100;
  const minRightPct = (MIN_WIDTH_PX.right / totalPx) * 100;

  if (side === 'left') {
    let leftPct = ((clientX - rect.left) / totalPx) * 100;
    const rightPct = appState.layout.jsonPreviewVisible ? appState.layout.rightWidth : 0;
    const maxLeftPct = 100 - rightPct - minMiddlePct;
    leftPct = Math.max(minLeftPct, Math.min(leftPct, maxLeftPct));
    appState.layout.leftWidth = leftPct;
    appState.layout.middleWidth = 100 - leftPct - rightPct;
  } else {
    if (!appState.layout.jsonPreviewVisible) return;
    let rightPct = ((rect.right - clientX) / totalPx) * 100;
    const leftPct = appState.layout.leftWidth;
    const maxRightPct = 100 - leftPct - minMiddlePct;
    rightPct = Math.max(minRightPct, Math.min(rightPct, maxRightPct));
    appState.layout.rightWidth = rightPct;
    appState.layout.middleWidth = 100 - leftPct - rightPct;
  }

  updateGridTemplate();
}
