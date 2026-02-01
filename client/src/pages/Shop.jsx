import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Shop() {
    const [products, setProducts] = useState([]);
    const [searchParams, setSearchParams] = useSearchParams();
    const { addToCart, cartItems, updateQuantity, removeFromCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    const category = searchParams.get('category') || '';
    const search = searchParams.get('search') || '';

    useEffect(() => {
        fetchProducts();
    }, [category, search]);

    const fetchProducts = async () => {
        try {
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

    const handleAddToCart = (e, product) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) {
            navigate('/auth/login', { state: { from: '/shop' } });
            return;
        }
        addToCart(product);
    };

    const handleUpdateQty = (e, product, qty) => {
        e.preventDefault();
        e.stopPropagation();
        if (qty < 1) removeFromCart(product.id);
        else updateQuantity(product.id, qty);
    }

    return (
        <div className="bg-white min-h-screen py-16">
            <div className="max-w-7xl mx-auto px-8">
                {/* Search / Filter Summary */}
                <div className="mb-16 flex flex-col md:flex-row justify-between items-baseline gap-4 border-b-2 border-black pb-8">
                    <div>
                        <h1 className="text-5xl font-black italic uppercase tracking-tighter">
                            {category ? category : 'Catalogue'}
                        </h1>
                        {search && (
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mt-2 italic">
                                Search Result for: <span className="text-black">"{search}"</span>
                            </p>
                        )}
                    </div>
                    <div className="flex gap-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">Showing {products.length} Items</span>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-16">
                    {/* Sidebar Filters */}
                    <aside className="w-full md:w-48 flex-shrink-0">
                        <div className="sticky top-24 space-y-12">
                            <div>
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-6 italic">Categories</h3>
                                <ul className="space-y-4">
                                    <li>
                                        <button
                                            onClick={() => handleCategoryChange('')}
                                            className={`text-xs font-black uppercase tracking-widest transition-all ${!category ? 'text-black border-l-4 border-primary pl-3' : 'text-gray-400 hover:text-black hover:pl-2'}`}
                                        >
                                            All Masterpieces
                                        </button>
                                    </li>
                                    {['Pottery', 'Textile', 'Woodwork', 'Jewelry', 'Decor'].map(cat => (
                                        <li key={cat}>
                                            <button
                                                onClick={() => handleCategoryChange(cat)}
                                                className={`text-xs font-black uppercase tracking-widest transition-all ${category === cat ? 'text-black border-l-4 border-primary pl-3' : 'text-gray-400 hover:text-black hover:pl-2'}`}
                                            >
                                                {cat}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="hidden md:block">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-6 italic">Curation</h3>
                                <p className="text-[9px] font-bold text-gray-400 leading-loose">
                                    Every piece in our shop is hand-verified and minted on the blockchain for absolute authenticity.
                                </p>
                            </div>
                        </div>
                    </aside>

                    {/* Product Grid */}
                    <div className="flex-grow">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-16 gap-x-8">
                            {products.map(item => {
                                const cartItem = cartItems.find(c => c.id === item.id);
                                const qty = cartItem ? cartItem.qty : 0;

                                return (
                                    <Link to={`/product/${item.id}`} key={item.id} className="group relative flex flex-col">
                                        <div className="aspect-[3/4] bg-gray-50 mb-6 relative overflow-hidden group-hover:shadow-[0_20px_40px_-15px_rgba(255,210,0,0.3)] transition-all duration-500">
                                            {item.image_url ? (
                                                <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-5xl font-black italic text-gray-100">VARNA</div>
                                            )}

                                            {item.sale_price && (
                                                <div className="absolute top-0 right-0 bg-primary text-black text-[10px] font-black uppercase px-4 py-2 italic shadow-[4px_4px_0_0_rgba(0,0,0,1)] m-4">
                                                    -{Math.round(((item.base_price - item.sale_price) / item.base_price) * 100)}%
                                                </div>
                                            )}

                                            <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                                                {qty === 0 ? (
                                                    <button
                                                        onClick={(e) => handleAddToCart(e, item)}
                                                        className="w-full bg-black text-white text-[10px] font-black uppercase tracking-widest py-4 hover:bg-primary hover:text-black transition-all"
                                                    >
                                                        Quick Add +
                                                    </button>
                                                ) : (
                                                    <div className="flex items-center bg-black text-white py-3 px-4 justify-between" onClick={(e) => e.preventDefault()}>
                                                        <button onClick={(e) => handleUpdateQty(e, item, qty - 1)} className="text-xl font-black hover:text-primary transition-colors pr-2">-</button>
                                                        <span className="text-xs font-black tracking-widest italic">{qty} IN CART</span>
                                                        <button onClick={(e) => handleUpdateQty(e, item, qty + 1)} className="text-xl font-black hover:text-primary transition-colors pl-2">+</button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <h3 className="font-black italic text-sm uppercase tracking-tight text-black group-hover:text-primary transition-colors truncate">{item.title}</h3>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">by {item.store_name}</p>

                                            <div className="flex items-baseline gap-3 pt-2">
                                                {item.sale_price ? (
                                                    <>
                                                        <span className="text-lg font-black italic text-black">₹{item.sale_price}</span>
                                                        <span className="text-[10px] text-gray-300 line-through font-bold italic">₹{item.base_price}</span>
                                                    </>
                                                ) : (
                                                    <span className="text-lg font-black italic text-black">₹{item.base_price}</span>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>

                        {products.length === 0 && (
                            <div className="text-center py-40 border-l border-r border-gray-100 italic">
                                <h3 className="text-4xl font-black uppercase tracking-tighter text-gray-100 mb-6 italic select-none">Void Catalogue</h3>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-8">No masterpieces found in this category.</p>
                                <button onClick={() => { setSearchParams({}); }} className="text-xs font-black uppercase tracking-widest border-b-4 border-primary hover:text-primary transition-colors pb-1">Reset Filters</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
