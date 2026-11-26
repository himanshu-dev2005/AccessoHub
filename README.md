# AccessoHub CRM

**AccessoHub** is a full-stack Customer Relationship Management (CRM), Inventory, and Supplier Procurement platform built with React, Vite, Ant Design, Redux Toolkit, Node.js, Express, and MongoDB (default currency: **INR / ₹**).

## Core Modules

- **Executive Dashboard (`/`)**: Real-time KPIs across Inventory Value, Supplier Purchases, Supplier Payments, Collected Revenue, Task Status, and Customer Growth.
- **Customer Accounts (`/customer`)**: Manage client organizations, industry, status, source, contact info, and account notes.
- **Tasks & Follow-ups (`/task`)**: Schedule calls, meetings, demos, and follow-ups linked to clients with priority and due-date tracking.
- **Product Categories (`/productcategory`)**: Organize catalog items with color-coded categories.
- **Products (`/product`)**: Track SKU/Ref, category, selling price, cost price, and stock quantities.
- **Suppliers (`/supplier`)**: Manage vendor contacts, GST/Tax IDs, and supplier status.
- **Supplier Purchases (`/supplierpurchase`)**: Create purchase orders (`draft`, `ordered`, `received`, `cancelled`) with automatic total/tax calculation and stock increment on receipt.
- **Supplier Payments (`/supplierpayment`)**: Record vendor settlements linked to purchase orders with automatic balance and payment status updates.
- **Quotes & Invoices (`/quote`, `/invoice`, `/payment`, `/payment/mode`, `/taxes`)**: Full sales quoting, quote-to-invoice conversion, payment recording, tax rules, and PDF receipts.

## Quick Start

### 1. Backend Setup
```bash
cd backend
npm install
npm run setup
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Default Admin Credentials (after `npm run setup`)
- **Email**: `admin@accessohub.com`
- **Password**: `admin123`
