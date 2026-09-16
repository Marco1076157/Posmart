import { useCallback, useEffect } from "react";
import { useCartContext } from "../context/CardContext";
import { useSearchParams } from "react-router-dom";

export default function Pagination() {
    const { products, pagination, fetchProducts } = useCartContext();

    const [searchParams, setSearchParams] = useSearchParams();
    const currentPage = parseInt(searchParams.get('page')) || 1;
    const currentSearch = searchParams.get('search') || '';
    const currentCategory = searchParams.get('category') || 'All';
    
    const handlePageChange = useCallback((newPage) => {
        setSearchParams({
            page: newPage,
            search: currentSearch,
            category: currentCategory
        });
    }, [currentSearch, currentCategory, setSearchParams]);

    return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-between border-t border-slate-200 mt-10">
                <p className="text-xs text-slate-500">
                    Menampilkan <span>{products?.length || 0}</span> dari <span>{pagination?.total_data}</span> produk.
                </p>
                <div className="flex items-center gap-1.5">
                    <button
                        disabled={currentPage === 1}
                        onClick={() => handlePageChange(currentPage - 1)}
                        className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                        Sebelumnya
                    </button>

                    {/* Array button page */}
                    {Array.from({ length: pagination?.total_page }, (_, index) => {
                        const pageNumber = index + 1;
                        return (
                            <button
                                key={pageNumber}
                                onClick={() => handlePageChange(pageNumber)}
                                className={`w-8 h-8 text-xs font-bold rounded-lg transition-colors cursor-pointer ${currentPage === pageNumber
                                    ? 'bg-red-600 text-white shadow-xs'
                                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                                }`}
                            >
                                {pageNumber}
                            </button>
                        );
                    })}

                    {/* Next Page */}
                    <button
                        disabled={currentPage === pagination.total_page}
                        onClick={() => handlePageChange(currentPage + 1)}
                        className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                        Berikutnya
                    </button>
                </div>
            </div>
    )
}


