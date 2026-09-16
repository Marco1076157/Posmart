//File: src/hooks/useProduct.js
import { useState, useCallback } from "react";
import api from "../utils/api"

export function useProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        current_page: 1,
        total_page: 1,
        total_data: 0,
    })

    const fetchProducts = useCallback( async (filters = {}) => {
        setLoading(true);
        try {
            const page = filters.page || 1;
            const search = filters.search || '';
            const category = filters.category || 'All';

            const response = await api.get(
               `/config/get_product.php?page=${page}&per_page=2&search=${encodeURIComponent(search)}&category=${category}`
            );

            if (response.data && response.data.status === 'success') {
                setProducts(response.data.products || []);
                setPagination({
                    current_page: parseInt(page),
                    total_page: response.data.pagination?.total_page || 1,
                    total_data: response.data.pagination?.total_data || 0,
                });
                setError(null);
            } else {
                setProducts([]);
                setPagination((prev) => ({ ...prev, current_page: parseInt(page), total_page: 1, total_data: 0 }));
                setError(response.data?.message || 'Gagal memuat data produk...');
                console.error('Fetch product failed:', response.data);
            }

        } catch (err) {
            const message = err.response?.data?.message || err.message || 'Gagal memuat data produk...';
            setError(message);
            console.error("Fetch product error: ", err);
        } finally {
            setLoading(false)
        }
    }, []);


    return {
        products,
        loading,
        error,
        pagination,
        fetchProducts,
    };
}