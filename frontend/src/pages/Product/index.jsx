import CrudModule from '@/modules/CrudModule/CrudModule';
import DynamicForm from '@/forms/DynamicForm';
import { fields } from './config';
import useLanguage from '@/locale/useLanguage';

const bulkColumns = [
  { key: 'name', title: 'Product Name', required: true, width: 180 },
  { key: 'ref', title: 'SKU / Ref', width: 120 },
  { key: 'productCategory', title: 'Category', width: 150, placeholder: 'Hardware & Devices' },
  {
    key: 'wholesalePrice',
    title: 'Wholesale Price',
    type: 'currency',
    required: true,
    defaultValue: 0,
    width: 135,
  },
  {
    key: 'retailPrice',
    title: 'Retail Price',
    type: 'currency',
    required: true,
    defaultValue: 0,
    width: 130,
  },
  {
    key: 'purchaseCost',
    title: 'Purchase Cost',
    type: 'currency',
    required: true,
    defaultValue: 0,
    width: 130,
  },
  { key: 'stock', title: 'Stock Qty', type: 'number', defaultValue: 0, width: 95 },
  { key: 'description', title: 'Description', width: 190 },
];

const bulkSampleRow = {
  name: 'AccessoHub Sensor Kit',
  ref: 'SKU-AH-301',
  productCategory: 'Hardware & Devices',
  wholesalePrice: 3800,
  retailPrice: 4500,
  purchaseCost: 2800,
  stock: 15,
  description: 'Wireless telemetry kit',
};

export default function Product() {
  const translate = useLanguage();
  const entity = 'product';

  const config = {
    entity,
    PANEL_TITLE: translate('product'),
    DATATABLE_TITLE: translate('product_list'),
    ADD_NEW_ENTITY: translate('add_new_product'),
    ENTITY_NAME: translate('product'),
    fields,
    bulkColumns,
    bulkSampleRow,
    searchConfig: {
      displayLabels: ['name', 'ref'],
      searchFields: 'name,ref,description',
    },
    deleteModalLabels: ['name'],
  };

  return (
    <CrudModule
      createForm={<DynamicForm fields={fields} />}
      updateForm={<DynamicForm fields={fields} isUpdateForm={true} />}
      config={config}
    />
  );
}
