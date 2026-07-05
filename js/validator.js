// 驗證 state 與匯入 JSON，規則依據 docs/VALIDATION_SPEC.md

function validateRoot(data) {
  const errors = [];
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    errors.push({ path: 'root', message: '匯入內容必須是 JSON 物件。' });
    return errors;
  }
  if (!('signableNodes' in data)) {
    errors.push({ path: 'signableNodes', message: 'JSON 必須包含 signableNodes 根節點。' });
    return errors;
  }
  if (!Array.isArray(data.signableNodes)) {
    errors.push({ path: 'signableNodes', message: 'signableNodes 必須是陣列。' });
  }
  return errors;
}

function nodeLabel(node, index) {
  return (node && node.code && String(node.code).trim()) ? node.code : `第 ${index + 1} 站`;
}

function validateNode(node, index) {
  const errors = [];
  const label = nodeLabel(node, index);
  const prefix = `signableNodes[${index}]`;

  if (!node || typeof node !== 'object') {
    errors.push({ path: prefix, message: `${label} / 站點：站點資料格式錯誤。` });
    return errors;
  }

  if (!node.code || typeof node.code !== 'string' || !node.code.trim()) {
    errors.push({ path: `${prefix}.code`, message: `${label} / 站點基本資料：站點代碼為必填，不可空白。` });
  }

  if (!node.approverSetting || typeof node.approverSetting !== 'object') {
    errors.push({ path: `${prefix}.approverSetting`, message: `${label} / 簽核者設定：approverSetting 為必填。` });
  } else {
    errors.push(...validateApproverSetting(node.approverSetting, { label, prefix: `${prefix}.approverSetting` }));
  }

  if (!node.completeRuleSetting || typeof node.completeRuleSetting !== 'object') {
    errors.push({ path: `${prefix}.completeRuleSetting`, message: `${label} / 完成規則：completeRuleSetting 為必填。` });
  } else if (![0, 1].includes(node.completeRuleSetting.completeRule)) {
    errors.push({ path: `${prefix}.completeRuleSetting.completeRule`, message: `${label} / 完成規則：completeRule 必須為 0 或 1。` });
  }

  if (!node.decisionSetting || typeof node.decisionSetting !== 'object') {
    errors.push({ path: `${prefix}.decisionSetting`, message: `${label} / 簽核動作與權限：decisionSetting 為必填。` });
  } else {
    errors.push(...validateDecisionSetting(node.decisionSetting, { label, prefix: `${prefix}.decisionSetting` }));
  }

  if (!node.skipSetting || typeof node.skipSetting !== 'object') {
    errors.push({ path: `${prefix}.skipSetting`, message: `${label} / 跳關設定：skipSetting 為必填。` });
  } else {
    errors.push(...validateSkipLikeSetting(node.skipSetting, { label, prefix: `${prefix}.skipSetting`, name: '相同簽核者跳關' }));
  }

  if (!node.noSignerSkipSetting || typeof node.noSignerSkipSetting !== 'object') {
    errors.push({ path: `${prefix}.noSignerSkipSetting`, message: `${label} / 跳關設定：noSignerSkipSetting 為必填。` });
  } else {
    errors.push(...validateSkipLikeSetting(node.noSignerSkipSetting, { label, prefix: `${prefix}.noSignerSkipSetting`, name: '找不到簽核者跳關' }));
  }

  if (!Array.isArray(node.fieldPermissionSettings)) {
    errors.push({ path: `${prefix}.fieldPermissionSettings`, message: `${label} / 欄位權限設定：fieldPermissionSettings 必須是陣列。` });
  } else {
    errors.push(...validateFieldPermissionSettings(node.fieldPermissionSettings, { label, prefix: `${prefix}.fieldPermissionSettings` }));
  }

  return errors;
}

