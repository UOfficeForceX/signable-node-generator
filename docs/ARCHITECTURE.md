# 實作架構規格

## 1. 建議檔案結構

```text
external-signable-node-generator/
├─ index.html
├─ css/
│  └─ style.css
├─ js/
│  ├─ app.js
│  ├─ constants.js
│  ├─ state.js
│  ├─ renderer.js
│  ├─ form-binder.js
│  ├─ generator.js
│  ├─ importer.js
│  ├─ exporter.js
│  ├─ validator.js
│  ├─ drag-drop.js
│  └─ layout-resizer.js
├─ docs/
│  ├─ SPEC.md
│  ├─ DATA_MODEL.md
│  ├─ UI_SPEC.md
│  ├─ VALIDATION_SPEC.md
│  ├─ IMPORT_EXPORT_SPEC.md
│  ├─ ARCHITECTURE.md
│  ├─ COPILOT_TASKS.md
│  ├─ TEST_CASES.md
│  └─ REFERENCE_JSON.md
├─ AGENTS.md
└─ README.md
```

## 2. JavaScript 模組職責

| 檔案 | 職責 |
|---|---|
| `app.js` | 初始化應用程式、載入預設資料、註冊事件 |
| `constants.js` | enum、選項清單、預設值 |
| `state.js` | 管理 `appState`、新增 / 更新 / 刪除 / 排序站點 |
| `renderer.js` | 更新站點清單、表單、JSON 預覽、錯誤訊息 |
| `form-binder.js` | 綁定表單事件，將輸入值同步到 state |
| `generator.js` | 將 state 轉換成最終輸出 JSON |
| `importer.js` | 讀取檔案或貼上文字，解析 JSON |
| `exporter.js` | 下載 JSON、複製 JSON |
| `validator.js` | 驗證 JSON 結構與業務規則 |
| `drag-drop.js` | 整合 SortableJS，處理站點排序 |
| `layout-resizer.js` | 欄寬拖拉、JSON 預覽關閉與開啟 |

## 3. State Model

```javascript
const appState = {
  signableNodes: [],
  selectedNodeIndex: null,
  layout: {
    leftWidth: 22,
    middleWidth: 48,
    rightWidth: 30,
    jsonPreviewVisible: true
  }
};
```

## 4. State 原則

- `appState` 是唯一資料來源。
- UI 由 `appState` render。
- 表單變更只更新 `appState`。
- JSON 匯出只讀取 `appState`。
- DOM 不得作為資料真相來源。

## 5. 預設站點工廠

建議實作：

```javascript
function createDefaultNode() {
  return {
    code: "nodeCode",
    note: null,
    approverSetting: {
      userTypes: ["Applicant"],
      custom: null,
      field: null,
      plugin: null
    },
    completeRuleSetting: {
      completeRule: 0
    },
    decisionSetting: {
      defaultDecisionSetting: {
        inherit: true,
        allowedDisapprove: true,
        allowedReturn: true,
        allowDirectSendToReturner: false,
        allowedAdditionalBranch: false,
        additionalBranchSetting: {
          additionalBranchType: 0,
          custom: null
        },
        allowedCounterBranch: false,
        counterBranchSetting: {
          counterBranchType: 0,
          custom: null
        }
      }
    },
    skipSetting: {
      inherit: true,
      allowedSkip: true
    },
    noSignerSkipSetting: {
      inherit: true,
      allowedSkip: false
    },
    fieldPermissionSettings: []
  };
}
```

## 6. Render 流程

每次 state 變更後執行：

```text
renderSiteList()
renderEditor()
renderJsonPreview()
renderValidationMessages()
```

## 7. Generator 責任

`generator.js` 負責將 state 轉換成乾淨 JSON：

- 移除 layout 狀態。
- 移除 selectedNodeIndex。
- 移除內部 UI 欄位。
- 清理不應輸出的欄位。
- 確保 `viewPermissionSetting` 無 `required`。

## 8. Validator 責任

`validator.js` 應提供：

```javascript
validateRoot(data)
validateNode(node, index)
validateApproverSetting(setting, context)
validateCustomUsers(custom, context)
validateDecisionSetting(setting, context)
validateFieldPermissionSettings(settings, context)
validateExportData(data)
```

回傳格式建議：

```javascript
{
  valid: false,
  errors: [
    {
      path: "signableNodes[0].approverSetting.custom",
      message: "nodeCode / 簽核者設定：選擇自訂時至少需要一筆設定。"
    }
  ]
}
```

## 9. CSS 架構

Bootstrap 處理大部分 UI。自訂 CSS 只負責：

- 三欄 layout。
- resizer 樣式。
- JSON 預覽高度與 overflow。
- 站點卡片 active 狀態。
- 錯誤訊息間距。

## 10. 相依性策略

- Bootstrap 與 SortableJS 透過 CDN 載入。
- 不增加其他相依套件，除非需求明確批准。
- 不加入 package.json。
- 不加入 node_modules。
