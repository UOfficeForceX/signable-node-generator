// 更新站點清單、表單、JSON 預覽、錯誤訊息

function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderAll() {
  renderSiteList();
  renderEditor();
  renderJsonPreview();
  renderValidationMessages();
}

// ---------- 左欄：站點預覽 ----------

function renderSiteList() {
  const container = document.getElementById('siteList');
  const scrollTop = container.scrollTop;
  if (appState.signableNodes.length === 0) {
    container.innerHTML = '<p class="text-muted small px-2">尚無站點，請先新增站點。</p>';
    return;
  }
  container.innerHTML = appState.signableNodes.map((node, idx) => renderSiteCard(node, idx)).join('');
  container.scrollTop = scrollTop;
}

function renderSiteCard(node, idx) {
  const active = idx === appState.selectedNodeIndex ? ' active' : '';
  const userTypesLabel = (node.approverSetting.userTypes || [])
    .map((t) => (USER_TYPE_OPTIONS.find((o) => o.value === t) || {}).label || t)
    .join('、');
  const completeRuleLabel = (COMPLETE_RULE_OPTIONS.find((o) => o.value === node.completeRuleSetting.completeRule) || {}).label || '';
  const fieldPermCount = (node.fieldPermissionSettings || []).length;

  return `
    <div class="site-card${active}" data-action="select-node" data-index="${idx}">
      <span class="drag-handle">&#9776;</span>
      <div class="site-summary">
        <div class="code">${escapeHtml(node.code || '(未命名)')}</div>
        <div>簽核者：${escapeHtml(userTypesLabel || '未設定')}</div>
        <div>完成規則：${escapeHtml(completeRuleLabel)}</div>
        <div>欄位權限：${fieldPermCount} 筆</div>
      </div>
      <div class="site-actions">
        <button type="button" class="btn btn-sm btn-outline-secondary" data-action="move-up" data-index="${idx}" title="上移">&uarr;</button>
        <button type="button" class="btn btn-sm btn-outline-secondary" data-action="move-down" data-index="${idx}" title="下移">&darr;</button>
        <button type="button" class="btn btn-sm btn-outline-secondary" data-action="duplicate-node" data-index="${idx}" title="複製">&#10697;</button>
        <button type="button" class="btn btn-sm btn-outline-danger" data-action="delete-node" data-index="${idx}" title="刪除">&times;</button>
      </div>
    </div>`;
}

// ---------- 中欄：站點屬性檢視及編輯 ----------

const ACCORDION_SECTION_IDS = ['secBasic', 'secApprover', 'secComplete', 'secDecision', 'secSkip', 'secFieldPerm'];

function renderEditor() {
  const container = document.getElementById('editorContainer');
  const scrollTop = container.scrollTop;
  const node = getSelectedNode();

  // 記住目前展開的 Accordion 區塊，重繪後還原，避免使用者操作中的區塊被意外收合。
  const openSections = Array.from(container.querySelectorAll('.accordion-collapse.show')).map((el) => el.id);

  if (!node) {
    container.innerHTML = '<p class="text-muted">請先新增或選取一個站點。</p>';
    return;
  }

  container.innerHTML = `
    <div class="accordion" id="nodeAccordion">
      ${renderBasicSection(node)}
      ${renderApproverSection(node)}
      ${renderCompleteRuleSection(node)}
      ${renderDecisionSection(node)}
      ${renderSkipSection(node)}
      ${renderFieldPermissionSection(node)}
    </div>`;

  restoreAccordionState(container, openSections);
  container.scrollTop = scrollTop;
}

function restoreAccordionState(container, openSections) {
  const shouldOpen = (id) => (openSections.length > 0 ? openSections.includes(id) : id === 'secBasic');
  ACCORDION_SECTION_IDS.forEach((id) => {
    const collapseEl = container.querySelector(`#${id}`);
    if (!collapseEl) return;
    const button = container.querySelector(`[data-bs-target="#${id}"]`);
    if (shouldOpen(id)) {
      collapseEl.classList.add('show');
      if (button) {
        button.classList.remove('collapsed');
        button.setAttribute('aria-expanded', 'true');
      }
    } else {
      collapseEl.classList.remove('show');
      if (button) {
        button.classList.add('collapsed');
        button.setAttribute('aria-expanded', 'false');
      }
    }
  });
}

