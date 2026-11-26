import CrudModule from '@/modules/CrudModule/CrudModule';
import DynamicForm from '@/forms/DynamicForm';
import { fields } from './config';
import useLanguage from '@/locale/useLanguage';

const todayISO = () => new Date().toISOString().slice(0, 10);

const bulkColumns = [
  { key: 'number', title: 'Payment #', required: true, width: 120, placeholder: 'SP-1002' },
  {
    key: 'supplier',
    title: 'Supplier Name',
    required: true,
    width: 180,
    placeholder: 'Bharat ElectroTech Supply',
  },
  {
    key: 'supplierPurchase',
    title: 'Purchase Order #',
    width: 140,
    placeholder: 'PO-1001',
  },
  { key: 'amount', title: 'Amount', type: 'currency', required: true, defaultValue: 0, width: 135 },
  {
    key: 'paymentMode',
    title: 'Payment Mode',
    width: 160,
    defaultValue: 'UPI / NEFT / RTGS',
    placeholder: 'UPI / NEFT / RTGS',
  },
  { key: 'date', title: 'Date', type: 'date', defaultValue: todayISO(), width: 140 },
  { key: 'ref', title: 'UTR / Ref', width: 140 },
  { key: 'description', title: 'Description', width: 180 },
];

const bulkSampleRow = {
  number: 'SP-1002',
  supplier: 'Bharat ElectroTech Supply',
  supplierPurchase: 'PO-1001',
  amount: 15000,
  paymentMode: 'UPI / NEFT / RTGS',
  date: todayISO(),
  ref: 'UTR99887766',
  description: 'Part settlement',
};

export default function SupplierPayment() {
  const translate = useLanguage();
  const entity = 'supplierpayment';

  const config = {
    entity,
    PANEL_TITLE: translate('supplier_payment'),
    DATATABLE_TITLE: translate('supplier_payment_list'),
    ADD_NEW_ENTITY: translate('add_new_supplier_payment'),
    ENTITY_NAME: translate('supplier_payment'),
    fields,
    bulkColumns,
    bulkSampleRow,
    searchConfig: {
      displayLabels: ['number', 'ref'],
      searchFields: 'number,ref,description',
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
