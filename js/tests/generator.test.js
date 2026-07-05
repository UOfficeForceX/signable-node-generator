// generator.js 單元測試（JSON 產生規則）

describe('generator.js - JSON 產生', () => {
  it('generateOutputJson 應輸出 signableNodes 陣列且移除內部輔助欄位 (_uid/_ui)', () => {
    initState();
    const output = generateOutputJson();
    assertTrue(Array.isArray(output.signableNodes));
    assertEqual(output.signableNodes.length, 1);
    assertEqual(output.signableNodes[0]._uid, undefined);
    assertEqual(output.signableNodes[0]._ui, undefined);
  });

  it('TC-505 cleanNodeForExport 不應輸出 viewPermissionSetting.required（即使誤植也要移除）', () => {
    initState();
    const node = getSelectedNode();
    addFieldPermission(node);
    node.fieldPermissionSettings[0].viewPermissionSetting.required = true;
    const cleaned = cleanNodeForExport(node);
    assertFalse(
      Object.prototype.hasOwnProperty.call(cleaned.fieldPermissionSettings[0].viewPermissionSetting, 'required')
    );
  });

  it('cleanNodeForExport 應保留 editPermissionSetting.required', () => {
    initState();
    const node = getSelectedNode();
    addFieldPermission(node);
    const cleaned = cleanNodeForExport(node);
    assertTrue(
      Object.prototype.hasOwnProperty.call(cleaned.fieldPermissionSettings[0].editPermissionSetting, 'required')
    );
  });

  it('userTypes 可同時輸出多種簽核者類型（符合實際規格可複選）', () => {
    initState();
    const node = getSelectedNode();
    toggleUserType(node, 'SuprOfAppl');
    toggleUserType(node, 'Field');
    node.approverSetting.field = { code: 'deptFieldCode', signType: 0 };
    const output = generateOutputJson();
    assertDeepEqual(
      output.signableNodes[0].approverSetting.userTypes.slice().sort(),
      ['Applicant', 'SuprOfAppl', 'Field'].sort()
    );
  });

  it('cleanNodeForExport 不應影響原始 appState 資料（深拷貝）', () => {
    initState();
    const node = getSelectedNode();
    addFieldPermission(node);
    node.fieldPermissionSettings[0].viewPermissionSetting.required = true;
    cleanNodeForExport(node);
    assertTrue(
      Object.prototype.hasOwnProperty.call(node.fieldPermissionSettings[0].viewPermissionSetting, 'required'),
      'cleanNodeForExport 不應修改傳入的原始 node 物件'
    );
  });
});