function checkboxRow(path, checked, label) {
  const id = `chk_${path.replace(/\W/g, '_')}`;
  return `
    <div class="form-check mb-2">
      <input class="form-check-input" type="checkbox" data-path="${path}" id="${id}" ${checked ? 'checked' : ''}>
      <label class="form-check-label" for="${id}">${label}</label>
    </div>`;
}

function renderBasicSection(node) {
  return `
  <div class="accordion-item">
    <h2 class="accordion-header">
      <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#secBasic">站點基本資料</button>
    </h2>
    <div id="secBasic" class="accordion-collapse collapse show">
      <div class="accordion-body">
        <div class="mb-3">
          <label class="form-label"><span class="required-mark">*</span>站點代碼 code</label>
          <input type="text" class="form-control" data-path="code" value="${escapeHtml(node.code)}">
        </div>
        <div class="mb-3">
          <label class="form-label">給簽核者的話 note</label>
          <textarea class="form-control" rows="2" data-path="note" data-null-if-empty="true">${escapeHtml(node.note || '')}</textarea>
        </div>
      </div>
    </div>
  </div>`;
}

function renderApproverSection(node) {
  const setting = node.approverSetting;
  const checks = USER_TYPE_OPTIONS.map((opt) => `
    <div class="form-check form-check-inline">
      <input class="form-check-input" type="checkbox" data-role="user-type-checkbox" data-value="${opt.value}" id="ut_${opt.value}" ${setting.userTypes.includes(opt.value) ? 'checked' : ''}>
      <label class="form-check-label" for="ut_${opt.value}">${opt.label}</label>
    </div>`).join('');

  let customHtml = '';
  if (setting.userTypes.includes('Custom')) {
    customHtml = `
      <div class="mt-3">
        <div class="section-title"><span class="required-mark">*</span>自訂人員 / 組織條件</div>
        ${renderCustomListHtml(setting.custom || [], 'approverSetting.custom')}
      </div>`;
  }

  let fieldHtml = '';
  if (setting.userTypes.includes('Field')) {
    const kind = node._ui.approverFieldKind || 'person';
    const field = setting.field || { code: '', signType: null };
    fieldHtml = `
      <div class="mt-3 border rounded p-2">
        <div class="section-title">由欄位決定簽核者</div>
        <div class="mb-2">
          <label class="form-label">欄位類型</label>
          <select class="form-select form-select-sm" data-role="field-kind">
            ${FIELD_KIND_OPTIONS.map((o) => `<option value="${o.value}" ${kind === o.value ? 'selected' : ''}>${o.label}</option>`).join('')}
          </select>
        </div>
        <div class="mb-2">
          <label class="form-label"><span class="required-mark">*</span>欄位代碼 field.code</label>
          <input type="text" class="form-control form-control-sm" data-path="approverSetting.field.code" value="${escapeHtml(field.code)}">
        </div>
        ${kind === 'dept' ? `
        <div class="mb-2">
          <label class="form-label"><span class="required-mark">*</span>signType</label>
          <select class="form-select form-select-sm" data-path="approverSetting.field.signType" data-type="int">
            ${FIELD_SIGN_TYPE_OPTIONS.map((o) => `<option value="${o.value}" ${field.signType === o.value ? 'selected' : ''}>${o.label}</option>`).join('')}
          </select>
        </div>` : ''}
      </div>`;
  }

  let pluginHtml = '';
  if (setting.userTypes.includes('Plugin')) {
    const plugin = setting.plugin || { code: '', jsonPath: '' };
    pluginHtml = `
      <div class="mt-3 border rounded p-2">
        <div class="section-title">由外掛欄位決定簽核者</div>
        <div class="mb-2">
          <label class="form-label"><span class="required-mark">*</span>外掛欄位代碼 plugin.code</label>
          <input type="text" class="form-control form-control-sm" data-path="approverSetting.plugin.code" value="${escapeHtml(plugin.code)}">
        </div>
        <div class="mb-2">
          <label class="form-label"><span class="required-mark">*</span>JSON 路徑 plugin.jsonPath</label>
          <input type="text" class="form-control form-control-sm" data-path="approverSetting.plugin.jsonPath" value="${escapeHtml(plugin.jsonPath)}">
        </div>
      </div>`;
  }

  return `
  <div class="accordion-item">
    <h2 class="accordion-header">
      <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#secApprover">簽核者設定</button>
    </h2>
    <div id="secApprover" class="accordion-collapse collapse">
      <div class="accordion-body">
        ${checks}
        ${customHtml}
        ${fieldHtml}
        ${pluginHtml}
      </div>
    </div>
  </div>`;
}

