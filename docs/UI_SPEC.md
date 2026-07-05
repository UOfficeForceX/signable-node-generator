# UI 規格

## 1. 整體版面

採三欄式工作區：

```text
┌──────────────┬──────────────────────┬────────────────┐
│ 站點預覽      │ 站點屬性檢視及編輯       │ JSON 預覽        │
└──────────────┴──────────────────────┴────────────────┘
```

三欄用途：

| 欄位 | 名稱 | 用途 |
|---|---|---|
| 左欄 | 站點預覽 | 站點清單、新增、選取、複製、刪除、拖拉排序 |
| 中欄 | 站點屬性檢視及編輯 | 編輯目前選取站點完整屬性 |
| 右欄 | JSON 預覽 | 顯示完整輸出 JSON、複製、下載、關閉預覽 |

## 2. CDN

`index.html` 使用 CDN 載入：

```html
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/sortablejs@1.15.2/Sortable.min.js"></script>
```

## 3. 左欄：站點預覽

### 3.1 功能

- 新增站點。
- 選取站點。
- 複製站點。
- 刪除站點。
- 拖拉排序。
- 顯示站點摘要。

### 3.2 站點摘要

每筆站點顯示：

```text
☰ mySiteCode2
簽核者：Applicant, SuprOfAppl, Field
完成規則：任一決
欄位權限：1 筆
```

### 3.3 拖拉排序

使用 SortableJS。

拖拉完成後：

1. 更新 `appState.signableNodes` 陣列順序。
2. 更新左欄顯示。
3. 更新 JSON 預覽。
4. 執行驗證。

若 SortableJS 載入失敗，建議提供上移 / 下移按鈕作為備援。

## 4. 中欄：站點屬性檢視及編輯

中欄使用 Bootstrap Accordion 分區：

1. 站點基本資料
2. 簽核者設定
3. 簽核完成規則
4. 簽核動作與權限
5. 跳關設定
6. 欄位權限設定

### 4.1 站點基本資料

欄位：

- 站點代碼 `code`
- 給簽核者的話 `note`

### 4.2 簽核者設定

以 checkbox 呈現 `userTypes`（可複選，可同時指定多種簽核者類型）：

- 申請者 `Applicant`
- 申請者直屬主管 `SuprOfAppl`
- 上一站直屬主管 `Supervisor`
- 自訂 `Custom`
- 由欄位 `Field`
- 由外掛欄位 `Plugin`

條件式顯示：

- 勾選 `Custom` 顯示 custom 設定區。
- 勾選 `Field` 顯示 field 設定區。
- 勾選 `Plugin` 顯示 plugin 設定區。

### 4.3 custom 設定 UI

custom 設定可使用 Modal 或 inline list。

每筆 custom 先選擇 `itemType`，再依類型顯示對應欄位。

| itemType | 顯示欄位 |
|---:|---|
| 1 | deptCode, containsChildren |
| 2 | jobTitleCode |
| 3 | jobFuncCode |
| 4 | deptCode, jobTitleCode, containsChildren |
| 5 | deptCode, jobFuncCode, containsChildren |
| 6 | deptCode, containsChildren |
| 7 | deptCode, account |

### 4.4 簽核完成規則

用 radio 或 select：

- `0`：任一決
- `1`：全員決

### 4.5 簽核動作與權限

欄位：

- 是否繼承表單設定 `inherit`
- 允許否決 `allowedDisapprove`
- 允許退簽 `allowedReturn`
- 退簽後直接送回原退簽者 `allowDirectSendToReturner`
- 允許徵詢 `allowedAdditionalBranch`
- 徵詢對象限制 `additionalBranchType`
- 允許加簽 `allowedCounterBranch`
- 加簽對象限制 `counterBranchType`

### 4.6 跳關設定

分兩區：

- 相同簽核者跳關 `skipSetting`
- 找不到簽核者跳關 `noSignerSkipSetting`

每區欄位：

- `inherit`
- `allowedSkip`

### 4.7 欄位權限設定

支援多筆欄位權限。

每筆顯示：

- `fieldCode`
- `fieldParentCode`
- 編輯權限
- 觀看權限

觀看權限不顯示 `required`。

## 5. 右欄：JSON 預覽

### 5.1 功能

- 即時顯示完整 JSON。
- 複製 JSON。
- 下載 JSON。
- 顯示驗證錯誤。
- 關閉 JSON 預覽欄。

### 5.2 JSON 顯示

第一版使用：

```html
<pre id="jsonPreview"></pre>
```

JavaScript 使用：

```javascript
JSON.stringify(data, null, 2)
```

## 6. JSON 預覽關閉 / 開啟

右欄提供「關閉 JSON 預覽」按鈕。

關閉後：

- 右欄完全隱藏。
- 第二個 resizer 隱藏。
- 中欄擴展。
- 工具列顯示「開啟 JSON 預覽」按鈕。

重新開啟後：

- 右欄恢復顯示。
- 優先恢復關閉前欄寬。
- 若無記錄，使用預設寬度 30%。

## 7. 欄寬拖拉

建議使用 CSS Grid：

```css
.app-layout {
  display: grid;
  grid-template-columns: 22% 6px 48% 6px 30%;
  height: calc(100vh - 56px);
}
```

預設寬度：

| 欄位 | 預設寬度 | 最小寬度 |
|---|---:|---:|
| 左欄 | 22% | 240px |
| 中欄 | 48% | 420px |
| 右欄 | 30% | 320px |

JSON 預覽關閉時：

| 欄位 | 預設寬度 |
|---|---:|
| 左欄 | 28% |
| 中欄 | 72% |

拖拉不得讓任一欄低於最小寬度。

## 8. RWD

主要支援桌機與筆電。

- 最低建議寬度：1280px。
- 小於 992px 時可改為上下堆疊：站點預覽 → 站點屬性編輯 → JSON 預覽。
