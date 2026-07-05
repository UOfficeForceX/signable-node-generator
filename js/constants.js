// enum、選項清單、預設值

const USER_TYPE_OPTIONS = [
  { value: 'Applicant', label: '申請者' },
  { value: 'SuprOfAppl', label: '申請者直屬主管' },
  { value: 'Supervisor', label: '上一站直屬主管' },
  { value: 'Custom', label: '自訂' },
  { value: 'Field', label: '由欄位' },
  { value: 'Plugin', label: '由外掛欄位' }
];

const VALID_USER_TYPES = USER_TYPE_OPTIONS.map((o) => o.value);

const ITEM_TYPE_OPTIONS = [
  { value: 1, label: '部門', fields: ['deptCode', 'containsChildren'] },
  { value: 2, label: '職稱', fields: ['jobTitleCode'] },
  { value: 3, label: '職務', fields: ['jobFuncCode'] },
  { value: 4, label: '部門 + 職稱', fields: ['deptCode', 'jobTitleCode', 'containsChildren'] },
  { value: 5, label: '部門 + 職務', fields: ['deptCode', 'jobFuncCode', 'containsChildren'] },
  { value: 6, label: '部門主管', fields: ['deptCode', 'containsChildren'] },
  { value: 7, label: '部門人員', fields: ['deptCode', 'account'] }
];

const ITEM_TYPE_REQUIRED_FIELDS = ITEM_TYPE_OPTIONS.reduce((acc, o) => {
  acc[o.value] = o.fields;
  return acc;
}, {});

const COMPLETE_RULE_OPTIONS = [
  { value: 0, label: '任一決（其中一人同意即通過當站）' },
  { value: 1, label: '全員決（需所有審核人皆同意）' }
];

const BRANCH_TYPE_OPTIONS = [
  { value: 0, label: '任何人' },
  { value: 1, label: '同部門' },
  { value: 2, label: '指定人員' }
];

const ALLOW_TYPE_OPTIONS = [
  { value: 0, label: '所有人員' },
  { value: 1, label: '特定人員' }
];

const FIELD_SIGN_TYPE_OPTIONS = [
  { value: 0, label: '部門所有人員' },
  { value: 1, label: '部門主管' }
];

const FIELD_KIND_OPTIONS = [
  { value: 'person', label: '選擇人員欄位' },
  { value: 'dept', label: '選擇部門欄位' }
];

const DEFAULT_LAYOUT = {
  leftWidth: 22,
  middleWidth: 48,
  rightWidth: 30,
  jsonPreviewVisible: true
};

const DEFAULT_LAYOUT_COLLAPSED = {
  leftWidth: 28,
  middleWidth: 72
};

const MIN_WIDTH_PX = { left: 240, middle: 420, right: 320 };

const EXPORT_FILENAME = 'signable-nodes.json';
