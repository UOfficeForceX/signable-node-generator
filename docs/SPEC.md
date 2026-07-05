# 外部簽核站點 JSON 產生器規格書

## 1. 專案目的

建立一個可部署於 GitHub Pages 的純前端靜態工具，讓使用者透過 UI 產生符合外部簽核站點格式的 JSON。

產出 JSON 根節點固定為：

```json
{
  "signableNodes": []
}
```

## 2. 使用對象

- 表單設計者
- 系統管理員
- 導入顧問
- 開發 / 測試人員

## 3. 技術限制

本工具必須符合：

- 靜態網站。
- 可部署到 GitHub Pages。
- 使用 Bootstrap 5 CDN 作為 UI framework。
- 使用 SortableJS CDN 實作站點拖拉排序。
- 使用 Vanilla JavaScript 實作所有業務邏輯。
- 不使用後端、資料庫、登入、npm、build、TypeScript 或 SPA framework。

## 4. 整體 UI

採三欄式：

```text
站點預覽 | 站點屬性檢視及編輯 | JSON 預覽
```

- 左欄：站點預覽與排序。
- 中欄：目前選取站點的屬性檢視與編輯。
- 右欄：完整 JSON 預覽。

三欄寬度可拖拉調整。JSON 預覽欄可完全關閉。

## 5. 功能範圍

### 5.1 站點管理

使用者可：

- 新增站點。
- 選取站點。
- 編輯站點。
- 複製站點。
- 刪除站點。
- 拖拉調整站點順序。

站點顯示順序即為輸出 JSON 的 `signableNodes` 陣列順序。

### 5.2 站點屬性設定

每個站點可設定：

- 站點代碼 `code`
- 給簽核者的話 `note`
- 簽核者設定 `approverSetting`
- 完成規則 `completeRuleSetting`
- 簽核動作設定 `decisionSetting`
- 相同簽核者跳關 `skipSetting`
- 找不到簽核者跳關 `noSignerSkipSetting`
- 欄位權限 `fieldPermissionSettings`

### 5.3 JSON 匯入

支援：

- 選擇 `.json` 檔案匯入。
- 貼上 JSON 文字匯入。

匯入時必須先驗證。驗證失敗時不得覆蓋目前資料。

### 5.4 JSON 匯出

支援：

- 下載 JSON 檔案。
- 複製 JSON 到剪貼簿。

匯出與複製前必須驗證。驗證失敗時不得匯出或複製。

### 5.5 JSON 預覽

右欄即時顯示格式化 JSON。

使用者可完全關閉 JSON 預覽欄，關閉後中欄自動擴展。工具列需提供重新開啟 JSON 預覽的功能。

## 6. 預設資料

首次開啟頁面時，建議建立一個最簡站點：

- `code`: `nodeCode`
- `note`: `null`
- 簽核者：`Applicant`
- 完成規則：任一決 `0`
- 其他動作與跳關設定採預設值
- `fieldPermissionSettings`: `[]`

## 7. 條件式顯示

### 7.1 簽核者設定

`approverSetting.userTypes` 包含：

- `Custom`：顯示 custom 設定區。
- `Field`：顯示 field 設定區。
- `Plugin`：顯示 plugin 設定區。

未包含時，對應設定應輸出 `null`。

### 7.2 徵詢與加簽

- `additionalBranchType = 2` 時，顯示指定人員 custom 設定。
- `counterBranchType = 2` 時，顯示指定人員 custom 設定。
- 類型為 `0` 或 `1` 時，custom 輸出 `null`。

### 7.3 欄位權限

- `allowType = 1` 時，顯示 custom 設定。
- `allowType = 0` 時，custom 輸出 `null`。

## 8. 錯誤訊息

錯誤訊息需讓使用者看得懂，建議格式：

```text
[站點代碼] / [設定區塊]：[錯誤原因]
```

例如：

```text
mySiteCode3 / 簽核者設定：選擇「自訂」時，至少需要設定一筆人員或組織條件。
```

## 9. 非功能需求

- 最低建議桌面寬度：1280px。
- 小於 992px 時可改為上下堆疊。
- CDN 載入失敗時，核心 JSON 邏輯不得依賴 Bootstrap。
- SortableJS 載入失敗時，建議保留上移 / 下移按鈕作為排序備援。
