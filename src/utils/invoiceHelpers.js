export const INVOICE_STORAGE_KEY = 'posmart_last_invoice';

export function safeParseJson(value) {
  try {
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error('Gagal membaca data invoice:', error);
    return null;
  }
}

export function formatCurrency(value) {
  return `Rp ${Number(value || 0).toLocaleString('id-ID')}`;
}

export function formatDateTime(value) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return '-';

  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export function getShippingLabel(invoice) {
  if (invoice.courier === 'express') return 'Sameday Kilat';
  if (invoice.courier === 'regular') return 'Reguler';
  return Number(invoice.shippingFee) >= 20000 ? 'Sameday Kilat' : 'Reguler';
}

export function buildQrPayload(invoice) {
  const lines = [
    `Order ID: ${invoice.orderId || '-'}`,
    `Cust ID: ${invoice.customerId || '-'}`,
    `Total/Amount: ${formatCurrency(invoice.totalPrice)}`,
  ];

  return lines.join('\n');
}

export function getInitialInvoice(orderId) {
  const storedInvoice = safeParseJson(localStorage.getItem(INVOICE_STORAGE_KEY));
  const storedProfile = safeParseJson(localStorage.getItem('user_profile'));

  return {
    orderId: orderId || storedInvoice?.orderId || '',
    customerId:
      storedInvoice?.customerId ||
      storedProfile?.id ||
      storedProfile?.user_id ||
      '-',
    customerName:
      storedInvoice?.customerName || storedProfile?.name || 'Pelanggan',
    totalQty: storedInvoice?.totalQty || 0,
    subtotal: storedInvoice?.subtotal || 0,
    shippingFee: storedInvoice?.shippingFee || 0,
    courier: storedInvoice?.courier || '',
    totalPrice: storedInvoice?.totalPrice || 0,
    items: Array.isArray(storedInvoice?.items) ? storedInvoice.items : [],
    createdAt: storedInvoice?.createdAt || new Date().toISOString(),
    status: storedInvoice?.status || 'pending',
  };
}