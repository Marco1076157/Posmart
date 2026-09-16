import { createContext, useContext } from "react";

// Create Context
export const CartContext = createContext(null);

// Create custom hook
export function useCartContext() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCartContext harus bisa digunakan.");
    }
    return context;
};