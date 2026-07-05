// state.js 單元測試（站點管理、簽核者設定 userTypes 複選、自訂條件、欄位權限）

describe('state.js - 站點管理 (TC-101 ~ TC-105)', () => {
  it('initState 應建立一筆預設站點並選取它', () => {
    initState();
    assertEqual(appState.signableNodes.length, 1);
    assertEqual(appState.selectedNodeIndex, 0);
  });

  it('TC-101 addNode 應新增站點並自動選取新站點', () => {
    initState();
    addNode();
    assertEqual(appState.signableNodes.length, 2);
    assertEqual(appState.selectedNodeIndex, 1);
  });

  it('TC-103 duplicateNode 應複製站點並附加 _copy 後綴', () => {
    initState();
    duplicateNode(0);
    assertEqual(appState.signableNodes.length, 2);
    assertEqual(appState.signableNodes[1].code, 'nodeCode_copy');
    assertEqual(appState.selectedNodeIndex, 1);
  });

  it('duplicateNode 遇到重複 code 時應遞增後綴避免衝突', () => {
    initState();
    duplicateNode(0);
    duplicateNode(0);
    const codes = appState.signableNodes.map((n) => n.code);
    assertTrue(codes.includes('nodeCode_copy'));
    assertTrue(codes.includes('nodeCode_copy2'));
  });

  it('TC-104 deleteNode 應移除站點並調整選取索引', () => {
    initState();
    addNode();
    addNode();
    deleteNode(2);
    assertEqual(appState.signableNodes.length, 2);
    assertEqual(appState.selectedNodeIndex, 1);
  });

  it('deleteNode 刪除最後一筆站點後選取索引應為 null', () => {
    initState();
    deleteNode(0);
    assertEqual(appState.signableNodes.length, 0);
    assertEqual(appState.selectedNodeIndex, null);
  });

  it('TC-105 moveNodeUp / moveNodeDown 應交換站點順序並跟隨選取', () => {
    initState();
    addNode();
    appState.signableNodes[0].code = 'A';
    appState.signableNodes[1].code = 'B';
    moveNodeUp(1);
    assertEqual(appState.signableNodes[0].code, 'B');
    assertEqual(appState.signableNodes[1].code, 'A');
    assertEqual(appState.selectedNodeIndex, 0);
  });

  it('TC-105 reorderNodes（拖拉排序底層邏輯）應搬移站點並維持選取對象', () => {
    initState();
    addNode();
    addNode();
    appState.signableNodes[0].code = 'A';
    appState.signableNodes[1].code = 'B';
    appState.signableNodes[2].code = 'C';
    appState.selectedNodeIndex = 0;
    reorderNodes(0, 2);
    assertDeepEqual(appState.signableNodes.map((n) => n.code), ['B', 'C', 'A']);
    assertEqual(appState.selectedNodeIndex, 2);
  });
});

describe('state.js - 簽核者設定 userTypes（依實際規格可同時複選多種類型）', () => {
  it('toggleUserType 應可同時勾選多種簽核者類型', () => {
    initState();
    const node = getSelectedNode();
    toggleUserType(node, 'SuprOfAppl');
    toggleUserType(node, 'Supervisor');
    assertDeepEqual(
      node.approverSetting.userTypes.slice().sort(),
      ['Applicant', 'SuprOfAppl', 'Supervisor'].sort()
    );
  });

  it('toggleUserType 再次點擊應取消勾選該類型', () => {
    initState();
    const node = getSelectedNode();
    toggleUserType(node, 'Applicant');
    assertFalse(node.approverSetting.userTypes.includes('Applicant'));
  });

  it('勾選 Custom 應初始化 custom 陣列；取消勾選後應設回 null', () => {
    initState();
    const node = getSelectedNode();
    toggleUserType(node, 'Custom');
    assertTrue(Array.isArray(node.approverSetting.custom));
    toggleUserType(node, 'Custom');
    assertEqual(node.approverSetting.custom, null);
  });

  it('勾選 Field 應初始化 field 物件；取消勾選後應設回 null', () => {
    initState();
    const node = getSelectedNode();
    toggleUserType(node, 'Field');
    assertTrue(node.approverSetting.field !== null);
    toggleUserType(node, 'Field');
    assertEqual(node.approverSetting.field, null);
  });

  it('勾選 Plugin 應初始化 plugin 物件；取消勾選後應設回 null', () => {
    initState();
    const node = getSelectedNode();
    toggleUserType(node, 'Plugin');
    assertTrue(node.approverSetting.plugin !== null);
    toggleUserType(node, 'Plugin');
    assertEqual(node.approverSetting.plugin, null);
  });

  it('可同時勾選 Custom、Field、Plugin（多種特殊類型並存）', () => {
    initState();
    const node = getSelectedNode();
    toggleUserType(node, 'Custom');
    toggleUserType(node, 'Field');
    toggleUserType(node, 'Plugin');
    assertTrue(Array.isArray(node.approverSetting.custom));
    assertTrue(node.approverSetting.field !== null);
    assertTrue(node.approverSetting.plugin !== null);
    assertTrue(node.approverSetting.userTypes.includes('Custom'));
    assertTrue(node.approverSetting.userTypes.includes('Field'));
    assertTrue(node.approverSetting.userTypes.includes('Plugin'));
  });
});

describe('state.js - 自訂人員條件 / 欄位權限管理', () => {
  it('setCustomItemType 切換 itemType 應清除舊欄位並補上新類型預設欄位', () => {
    const item = { itemType: 1, deptCode: 'D1', containsChildren: true };
    setCustomItemType(item, 2);
    assertEqual(item.itemType, 2);
    assertEqual(item.jobTitleCode, '');
    assertEqual(item.deptCode, undefined);
  });

  it('addCustomItem / removeCustomItem 應新增與移除清單項目', () => {
    const arr = [];
    addCustomItem(arr);
    assertEqual(arr.length, 1);
    removeCustomItem(arr, 0);
    assertEqual(arr.length, 0);
  });

  it('addFieldPermission / removeFieldPermission 應新增與移除欄位權限（TC-501）', () => {
    initState();
    const node = getSelectedNode();
    addFieldPermission(node);
    assertEqual(node.fieldPermissionSettings.length, 1);
    removeFieldPermission(node, 0);
    assertEqual(node.fieldPermissionSettings.length, 0);
  });
});
