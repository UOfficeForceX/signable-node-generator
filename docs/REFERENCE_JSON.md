# 參考 JSON

本文件整理產生器需輸出的 JSON 參考格式。正式欄位規格以 `DATA_MODEL.md` 與 `VALIDATION_SPEC.md` 為準。

## 1. 最簡站點

```json
{
  "signableNodes": [
    {
      "code": "nodeCode",
      "note": null,
      "approverSetting": {
        "userTypes": [
          "Applicant"
        ],
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
          "additionalBranchSetting": {
            "additionalBranchType": 0,
            "custom": null
          },
          "counterBranchSetting": {
            "counterBranchType": 0,
            "custom": null
          }
        }
      },
      "completeRuleSetting": {
        "completeRule": 0
      },
      "noSignerSkipSetting": {
        "inherit": true,
        "allowedSkip": false
      },
      "skipSetting": {
        "inherit": true,
        "allowedSkip": true
      },
      "fieldPermissionSettings": []
    }
  ]
}
```

## 2. 進階站點範例

```json
{
  "signableNodes": [
    {
      "code": "mySiteCode2",
      "note": "欄位備註說明",
      "approverSetting": {
        "userTypes": [
          "Applicant",
          "SuprOfAppl",
          "Supervisor",
          "Field"
        ],
        "custom": [],
        "field": {
          "code": "deptFieldCode",
          "signType": 0
        },
        "plugin": null
      },
      "decisionSetting": {
        "defaultDecisionSetting": {
          "allowedDisapprove": true,
          "allowedReturn": true,
          "allowDirectSendToReturner": false,
          "inherit": true,
          "allowedAdditionalBranch": true,
          "additionalBranchSetting": {
            "additionalBranchType": 0,
            "custom": null
          },
          "allowedCounterBranch": true,
          "counterBranchSetting": {
            "counterBranchType": 2,
            "custom": [
              {
                "itemType": 7,
                "account": "myAccount",
                "deptCode": "myDeptCode"
              }
            ]
          }
        }
      },
      "completeRuleSetting": {
        "completeRule": 0
      },
      "skipSetting": {
        "inherit": true,
        "allowedSkip": true
      },
      "noSignerSkipSetting": {
        "inherit": false,
        "allowedSkip": true
      },
      "fieldPermissionSettings": [
        {
          "fieldCode": "myFieldCode",
          "fieldParentCode": null,
          "editPermissionSetting": {
            "inherit": false,
            "required": false,
            "allowToEdit": true,
            "allowType": 0,
            "custom": null
          },
          "viewPermissionSetting": {
            "inherit": false,
            "allowToEdit": true,
            "allowType": 0,
            "custom": null
          }
        }
      ]
    }
  ]
}
```

## 3. 注意事項

- 產生器輸出不得包含 trailing comma。
- `viewPermissionSetting` 不得輸出 `required`。
- `itemType` 不得為 `0`。
- JSON 屬性名稱需維持 camelCase。
- 未使用的 `field` 與 `plugin` 建議輸出 `null`。
