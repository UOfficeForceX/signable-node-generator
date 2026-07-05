// validator.js 單元測試（依據 docs/VALIDATION_SPEC.md 與 docs/TEST_CASES.md）

function buildMinimalNode(overrides = {}) {
  const base = {
    code: 'nodeCode',
    note: null,
    approverSetting: { userTypes: ['Applicant'], custom: null, field: null, plugin: null },
    completeRuleSetting: { completeRule: 0 },
    decisionSetting: {
      defaultDecisionSetting: {
        inherit: true,
        allowedDisapprove: true,
        allowedReturn: true,
        allowDirectSendToReturner: false,
        allowedAdditionalBranch: false,
        additionalBranchSetting: { additionalBranchType: 0, custom: null },
        allowedCounterBranch: false,
        counterBranchSetting: { counterBranchType: 0, custom: null }
      }
    },
    skipSetting: { inherit: true, allowedSkip: true },
    noSignerSkipSetting: { inherit: true, allowedSkip: false },
    fieldPermissionSettings: []
  };
  return Object.assign(base, overrides);
}

describe('validator.js - Root 驗證', () => {
  it('非物件（例如陣列）應回傳錯誤', () => {
    const errors = validateRoot([1, 2, 3]);
    assertTrue(errors.length > 0);
  });

  it('TC-604 缺少 signableNodes 應回傳錯誤', () => {
    const errors = validateRoot({});
    assertTrue(errors.length > 0);
  });

  it('signableNodes 非陣列應回傳錯誤', () => {
    const errors = validateRoot({ signableNodes: {} });
    assertTrue(errors.length > 0);
  });

  it('合法 root 不應有錯誤', () => {
    const errors = validateRoot({ signableNodes: [] });
    assertEqual(errors.length, 0);
  });
});

describe('validator.js - approverSetting (TC-201 ~ TC-208)', () => {
  it('TC-201 勾選 Applicant 應驗證成功', () => {
    const errors = validateNode(buildMinimalNode(), 0);
    assertEqual(errors.length, 0);
  });

  it('TC-202 勾選 Custom 但未設定 custom 應顯示驗證錯誤', () => {
    const node = buildMinimalNode({
      approverSetting: { userTypes: ['Custom'], custom: null, field: null, plugin: null }
    });
    const errors = validateNode(node, 0);
    assertTrue(errors.length > 0);
  });

  it('TC-203 custom itemType=1 缺 deptCode 應顯示驗證錯誤', () => {
    const node = buildMinimalNode({
      approverSetting: { userTypes: ['Custom'], custom: [{ itemType: 1, containsChildren: false }], field: null, plugin: null }
    });
    const errors = validateNode(node, 0);
    assertTrue(errors.some((e) => e.message.includes('deptCode')));
  });

  it('TC-204 custom itemType=2 且有 jobTitleCode 應驗證成功', () => {
    const node = buildMinimalNode({
      approverSetting: { userTypes: ['Custom'], custom: [{ itemType: 2, jobTitleCode: 'T1' }], field: null, plugin: null }
    });
    const errors = validateNode(node, 0);
    assertEqual(errors.length, 0);
  });

  it('TC-205 custom itemType=7 且有 deptCode、account 應驗證成功', () => {
    const node = buildMinimalNode({
      approverSetting: { userTypes: ['Custom'], custom: [{ itemType: 7, deptCode: 'D1', account: 'acc' }], field: null, plugin: null }
    });
    const errors = validateNode(node, 0);
    assertEqual(errors.length, 0);
  });

  it('TC-206 itemType=0 應顯示驗證錯誤（0 為禁止輸出的樣板值）', () => {
    const node = buildMinimalNode({
      approverSetting: { userTypes: ['Custom'], custom: [{ itemType: 0 }], field: null, plugin: null }
    });
    const errors = validateNode(node, 0);
    assertTrue(errors.some((e) => e.message.includes('itemType')));
  });

  it('TC-207 勾選 Field 但 field.code 空白應顯示驗證錯誤', () => {
    const node = buildMinimalNode({
      approverSetting: { userTypes: ['Field'], custom: null, field: { code: '', signType: null }, plugin: null }
    });
    const errors = validateNode(node, 0);
    assertTrue(errors.some((e) => e.message.includes('field.code')));
  });

  it('TC-208 勾選 Plugin 但 jsonPath 空白應顯示驗證錯誤', () => {
    const node = buildMinimalNode({
      approverSetting: { userTypes: ['Plugin'], custom: null, field: null, plugin: { code: 'p1', jsonPath: '' } }
    });
    const errors = validateNode(node, 0);
    assertTrue(errors.some((e) => e.message.includes('plugin.jsonPath')));
  });

  it('userTypes 可同時包含多種類型並個別通過驗證（實際規格允許複選，例如 Applicant + SuprOfAppl + Field）', () => {
    const node = buildMinimalNode({
      approverSetting: {
        userTypes: ['Applicant', 'SuprOfAppl', 'Field'],
        custom: null,
        field: { code: 'deptFieldCode', signType: 0 },
        plugin: null
      }
    });
    const errors = validateNode(node, 0);
    assertEqual(errors.length, 0);
  });

  it('userTypes 內含不合法的值應顯示驗證錯誤', () => {
    const node = buildMinimalNode({
      approverSetting: { userTypes: ['NotARealType'], custom: null, field: null, plugin: null }
    });
    const errors = validateNode(node, 0);
    assertTrue(errors.some((e) => e.message.includes('userTypes')));
  });
});

