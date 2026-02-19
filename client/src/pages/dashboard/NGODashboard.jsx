import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, UserPlus, LogOut, ExternalLink, ShieldCheck, Mail, Phone, TrendingUp, X, LayoutDashboard } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from 'recharts';

export default function NGODashboard() {
    const { user, logout } = useAuth();
    const [artisans, setArtisans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [ngoStats, setNgoStats] = useState(null);

    // Modal States
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [linkEmail, setLinkEmail] = useState('');
    const [selectedArtisan, setSelectedArtisan] = useState(null);
    const [artisanStats, setArtisanStats] = useState(null);
    const [statsLoading, setStatsLoading] = useState(false);

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        try {
            const token = localStorage.getItem('token');
            const [artisansRes, statsRes] = await Promise.all([
                axios.get('http://localhost:5000/ngo/artisans', { headers: { Authorization: `Bearer ${token}` } }),
                axios.get('http://localhost:5000/ngo/stats', { headers: { Authorization: `Bearer ${token}` } })
            ]);

            setArtisans(artisansRes.data);
            setNgoStats(statsRes.data);
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
            fetchAllData(); // Refresh list
        } catch (err) {
            toast.error('Failed to terminate management link.');
        }
    };

    const handleLinkArtisan = async (e) => {
        e.preventDefault();
        if (!linkEmail) return;

        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/ngo/link-artisan', { artisanEmail: linkEmail }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('ARTISAN LINK ESTABLISHED');
            setLinkEmail('');
            setShowLinkModal(false);
            fetchAllData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'PROTOCOL ERROR: LINK FAILED');
        }
    }

    const viewArtisanStats = async (artisan) => {
        setSelectedArtisan(artisan);
        setStatsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://localhost:5000/ngo/artisan/${artisan.id}/stats`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setArtisanStats(res.data);
        } catch (err) {
            console.error(err);
            toast.error("Failed to retrieve artisan intelligence.");
        } finally {
            setStatsLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-black border-t-primary animate-spin" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] italic">Accessing NGO Ledger</span>
            </div>
        </div>
    );

    const COLORS = ['#FFD200', '#000000', '#333333', '#666666', '#999999'];

    return (
        <div className="min-h-screen bg-white py-16 px-8 relative">
            <div className="max-w-7xl mx-auto space-y-16">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-4 border-black pb-8 gap-8">
                    <div>
                        <h1 className="text-6xl font-black italic uppercase tracking-tighter">NGO.<span className="text-primary not-italic">COMMAND</span></h1>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic mt-2">Overseeing the Artisan Ecosystem / {user.email.toUpperCase()}</p>
                    </div>
                    <div className="flex gap-6">
                        <button
                            onClick={() => setShowLinkModal(true)}
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

                {/* Aggregate Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-1 border-4 border-black bg-black">
                    {[
                        { label: 'MANAGED OPERATORS', value: artisans.length, icon: <Users size={20} /> },
                        { label: 'TOTAL ECOSYSTEM REVENUE', value: `₹${ngoStats?.total_revenue?.toLocaleString() || '0'}`, icon: <TrendingUp size={20} /> },
                        { label: 'PRODUCTS MANAGED', value: ngoStats?.total_products || '0', icon: <LayoutDashboard size={20} /> },
                        { label: 'TOP PERFORMER', value: ngoStats?.top_artisans?.[0]?.store_name || 'N/A', icon: <div className="w-5 h-5 bg-primary rounded-sm" /> }
                    ].map((stat, idx) => (
                        <div key={idx} className="bg-white p-8 space-y-2">
                            <div className="flex justify-between items-center text-gray-300">
                                {stat.icon}
                                <span className="text-[8px] font-black tracking-widest uppercase italic">STAT.{idx + 1}</span>
                            </div>
                            <p className="text-3xl font-black italic tracking-tighter break-words">{stat.value}</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* NGO Level Charts */}
                {ngoStats && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="border-4 border-black p-8 bg-white space-y-4">
                            <h3 className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-2">
                                <TrendingUp size={18} /> Top Revenue Generators
                            </h3>
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={ngoStats.top_artisans} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} horizontal={false} />
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="store_name" type="category" width={100} tick={{ fontSize: 10, fontFamily: 'monospace', fontWeight: 'bold' }} />
                                        <Tooltip
                                            cursor={{ fill: '#f3f4f6' }}
                                            contentStyle={{ backgroundColor: '#000', border: 'none', color: '#fff' }}
                                            itemStyle={{ fontFamily: 'monospace', fontSize: '12px' }}
                                        />
                                        <Bar dataKey="revenue" fill="#000" barSize={20} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="border-4 border-black p-8 bg-white space-y-4">
                            <h3 className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-2">
                                <LayoutDashboard size={18} /> Ecosystem Categories
                            </h3>
                            <div className="h-64 w-full flex items-center justify-center">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={ngoStats.category_distribution}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={50}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="count"
                                        >
                                            {ngoStats.category_distribution?.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend verticalAlign="bottom" height={36} iconSize={8} wrapperStyle={{ fontSize: '10px', fontFamily: 'monospace' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}

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
                                        <td className="px-8 py-8 whitespace-nowrap text-right space-x-4">
                                            <button
                                                onClick={() => viewArtisanStats(artisan)}
                                                className="bg-white text-black px-4 py-2 text-[9px] font-black uppercase tracking-widest italic hover:bg-black hover:text-white transition-all border-2 border-black inline-flex items-center gap-2"
                                            >
                                                <TrendingUp size={12} /> ANALYTICS
                                            </button>
                                            <button
                                                onClick={() => handleRelease(artisan.id)}
                                                className="text-gray-400 px-4 py-2 text-[9px] font-black uppercase tracking-widest italic hover:text-red-600 transition-all underline underline-offset-4"
                                            >
                                                TERMINATE
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

            {/* Link Artisan Modal */}
            <AnimatePresence>
                {showLinkModal && (
                    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white w-full max-w-md border-4 border-black p-8 relative"
                        >
                            <button onClick={() => setShowLinkModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-red-600">
                                <X size={24} strokeWidth={3} />
                            </button>
                            <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-8">Establish New Link</h2>
                            <form onSubmit={handleLinkArtisan} className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest mb-2 italic">Artisan Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full bg-gray-50 border-2 border-gray-200 p-4 text-xs font-black uppercase focus:border-black outline-none transition-colors"
                                        placeholder="ENTER EMAIL ID"
                                        value={linkEmail}
                                        onChange={e => setLinkEmail(e.target.value)}
                                    />
                                </div>
                                <button type="submit" className="w-full bg-black text-white py-4 text-xs font-black uppercase tracking-widest hover:bg-primary hover:text-black transition-all border-2 border-transparent">
                                    INITIATE PROTOCOL
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Analytics Modal */}
            <AnimatePresence>
                {selectedArtisan && (
                    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-8 overflow-y-auto">
                        {/* Close button fixed to viewport to ensure visibility */}
                        <button
                            onClick={() => setSelectedArtisan(null)}
                            className="fixed top-8 right-8 text-white hover:text-red-500 transition-colors z-[60] bg-black border-2 border-white p-2 rounded-full"
                        >
                            <X size={32} strokeWidth={3} />
                        </button>

                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 50 }}
                            className="bg-white w-full max-w-6xl border-4 border-primary min-h-[80vh] p-12 relative flex flex-col"
                            onClick={(e) => e.stopPropagation()} // Prevent click from closing if we added overlay click handler
                        >
                            {statsLoading ? (
                                <div className="flex-grow flex items-center justify-center flex-col gap-4">
                                    <div className="w-16 h-16 border-4 border-black border-t-primary animate-spin" />
                                    <p className="text-xs font-black uppercase tracking-widest italic animate-pulse">Computing Artisan Ledger...</p>
                                </div>
                            ) : artisanStats ? (
                                <div className="space-y-16">
                                    <div>
                                        <h2 className="text-6xl font-black italic uppercase tracking-tighter mb-2">{artisanStats.store_name}</h2>
                                        <p className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400 italic">INTELLIGENCE REPORT / ID-{selectedArtisan.id}</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                                        <div className="space-y-8">
                                            <h3 className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-3"><TrendingUp size={24} /> Revenue Performance</h3>
                                            <div className="h-80 w-full border-2 border-gray-100 bg-gray-50 p-4">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart data={artisanStats.sales_trend}>
                                                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                                        <XAxis dataKey="date" tick={{ fontSize: 10, fontFamily: 'monospace' }} stroke="#000" />
                                                        <YAxis tick={{ fontSize: 10, fontFamily: 'monospace' }} stroke="#000" />
                                                        <Tooltip
                                                            cursor={{ fill: '#f3f4f6' }}
                                                            contentStyle={{ backgroundColor: '#000', border: 'none', color: '#fff' }}
                                                            itemStyle={{ fontFamily: 'monospace', fontSize: '12px' }}
                                                        />
                                                        <Bar dataKey="revenue" fill="#FFD200" name="REVENUE (INR)" />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>

                                        <div className="space-y-8">
                                            <h3 className="text-2xl font-black italic uppercase tracking-tighter">Category Distribution</h3>
                                            <div className="h-80 w-full border-2 border-gray-100 bg-gray-50 p-4 flex items-center justify-center">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie
                                                            data={artisanStats.categories}
                                                            cx="50%"
                                                            cy="50%"
                                                            innerRadius={60}
                                                            outerRadius={100}
                                                            paddingAngle={5}
                                                            dataKey="count"
                                                        >
                                                            {artisanStats.categories.map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip />
                                                        <Legend />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-8">Top Performing Assets</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                                            {artisanStats.best_sellers.map((item, idx) => (
                                                <div key={idx} className="bg-black text-white p-6 border-l-4 border-primary">
                                                    <div className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-2 italic">RANK #{idx + 1}</div>
                                                    <div className="text-xl font-black italic uppercase tracking-tighter leading-none mb-4">{item.title}</div>
                                                    <div className="text-primary text-xs font-black uppercase tracking-widest">{item.total_sold} UNITS DEPLOYED</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-20">
                                    <p className="text-xl font-black italic uppercase text-red-600">Failed to load intelligence data.</p>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
