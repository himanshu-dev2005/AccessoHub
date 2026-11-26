import CrudModule from '@/modules/CrudModule/CrudModule';
import DynamicForm from '@/forms/DynamicForm';
import useLanguage from '@/locale/useLanguage';

export default function Taxes() {
  const translate = useLanguage();
  const entity = 'taxes';

  const fields = {
    taxName: {
      type: 'string',
      label: 'name',
      required: true,
    },
    taxValue: {
      type: 'number',
      label: 'Value',
      required: true,
    },
    enabled: {
      type: 'boolean',
      label: 'enabled',
    },
    isDefault: {
      type: 'boolean',
      label: 'Default',
    },
  };

  const config = {
    entity,
    PANEL_TITLE: translate('taxes'),
    DATATABLE_TITLE: translate('taxes_list'),
    ADD_NEW_ENTITY: translate('add_new_tax'),
    ENTITY_NAME: translate('taxes'),
    fields,
    searchConfig: {
      displayLabels: ['taxName'],
      searchFields: 'taxName',
    },
    deleteModalLabels: ['taxName'],
  };

  return (
    <CrudModule
      createForm={<DynamicForm fields={fields} />}
      updateForm={<DynamicForm fields={fields} isUpdateForm={true} />}
      config={config}
    />
  );
}
