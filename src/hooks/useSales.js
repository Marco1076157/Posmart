// File: src/hooks/useSales.js
import { useState, useCallback } from "react";
import api from "../utils/api";

const emptyData = {
    totalRevenue: 0,
    totalOrders: 0,
    avgOrder: 0,
    daily: [],
    categories: [],
    topProducts: [],
};

export function useSales() {
    const [data, setData] = useState(emptyData);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchSales = useCallback(async (days = 14) => {
        setLoading(true);
        try {
            const res = await api.get(`/config/get_sales.php?days=${days}`);
            if (res.data?.status === "success") {
                setData({ ...emptyData, ...res.data.data });
                setError(null);
            } else {
                setData(emptyData);
                setError(res.data?.message || "Gagal memuat data sales");
            }
        } catch (err) {
            setData(emptyData);
            setError(err.response?.data?.message || err.message || "Gagal memuat data sales");
        } finally {
            setLoading(false);
        }
    }, []);

    return { data, loading, error, fetchSales };
}