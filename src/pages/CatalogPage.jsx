//File: pages/CatalogPage.jsx
import { useState, useMemo, useEffect, useCallback } from "react";
import Header from "../components/Header";
import { ArrowUpDown, Percent, Sparkle, Truck } from "lucide-react";
import CartModal from "../components/CartModal";
import ProductCard from "../components/ProductCard";
import { useCartContext } from "../context/CardContext";
import { useSearchParams } from "react-router-dom";
import Pagination from "../components/Pagination";

const STEP_VALUE = 500;

export default function CatalogPage() {

    const { products, loading, error, pagination, fetchProducts } = useCartContext();

    const [selectedCategory, setSelectedCategory] = useState('All');
    const [onlyPromo, setOnlyPromo] = useState(false);
    const [sortBy, setSortBy] = useState('none');
    const [userMaxPrice, setUserMaxPrice] = useState(null);

    const [searchParams, setSearchParams] = useSearchParams();
    const currentPage = parseInt(searchParams.get('page')) || 1;
    const currentSearch = searchParams.get('search') || '';
    const currentCategory = searchParams.get('category') || 'All';

    // Slider harga product
    const { MIN_PRICE_LIMIT } = useMemo(() => {
        const allPrices = products ? products.map(p => p.price) : [];
        return { 
            MIN_PRICE_LIMIT: Math.floor((allPrices.length > 0 ? Math.min(...allPrices) : 0) / STEP_VALUE) * STEP_VALUE 
        };
    }, [products]);

    const currentMaxLimit = useMemo(() => {
        if (!products || products.length === 0) return MIN_PRICE_LIMIT;

        const activeProducts = products.filter(p => {
            const matchCategory = currentCategory === 'All' || p.category === currentCategory;
            const matchPromo = !onlyPromo || p.is_promo;
            return matchCategory && matchPromo;
        });

        if (activeProducts.length > 0) {
            const highestPrice = Math.max(...activeProducts.map(p => p.price));
            return Math.ceil(highestPrice / STEP_VALUE) * STEP_VALUE;
        }

        return MIN_PRICE_LIMIT;
    }, [products, currentCategory, onlyPromo, MIN_PRICE_LIMIT]);

    const effectiveMaxPrice = userMaxPrice !== null ? userMaxPrice : currentMaxLimit;

    // Filtered product 
    const filteredProduct = useMemo(() => {
        if (!products) return [];

        let result = products.filter((product) => {
            const matchCategory = currentCategory === 'All' || product.category === currentCategory;
            const matchPrice = product.price <= effectiveMaxPrice;
            const matchPromo = !onlyPromo || product.is_promo;
            return matchCategory && matchPrice && matchPromo;
        });

        if (sortBy === 'asc') {
            result.sort((a, b) => a.price - b.price);
        } else if (sortBy === 'desc') {
            result.sort((a, b) => b.price - a.price);
        }
        return result;
    }, [products, currentCategory, effectiveMaxPrice, onlyPromo, sortBy]);

    const promoProducts = useMemo(() => {
        return products ? products.filter(product => product.is_promo) : [];
    }, [products]);

    // Toggle render
    useEffect(() => {
        fetchProducts({
            page: currentPage,
            search: currentSearch,
            category: currentCategory
        });
    }, [currentPage, currentSearch, currentCategory, fetchProducts]);

    const handleCategoryChange = useCallback((category) => {
        setSearchParams({
            page: 1,
            search: currentSearch,
            category: category
        });
        setUserMaxPrice(null);
    }, [currentSearch, setSearchParams]);

    const handlePromoToggle = useCallback((e) => {
        setOnlyPromo(e.target.checked);
        setUserMaxPrice(null);
    }, []);

    const handlePriceChange = useCallback((e) => {
        setUserMaxPrice(Number(e.target.value));
    }, []);

    // Pagination handlers
    const handlePageChange = useCallback((newPage) => {
        setSearchParams({
            page: newPage,
            search: currentSearch,
            category: currentCategory
        });
    }, [currentSearch, currentCategory, setSearchParams]);

    // Loader screen
    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-3">
                <div className="w-8 h-8 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm font-bold text-slate-500 tracking-wide animate-pulse">
                    Menghubungkan ke database POSMart . . . .
                </p>
            </div>
        )
    }

    // Error screen
    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-3">
                <span className="text-4xl">😹</span>
                <h3 className="font-bold text-slate-500 text-lg">Gagal Memuat katalog</h3>
                <p className="text-sm text-slate-800 max-w-xs">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-2 px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
                >Coba Lagi</button>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-800">
            <Header />

            {/* HERO BANNER */}
            <section className="bg-linear-to-r from-green-600 to-green-300 text-white py-12 px-4 shadow-inner">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <div className="space-y-4">
                        <span className="inline-flex items-center gap-1.5 bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-md">
                            <Sparkle className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            Promo Agustus
                        </span>
                        <h2 className="text-3xl md:text-4xl font-bold leading-tight">
                            Belanja Sembako Murah, <br /> Dekat & Nyaman
                        </h2>
                        <p className="text-white/90">Penuhi kebutuhan harian rumah tangga anda dengan harga hemat.</p>
                    </div>
                    <div className="relative h-80 flex items-end">
                        <div className="w-full hidden md:block bg-white/10 border border-white/20 h-72 rounded-2xl backdrop-blur-xs relative me-8">
                            <div className="absolute inset-0 flex items-center justify-center text-white/50">
                                <span className="text-4xl">🛒</span>
                            </div>
                            <div className="absolute left-6 -top-4 z-10">
                                <span className="text-xl font-bold bg-yellow-400 text-green-900 px-3 py-1 rounded-md shadow-md">POSMart Fresh</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* VALUE PROPOSITION BAR */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
                <div className="bg-white rounded-xl border border-slate-200 p-6 grid grid-cols-2 lg:grid-cols-4 gap-4 shadow-xs">
                    <div className="flex items-center gap-2.5">
                        <Truck className="w-5 h-5 text-red-600 shrink-0" />
                        <div>
                            <h4 className="text-xs font-bold text-slate-900">Delivery Kilat</h4>
                            <p className="text-[10px] text-slate-400">Antar langsung ke rumah</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                        <Percent className="w-5 h-5 text-green-600 shrink-0" />
                        <div>
                            <h4 className="text-xs font-bold text-slate-900">Harga Hemat</h4>
                            <p className="text-[10px] text-slate-400">Lebih murah dari pasaran</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                        <Sparkle className="w-5 h-5 text-yellow-600 shrink-0" />
                        <div>
                            <h4 className="text-xs font-bold text-slate-900">Produk Segar</h4>
                            <p className="text-[10px] text-slate-400">Kualitas terjamin</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                        <ArrowUpDown className="w-5 h-5 text-blue-600 shrink-0" />
                        <div>
                            <h4 className="text-xs font-bold text-slate-900">Mudah Dipesan</h4>
                            <p className="text-[10px] text-slate-400">Proses cepat & praktis</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* FLASH SALE SECTION */}
            {promoProducts.length > 0 && (
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 shadow-xs">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="bg-red-600 text-white p-1.5 rounded-lg animate-bounce">
                                    <Percent className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 tracking-tight">Kejar diskon hari ini</h3>
                                    <p className="text-xs text-amber-700">Produk Pilihan, jangan sampai kehabisan...</p>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                            {promoProducts.slice(0, 6).map((product) => (
                                <div key={product.id} className="relative">
                                    <div className="absolute top-2 right-2 z-10 bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded-md shadow-xs">Promo Hemat</div>
                                    <ProductCard product={product} />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* MAIN CATALOG */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Filter */}
                <aside className="lg:col-span-3 space-y-6">
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs sticky top-20">
                        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4 text-slate-900">
                            <h3 className="font-bold text-sm tracking-tight">Filter Belanja</h3>
                        </div>

                        <div className="mb-5">
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Kategori</label>
                            <div className="flex flex-col gap-1.5">
                                {['All', 'Food', 'Beverage', 'Personal Care'].map((category) => (
                                    <button
                                        key={category}
                                        onClick={() => handleCategoryChange(category)}
                                        className={`
                                            text-left text-sm px-3 py-2 rounded-lg font-medium transition-colors
                                            cursor-pointer ${currentCategory === category
                                                ? 'bg-red-50 text-red-600'
                                                : 'text-slate-600 hover:bg-slate-50'
                                            }
                                        `}
                                    >
                                        {category === 'All' ? 'Semua Produk' : category}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mb-5">
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Harga Maksimum</label>
                                <span className="text-xs font-mono font-bold text-red-600">Rp {effectiveMaxPrice.toLocaleString('id-ID')}</span>
                            </div>
                            <input 
                                type="range"
                                min={MIN_PRICE_LIMIT}
                                max={currentMaxLimit}
                                step={STEP_VALUE}
                                value={effectiveMaxPrice}
                                onChange={handlePriceChange}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-600"
                            />
                            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                                <span>Rp {MIN_PRICE_LIMIT.toLocaleString('id-ID')}</span>
                                <span>Rp {currentMaxLimit.toLocaleString('id-ID')}</span>
                            </div>
                        </div>

                        {/* Checkbox Promo */}
                        <div className="pt-3 border-t border-slate-100">
                            <label className="flex items-center gap-2.5 text-sm font-medium text-slate-700 cursor-pointer select-none">
                                <input 
                                    type="checkbox"
                                    checked={onlyPromo}
                                    onChange={handlePromoToggle}
                                    className="w-4 h-4 rounded-sm border-slate-300 text-red-600 focus:ring-red-500 accent-red-600 cursor-pointer"
                                />
                                <span>Tampilkan hanya produk promo</span>
                            </label>
                        </div>
                    </div>
                </aside>

                {/* List Grid View */}
                <div className="lg:col-span-9 space-y-4">
                    {/* Sorting Harga */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="text-xs text-slate-500 font-medium">
                            Menampilkan <span className="font-bold text-slate-800 font-mono">{filteredProduct.length}</span> item
                        </div>
                        <div className="flex items-center gap-2">
                            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                            <select 
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 px-3 py-1.5 focus:border-red-500 cursor-pointer"
                            >
                                <option value="none">Urutkan Produk</option>
                                <option value="asc">Harga: Termurah ke Termahal</option>
                                <option value="desc">Harga: Termahal ke Termurah</option>
                            </select>
                        </div>
                    </div>

                    {/* List of Product */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                        {filteredProduct.map((singleProduct) => (
                            <ProductCard key={singleProduct.id} product={singleProduct} />
                        ))}
                    </div>

                    {/* Empty State */}
                    {filteredProduct.length === 0 && (
                        <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
                            <span className="text-6xl block mb-4">🔍</span>
                            <h3 className="text-lg font-bold text-slate-600">Tidak ada produk</h3>
                            <p className="text-sm text-slate-400 mt-1">Coba ubah filter atau kategori yang dipilih</p>
                        </div>
                    )}
                </div>
            </main>

            <Pagination />

            {/* CHECKOUT MODAL */}
            <CartModal />
        </div>
    )
}