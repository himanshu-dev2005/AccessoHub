import CrudModule from '@/modules/CrudModule/CrudModule';
import DynamicForm from '@/forms/DynamicForm';
import { fields } from './config';
import useLanguage from '@/locale/useLanguage';

export default function Task() {
  const translate = useLanguage();
  const entity = 'task';

  const config = {
    entity,
    PANEL_TITLE: translate('task'),
    DATATABLE_TITLE: translate('task_list'),
    ADD_NEW_ENTITY: translate('add_new_task'),
    ENTITY_NAME: translate('task'),
    fields,
    searchConfig: {
      displayLabels: ['title'],
      searchFields: 'title,description',
    },
    deleteModalLabels: ['title'],
  };

  return (
    <CrudModule
      createForm={<DynamicForm fields={fields} />}
      updateForm={<DynamicForm fields={fields} isUpdateForm={true} />}
      config={config}
    />
  );
}
