import CrudModule from '@/modules/CrudModule/CrudModule';
import DynamicForm from '@/forms/DynamicForm';
import { fields } from './config';
import useLanguage from '@/locale/useLanguage';

export default function Supplier() {
  const translate = useLanguage();
  const entity = 'supplier';

  const config = {
    entity,
    PANEL_TITLE: translate('supplier'),
    DATATABLE_TITLE: translate('supplier_list'),
    ADD_NEW_ENTITY: translate('add_new_supplier'),
    ENTITY_NAME: translate('supplier'),
    fields,
    searchConfig: {
      displayLabels: ['name', 'company'],
      searchFields: 'name,company,email,phone',
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
