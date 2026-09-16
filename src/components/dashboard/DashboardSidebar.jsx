// components/dashboard/DashboardSidebar.jsx
import { useState } from 'react';
import { LayoutDashboard, Package, ShoppingCart, TrendingUp, Users, LogOut, Store, Truck, FileText, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'purchase', label: 'Purchase', icon: ShoppingCart, sub: [
        { id: 'purchase-supplier', label: 'Supplier', icon: Truck },
        { id: 'purchase-po', label: 'Purchase Order', icon: FileText },
    ]},
    { id: 'sales', label: 'Sales', icon: TrendingUp },
    { id: 'users', label: 'Users', icon: Users },
];

export default function DashboardSidebar({ activeMenu, setActiveMenu, userProfile }) {
    const navigate = useNavigate();
    const [openGroup, setOpenGroup] = useState(activeMenu.startsWith('purchase') ? 'purchase' : null);

    const handleLogout = () => {
        localStorage.clear();
        // replace: true supaya halaman dashboard tidak tersimpan di history browser,
        // jadi tombol "Back" setelah logout tidak menampilkan data lama.
        navigate('/', { replace: true });
    };

    return (
        <div
            className="w-64 h-full flex flex-col text-red-50/90 relative overflow-hidden"
            style={{ background: 'linear-gradient(180deg, #2A0A0F 0%, #4A0E14 45%, #2A0A0F 100%)' }}
        >
            {/* ambient glow, signature elite touch */}
            <div className="pointer-events-none absolute -top-24 -left-16 w-56 h-56 rounded-full bg-red-600/20 blur-3xl" />
            <div className="pointer-events-none absolute bottom-0 -right-10 w-40 h-40 rounded-full bg-amber-500/10 blur-3xl" />

            <div className="h-16 px-5 flex items-center gap-2.5 border-b border-white/5 relative">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg shadow-red-950/40" style={{ background: 'linear-gradient(135deg, #DC2626, #7F1D1D)' }}>
                    <Store className="w-4 h-4 text-white" strokeWidth={2.25} />
                </div>
                <span className="text-[15px] font-semibold tracking-tight text-white">POSMart</span>
                <span className="ml-auto text-[9px] font-semibold uppercase tracking-widest text-amber-400/80">Admin</span>
            </div>

            <nav className="flex-1 px-3 py-5 relative">
                <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-red-200/40">Menu</p>
                <ul className="space-y-0.5">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeMenu === item.id || activeMenu.startsWith(item.id + '-');
                        const isOpen = openGroup === item.id;

                        return (
                            <li key={item.id}>
                                <div className="relative flex items-center rounded-lg">
                                    {isActive && (
                                        <span className="absolute left-0 top-1.5 bottom-1.5 w-0.75 rounded-full bg-linear-to-b from-red-400 via-red-500 to-amber-400 shadow-[0_0_8px_rgba(239,68,68,0.7)]" />
                                    )}
                                    <button
                                        onClick={() => { setActiveMenu(item.id); if (item.sub) setOpenGroup(item.id); }}
                                        className={`flex-1 flex items-center gap-3 pl-4 pr-2 py-2.5 rounded-lg text-sm text-left transition-colors ${
                                            isActive ? 'bg-white/10 text-white font-medium shadow-inner' : 'text-red-100/70 hover:bg-white/5 hover:text-white'
                                        }`}
                                    >
                                        <Icon className="w-4.5 h-4.5" strokeWidth={2} />
                                        {item.label}
                                    </button>
                                    {item.sub && (
                                        <button onClick={(e) => { e.stopPropagation(); setOpenGroup(isOpen ? null : item.id); }} className="pr-3 py-2.5">
                                            <ChevronDown className={`w-4 h-4 text-red-200/40 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                                        </button>
                                    )}
                                </div>

                                <div className={`overflow-hidden transition-all duration-200 ${isOpen ? 'max-h-32 mt-0.5' : 'max-h-0'}`}>
                                    {item.sub && (
                                        <ul className="ml-4 pl-4 border-l border-white/10 space-y-0.5 py-0.5">
                                            {item.sub.map((sub) => {
                                                const SubIcon = sub.icon;
                                                const activeSub = activeMenu === sub.id;
                                                return (
                                                    <li key={sub.id}>
                                                        <button
                                                            onClick={() => setActiveMenu(sub.id)}
                                                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-colors ${
                                                                activeSub ? 'bg-white/10 text-white font-medium' : 'text-red-100/50 hover:bg-white/5 hover:text-white'
                                                            }`}
                                                        >
                                                            <SubIcon className="w-4 h-4" />
                                                            {sub.label}
                                                        </button>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    )}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            <div className="p-3 border-t border-white/5 relative">
                <div className="flex items-center gap-2.5 px-2 py-2 mb-1 rounded-lg">
                    <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white shrink-0 ring-2 ring-amber-400/40"
                        style={{ background: 'linear-gradient(135deg, #F59E0B, #DC2626)' }}
                    >
                        {(userProfile?.username || userProfile?.name || 'A').charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">{userProfile?.username || userProfile?.name || 'Admin'}</p>
                        <p className="text-xs text-red-200/40 capitalize">{userProfile?.role || 'admin'}</p>
                    </div>
                </div>
                <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-red-100/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                    <LogOut className="w-4 h-4" />
                    Logout
                </button>
            </div>
        </div>
    );
}