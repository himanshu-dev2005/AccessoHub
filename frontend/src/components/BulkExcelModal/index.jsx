import { useState, useEffect, useCallback } from 'react';
import * as XLSX from 'xlsx';
import {
  Modal,
  Table,
  Button,
  Input,
  InputNumber,
  Select,
  Space,
  Upload,
  Alert,
  Tooltip,
  Typography,
  message,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  CopyOutlined,
  UploadOutlined,
  DownloadOutlined,
  FileExcelOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { request } from '@/request';
import { crud } from '@/redux/crud/actions';

const { Text } = Typography;

const makeEmptyRow = (columns) => {
  const row = { _rowKey: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}` };
  columns.forEach((col) => {
    row[col.key] = col.defaultValue !== undefined ? col.defaultValue : '';
  });
  return row;
};

const isRowBlank = (row, columns) => {
  return columns.every((col) => {
    if (col.defaultValue !== undefined && row[col.key] === col.defaultValue) return true;
    const val = row[col.key];
    return val === undefined || val === null || String(val).trim() === '';
  });
};

export default function BulkExcelModal({ open, onClose, config }) {
  const { entity, ENTITY_NAME, bulkColumns = [], bulkSampleRow = {} } = config;
  const dispatch = useDispatch();

  const [rows, setRows] = useState(() => [
    makeEmptyRow(bulkColumns),
    makeEmptyRow(bulkColumns),
    makeEmptyRow(bulkColumns),
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [importErrors, setImportErrors] = useState([]);

  useEffect(() => {
    if (open) {
      setImportErrors([]);
      setRows((prev) =>
        prev.length > 0
          ? prev
          : [makeEmptyRow(bulkColumns), makeEmptyRow(bulkColumns), makeEmptyRow(bulkColumns)]
      );
    }
  }, [open, bulkColumns]);

  const updateCell = useCallback((rowKey, fieldKey, value) => {
    setRows((prev) => prev.map((r) => (r._rowKey === rowKey ? { ...r, [fieldKey]: value } : r)));
  }, []);

  const addRows = (count = 1) => {
    const extra = Array.from({ length: count }, () => makeEmptyRow(bulkColumns));
    setRows((prev) => [...prev, ...extra]);
  };

  const duplicateRow = (record) => {
    const copy = {
      ...record,
      _rowKey: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    };
    setRows((prev) => [...prev, copy]);
  };

  const removeRow = (rowKey) => {
    setRows((prev) => {
      const next = prev.filter((r) => r._rowKey !== rowKey);
      return next.length > 0 ? next : [makeEmptyRow(bulkColumns)];
    });
  };

  const editableColumns = bulkColumns.filter((c) => !c.computed);

  const handleDownloadTemplate = () => {
    const headers = editableColumns.map((c) => c.title);
    const sample = editableColumns.map((c) =>
      bulkSampleRow[c.key] !== undefined ? bulkSampleRow[c.key] : c.defaultValue ?? ''
    );
    const ws = XLSX.utils.aoa_to_sheet([headers, sample]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, `${entity}_excel_template.xlsx`);
  };

  const mapRawObjectsToRows = (rawObjects) => {
    const lookup = {};
    editableColumns.forEach((col) => {
      lookup[col.key.toLowerCase()] = col.key;
      lookup[col.title.toLowerCase()] = col.key;
    });

    const parsed = rawObjects
      .map((obj) => {
        const mapped = makeEmptyRow(bulkColumns);
        Object.keys(obj).forEach((rawKey) => {
          const targetKey = lookup[String(rawKey).trim().toLowerCase()];
          if (targetKey) {
            mapped[targetKey] = obj[rawKey];
          }
        });
        return mapped;
      })
      .filter((r) => !isRowBlank(r, bulkColumns));

    if (parsed.length === 0) {
      message.warning('No matching rows found in the uploaded file.');
      return;
    }
    setRows(parsed);
    setImportErrors([]);
    message.success(`Loaded ${parsed.length} rows into the spreadsheet grid.`);
  };

  const handleFileUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(firstSheet, { defval: '' });
        mapRawObjectsToRows(json);
      } catch (err) {
        message.error('Could not parse Excel/CSV file.');
      }
    };
    reader.readAsArrayBuffer(file);
    return false;
  };

  const handlePasteFromExcel = (e, startRowIndex, startColIndex) => {
    const text = e.clipboardData?.getData('text/plain');
    if (!text || (!text.includes('\t') && !text.includes('\n'))) {
      return;
    }
    e.preventDefault();

    const pastedLines = text
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .split('\n')
      .filter((line) => line.trim() !== '');

    if (pastedLines.length === 0) return;

    setRows((prev) => {
      const next = [...prev];
      pastedLines.forEach((line, rOffset) => {
        const cells = line.split('\t');
        const targetIdx = startRowIndex + rOffset;
        while (next.length <= targetIdx) {
          next.push(makeEmptyRow(bulkColumns));
        }
        const updatedRow = { ...next[targetIdx] };
        const startEditableIdx = Math.max(
          0,
          editableColumns.findIndex((c) => c.key === bulkColumns[startColIndex]?.key)
        );
        cells.forEach((cellVal, cOffset) => {
          const col = editableColumns[startEditableIdx + cOffset];
          if (col && !col.readOnly) {
            updatedRow[col.key] =
              col.type === 'number' || col.type === 'currency'
                ? Number(String(cellVal).replace(/[^\d.-]/g, '')) || 0
                : cellVal.trim();
          }
        });
        next[targetIdx] = updatedRow;
      });
      return next;
    });
    message.success(`Pasted ${pastedLines.length} row(s) from clipboard.`);
  };

  const handleSubmit = async () => {
    const nonEmptyRows = rows.filter((r) => !isRowBlank(r, bulkColumns));
    if (nonEmptyRows.length === 0) {
      message.warning('Please enter at least one row before saving.');
      return;
    }

    const clientValidationErrors = [];
    nonEmptyRows.forEach((row, idx) => {
      bulkColumns.forEach((col) => {
        if (col.required) {
          const val = row[col.key];
          if (val === undefined || val === null || String(val).trim() === '') {
            clientValidationErrors.push({
              row: idx + 1,
              message: `${col.title} is required`,
            });
          }
        }
      });
    });

    if (clientValidationErrors.length > 0) {
      setImportErrors(clientValidationErrors);
      return;
    }

    const payloadItems = nonEmptyRows.map((row) => {
      const clean = {};
      editableColumns.forEach((col) => {
        clean[col.key] = row[col.key];
      });
      return clean;
    });

    setSubmitting(true);
    setImportErrors([]);
    const res = await request.bulkCreate({ entity, items: payloadItems });
    setSubmitting(false);

    if (res?.result) {
      const { createdCount = 0, failedCount = 0, errors = [] } = res.result;
      if (createdCount > 0) {
        dispatch(crud.list({ entity }));
      }
      if (failedCount === 0 && res.success) {
        setRows([makeEmptyRow(bulkColumns), makeEmptyRow(bulkColumns), makeEmptyRow(bulkColumns)]);
        onClose();
      } else {
        setImportErrors(errors);
        if (createdCount > 0 && errors.length > 0) {
          const failedRowNums = new Set(errors.map((e) => e.row - 1));
          setRows(nonEmptyRows.filter((_, idx) => failedRowNums.has(idx)));
        }
      }
    }
  };

  const gridColumns = [
    {
      title: '#',
      width: 46,
      align: 'center',
      render: (_, __, idx) => <Text type="secondary">{idx + 1}</Text>,
    },
    ...bulkColumns.map((col, colIdx) => ({
      title: (
        <span>
          {col.title}
          {col.required && <span style={{ color: '#EF4444' }}> *</span>}
        </span>
      ),
      dataIndex: col.key,
      width: col.width || 150,
      render: (_, record, rowIdx) => {
        if (col.computed) {
          return (
            <Text strong style={{ color: '#0F172A' }}>
              {col.computed(record)}
            </Text>
          );
        }

        if (col.type === 'select') {
          return (
            <Select
              size="small"
              value={record[col.key]}
              onChange={(val) => updateCell(record._rowKey, col.key, val)}
              options={col.options || []}
              style={{ width: '100%' }}
            />
          );
        }

        if (col.type === 'number' || col.type === 'currency') {
          return (
            <InputNumber
              size="small"
              min={0}
              prefix={col.type === 'currency' ? '₹' : undefined}
              value={record[col.key] === '' ? null : Number(record[col.key])}
              onChange={(val) => updateCell(record._rowKey, col.key, val ?? 0)}
              onPaste={(e) => handlePasteFromExcel(e, rowIdx, colIdx)}
              style={{ width: '100%' }}
            />
          );
        }

        return (
          <Input
            size="small"
            type={col.type === 'date' ? 'date' : 'text'}
            placeholder={col.placeholder || col.title}
            value={record[col.key]}
            onChange={(e) => updateCell(record._rowKey, col.key, e.target.value)}
            onPaste={(e) => handlePasteFromExcel(e, rowIdx, colIdx)}
          />
        );
      },
    })),
    {
      title: '',
      width: 72,
      fixed: 'right',
      render: (_, record) => (
        <Space size={4}>
          <Tooltip title="Duplicate Row">
            <Button
              size="small"
              type="text"
              icon={<CopyOutlined />}
              onClick={() => duplicateRow(record)}
            />
          </Tooltip>
          <Tooltip title="Remove Row">
            <Button
              size="small"
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => removeRow(record._rowKey)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Modal
      open={open}
      onCancel={onClose}
      width={1160}
      title={
        <Space>
          <FileExcelOutlined style={{ color: '#16A34A', fontSize: 18 }} />
          <span>{ENTITY_NAME} — Excel / Bulk Multiple Entry</span>
        </Space>
      }
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          icon={<SaveOutlined />}
          loading={submitting}
          onClick={handleSubmit}
        >
          Save All Entries ({rows.filter((r) => !isRowBlank(r, bulkColumns)).length})
        </Button>,
      ]}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 8,
          marginBottom: 12,
        }}
      >
        <Space wrap>
          <Button icon={<PlusOutlined />} onClick={() => addRows(1)}>
            Add Row
          </Button>
          <Button onClick={() => addRows(5)}>+5 Rows</Button>
          <Button
            onClick={() => {
              setRows([
                makeEmptyRow(bulkColumns),
                makeEmptyRow(bulkColumns),
                makeEmptyRow(bulkColumns),
              ]);
              setImportErrors([]);
            }}
          >
            Clear Grid
          </Button>
        </Space>

        <Space wrap>
          <Button icon={<DownloadOutlined />} onClick={handleDownloadTemplate}>
            Download Excel Template (.xlsx)
          </Button>
          <Upload
            accept=".xlsx,.xls,.csv"
            showUploadList={false}
            beforeUpload={handleFileUpload}
          >
            <Button icon={<UploadOutlined />} type="dashed">
              Import Excel / CSV
            </Button>
          </Upload>
        </Space>
      </div>

      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 12 }}
        message="Shortcut: Press Alt + E anytime on this page to open Bulk Entry. You can also copy rows directly from Excel / Google Sheets and press Ctrl + V inside any cell!"
      />

      {importErrors.length > 0 && (
        <Alert
          type="error"
          showIcon
          style={{ marginBottom: 12 }}
          message="Some rows could not be saved"
          description={
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {importErrors.map((err, i) => (
                <li key={i}>
                  Row {err.row}: {err.message}
                </li>
              ))}
            </ul>
          }
        />
      )}

      <Table
        bordered
        size="small"
        pagination={false}
        dataSource={rows}
        columns={gridColumns}
        rowKey="_rowKey"
        scroll={{ x: 'max-content', y: 380 }}
      />
    </Modal>
  );
}
