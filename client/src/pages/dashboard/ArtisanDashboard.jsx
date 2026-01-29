import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import React, { Suspense, lazy } from 'react';
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, AreaChart, Area, Legend
} from 'recharts';
import {
    TrendingUp, Award, Battery, Globe, Clock,
    ChevronRight, Info, AlertCircle
} from 'lucide-react';
import QRCode from 'react-qr-code';

export default function ArtisanDashboard() {
    const { user, logout } = useAuth();
    const [stats, setStats] = useState({
        productCount: 0,
        totalSales: 0,
        recentOrders: [],
        charts: { moneyFlow: [], bestSellers: [], stockHealth: [], marketReach: [], categoryProfit: [] }
    });
    const [activeChart, setActiveChart] = useState('moneyFlow');
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);

    // Fulfillment State
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showFulfillmentModal, setShowFulfillmentModal] = useState(false);
    const [trackingNumber, setTrackingNumber] = useState('');
    const [fulfillmentFile, setFulfillmentFile] = useState(null);
    const [fulfillmentPreview, setFulfillmentPreview] = useState(null);

    const [newItem, setNewItem] = useState({
        title: '',
        description: '',
        base_price: '',
        sale_price: '',
        stock_qty: '',
        category: 'Pottery',
        is_premium: false,
        image_url: ''
    });

    // Image Upload State
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [uploadMode, setUploadMode] = useState('url'); // 'url' or 'file'
    const [isDragging, setIsDragging] = useState(false);



    // Blockchain State
    const [mintingId, setMintingId] = useState(null);
    const [mintResult, setMintResult] = useState(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const [statsRes, productsRes] = await Promise.all([
                axios.get('http://localhost:5000/artisan/dashboard', config),
                axios.get('http://localhost:5000/artisan/products', config)
            ]);

            setStats(statsRes.data);
            setProducts(productsRes.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleEditClick = (product) => {
        setNewItem({
            title: product.title,
            description: product.description || '',
            base_price: product.base_price,
            sale_price: product.sale_price || '',
            stock_qty: product.stock_qty,
            category: product.category,
            is_premium: product.is_premium || false,
            image_url: product.image_url || ''
        });
        setEditId(product.id);
        setIsEditing(true);
        setShowAddForm(true);
        setUploadMode(product.image_url?.startsWith('http') ? 'url' : 'url'); // Default to URL for existing
        setImagePreview(product.image_url || null);
    };

    const handleDeleteClick = async (productId) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/artisan/products/${productId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Product deleted');
            fetchDashboardData();
        } catch (err) {
            toast.error('Delete failed');
        }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        // Validation: Selling Price restricted from not giving value more than MRP
        if (newItem.sale_price && Number(newItem.sale_price) > Number(newItem.base_price)) {
            toast.error("Selling price cannot be higher than MRP (Base Price)");
            return;
        }

        if (newItem.sale_price && Number(newItem.sale_price) < 0) {
            toast.error("Selling price cannot be negative");
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const payload = { ...newItem, sale_price: newItem.sale_price || null };

            if (isEditing) {
                await axios.put(`http://localhost:5000/artisan/products/${editId}`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('Product updated!');
            } else {
                await axios.post('http://localhost:5000/artisan/products', payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('Product added successfully!');
            }

            resetForm();
            fetchDashboardData();
        } catch (err) {
            toast.error(isEditing ? 'Update failed' : 'Failed to add product');
        }
    };

    const resetForm = () => {
        setNewItem({ title: '', description: '', base_price: '', sale_price: '', stock_qty: '', category: 'Pottery', is_premium: false, image_url: '' });
        setShowAddForm(false);
        setIsEditing(false);
        setEditId(null);
        setImageFile(null);
        setImagePreview(null);
        setUploadMode('url');
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
                // In a real app, we'd upload to a server/Cloudinary. 
                // For now, we'll use the base64 as the image_url to simulate success.
                setNewItem(prev => ({ ...prev, image_url: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
                setNewItem(prev => ({ ...prev, image_url: reader.result }));
            };
            reader.readAsDataURL(file);
        } else {
            toast.error("Please drop a valid image file");
        }
    };



    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`http://localhost:5000/orders/${orderId}/status`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success(`Order marked as ${newStatus}`);
            fetchDashboardData();
        } catch (err) {
            toast.error('Failed to update status');
        }
    };

    const handleFulfillmentSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const payload = {
                tracking_number: trackingNumber,
                shipping_proof_url: fulfillmentPreview || 'https://via.placeholder.com/150?text=Receipt',
                status: 'SHIPPED'
            };

            await axios.post(`http://localhost:5000/orders/${selectedOrder.id}/fulfillment`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast.success('Shipping details updated!');
            setShowFulfillmentModal(false);
            setSelectedOrder(null);
            setFulfillmentPreview(null);
            setTrackingNumber('');
            fetchDashboardData();
        } catch (err) {
            toast.error('Failed to submit fulfillment');
        }
    };

    const handleFulfillmentFile = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setFulfillmentPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const copyAddress = (address) => {
        const text = `${address.full_name}, ${address.street}, ${address.city}, ${address.state} - ${address.pincode}`;
        navigator.clipboard.writeText(text);
        toast.success('Address copied to clipboard!');
    };

    const handleMint = async (productId) => {
        setMintingId(productId);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('http://localhost:5000/blockchain/mint',
                { productId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMintResult(res.data);
            toast.success('Minted Authenticity Token!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Minting failed');
            setMintingId(null);
        }
    };

    const discount = (newItem.base_price && newItem.sale_price)
        ? Math.round(((newItem.base_price - newItem.sale_price) / newItem.base_price) * 100)
        : 0;

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10 px-6 py-4 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="bg-secondary text-white w-10 h-10 rounded-full flex items-center justify-center font-bold font-display text-xl">A</div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">Artisan Studio</h1>
                        <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                </div>
                <button onClick={logout} className="text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded transition-colors">
                    Sign Out
                </button>
            </header>

            <main className="max-w-7xl mx-auto p-6 md:p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col">
                        <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">Total Products</span>
                        <span className="text-3xl font-bold text-slate-800">{stats.productCount}</span>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col">
                        <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">Lifetime Revenue</span>
                        <span className="text-3xl font-bold text-emerald-600">₹{stats.totalSales.toLocaleString()}</span>
                    </div>
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-xl shadow-lg text-white flex flex-col justify-center items-start">
                        <h3 className="font-bold text-lg mb-1">Blockchain Verified</h3>
                        <p className="text-indigo-100 text-sm mb-3">Mint authenticity tokens for your premium crafts.</p>
                        <span className="bg-white/20 px-3 py-1 rounded text-xs font-bold">Polygon Supported</span>
                    </div>
                </div>

                {/* Visual Insights Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-10 overflow-hidden">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <span className="bg-indigo-100 text-indigo-700 w-8 h-8 rounded-full flex items-center justify-center">📊</span>
                                Business Visual Insights
                            </h2>
                            <p className="text-sm text-gray-500">Understand your shop's performance with simple visuals.</p>
                        </div>

                        {/* Chart Selector - Mobile Friendly */}
                        <div className="flex flex-wrap gap-2 p-1 bg-gray-50 rounded-xl border border-gray-100">
                            {[
                                { id: 'moneyFlow', label: 'Money Flow', icon: <TrendingUp size={16} /> },
                                { id: 'bestSellers', label: 'Most Loved', icon: <Award size={16} /> },
                                { id: 'stockHealth', label: 'Stock Health', icon: <Battery size={16} /> },
                                { id: 'marketReach', label: 'My Reach', icon: <Globe size={16} /> },
                                { id: 'categoryProfit', label: 'Time vs Money', icon: <Clock size={16} /> },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveChart(tab.id)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeChart === tab.id ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    {tab.icon}
                                    <span className="hidden sm:inline">{tab.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            {activeChart === 'moneyFlow' ? (
                                <AreaChart data={stats.charts.moneyFlow}>
                                    <defs>
                                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val}`} />
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                                    <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                                </AreaChart>
                            ) : activeChart === 'bestSellers' ? (
                                <BarChart data={stats.charts.bestSellers} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="title" type="category" width={120} tick={{ fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
                                    <Tooltip cursor={{ fill: '#f8fafc' }} />
                                    <Bar dataKey="total_sold" fill="#fbbf24" radius={[0, 8, 8, 0]} barSize={20}>
                                        {stats.charts.bestSellers.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={['#fbbf24', '#f59e0b', '#d97706', '#b45309', '#92400e'][index % 5]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            ) : activeChart === 'stockHealth' ? (
                                <BarChart data={stats.charts.stockHealth}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="title" hide />
                                    <YAxis axisLine={false} tickLine={false} />
                                    <Tooltip />
                                    <Bar dataKey="stock_qty" radius={[8, 8, 0, 0]}>
                                        {stats.charts.stockHealth.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.stock_qty <= 5 ? '#ef4444' : entry.stock_qty <= 15 ? '#f59e0b' : '#10b981'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            ) : activeChart === 'marketReach' ? (
                                <PieChart>
                                    <Pie
                                        data={stats.charts.marketReach}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="order_count"
                                        nameKey="city"
                                    >
                                        {stats.charts.marketReach.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={['#818cf8', '#6366f1', '#4f46e5', '#4338ca', '#3730a3'][index % 5]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                                </PieChart>
                            ) : (
                                <BarChart data={stats.charts.categoryProfit}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="category" axisLine={false} tickLine={false} />
                                    <YAxis hide />
                                    <Tooltip cursor={{ fill: '#f8fafc' }} />
                                    <Bar dataKey="total_revenue" radius={[12, 12, 12, 12]} barSize={40}>
                                        {stats.charts.categoryProfit.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={['#ec4899', '#db2777', '#be185d', '#9d174d'][index % 4]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            )}
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Order Management Section */}
                <div className="mb-10">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="bg-emerald-100 text-emerald-700 w-8 h-8 rounded-full flex items-center justify-center text-sm">📦</span>
                            Active Business Orders
                        </div>
                        <span className="text-xs font-normal text-gray-400 bg-gray-50 px-3 py-1 rounded-full border border-gray-100 italic">Only recent 10 orders shown</span>
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
                        {(!stats.recentOrders || stats.recentOrders.length === 0) ? (
                            <div className="p-12 bg-white rounded-2xl border border-dashed border-gray-200 text-center text-gray-400">
                                No business orders yet.
                            </div>
                        ) : (
                            stats.recentOrders.map((order) => (
                                <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
                                    <div className="p-5 flex flex-col lg:flex-row justify-between gap-6">
                                        {/* Product & Order Info */}
                                        <div className="flex gap-4 min-w-[300px]">
                                            <div className="w-20 h-20 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0">
                                                {/* In a real app, query image_url too, but using a placeholder for now to save complexity */}
                                                <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                                            </div>
                                            <div className="flex flex-col justify-center">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ORD #{order.id}</span>
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${order.status === 'PAID' ? 'bg-blue-100 text-blue-700' :
                                                        order.status === 'PACKED' ? 'bg-orange-100 text-orange-700' :
                                                            order.status === 'SHIPPED' ? 'bg-purple-100 text-purple-700' :
                                                                'bg-emerald-100 text-emerald-700'
                                                        }`}>
                                                        {order.status}
                                                    </span>
                                                </div>
                                                <h4 className="font-bold text-gray-800 text-lg">{order.product_title}</h4>
                                                <p className="text-sm text-gray-500">Sold for <span className="text-gray-700 font-bold">₹{order.subtotal}</span> ({order.quantity} units)</p>
                                            </div>
                                        </div>

                                        {/* Stepper Logic */}
                                        <div className="flex-1 flex items-center justify-center">
                                            <div className="flex items-center w-full max-w-md px-4">
                                                {[
                                                    { key: 'PAID', icon: '💰', label: 'Paid' },
                                                    { key: 'PACKED', icon: '📦', label: 'Packed' },
                                                    { key: 'SHIPPED', icon: '🚚', label: 'Sent' },
                                                    { key: 'DELIVERED', icon: '✅', label: 'Recvd' }
                                                ].map((step, idx, arr) => {
                                                    const statuses = arr.map(s => s.key);
                                                    const currentIdx = statuses.indexOf(order.status);
                                                    const isCompleted = idx <= currentIdx;
                                                    const isLast = idx === arr.length - 1;

                                                    return (
                                                        <React.Fragment key={step.key}>
                                                            <div className="flex flex-col items-center relative z-10">
                                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm mb-1 border-2 transition-all ${isCompleted ? 'bg-primary border-primary text-white scale-110 shadow-md' : 'bg-white border-gray-200 text-gray-300'}`}>
                                                                    {step.icon}
                                                                </div>
                                                                <span className={`text-[9px] font-bold absolute -bottom-4 whitespace-nowrap ${isCompleted ? 'text-gray-800' : 'text-gray-300'}`}>{step.label}</span>
                                                            </div>
                                                            {!isLast && (
                                                                <div className={`flex-1 h-0.5 transition-all ${idx < currentIdx ? 'bg-primary' : 'bg-gray-100'}`} />
                                                            )}
                                                        </React.Fragment>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex flex-col sm:flex-row lg:flex-col items-end gap-2 pr-2">
                                            {order.status === 'PAID' && (
                                                <button
                                                    onClick={() => handleStatusUpdate(order.id, 'PACKED')}
                                                    className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm transition-all flex items-center gap-2"
                                                >
                                                    <span>📦</span> Mark Packed
                                                </button>
                                            )}
                                            {order.status === 'PACKED' && (
                                                <button
                                                    onClick={() => { setSelectedOrder(order); setShowFulfillmentModal(true); }}
                                                    className="w-full sm:w-auto bg-primary hover:bg-accent text-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm transition-all flex items-center gap-2"
                                                >
                                                    <span>🚚</span> Add Shipping Info
                                                </button>
                                            )}
                                            {order.status === 'SHIPPED' && (
                                                <button
                                                    onClick={() => handleStatusUpdate(order.id, 'DELIVERED')}
                                                    className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm transition-all flex items-center gap-2"
                                                >
                                                    <span>✅</span> Mark Delivered
                                                </button>
                                            )}
                                            <button
                                                onClick={() => {
                                                    const text = `${order.shipping_address.full_name}, ${order.shipping_address.street}, ${order.shipping_address.city}...`;
                                                    toast((t) => (
                                                        <div className="flex flex-col gap-2">
                                                            <div className="text-sm">
                                                                <span className="font-bold">Customer:</span> {order.shipping_address.full_name}<br />
                                                                <span className="font-bold">Address:</span> {order.shipping_address.street}, {order.shipping_address.city}, {order.shipping_address.pincode}
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <button className="bg-blue-600 text-white px-2 py-1 rounded text-xs" onClick={() => { copyAddress(order.shipping_address); toast.dismiss(t.id); }}>Copy Address</button>
                                                                <a href={`tel:${order.shipping_address.phone_number || '0000000000'}`} className="bg-green-600 text-white px-2 py-1 rounded text-xs flex items-center gap-1">📞 Call</a>
                                                            </div>
                                                        </div>
                                                    ), { duration: 6000 });
                                                }}
                                                className="w-full sm:w-auto bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2"
                                            >
                                                <span>👤</span> Customer Info
                                            </button>
                                        </div>
                                    </div>
                                    {order.tracking_number && (
                                        <div className="px-5 py-2 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                                            <span className="text-[10px] text-gray-400 font-mono">Tracking: {order.tracking_number}</span>
                                            {order.shipping_proof_url && (
                                                <a href={order.shipping_proof_url} target="_blank" className="text-[10px] text-primary font-bold hover:underline">View Shipping Proof</a>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Fulfillment Modal */}
                {showFulfillmentModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
                        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in slide-in-from-bottom-4">
                            <div className="bg-primary p-6 text-white text-center">
                                <h3 className="text-xl font-bold">Shipping Proof 🚚</h3>
                                <p className="text-xs text-indigo-100 mt-1">Order #ORD-{selectedOrder?.id}</p>
                            </div>

                            <form onSubmit={handleFulfillmentSubmit} className="p-6 space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Tracking Number / ID</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. DTDC-123456"
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:bg-white transition-all text-sm"
                                        value={trackingNumber}
                                        onChange={(e) => setTrackingNumber(e.target.value)}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Receipt / Parcel Photo</label>
                                    <div className="relative border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:bg-gray-50 transition-all">
                                        {fulfillmentPreview ? (
                                            <div className="relative">
                                                <img src={fulfillmentPreview} alt="Receipt" className="mx-auto h-32 rounded-lg" />
                                                <button type="button" onClick={() => setFulfillmentPreview(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">×</button>
                                            </div>
                                        ) : (
                                            <div className="space-y-1">
                                                <span className="text-3xl">📸</span>
                                                <p className="text-[11px] text-gray-500">Take a photo of the courier receipt</p>
                                                <input
                                                    type="file"
                                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                                    onChange={handleFulfillmentFile}
                                                    required
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => { setShowFulfillmentModal(false); setSelectedOrder(null); }}
                                        className="flex-1 py-3 text-sm font-bold text-gray-500 hover:bg-gray-50 rounded-xl transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-[2] py-3 bg-primary text-white text-sm font-bold rounded-xl shadow-lg hover:shadow-primary/50 transition-all active:scale-[0.98]"
                                    >
                                        Confirm Shipping
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-secondary">Inventory & Catalogue</h2>
                    <button
                        onClick={() => { resetForm(); setShowAddForm(true); }}
                        className="bg-primary hover:bg-accent text-white px-5 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all font-medium flex items-center gap-2"
                    >
                        <span>+</span> New Product
                    </button>
                </div>

                {showAddForm && (
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                                <h3 className="text-xl font-bold text-gray-800">{isEditing ? 'Edit Product' : 'Add New Product'}</h3>
                                <button onClick={resetForm} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                            </div>

                            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Title</label>
                                    <input
                                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                        placeholder="e.g. Handmade Terracotta Vase"
                                        value={newItem.title}
                                        onChange={e => setNewItem({ ...newItem, title: e.target.value })}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Media</label>

                                    <div className="flex gap-4 mb-3">
                                        <button
                                            type="button"
                                            onClick={() => setUploadMode('file')}
                                            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all border ${uploadMode === 'file' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                                        >
                                            Upload File
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setUploadMode('url')}
                                            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all border ${uploadMode === 'url' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                                        >
                                            External URL
                                        </button>
                                    </div>

                                    {uploadMode === 'file' ? (
                                        <div
                                            onDragOver={handleDragOver}
                                            onDragLeave={handleDragLeave}
                                            onDrop={handleDrop}
                                            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${isDragging ? 'border-primary bg-indigo-50' : 'border-gray-200 bg-gray-50 hover:bg-gray-100/50'}`}
                                        >
                                            {imagePreview ? (
                                                <div className="relative inline-block mt-2">
                                                    <img src={imagePreview} alt="Preview" className="max-h-40 rounded-lg shadow-sm border border-gray-200" />
                                                    <button
                                                        type="button"
                                                        onClick={() => { setImageFile(null); setImagePreview(null); setNewItem(prev => ({ ...prev, image_url: '' })); }}
                                                        className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-lg"
                                                    >
                                                        &times;
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    <div className="text-4xl mb-2">📸</div>
                                                    <p className="text-sm font-medium text-gray-700">Drag & drop your product image here</p>
                                                    <p className="text-xs text-gray-400">or click to browse from device</p>
                                                    <input
                                                        type="file"
                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                        onChange={handleFileChange}
                                                        accept="image/*"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <input
                                                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                placeholder="https://example.com/image.jpg"
                                                value={newItem.image_url}
                                                onChange={e => {
                                                    setNewItem({ ...newItem, image_url: e.target.value });
                                                    setImagePreview(e.target.value);
                                                }}
                                            />
                                            {newItem.image_url && (
                                                <div className="mt-2 text-center">
                                                    <img src={newItem.image_url} alt="URL Preview" className="max-h-40 inline-block rounded-lg shadow-sm border border-gray-200" onError={(e) => e.target.style.display = 'none'} />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                        <select
                                            className="w-full p-2.5 border border-gray-300 rounded-lg"
                                            value={newItem.category}
                                            onChange={e => setNewItem({ ...newItem, category: e.target.value })}
                                        >
                                            <option value="Pottery">Pottery</option>
                                            <option value="Textile">Textile</option>
                                            <option value="Woodwork">Woodwork</option>
                                            <option value="Jewelry">Jewelry</option>
                                            <option value="Decor">Decor</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                                        <input
                                            type="number"
                                            className="w-full p-2.5 border border-gray-300 rounded-lg"
                                            value={newItem.stock_qty}
                                            onChange={e => setNewItem({ ...newItem, stock_qty: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">MRP / Base Price (₹)</label>
                                        <input
                                            type="number"
                                            className="w-full p-2.5 border border-gray-300 rounded-lg"
                                            placeholder="2000"
                                            value={newItem.base_price}
                                            onChange={e => setNewItem({ ...newItem, base_price: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price (₹)</label>
                                        <input
                                            type="number"
                                            className={`w-full p-2.5 border rounded-lg transition-colors ${newItem.sale_price && Number(newItem.sale_price) > Number(newItem.base_price) ? 'bg-red-50 border-red-300' : 'bg-green-50 border-green-200'}`}
                                            placeholder="1500"
                                            value={newItem.sale_price}
                                            onChange={e => setNewItem({ ...newItem, sale_price: e.target.value })}
                                            max={newItem.base_price}
                                            min="0"
                                        />
                                        {newItem.sale_price && Number(newItem.sale_price) > Number(newItem.base_price) && (
                                            <p className="text-[10px] text-red-500 mt-1">Cannot exceed MRP</p>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-center">
                                        {discount > 0 && <span className="bg-red-100 text-red-700 font-bold px-3 py-1 rounded-full text-sm">{discount}% OFF</span>}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        className="w-full p-2.5 border border-gray-300 rounded-lg h-32"
                                        placeholder="Detailed story of the product..."
                                        value={newItem.description}
                                        onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                                    />
                                </div>

                                <div className="flex items-center gap-2 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                                    <input
                                        type="checkbox"
                                        id="premiumCheck"
                                        checked={newItem.is_premium}
                                        onChange={e => setNewItem({ ...newItem, is_premium: e.target.checked })}
                                        className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                                    />
                                    <label htmlFor="premiumCheck" className="text-sm font-medium text-indigo-900 cursor-pointer select-none">
                                        Mark as Premium (Eligible for Blockchain Verification)
                                    </label>
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button type="submit" className="flex-1 bg-secondary text-white py-3 rounded-lg font-bold hover:bg-opacity-90 transition-all">
                                        {isEditing ? 'Update Product' : 'Save Product'}
                                    </button>
                                    <button type="button" onClick={resetForm} className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50">Cancel</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {products.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            <p className="text-xl mb-2">No products yet.</p>
                            <p className="text-sm">Click "New Product" to start your digital journey.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                                    <th className="px-6 py-4">Product</th>
                                    <th className="px-6 py-4 text-center">Price</th>
                                    <th className="px-6 py-4 text-center">Stock</th>
                                    <th className="px-6 py-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {products.map((p) => (
                                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 flex items-center gap-3">
                                            {p.image_url && <img src={p.image_url} alt={p.title} className="w-12 h-12 object-cover rounded-md border border-gray-200" />}
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-800">{p.title}</span>
                                                <span className="text-xs text-gray-500">{p.category} {p.is_premium && '• Premium'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {p.sale_price ? (
                                                <div className="flex flex-col items-center">
                                                    <span className="font-bold text-green-600">₹{p.sale_price}</span>
                                                    <span className="text-xs text-gray-400 line-through">₹{p.base_price}</span>
                                                </div>
                                            ) : (
                                                <span className="font-medium text-gray-700">₹{p.base_price}</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${p.stock_qty > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {p.stock_qty}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handleMint(p.id)}
                                                    className="title='Mint Auth Token' text-xs border border-indigo-200 text-indigo-700 w-8 h-8 rounded-full hover:bg-indigo-50 transition-colors flex items-center justify-center"
                                                >
                                                    ⛓️
                                                </button>
                                                <button
                                                    onClick={() => handleEditClick(p)}
                                                    className="title='Edit' text-xs border border-blue-200 text-blue-700 w-8 h-8 rounded-full hover:bg-blue-50 transition-colors flex items-center justify-center"
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(p.id)}
                                                    className="title='Delete' text-xs border border-red-200 text-red-700 w-8 h-8 rounded-full hover:bg-red-50 transition-colors flex items-center justify-center"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </main>

            {mintResult && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white p-8 rounded-2xl max-w-sm w-full text-center relative animate-in zoom-in shadow-2xl">
                        <button onClick={() => { setMintResult(null); setMintingId(null); }} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">✕</button>
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">✅</div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-1">Authenticity Minted!</h3>
                        <p className="text-sm text-gray-500 mb-6">This product is now verified on Polygon.</p>

                        <div className="bg-white p-2 rounded-xl border border-dashed border-gray-300 mb-6 inline-block">
                            <QRCode value={mintResult.verificationUrl} size={140} />
                        </div>

                        <div className="bg-gray-50 rounded p-3 mb-4 text-left">
                            <p className="text-xs text-gray-400 font-mono mb-1">TX Hash:</p>
                            <p className="text-xs text-gray-800 font-mono break-all">{mintResult.record.tx_hash}</p>
                        </div>

                        <a href={mintResult.verificationUrl} target="_blank" className="block w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-accent transition-colors">
                            View Certificate
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
}
