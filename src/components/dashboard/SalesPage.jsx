// components/dashboard/SalesPage.jsx
import { useEffect, useMemo, useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler } from 'chart.js';
import { Line, Pie } from 'react-chartjs-2';
import { Wallet, ShoppingBag, Receipt, TrendingUp } from 'lucide-react';
import { useSales } from '../../hooks/useSales';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler);

// Variasi "merah" untuk data viz: ruby, ember, amber, rose, wine, brick
const PALETTE = ['#DC2626', '#F97316', '#F59E0B', '#FB7185', '#7F1D1D', '#B91C1C', '#9A3412'];

const RANGES = [
    { label: '7 hari', value: 7 },
    { label: '14 hari', value: 14 },
    { label: '30 hari', value: 30 },
];

const formatRp = (n) => `Rp ${Number(n || 0).toLocaleString('id-ID')}`;

function KpiCard({ icon: Icon, label, value, accent, sub }) {
    return (
        <div className="relative overflow-hidden rounded-2xl bg-white border border-red-950/5 shadow-sm shadow-red-950/5 p-5">
            <div className="absolute inset-x-0 top-0 h-1" style={{ background: `linear-gradient(90deg, ${accent}, #F59E0B)` }} />
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</p>
                    <p className="text-2xl font-semibold text-gray-900 mt-1.5 tabular-nums">{value}</p>
                    {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
                </div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${accent}1A` }}>
                    <Icon className="w-5 h-5" style={{ color: accent }} strokeWidth={2.25} />
                </div>
            </div>
        </div>
    );
}

function SkeletonBlock({ className }) {
    return <div className={`animate-pulse rounded-xl bg-gray-100 ${className}`} />;
}

export default function SalesPage() {
    const { data, loading, error, fetchSales } = useSales();
    const [range, setRange] = useState(14);

    useEffect(() => { fetchSales(range); }, [fetchSales, range]);

    const lineData = useMemo(() => ({
        labels: data.daily.map((d) => d.label),
        datasets: [{
            label: 'Total penjualan',
            data: data.daily.map((d) => d.total),
            borderColor: '#DC2626',
            backgroundColor: (ctx) => {
                const { chart } = ctx;
                const { chartArea } = chart;
                if (!chartArea) return 'rgba(220,38,38,0.15)';
                const gradient = chart.ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                gradient.addColorStop(0, 'rgba(220,38,38,0.28)');
                gradient.addColorStop(1, 'rgba(220,38,38,0)');
                return gradient;
            },
            fill: true,
            tension: 0.35,
            pointRadius: 3,
            pointBackgroundColor: '#DC2626',
            pointBorderColor: '#fff',
            pointBorderWidth: 1.5,
            borderWidth: 2.5,
        }],
    }), [data.daily]);

    const pieData = useMemo(() => ({
        labels: data.categories.map((c) => c.category),
        datasets: [{
            data: data.categories.map((c) => c.total),
            backgroundColor: data.categories.map((_, i) => PALETTE[i % PALETTE.length]),
            borderColor: '#fff',
            borderWidth: 2,
        }],
    }), [data.categories]);

    const hasOrders = data.totalOrders > 0;

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold text-gray-900">Sales</h1>
                    <p className="text-sm text-gray-400 mt-0.5">Ringkasan penjualan &amp; performa kategori</p>
                </div>
                <div className="inline-flex items-center gap-0.5 bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
                    {RANGES.map((r) => (
                        <button
                            key={r.value}
                            onClick={() => setRange(r.value)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                                range === r.value ? 'bg-red-600 text-white shadow-sm shadow-red-200' : 'text-gray-500 hover:bg-gray-50'
                            }`}
                        >
                            {r.label}
                        </button>
                    ))}
                </div>
            </div>

            {error && <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-2.5">{error}</div>}

            {loading ? (
                <div className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <SkeletonBlock className="h-24" />
                        <SkeletonBlock className="h-24" />
                        <SkeletonBlock className="h-24" />
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <SkeletonBlock className="h-80 lg:col-span-2" />
                        <SkeletonBlock className="h-80" />
                    </div>
                </div>
            ) : !hasOrders ? (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 flex flex-col items-center text-center gap-2">
                    <TrendingUp className="w-8 h-8 text-gray-300" />
                    <p className="text-sm font-medium text-gray-700">Belum ada transaksi</p>
                    <p className="text-xs text-gray-400 max-w-sm">Chart penjualan akan muncul di sini begitu ada order yang masuk dari tabel orders &amp; order_items.</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <KpiCard icon={Wallet} label="Total Revenue" value={formatRp(data.totalRevenue)} accent="#DC2626" />
                        <KpiCard icon={Receipt} label="Total Orders" value={data.totalOrders.toLocaleString('id-ID')} accent="#F97316" />
                        <KpiCard icon={ShoppingBag} label="Rata-rata / Order" value={formatRp(data.avgOrder)} accent="#F59E0B" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                            <h2 className="text-sm font-semibold text-gray-900 mb-4">Tren Penjualan</h2>
                            <div className="h-72">
                                <Line
                                    data={lineData}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: { legend: { display: false } },
                                        scales: {
                                            x: { grid: { display: false }, ticks: { color: '#9CA3AF', font: { size: 11 } } },
                                            y: {
                                                grid: { color: '#F3F4F6' },
                                                ticks: {
                                                    color: '#9CA3AF', font: { size: 11 },
                                                    callback: (v) => `${(v / 1000).toLocaleString('id-ID')}k`,
                                                },
                                            },
                                        },
                                    }}
                                />
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                            <h2 className="text-sm font-semibold text-gray-900 mb-4">Penjualan per Kategori</h2>
                            <div className="h-56 flex items-center justify-center">
                                <Pie
                                    data={pieData}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: { legend: { display: false } },
                                    }}
                                />
                            </div>
                            <ul className="mt-4 space-y-2">
                                {data.categories.map((c, i) => (
                                    <li key={c.category} className="flex items-center justify-between text-xs">
                                        <span className="flex items-center gap-2 text-gray-600">
                                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: PALETTE[i % PALETTE.length] }} />
                                            {c.category}
                                        </span>
                                        <span className="font-mono tabular-nums text-gray-900">{c.share}%</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-100">
                            <h2 className="text-sm font-semibold text-gray-900">Produk Terlaris</h2>
                        </div>
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50/60">
                                    <th className="py-2.5 px-5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Produk</th>
                                    <th className="py-2.5 px-5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Terjual</th>
                                    <th className="py-2.5 px-5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Revenue</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {data.topProducts.map((p) => (
                                    <tr key={p.name} className="hover:bg-gray-50/70 transition-colors">
                                        <td className="py-3 px-5 font-medium text-gray-900">{p.name}</td>
                                        <td className="py-3 px-5 text-right font-mono tabular-nums text-gray-600">{p.qty}</td>
                                        <td className="py-3 px-5 text-right font-mono tabular-nums text-gray-900">{formatRp(p.total)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}