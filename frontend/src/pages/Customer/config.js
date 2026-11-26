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
  industry: {
    type: 'string',
    label: 'Industry',
  },
  category: {
    type: 'selectWithTranslation',
    label: 'Category',
    defaultValue: 'retail',
    renderAsTag: true,
    options: [
      { value: 'retail', label: 'retail', color: 'blue' },
      { value: 'wholesale', label: 'wholesale', color: 'purple' },
    ],
  },
  status: {
    type: 'selectWithTranslation',
    label: 'Status',
    defaultValue: 'active',
    renderAsTag: true,
    options: [
      { value: 'active', label: 'active', color: 'green' },
      { value: 'new', label: 'new', color: 'blue' },
      { value: 'premium', label: 'premium', color: 'gold' },
      { value: 'inactive', label: 'inactive', color: 'default' },
    ],
  },
  source: {
    type: 'select',
    label: 'Source',
    defaultValue: 'website',
    options: [
      { value: 'website', label: 'Website' },
      { value: 'linkedin', label: 'LinkedIn' },
      { value: 'referral', label: 'Referral' },
      { value: 'advertising', label: 'Advertising' },
      { value: 'sales', label: 'Direct Sales' },
      { value: 'other', label: 'Other' },
    ],
    disableForTable: true,
  },
  country: {
    type: 'country',
    label: 'Country',
  },
  phone: {
    type: 'phone',
    label: 'Phone',
  },
  email: {
    type: 'email',
    label: 'Email',
  },
  website: {
    type: 'string',
    label: 'Website',
    disableForTable: true,
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
