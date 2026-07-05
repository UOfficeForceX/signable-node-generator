# 驗證規格

## 1. 驗證時機

必須在以下情境驗證：

- 匯入 JSON 後、覆蓋目前資料前。
- 匯出 JSON 前。
- 複製 JSON 前。
- 編輯任何欄位後。
- 新增、刪除、複製、排序站點後。

## 2. Root 驗證

| 規則 | 錯誤訊息 |
|---|---|
| 必須是 Object | 匯入內容必須是 JSON 物件。 |
| 必須有 `signableNodes` | JSON 必須包含 signableNodes 根節點。 |
| `signableNodes` 必須是 Array | signableNodes 必須是陣列。 |

## 3. SignableNode 驗證

每個站點必須符合：

| 欄位 | 規則 |
|---|---|
| `code` | 必填，不可空白 |
| `code` | 不可與其他站點的 `code` 重複（同一份 JSON 內所有站點代碼須唯一） |
| `approverSetting` | 必填 |
| `completeRuleSetting` | 必填 |
| `decisionSetting` | 必填 |
| `skipSetting` | 必填 |
| `noSignerSkipSetting` | 必填 |
| `fieldPermissionSettings` | 必須是 Array，可為空陣列 |

建議錯誤格式：

```text
[站點代碼或第 N 站] / [區塊]：[錯誤原因]
```

## 4. approverSetting 驗證

| 欄位 | 規則 |
|---|---|
| `userTypes` | 必填，必須是 Array，至少一筆 |
| `userTypes[]` | 只能是 `Applicant`, `SuprOfAppl`, `Supervisor`, `Custom`, `Field`, `Plugin` |
| 包含 `Custom` | `custom` 必須至少一筆 |
| 包含 `Field` | `field.code` 必填 |
| 包含 `Plugin` | `plugin.code` 與 `plugin.jsonPath` 必填 |

當 `userTypes` 不包含 `Custom` 時，`custom` 應為 `null` 或空陣列；匯出時建議輸出 `null`。

當 `userTypes` 不包含 `Field` 時，`field` 應為 `null`。

當 `userTypes` 不包含 `Plugin` 時，`plugin` 應為 `null`。

## 5. custom 驗證

所有 custom 陣列皆套用此規則，包括：

- `approverSetting.custom`
- `additionalBranchSetting.custom`
- `counterBranchSetting.custom`
- `editPermissionSetting.custom`
- `viewPermissionSetting.custom`

### 5.1 itemType 合法值

`itemType` 必須為 `1` 到 `7`。

`itemType = 0` 不合法，不得輸出。

### 5.2 itemType 必填欄位

| itemType | 類型 | 必填欄位 |
|---:|---|---|
| 1 | 部門 | `deptCode`, `containsChildren` |
| 2 | 職稱 | `jobTitleCode` |
| 3 | 職務 | `jobFuncCode` |
| 4 | 部門 + 職稱 | `deptCode`, `jobTitleCode`, `containsChildren` |
| 5 | 部門 + 職務 | `deptCode`, `jobFuncCode`, `containsChildren` |
| 6 | 部門主管 | `deptCode`, `containsChildren` |
| 7 | 部門人員 | `deptCode`, `account` |

`containsChildren` 是 Boolean 欄位，必須明確為 `true` 或 `false`，不可用空字串代替。

## 6. field 驗證

當 `userTypes` 包含 `Field`：

- `field` 必須存在。
- `field.code` 必填。
- 若欄位類型為選擇部門，`field.signType` 必填且只能為 `0` 或 `1`。
- 若欄位類型為選擇人員，`field.signType` 可為 `null` 或省略。

由於本工具未串接欄位 metadata，第一版可讓使用者自行選擇欄位類型：

- 選擇人員欄位
- 選擇部門欄位

若使用者選擇「選擇部門欄位」，需顯示並驗證 `signType`。

## 7. plugin 驗證

當 `userTypes` 包含 `Plugin`：

- `plugin` 必須存在。
- `plugin.code` 必填。
- `plugin.jsonPath` 必填。

## 8. completeRuleSetting 驗證

| 欄位 | 規則 |
|---|---|
| `completeRule` | 必須為 `0` 或 `1` |

## 9. decisionSetting 驗證

### 9.1 additionalBranchSetting

當 `allowedAdditionalBranch = true`：

| additionalBranchType | 規則 |
|---:|---|
| 0 | custom 應為 null |
| 1 | custom 應為 null |
| 2 | custom 必須至少一筆，且每筆通過 custom 驗證 |

當 `allowedAdditionalBranch = false`：

- `additionalBranchSetting` 可保留預設物件。
- 建議輸出 `additionalBranchType = 0`、`custom = null`。

### 9.2 counterBranchSetting

當 `allowedCounterBranch = true`：

| counterBranchType | 規則 |
|---:|---|
| 0 | custom 應為 null |
| 1 | custom 應為 null |
| 2 | custom 必須至少一筆，且每筆通過 custom 驗證 |

當 `allowedCounterBranch = false`：

- `counterBranchSetting` 可保留預設物件。
- 建議輸出 `counterBranchType = 0`、`custom = null`。

## 10. skipSetting / noSignerSkipSetting 驗證

| 欄位 | 規則 |
|---|---|
| `inherit` | 必須是 Boolean |
| `allowedSkip` | 必須是 Boolean |

## 11. fieldPermissionSettings 驗證

每筆欄位權限：

| 欄位 | 規則 |
|---|---|
| `fieldCode` | 必填 |
| `fieldParentCode` | 一般欄位可為 null；明細子欄位必填 |
| `editPermissionSetting` | 必填 |
| `viewPermissionSetting` | 必填 |

### 11.1 editPermissionSetting

| 欄位 | 規則 |
|---|---|
| `inherit` | Boolean |
| `required` | Boolean 或 null |
| `allowToEdit` | Boolean |
| `allowType` | 只能為 `0` 或 `1` |
| `custom` | `allowType = 1` 時至少一筆；`allowType = 0` 時為 null |

### 11.2 viewPermissionSetting

| 欄位 | 規則 |
|---|---|
| `inherit` | Boolean |
| `required` | 不得輸出 |
| `allowToEdit` | Boolean，代表是否允許觀看 |
| `allowType` | 只能為 `0` 或 `1` |
| `custom` | `allowType = 1` 時至少一筆；`allowType = 0` 時為 null |

## 12. JSON 格式驗證

- 匯出 JSON 必須可被 `JSON.parse()` 成功解析。
- 不得包含 trailing comma。
- 不得輸出 `undefined`。
- 不得輸出 function。
- 日期、布林與數字不得輸出成錯誤型別。

## 13. 匯入失敗處理

匯入驗證失敗時：

- 不覆蓋目前 `appState`。
- 顯示錯誤清單。
- 保留目前畫面資料。
- 讓使用者可修正貼上的 JSON 後重新匯入。
