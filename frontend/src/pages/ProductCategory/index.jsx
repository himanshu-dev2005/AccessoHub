import CrudModule from '@/modules/CrudModule/CrudModule';
import DynamicForm from '@/forms/DynamicForm';
import { fields } from './config';
import useLanguage from '@/locale/useLanguage';

export default function ProductCategory() {
  const translate = useLanguage();
  const entity = 'productcategory';

  const config = {
    entity,
    PANEL_TITLE: translate('product_category'),
    DATATABLE_TITLE: translate('product_category_list'),
    ADD_NEW_ENTITY: translate('add_new_product_category'),
    ENTITY_NAME: translate('product_category'),
    fields,
    searchConfig: {
      displayLabels: ['name'],
      searchFields: 'name,description',
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