describe('validator.js - completeRuleSetting (TC-303)', () => {
  it('completeRule 為 0 或 1 應驗證成功', () => {
    assertEqual(validateNode(buildMinimalNode({ completeRuleSetting: { completeRule: 0 } }), 0).length, 0);
    assertEqual(validateNode(buildMinimalNode({ completeRuleSetting: { completeRule: 1 } }), 0).length, 0);
  });

  it('TC-303 completeRule = 2 應顯示驗證錯誤', () => {
    const node = buildMinimalNode({ completeRuleSetting: { completeRule: 2 } });
    const errors = validateNode(node, 0);
    assertTrue(errors.some((e) => e.path.includes('completeRule')));
  });
});

describe('validator.js - decisionSetting (TC-401 ~ TC-403)', () => {
  it('TC-401 additionalBranchType=0 時不需要 custom', () => {
    const node = buildMinimalNode();
    node.decisionSetting.defaultDecisionSetting.allowedAdditionalBranch = true;
    node.decisionSetting.defaultDecisionSetting.additionalBranchSetting = { additionalBranchType: 0, custom: null };
    const errors = validateNode(node, 0);
    assertEqual(errors.length, 0);
  });

  it('TC-402 additionalBranchType=2 但 custom 為空應顯示驗證錯誤', () => {
    const node = buildMinimalNode();
    node.decisionSetting.defaultDecisionSetting.allowedAdditionalBranch = true;
    node.decisionSetting.defaultDecisionSetting.additionalBranchSetting = { additionalBranchType: 2, custom: [] };
    const errors = validateNode(node, 0);
    assertTrue(errors.length > 0);
  });

  it('TC-403 counterBranchType=2 且 custom 有效應驗證成功', () => {
    const node = buildMinimalNode();
    node.decisionSetting.defaultDecisionSetting.allowedCounterBranch = true;
    node.decisionSetting.defaultDecisionSetting.counterBranchSetting = {
      counterBranchType: 2,
      custom: [{ itemType: 7, deptCode: 'D1', account: 'acc' }]
    };
    const errors = validateNode(node, 0);
    assertEqual(errors.length, 0);
  });
});

describe('validator.js - fieldPermissionSettings (TC-501 ~ TC-505)', () => {
  it('TC-502 fieldCode 空白應顯示驗證錯誤', () => {
    const node = buildMinimalNode({
      fieldPermissionSettings: [{
        fieldCode: '',
        fieldParentCode: null,
        editPermissionSetting: { inherit: false, required: false, allowToEdit: true, allowType: 0, custom: null },
        viewPermissionSetting: { inherit: false, allowToEdit: true, allowType: 0, custom: null }
      }]
    });
    const errors = validateNode(node, 0);
    assertTrue(errors.some((e) => e.message.includes('fieldCode')));
  });

  it('TC-503 edit allowType=1 但 custom 空應顯示驗證錯誤', () => {
    const node = buildMinimalNode({
      fieldPermissionSettings: [{
        fieldCode: 'f1',
        fieldParentCode: null,
        editPermissionSetting: { inherit: false, required: false, allowToEdit: true, allowType: 1, custom: [] },
        viewPermissionSetting: { inherit: false, allowToEdit: true, allowType: 0, custom: null }
      }]
    });
    const errors = validateNode(node, 0);
    assertTrue(errors.length > 0);
  });

  it('TC-504 view allowType=1 但 custom 空應顯示驗證錯誤', () => {
    const node = buildMinimalNode({
      fieldPermissionSettings: [{
        fieldCode: 'f1',
        fieldParentCode: null,
        editPermissionSetting: { inherit: false, required: false, allowToEdit: true, allowType: 0, custom: null },
        viewPermissionSetting: { inherit: false, allowToEdit: true, allowType: 1, custom: [] }
      }]
    });
    const errors = validateNode(node, 0);
    assertTrue(errors.length > 0);
  });

  it('TC-505 viewPermissionSetting 沒有 required 屬性時驗證器不應報錯（required 由 generator 負責移除）', () => {
    const node = buildMinimalNode({
      fieldPermissionSettings: [{
        fieldCode: 'f1',
        fieldParentCode: null,
        editPermissionSetting: { inherit: false, required: false, allowToEdit: true, allowType: 0, custom: null },
        viewPermissionSetting: { inherit: false, allowToEdit: true, allowType: 0, custom: null }
      }]
    });
    const errors = validateNode(node, 0);
    assertEqual(errors.length, 0);
  });
});

describe('validator.js - validateExportData（匯出/複製前整體驗證，TC-702 / TC-704）', () => {
  it('合法資料應通過整體驗證', () => {
    const data = { signableNodes: [buildMinimalNode()] };
    const result = validateExportData(data);
    assertTrue(result.valid);
    assertEqual(result.errors.length, 0);
  });

  it('非法資料（code 空白）應回報 valid=false 且附帶錯誤訊息', () => {
    const data = { signableNodes: [buildMinimalNode({ code: '' })] };
    const result = validateExportData(data);
    assertFalse(result.valid);
    assertTrue(result.errors.length > 0);
  });
});
