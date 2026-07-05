// 集中管理 appState 與狀態異動
// 注意：node._uid 與 node._ui 為畫面內部使用的輔助欄位，generator.js 匯出前會移除。

const appState = {
  signableNodes: [],
  selectedNodeIndex: null,
  layout: { ...DEFAULT_LAYOUT }
};

let _uidCounter = 0;
function generateUid() {
  _uidCounter += 1;
  return `n${Date.now().toString(36)}_${_uidCounter}`;
}

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function getPath(obj, path) {
  return path.split('.').reduce((acc, key) => (acc == null ? acc : acc[key]), obj);
}

function setPath(obj, path, value) {
  const keys = path.split('.');
  const last = keys.pop();
  const target = keys.reduce((acc, key) => {
    if (acc[key] === undefined || acc[key] === null) acc[key] = {};
    return acc[key];
  }, obj);
  target[last] = value;
}

function createDefaultCustomItem() {
  return { itemType: 1, deptCode: '', containsChildren: false };
}

function createDefaultFieldPermission() {
  return {
    fieldCode: '',
    fieldParentCode: null,
    editPermissionSetting: {
      inherit: false,
      required: false,
      allowToEdit: true,
      allowType: 0,
      custom: null
    },
    viewPermissionSetting: {
      inherit: false,
      allowToEdit: true,
      allowType: 0,
      custom: null
    }
  };
}

function createDefaultNode() {
  return {
    _uid: generateUid(),
    _ui: { approverFieldKind: 'person' },
    code: 'nodeCode',
    note: null,
    approverSetting: {
      userTypes: ['Applicant'],
      custom: null,
      field: null,
      plugin: null
    },
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
}

function initState() {
  const node = createDefaultNode();
  appState.signableNodes = [node];
  appState.selectedNodeIndex = 0;
}

function getSelectedNode() {
  if (appState.selectedNodeIndex == null) return null;
  return appState.signableNodes[appState.selectedNodeIndex] || null;
}

function addNode() {
  const node = createDefaultNode();
  appState.signableNodes.push(node);
  appState.selectedNodeIndex = appState.signableNodes.length - 1;
}

function generateUniqueCode(baseCode) {
  const existing = new Set(appState.signableNodes.map((n) => n.code));
  let candidate = `${baseCode}_copy`;
  let i = 2;
  while (existing.has(candidate)) {
    candidate = `${baseCode}_copy${i}`;
    i += 1;
  }
  return candidate;
}

function duplicateNode(index) {
  const original = appState.signableNodes[index];
  if (!original) return;
  const clone = deepClone(original);
  clone._uid = generateUid();
  clone.code = generateUniqueCode(original.code);
  appState.signableNodes.splice(index + 1, 0, clone);
  appState.selectedNodeIndex = index + 1;
}

function deleteNode(index) {
  appState.signableNodes.splice(index, 1);
  if (appState.signableNodes.length === 0) {
    appState.selectedNodeIndex = null;
  } else if (appState.selectedNodeIndex >= appState.signableNodes.length) {
    appState.selectedNodeIndex = appState.signableNodes.length - 1;
  } else if (index < appState.selectedNodeIndex) {
    appState.selectedNodeIndex -= 1;
  }
}

function selectNode(index) {
  appState.selectedNodeIndex = index;
}

function swapNodes(i, j) {
  const arr = appState.signableNodes;
  const selected = appState.selectedNodeIndex;
  const tmp = arr[i];
  arr[i] = arr[j];
  arr[j] = tmp;
  if (selected === i) appState.selectedNodeIndex = j;
  else if (selected === j) appState.selectedNodeIndex = i;
}

function moveNodeUp(index) {
  if (index <= 0) return;
  swapNodes(index, index - 1);
}

function moveNodeDown(index) {
  if (index >= appState.signableNodes.length - 1) return;
  swapNodes(index, index + 1);
}

function reorderNodes(oldIndex, newIndex) {
  const arr = appState.signableNodes;
  const selected = appState.selectedNodeIndex != null ? arr[appState.selectedNodeIndex] : null;
  const selectedUid = selected ? selected._uid : null;
  const [moved] = arr.splice(oldIndex, 1);
  arr.splice(newIndex, 0, moved);
  if (selectedUid != null) {
    appState.selectedNodeIndex = arr.findIndex((n) => n._uid === selectedUid);
  }
}

function toggleUserType(node, type) {
  const setting = node.approverSetting;
  const idx = setting.userTypes.indexOf(type);
  if (idx >= 0) {
    setting.userTypes.splice(idx, 1);
  } else {
    setting.userTypes.push(type);
  }
  const has = (t) => setting.userTypes.includes(t);
  if (has('Custom')) {
    if (!Array.isArray(setting.custom)) setting.custom = [];
  } else {
    setting.custom = null;
  }
  if (has('Field')) {
    if (!setting.field) setting.field = { code: '', signType: null };
  } else {
    setting.field = null;
  }
  if (has('Plugin')) {
    if (!setting.plugin) setting.plugin = { code: '', jsonPath: '' };
  } else {
    setting.plugin = null;
  }
}

function setApproverFieldKind(node, kind) {
  node._ui.approverFieldKind = kind;
  if (!node.approverSetting.field) return;
  if (kind === 'dept') {
    node.approverSetting.field.signType = node.approverSetting.field.signType != null
      ? node.approverSetting.field.signType
      : 0;
  } else {
    node.approverSetting.field.signType = null;
  }
}

function addCustomItem(customArray) {
  customArray.push(createDefaultCustomItem());
}

function removeCustomItem(customArray, idx) {
  customArray.splice(idx, 1);
}

function setCustomItemType(item, itemType) {
  Object.keys(item).forEach((key) => {
    if (key !== 'itemType') delete item[key];
  });
  item.itemType = itemType;
  Object.assign(item, buildCustomFieldDefaults(itemType));
}

function buildCustomFieldDefaults(itemType) {
  switch (itemType) {
    case 1: return { deptCode: '', containsChildren: false };
    case 2: return { jobTitleCode: '' };
    case 3: return { jobFuncCode: '' };
    case 4: return { deptCode: '', jobTitleCode: '', containsChildren: false };
    case 5: return { deptCode: '', jobFuncCode: '', containsChildren: false };
    case 6: return { deptCode: '', containsChildren: false };
    case 7: return { deptCode: '', account: '' };
    default: return {};
  }
}

function addFieldPermission(node) {
  node.fieldPermissionSettings.push(createDefaultFieldPermission());
}

function removeFieldPermission(node, idx) {
  node.fieldPermissionSettings.splice(idx, 1);
}
