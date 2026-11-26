export const fields = {
  name: {
    type: 'string',
    label: 'Name',
    required: true,
  },
  ref: {
    type: 'string',
    label: 'SKU / Ref',
  },
  productCategory: {
    type: 'async',
    label: 'Product Category',
    entity: 'productcategory',
    displayLabels: ['name'],
    dataIndex: ['productCategory', 'name'],
    withRedirect: true,
    urlToRedirect: '/productcategory',
    redirectLabel: 'add_new_product_category',
    required: true,
  },
  wholesalePrice: {
    type: 'currency',
    label: 'Wholesale Price',
    required: true,
  },
  retailPrice: {
    type: 'currency',
    label: 'Retail Price',
    required: true,
  },
  purchaseCost: {
    type: 'currency',
    label: 'Purchase Cost',
    required: true,
  },
  stock: {
    type: 'number',
    label: 'Stock Qty',
    defaultValue: 0,
  },
  description: {
    type: 'textarea',
    label: 'Description',
    disableForTable: true,
  },
  enabled: {
    type: 'boolean',
    label: 'enabled',
  },
};
