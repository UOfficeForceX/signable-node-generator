# 測試案例

## 1. 初始化

| 編號 | 測試項目 | 預期結果 |
|---|---|---|
| TC-001 | 開啟 `index.html` | 頁面正常顯示三欄 layout |
| TC-002 | 首次開啟 | 左欄至少有一個預設站點 |
| TC-003 | JSON 預覽 | 顯示 `{ "signableNodes": [...] }` |

## 2. 站點管理

| 編號 | 測試項目 | 預期結果 |
|---|---|---|
| TC-101 | 新增站點 | 左欄新增一筆站點，JSON 預覽同步更新 |
| TC-102 | 選取站點 | 中欄顯示該站點屬性 |
| TC-103 | 複製站點 | 新增一筆內容相同但 code 可調整的站點 |
| TC-104 | 刪除站點 | 站點從清單與 JSON 中移除 |
| TC-105 | 拖拉排序 | 匯出 JSON 順序與左欄一致 |

## 3. 簽核者設定

| 編號 | 測試項目 | 預期結果 |
|---|---|---|
| TC-201 | 勾選 Applicant | userTypes 包含 `Applicant` |
| TC-202 | 勾選 Custom 但未設定 custom | 顯示驗證錯誤 |
| TC-203 | Custom itemType = 1 且缺 deptCode | 顯示驗證錯誤 |
| TC-204 | Custom itemType = 2 且有 jobTitleCode | 驗證成功 |
| TC-205 | Custom itemType = 7 且有 deptCode、account | 驗證成功 |
| TC-206 | itemType = 0 | 顯示驗證錯誤 |
| TC-207 | 勾選 Field 但 field.code 空白 | 顯示驗證錯誤 |
| TC-208 | 勾選 Plugin 但 jsonPath 空白 | 顯示驗證錯誤 |

## 4. 完成規則

| 編號 | 測試項目 | 預期結果 |
|---|---|---|
| TC-301 | completeRule = 0 | 顯示任一決，JSON 輸出 0 |
| TC-302 | completeRule = 1 | 顯示全員決，JSON 輸出 1 |
| TC-303 | 匯入 completeRule = 2 | 匯入驗證失敗 |

## 5. 簽核動作與權限

| 編號 | 測試項目 | 預期結果 |
|---|---|---|
| TC-401 | additionalBranchType = 0 | custom 輸出 null |
| TC-402 | additionalBranchType = 2 但 custom 空 | 顯示驗證錯誤 |
| TC-403 | counterBranchType = 2 且 custom 有效 | 驗證成功 |

## 6. 欄位權限

| 編號 | 測試項目 | 預期結果 |
|---|---|---|
| TC-501 | 新增欄位權限 | fieldPermissionSettings 新增一筆 |
| TC-502 | fieldCode 空白 | 顯示驗證錯誤 |
| TC-503 | edit allowType = 1 但 custom 空 | 顯示驗證錯誤 |
| TC-504 | view allowType = 1 但 custom 空 | 顯示驗證錯誤 |
| TC-505 | viewPermissionSetting | 輸出 JSON 不包含 required |

## 7. 匯入

| 編號 | 測試項目 | 預期結果 |
|---|---|---|
| TC-601 | 匯入有效 JSON | 畫面資料被匯入內容取代 |
| TC-602 | 匯入非法 JSON | 顯示 JSON parse 錯誤，不覆蓋目前資料 |
| TC-603 | 匯入純陣列 | 顯示根節點錯誤，不覆蓋目前資料 |
| TC-604 | 匯入缺 signableNodes | 顯示錯誤，不覆蓋目前資料 |
| TC-605 | 匯入 itemType = 0 | 顯示錯誤，不覆蓋目前資料 |

## 8. 匯出與複製

| 編號 | 測試項目 | 預期結果 |
|---|---|---|
| TC-701 | 匯出有效資料 | 下載 `signable-nodes.json` |
| TC-702 | 匯出前有驗證錯誤 | 不下載，顯示錯誤 |
| TC-703 | 複製有效 JSON | 剪貼簿取得格式化 JSON |
| TC-704 | 複製前有驗證錯誤 | 不複製，顯示錯誤 |

## 9. JSON 預覽

| 編號 | 測試項目 | 預期結果 |
|---|---|---|
| TC-801 | 修改欄位 | JSON 預覽即時更新 |
| TC-802 | 關閉 JSON 預覽 | 右欄完全隱藏，中欄擴展 |
| TC-803 | 重新開啟 JSON 預覽 | 右欄恢復顯示 |

## 10. 欄寬拖拉

| 編號 | 測試項目 | 預期結果 |
|---|---|---|
| TC-901 | 拖拉左側 resizer | 左欄與中欄寬度改變 |
| TC-902 | 拖拉右側 resizer | 中欄與右欄寬度改變 |
| TC-903 | 拖拉到過小 | 欄寬不得小於最小寬度 |
| TC-904 | JSON 預覽關閉時 | 右側 resizer 隱藏 |
