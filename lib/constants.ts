// ── Dropdown options ─────────────────────────────────────────────────────────

export const CENTRE_OPTIONS = [
  'SSP','CSW','ST','FLT','MT','SWT','WT','KOK','TWT','SSW','TST',
  'office','All Campus','N/A',
];

export const PROGRAMME_OPTIONS = [
  'DAE FT','DAE PT','DY','JHD','BAHD','CHD','CC','IHD','HC',
  'UWLBS','UWLCS (Cyber Security)','UWLCPFI','UWLPH',
  'UWLC (Computing Science)','WUAFM','WUBM','WUCWUIT','HM',
  'MSc Cyber Security','ApLHC Bridging Course','ERB','N/A',
];

export const EDB_OPTIONS = ['ECA','Basic Law','SSE','QESS','SPSS','N/A'];

// ── Bilingual labels ──────────────────────────────────────────────────────────

export const LABELS = {
  zh: {
    // Header / tabs
    systemTitle:        'HKIT 付款申請系統',
    systemSubtitle:     'Payment Request Management System',
    tabStaff:           '員工報銷',
    tabAccounting:      '會計報表',
    tabPrincipal:       '校長審批',

    // Staff form
    formTitle:          '提交付款申請',
    formSubtitle:       '請填寫以下資料，並上傳相關報價單。',
    staffName:          '員工姓名',
    date:               '日期',
    centre:             '中心',
    programme:          '計劃',
    term:               '學期',
    amount:             '申請金額 (HKD)',
    paymentDetails:     '付款詳情',
    supplierName:       '供應商名稱',
    bankName:           '銀行名稱',
    bankAccount:        '銀行帳號',
    edbFunding:         'EDB 資助',
    expectedPayDate:    '預計付款日期',
    remark:             '備註',
    quotation:          '報價單',
    quotationHint:      'PDF / 圖片（可選）',
    clickUpload:        '點擊上傳',
    orDrop:             '或拖放檔案到此處',
    removeFile:         '移除檔案',
    submitBtn:          '提交申請',
    submitting:         '提交中...',

    // Placeholders
    phFullName:         'Full Name',
    phCentre:           '例：觀塘中心',
    phProgramme:        '例：STEM 課程',
    phTerm:             '例：2024-25 Term 1',
    phPaymentDetails:   '請詳細描述付款用途...',
    phSupplierName:     '供應商 / 收款方名稱',
    phBankName:         '例：匯豐銀行',
    phBankAccount:      '例：123-456789-001',
    phEdb:              '如適用',
    phRemark:           '其他補充說明（可選）',

    // Success / error messages
    successMsg:         '申請已成功提交！稍後可在校長審批頁查看狀態。',
    successWarn:        '申請已成功提交，但報價單未能上傳：',
    errorSubmit:        '提交失敗：',
    errorNetwork:       '提交失敗，請檢查網絡連線後重試。',

    // AI scan
    aiScanning:         'AI 掃描中...',
    aiFilled:           'AI 已自動填寫 — 請核對後提交',

    // Claimants
    claimants:          '申請人明細',
    addClaimant:        '+ 新增申請人',
    claimantName:       '員工姓名',
    claimantDesc:       '項目說明',
    claimantAmount:     '金額 (HKD)',
    claimantsTotal:     '合計',

    // Accounting tab
    totalApps:          '申請總數',
    totalAmount:        '申請總額',
    pending:            '待審批',
    approved:           '已核准',
    recordsInfo:        '筆記錄',
    rejected:           '已拒絕',
    refresh:            '重新整理',
    downloadExcel:      '下載 Excel',
    noRecords:          '暫無記錄',
    view:               '查看',

    // Table headers
    colRecordNo:        '記錄編號',
    colSubmitTime:      '提交時間',
    colDate:            '日期',
    colStaff:           '員工姓名',
    colPaymentDetails:  '付款詳情',
    colAmount:          '金額',
    colCentre:          '中心',
    colProgramme:       '計劃',
    colTerm:            '學期',
    colEdb:             'EDB資助',
    colExpectedDate:    '預計付款日期',
    colStatus:          '審批狀態',
    colQuotation:       '報價單',
    colSupplier:        '供應商',
    colBank:            '銀行',
    colBankAccount:     '銀行帳號',

    // Status
    statusApproved:     '已核准',
    statusRejected:     '已拒絕',
    statusPending:      '待審批',

    // Principal tab
    showPending:        '只看待審批',
    viewAll:            '查看全部',
    viewDetails:        '查看詳情',
    hideDetails:        '收起詳情',
    viewQuotation:      '查看報價單',
    approve:            '核准',
    reject:             '拒絕',
    noApplications:     '暫無申請記錄',
    noPending:          '目前沒有待審批的申請',
    pendingCount:       '筆待審批',
    showingAll:         '顯示全部',
    apps:               '筆申請',
    noteLabel:          '備註：',
    submitTime:         '提交時間',
    expectedDate:       '預計付款日期',
    fullDetails:        '完整付款詳情',
    quotationPreview:   '報價單預覽',
    notSpecified:       '未指定',

    // Reject modal
    rejectTitle:        '拒絕付款申請',
    applicant:          '申請人：',
    rejectReason:       '拒絕原因',
    rejectMin:          '（至少 20 字）',
    rejectPlaceholder:  '請詳細說明拒絕理由...',
    cancel:             '取消',
    confirmReject:      '確認拒絕',
    processing:         '處理中...',
    rejectMinAlert:     '拒絕原因至少需要 20 個字元',
    confirmApprove:     '確認核准',
    approveAlert:       '已核准！',
    errorOp:            '操作失敗：',
    errorOpGeneric:     '操作失敗',

    // PIN modal
    pinTitle:           '請輸入存取密碼',
    pinPlaceholder:     '4位數字密碼',
    pinSubmit:          '確認',
    pinError:           '密碼錯誤，請重試',

    // Loading
    loading:            '載入中...',
  },

  en: {
    // Header / tabs
    systemTitle:        'HKIT Payment Request System',
    systemSubtitle:     'Payment Request Management System',
    tabStaff:           'Staff',
    tabAccounting:      'Accounting',
    tabPrincipal:       'Principal',

    // Staff form
    formTitle:          'Payment Request Submission',
    formSubtitle:       'Please fill in and upload related docs like quotations, invoices etc.',
    staffName:          'Staff Name',
    date:               'Date',
    centre:             'Centre',
    programme:          'Programme',
    term:               'Term',
    amount:             'Amount (HKD)',
    paymentDetails:     'Payment Details',
    supplierName:       'Supplier Name',
    bankName:           'Bank Name',
    bankAccount:        'Bank Account No.',
    edbFunding:         'EDB Funding',
    expectedPayDate:    'Expected Payment Date',
    remark:             'Remark',
    quotation:          'Quotation / Invoice',
    quotationHint:      'PDF / Image (optional)',
    clickUpload:        'Click & Upload',
    orDrop:             'or drag and drop file here',
    removeFile:         'Remove file',
    submitBtn:          'Submit',
    submitting:         'Submitting...',

    // Placeholders
    phFullName:         'Full Name',
    phCentre:           'e.g. SSP',
    phProgramme:        'e.g. DAE FT',
    phTerm:             'e.g. 2024-25 Term 1',
    phPaymentDetails:   'Describe the purpose of payment in detail...',
    phSupplierName:     'Supplier / payee name',
    phBankName:         'e.g. HSBC',
    phBankAccount:      'e.g. 123-456789-001',
    phEdb:              'If applicable',
    phRemark:           'Additional notes (optional)',

    // Success / error messages
    successMsg:         'Submitted successfully! Check status in the Principal tab.',
    successWarn:        'Submitted, but quotation upload failed: ',
    errorSubmit:        'Submission failed: ',
    errorNetwork:       'Submission failed. Please check your network and try again.',

    // AI scan
    aiScanning:         'AI scanning...',
    aiFilled:           'AI auto-filled — please review before submitting',

    // Claimants
    claimants:          'Claimants',
    addClaimant:        '+ Add Claimant',
    claimantName:       'Staff Name',
    claimantDesc:       'Items / Description',
    claimantAmount:     'Amount (HKD)',
    claimantsTotal:     'Total',

    // Accounting tab
    totalApps:          'Total Applications',
    totalAmount:        'Requested Total Amount',
    pending:            'Waiting Approval',
    approved:           'Approved',
    recordsInfo:        'records',
    rejected:           'Rejected',
    refresh:            'Refresh',
    downloadExcel:      'Download Excel',
    noRecords:          'No records',
    view:               'View',

    // Table headers
    colRecordNo:        'Record No.',
    colSubmitTime:      'Submission Time',
    colDate:            'Date',
    colStaff:           'Staff',
    colPaymentDetails:  'Payment Details',
    colAmount:          'Amount',
    colCentre:          'Centre',
    colProgramme:       'Programme',
    colTerm:            'Term',
    colEdb:             'EDB Funding',
    colExpectedDate:    'Expected Payment Date',
    colStatus:          'Status',
    colQuotation:       'Quotation/Invoice',
    colSupplier:        'Supplier',
    colBank:            'Bank',
    colBankAccount:     'Bank Account',

    // Status
    statusApproved:     'Approved',
    statusRejected:     'Rejected',
    statusPending:      'Pending',

    // Principal tab
    showPending:        'Pending Only',
    viewAll:            'View All',
    viewDetails:        'View Details',
    hideDetails:        'Hide Details',
    viewQuotation:      'View Quotation/Invoice',
    approve:            'Approve',
    reject:             'Reject',
    noApplications:     'No applications',
    noPending:          'No pending applications',
    pendingCount:       'pending',
    showingAll:         'Showing all',
    apps:               'applications',
    noteLabel:          'Remark:',
    submitTime:         'Submission Time',
    expectedDate:       'Expected Payment Date',
    fullDetails:        'Full Payment Details',
    quotationPreview:   'Quotation / Invoice Preview',
    notSpecified:       'Not specified',

    // Reject modal
    rejectTitle:        'Reject Payment Request',
    applicant:          'Applicant: ',
    rejectReason:       'Rejection Reason',
    rejectMin:          '(min. 20 characters)',
    rejectPlaceholder:  'Please explain the reason in detail...',
    cancel:             'Cancel',
    confirmReject:      'Confirm Reject',
    processing:         'Processing...',
    rejectMinAlert:     'Rejection reason must be at least 20 characters',
    confirmApprove:     'Confirm Approve',
    approveAlert:       'Approved!',
    errorOp:            'Operation failed: ',
    errorOpGeneric:     'Operation failed',

    // PIN modal
    pinTitle:           'Enter Access PIN',
    pinPlaceholder:     '4-digit PIN',
    pinSubmit:          'Confirm',
    pinError:           'Incorrect PIN, please try again',

    // Loading
    loading:            'Loading...',
  },
};

export type Lang = keyof typeof LABELS;
export type Labels = typeof LABELS.zh;
export type LabelKey = keyof Labels;
