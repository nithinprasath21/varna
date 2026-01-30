import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Users, UserPlus, LogOut, ExternalLink, ShieldCheck, Mail, Phone } from 'lucide-react';

export default function NGODashboard() {
    const { user, logout } = useAuth();
    const [artisans, setArtisans] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchArtisans();
    }, []);

    const fetchArtisans = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/ngo/artisans', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setArtisans(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleRelease = async (artisanId) => {
        if (!window.confirm("ARE YOU SURE YOU WANT TO RELEASE THIS ARTISAN? THEY WILL PROCEED AS INDEPENDENT OPERATORS.")) return;

        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/ngo/release-artisan', { artisanId }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Artisan successfully released to the wild.');
            fetchArtisans(); // Refresh list
        } catch (err) {
            toast.error('Failed to terminate management link.');
        }
    };

    const handleLinkTest = async () => {
        const email = prompt("ENTER ARTISAN EMAIL TO ESTABLISH LINK:");
        if (!email) return;
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/ngo/link-artisan', { artisanEmail: email }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('ARTISAN LINK ESTABLISHED');
            fetchArtisans();
        } catch (err) {
            toast.error('PROTOCOL ERROR: LINK FAILED');
        }
    }

    if (loading) return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-black border-t-primary animate-spin" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] italic">Accessing NGO Ledger</span>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-white py-16 px-8">
            <div className="max-w-7xl mx-auto space-y-16">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-4 border-black pb-8 gap-8">
                    <div>
                        <h1 className="text-6xl font-black italic uppercase tracking-tighter">NGO.<span className="text-primary not-italic">COMMAND</span></h1>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic mt-2">Overseeing the Artisan Ecosystem / {user.email.toUpperCase()}</p>
                    </div>
                    <div className="flex gap-6">
                        <button
                            onClick={handleLinkTest}
                            className="bg-primary text-black px-8 py-4 text-[10px] font-black uppercase tracking-[0.3em] italic hover:bg-black hover:text-white transition-all flex items-center gap-3 border-2 border-black"
                        >
                            <UserPlus size={14} strokeWidth={3} /> ESTABLISH NEW LINK
                        </button>
                        <button
                            onClick={logout}
                            className="text-gray-300 hover:text-red-600 transition-colors p-4"
                        >
                            <LogOut size={24} strokeWidth={3} />
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-1 border-4 border-black bg-black">
                    {[
                        { label: 'MANAGED OPERATORS', value: artisans.length, icon: <Users size={20} /> },
                        { label: 'VERIFIED STATUS', value: 'OPTIMAL', icon: <ShieldCheck size={20} /> },
                        { label: 'REGION ACCESS', value: 'GLOBAL', icon: <ExternalLink size={20} /> },
                        { label: 'PROTOCOL VERSION', value: '1.0.4-L', icon: <div className="w-5 h-5 bg-primary rounded-sm" /> }
                    ].map((stat, idx) => (
                        <div key={idx} className="bg-white p-8 space-y-2">
                            <div className="flex justify-between items-center text-gray-300">
                                {stat.icon}
                                <span className="text-[8px] font-black tracking-widest uppercase italic">STAT.{idx + 1}</span>
                            </div>
                            <p className="text-4xl font-black italic tracking-tighter">{stat.value}</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">{stat.label}</p>
                        </div>
                    ))}
                </div>

                <div className="space-y-8">
                    <h2 className="text-3xl font-black italic uppercase tracking-tighter flex items-center gap-4">
                        <Users size={32} strokeWidth={3} /> THE ARTISAN MANIFEST
                    </h2>

                    <div className="bg-white border-4 border-black overflow-hidden">
                        <table className="min-w-full">
                            <thead>
                                <tr className="bg-black text-white">
                                    <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest italic">OPERATOR / STUDIO</th>
                                    <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest italic">CONTACT PARAMETERS</th>
                                    <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest italic text-center">STATUS</th>
                                    <th className="px-8 py-6 text-right text-[10px] font-black uppercase tracking-widest italic">PROTOCOL ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y-2 divide-black">
                                {artisans.map((artisan) => (
                                    <tr key={artisan.id} className="group hover:bg-gray-50 transition-colors">
                                        <td className="px-8 py-8 whitespace-nowrap">
                                            <div className="text-xl font-black italic uppercase tracking-tighter text-black">{artisan.store_name || 'UNDEFINED STUDIO'}</div>
                                            <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">{artisan.email}</div>
                                        </td>
                                        <td className="px-8 py-8 whitespace-nowrap">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest italic">
                                                    <Mail size={12} className="text-primary" /> {artisan.email}
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest italic">
                                                    <Phone size={12} className="text-primary" /> {artisan.phone_number}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-8 whitespace-nowrap text-center">
                                            <span className="inline-block bg-primary text-black px-4 py-1 text-[9px] font-black uppercase tracking-widest italic border-2 border-black rotate-2">
                                                ACTIVE LINK
                                            </span>
                                        </td>
                                        <td className="px-8 py-8 whitespace-nowrap text-right">
                                            <button
                                                onClick={() => handleRelease(artisan.id)}
                                                className="bg-black text-white px-6 py-3 text-[9px] font-black uppercase tracking-widest italic hover:bg-red-600 transition-all border-2 border-transparent"
                                            >
                                                TERMINATE LINK
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {artisans.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="px-8 py-20 text-center">
                                            <p className="text-xl font-black italic uppercase tracking-tighter text-gray-200">NO MANAGED OPERATORS IN THE LEDGER</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
