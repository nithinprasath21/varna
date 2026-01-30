import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Register() {
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        phone_number: '',
        role: 'CUSTOMER'
    });
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await register(formData.email, formData.password, formData.role, formData.phone_number, formData.full_name);
        if (success) {
            navigate('/auth/login');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-white px-4 relative overflow-hidden py-20">
            {/* Background Accents */}
            <div className="absolute top-0 left-0 w-1/2 h-full bg-primary/5 skew-x-12 transform -translate-x-20 z-0" />

            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white p-12 w-full max-w-lg border-[6px] border-black shadow-[20px_20px_0px_0px_rgba(255,210,0,1)] relative z-10"
            >
                <div className="mb-12 text-center">
                    <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-2">Register / 02</h2>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em]">Build your digital identity</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="relative group">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 group-focus-within:text-black transition-colors">Personal / Full Name</label>
                            <input
                                type="text"
                                name="full_name"
                                value={formData.full_name}
                                onChange={handleChange}
                                className="block w-full border-b-2 border-gray-100 focus:border-black bg-transparent py-3 font-bold text-sm tracking-tight transition-all outline-none"
                                placeholder="ALEX VARNA"
                                required
                            />
                        </div>
                        <div className="relative group">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 group-focus-within:text-black transition-colors">Contact / Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="block w-full border-b-2 border-gray-100 focus:border-black bg-transparent py-3 font-bold text-sm tracking-tight transition-all outline-none"
                                placeholder="alex@varna.com"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="relative group">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 group-focus-within:text-black transition-colors">Telecom / Mobile</label>
                            <input
                                type="tel"
                                name="phone_number"
                                value={formData.phone_number}
                                onChange={handleChange}
                                className="block w-full border-b-2 border-gray-100 focus:border-black bg-transparent py-3 font-bold text-sm tracking-tight transition-all outline-none"
                                placeholder="+91 00000 00000"
                                required
                            />
                        </div>
                        <div className="relative group">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 group-focus-within:text-black transition-colors">Security / Token</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="block w-full border-b-2 border-gray-100 focus:border-black bg-transparent py-3 font-bold text-sm tracking-tight transition-all outline-none"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <div className="relative group pt-4">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 italic">Identity Classification</label>
                        <div className="flex flex-wrap gap-4">
                            {['CUSTOMER', 'ARTISAN', 'NGO'].map((role) => (
                                <button
                                    key={role}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role })}
                                    className={`flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all border-2 ${formData.role === role ? 'bg-black text-white border-black' : 'bg-white text-gray-400 border-gray-100 hover:border-black hover:text-black'}`}
                                >
                                    {role}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-8">
                        <button
                            type="submit"
                            className="w-full bg-primary text-black font-black italic uppercase tracking-[0.2em] py-5 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
                        >
                            Establish Identity
                        </button>
                    </div>
                </form>

                <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col gap-4 text-center">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        Already have an identity?
                    </p>
                    <Link
                        to="/auth/login"
                        className="text-xs font-black uppercase tracking-[0.2em] hover:text-primary transition-colors border-2 border-black py-3"
                    >
                        Access Studio
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
