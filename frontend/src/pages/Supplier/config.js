export const fields = {
  name: {
    type: 'string',
    label: 'Name',
    required: true,
  },
  company: {
    type: 'string',
    label: 'Company',
  },
  phone: {
    type: 'phone',
    label: 'Phone',
  },
  email: {
    type: 'email',
    label: 'Email',
  },
  gstNumber: {
    type: 'string',
    label: 'GST / Tax ID',
    disableForTable: true,
  },
  country: {
    type: 'country',
    label: 'Country',
  },
  status: {
    type: 'selectWithTranslation',
    label: 'Status',
    defaultValue: 'active',
    renderAsTag: true,
    options: [
      { value: 'active', label: 'active', color: 'green' },
      { value: 'inactive', label: 'inactive', color: 'default' },
    ],
  },
  address: {
    type: 'string',
    label: 'Address',
    disableForTable: true,
  },
  notes: {
    type: 'textarea',
    label: 'Notes',
    disableForTable: true,
  },
};
