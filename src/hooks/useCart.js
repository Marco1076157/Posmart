//File: src/hooks/useCart.js

import { useState, useCallback } from "react";
import { useLocalStorage } from './useLocalStorage';

export function useCart() {
    const [cart, setcart] = useLocalStorage('posmart', []);
    const [isCartOpen, setIsCartOpen] = useState(false);

    const handleAddToCart = useCallback((product) => {
        setcart((currentCart) => {
            const existingItem = currentCart.find((item) => Number(item.id) === Number(product.id));
            if (existingItem) {
                return currentCart.map((item) => Number(item.id) === Number(product.id)
                    ? { ...item, qty: item.qty + 1 }
                    : item);
            }
            //return [...currentCart, { id: product.id, qty: 1 }];
            return [...currentCart, { ...product, qty: 1}];
        });
    }, [setcart]);

    const handleRemoveItem = useCallback((id) => {
        setcart((currentCart) => currentCart.filter((item) => item.id !== id));
    }, [setcart]);

    const handleUpdateQty = useCallback((id, newQty) => {
        if (newQty <= 0) {
            handleRemoveItem(id);
            return;
        }
        setcart((currentCart) => currentCart.map((item) => ( item.id === id 
            ? {...item, qty:newQty}
            : item))
        );
    }, [setcart, handleRemoveItem]);

    const clearCart = useCallback(() => {
        setcart([]); // Reset state cart ke array kosong
        // useLocalStorage sudah otomatis menyimpan karena menggunakan setcart
    }, [setcart]);

    const totalCartItemsCount = cart.reduce((total, item) => total + item.qty, 0);

    return {
        cart,
        isCartOpen,
        setIsCartOpen,
        handleAddToCart,
        handleRemoveItem,
        handleUpdateQty,
        clearCart,
        totalCartItemsCount
    };
}