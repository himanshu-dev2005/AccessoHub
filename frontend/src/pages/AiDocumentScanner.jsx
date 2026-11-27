import { useState } from 'react';
import {
  Upload,
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Select,
  Typography,
  Row,
  Col,
  Space,
  Table,
  Tag,
  message,
} from 'antd';
import {
  ScanOutlined,
  InboxOutlined,
  SaveOutlined,
  ReloadOutlined,
  CopyOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import { API_BASE_URL } from '@/config/serverApiConfig';
import storePersist from '@/redux/storePersist';
import { request } from '@/request';

const { Title, Text } = Typography;
const { Dragger } = Upload;
const { TextArea } = Input;

function getAuthHeaders() {
  const auth = storePersist.get('auth');
  return auth ? { Authorization: `Bearer ${auth.current.token}` } : {};
}

// Resize large images client-side so base64 stays well under Vercel's 4.5MB limit
function compressImageToBase64(file, maxDim = 1280) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

export default function AiDocumentScanner() {
  const [form] = Form.useForm();
  const [targetType, setTargetType] = useState('client');
  const [imagePreview, setImagePreview] = useState(null);
  const [extracting, setExtracting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [extractedData, setExtractedData] = useState(null);

  const handleFile = async (file) => {
    try {
      const base64 = await compressImageToBase64(file);
      setImagePreview(base64);
      setExtractedData(null);
      form.resetFields();
    } catch {
      message.error('Could not read the selected image');
    }
    return false;
  };

  const handleScan = async () => {
    if (!imagePreview) {
      message.warning('Please upload an image first');
      return;
    }
    setExtracting(true);
    try {
      const { data } = await axios.post(
        API_BASE_URL + 'ai/scan',
        { imageBase64: imagePreview, targetType },
        { headers: getAuthHeaders() }
      );
      const result = data.result || {};
      setExtractedData(result);
      form.setFieldsValue(result);
      message.success('Fields auto-filled from image!');
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to scan image');
    } finally {
      setExtracting(false);
    }
  };

  const handleSaveToCrm = async (values) => {
    if (targetType === 'invoice') {
      navigator.clipboard.writeText(JSON.stringify({ ...extractedData, ...values }, null, 2));
      message.success('Invoice JSON copied to clipboard!');
      return;
    }

    setSaving(true);
    try {
      const entity = targetType === 'product' ? 'product' : 'client';
      const payload =
        entity === 'product'
          ? {
              ...values,
              price: values.retailPrice || 0,
              costPrice: values.purchaseCost || 0,
            }
          : values;

      const res = await request.create({ entity, jsonData: payload });
      if (res?.success) {
        message.success(
          `${entity === 'product' ? 'Product' : 'Customer'} saved to CRM!`
        );
      }
    } catch {
      message.error('Failed to save record');
    } finally {
      setSaving(false);
    }
  };

  const invoiceColumns = [
    { title: 'Item', dataIndex: 'name', key: 'name' },
    { title: 'Qty', dataIndex: 'quantity', key: 'quantity', width: 70, align: 'center' },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      width: 110,
      align: 'right',
      render: (v) => `₹${Number(v || 0).toLocaleString('en-IN')}`,
    },
  ];

  return (
    <div style={{ padding: '24px', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
          <ScanOutlined style={{ color: '#4f46e5' }} />
          AI Image &amp; Document Auto-Fill
        </Title>
        <Text type="secondary">
          Upload a business card, receipt, invoice photo, or product label to automatically extract and save structured CRM records.
        </Text>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} md={10}>
          <Card title="1. Upload Document Image" bordered>
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <div>
                <Text strong style={{ display: 'block', marginBottom: 6 }}>
                  What are you scanning?
                </Text>
                <Select
                  value={targetType}
                  onChange={(val) => {
                    setTargetType(val);
                    setExtractedData(null);
                    form.resetFields();
                  }}
                  style={{ width: '100%' }}
                  options={[
                    { value: 'client', label: 'Customer / Business Card' },
                    { value: 'product', label: 'Product Label / Catalog' },
                    { value: 'invoice', label: 'Receipt / Invoice Photo' },
                  ]}
                />
              </div>

              <Dragger
                accept="image/*"
                multiple={false}
                showUploadList={false}
                beforeUpload={handleFile}
                style={{ padding: 12 }}
              >
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Uploaded preview"
                    style={{ maxHeight: 240, maxWidth: '100%', borderRadius: 8, objectFit: 'contain' }}
                  />
                ) : (
                  <>
                    <p className="ant-upload-drag-icon">
                      <InboxOutlined />
                    </p>
                    <p className="ant-upload-text">Click or drag image to upload</p>
                    <p className="ant-upload-hint">Supports PNG, JPG, WEBP</p>
                  </>
                )}
              </Dragger>

              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() => {
                    setImagePreview(null);
                    setExtractedData(null);
                    form.resetFields();
                  }}
                  disabled={!imagePreview}
                >
                  Clear
                </Button>
                <Button
                  type="primary"
                  icon={<ScanOutlined />}
                  loading={extracting}
                  onClick={handleScan}
                  disabled={!imagePreview}
                >
                  Extract &amp; Auto-Fill
                </Button>
              </Space>
            </Space>
          </Card>
        </Col>

        <Col xs={24} md={14}>
          <Card
            title={
              <Space>
                <span>2. Auto-Filled CRM Form</span>
                {extractedData && <Tag color="green">AI Extracted</Tag>}
              </Space>
            }
            bordered
          >
            <Form form={form} layout="vertical" onFinish={handleSaveToCrm}>
              {targetType === 'client' && (
                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item name="name" label="Full Name" rules={[{ required: true }]}>
                      <Input placeholder="e.g. Alex Morgan" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item name="company" label="Company">
                      <Input placeholder="e.g. Horizon Tech" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item name="email" label="Email">
                      <Input placeholder="email@company.com" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item name="phone" label="Phone">
                      <Input placeholder="+1 555-019-2834" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item name="industry" label="Industry">
                      <Input placeholder="e.g. Technology" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item name="country" label="Country">
                      <Input placeholder="e.g. United States" />
                    </Form.Item>
                  </Col>
                  <Col xs={24}>
                    <Form.Item name="address" label="Address">
                      <Input placeholder="Street address, City" />
                    </Form.Item>
                  </Col>
                  <Col xs={24}>
                    <Form.Item name="notes" label="Notes">
                      <TextArea rows={2} />
                    </Form.Item>
                  </Col>
                </Row>
              )}

              {targetType === 'product' && (
                <Row gutter={16}>
                  <Col xs={24} sm={14}>
                    <Form.Item name="name" label="Product Name" rules={[{ required: true }]}>
                      <Input placeholder="e.g. Wireless Scanner Pro" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={10}>
                    <Form.Item name="ref" label="SKU / Reference">
                      <Input placeholder="e.g. PRD-001" />
                    </Form.Item>
                  </Col>
                  <Col xs={12} sm={6}>
                    <Form.Item name="retailPrice" label="Retail Price" rules={[{ required: true }]}>
                      <InputNumber style={{ width: '100%' }} min={0} />
                    </Form.Item>
                  </Col>
                  <Col xs={12} sm={6}>
                    <Form.Item name="wholesalePrice" label="Wholesale Price">
                      <InputNumber style={{ width: '100%' }} min={0} />
                    </Form.Item>
                  </Col>
                  <Col xs={12} sm={6}>
                    <Form.Item name="purchaseCost" label="Purchase Cost">
                      <InputNumber style={{ width: '100%' }} min={0} />
                    </Form.Item>
                  </Col>
                  <Col xs={12} sm={6}>
                    <Form.Item name="stock" label="Stock Qty">
                      <InputNumber style={{ width: '100%' }} min={0} />
                    </Form.Item>
                  </Col>
                  <Col xs={24}>
                    <Form.Item name="description" label="Description">
                      <TextArea rows={3} />
                    </Form.Item>
                  </Col>
                </Row>
              )}

              {targetType === 'invoice' && (
                <>
                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Form.Item name="client" label="Client / Vendor">
                        <Input placeholder="Client name" />
                      </Form.Item>
                    </Col>
                    <Col xs={12} sm={6}>
                      <Form.Item name="invoiceNumber" label="Invoice #">
                        <Input placeholder="INV-001" />
                      </Form.Item>
                    </Col>
                    <Col xs={12} sm={6}>
                      <Form.Item name="taxRate" label="Tax (%)">
                        <InputNumber style={{ width: '100%' }} min={0} max={100} />
                      </Form.Item>
                    </Col>
                  </Row>
                  {extractedData?.items?.length > 0 && (
                    <Table
                      size="small"
                      pagination={false}
                      dataSource={extractedData.items.map((it, idx) => ({ ...it, key: idx }))}
                      columns={invoiceColumns}
                      style={{ marginBottom: 16 }}
                    />
                  )}
                  <Form.Item name="notes" label="Notes">
                    <TextArea rows={2} />
                  </Form.Item>
                </>
              )}

              <Button
                type="primary"
                htmlType="submit"
                loading={saving}
                icon={targetType === 'invoice' ? <CopyOutlined /> : <SaveOutlined />}
                disabled={!extractedData}
              >
                {targetType === 'invoice'
                  ? 'Copy Extracted Invoice JSON'
                  : `Save ${targetType === 'product' ? 'Product' : 'Customer'} to CRM`}
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
