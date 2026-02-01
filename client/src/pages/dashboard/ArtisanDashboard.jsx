import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
    ChevronRight, Info, AlertCircle, ShieldCheck,
    Pencil, Trash2, Cpu, ExternalLink, X, Check,
    MapPin, Phone, Mail, Package, Truck, Download, Plus, Search,
    Star, Tag, User, LayoutDashboard, ShoppingBag, MessageSquare
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
    const [activeTab, setActiveTab] = useState('inventory'); // dashboard, inventory, operations, community, studio

    // Reviews & Coupons State
    const [reviews, setReviews] = useState([]);
    const [coupons, setCoupons] = useState([]);
    const [artisanProfile, setArtisanProfile] = useState(null);
    const [showCouponForm, setShowCouponForm] = useState(false);
    const [newCoupon, setNewCoupon] = useState({
        code: '',
        discount_percentage: '',
        max_uses: 100,
        expiry_date: ''
    });

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

            const [statsRes, productsRes, reviewsRes, couponsRes, profileRes] = await Promise.all([
                axios.get('http://localhost:5000/artisan/dashboard', config),
                axios.get('http://localhost:5000/artisan/products', config),
                axios.get('http://localhost:5000/reviews/artisan/all', config),
                axios.get('http://localhost:5000/coupons/artisan/all', config),
                axios.get('http://localhost:5000/artisan/profile', config)
            ]);

            setStats(statsRes.data);
            setProducts(productsRes.data);
            setReviews(reviewsRes.data);
            setCoupons(couponsRes.data);
            setArtisanProfile(profileRes.data);
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

    const handleAddCoupon = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/coupons/create', newCoupon, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Coupon Created!");
            setShowCouponForm(false);
            setNewCoupon({ code: '', discount_percentage: '', max_uses: 100, expiry_date: '' });
            fetchDashboardData();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to create coupon");
        }
    };

    const handleUpdateArtisanProfile = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            // We assume artisanProfile state is correctly updated by form inputs
            await axios.put('http://localhost:5000/artisan/profile', artisanProfile, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Studio Profile Updated!");
            fetchDashboardData();
        } catch (err) {
            toast.error("Update failed");
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-black border-t-primary animate-spin" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] italic">Synchronizing Studio Parameters</span>
            </div>
        </div>
    );

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
        <div className="min-h-screen bg-white text-black font-sans">
            <header className="bg-white border-b border-gray-100 sticky top-0 z-[60] px-8 py-5 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div className="bg-primary text-black w-12 h-12 rounded-none flex items-center justify-center font-black italic text-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">A</div>
                    <div>
                        <h1 className="text-xl font-black uppercase tracking-tighter">Artisan Studio</h1>
                        <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">{user.email}</p>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <Link to="/" className="text-[10px] font-black uppercase tracking-widest hover:text-primary">Back to Store</Link>
                    <button onClick={logout} className="text-[10px] font-black uppercase tracking-widest text-red-600 hover:text-red-700 bg-red-50 px-4 py-2">
                        Sign Out
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto p-8">
                {/* Tab Navigation */}
                <div className="flex flex-wrap gap-4 mb-12 border-b-2 border-gray-100 pb-8">
                    {[
                        { id: 'dashboard', label: 'Intelligence', icon: LayoutDashboard },
                        { id: 'inventory', label: 'Inventory', icon: ShoppingBag },
                        { id: 'operations', label: 'Logistics', icon: Truck },
                        { id: 'marketing', label: 'Campaigns', icon: Tag },
                        { id: 'community', label: 'Citizens', icon: MessageSquare },
                        { id: 'studio', label: 'Configuration', icon: User },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-3 px-8 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-black text-white shadow-[8px_8px_0px_0px_rgba(255,210,0,1)]' : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-black'}`}
                        >
                            <tab.icon size={16} strokeWidth={3} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {activeTab === 'dashboard' && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                            <div className="bg-white p-8 border-l-8 border-primary shadow-sm flex flex-col justify-center min-h-[140px]">
                                <span className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Total Products</span>
                                <span className="text-4xl font-black italic tracking-tighter">{stats.productCount}</span>
                            </div>
                            <div className="bg-black text-white p-8 shadow-xl flex flex-col justify-center min-h-[140px]">
                                <span className="text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-2">Lifetime Revenue</span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-primary text-xl font-black italic space-x-0.5">₹</span>
                                    <span className="text-4xl font-black italic tracking-tighter">{stats.totalSales.toLocaleString()}</span>
                                </div>
                            </div>
                            <div className="bg-primary p-8 shadow-sm flex flex-col justify-center min-h-[140px] relative overflow-hidden group">
                                <div className="relative z-10">
                                    <h3 className="font-black italic text-xl uppercase tracking-tighter mb-1">Blockchain Safe</h3>
                                    <p className="text-black/60 text-[10px] font-bold uppercase tracking-widest">Mint authenticity tokens for your crafts.</p>
                                </div>
                                <span className="absolute -right-4 -bottom-4 text-black/10 text-8xl font-black italic select-none group-hover:scale-110 transition-transform">NFT</span>
                            </div>
                        </div>

                        {/* Visual Insights Section */}
                        <div className="bg-white border border-gray-100 p-8 mb-12">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                                <div>
                                    <h2 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
                                        <span className="text-primary text-3xl italic">/</span>
                                        Visual Performance
                                    </h2>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Real-time business analytics for your studio</p>
                                </div>

                                {/* Chart Selector */}
                                <div className="flex flex-wrap gap-1 bg-gray-50 p-1 border border-gray-100">
                                    {[
                                        { id: 'moneyFlow', label: 'Revenue', icon: <TrendingUp size={14} /> },
                                        { id: 'bestSellers', label: 'Sales', icon: <Award size={14} /> },
                                        { id: 'stockHealth', label: 'Inventory', icon: <Battery size={14} /> },
                                        { id: 'marketReach', label: 'Reach', icon: <Globe size={14} /> },
                                        { id: 'categoryProfit', label: 'Category', icon: <Clock size={14} /> },
                                    ].map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveChart(tab.id)}
                                            className={`flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${activeChart === tab.id ? 'bg-black text-white' : 'text-gray-400 hover:text-black'}`}
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
                                                    <stop offset="5%" stopColor="#FFD200" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#FFD200" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                            <XAxis dataKey="date" tick={{ fontSize: 9, fontWeight: 700 }} tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} axisLine={false} tickLine={false} />
                                            <YAxis tick={{ fontSize: 9, fontWeight: 700 }} axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val}`} />
                                            <Tooltip contentStyle={{ borderRadius: '0', border: '2px solid black', boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }} />
                                            <Area type="monotone" dataKey="revenue" stroke="#000" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                                        </AreaChart>
                                    ) : activeChart === 'bestSellers' ? (
                                        <BarChart data={stats.charts.bestSellers} layout="vertical">
                                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                                            <XAxis type="number" hide />
                                            <YAxis dataKey="title" type="category" width={120} tick={{ fontSize: 9, fontWeight: 900, textAnchor: 'start' }} axisLine={false} tickLine={false} />
                                            <Tooltip cursor={{ fill: '#f9f9f9' }} contentStyle={{ border: '2px solid black' }} />
                                            <Bar dataKey="total_sold" fill="#FFD200" radius={[0, 0, 0, 0]} barSize={20}>
                                                {stats.charts.bestSellers.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={index === 0 ? '#000' : '#FFD200'} />
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
                                                    <Cell key={`cell-${index}`} fill={['#000000', '#FFD200', '#333333', '#CCCCCC', '#E6BD00'][index % 5]} />
                                                ))}
                                            </Pie>
                                            <Tooltip contentStyle={{ border: '2px solid black' }} />
                                            <Legend iconType="square" wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }} />
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
                    </>
                )}

                {activeTab === 'operations' && (
                    <div className="space-y-12">
                        {/* Order Management Section */}
                        <div className="mb-20">
                            <div className="flex items-center justify-between mb-10 border-l-4 border-black pl-4">
                                <h2 className="text-2xl font-black uppercase tracking-tighter">Active Business Studio Orders</h2>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">Live Logistics Track</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
                                {(!stats.recentOrders || stats.recentOrders.length === 0) ? (
                                    <div className="p-12 bg-white rounded-2xl border border-dashed border-gray-200 text-center text-gray-400">
                                        No business orders yet.
                                    </div>
                                ) : (
                                    stats.recentOrders.map((order) => (
                                        <div key={order.id} className="bg-white border border-gray-100 overflow-hidden mb-6 hover:border-primary transition-colors">
                                            <div className="p-6 flex flex-col lg:flex-row justify-between gap-8">
                                                {/* Product & Order Info */}
                                                <div className="flex gap-6 min-w-[320px]">
                                                    <div className="w-24 h-24 bg-gray-50 flex-shrink-0 flex items-center justify-center text-3xl italic font-black border border-gray-100">
                                                        {order.product_title.charAt(0)}
                                                    </div>
                                                    <div className="flex flex-col justify-center">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <span className="text-[10px] font-black text-white bg-black px-2 py-0.5 tracking-tighter italic shadow-[2px_2px_0px_0px_rgba(255,210,0,1)]">ORD #{order.id}</span>
                                                            <span className={`text-[9px] font-black uppercase tracking-widest ${order.status === 'PAID' ? 'text-blue-600' :
                                                                order.status === 'PACKED' ? 'text-orange-600' :
                                                                    order.status === 'SHIPPED' ? 'text-primary' :
                                                                        'text-green-600'
                                                                }`}>
                                                                {order.status}
                                                            </span>
                                                        </div>
                                                        <h4 className="font-black text-black text-xl italic tracking-tighter uppercase">{order.product_title}</h4>
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">REVENUE: <span className="text-black font-black italic">₹{order.subtotal}</span> / {order.quantity} UNIT</p>
                                                    </div>
                                                </div>

                                                {/* Stepper Logic */}
                                                <div className="flex-1 flex items-center justify-center">
                                                    <div className="flex items-center w-full max-w-sm">
                                                        {[
                                                            { key: 'PAID', icon: '1', label: 'Paid' },
                                                            { key: 'PACKED', icon: '2', label: 'Packed' },
                                                            { key: 'SHIPPED', icon: '3', label: 'Sent' },
                                                            { key: 'DELIVERED', icon: '4', label: 'Recvd' }
                                                        ].map((step, idx, arr) => {
                                                            const statuses = arr.map(s => s.key);
                                                            const currentIdx = statuses.indexOf(order.status);
                                                            const isCompleted = idx <= currentIdx;
                                                            const isLast = idx === arr.length - 1;

                                                            return (
                                                                <React.Fragment key={step.key}>
                                                                    <div className="flex flex-col items-center relative z-10">
                                                                        <div className={`w-8 h-8 rounded-none flex items-center justify-center text-[10px] font-black italic mb-1 border-2 transition-all ${isCompleted ? 'bg-primary border-black text-black transform rotate-12 scale-110' : 'bg-white border-gray-100 text-gray-200'}`}>
                                                                            {step.icon}
                                                                        </div>
                                                                        <span className={`text-[8px] font-black uppercase tracking-widest absolute -bottom-5 whitespace-nowrap ${isCompleted ? 'text-black' : 'text-gray-200'}`}>{step.label}</span>
                                                                    </div>
                                                                    {!isLast && (
                                                                        <div className={`flex-1 h-0.5 transition-all ${idx < currentIdx ? 'bg-black' : 'bg-gray-100'}`} />
                                                                    )}
                                                                </React.Fragment>
                                                            );
                                                        })}
                                                    </div>
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="flex flex-col sm:flex-row lg:flex-col items-end gap-3 pr-2">
                                                    {order.status === 'PAID' && (
                                                        <button
                                                            onClick={() => handleStatusUpdate(order.id, 'PACKED')}
                                                            className="w-full lg:w-48 bg-black text-white px-6 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-black transition-colors"
                                                        >
                                                            Mark Packed
                                                        </button>
                                                    )}
                                                    {order.status === 'PACKED' && (
                                                        <button
                                                            onClick={() => { setSelectedOrder(order); setShowFulfillmentModal(true); }}
                                                            className="w-full lg:w-48 bg-primary text-black px-6 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-colors"
                                                        >
                                                            Add Logistics
                                                        </button>
                                                    )}
                                                    {order.status === 'SHIPPED' && (
                                                        <button
                                                            onClick={() => handleStatusUpdate(order.id, 'DELIVERED')}
                                                            className="w-full lg:w-48 border-2 border-black text-black px-6 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-colors"
                                                        >
                                                            Confirm Receipt
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => {
                                                            const text = `${order.shipping_address.full_name}, ${order.shipping_address.street}, ${order.shipping_address.city}...`;
                                                            toast((t) => (
                                                                <div className="flex flex-col gap-4 p-2">
                                                                    <div className="text-[10px] font-black uppercase tracking-widest">
                                                                        <span className="text-primary mr-2 italic">●</span> Customer Details
                                                                    </div>
                                                                    <div className="text-xs font-bold uppercase tracking-tighter">
                                                                        <span className="text-gray-400">Name:</span> {order.shipping_address.full_name}<br />
                                                                        <span className="text-gray-400">Addr:</span> {order.shipping_address.street}, {order.shipping_address.city}, {order.shipping_address.pincode}
                                                                    </div>
                                                                    <div className="flex gap-4">
                                                                        <button className="flex-1 bg-black text-white px-4 py-2 text-[10px] font-black uppercase tracking-widest" onClick={() => { copyAddress(order.shipping_address); toast.dismiss(t.id); }}>Copy Address</button>
                                                                        <a href={`tel:${order.shipping_address.phone_number || '0000000000'}`} className="flex-1 bg-primary text-black px-4 py-2 text-[10px] font-black uppercase tracking-widest text-center">Call Now</a>
                                                                    </div>
                                                                </div>
                                                            ), { duration: 6000, style: { background: 'white', color: 'black', border: '2px solid black', borderRadius: '0' } });
                                                        }}
                                                        className="w-full lg:w-48 bg-transparent text-gray-400 hover:text-black px-6 py-2 text-[9px] font-black uppercase tracking-widest transition-all text-center"
                                                    >
                                                        Customer Info
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
                            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
                                <div className="bg-white border-[10px] border-black shadow-[20px_20px_0px_0px_rgba(255,210,0,1)] w-full max-w-md overflow-hidden animate-in zoom-in">
                                    <div className="bg-black p-8 text-white flex justify-between items-center">
                                        <div>
                                            <h3 className="text-2xl font-black italic uppercase tracking-tighter">Logistics Entry</h3>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-primary mt-1 italic">Order #ORD-{selectedOrder?.id}</p>
                                        </div>
                                        <div className="bg-primary p-3">
                                            <Truck className="text-black" size={24} strokeWidth={3} />
                                        </div>
                                    </div>

                                    <form onSubmit={handleFulfillmentSubmit} className="p-8 space-y-8">
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 italic">Tracking Identifier / AWB</label>
                                            <input
                                                type="text"
                                                placeholder="E.G. DTDC-123456"
                                                className="w-full p-4 bg-gray-50 border-b-4 border-transparent focus:border-black outline-none text-sm font-black transition-all"
                                                value={trackingNumber}
                                                onChange={(e) => setTrackingNumber(e.target.value)}
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 italic">Official Receipt Scan</label>
                                            <div className="relative border-4 border-dashed border-gray-200 p-8 text-center hover:bg-gray-50 transition-all cursor-pointer">
                                                {fulfillmentPreview ? (
                                                    <div className="relative">
                                                        <img src={fulfillmentPreview} alt="Receipt" className="mx-auto h-40 object-cover border-2 border-black" />
                                                        <button type="button" onClick={() => setFulfillmentPreview(null)} className="absolute -top-4 -right-4 bg-black text-white p-2 hover:bg-red-600 transition-colors">
                                                            <X size={16} strokeWidth={3} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-3">
                                                        <Package size={32} className="mx-auto text-gray-200" />
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">Upload Courier Manifest</p>
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

                                        <div className="grid grid-cols-2 gap-4">
                                            <button type="button" onClick={() => { setShowFulfillmentModal(false); setSelectedOrder(null); }} className="border-2 border-black text-black py-4 text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all">
                                                ABORT
                                            </button>
                                            <button type="submit" className="bg-black text-white py-4 text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-black transition-all">
                                                SUBMIT LEDGER
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'inventory' && (
                    <div className="space-y-12">
                        <div className="flex flex-col md:flex-row justify-between items-center mb-10 border-b-2 border-black pb-4">
                            <h2 className="text-3xl font-black italic uppercase tracking-tighter">Studio Catalogue</h2>
                            <button
                                onClick={() => { resetForm(); setShowAddForm(true); }}
                                className="bg-primary text-black px-8 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                            >
                                + Create Masterpiece
                            </button>
                        </div>

                        {showAddForm && (
                            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
                                <div className="bg-white shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-none border-[6px] border-primary">
                                    <div className="p-8 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                                        <h3 className="text-2xl font-black italic uppercase tracking-tighter">{isEditing ? 'Modify Concept' : 'Capture New Essence'}</h3>
                                        <button onClick={resetForm} className="text-black hover:text-primary text-3xl font-black transition-colors">&times;</button>
                                    </div>

                                    <form onSubmit={handleFormSubmit} className="p-8 space-y-8">
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 italic">Product Title</label>
                                            <input
                                                className="w-full p-4 bg-gray-50 border-none focus:ring-2 focus:ring-primary focus:bg-white text-sm font-bold uppercase tracking-tight transition-all"
                                                placeholder="e.g. TERRACOTTA DUSK VASE"
                                                value={newItem.title}
                                                onChange={e => setNewItem({ ...newItem, title: e.target.value })}
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 italic">Product Media</label>

                                            <div className="flex gap-1 mb-4">
                                                <button
                                                    type="button"
                                                    onClick={() => setUploadMode('file')}
                                                    className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${uploadMode === 'file' ? 'bg-primary text-black' : 'bg-gray-50 text-gray-400 hover:text-black'}`}
                                                >
                                                    Local File
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setUploadMode('url')}
                                                    className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${uploadMode === 'url' ? 'bg-primary text-black' : 'bg-gray-50 text-gray-400 hover:text-black'}`}
                                                >
                                                    Web Link
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

                                        <div className="space-y-8">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-1">
                                                <div>
                                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 italic">Category</label>
                                                    <select
                                                        className="w-full p-4 bg-gray-50 border-none focus:ring-2 focus:ring-primary text-xs font-bold uppercase tracking-widest transition-all"
                                                        value={newItem.category}
                                                        onChange={e => setNewItem({ ...newItem, category: e.target.value })}
                                                    >
                                                        <option value="Pottery">POTTERY & CLAY</option>
                                                        <option value="Textile">TEXTILE & WEAVE</option>
                                                        <option value="Woodwork">WOOD & TIMBER</option>
                                                        <option value="Jewelry">JEWEL & METAL</option>
                                                        <option value="Decor">ART & DECOR</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 italic">Available Units</label>
                                                    <input
                                                        type="number"
                                                        className="w-full p-4 bg-gray-50 border-none focus:ring-2 focus:ring-primary text-sm font-bold transition-all"
                                                        value={newItem.stock_qty}
                                                        onChange={e => setNewItem({ ...newItem, stock_qty: e.target.value })}
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-1">
                                                <div>
                                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 italic">Standard MRP (₹)</label>
                                                    <input
                                                        type="number"
                                                        className="w-full p-4 bg-gray-50 border-none focus:ring-2 focus:ring-primary text-sm font-bold transition-all"
                                                        placeholder="0.00"
                                                        value={newItem.base_price}
                                                        onChange={e => setNewItem({ ...newItem, base_price: e.target.value })}
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 italic">Studio Price (₹)</label>
                                                    <input
                                                        type="number"
                                                        className={`w-full p-4 border-none focus:ring-2 focus:ring-primary text-sm font-bold transition-all ${newItem.sale_price && Number(newItem.sale_price) > Number(newItem.base_price) ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-black'}`}
                                                        placeholder="0.00"
                                                        value={newItem.sale_price}
                                                        onChange={e => setNewItem({ ...newItem, sale_price: e.target.value })}
                                                        max={newItem.base_price}
                                                        min="0"
                                                    />
                                                </div>
                                                <div className="flex items-center justify-center">
                                                    {discount > 0 && <span className="bg-black text-primary font-black italic px-4 py-2 text-[10px] shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">{discount}% VALUE OFF</span>}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 italic">Product Narrative</label>
                                                <textarea
                                                    className="w-full p-4 bg-gray-50 border-none focus:ring-2 focus:ring-primary text-sm font-medium transition-all h-32"
                                                    placeholder="Write the story behind this creation..."
                                                    value={newItem.description}
                                                    onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                                                />
                                            </div>

                                            <div className="flex items-center gap-4 p-5 bg-black text-white">
                                                <input
                                                    type="checkbox"
                                                    id="premiumCheck"
                                                    checked={newItem.is_premium}
                                                    onChange={e => setNewItem({ ...newItem, is_premium: e.target.checked })}
                                                    className="w-6 h-6 accent-primary border-none"
                                                />
                                                <label htmlFor="premiumCheck" className="text-[10px] font-black uppercase tracking-widest cursor-pointer select-none">
                                                    Premium Identification <span className="text-primary italic ml-2">[BLOCKCHAIN VERIFIABLE]</span>
                                                </label>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                                            <button type="submit" className="bg-black text-white py-5 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-primary hover:text-black transition-all shadow-[8px_8px_0px_0px_rgba(255,210,0,1)]">
                                                {isEditing ? 'COMMIT UPDATES' : 'RELEASE COLLECTION'}
                                            </button>
                                            <button type="button" onClick={resetForm} className="border-2 border-black text-black py-5 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-black hover:text-white transition-all">
                                                ABORT
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        <div className="bg-white border-2 border-black mb-20">
                            {products.length === 0 ? (
                                <div className="p-20 text-center text-gray-300 italic">
                                    <p className="text-3xl font-black uppercase tracking-tighter mb-4">Studio empty.</p>
                                    <p className="text-[10px] font-bold tracking-widest uppercase">Begin your digital legacy today.</p>
                                </div>
                            ) : (
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-black text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                                            <th className="px-8 py-5">Product Master</th>
                                            <th className="px-8 py-5 text-center italic">Value (₹)</th>
                                            <th className="px-8 py-5 text-center italic">Stock</th>
                                            <th className="px-8 py-5 text-right">Ops</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {products.map((p) => (
                                            <tr key={p.id} className="hover:bg-primary/5 transition-colors group">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-6">
                                                        <div className="w-16 h-16 bg-gray-50 flex-shrink-0 border border-gray-100 grayscale hover:grayscale-0 transition-all duration-500 overflow-hidden">
                                                            {p.image_url ? (
                                                                <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-2xl font-black italic">!</div>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="font-black italic text-lg uppercase tracking-tight text-black">{p.title}</span>
                                                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{p.category} {p.is_premium && '• [PREMIUM GEN]'}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-center">
                                                    {p.sale_price ? (
                                                        <div className="flex flex-col items-center">
                                                            <span className="font-black italic text-black">₹{p.sale_price}</span>
                                                            <span className="text-[9px] text-gray-300 line-through">₹{p.base_price}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="font-black italic text-black">₹{p.base_price}</span>
                                                    )}
                                                </td>
                                                <td className="px-8 py-6 text-center">
                                                    <span className={`text-[10px] font-black uppercase tracking-widest italic ${p.stock_qty > 10 ? 'text-black' : 'text-red-600 underline decoration-primary decoration-2'}`}>
                                                        {p.stock_qty} UNITS
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center justify-end gap-6 opacity-40 group-hover:opacity-100 transition-opacity">
                                                        {p.is_premium && (
                                                            <button onClick={() => handleMint(p.id)} className="text-[10px] font-black uppercase hover:text-primary transition-colors italic flex items-center gap-2">MINT <Cpu size={12} strokeWidth={3} /></button>
                                                        )}
                                                        <button onClick={() => handleEditClick(p)} className="text-[10px] font-black uppercase hover:text-primary transition-colors italic flex items-center gap-2">EDIT <Pencil size={12} strokeWidth={3} /></button>
                                                        <button onClick={() => handleDeleteClick(p.id)} className="text-[10px] font-black uppercase hover:text-red-600 transition-colors italic flex items-center gap-2">DROP <Trash2 size={12} strokeWidth={3} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'marketing' && (
                    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4">
                        <div className="flex justify-between items-end border-b-2 border-black pb-8">
                            <div>
                                <h2 className="text-4xl font-black italic uppercase tracking-tighter">Campaign Protocol</h2>
                                <p className="text-[10px] font-black tracking-widest text-gray-400 uppercase italic mt-2">Discount Logic & Promotion Codes</p>
                            </div>
                            <button
                                onClick={() => setShowCouponForm(true)}
                                className="bg-black text-white px-10 py-4 text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-black transition-all shadow-[8px_8px_0px_0px_rgba(255,210,0,1)]"
                            >
                                ESTABLISH NEW CODE
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {coupons.map(coupon => (
                                <div key={coupon.id} className="border-4 border-gray-100 p-8 group hover:border-black transition-all relative overflow-hidden">
                                    {!coupon.is_active && <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] z-10 flex items-center justify-center font-black italic uppercase text-red-600 rotate-12 text-2xl border-4 border-red-600 m-4">TERMINATED</div>}
                                    <div className="flex justify-between items-start mb-10">
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic mb-1">PROTO-CODE</p>
                                            <h3 className="text-3xl font-black italic text-black bg-primary px-4 py-1 inline-block">{coupon.code}</h3>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">VALUE OFF</p>
                                            <p className="text-3xl font-black italic text-black">{Math.round(coupon.discount_percentage)}%</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest border-b border-gray-100 pb-2 italic">
                                            <span>Usage Registry</span>
                                            <span>{coupon.current_uses} / {coupon.max_uses}</span>
                                        </div>
                                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest border-b border-gray-100 pb-2 italic">
                                            <span>Expiry Paradox</span>
                                            <span className="text-red-600">{new Date(coupon.expiry_date).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {coupons.length === 0 && (
                                <div className="col-span-full py-32 text-center border-4 border-dashed border-gray-100 bg-gray-50/50">
                                    <Tag className="mx-auto text-gray-200 mb-4" size={48} />
                                    <p className="text-[12px] font-black uppercase tracking-[0.4em] text-gray-300">No Active Promotional Logic</p>
                                </div>
                            )}
                        </div>

                        {showCouponForm && (
                            <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-8 backdrop-blur-md">
                                <form onSubmit={handleAddCoupon} className="bg-white border-[12px] border-black p-12 max-w-xl w-full relative shadow-[24px_24px_0px_0px_rgba(255,210,0,1)]">
                                    <button type="button" onClick={() => setShowCouponForm(false)} className="absolute top-8 right-8 text-black hover:text-primary"><X size={32} strokeWidth={4} /></button>
                                    <h3 className="text-4xl font-black italic uppercase tracking-tighter mb-12 border-b-8 border-primary pb-4 inline-block">Execute Code</h3>

                                    <div className="space-y-8">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">IDENTIFIER (CODE)</label>
                                            <input
                                                className="w-full bg-gray-50 border-b-4 border-transparent focus:border-black p-4 text-xl font-black uppercase outline-none transition-all"
                                                placeholder="E.G. VARNA25"
                                                value={newCoupon.code}
                                                onChange={e => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                                                required
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-8">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">DISCOUNT %</label>
                                                <input
                                                    type="number"
                                                    className="w-full bg-gray-50 border-b-4 border-transparent focus:border-black p-4 text-xl font-black outline-none transition-all"
                                                    value={newCoupon.discount_percentage}
                                                    onChange={e => setNewCoupon({ ...newCoupon, discount_percentage: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">MAX CAPACITY</label>
                                                <input
                                                    type="number"
                                                    className="w-full bg-gray-50 border-b-4 border-transparent focus:border-black p-4 text-xl font-black outline-none transition-all"
                                                    value={newCoupon.max_uses}
                                                    onChange={e => setNewCoupon({ ...newCoupon, max_uses: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">TEMPORAL EXPIRY (DATE)</label>
                                            <input
                                                type="date"
                                                className="w-full bg-gray-50 border-b-4 border-transparent focus:border-black p-4 text-sm font-black outline-none transition-all"
                                                value={newCoupon.expiry_date}
                                                onChange={e => setNewCoupon({ ...newCoupon, expiry_date: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <button type="submit" className="w-full bg-black text-white py-6 text-xs font-black uppercase tracking-[0.4em] italic hover:bg-primary hover:text-black transition-all">COMMIT TO LEDGER</button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'community' && (
                    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4">
                        <div className="flex justify-between items-end border-b-2 border-black pb-8">
                            <div>
                                <h2 className="text-4xl font-black italic uppercase tracking-tighter">Citizen Intelligence</h2>
                                <p className="text-[10px] font-black tracking-widest text-gray-400 uppercase italic mt-2">Public Sentiment & Product Validation</p>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Global Approval</p>
                                    <p className="text-2xl font-black italic">{(reviews.reduce((acc, r) => acc + r.rating, 0) / (reviews.length || 1)).toFixed(1)} / 5.0</p>
                                </div>
                                <div className="bg-primary w-14 h-14 flex items-center justify-center border-2 border-black rotate-12">
                                    <MessageSquare size={24} className="-rotate-12" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-8">
                            {reviews.map(review => (
                                <div key={review.id} className="bg-white border-2 border-gray-100 p-8 flex flex-col md:flex-row gap-12 hover:border-black transition-all group">
                                    <div className="md:w-64 flex-shrink-0">
                                        <div className="bg-gray-50 p-4 border border-gray-100 aspect-square flex items-center justify-center text-5xl italic font-black text-gray-200 group-hover:bg-primary group-hover:text-black transition-all">
                                            {review.product_title.charAt(0)}
                                        </div>
                                        <p className="text-[10px] font-black uppercase tracking-widest mt-4 truncate italic">{review.product_title}</p>
                                    </div>
                                    <div className="flex-1 space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="flex text-primary mb-2">
                                                    {[1, 2, 3, 4, 5].map(star => (
                                                        <Star key={star} size={14} fill={star <= review.rating ? "currentColor" : "none"} stroke="currentColor" strokeWidth={3} />
                                                    ))}
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <h4 className="text-2xl font-black italic uppercase tracking-tighter">{review.title || 'Verified Transaction'}</h4>
                                                    <span className={`text-[8px] font-black px-2 py-0.5 uppercase italic ${review.rating >= 4 ? 'bg-green-50 text-green-700' : review.rating === 3 ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'}`}>
                                                        {review.rating >= 4 ? '[ POSITIVE SENTIMENT ]' : review.rating === 3 ? '[ NEUTRAL FREQUENCY ]' : '[ ATTRITION RISK ]'}
                                                    </span>
                                                </div>
                                            </div>
                                            <span className="text-[10px] font-black text-gray-300 uppercase italic tracking-widest">{new Date(review.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-sm font-medium text-gray-600 leading-relaxed italic pr-20">{review.comment}</p>
                                        <div className="flex items-center gap-4 pt-6 mt-6 border-t border-gray-50">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-black underline decoration-primary decoration-4 underline-offset-4">LOGGED BY CITIZEN: {review.reviewer_name}</span>
                                            <span className="text-[9px] font-black uppercase text-gray-300 italic tracking-[0.2em] ml-auto">Transmission Verified [ID-{review.id}]</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {reviews.length === 0 && (
                                <div className="py-40 text-center border-4 border-dashed border-gray-100 italic">
                                    <p className="text-[12px] font-black uppercase tracking-[0.4em] text-gray-200">Awaiting External Validation Records</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'studio' && artisanProfile && (
                    <div className="max-w-4xl mx-auto space-y-16 animate-in fade-in slide-in-from-bottom-4">
                        <div className="border-b-4 border-black pb-8">
                            <h2 className="text-4xl font-black italic uppercase tracking-tighter">Studio Configuration</h2>
                            <p className="text-[10px] font-black tracking-widest text-gray-400 uppercase italic mt-2">Operational Parameters & Personal Metadata</p>
                        </div>

                        <form onSubmit={handleUpdateArtisanProfile} className="space-y-12 pb-40">
                            {/* Personal Details */}
                            <div className="space-y-8">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary bg-black inline-block px-4 py-1 italic">Master Identity</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">Full Legal Name</label>
                                        <input
                                            className="w-full bg-gray-50 border-b-4 border-transparent focus:border-black p-4 text-sm font-black uppercase outline-none"
                                            value={artisanProfile.full_name || ''}
                                            onChange={e => setArtisanProfile({ ...artisanProfile, full_name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">Contact Protocol (Phone)</label>
                                        <input
                                            className="w-full bg-gray-50 border-b-4 border-transparent focus:border-black p-4 text-sm font-black uppercase outline-none"
                                            value={artisanProfile.phone_number || ''}
                                            onChange={e => setArtisanProfile({ ...artisanProfile, phone_number: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Studio Details */}
                            <div className="space-y-8">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary bg-black inline-block px-4 py-1 italic">Spatial Branding</h3>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">Studio / Store Name</label>
                                    <input
                                        className="w-full bg-gray-50 border-b-4 border-transparent focus:border-black p-4 text-xl font-black italic uppercase outline-none"
                                        value={artisanProfile.store_name || ''}
                                        onChange={e => setArtisanProfile({ ...artisanProfile, store_name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">Studio Narrative (Bio)</label>
                                    <textarea
                                        className="w-full bg-gray-50 border-b-4 border-transparent focus:border-black p-4 text-sm font-medium italic outline-none h-32 leading-relaxed"
                                        value={artisanProfile.bio || ''}
                                        onChange={e => setArtisanProfile({ ...artisanProfile, bio: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">Primary Craft Logic</label>
                                        <input
                                            className="w-full bg-gray-50 border-b-4 border-transparent focus:border-black p-4 text-sm font-black uppercase outline-none"
                                            value={artisanProfile.craft_type || ''}
                                            onChange={e => setArtisanProfile({ ...artisanProfile, craft_type: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">Exp. Magnitude (Years)</label>
                                        <input
                                            type="number"
                                            className="w-full bg-gray-50 border-b-4 border-transparent focus:border-black p-4 text-sm font-black uppercase outline-none"
                                            value={artisanProfile.experience_years || ''}
                                            onChange={e => setArtisanProfile({ ...artisanProfile, experience_years: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Financial Logistics */}
                            <div className="space-y-8">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary bg-black inline-block px-4 py-1 italic">Liquid Assets Logistics</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">Bank Protocol (Account No)</label>
                                        <input
                                            className="w-full bg-gray-50 border-b-4 border-transparent focus:border-black p-4 text-sm font-black uppercase outline-none"
                                            value={artisanProfile.bank_acc_no || ''}
                                            onChange={e => setArtisanProfile({ ...artisanProfile, bank_acc_no: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">System Code (IFSC)</label>
                                        <input
                                            className="w-full bg-gray-50 border-b-4 border-transparent focus:border-black p-4 text-sm font-black uppercase outline-none"
                                            value={artisanProfile.ifsc || ''}
                                            onChange={e => setArtisanProfile({ ...artisanProfile, ifsc: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">Bank Name</label>
                                        <input
                                            className="w-full bg-gray-50 border-b-4 border-transparent focus:border-black p-4 text-sm font-black uppercase outline-none"
                                            value={artisanProfile.bank_name || ''}
                                            onChange={e => setArtisanProfile({ ...artisanProfile, bank_name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">UPI Identifier</label>
                                        <input
                                            className="w-full bg-gray-50 border-b-4 border-transparent focus:border-black p-4 text-sm font-black uppercase outline-none"
                                            value={artisanProfile.upi_id || ''}
                                            onChange={e => setArtisanProfile({ ...artisanProfile, upi_id: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <button type="submit" className="w-full bg-black text-white py-8 text-xs font-black uppercase tracking-[0.5em] italic shadow-[16px_16px_0px_0px_rgba(255,210,0,1)] hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all">
                                COMMIT PARAMETERS TO STUDIO CORE
                            </button>
                        </form>
                    </div>
                )}
            </main>

            {mintResult && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white border-[10px] border-black shadow-[20px_20px_0px_0px_rgba(255,210,0,1)] max-w-sm w-full p-10 text-center relative">
                        <button onClick={() => { setMintResult(null); setMintingId(null); }} className="absolute top-4 right-4 text-black hover:text-primary">
                            <X size={24} strokeWidth={4} />
                        </button>

                        <div className="w-20 h-20 bg-primary flex items-center justify-center mx-auto mb-6 rotate-12">
                            <ShieldCheck className="text-black" size={40} strokeWidth={3} />
                        </div>

                        <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-2">Authenticated.</h3>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-8 italic">VERIFIED ON POLYGON LEDGER</p>

                        <div className="bg-white p-4 border-2 border-dashed border-black mb-8 inline-block">
                            <QRCode value={mintResult.verificationUrl} size={160} />
                        </div>

                        <div className="bg-gray-50 p-4 mb-8 text-left border-l-4 border-black">
                            <p className="text-[8px] font-black uppercase tracking-widest text-gray-400 mb-1">TRANSACTION HASH</p>
                            <p className="text-[10px] font-black text-black break-all uppercase tracking-tighter">{mintResult.record.tx_hash}</p>
                        </div>

                        <a
                            href={mintResult.verificationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-3 w-full bg-black text-white py-5 text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-black transition-all"
                        >
                            VIEW CERTIFICATE <ExternalLink size={14} strokeWidth={3} />
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
}