function validateApproverSetting(setting, context) {
  const errors = [];
  const { label, prefix } = context;

  if (!Array.isArray(setting.userTypes) || setting.userTypes.length === 0) {
    errors.push({ path: `${prefix}.userTypes`, message: `${label} / 簽核者設定：userTypes 為必填，且至少一筆。` });
    return errors;
  }

  setting.userTypes.forEach((t) => {
    if (!VALID_USER_TYPES.includes(t)) {
      errors.push({ path: `${prefix}.userTypes`, message: `${label} / 簽核者設定：userTypes 內含不合法的值「${t}」。` });
    }
  });

  if (setting.userTypes.includes('Custom')) {
    errors.push(...validateCustomUsers(setting.custom, { label, prefix: `${prefix}.custom`, name: '簽核者設定' }));
  }

  if (setting.userTypes.includes('Field')) {
    if (!setting.field || !setting.field.code || !String(setting.field.code).trim()) {
      errors.push({ path: `${prefix}.field.code`, message: `${label} / 簽核者設定：選擇「由欄位」時，field.code 為必填。` });
    }
    if (setting.field && setting.field.signType != null && ![0, 1].includes(setting.field.signType)) {
      errors.push({ path: `${prefix}.field.signType`, message: `${label} / 簽核者設定：field.signType 只能為 0 或 1。` });
    }
  }

  if (setting.userTypes.includes('Plugin')) {
    if (!setting.plugin || !setting.plugin.code || !String(setting.plugin.code).trim()) {
      errors.push({ path: `${prefix}.plugin.code`, message: `${label} / 簽核者設定：選擇「由外掛欄位」時，plugin.code 為必填。` });
    }
    if (!setting.plugin || !setting.plugin.jsonPath || !String(setting.plugin.jsonPath).trim()) {
      errors.push({ path: `${prefix}.plugin.jsonPath`, message: `${label} / 簽核者設定：選擇「由外掛欄位」時，plugin.jsonPath 為必填。` });
    }
  }

  return errors;
}

function validateCustomUsers(custom, context) {
  const errors = [];
  const { label, prefix, name } = context;

  if (!Array.isArray(custom) || custom.length === 0) {
    errors.push({ path: prefix, message: `${label} / ${name}：選擇「自訂」時，至少需要設定一筆人員或組織條件。` });
    return errors;
  }

  custom.forEach((item, idx) => {
    const itemPrefix = `${prefix}[${idx}]`;
    if (!item || ![1, 2, 3, 4, 5, 6, 7].includes(item.itemType)) {
      errors.push({ path: `${itemPrefix}.itemType`, message: `${label} / ${name}：第 ${idx + 1} 筆 itemType 必須為 1 到 7。` });
      return;
    }
    const requiredFields = ITEM_TYPE_REQUIRED_FIELDS[item.itemType] || [];
    requiredFields.forEach((field) => {
      if (field === 'containsChildren') {
        if (typeof item.containsChildren !== 'boolean') {
          errors.push({ path: `${itemPrefix}.containsChildren`, message: `${label} / ${name}：第 ${idx + 1} 筆 containsChildren 必須明確為 true 或 false。` });
        }
      } else if (item[field] == null || String(item[field]).trim() === '') {
        errors.push({ path: `${itemPrefix}.${field}`, message: `${label} / ${name}：第 ${idx + 1} 筆缺少必填欄位 ${field}。` });
      }
    });
  });

  return errors;
}

