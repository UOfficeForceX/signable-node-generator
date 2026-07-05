// importer.js 單元測試（匯入邏輯，TC-601 ~ TC-605）

describe('importer.js - hydrateImportedNode', () => {
  it('每次匯入應賦予新的 _uid，且不會與其他次匯入衝突', () => {
    const raw = { code: 'x', approverSetting: { userTypes: ['Applicant'], custom: null, field: null, plugin: null } };
    const hydrated1 = hydrateImportedNode(raw);
    const hydrated2 = hydrateImportedNode(raw);
    assertTrue(!!hydrated1._uid);
    assertTrue(hydrated1._uid !== hydrated2._uid);
  });

  it('field.signType 有值時應標記 _ui.approverFieldKind 為 dept', () => {
    const raw = {
      code: 'x',
      approverSetting: { userTypes: ['Field'], custom: null, field: { code: 'f1', signType: 0 }, plugin: null }
    };
    const hydrated = hydrateImportedNode(raw);
    assertEqual(hydrated._ui.approverFieldKind, 'dept');
  });

  it('沒有 field 或 signType 為 null 時應標記為 person', () => {
    const raw = {
      code: 'x',
      approverSetting: { userTypes: ['Applicant'], custom: null, field: null, plugin: null }
    };
    const hydrated = hydrateImportedNode(raw);
    assertEqual(hydrated._ui.approverFieldKind, 'person');
  });

  it('hydrateImportedNode 不應修改原始傳入物件（深拷貝）', () => {
    const raw = { code: 'x', approverSetting: { userTypes: ['Applicant'], custom: null, field: null, plugin: null } };
    hydrateImportedNode(raw);
    assertEqual(raw._uid, undefined);
  });
});

describe('importer.js - 匯入驗證閘門 (TC-601 ~ TC-605)', () => {
  it('TC-602 非法 JSON 語法應在 JSON.parse 階段丟出例外，不得覆蓋現有資料', () => {
    assertThrows(() => JSON.parse('{ 這不是合法 JSON'));
  });

  it('TC-603 匯入純陣列應被 validateRoot 拒絕', () => {
    const errors = validateRoot([1, 2, 3]);
    assertTrue(errors.length > 0);
  });

  it('TC-604 匯入缺少 signableNodes 應被 validateRoot 拒絕', () => {
    const errors = validateRoot({ foo: 'bar' });
    assertTrue(errors.length > 0);
  });

  it('TC-605 匯入 itemType=0 應被 validateNode 拒絕', () => {
    const node = buildMinimalNode({
      approverSetting: { userTypes: ['Custom'], custom: [{ itemType: 0 }], field: null, plugin: null }
    });
    const errors = validateNode(node, 0);
    assertTrue(errors.length > 0);
  });

  it('TC-601 合法且完整的匯入資料應通過 root 與 node 驗證', () => {
    const data = { signableNodes: [buildMinimalNode()] };
    const rootErrors = validateRoot(data);
    assertEqual(rootErrors.length, 0);
    const nodeErrors = [];
    data.signableNodes.forEach((n, idx) => nodeErrors.push(...validateNode(n, idx)));
    assertEqual(nodeErrors.length, 0);
  });

  it('匯入含多個 userTypes（複選）的合法站點應通過驗證，驗證匯入端也支援複選', () => {
    const data = {
      signableNodes: [buildMinimalNode({
        approverSetting: {
          userTypes: ['Applicant', 'SuprOfAppl', 'Supervisor'],
          custom: null,
          field: null,
          plugin: null
        }
      })]
    };
    const nodeErrors = [];
    data.signableNodes.forEach((n, idx) => nodeErrors.push(...validateNode(n, idx)));
    assertEqual(nodeErrors.length, 0);
  });
});
