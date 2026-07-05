# 匯入 / 匯出規格

## 1. 匯入方式

支援兩種：

1. 選擇 `.json` 檔案匯入。
2. 貼上 JSON 文字匯入。

匯入 Modal 建議包含：

- 檔案選擇 input。
- JSON 文字 textarea。
- 匯入按鈕。
- 取消按鈕。
- 驗證錯誤顯示區。

## 2. 匯入格式

接受格式：

```json
{
  "signableNodes": []
}
```

第一版不接受純陣列格式：

```json
[
  { "code": "nodeCode" }
]
```

若使用者匯入純陣列，顯示錯誤：

```text
匯入格式錯誤：根節點必須是包含 signableNodes 的物件。
```

## 3. 匯入流程

```text
使用者選擇 JSON 檔或貼上 JSON
→ 解析 JSON
→ 驗證根節點 signableNodes
→ 驗證每個站點
→ 驗證成功後覆蓋目前 appState.signableNodes
→ 選取第一個站點
→ 重新渲染畫面
→ 更新 JSON 預覽
```

若驗證失敗：

```text
顯示錯誤
不覆蓋目前資料
不切換目前選取站點
```

## 4. 檔案匯入

使用 `FileReader` 讀取 `.json` 檔。

限制：

- 建議只允許 `.json` 副檔名。
- 若使用者選到非 JSON 檔，仍以內容是否能 `JSON.parse()` 成功為準。
- 檔案大小第一版不特別限制，但建議超過 1MB 時顯示提醒。

## 5. 文字匯入

使用者可在 textarea 貼上完整 JSON。

按下匯入時：

- 若 textarea 空白，顯示錯誤。
- 若 JSON.parse 失敗，顯示解析錯誤。
- 若資料結構不符合規格，顯示驗證錯誤。

## 6. 匯出方式

支援：

1. 下載 JSON 檔案。
2. 複製 JSON 到剪貼簿。

## 7. 匯出流程

```text
使用者按下匯出
→ 由 appState 產生 JSON
→ 執行驗證
→ 驗證成功後 JSON.stringify(data, null, 2)
→ 建立 Blob
→ 下載 .json 檔案
```

若驗證失敗：

- 不下載檔案。
- 顯示錯誤清單。

## 8. 複製流程

```text
使用者按下複製
→ 由 appState 產生 JSON
→ 執行驗證
→ 驗證成功後複製到剪貼簿
→ 顯示成功訊息
```

若 Clipboard API 不可用，提供 fallback：

- 選取 JSON 預覽內容。
- 提示使用者手動 Ctrl+C。

## 9. 匯出檔名

預設檔名：

```text
signable-nodes.json
```

可選擇使用日期：

```text
signable-nodes-YYYYMMDD.json
```

## 10. JSON 格式化

匯出與預覽皆使用：

```javascript
JSON.stringify(data, null, 2)
```

## 11. 匯出內容規則

匯出內容固定為：

```json
{
  "signableNodes": []
}
```

站點順序必須等於左欄目前排序。

## 12. 匯出前清理規則

產生匯出 JSON 時，需整理以下內容：

- `viewPermissionSetting` 不輸出 `required`。
- 未使用的 `custom` 建議輸出 `null`。
- 未使用的 `field` 輸出 `null`。
- 未使用的 `plugin` 輸出 `null`。
- `itemType` 只允許 `1` 到 `7`。
- 移除內部 UI 狀態，例如欄寬、是否開啟 JSON 預覽、選取索引等。
