import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, Search, ChevronRight, ExternalLink, Calendar, MapPin } from 'lucide-react';

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/orders', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrders(res.data);
        } catch (err) {
            console.error('Failed to fetch orders', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-black border-t-primary animate-spin" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] italic">Retreiving Records</span>
            </div>
        </div>
    );

    return (
        <div className="bg-white min-h-screen py-20 px-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-16 flex flex-col md:flex-row md:items-baseline justify-between border-b-2 border-black pb-8 gap-8">
                    <div>
                        <h1 className="text-6xl font-black italic uppercase tracking-tighter">Acquisitions</h1>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic mt-2">Historical log of authenticated masterpieces</p>
                    </div>

                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder="SEARCH ARCHIVE"
                            className="bg-gray-50 border-2 border-transparent focus:border-black pl-12 pr-6 py-3 text-xs font-black uppercase outline-none w-full md:w-80 transition-all italic"
                        />
                    </div>
                </div>

                <div className="flex gap-10 border-b border-gray-100 mb-12 overflow-x-auto pb-1 scrollbar-hide">
                    {['ALL LOGS', 'IN TRANSIT', 'SUCCESSFUL', 'VOIDED'].map((tab, idx) => (
                        <button key={tab} className={`pb-4 text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${idx === 0 ? 'border-b-4 border-primary text-black' : 'text-gray-300 hover:text-black'}`}>
                            {tab}
                        </button>
                    ))}
                </div>

                {orders.length === 0 ? (
                    <div className="text-center py-40 border-4 border-dashed border-gray-100 italic">
                        <p className="text-xl font-black uppercase tracking-tighter text-gray-200 mb-8">No records found in the vault.</p>
                        <Link to="/shop" className="text-xs font-black uppercase tracking-[0.3em] bg-black text-white px-8 py-4 hover:bg-primary hover:text-black transition-all">
                            EXPLORE COLLECTION
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-20">
                        {orders.map(order => (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                key={order.id}
                                className="group relative"
                            >
                                {/* Order Metadata Header */}
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4">
                                            <span className="bg-black text-white text-[10px] font-black px-3 py-1 italic"># {String(order.id).split('-')[0].toUpperCase()}</span>
                                            <span className={`text-[10px] font-black px-3 py-1 uppercase tracking-widest ${order.status === 'DELIVERED' ? 'bg-primary text-black' : 'bg-gray-100 text-gray-400'}`}>
                                                {order.status}
                                            </span>
                                        </div>
                                        <div className="flex gap-12">
                                            <div className="space-y-1">
                                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 italic leading-none"><Calendar size={10} /> ACQUISITION DATE</p>
                                                <p className="text-sm font-black italic">{new Date(order.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 italic leading-none"><Package size={10} /> SETTLEMENT</p>
                                                <p className="text-sm font-black italic">₹{Number(order.total_amount).toLocaleString()}</p>
                                            </div>
                                            <div className="space-y-1 hidden sm:block">
                                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 italic leading-none"><MapPin size={10} /> RECIPIENT</p>
                                                <p className="text-sm font-black italic uppercase truncate max-w-[150px]">{order.shipping_address?.full_name || 'AUTHENTICATED USER'}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <button className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors underline underline-offset-4 italic">DOWNLOAD LOG (PDF)</button>
                                        <button className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors underline underline-offset-4 italic">CERTIFICATE</button>
                                    </div>
                                </div>

                                {/* Order Items Grid */}
                                <div className="grid grid-cols-1 gap-1">
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="bg-gray-50 p-8 flex flex-col md:flex-row gap-8 items-center group/item hover:bg-black hover:text-white transition-all duration-500">
                                            <div className="w-24 aspect-[3/4] bg-white border border-gray-100 flex-shrink-0 overflow-hidden relative">
                                                {item.image_url ? (
                                                    <img src={item.image_url} alt={item.product_title} className="w-full h-full object-cover grayscale group-hover/item:grayscale-0 transition-all duration-700" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-xs font-black italic text-gray-200">VARNA</div>
                                                )}
                                            </div>

                                            <div className="flex-grow space-y-2 text-center md:text-left">
                                                <h4 className="text-xl font-black italic uppercase tracking-tighter leading-tight sm:max-w-md">{item.product_title}</h4>
                                                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60">QTY: {item.quantity || 1}</span>
                                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60">PRICE: ₹{Number(item.price).toLocaleString()}</span>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-4 justify-center">
                                                <Link to={`/product/${item.product_id}`} className="bg-white text-black px-6 py-3 text-[10px] font-black uppercase tracking-widest group-hover/item:bg-primary transition-all italic border-2 border-black">
                                                    EXPLORE ITEM
                                                </Link>
                                                <button className="bg-black text-white px-6 py-3 text-[10px] font-black uppercase tracking-widest group-hover/item:bg-white group-hover/item:text-black transition-all italic border-2 border-transparent group-hover/item:border-white">
                                                    BUY AGAIN
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Order Action Footer */}
                                <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${order.status === 'DELIVERED' ? 'bg-green-500' : 'bg-primary'}`} />
                                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 italic">LOG STATUS: {order.status === 'DELIVERED' ? 'TRANSACTION COMPLETE' : 'IN PROGRESS'}</span>
                                    </div>
                                    <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-black hover:bg-black hover:text-white px-4 py-2 transition-all italic">
                                        TRACE SHIPMENT <ChevronRight size={14} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
