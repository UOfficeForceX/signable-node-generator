// 由 state 產生最終輸出 JSON

function generateOutputJson() {
  return { signableNodes: appState.signableNodes.map(cleanNodeForExport) };
}

function cleanNodeForExport(node) {
  const clone = deepClone(node);
  delete clone._uid;
  delete clone._ui;
  (clone.fieldPermissionSettings || []).forEach((fp) => {
    if (fp.viewPermissionSetting && Object.prototype.hasOwnProperty.call(fp.viewPermissionSetting, 'required')) {
      delete fp.viewPermissionSetting.required;
    }
  });
  return clone;
}
