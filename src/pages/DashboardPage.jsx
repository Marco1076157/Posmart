import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import ProductPage from "../components/dashboard/ProductPage";
import PurchasePage from "../components/dashboard/PurchasePage";
import SalesPage from "../components/dashboard/SalesPage";
import UsersPage from "../components/dashboard/UsersPage";
import SupplierPage from "../components/dashboard/SupplierPage";
import POPage from "../components/dashboard/POPage";

const titles = {
    dashboard: 'Dashboard', products: 'Products', purchase: 'Purchase',
    'purchase-supplier': 'Purchase / Supplier', 'purchase-po': 'Purchase / Purchase Order',
    sales: 'Sales', users: 'Users',
};

export default function DashboardPage() {
    const navigate = useNavigate();
    const [activeMenu, setActiveMenu] = useState('dashboard');

    useEffect(() => {
        const checkServerProfile = async () => {
            const token = localStorage.getItem('token');
            if (!token) { localStorage.clear(); navigate('/'); return; }

            try {
                const res = await api.get('/user/me.php');
                if (res.status === 200 && res.data?.status === 'success') {
                    const serverUser = res.data.user;
                    if (serverUser.role !== 'admin') { localStorage.clear(); navigate('/'); return; }
                    localStorage.setItem('user_profile', JSON.stringify(serverUser));
                    return;
                }
            } catch (err) { /* fall through to logout */ }

            localStorage.clear();
            navigate('/');
        };

        checkServerProfile();
    }, [navigate]);

    const userProfile = JSON.parse(localStorage.getItem('user_profile'));

    const renderContent = () => {
        switch (activeMenu) {
            case 'dashboard':
                return (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 max-w-lg">
                        <h2 className="text-lg font-semibold text-gray-900">Selamat datang, {userProfile?.name || 'Admin'}</h2>
                        <p className="text-sm text-gray-500 mt-1.5">
                            Signed in as{' '}
                            <span className="inline-flex items-center rounded-full bg-red-50 text-red-600 text-xs font-medium px-2.5 py-0.5 capitalize ml-0.5">
                                {userProfile?.role || 'admin'}
                            </span>
                        </p>
                    </div>
                );
            case 'products': return <ProductPage />;
            case 'purchase': return <PurchasePage />;
            case 'purchase-supplier': return <SupplierPage />;
            case 'purchase-po': return <POPage />;
            case 'sales': return <SalesPage />;
            case 'users': return <UsersPage />;
            default: return null;
        }
    };

    return (
        <div className="flex h-screen bg-gray-50">
            <DashboardSidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} userProfile={userProfile} />
            <div className="flex-1 flex flex-col min-w-0">
                <header className="h-16 shrink-0 bg-white border-b border-gray-100 flex items-center px-6">
                    <h1 className="text-[15px] font-medium text-gray-900">{titles[activeMenu] || 'Dashboard'}</h1>
                </header>
                <main className="flex-1 p-6 overflow-y-auto">{renderContent()}</main>
            </div>
        </div>
    );
}