function validateDecisionSetting(setting, context) {
  const errors = [];
  const { label, prefix } = context;
  const d = setting.defaultDecisionSetting;

  if (!d || typeof d !== 'object') {
    errors.push({ path: `${prefix}.defaultDecisionSetting`, message: `${label} / 簽核動作與權限：defaultDecisionSetting 為必填。` });
    return errors;
  }

  if (d.allowedAdditionalBranch) {
    const s = d.additionalBranchSetting || {};
    if (![0, 1, 2].includes(s.additionalBranchType)) {
      errors.push({ path: `${prefix}.defaultDecisionSetting.additionalBranchSetting.additionalBranchType`, message: `${label} / 簽核動作與權限：additionalBranchType 必須為 0、1 或 2。` });
    } else if (s.additionalBranchType === 2) {
      errors.push(...validateCustomUsers(s.custom, { label, prefix: `${prefix}.defaultDecisionSetting.additionalBranchSetting.custom`, name: '徵詢對象限制' }));
    }
  }

  if (d.allowedCounterBranch) {
    const s = d.counterBranchSetting || {};
    if (![0, 1, 2].includes(s.counterBranchType)) {
      errors.push({ path: `${prefix}.defaultDecisionSetting.counterBranchSetting.counterBranchType`, message: `${label} / 簽核動作與權限：counterBranchType 必須為 0、1 或 2。` });
    } else if (s.counterBranchType === 2) {
      errors.push(...validateCustomUsers(s.custom, { label, prefix: `${prefix}.defaultDecisionSetting.counterBranchSetting.custom`, name: '加簽對象限制' }));
    }
  }

  return errors;
}

function validateSkipLikeSetting(setting, context) {
  const errors = [];
  const { label, prefix, name } = context;
  if (typeof setting.inherit !== 'boolean') {
    errors.push({ path: `${prefix}.inherit`, message: `${label} / ${name}：inherit 必須是布林值。` });
  }
  if (typeof setting.allowedSkip !== 'boolean') {
    errors.push({ path: `${prefix}.allowedSkip`, message: `${label} / ${name}：allowedSkip 必須是布林值。` });
  }
  return errors;
}

function validateFieldPermissionSettings(settings, context) {
  const errors = [];
  const { label, prefix } = context;

  settings.forEach((item, idx) => {
    const itemPrefix = `${prefix}[${idx}]`;
    if (!item.fieldCode || !String(item.fieldCode).trim()) {
      errors.push({ path: `${itemPrefix}.fieldCode`, message: `${label} / 欄位權限設定：第 ${idx + 1} 筆 fieldCode 為必填。` });
    }
    if (!item.editPermissionSetting) {
      errors.push({ path: `${itemPrefix}.editPermissionSetting`, message: `${label} / 欄位權限設定：第 ${idx + 1} 筆 editPermissionSetting 為必填。` });
    } else {
      errors.push(...validateAllowTypeSetting(item.editPermissionSetting, { label, prefix: `${itemPrefix}.editPermissionSetting`, name: `第 ${idx + 1} 筆編輯權限` }));
    }
    if (!item.viewPermissionSetting) {
      errors.push({ path: `${itemPrefix}.viewPermissionSetting`, message: `${label} / 欄位權限設定：第 ${idx + 1} 筆 viewPermissionSetting 為必填。` });
    } else {
      errors.push(...validateAllowTypeSetting(item.viewPermissionSetting, { label, prefix: `${itemPrefix}.viewPermissionSetting`, name: `第 ${idx + 1} 筆觀看權限` }));
    }
  });

  return errors;
}

function validateAllowTypeSetting(setting, context) {
  const errors = [];
  const { label, prefix, name } = context;
  if (![0, 1].includes(setting.allowType)) {
    errors.push({ path: `${prefix}.allowType`, message: `${label} / 欄位權限設定：${name} allowType 必須為 0 或 1。` });
  } else if (setting.allowType === 1) {
    errors.push(...validateCustomUsers(setting.custom, { label, prefix: `${prefix}.custom`, name }));
  }
  return errors;
}

function validateExportData(data) {
  const rootErrors = validateRoot(data);
  if (rootErrors.length > 0) {
    return { valid: false, errors: rootErrors };
  }
  const errors = [];
  data.signableNodes.forEach((node, idx) => {
    errors.push(...validateNode(node, idx));
  });
  return { valid: errors.length === 0, errors };
}
