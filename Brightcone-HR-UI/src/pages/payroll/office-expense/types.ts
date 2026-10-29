export interface OfficeExpense {
  id: string;
  date?: string;
  invoice_date?: string;
  category: string;
  vendor?: string;
  vendor_name?: string;
  invoice_no?: string;
  description?: string;
  amount_before_gst?: number;
  base_amount?: number;
  gst?: number;
  gst_rate?: number;
  gst_amount?: number;
  total?: number;
  total_amount?: number;
  payment_mode?: string;
  paid_by?: string;
  approved_by?: string;
  bill_receipt?: string;
  status: 'Pending' | 'Approved' | 'Paid';
  archived?: boolean;
}

export const defaultExpenses: OfficeExpense[] = [];

export const categories = [
  'Office Rent',
  'Internet & Telecom',
  'Hardware & IT',
  'Office Supplies',
  'Electricity & Utilities',
  'Legal & Professional',
  'Rent',
  'Utilities',
  'Supplies',
  'Services',
  'Software',
  'Travel',
  'Hardware',
];

export const gstRates = [0, 5, 12, 18, 28];
