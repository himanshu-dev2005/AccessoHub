import CrudModule from '@/modules/CrudModule/CrudModule';
import DynamicForm from '@/forms/DynamicForm';
import { fields } from './config';

import useLanguage from '@/locale/useLanguage';

const bulkColumns = [
  { key: 'name', title: 'Customer Name', required: true, width: 170 },
  { key: 'company', title: 'Company', width: 170 },
  { key: 'industry', title: 'Industry', width: 130 },
  {
    key: 'category',
    title: 'Category',
    type: 'select',
    defaultValue: 'retail',
    width: 120,
    options: [
      { value: 'retail', label: 'Retail' },
      { value: 'wholesale', label: 'Wholesale' },
    ],
  },
  {
    key: 'status',
    title: 'Status',
    type: 'select',
    defaultValue: 'active',
    width: 120,
    options: [
      { value: 'active', label: 'Active' },
      { value: 'new', label: 'New' },
      { value: 'premium', label: 'Premium' },
      { value: 'inactive', label: 'Inactive' },
    ],
  },
  { key: 'phone', title: 'Phone', width: 140 },
  { key: 'email', title: 'Email', width: 180 },
  { key: 'country', title: 'Country', defaultValue: 'India', width: 120 },
  { key: 'address', title: 'Address', width: 200 },
];

const bulkSampleRow = {
  name: 'Kiran Patel',
  company: 'Apex Retail India',
  industry: 'Retail',
  category: 'retail',
  status: 'active',
  phone: '+91 98250 11223',
  email: 'kiran@apexretail.example',
  country: 'India',
  address: 'SG Highway, Ahmedabad',
};

export default function Customer() {
  const translate = useLanguage();
  const entity = 'client';
  const searchConfig = {
    displayLabels: ['name', 'company'],
    searchFields: 'name,company,email',
  };
  const deleteModalLabels = ['name'];

  const Labels = {
    PANEL_TITLE: translate('client'),
    DATATABLE_TITLE: translate('client_list'),
    ADD_NEW_ENTITY: translate('add_new_client'),
    ENTITY_NAME: translate('client'),
  };
  const config = {
    entity,
    ...Labels,
    fields,
    bulkColumns,
    bulkSampleRow,
    searchConfig,
    deleteModalLabels,
  };
  return (
    <CrudModule
      createForm={<DynamicForm fields={fields} />}
      updateForm={<DynamicForm fields={fields} isUpdateForm={true} />}
      config={config}
    />
  );
}
