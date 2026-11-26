import CrudModule from '@/modules/CrudModule/CrudModule';
import DynamicForm from '@/forms/DynamicForm';
import useLanguage from '@/locale/useLanguage';

export default function PaymentMode() {
  const translate = useLanguage();
  const entity = 'paymentmode';

  const fields = {
    name: {
      type: 'string',
      label: 'Payment Mode',
      required: true,
    },
    description: {
      type: 'string',
      label: 'Description',
      required: true,
    },
    enabled: {
      type: 'boolean',
      label: 'enabled',
    },
    isDefault: {
      type: 'boolean',
      label: 'Default Mode',
    },
  };

  const config = {
    entity,
    PANEL_TITLE: translate('payment_mode'),
    DATATABLE_TITLE: translate('payment_mode_list'),
    ADD_NEW_ENTITY: translate('add_new_payment_mode'),
    ENTITY_NAME: translate('payment_mode'),
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
