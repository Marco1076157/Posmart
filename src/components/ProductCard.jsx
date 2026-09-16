//File: components/ProductCard.jsx
import { useCartContext } from "../context/CardContext";
import { ShoppingBag, Star } from "lucide-react";

export default function ProductCard({ product }) {
    const { handleAddToCart } = useCartContext();

    if (!product) return null;

    const productPrice = Number(product.price) || 0;
    const currentPrice = product.is_promo
        ? Math.max(productPrice - (productPrice * (product.promo / 100)), 0)
        : productPrice;

    const placeholderImage = 'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%20120%20120%22%3E%3Crect%20width%3D%22120%22%20height%3D%22120%22%20fill%3D%22%23f8fafc%22/%3E%3Ctext%20x%3D%2260%22%20y%3D%2268%22%20font-family%3D%22Arial%2C%20sans-serif%22%20font-size%3D%2210%22%20fill%3D%22%23938f8f%22%20text-anchor%3D%22middle%22%3ENo%20Image%3C/text%3E%3C/svg%3E';
    const imageSrc = product.image && product.image !== 'placeholder.jpg' ? `/api/products/${product.image}` : placeholderImage;

    return(
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col h-full">
            <div className="relative pt-[100%] bg-slate-100">
                <img
                    src={imageSrc}
                    alt={product.name}
                    onError={(event) => { event.currentTarget.src = placeholderImage; }}
                    className="absolute inset-0 w-full h-full object-cover"
                />
            </div>
            <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                {/* DESKRIPSI  */}
                <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-shadow-slate-400">{product.category}</span>
                    <h4 className="font-semibold text-sm text-slate-800 line-clamp-2 leading-snug">{product.name}</h4>
                    <div className="flex items-center gap-1 text-amber-500 text-xs font-bold pt-1">
                        <Star className="w-3.5 h-3.5 fill-amber-500" />{product.rating}
                    </div>
                </div>

                {/* HARGA $ ADD CART  */}
                <div className="space-y-3">
                    <div className="font-mono">
                        {product.is_promo === 1 && (
                            <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded-sm">-{product.promo}%</span>
                                <span className="text-xs text-slate-400 line-through">Rp {productPrice.toLocaleString('id-ID')}</span>
                            </div>
                        )}
                        <span className="text-base font-black text-slate-900">Rp {currentPrice.toLocaleString('id-ID')}</span>
                    </div>
                    <button
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock === 0}
                        className={`w-full py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${product.stock === 0
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : 'bg-red-600 text-white hover:bg-red-700 shadow-xs shadow-red-200'}`}
                    >
                        <ShoppingBag className="w-4 h-4" />
                        {product.stock === 0 ? 'Stock Habis' : 'Tambah ke Keranjang'}
                    </button>
                </div>
            </div>
        </div>
    )
}