import { useNavigate } from 'react-router-dom';
import RegisterForm from '../components/RegisterForm';
import { Store } from "lucide-react";

export default function RegisterPage() {
    const navigate = useNavigate();

    const handleRegisterSuccess = (user) => {
        console.log("✅ Registrasi berhasil untuk user:", user);
        // Bisa tambahkan logika tambahan jika diperlukan
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
            {/* Logo */}
            <div className="mb-6 flex items-center gap-2">
                <div className="p-2 bg-red-600 rounded-xl text-white">
                    <Store className="w-4 h-6" />
                </div>
                <span className="text-xl font-black text-slate-900 tracking-tight">
                    POS <span className="text-red-600">Mart</span>
                </span>
            </div>

            {/* Register Form */}
            <div className='w-full max-w-sm'>
                <RegisterForm onRegisterSuccess={handleRegisterSuccess} />
            </div>

            {/* Back to Login */}
            <button
                onClick={() => navigate('/login')}
                className="mt-4 text-sm text-slate-500 hover:text-slate-700 transition-colors"
            >
            </button>
        </div>
    );
}