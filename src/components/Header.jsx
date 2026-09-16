//file: src/components/Header.jsx
import { ChevronDown, Search, ShoppingCart, LogIn, User, LogOut, Menu } from "lucide-react";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useCartContext } from '../context/CardContext'

export default function Header() {

    const { totalCartItemsCount, setIsCartOpen } = useCartContext();
    const [searchParams, setSearchParams] = useSearchParams();
    const [showDropdown, setShowDropdown] = useState(false);
    const [localSearch, setLocalSearch] = useState(searchParams.get('search') || '');

    // Debounce Effect
    useEffect(() => {
        const currentSearchUrl = searchParams.get('search') || '';
        if (localSearch == currentSearchUrl) return;

        const currentCategory = searchParams.get('category') || 'All';

        const delayDebounceFn = setTimeout(() => {
            const newParams = new URLSearchParams(searchParams);

            newParams.set('page', '1');
            newParams.set('category', currentCategory);

            if (localSearch.trim() !== '') {
                newParams.set('search', localSearch.trim());
            } else {
                newParams.delete('search');
            }

            setSearchParams(newParams);
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [localSearch, searchParams]);

    // Sinkronisasi dengan JWT
    const [isLoggedIn, setIsLoggedIn] = useState(() => {
        return localStorage.getItem('token') !== null;
    });

    // Ambil profile data dari localStorage
    const userProfile = ( () => {
        const savedProfile = localStorage.getItem('user_profile');
        if (savedProfile) {
            try {
                const user = JSON.parse(savedProfile);
                return {
                    name: user.name,
                    avatar: user.avatar || "/avatars/avatar.jpg" // Perbaikan: Gunakan avatar dari user jika ada
                }
            } catch (e) {
                console.error("gagal parsing data user profile: ", e);
            }
        }
        return { name: "Guest", avatar: "/avatar/avatar.jpg" } // Perbaikan: tambahkan default avatar
    })();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user_profile');
        setIsLoggedIn(false);
        setShowDropdown(false);
        window.location.href = '/';
    }

    return (
        <header className="bg-white border-b border-slate-100 sticky top-0 z-50 p-4 shadow-xs">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <h1 className="text-xl font-black tracking-tight text-red-600 cursor-pointer" onClick={() => window.location.href = '/'}>
                    POS <span className="text-green-600">MART</span>
                </h1>

                {/* Search Bar */}
                <div className="hidden sm:flex flex-1 max-w-md relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                    <input 
                        type="text"
                        value={localSearch}    
                        onChange={(e) => setLocalSearch(e.target.value)}
                        placeholder="Cari kebutuhan harian anda ...."
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-hidden focus:border-red-500 focus:ring-red-500 transition-all"
                    />
                </div>

                {/* Action & Authentication Interface */}
                <div className="flex items-center gap-4">
                    {/* Keranjang Belanja */}
                    <button 
                        onClick={() => setIsCartOpen(true)}
                        className="relative p-2 text-slate-500 hover:text-red-500 transition-colors cursor-pointer"
                    >
                        <ShoppingCart className="w-6 h-6" />
                        {totalCartItemsCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-600 text-white font-mono text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                                {totalCartItemsCount}
                            </span>
                        )}
                    </button>

                    {/* Login Auth */}
                    {!isLoggedIn ? (
                        <button 
                            onClick={() => window.location.href = '/login'}
                            className="bg-red-600 hover:bg-red-800 text-white font-semibold text-xs px-4 py-2 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
                        >
                            <LogIn className="w-4 h-4" />
                            LOG IN
                        </button>
                    ) : (
                        <div className="relative">
                            <button 
                                onClick={() => setShowDropdown(!showDropdown)}
                                className="flex items-center gap-2 hover:bg-slate-50 p-1.5 rounded-lg transition-colors cursor-pointer focus:outline-hidden"
                            >
                                <img 
                                    src={userProfile.avatar} 
                                    alt={userProfile.name}
                                    className="w-8 h-8 rounded-full object-cover border border-slate-200"
                                />
                                <span className="hidden md:inline-block text-sm font-semibold text-slate-700 max-w-30 truncate">
                                    {userProfile.name}
                                </span>
                                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Dropdown Profile */}
                            {showDropdown && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)}></div>
                                    <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-40">
                                        <div className="px-4 py-2 border-b border-slate-100 md:hidden">
                                            <p className="text-sm font-bold text-slate-800 truncate">{userProfile.name}</p>
                                        </div>
                                        
                                        {/* Profil page */}
                                        <button 
                                            onClick={() => {
                                                alert("Membuka Profil page ....");
                                                setShowDropdown(false);
                                            }}
                                            className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer"                                       
                                        >
                                            <User className="w-4 h-4 text-slate-400"/>
                                            Lihat Profil
                                        </button>
                                        
                                        {/* LOGOUT */}
                                        <button 
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer"  
                                        >
                                            <LogOut className="w-4 h-4 text-slate-400"/>
                                            LOGOUT
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* Mobile Menu */}
                    <button className="p-2 text-slate-500 hover:text-red-500">
                        <Menu />
                    </button>
                </div>
            </div>
        </header>
    )
}