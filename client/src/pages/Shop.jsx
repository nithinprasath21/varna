import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Shop() {
    const [products, setProducts] = useState([]);
    const [searchParams, setSearchParams] = useSearchParams();
    const { addToCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    const category = searchParams.get('category') || '';
    const search = searchParams.get('search') || '';

    useEffect(() => {
        fetchProducts();
    }, [category, search]);

    const fetchProducts = async () => {
        try {
            // Fix: ensure we don't send empty params
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (category) params.append('category', category);

            const res = await axios.get(`http://localhost:5000/shop/products?${params.toString()}`);
            setProducts(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCategoryChange = (cat) => {
        const newParams = new URLSearchParams(searchParams);
        if (cat) newParams.set('category', cat);
        else newParams.delete('category');
        setSearchParams(newParams);
    };

    const handleAddToCart = (product) => {
        if (!user) {
            navigate('/auth/login', { state: { from: '/shop' } });
            return;
        }
        addToCart(product);
    };

    return (
        <div className="bg-background min-h-screen py-8">
            <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row gap-8">
                {/* Sidebar Filters */}
                <aside className="w-full md:w-64 flex-shrink-0">
                    <div className="bg-surface p-6 rounded-lg shadow-sm border border-gray-100 sticky top-24">
                        <h3 className="font-bold text-lg mb-4 text-secondary">Filters</h3>

                        <div className="mb-6">
                            <h4 className="font-semibold mb-2 text-sm text-gray-500 uppercase tracking-wider">Category</h4>
                            <ul className="space-y-2 text-sm">
                                <li>
                                    <button
                                        onClick={() => handleCategoryChange('')}
                                        className={`block w-full text-left hover:text-primary ${!category ? 'font-bold text-primary' : ''}`}
                                    >
                                        All Products
                                    </button>
                                </li>
                                {['Pottery', 'Textile', 'Woodwork', 'Jewelry', 'Decor'].map(cat => (
                                    <li key={cat}>
                                        <button
                                            onClick={() => handleCategoryChange(cat)}
                                            className={`block w-full text-left hover:text-primary ${category === cat ? 'font-bold text-primary' : ''}`}
                                        >
                                            {cat}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </aside>

                {/* Product Grid */}
                <div className="flex-grow">
                    <header className="mb-6 flex justify-between items-center">
                        <h1 className="text-2xl font-bold text-secondary">
                            {category ? `${category}` : 'All Products'}
                            {search && <span className="text-gray-500 font-normal"> results for "{search}"</span>}
                        </h1>
                        <span className="text-sm text-gray-500">{products.length} items</span>
                    </header>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {products.map(item => (
                            <div key={item.id} className="bg-white p-4 rounded-xl shadow-md border-transparent hover:border-primary border transition-all flex flex-col group">
                                <div className="bg-gray-100 h-48 rounded-lg mb-4 flex items-center justify-center text-gray-400 relative overflow-hidden">
                                    {/* Placeholder Image or Category Icon */}
                                    <span className="text-4xl opacity-20">
                                        {item.category === 'Pottery' ? '🏺' : item.category === 'Textile' ? '🧶' : '🎁'}
                                    </span>
                                    {item.sale_price && (
                                        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                                            {Math.round(((item.base_price - item.sale_price) / item.base_price) * 100)}% OFF
                                        </div>
                                    )}
                                </div>
                                <h3 className="font-bold text-lg mb-1 group-hover:text-primary truncate">{item.title}</h3>
                                <p className="text-xs text-gray-500 mb-2">by {item.store_name}</p>

                                <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-100">
                                    <div className="flex flex-col">
                                        {item.sale_price ? (
                                            <>
                                                <span className="text-xs text-gray-400 line-through">₹{item.base_price}</span>
                                                <span className="font-bold text-xl text-neutral-900">₹{item.sale_price}</span>
                                            </>
                                        ) : (
                                            <span className="font-bold text-xl text-neutral-900">₹{item.base_price}</span>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => handleAddToCart(item)}
                                        className="bg-primary hover:bg-accent text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm"
                                    >
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    {products.length === 0 && (
                        <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                            <p className="text-gray-500">No products found matching your criteria.</p>
                            <button onClick={() => { setSearchParams({}); }} className="mt-4 text-primary font-bold hover:underline">Clear Filters</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
