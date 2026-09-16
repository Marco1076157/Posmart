// File: src/utils/api.js
import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    timeout: 10000,
    headers: {
        'Accept': 'application/json',
    },
    validateStatus: function (status) {
        return status >= 200 && status < 600; // Terima semua status code sebagai "Response", bukan "Error"
    }

});

// Interceptor Request: DIJALANKAN SETIAP KALI REACT MENEMBAK API
api.interceptors.request.use(
    (config) => {
        // AMBIL TOKEN SECARA DINAMIS DI SINI
        const token = localStorage.getItem('token');
        
        if (token) {
            // Kirim header standar dan header cadangan. Pada sebagian konfigurasi
            // Apache/FastCGI, Authorization tidak diteruskan ke PHP.
            config.headers.Authorization = `Bearer ${token}`;
            config.headers['X-Access-Token'] = token;
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const setAuthTokenHeader = (token) => {
    if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        api.defaults.headers.common['X-Access-Token'] = token;
    } else {
        delete api.defaults.headers.common['Authorization'];
        delete api.defaults.headers.common['X-Access-Token'];
    }
};

// Interceptor Response 
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user_profile');
            
            // if (window.location.pathname !== '/login') {
            //     window.history.pushState({}, '', '/login');
            //     window.dispatchEvent(new PopStateEvent('popstate'));
            // }
        }
        return Promise.reject(error);
    }
);

export default api;
