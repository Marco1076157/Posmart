import {useState} from "react";
import { useNavigate } from 'react-router-dom';
import api, {setAuthTokenHeader} from '../utils/api'
import {Mail, Lock, LogIn } from "lucide-react";

export default function LoginForm({onLoginSuccess, onSwitchToRegister}) {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({email: 'admin@posmart.com', password: 'posmart2026'});
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setFormData(prev => ({...prev, [name]: value}));

    };


    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        console.log("1. Kirim data ...", formData);

        try {
            const response = await api.post('/user/login.php', formData);
            console.log("2. Response dari server ...", response.data);

            if (response.data.status === 'success') {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user_profile', JSON.stringify(response.data.user));

                //paksa injection supaya terhindar dari Race Condition
                setAuthTokenHeader(response.data.token);

                if (onLoginSuccess) {
                    onLoginSuccess(response.data.user);
                }
            } else {
                setError(response.data.message || "Login gagal. Silakan cek email dan password.");
            }

        } catch (err) {
            console.log("3. Terjadi error");
            //console.error(err);

            if (err.response) {
                console.log("4. Respon dari server")
                setError(err.response.data.message || "Error tanpa pesan");
            } else {
                setError(err.message);
            }
        } finally {
            setLoading(false);
        }

    };

    return (
        <form onSubmit={handleFormSubmit}>
            <h3>Login POSMart</h3>

            {error && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {error}
                </div>
            )}

            {/*e_-Mail*/}
            <div className="space-y-1">
                <label className= "text-xs font-bold text-slate-500">e-Mail</label>
                <div className="relative">
                    <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required 
                    className="w-full text-sm pl-10 pr-3 py-4 border border-slate-200 rounded-lg focus:outline-hidden focus:border-red-500"
                    placeholder="nama@email.com"/>
                </div>
            </div>
            {/*Password*/}
            <div className="space-y-1">
                <label className= "text-xs font-bold text-slate-500">Password</label>
                <div className="relative">
                    <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required 
                    className="w-full text-sm pl-10 pr-3 py-4 border border-slate-200 rounded-lg focus:outline-hidden focus:border-red-500"
                    placeholder="....."
                    />
                </div>
            </div>
            {/*Submit*/}
            <div className="flex gap-3 mt-4">
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 bg-red-500 hover:bg-red-800 disabled:bg-slate-400 text-white font-bold text-sm rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                    <LogIn className="w-4 h-4"/>
                    {loading ? "Memproses ...." : "Masuk Akun "}
                </button>
                <button
                    type="button"
                    onClick={() => navigate('/register')}
                    className="w-full py-2.5 bg-white hover:bg-red-50 border border-red-500 text-red-500 font-bold text-sm rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                    Belum punya akun? Daftar di sini
                </button>
            </div>
        </form>
    )
}