import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Home() {
    const [products, setProducts] = useState([]);
    const { addToCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // Fetching all (in real app, use specific endpoints for efficiency)
                const res = await axios.get('http://localhost:5000/shop/products');
                setProducts(res.data);
            } catch (err) {
                console.error(err);
            }
        }
        fetchProducts();
    }, []);

    const handleAddToCart = (product) => {
        if (!user) {
            navigate('/auth/login', { state: { from: '/' } });
            return;
        }
        addToCart(product);
    };

    // Helper to render product card (Reusing style from Shop)
    const ProductCard = ({ item }) => (
        <div key={item.id} className="min-w-[280px] md:min-w-[300px] bg-white p-4 rounded-xl shadow-md border border-transparent hover:border-primary transition-all flex flex-col group snap-start">
            <div className="bg-gray-100 h-48 rounded-lg mb-4 flex items-center justify-center text-gray-400 relative overflow-hidden">
                <span className="text-4xl opacity-20">
                    {item.category === 'Pottery' ? '🏺' : item.category === 'Textile' ? '🧶' : '🎁'}
                </span>
                {item.sale_price && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                        {Math.round(((item.base_price - item.sale_price) / item.base_price) * 100)}% OFF
                    </div>
                )}
            </div>
            <Link to={`/shop?search=${item.title}`} className="font-bold text-lg mb-1 group-hover:text-primary truncate block">
                {item.title}
            </Link>
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
                    Add
                </button>
            </div>
        </div>
    );

    const potteryItems = products.filter(p => p.category === 'Pottery').slice(0, 5);
    const textileItems = products.filter(p => p.category === 'Textile').slice(0, 5);
    // "Trending" - currently just picking items with sale price or just random first few
    const trendingItems = products.filter(p => p.sale_price).slice(0, 5);

    return (
        <div className="min-h-screen bg-background text-zinc-900 pb-20">
            {/* Hero Section */}
            <section className="relative h-[60vh] md:h-[80vh] flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1596232074366-0428943f765e?ixlib=rb-4.0.3')] bg-no-repeat bg-cover bg-center">
                <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"></div>
                <div className="relative z-10 text-center text-white p-4 max-w-3xl">
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-7xl font-display font-bold mb-4 drop-shadow-lg"
                    >
                        Handcrafted Heritage
                    </motion.h1>
                    <p className="text-lg md:text-2xl mb-8 font-light drop-shadow-md text-gray-100">
                        Direct from rural artisans to your home. Verified on Blockchain.
                    </p>
                    <Link to="/shop" className="bg-primary hover:bg-accent text-white font-bold py-4 px-10 rounded-full transition-transform hover:scale-105 inline-block shadow-2xl">
                        Shop Now
                    </Link>
                </div>
            </section>

            {/* Categories Grid */}
            <section className="py-12 px-4 max-w-7xl mx-auto -mt-20 relative z-20">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {['Pottery', 'Textile', 'Woodwork', 'Jewelry'].map(cat => (
                        <Link key={cat} to={`/shop?category=${cat}`} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all text-center group border border-gray-100">
                            <h3 className="text-xl font-bold group-hover:text-primary">{cat}</h3>
                            <p className="text-xs text-gray-500 mt-1">Explore Collection &rarr;</p>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Section: Trending / Deals */}
            {trendingItems.length > 0 && (
                <section className="py-12 px-4 max-w-7xl mx-auto">
                    <div className="flex justify-between items-end mb-6">
                        <h2 className="text-3xl font-display font-bold text-secondary">🔥 Hot Deals (Trending)</h2>
                        <Link to="/shop" className="text-primary font-bold hover:underline">See all deals</Link>
                    </div>
                    <div className="flex overflow-x-auto gap-6 pb-4 scrollbar-hide snap-x">
                        {trendingItems.map(item => <ProductCard key={item.id} item={item} />)}
                    </div>
                </section>
            )}

            {/* Feature Banner */}
            <section className="py-16 bg-neutral-900 text-white my-12">
                <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center gap-12">
                    <div className="flex-1">
                        <h2 className="text-4xl font-bold mb-4 font-display">Crafted with Soul,<br />Verified by Tech.</h2>
                        <p className="text-gray-400 text-lg mb-6">
                            Every product on VARNA comes with a digital passport on the Polygon blockchain, ensuring 100% authenticity and fair wages for the maker.
                        </p>
                        <div className="flex gap-4">
                            <div className="text-center">
                                <span className="block text-3xl font-bold text-primary">100%</span>
                                <span className="text-sm text-gray-400">Handmade</span>
                            </div>
                            <div className="h-12 w-px bg-gray-700"></div>
                            <div className="text-center">
                                <span className="block text-3xl font-bold text-primary">0%</span>
                                <span className="text-sm text-gray-400">Middlemen</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 bg-surface/10 p-8 rounded-2xl border border-white/10">
                        <div className="text-center">
                            <div className="text-6xl mb-4">🔗</div>
                            <h3 className="text-xl font-bold">Polygon Integration</h3>
                            <p className="text-gray-400 mt-2 text-sm">Scan the QR code on your product to see its journey from the village to your hands.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section: Pottery */}
            <section className="py-12 px-4 max-w-7xl mx-auto">
                <div className="flex justify-between items-end mb-6">
                    <h2 className="text-3xl font-display font-bold text-secondary">🏺 Exquisite Pottery</h2>
                    <Link to="/shop?category=Pottery" className="text-primary font-bold hover:underline">View all</Link>
                </div>
                <div className="flex overflow-x-auto gap-6 pb-4 scrollbar-hide snap-x">
                    {potteryItems.map(item => <ProductCard key={item.id} item={item} />)}
                    {potteryItems.length === 0 && <p className="text-gray-500">New stock coming soon.</p>}
                </div>
            </section>

            {/* Section: Textiles */}
            <section className="py-12 px-4 max-w-7xl mx-auto">
                <div className="flex justify-between items-end mb-6">
                    <h2 className="text-3xl font-display font-bold text-secondary">🧶 Authentic Textiles</h2>
                    <Link to="/shop?category=Textile" className="text-primary font-bold hover:underline">View all</Link>
                </div>
                <div className="flex overflow-x-auto gap-6 pb-4 scrollbar-hide snap-x">
                    {textileItems.map(item => <ProductCard key={item.id} item={item} />)}
                    {textileItems.length === 0 && <p className="text-gray-500">New stock coming soon.</p>}
                </div>
            </section>
        </div>
    );
}