function renderCompleteRuleSection(node) {
  const value = node.completeRuleSetting.completeRule;
  return `
  <div class="accordion-item">
    <h2 class="accordion-header">
      <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#secComplete">簽核完成規則</button>
    </h2>
    <div id="secComplete" class="accordion-collapse collapse">
      <div class="accordion-body">
        ${COMPLETE_RULE_OPTIONS.map((o) => `
          <div class="form-check">
            <input class="form-check-input" type="radio" name="completeRule" data-path="completeRuleSetting.completeRule" data-type="int" value="${o.value}" id="cr_${o.value}" ${value === o.value ? 'checked' : ''}>
            <label class="form-check-label" for="cr_${o.value}">${o.label}</label>
          </div>`).join('')}
      </div>
    </div>
  </div>`;
}

function renderDecisionSection(node) {
  const d = node.decisionSetting.defaultDecisionSetting;

  const additionalCustomHtml = d.additionalBranchSetting.additionalBranchType === 2
    ? renderCustomListHtml(d.additionalBranchSetting.custom || [], 'decisionSetting.defaultDecisionSetting.additionalBranchSetting.custom')
    : '';

  const counterCustomHtml = d.counterBranchSetting.counterBranchType === 2
    ? renderCustomListHtml(d.counterBranchSetting.custom || [], 'decisionSetting.defaultDecisionSetting.counterBranchSetting.custom')
    : '';

  return `
  <div class="accordion-item">
    <h2 class="accordion-header">
      <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#secDecision">簽核動作與權限</button>
    </h2>
    <div id="secDecision" class="accordion-collapse collapse">
      <div class="accordion-body">
        ${checkboxRow('decisionSetting.defaultDecisionSetting.inherit', d.inherit, '是否繼承全域表單設定')}
        ${checkboxRow('decisionSetting.defaultDecisionSetting.allowedDisapprove', d.allowedDisapprove, '允許否決')}
        ${checkboxRow('decisionSetting.defaultDecisionSetting.allowedReturn', d.allowedReturn, '允許退簽')}
        ${checkboxRow('decisionSetting.defaultDecisionSetting.allowDirectSendToReturner', d.allowDirectSendToReturner, '退簽重送後直接送回原退簽者')}
        <hr>
        ${checkboxRow('decisionSetting.defaultDecisionSetting.allowedAdditionalBranch', d.allowedAdditionalBranch, '允許徵詢')}
        ${d.allowedAdditionalBranch ? `
        <div class="mb-2 ms-3">
          <label class="form-label">徵詢對象限制</label>
          <select class="form-select form-select-sm" data-role="branch-type" data-branch-path="decisionSetting.defaultDecisionSetting.additionalBranchSetting" data-type-key="additionalBranchType">
            ${BRANCH_TYPE_OPTIONS.map((o) => `<option value="${o.value}" ${d.additionalBranchSetting.additionalBranchType === o.value ? 'selected' : ''}>${o.label}</option>`).join('')}
          </select>
          <div class="mt-2">${additionalCustomHtml}</div>
        </div>` : ''}
        <hr>
        ${checkboxRow('decisionSetting.defaultDecisionSetting.allowedCounterBranch', d.allowedCounterBranch, '允許加簽')}
        ${d.allowedCounterBranch ? `
        <div class="mb-2 ms-3">
          <label class="form-label">加簽對象限制</label>
          <select class="form-select form-select-sm" data-role="branch-type" data-branch-path="decisionSetting.defaultDecisionSetting.counterBranchSetting" data-type-key="counterBranchType">
            ${BRANCH_TYPE_OPTIONS.map((o) => `<option value="${o.value}" ${d.counterBranchSetting.counterBranchType === o.value ? 'selected' : ''}>${o.label}</option>`).join('')}
          </select>
          <div class="mt-2">${counterCustomHtml}</div>
        </div>` : ''}
      </div>
    </div>
  </div>`;
}

