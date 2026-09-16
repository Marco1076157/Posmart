//File: pages/LoginPage.jsx
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import { useGoogleLogin } from '@react-oauth/google';
import { Store } from "lucide-react";
import api from '../utils/api';

export default function LoginPage() {
    const navigate = useNavigate();

    const handleGoogleLoginSucces = async (tokenResponse) => {
        try {
            const authorizationCode = tokenResponse.code;
            const response = await api.post('/user/googleauth.php', {
                code: authorizationCode
            })
            if (response.data && response.data.status === 'success') {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user_profile', JSON.stringify(response.data.user));

                // window.location.href = '/';
                navigate('/');
            }
        } catch (err) {
            console.error("Google Auth Failed: ", err);
            alert(err.response?.data?.message || "Gagal login menggunakan Google");
        }
    }
    
    const loginWithGoogle = useGoogleLogin({
        onSuccess: handleGoogleLoginSucces,
        flow: 'auth-code'
    });


    const handleLoginSuccess = (user) => {

        console.log("User berhasil login");
        if (user.role === 'admin') {
            navigate('/dashboard');
        }else {
            navigate('/')
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
            <div className="mb-6 flex items-center gap-2 ">
                <div className="p-2 bg-red-600 rounded-xl text-white">
                    <Store className="w-4 h-6" />
                </div>
                <span className="text-xl font-black text-slate-900 tracking-tight">
                    POS <span className="text-red-600">Mart</span>
                </span>
            </div>

            {/* Login form  */}
            <div className='w-full max-w-sm'>
                <LoginForm onLoginSuccess={handleLoginSuccess}/>
            </div>

            <button
                onClick={ () => loginWithGoogle()}
                className='mt-4 w-full max-w-sm bg-white! border border-slate-300 text-slate-700
                font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-3
                hover:bg-slate-50 transition-colors shadow-xs cursor-pointer'
            >
                <img src='/avatars/google.png'
                    className='w-5 h-5' alt='Google Logo' />
                Masuk dengan Google</button>
        </div>
    )
}