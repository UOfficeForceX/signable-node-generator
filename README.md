# 外部簽核站點 JSON 產生器

## 專案目的

本專案建立一個可部署於 GitHub Pages 的純前端工具，用來產生外部簽核站點設定 JSON。

外部程式最後需回傳以下根節點：

```json
{
  "signableNodes": []
}
```

每個站點物件包含簽核者設定、完成規則、簽核動作、跳關設定與欄位權限設定。

## 技術方向

- HTML
- CSS
- Vanilla JavaScript
- Bootstrap 5 CDN
- SortableJS CDN
- GitHub Pages 靜態部署

## 不使用項目

- 後端服務
- 資料庫
- 登入系統
- npm
- build 流程
- TypeScript
- Angular / React / Vue

## 主要功能

- 新增多個簽核站點。
- 左欄拖拉調整站點順序。
- 中欄編輯站點屬性。
- 右欄即時預覽 JSON。
- JSON 預覽欄可完全關閉。
- 匯入 JSON 檔案。
- 貼上 JSON 匯入。
- 匯出 JSON 檔案。
- 複製 JSON 到剪貼簿。
- 匯入與匯出前執行驗證。

## 線上展示

本專案已部署至 GitHub Pages：

<https://uofficeforcex.github.io/signable-node-generator/>

推送到 `main` 分支時，`.github/workflows/deploy-pages.yml` 會自動建置並部署最新內容，無需手動操作。

## 自動化測試

直接在瀏覽器開啟 `tests.html` 即可執行自動化測試（純 Vanilla JS，無需 npm / build）。測試涵蓋 `state.js`、`generator.js`、`validator.js`、`importer.js` 的邏輯行為，測試結果會顯示在頁面標題與畫面上。

## 文件結構

```text
AGENTS.md
LICENSE
README.md
index.html
tests.html
css/
  style.css
docs/
  SPEC.md
  DATA_MODEL.md
  UI_SPEC.md
  VALIDATION_SPEC.md
  IMPORT_EXPORT_SPEC.md
  ARCHITECTURE.md
  COPILOT_TASKS.md
  TEST_CASES.md
  REFERENCE_JSON.md
js/
  app.js
  constants.js
  state.js
  renderer.js
  form-binder.js
  generator.js
  importer.js
  exporter.js
  validator.js
  drag-drop.js
  layout-resizer.js
  tests/
    test-framework.js
    state.test.js
    generator.test.js
    validator.test.js
    importer.test.js
    run-tests.js
.github/
  workflows/
    deploy-pages.yml
```

## 建議開發方式

AI coding agent 應先閱讀：

1. `AGENTS.md`
2. `docs/SPEC.md`
3. `docs/DATA_MODEL.md`
4. `docs/UI_SPEC.md`
5. `docs/VALIDATION_SPEC.md`
6. `docs/IMPORT_EXPORT_SPEC.md`
7. `docs/COPILOT_TASKS.md`

## 部署方式

實作檔案放在 repository root（`index.html`、`css/style.css`、`js/*.js`）。

推送到 `main` 分支後，`.github/workflows/deploy-pages.yml` 會自動將 repository root 建置並部署到 GitHub Pages，無需手動設定 Pages Source 目錄。
