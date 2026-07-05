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

## 文件結構

```text
AGENTS.md
README.md
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

將完成後的靜態檔案推送至 GitHub repository，並設定 GitHub Pages 指向 repository root 或 `/docs` 以外的實際靜態網站目錄。

本規格建議實作檔案放在 repository root：

```text
index.html
css/style.css
js/*.js
```