function renderSkipSection(node) {
  return `
  <div class="accordion-item">
    <h2 class="accordion-header">
      <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#secSkip">跳關設定</button>
    </h2>
    <div id="secSkip" class="accordion-collapse collapse">
      <div class="accordion-body">
        <div class="section-title">相同簽核者跳關 skipSetting</div>
        ${checkboxRow('skipSetting.inherit', node.skipSetting.inherit, '是否繼承表單設定')}
        ${checkboxRow('skipSetting.allowedSkip', node.skipSetting.allowedSkip, '允許跳關')}
        <hr>
        <div class="section-title">找不到簽核者跳關 noSignerSkipSetting</div>
        ${checkboxRow('noSignerSkipSetting.inherit', node.noSignerSkipSetting.inherit, '是否繼承表單設定')}
        ${checkboxRow('noSignerSkipSetting.allowedSkip', node.noSignerSkipSetting.allowedSkip, '允許跳關')}
      </div>
    </div>
  </div>`;
}

function renderFieldPermissionSection(node) {
  const items = node.fieldPermissionSettings.map((fp, idx) => renderFieldPermissionCard(fp, idx)).join('');
  return `
  <div class="accordion-item">
    <h2 class="accordion-header">
      <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#secFieldPerm">欄位權限設定</button>
    </h2>
    <div id="secFieldPerm" class="accordion-collapse collapse">
      <div class="accordion-body">
        ${items || '<p class="text-muted small">尚未設定欄位權限。</p>'}
        <button type="button" class="btn btn-sm btn-outline-primary" data-action="add-field-permission">+ 新增欄位權限</button>
      </div>
    </div>
  </div>`;
}

function renderFieldPermissionCard(fp, idx) {
  const base = `fieldPermissionSettings.${idx}`;
  const editCustom = fp.editPermissionSetting.allowType === 1
    ? renderCustomListHtml(fp.editPermissionSetting.custom || [], `${base}.editPermissionSetting.custom`)
    : '';
  const viewCustom = fp.viewPermissionSetting.allowType === 1
    ? renderCustomListHtml(fp.viewPermissionSetting.custom || [], `${base}.viewPermissionSetting.custom`)
    : '';

  return `
    <div class="custom-item-card">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <strong>欄位權限 #${idx + 1}</strong>
        <button type="button" class="btn btn-sm btn-outline-danger" data-action="remove-field-permission" data-index="${idx}">刪除</button>
      </div>
      <div class="mb-2">
        <label class="form-label"><span class="required-mark">*</span>欄位代號 fieldCode</label>
        <input type="text" class="form-control form-control-sm" data-path="${base}.fieldCode" value="${escapeHtml(fp.fieldCode)}">
      </div>
      <div class="mb-2">
        <label class="form-label">父層欄位代號 fieldParentCode（明細子欄位必填）</label>
        <input type="text" class="form-control form-control-sm" data-path="${base}.fieldParentCode" data-null-if-empty="true" value="${escapeHtml(fp.fieldParentCode || '')}">
      </div>
      <div class="border rounded p-2 mb-2">
        <div class="section-title">編輯權限 editPermissionSetting</div>
        ${checkboxRow(`${base}.editPermissionSetting.inherit`, fp.editPermissionSetting.inherit, '是否繼承')}
        ${checkboxRow(`${base}.editPermissionSetting.required`, fp.editPermissionSetting.required, '是否必填')}
        ${checkboxRow(`${base}.editPermissionSetting.allowToEdit`, fp.editPermissionSetting.allowToEdit, '是否允許編輯')}
        <label class="form-label">允許編輯範圍</label>
        <select class="form-select form-select-sm" data-role="allow-type" data-target-path="${base}.editPermissionSetting">
          ${ALLOW_TYPE_OPTIONS.map((o) => `<option value="${o.value}" ${fp.editPermissionSetting.allowType === o.value ? 'selected' : ''}>${o.label}</option>`).join('')}
        </select>
        <div class="mt-2">${editCustom}</div>
      </div>
      <div class="border rounded p-2">
        <div class="section-title">觀看權限 viewPermissionSetting</div>
        ${checkboxRow(`${base}.viewPermissionSetting.inherit`, fp.viewPermissionSetting.inherit, '是否繼承')}
        ${checkboxRow(`${base}.viewPermissionSetting.allowToEdit`, fp.viewPermissionSetting.allowToEdit, '是否允許觀看')}
        <label class="form-label">允許觀看範圍</label>
        <select class="form-select form-select-sm" data-role="allow-type" data-target-path="${base}.viewPermissionSetting">
          ${ALLOW_TYPE_OPTIONS.map((o) => `<option value="${o.value}" ${fp.viewPermissionSetting.allowType === o.value ? 'selected' : ''}>${o.label}</option>`).join('')}
        </select>
        <div class="mt-2">${viewCustom}</div>
      </div>
    </div>`;
}

