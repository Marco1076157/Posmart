// components/dashboard/ProductPage.jsx
import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, PackageSearch, X, Tag } from 'lucide-react';
import api from '../../utils/api';

export default function ProductPage() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [error, setError] = useState(null);
    const [form, setForm] = useState({});
    const [editingId, setEditingId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [isNewCategory, setIsNewCategory] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');

    const fetchAll = async () => {
        setLoading(true);
        try {
            const res = await api.get('/config/get_product.php?page=1&per_page=100&search=&category=All');
            if (res.data?.status === 'success') {
                const list = (res.data.products || []).sort((a, b) => Number(a.id) - Number(b.id));
                setProducts(list);
                setError(null);
            } else {
                setProducts([]);
                setError(res.data?.message || 'Gagal memuat produk');
            }
        } catch (err) {
            setError(err.message || 'Gagal memuat produk');
        } finally { setLoading(false); }
    };

    const fetchCategories = async () => {
        setLoadingCategories(true);
        try {
            const res = await api.get('/config/get_categories.php');
            if (res.data?.status === 'success') {
                setCategories(res.data.categories || []);
            }
        } catch (err) {
            // Kategori gagal dimuat bukan error fatal — form tetap bisa dipakai manual
        } finally { setLoadingCategories(false); }
    };

    useEffect(() => { fetchAll(); fetchCategories(); }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? (checked ? 1 : 0) : value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0] || null;
        setImageFile(file);
        if (file) {
            setImagePreview(URL.createObjectURL(file));
        } else {
            setImagePreview('');
        }
    };

    const handleCategorySelect = (e) => {
        const value = e.target.value;
        if (value === '__new__') {
            setIsNewCategory(true);
            setForm((prev) => ({ ...prev, category: '' }));
        } else {
            setIsNewCategory(false);
            setForm((prev) => ({ ...prev, category: value }));
        }
    };

    const resetForm = () => { setForm({}); setEditingId(null); setShowForm(false); setIsNewCategory(false); setImageFile(null); setImagePreview(''); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const requestData = new FormData();
            requestData.append('barcode', form.barcode || '');
            requestData.append('name', form.name || '');
            requestData.append('price', form.price || 0);
            requestData.append('category', form.category || '');
            requestData.append('stock', form.stock || 0);
            requestData.append('is_promo', form.is_promo ? 1 : 0);
            requestData.append('promo', form.promo || 0);
            if (imageFile) requestData.append('image_file', imageFile);
            if (editingId) requestData.append('id', editingId);

            if (editingId) {
                await api.post('/crud/product_update.php', requestData);
            } else {
                await api.post('/crud/product_create.php', requestData);
            }

            resetForm();
            fetchAll();
            fetchCategories();
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Gagal menyimpan produk');
        }
    };

    const handleEdit = (p) => {
        setEditingId(p.id);
        setShowForm(true);
        const knownCategory = categories.some((c) => c.name === p.category);
        setIsNewCategory(!knownCategory && !!p.category);
        setForm({ barcode: p.barcode, name: p.name, price: p.price, category: p.category, stock: p.stock, is_promo: p.is_promo, promo: p.promo });
        setImageFile(null);
        setImagePreview(p.image ? `/api/products/${p.image}` : '');
    };

    const handleDelete = async (id) => {
        if (!confirm('Hapus produk ini?')) return;
        try {
            await api.delete('/crud/product_delete.php', { data: { id } });
            fetchAll();
            fetchCategories();
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Gagal menghapus produk');
        }
    };

    const placeholderImage = 'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%20120%20120%22%3E%3Crect%20width%3D%22120%22%20height%3D%22120%22%20fill%3D%22%23f8fafc%22/%3E%3Ctext%20x%3D%2260%22%20y%3D%2268%22%20font-family%3D%22Arial%2C%20sans-serif%22%20font-size%3D%2210%22%20fill%3D%22%23938f8f%22%20text-anchor%3D%22middle%22%3ENo%20Image%3C/text%3E%3C/svg%3E';
    const getImagePath = (image) => image ? `/api/products/${image}` : placeholderImage;
    const input = 'w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/15 focus:border-red-400 transition-colors';
    const label = 'block text-xs font-medium text-gray-500 mb-1.5';

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold text-gray-900">Products</h1>
                    <p className="text-sm text-gray-400 mt-0.5">{products.length} item terdaftar</p>
                </div>
                {!showForm && (
                    <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-sm shadow-red-200 transition-colors">
                        <Plus className="w-4 h-4" /> New product
                    </button>
                )}
            </div>

            {error && <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-2.5">{error}</div>}

            {showForm && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-semibold text-gray-900">{editingId ? `Edit product #${editingId}` : 'Add a new product'}</h2>
                        <button onClick={resetForm} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
                    </div>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div><label className={label}>Barcode</label><input name="barcode" value={form.barcode || ''} onChange={handleChange} className={`${input} font-mono`} /></div>
                        <div className="md:col-span-2"><label className={label}>Name</label><input name="name" value={form.name || ''} onChange={handleChange} className={input} /></div>
                        <div><label className={label}>Price</label><input name="price" value={form.price || ''} onChange={handleChange} type="number" className={`${input} font-mono`} /></div>
                        <div><label className={label}>Stock</label><input name="stock" value={form.stock || ''} onChange={handleChange} type="number" className={`${input} font-mono`} /></div>

                        <div>
                            <label className={label}>Category</label>
                            {isNewCategory ? (
                                <div className="flex gap-1.5">
                                    <input
                                        name="category" autoFocus value={form.category || ''} onChange={handleChange}
                                        placeholder="Nama kategori baru" className={input}
                                    />
                                    <button type="button" onClick={() => { setIsNewCategory(false); setForm((p) => ({ ...p, category: '' })); }}
                                        className="px-2.5 rounded-lg border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50 shrink-0" title="Batal, pilih dari daftar">
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ) : (
                                <select
                                    value={categories.some((c) => c.name === form.category) ? form.category : ''}
                                    onChange={handleCategorySelect}
                                    className={input}
                                >
                                    <option value="" disabled>{loadingCategories ? 'Memuat kategori…' : 'Pilih kategori'}</option>
                                    {categories.map((c) => (
                                        <option key={c.name} value={c.name}>{c.name} ({c.total_products})</option>
                                    ))}
                                    <option value="__new__">+ Kategori baru…</option>
                                </select>
                            )}
                        </div>

                        <div className="md:col-span-2 flex flex-col gap-1.5">
                            <label className={label}>Image</label>
                            <input
                                id="product-image-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="sr-only"
                            />
                            <div className="flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-2.5">
                                <label
                                    htmlFor="product-image-upload"
                                    className="inline-flex cursor-pointer items-center rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
                                >
                                    Choose file
                                </label>
                                <span className="text-sm text-gray-500">
                                    {imageFile ? imageFile.name : editingId ? 'Choose a new file to replace the current image' : 'No file chosen'}
                                </span>
                            </div>
                            {imagePreview && (
                                <div className="mt-2 w-full max-w-xs overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                                    <img src={imagePreview} alt="Preview" className="h-36 w-full object-cover" />
                                </div>
                            )}
                            <p className="text-xs text-slate-400 mt-1">Pilih file gambar dari komputer atau HP Anda.</p>
                        </div>
                        <div className="flex items-end gap-3">
                            <label className="flex items-center gap-2 h-9.5 px-3 rounded-lg border border-gray-200 text-sm text-gray-600">
                                <input type="checkbox" name="is_promo" checked={!!form.is_promo} onChange={handleChange} className="accent-red-600" /> Promo
                            </label>
                            <input name="promo" value={form.promo || ''} onChange={handleChange} placeholder="%" type="number" className={`${input} font-mono w-20`} />
                        </div>
                        <div className="md:col-span-3 flex gap-2 pt-1">
                            <button type="submit" className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-sm shadow-red-200 transition-colors">
                                {editingId ? 'Save changes' : 'Create product'}
                            </button>
                            <button type="button" onClick={resetForm} className="text-sm font-medium px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            {categories.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-gray-400 inline-flex items-center gap-1"><Tag className="w-3.5 h-3.5" /> Kategori:</span>
                    {categories.map((c) => (
                        <span key={c.name} className="inline-flex items-center rounded-full bg-red-50 text-red-700 text-xs font-medium px-2.5 py-0.5">
                            {c.name} · {c.total_products}
                        </span>
                    ))}
                </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="min-w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-100 bg-gray-50/60">
                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">ID</th>
                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</th>
                            <th className="py-3 px-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Price</th>
                            <th className="py-3 px-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Stock</th>
                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</th>
                            <th className="py-3 px-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {loading ? (
                            Array.from({ length: 4 }).map((_, i) => (
                                <tr key={i}>
                                    <td colSpan={6} className="py-3 px-4">
                                        <div className="h-10 rounded-lg bg-gray-100 animate-pulse" />
                                    </td>
                                </tr>
                            ))
                        ) : products.length === 0 ? (
                            <tr><td colSpan={6} className="py-12">
                                <div className="flex flex-col items-center gap-2 text-gray-400">
                                    <PackageSearch className="w-6 h-6" />
                                    <p className="text-sm">No products yet.</p>
                                </div>
                            </td></tr>
                        ) : products.map((p) => (
                            <tr key={p.id} className="hover:bg-gray-50/70 transition-colors">
                                <td className="py-3 px-4 font-mono text-gray-400">{p.id}</td>
                                <td className="py-3 px-4">
                                    <div className="flex items-center gap-3">
                                        <img src={getImagePath(p.image)} alt={p.name} className="h-14 w-14 rounded-xl object-cover border border-gray-200 bg-gray-100" />
                                        <div>
                                            <p className="font-medium text-gray-900">{p.name}</p>
                                            <p className="font-mono text-xs text-gray-400">{p.barcode}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-3 px-4 text-right font-mono tabular-nums text-gray-900">Rp {Number(p.price || 0).toLocaleString('id-ID')}</td>
                                <td className="py-3 px-4 text-right">
                                    <span className={`inline-flex min-w-8 justify-center rounded-full text-xs font-mono px-2 py-0.5 ${
                                        Number(p.stock) === 0 ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-600'
                                    }`}>{p.stock}</span>
                                </td>
                                <td className="py-3 px-4">
                                    <span className="inline-flex items-center rounded-full bg-red-50 text-red-700 text-xs font-medium px-2.5 py-0.5">{p.category}</span>
                                </td>
                                <td className="py-3 px-4 text-right">
                                    <button onClick={() => handleEdit(p)} title="Edit" className="p-1.5 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-colors"><Pencil className="w-4 h-4" /></button>
                                    <button onClick={() => handleDelete(p.id)} title="Delete" className="p-1.5 rounded-md text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
