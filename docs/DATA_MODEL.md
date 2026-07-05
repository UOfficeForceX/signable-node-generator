# JSON 資料模型規格

## 1. Root

```json
{
  "signableNodes": []
}
```

| 欄位 | 型別 | 必填 | 說明 |
|---|---|---:|---|
| `signableNodes` | Array | 是 | 簽核站點設定列表 |

## 2. SignableNode

| 欄位 | 型別 | 必填 | 說明 |
|---|---|---:|---|
| `code` | String | 是 | 站點代碼 |
| `note` | String / null | 否 | 給簽核者的話 |
| `approverSetting` | Object | 是 | 簽核者設定 |
| `completeRuleSetting` | Object | 是 | 站點完成規則 |
| `decisionSetting` | Object | 是 | 簽核動作與權限 |
| `skipSetting` | Object | 是 | 相同簽核者跳關 |
| `noSignerSkipSetting` | Object | 是 | 找不到簽核者跳關 |
| `fieldPermissionSettings` | Array | 是 | 欄位權限設定，可為空陣列 |

## 3. approverSetting

```json
{
  "userTypes": [],
  "custom": null,
  "field": null,
  "plugin": null
}
```

| 欄位 | 型別 | 必填 | 說明 |
|---|---|---:|---|
| `userTypes` | Array<String> | 是 | 審核者類型，至少一筆 |
| `custom` | Array / null | 條件式 | 指定人員或組織條件 |
| `field` | Object / null | 條件式 | 由欄位決定簽核者 |
| `plugin` | Object / null | 條件式 | 由外掛欄位決定簽核者 |

### 3.1 userTypes

| 值 | 說明 |
|---|---|
| `Applicant` | 申請者 |
| `SuprOfAppl` | 申請者直屬主管 |
| `Supervisor` | 上一站直屬主管 |
| `Custom` | 自訂 |
| `Field` | 由欄位 |
| `Plugin` | 由外掛欄位 |

### 3.2 custom itemType

合法值為 `1` 到 `7`。`0` 僅可視為文件樣板 placeholder，產生器不得輸出。

| itemType | 類型 | 必填欄位 |
|---:|---|---|
| 1 | 部門 | `deptCode`, `containsChildren` |
| 2 | 職稱 | `jobTitleCode` |
| 3 | 職務 | `jobFuncCode` |
| 4 | 部門 + 職稱 | `deptCode`, `jobTitleCode`, `containsChildren` |
| 5 | 部門 + 職務 | `deptCode`, `jobFuncCode`, `containsChildren` |
| 6 | 部門主管 | `deptCode`, `containsChildren` |
| 7 | 部門人員 | `deptCode`, `account` |

### 3.3 field

```json
{
  "code": "deptFieldCode",
  "signType": 0
}
```

| 欄位 | 型別 | 必填 | 說明 |
|---|---|---:|---|
| `code` | String | 是 | 欄位代碼 |
| `signType` | Integer / null | 條件式 | 當欄位為選擇部門時使用 |

`signType`：

| 值 | 說明 |
|---:|---|
| 0 | 部門所有人員 |
| 1 | 部門主管 |

若 `field.code` 指向選擇部門欄位，`signType` 必填。若未傳入，後端系統預設為 `0`，但產生器建議明確輸出。

若 `field.code` 指向選擇人員欄位，`signType` 可省略或為 `null`。

### 3.4 plugin

```json
{
  "code": "myPluginCode",
  "jsonPath": "signUsers"
}
```

| 欄位 | 型別 | 必填 | 說明 |
|---|---|---:|---|
| `code` | String | 是 | 外掛欄位代碼 |
| `jsonPath` | String | 是 | 選人元件內容的 JSON 路徑 |

## 4. completeRuleSetting

```json
{
  "completeRule": 0
}
```

| completeRule | 說明 |
|---:|---|
| 0 | 任一決，其中一人同意即通過當站 |
| 1 | 全員決，需所有審核人皆同意才通過當站 |

## 5. decisionSetting

```json
{
  "defaultDecisionSetting": {
    "inherit": true,
    "allowedDisapprove": true,
    "allowedReturn": true,
    "allowDirectSendToReturner": false,
    "allowedAdditionalBranch": false,
    "additionalBranchSetting": {
      "additionalBranchType": 0,
      "custom": null
    },
    "allowedCounterBranch": false,
    "counterBranchSetting": {
      "counterBranchType": 0,
      "custom": null
    }
  }
}
```

### 5.1 defaultDecisionSetting

| 欄位 | 型別 | 說明 |
|---|---|---|
| `inherit` | Boolean | 是否繼承全域表單設定 |
| `allowedDisapprove` | Boolean / null | 是否允許否決 |
| `allowedReturn` | Boolean | 是否允許退簽 |
| `allowDirectSendToReturner` | Boolean | 退簽重送後是否直接送回原退簽者 |
| `allowedAdditionalBranch` | Boolean | 是否允許徵詢 |
| `additionalBranchSetting` | Object | 徵詢對象限制 |
| `allowedCounterBranch` | Boolean | 是否允許加簽 |
| `counterBranchSetting` | Object | 加簽對象限制 |

### 5.2 additionalBranchType / counterBranchType

| 值 | 說明 |
|---:|---|
| 0 | 任何人 |
| 1 | 同部門 |
| 2 | 指定人員 |

當值為 `2` 時，`custom` 至少一筆。當值為 `0` 或 `1` 時，`custom` 應為 `null`。

## 6. skipSetting / noSignerSkipSetting

```json
{
  "inherit": true,
  "allowedSkip": true
}
```

| 欄位 | 型別 | 說明 |
|---|---|---|
| `inherit` | Boolean | 是否繼承表單設定 |
| `allowedSkip` | Boolean | 是否允許跳關 |

## 7. fieldPermissionSettings

```json
{
  "fieldCode": "myFieldCode",
  "fieldParentCode": null,
  "editPermissionSetting": {},
  "viewPermissionSetting": {}
}
```

| 欄位 | 型別 | 必填 | 說明 |
|---|---|---:|---|
| `fieldCode` | String | 是 | 目標欄位代號 |
| `fieldParentCode` | String / null | 條件式 | 明細子欄位需填父層欄位代號 |
| `editPermissionSetting` | Object | 是 | 欄位編輯權限 |
| `viewPermissionSetting` | Object | 是 | 欄位觀看權限 |

### 7.1 editPermissionSetting

```json
{
  "inherit": false,
  "required": false,
  "allowToEdit": true,
  "allowType": 0,
  "custom": null
}
```

| 欄位 | 型別 | 說明 |
|---|---|---|
| `inherit` | Boolean | 是否繼承 |
| `required` | Boolean / null | 是否必填 |
| `allowToEdit` | Boolean | 是否允許編輯 |
| `allowType` | Integer | 允許編輯範圍 |
| `custom` | Array / null | 特定人員名單 |

### 7.2 viewPermissionSetting

```json
{
  "inherit": false,
  "allowToEdit": true,
  "allowType": 0,
  "custom": null
}
```

注意：`viewPermissionSetting` 不得輸出 `required`。

在 `viewPermissionSetting` 中，`allowToEdit` 代表是否允許觀看該欄位，雖然屬性名稱仍為 `allowToEdit`。

### 7.3 allowType

| allowType | 說明 |
|---:|---|
| 0 | 所有人員 |
| 1 | 特定人員 |

當 `allowType = 1` 時，`custom` 至少一筆。當 `allowType = 0` 時，`custom` 應為 `null`。
