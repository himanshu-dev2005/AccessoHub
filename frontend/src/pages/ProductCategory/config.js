import color from '@/utils/color';

export const fields = {
  name: {
    type: 'string',
    label: 'Name',
    required: true,
  },
  description: {
    type: 'string',
    label: 'Description',
    required: true,
  },
  color: {
    type: 'color',
    label: 'Color',
    options: color,
    defaultValue: 'blue',
    required: true,
  },
  enabled: {
    type: 'boolean',
    label: 'enabled',
  },
};
