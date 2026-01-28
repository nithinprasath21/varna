import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import QRCode from 'react-qr-code';

export default function ArtisanDashboard() {
    const { user, logout } = useAuth();
    const [stats, setStats] = useState({ productCount: 0, totalSales: 0 });
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);

    const [newItem, setNewItem] = useState({
        title: '',
        description: '',
        base_price: '',
        sale_price: '',
        stock_qty: '',
        category: 'Pottery',
        is_premium: false
    });

    const [aiLoading, setAiLoading] = useState(false);

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
            is_premium: product.is_premium || false
        });
        setEditId(product.id);
        setIsEditing(true);
        setShowAddForm(true);
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
        setNewItem({ title: '', description: '', base_price: '', sale_price: '', stock_qty: '', category: 'Pottery', is_premium: false });
        setShowAddForm(false);
        setIsEditing(false);
        setEditId(null);
    };

    const generateAIContent = async () => {
        if (!newItem.title) return toast.error('Enter a title first');
        setAiLoading(true);
        try {
            const res = await axios.post('http://localhost:5000/ai/generate-description',
                { title: newItem.title, category: newItem.category }
            );
            setNewItem({ ...newItem, description: res.data.description });
            toast.success('Description Generated!');
        } catch (err) {
            toast.error('AI Generation failed');
        } finally {
            setAiLoading(false);
        }
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
                                            className="w-full p-2.5 border border-gray-300 rounded-lg bg-green-50 border-green-200"
                                            placeholder="1500"
                                            value={newItem.sale_price}
                                            onChange={e => setNewItem({ ...newItem, sale_price: e.target.value })}
                                        />
                                    </div>
                                    <div className="flex items-center justify-center">
                                        {discount > 0 && <span className="bg-red-100 text-red-700 font-bold px-3 py-1 rounded-full text-sm">{discount}% OFF</span>}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1 flex justify-between">
                                        <span>Description</span>
                                        <button
                                            type="button"
                                            onClick={generateAIContent}
                                            disabled={aiLoading}
                                            className="text-primary text-xs font-bold hover:underline disabled:opacity-50"
                                        >
                                            {aiLoading ? 'Magic Writing...' : '✨ AI Generate'}
                                        </button>
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
                                        <td className="px-6 py-4">
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
