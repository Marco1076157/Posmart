import {
  formatCurrency,
  formatDateTime,
  buildQrPayload,
  getShippingLabel,
} from './invoiceHelpers';

const PRINT_STYLES = `
  @page { size: 80mm auto; margin: 0; }
  * { box-sizing: border-box; }
  body {
    font-family: Arial, Helvetica, sans-serif;
    padding: 0;
    color: #111;
    margin: 0;
    background: #fff;
  }
  .invoice {
    width: 80mm;
    max-width: 80mm;
    padding: 5mm 4mm;
    margin: 0;
  }
  .header {
    font-weight: 700;
    margin-bottom: 4px;
    text-align: center;
    font-size: 14px;
    letter-spacing: 1px;
  }
  .sub {
    text-align: center;
    font-size: 10px;
    margin-bottom: 8px;
  }
  .line {
    border-top: 1px dashed #111;
    margin: 8px 0;
  }
  .meta-row {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    margin: 3px 0;
    font-size: 11px;
    line-height: 1.4;
  }
  .meta-row span:last-child {
    text-align: right;
    max-width: 170px;
    word-break: break-word;
  }
  .item {
    margin-bottom: 8px;
    font-size: 11px;
    line-height: 1.45;
  }
  .item-top {
    display: flex;
    justify-content: space-between;
    gap: 10px;
  }
  .item-name {
    flex: 1;
    padding-right: 8px;
    word-break: break-word;
  }
  .item-sub {
    display: flex;
    justify-content: space-between;
    margin-top: 1px;
    color: #444;
  }
  .total {
    font-size: 12px;
    font-weight: 700;
  }
  .qr-section {
    text-align: center;
    margin: 14px 0 10px;
    width: 100%;
  }
  .qr-section img {
    width: 145px;
    height: 145px;
    display: block;
    margin: 0 auto 6px;
  }
  .qr-label {
    font-size: 9px;
    color: #555;
    text-align: center;
  }
  .footer {
    text-align: center;
    font-size: 10px;
    margin-top: 10px;
  }
  @media print {
    html, body {
      width: 80mm;
      min-width: 80mm;
      margin: 0;
    }
  }
`;

function buildInvoiceItemsHtml(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return `<div class="item"><div class="item-name">Tidak ada item tersimpan</div></div>`;
  }

  return items
    .map(
      (item, index) => `
      <div class="item">
        <div class="item-top">
          <div class="item-name">${index + 1}. ${item.name}</div>
          <div>${item.qty}x</div>
        </div>
        <div class="item-sub">
          <span>${formatCurrency(item.price)}</span>
          <span>${formatCurrency(item.total)}</span>
        </div>
      </div>
    `
    )
    .join('');
}

export function buildInvoiceHtml(invoice, orderId) {
  const qrPayload = buildQrPayload(invoice);
  const shippingLabel = getShippingLabel(invoice);
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=8&data=${encodeURIComponent(qrPayload)}`;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Invoice - ${invoice.orderId || orderId || '-'}</title>
        <style>${PRINT_STYLES}</style>
      </head>
      <body>
        <div class="invoice">
          <div class="header">POSMART</div>
          <div class="sub">STRUK PEMBELIAN</div>
          <div class="sub">Order #${invoice.orderId || orderId || '-'}</div>
          <div class="sub">${formatDateTime(invoice.createdAt)}</div>

          <div class="line"></div>

          <div class="meta-row"><span>Nama</span><span>${invoice.customerName || '-'}</span></div>
          <div class="meta-row"><span>Customer ID</span><span>${invoice.customerId || '-'}</span></div>
          <div class="meta-row"><span>Status</span><span>${invoice.status || 'pending'}</span></div>

          <div class="line"></div>

          ${buildInvoiceItemsHtml(invoice.items)}

          <div class="line"></div>

          <div class="meta-row"><span>Jumlah Item</span><span>${invoice.totalQty || 0}</span></div>
          <div class="meta-row"><span>Subtotal</span><span>${formatCurrency(invoice.subtotal)}</span></div>
          <div class="meta-row"><span>Ongkos Kirim (${shippingLabel})</span><span>${formatCurrency(invoice.shippingFee)}</span></div>
          <div class="meta-row total"><span>TOTAL</span><span>${formatCurrency(invoice.totalPrice)}</span></div>

          <div class="line"></div>

          <div class="qr-section">
            <img src="${qrImageUrl}" alt="QR Invoice" />
            <div class="qr-label">Scan untuk detail struk</div>
          </div>

          <div class="line"></div>

          <div class="footer">Terima kasih telah berbelanja.</div>
          
        </div>
      </body>
    </html>
  `;
}

export function printInvoice(html) {
  const iframe = document.createElement('iframe');
  iframe.style.cssText = `
    position: fixed;
    right: 0;
    bottom: 0;
    width: 0;
    height: 0;
    border: 0;
    opacity: 0;
  `;
  document.body.appendChild(iframe);

  const cleanup = () => {
    setTimeout(() => {
      if (iframe.parentNode) {
        iframe.parentNode.removeChild(iframe);
      }
    }, 1000);
  };

  iframe.onload = () => {
    const printWindow = iframe.contentWindow;
    if (!printWindow) {
      cleanup();
      return;
    }
    printWindow.focus();
    printWindow.print();
    cleanup();
  };

  const doc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!doc) {
    cleanup();
    return;
  }

  doc.open();
  doc.write(html);
  doc.close();
}