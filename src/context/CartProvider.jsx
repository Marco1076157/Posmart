//File: context/CartProvider.jsx
import { CartContext } from "./CardContext";
import { useCart } from "../hooks/useCart";
import { useProducts } from "../hooks/useProducts";

export function CartProvider({ children }) {
    const cartTools = useCart();
    const ProductTools = useProducts();



    const contextValue = {
        ...cartTools,
        ...ProductTools,
        
    }

    return (
        <CartContext.Provider value={contextValue}>
            {children}
        </CartContext.Provider>
    )
}