// ---------- custom（人員 / 組織條件）通用清單 ----------

function renderCustomListHtml(customArray, arrayPath) {
  const items = customArray.map((item, idx) => renderCustomItemCard(item, idx, arrayPath)).join('');
  return `
    <div class="custom-list">
      ${items}
      <button type="button" class="btn btn-sm btn-outline-primary" data-action="add-custom" data-target="${arrayPath}">+ 新增條件</button>
    </div>`;
}

function renderCustomItemCard(item, idx, arrayPath) {
  return `
    <div class="custom-item-card">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <select class="form-select form-select-sm w-auto" data-role="custom-item-type" data-target="${arrayPath}" data-index="${idx}">
          ${ITEM_TYPE_OPTIONS.map((o) => `<option value="${o.value}" ${item.itemType === o.value ? 'selected' : ''}>${o.label}</option>`).join('')}
        </select>
        <button type="button" class="btn btn-sm btn-outline-danger" data-action="remove-custom" data-target="${arrayPath}" data-index="${idx}">刪除</button>
      </div>
      ${renderCustomItemFields(item, idx, arrayPath)}
    </div>`;
}

function renderCustomItemFields(item, idx, arrayPath) {
  const base = `${arrayPath}.${idx}`;
  const parts = [];

  if ('deptCode' in item) {
    parts.push(`
      <div class="mb-2">
        <label class="form-label"><span class="required-mark">*</span>部門代碼 deptCode</label>
        <input type="text" class="form-control form-control-sm" data-path="${base}.deptCode" value="${escapeHtml(item.deptCode)}">
      </div>`);
  }
  if ('jobTitleCode' in item) {
    parts.push(`
      <div class="mb-2">
        <label class="form-label"><span class="required-mark">*</span>職稱代碼 jobTitleCode</label>
        <input type="text" class="form-control form-control-sm" data-path="${base}.jobTitleCode" value="${escapeHtml(item.jobTitleCode)}">
      </div>`);
  }
  if ('jobFuncCode' in item) {
    parts.push(`
      <div class="mb-2">
        <label class="form-label"><span class="required-mark">*</span>職務代碼 jobFuncCode</label>
        <input type="text" class="form-control form-control-sm" data-path="${base}.jobFuncCode" value="${escapeHtml(item.jobFuncCode)}">
      </div>`);
  }
  if ('account' in item) {
    parts.push(`
      <div class="mb-2">
        <label class="form-label"><span class="required-mark">*</span>帳號 account</label>
        <input type="text" class="form-control form-control-sm" data-path="${base}.account" value="${escapeHtml(item.account)}">
      </div>`);
  }
  if ('containsChildren' in item) {
    const cid = `cc_${base.replace(/\W/g, '_')}`;
    parts.push(`
      <div class="form-check">
        <input class="form-check-input" type="checkbox" data-path="${base}.containsChildren" id="${cid}" ${item.containsChildren ? 'checked' : ''}>
        <label class="form-check-label" for="${cid}"><span class="required-mark">*</span>包含子部門 containsChildren</label>
      </div>`);
  }

  return parts.join('');
}

// ---------- 右欄：JSON 預覽 / 驗證錯誤 ----------

function renderJsonPreview() {
  const pre = document.getElementById('jsonPreview');
  const data = generateOutputJson();
  pre.textContent = JSON.stringify(data, null, 2);
}

function renderValidationMessages() {
  const container = document.getElementById('validationErrors');
  const data = generateOutputJson();
  const result = validateExportData(data);
  appState.lastValidation = result;

  if (result.valid) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = `
    <div class="alert alert-danger py-2 px-3 mb-2">
      <strong>發現 ${result.errors.length} 個驗證錯誤：</strong>
      <ul class="mb-0 ps-3">
        ${result.errors.map((e) => `<li>${escapeHtml(e.message)}</li>`).join('')}
      </ul>
    </div>`;
}
