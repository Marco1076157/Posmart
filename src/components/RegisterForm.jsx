import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from '../utils/api';
import { 
    User, 
    Mail, 
    Lock, 
    Phone, 
    MapPin, 
    UserPlus,
    Eye,
    EyeOff
} from "lucide-react";

export default function RegisterForm({ onRegisterSuccess }) {
    const navigate = useNavigate();
    
    // State untuk form data
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        repeat_password: '',
        phone: '',
        address: ''
    });
    
    // State untuk UI
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showRepeatPassword, setShowRepeatPassword] = useState(false);

    // Handler untuk input change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error saat user mengetik
        if (error) setError('');
    };

    // Handler untuk submit form
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        console.log("📤 Mengirim data register:", {
            ...formData,
            password: '********',
            repeat_password: '********'
        }); 

        try {
            const response = await api.post('/user/register.php', formData);
            console.log("📥 Response dari server:", response.data);

            if (response.data.status === 'success') {
                // Berhasil register
                alert(response.data.message);
                
                // Panggil callback jika ada
                if (onRegisterSuccess) {
                    onRegisterSuccess(response.data.user);
                }
                
                // Redirect ke halaman login
                navigate('/login');
            } else {
                setError(response.data.message || "Registrasi gagal. Silakan coba lagi.");
            }

        } catch (err) {
            console.error("❌ Error registrasi:", err);
            
            if (err.response) {
                setError(err.response.data.message || "Terjadi kesalahan pada server.");
            } else if (err.request) {
                setError("Tidak dapat terhubung ke server. Periksa koneksi internet.");
            } else {
                setError(err.message || "Terjadi kesalahan.");
            }
        } finally {
            setLoading(false);
        }
    };

    // Toggle show password
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleRepeatPasswordVisibility = () => {
        setShowRepeatPassword(!showRepeatPassword);
    };

    return (
        <form onSubmit={handleFormSubmit} className="space-y-4">
            <h3 className="text-xl font-bold text-slate-800">Daftar Akun POSMart</h3>
            <p className="text-sm text-slate-500 -mt-2">Buat akun baru untuk mulai berbelanja</p>

            {/* Error Message */}
            {error && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            {/* Nama Lengkap */}
            <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Nama Lengkap
                </label>
                <div className="relative">
                    <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full text-sm pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg 
                                 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                        placeholder="Masukkan nama lengkap"
                    />
                </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Email
                </label>
                <div className="relative">
                    <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full text-sm pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg 
                                 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                        placeholder="nama@email.com"
                    />
                </div>
            </div>

            {/* Phone */}
            <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Nomor Telepon
                </label>
                <div className="relative">
                    <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className="w-full text-sm pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg 
                                 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                        placeholder="0812-3456-7890"
                    />
                </div>
            </div>

            {/* Address */}
            <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Alamat
                </label>
                <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        required
                        className="w-full text-sm pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg 
                                 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                        placeholder="Jl. Contoh No. 123, Kota"
                    />
                </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Password
                </label>
                <div className="relative">
                    <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        minLength={6}
                        className="w-full text-sm pl-10 pr-10 py-2.5 border border-slate-200 rounded-lg 
                                 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                        placeholder="Minimal 6 karakter"
                    />
                    <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            {/* Repeat Password */}
            <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Ulangi Password
                </label>
                <div className="relative">
                    <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                        type={showRepeatPassword ? "text" : "password"}
                        name="repeat_password"
                        value={formData.repeat_password}
                        onChange={handleInputChange}
                        required
                        minLength={6}
                        className="w-full text-sm pl-10 pr-10 py-2.5 border border-slate-200 rounded-lg 
                                 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                        placeholder="Ulangi password Anda"
                    />
                    <button
                        type="button"
                        onClick={toggleRepeatPasswordVisibility}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                        {showRepeatPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-red-500 hover:bg-red-600 disabled:bg-slate-400 
                         text-white font-bold text-sm rounded-xl transition-colors 
                         cursor-pointer flex items-center justify-center gap-2"
            >
                <UserPlus className="w-4 h-4" />
                {loading ? "Memproses..." : "Daftar Sekarang"}
            </button>

            {/* Link ke Login */}
            <p className="text-center text-sm text-slate-600 mt-4">
                Sudah punya akun?{" "}
                <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="text-red-600 hover:text-red-700 font-medium hover:underline"
                >
                    Login di sini
                </button>
            </p>
        </form>
    );
}