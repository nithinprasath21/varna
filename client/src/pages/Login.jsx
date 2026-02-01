import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await login(email, password);
        if (result.success) {
            if (result.user.role === 'ARTISAN' || result.user.role === 'NGO') {
                navigate('/dashboard', { replace: true });
            } else {
                navigate(location.state?.from || '/shop', { replace: true });
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-white px-4 relative overflow-hidden">
            {/* Background Accents */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 -skew-x-12 transform translate-x-20 z-0" />

            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white p-12 w-full max-w-md border-[6px] border-black shadow-[20px_20px_0px_0px_rgba(255,210,0,1)] relative z-10"
            >
                <div className="mb-10 text-center">
                    <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-2">Login / 01</h2>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em]">Access your fashion studio</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="relative group">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 group-focus-within:text-black transition-colors">Identity / Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="block w-full border-b-2 border-gray-100 focus:border-black bg-transparent py-3 font-bold text-sm tracking-tight transition-all outline-none"
                            placeholder="your@studio.com"
                            required
                        />
                    </div>
                    <div className="relative group">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 group-focus-within:text-black transition-colors">Security / Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="block w-full border-b-2 border-gray-100 focus:border-black bg-transparent py-3 font-bold text-sm tracking-tight transition-all outline-none"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            className="w-full bg-black text-white font-black italic uppercase tracking-[0.2em] py-5 shadow-[8px_8px_0px_0px_rgba(255,210,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
                        >
                            Enter Studio
                        </button>
                    </div>
                </form>

                <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col gap-4 text-center">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        New to Varna?
                    </p>
                    <Link
                        to="/auth/register"
                        className="text-xs font-black uppercase tracking-[0.2em] hover:text-primary transition-colors border-2 border-black py-3"
                    >
                        Create Identity
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
