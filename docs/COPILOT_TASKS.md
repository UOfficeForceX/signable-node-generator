# Copilot 實作任務拆分

## Task 1：建立靜態專案骨架

目標：建立可直接開啟的靜態頁面。

工作：

- 建立 `index.html`。
- 建立 `css/style.css`。
- 建立 `js/app.js`。
- 載入 Bootstrap 5 CDN。
- 載入 SortableJS CDN。
- 建立 Navbar 與空白三欄 layout。

驗收：

- 開啟 `index.html` 可看到三欄畫面。
- 不需要 npm 或 build。

## Task 2：建立 constants 與 state

工作：

- 建立 `js/constants.js`。
- 建立 enum 常數。
- 建立 `js/state.js`。
- 實作 `appState`。
- 實作 `createDefaultNode()`。

驗收：

- 頁面初始化時產生一個預設站點。

## Task 3：站點清單

工作：

- 左欄顯示站點列表。
- 顯示站點代碼、簽核者摘要、完成規則、欄位權限數量。
- 支援選取站點。

驗收：

- 點選站點時，中欄顯示該站點內容。

## Task 4：站點管理

工作：

- 新增站點。
- 複製站點。
- 刪除站點。
- 刪除前顯示確認。

驗收：

- 左欄列表與 JSON 預覽會同步更新。

## Task 5：拖拉排序

工作：

- 使用 SortableJS 實作左欄拖拉排序。
- 拖拉後同步更新 `appState.signableNodes`。

驗收：

- 拖拉後匯出 JSON 的 `signableNodes` 順序與畫面一致。

## Task 6：站點屬性編輯

工作：

- 實作站點基本資料表單。
- 實作簽核者設定表單。
- 實作完成規則表單。
- 實作簽核動作與權限表單。
- 實作跳關設定表單。
- 實作欄位權限表單。

驗收：

- 修改表單後，state、左欄摘要與 JSON 預覽同步更新。

## Task 7：custom 設定

工作：

- 實作新增 custom item。
- 依 itemType 動態顯示欄位。
- 實作刪除 custom item。

驗收：

- itemType 1 到 7 皆可設定對應欄位。

## Task 8：JSON 預覽

工作：

- 實作 `generator.js`。
- 右欄顯示 `JSON.stringify(data, null, 2)`。
- state 變更時即時更新。

驗收：

- 預覽 JSON 可被 `JSON.parse()` 成功解析。

## Task 9：驗證

工作：

- 實作 `validator.js`。
- 套用 `docs/VALIDATION_SPEC.md` 所有規則。
- 顯示錯誤清單。

驗收：

- 缺少必填欄位時，畫面顯示錯誤。
- `itemType = 0` 被判定為錯誤。
- `viewPermissionSetting.required` 不會出現在輸出 JSON。

## Task 10：匯入 JSON

工作：

- 建立匯入 Modal。
- 支援 `.json` 檔案。
- 支援貼上 JSON。
- 匯入前驗證。

驗收：

- 有效 JSON 可匯入。
- 無效 JSON 不覆蓋目前資料。

## Task 11：匯出與複製

工作：

- 實作下載 JSON。
- 實作複製 JSON。
- 匯出與複製前驗證。

驗收：

- 匯出的 JSON 符合規格。
- 驗證失敗時不可匯出。

## Task 12：欄寬拖拉

工作：

- 實作左右欄 resizer。
- 限制最小寬度。
- 更新 CSS Grid 欄寬。

驗收：

- 使用者可拖拉調整三欄寬度。

## Task 13：JSON 預覽關閉 / 開啟

工作：

- 右欄提供關閉按鈕。
- 工具列提供重新開啟按鈕。
- 關閉後中欄擴展。

驗收：

- JSON 預覽可完全關閉。
- 關閉後可重新開啟。

## Task 14：UI 整理與錯誤訊息

工作：

- 美化 Bootstrap 樣式。
- 整理錯誤訊息。
- 檢查 RWD。
- 檢查無 CDN 時核心功能降級策略。

驗收：

- 使用者可理解每個錯誤原因。
- 桌面解析度使用順暢。
