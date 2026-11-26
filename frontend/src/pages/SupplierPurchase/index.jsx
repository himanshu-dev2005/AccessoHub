import CrudModule from '@/modules/CrudModule/CrudModule';
import DynamicForm from '@/forms/DynamicForm';
import { fields } from './config';
import useLanguage from '@/locale/useLanguage';

const todayISO = () => new Date().toISOString().slice(0, 10);

const bulkColumns = [
  { key: 'number', title: 'PO Number', required: true, width: 120, placeholder: 'PO-1002' },
  {
    key: 'supplier',
    title: 'Supplier Name',
    required: true,
    width: 180,
    placeholder: 'Bharat ElectroTech Supply',
  },
  {
    key: 'product',
    title: 'Product / SKU',
    width: 170,
    placeholder: 'AccessoHub Pro Gateway',
  },
  { key: 'quantity', title: 'Quantity', type: 'number', required: true, defaultValue: 1, width: 95 },
  {
    key: 'unitPrice',
    title: 'Unit Cost',
    type: 'currency',
    required: true,
    defaultValue: 0,
    width: 125,
  },
  { key: 'taxRate', title: 'Tax (%)', type: 'number', defaultValue: 18, width: 85 },
  {
    key: '_computedTotal',
    title: 'Total (₹)',
    readOnly: true,
    width: 120,
    computed: (r) => {
      const sub = (Number(r.quantity) || 0) * (Number(r.unitPrice) || 0);
      const tot = sub + sub * ((Number(r.taxRate) || 0) / 100);
      return `₹ ${tot.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    },
  },
  {
    key: 'status',
    title: 'Status',
    type: 'select',
    defaultValue: 'ordered',
    width: 120,
    options: [
      { value: 'draft', label: 'Draft' },
      { value: 'ordered', label: 'Ordered' },
      { value: 'received', label: 'Received' },
      { value: 'cancelled', label: 'Cancelled' },
    ],
  },
  { key: 'purchaseDate', title: 'Purchase Date', type: 'date', defaultValue: todayISO(), width: 140 },
  { key: 'notes', title: 'Notes', width: 160 },
];

const bulkSampleRow = {
  number: 'PO-1002',
  supplier: 'Bharat ElectroTech Supply',
  product: 'AccessoHub Pro Gateway',
  quantity: 5,
  unitPrice: 12000,
  taxRate: 18,
  status: 'received',
  purchaseDate: todayISO(),
  notes: 'Batch restock',
};

export default function SupplierPurchase() {
  const translate = useLanguage();
  const entity = 'supplierpurchase';

  const config = {
    entity,
    PANEL_TITLE: translate('supplier_purchase'),
    DATATABLE_TITLE: translate('supplier_purchase_list'),
    ADD_NEW_ENTITY: translate('add_new_supplier_purchase'),
    ENTITY_NAME: translate('supplier_purchase'),
    fields,
    bulkColumns,
    bulkSampleRow,
    searchConfig: {
      displayLabels: ['number'],
      searchFields: 'number,notes',
    },
    deleteModalLabels: ['number'],
  };

  return (
    <CrudModule
      createForm={<DynamicForm fields={fields} />}
      updateForm={<DynamicForm fields={fields} isUpdateForm={true} />}
      config={config}
    />
  );
}
