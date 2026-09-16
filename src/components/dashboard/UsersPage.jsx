// components/dashboard/UsersPage.jsx
import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, UserSearch, X } from 'lucide-react';
import api from '../../utils/api';

const roleBadge = { admin: 'bg-red-50 text-red-600', cashier: 'bg-amber-50 text-amber-600', user: 'bg-gray-100 text-gray-600' };

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [form, setForm] = useState({ role: 'user' });
    const [editingId, setEditingId] = useState(null);
    const [showForm, setShowForm] = useState(false);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await api.get('/user/list.php');
            if (res.data?.status === 'success') {
                const list = (res.data.users || []).sort((a, b) => Number(a.id) - Number(b.id));
                setUsers(list);
                setError(null);
            } else {
                setUsers([]);
                setError(res.data?.message || 'Gagal memuat users');
            }
        } catch (err) {
            setError(err.message || 'Gagal memuat users');
        } finally { setLoading(false); }
    };

    useEffect(() => { fetchUsers(); }, []);

    const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    const resetForm = () => { setForm({ role: 'user' }); setEditingId(null); setShowForm(false); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) await api.put('/user/update.php', { id: editingId, ...form });
            else await api.post('/user/create.php', form);
            resetForm();
            fetchUsers();
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Gagal menyimpan user');
        }
    };

    const handleEdit = (u) => {
        setEditingId(u.id);
        setShowForm(true);
        setForm({ name: u.name, email: u.email, phone: u.phone, address: u.address, role: u.role });
    };

    const handleDelete = async (id) => {
        if (!confirm('Hapus user ini?')) return;
        try {
            await api.delete('/user/delete.php', { data: { id } });
            fetchUsers();
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Gagal menghapus user');
        }
    };

    const input = 'w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/15 focus:border-red-400 transition-colors';
    const label = 'block text-xs font-medium text-gray-500 mb-1.5';

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold text-gray-900">Users</h1>
                    <p className="text-sm text-gray-400 mt-0.5">{users.length} akun staf</p>
                </div>
                {!showForm && (
                    <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-sm shadow-red-200 transition-colors">
                        <Plus className="w-4 h-4" /> New user
                    </button>
                )}
            </div>

            {error && <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-2.5">{error}</div>}

            {showForm && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-semibold text-gray-900">{editingId ? `Edit user #${editingId}` : 'Add a new user'}</h2>
                        <button onClick={resetForm} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
                    </div>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className={label}>Name</label><input name="name" value={form.name || ''} onChange={handleChange} className={input} /></div>
                        <div><label className={label}>Email</label><input name="email" value={form.email || ''} onChange={handleChange} className={input} /></div>
                        <div><label className={label}>Password</label><input name="password" value={form.password || ''} onChange={handleChange} type="password" placeholder={editingId ? 'Leave blank to keep current' : ''} className={input} /></div>
                        <div><label className={label}>Role</label>
                            <select name="role" value={form.role || 'user'} onChange={handleChange} className={input}>
                                <option value="user">User</option>
                                <option value="cashier">Cashier</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <div><label className={label}>Phone</label><input name="phone" value={form.phone || ''} onChange={handleChange} className={`${input} font-mono`} /></div>
                        <div><label className={label}>Address</label><input name="address" value={form.address || ''} onChange={handleChange} className={input} /></div>
                        <div className="md:col-span-2 flex gap-2 pt-1">
                            <button type="submit" className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-sm shadow-red-200 transition-colors">
                                {editingId ? 'Save changes' : 'Create user'}
                            </button>
                            <button type="button" onClick={resetForm} className="text-sm font-medium px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="min-w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-100 bg-gray-50/60">
                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">ID</th>
                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</th>
                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</th>
                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</th>
                            <th className="py-3 px-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {loading ? (
                            <tr><td colSpan={5} className="py-10 text-center text-gray-400">Loading users…</td></tr>
                        ) : users.length === 0 ? (
                            <tr><td colSpan={5} className="py-12">
                                <div className="flex flex-col items-center gap-2 text-gray-400">
                                    <UserSearch className="w-6 h-6" />
                                    <p className="text-sm">No users yet.</p>
                                </div>
                            </td></tr>
                        ) : users.map((u) => (
                            <tr key={u.id} className="hover:bg-gray-50/70 transition-colors">
                                <td className="py-3 px-4 font-mono text-gray-400">{u.id}</td>
                                <td className="py-3 px-4">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-7 h-7 rounded-full bg-gray-900 text-white text-xs font-semibold flex items-center justify-center shrink-0">
                                            {(u.name || '?').charAt(0).toUpperCase()}
                                        </div>
                                        <span className="font-medium text-gray-900">{u.name}</span>
                                    </div>
                                </td>
                                <td className="py-3 px-4 text-gray-500">{u.email}</td>
                                <td className="py-3 px-4">
                                    <span className={`inline-flex items-center rounded-full text-xs font-medium px-2.5 py-0.5 capitalize ${roleBadge[u.role] || roleBadge.user}`}>{u.role}</span>
                                </td>
                                <td className="py-3 px-4 text-right">
                                    <button onClick={() => handleEdit(u)} title="Edit" className="p-1.5 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-colors"><Pencil className="w-4 h-4" /></button>
                                    <button onClick={() => handleDelete(u.id)} title="Delete" className="p-1.5 rounded-md text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}