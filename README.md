# 外部簽核站點 JSON 產生器

一個網頁工具，用來產生外部簽核站點設定 JSON。不需要寫程式、不需要安裝任何軟體，開啟網頁即可使用。

## 線上使用

<https://uofficeforcex.github.io/signable-node-generator/>

直接用瀏覽器開啟上方連結即可開始使用；也可以下載本 repository 後直接開啟 `index.html`。

## 這個工具能做什麼

外部程式最終需要一份符合特定格式的簽核站點設定 JSON，根節點固定為：

```json
{
  "signableNodes": []
}
```

透過本工具，你可以用表單操作的方式建立與編輯這份 JSON，不需要手刻 JSON 語法：

- 新增、複製、刪除簽核站點。
- 拖拉調整站點順序（順序即為匯出 JSON 中的陣列順序）。
- 以表單編輯每個站點的簽核者、完成規則、簽核動作、跳關設定與欄位權限等屬性。
- 即時預覽格式化後的 JSON（此欄可關閉、可重新開啟）。
- 匯入既有的 `.json` 檔案或貼上 JSON 文字繼續編輯。
- 匯出 JSON 檔案，或一鍵複製到剪貼簿。
- 匯入、匯出前自動驗證資料，並顯示可理解的錯誤訊息，避免產生不合法的 JSON。

## JSON 格式說明

以下整理自《[外部簽核站點設定開發手冊](https://hackmd.io/@PicaKen/ByjB_LQmzl)》，說明匯出 JSON 的資料結構重點。完整欄位規格請見 [docs/DATA_MODEL.md](docs/DATA_MODEL.md)、[docs/VALIDATION_SPEC.md](docs/VALIDATION_SPEC.md)、[docs/REFERENCE_JSON.md](docs/REFERENCE_JSON.md)。

### 根節點與站點主要欄位

根節點固定為 `signableNodes`（陣列），每個站點物件（`SignableNode`）包含：

| 欄位 | 說明 |
|---|---|
| `code` | 站點代碼（必填，且不可與其他站點重複） |
| `note` | 給簽核者的話（可為 `null`） |
| `approverSetting` | 審核者設定 |
| `completeRuleSetting` | 送單完成規則 |
| `decisionSetting` | 簽核動作與權限設定 |
| `skipSetting` | 相同簽核者跳關設定 |
| `noSignerSkipSetting` | 找不到簽核者時的跳關設定 |
| `fieldPermissionSettings` | 欄位權限設定列表（可為空陣列） |

### 審核者設定（`approverSetting`）

- `userTypes`（必填，可複選）：審核者類型組合。
  - `Applicant`：申請者
  - `SuprOfAppl`：申請者主管
  - `Supervisor`：上一站主管
  - `Custom`：指定人員（需同步設定 `custom`）
  - `Field`：組織欄位（需同步設定 `field`）
  - `Plugin`：外掛欄位（需同步設定 `plugin`）
- `custom`：指定人員／組織架構清單，每筆物件以 `itemType`（`1`~`7`）決定需要填寫的欄位：
  1. 部門（`deptCode`、`containsChildren`）
  2. 職稱（`jobTitleCode`）
  3. 職務（`jobFuncCode`）
  4. 部門 + 職稱（`deptCode`、`jobTitleCode`、`containsChildren`）
  5. 部門 + 職務（`deptCode`、`jobFuncCode`、`containsChildren`）
  6. 部門主管（`deptCode`、`containsChildren`）
  7. 部門人員（`deptCode`、`account`）
- `field`：來自組織欄位（`code`、`signType`：`0` 部門所有人員／`1` 部門主管）。
- `plugin`：來自外掛欄位（`code`、`jsonPath`）。

### 完成規則（`completeRuleSetting`）

- `completeRule`：`0` 任一決（其中一人同意即通過）／`1` 全員決（需全員同意）。

### 簽核動作與權限（`decisionSetting.defaultDecisionSetting`）

- `inherit`：是否繼承表單全域設定。
- `allowedDisapprove` / `allowedReturn`：是否允許「否決」「退簽」。
- `allowDirectSendToReturner`：退簽重送後是否直接送回原退簽者。
- `allowedAdditionalBranch` + `additionalBranchSetting`：是否允許「徵詢」及其對象限制。
- `allowedCounterBranch` + `counterBranchSetting`：是否允許「加簽」及其對象限制。
- `additionalBranchType` / `counterBranchType`：`0` 任何人／`1` 同部門／`2` 指定人員（搭配 `custom` 清單，結構同 `approverSetting.custom`）。

### 跳關設定（`skipSetting` / `noSignerSkipSetting`）

- `inherit`：是否繼承表單設定。
- `allowedSkip`：是否允許跳關（`skipSetting` 為「相同簽核者跳關」，`noSignerSkipSetting` 為「找不到簽核者跳關」）。

### 欄位權限設定（`fieldPermissionSettings`）

- `fieldCode`（必填）：目標欄位代號。
- `fieldParentCode`：父層欄位代號（明細子欄位須填寫）。
- `editPermissionSetting`：編輯權限，包含 `inherit`、`required`、`allowToEdit`、`allowType`（`0` 所有人員／`1` 特定人員）、`custom`。
- `viewPermissionSetting`：觀看權限，欄位同上，但**不包含 `required`**。

### 範例：最簡易站點設定

僅簽核給「申請者」本人確認，採「任一決」，其餘動作與跳關規則皆繼承表單預設：

```json
{
  "signableNodes": [
    {
      "code": "nodeCode",
      "note": null,
      "approverSetting": {
        "userTypes": ["Applicant"],
        "custom": null,
        "field": null,
        "plugin": null
      },
      "decisionSetting": {
        "defaultDecisionSetting": {
          "inherit": true,
          "allowedDisapprove": true,
          "allowedReturn": true,
          "allowDirectSendToReturner": false,
          "allowedAdditionalBranch": false,
          "allowedCounterBranch": false,
          "additionalBranchSetting": { "additionalBranchType": 0, "custom": null },
          "counterBranchSetting": { "counterBranchType": 0, "custom": null }
        }
      },
      "completeRuleSetting": { "completeRule": 0 },
      "noSignerSkipSetting": { "inherit": true, "allowedSkip": false },
      "skipSetting": { "inherit": true, "allowedSkip": true },
      "fieldPermissionSettings": []
    }
  ]
}
```

更多範例（多重審核者類型組合、徵詢／加簽對象限制、欄位權限特定人員設定等進階站點）請見 [docs/REFERENCE_JSON.md](docs/REFERENCE_JSON.md)。

## 授權

詳見 [LICENSE](LICENSE)。

## 開發者資訊

若你要參與開發或了解本工具的規格與實作方式，請參考 [AGENTS.md](AGENTS.md) 與 [docs/](docs/) 目錄下的相關文件。
