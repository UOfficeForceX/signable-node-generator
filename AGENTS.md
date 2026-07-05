# AGENTS.md

## 1. 專案目標

建立一個可部署到 GitHub Pages 的「外部簽核站點 JSON 產生器」。

本工具用來產生外部程式需回傳的簽核站點設定 JSON，根節點固定為：

```json
{
  "signableNodes": []
}
```

每一個 `signableNodes` 站點物件必須符合 `docs/DATA_MODEL.md`、`docs/VALIDATION_SPEC.md` 與 `docs/REFERENCE_JSON.md` 定義。

## 2. 技術限制

本專案必須是純前端靜態網站，可直接部署於 GitHub Pages。

允許使用：

- HTML
- CSS
- Vanilla JavaScript
- Bootstrap 5 CDN
- SortableJS CDN

禁止使用：

- Node.js 後端
- npm install
- npm run build
- TypeScript
- Angular
- React
- Vue
- Vite
- Webpack
- 資料庫
- 登入 / 權限系統
- Server-side API

所有功能必須可直接透過瀏覽器開啟 `index.html` 執行。

## 3. UI 版面要求

畫面採三欄式工作區：

1. 左欄：站點預覽
2. 中欄：站點屬性檢視及編輯
3. 右欄：JSON 預覽

要求：

- 三欄寬度可拖拉調整。
- JSON 預覽欄可完全關閉。
- JSON 預覽關閉後，中欄需自動擴展。
- JSON 預覽關閉後，需可重新開啟。
- 左欄站點清單需支援拖拉排序。
- 左欄站點順序必須等於匯出 JSON 中 `signableNodes` 陣列順序。

詳見 `docs/UI_SPEC.md`。

## 4. 核心功能

必須實作以下功能：

1. 新增簽核站點。
2. 選取簽核站點。
3. 編輯目前選取站點的屬性。
4. 複製簽核站點。
5. 刪除簽核站點。
6. 拖拉排序簽核站點。
7. 從 `.json` 檔匯入 JSON。
8. 從貼上文字匯入 JSON。
9. 匯入前驗證 JSON；驗證失敗不可覆蓋目前資料。
10. 匯出 JSON 檔。
11. 複製 JSON 到剪貼簿。
12. 顯示格式化 JSON 預覽。
13. 顯示使用者可理解的驗證錯誤訊息。

## 5. JSON 合約規則

產生器輸出的 JSON 必須符合以下規則：

- 根節點固定為 `signableNodes`。
- `signableNodes` 必須是 Array。
- 不得輸出不合法 JSON。
- 不得輸出 trailing comma。
- JSON 屬性名稱必須使用規格定義的 camelCase。
- 不得輸出 `itemType: 0`。
- `itemType` 合法值為 `1` 到 `7`。
- `viewPermissionSetting` 不得輸出 `required` 屬性。
- `completeRule` 合法值為 `0` 或 `1`。
- `additionalBranchType` 與 `counterBranchType` 合法值為 `0`、`1`、`2`。
- `allowType` 合法值為 `0` 或 `1`。

詳見：

- `docs/DATA_MODEL.md`
- `docs/VALIDATION_SPEC.md`
- `docs/REFERENCE_JSON.md`

## 6. 建議實作架構

請依下列檔案職責實作：

- `js/app.js`：應用程式初始化。
- `js/constants.js`：enum、選項、預設值。
- `js/state.js`：集中管理 `appState` 與狀態異動。
- `js/renderer.js`：渲染左欄站點清單、中欄表單、右欄 JSON 預覽與錯誤訊息。
- `js/form-binder.js`：表單事件綁定與 state 更新。
- `js/generator.js`：由 state 產生最終 JSON。
- `js/importer.js`：匯入檔案與貼上文字解析。
- `js/exporter.js`：下載 JSON 與複製到剪貼簿。
- `js/validator.js`：驗證 state 與匯入 JSON。
- `js/drag-drop.js`：整合 SortableJS 實作站點排序。
- `js/layout-resizer.js`：三欄寬度拖拉、JSON 預覽關閉與重新開啟。

## 7. State 原則

使用單一應用狀態作為資料來源：

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

所有畫面都必須由 `appState` 渲染。

禁止把 DOM 當成主要資料來源。

## 8. 驗證政策

以下情境必須執行驗證：

- 匯入 JSON 後、覆蓋目前資料前。
- 匯出 JSON 前。
- 複製 JSON 前。
- 編輯表單欄位後。
- 新增、刪除、複製或排序站點後。

若匯入驗證失敗，不得覆蓋目前 state。

若匯出驗證失敗，不得下載或複製 JSON。

## 9. 實作順序

建議依此順序實作：

1. 建立靜態專案骨架與 CDN 載入。
2. 建立三欄式 layout。
3. 建立 state 與預設站點資料。
4. 實作站點清單顯示。
5. 實作新增、選取、複製、刪除站點。
6. 實作拖拉排序。
7. 實作站點屬性編輯表單。
8. 實作 JSON 產生與預覽。
9. 實作驗證。
10. 實作匯入 JSON。
11. 實作匯出與複製 JSON。
12. 實作欄寬拖拉。
13. 實作 JSON 預覽關閉與重新開啟。
14. 整理錯誤訊息與 UI 細節。

## 10. Definition of Done

完成條件：

- 可直接開啟 `index.html` 執行。
- 可部署到 GitHub Pages，不需 build。
- 可建立多個站點。
- 可拖拉排序站點。
- 可匯入有效 JSON。
- 匯入無效 JSON 時不覆蓋目前資料。
- 可匯出有效 JSON。
- 可複製 JSON。
- JSON 預覽可關閉與重新開啟。
- 三欄寬度可拖拉調整。
- 輸出 JSON 通過所有驗證規則。
