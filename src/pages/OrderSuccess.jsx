import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle, Printer } from 'lucide-react';
import QRCode from 'react-qr-code';

import { getInitialInvoice, buildQrPayload } from '../utils/invoiceHelpers';
import { buildInvoiceHtml, printInvoice } from '../utils/invoicePrint';

export default function OrderSuccess() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');

  const [invoice, setInvoice] = useState(() => getInitialInvoice(orderId));

  useEffect(() => {
    setInvoice(getInitialInvoice(orderId));
  }, [orderId]);

  const qrValue = useMemo(() => buildQrPayload(invoice), [invoice]);

  const handlePrint = () => {
    const html = buildInvoiceHtml(invoice, orderId);
    printInvoice(html);
  };

  return (
    <div className="max-w-md mx-auto my-16 p-6 bg-white border border-slate-100 shadow-xl rounded-2xl text-center">
      <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4 animate-bounce" />

      <h2 className="text-xl font-black text-slate-800">
        Pesanan Berhasil Dibuat!
      </h2>

      <p className="text-sm text-slate-500 mt-1">
        ID Transaksi Anda:{' '}
        <span className="font-mono font-bold text-slate-700">
          #{invoice.orderId || orderId || '-'}
        </span>
      </p>

      <div className="mt-4 rounded-full inline-flex items-center px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold">
        Menunggu Pembayaran
      </div>

      <hr className="my-6 border-slate-100" />

      <div className="flex flex-col items-center gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            QR Scan
          </p>
          <QRCode
            value={qrValue}
            size={300}
            level="H"
            bgColor="#ffffff"
            fgColor="#000000"
            style={{ height: 'auto', maxWidth: '100%', width: '200px' }}
          />
        </div>

        <button
          onClick={handlePrint}
          className="inline-flex w-full max-w-60 items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800 cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          Print Invoice
        </button>
      </div>

      <button
        onClick={() => (window.location.href = '/')}
        className="mt-4 w-full text-sm text-slate-600 hover:text-red-600 font-semibold underline transition-colors cursor-pointer block mx-auto"
      >
        Kembali Belanja di Katalog
      </button>
    </div>
  );
}