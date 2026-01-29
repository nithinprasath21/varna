import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ChevronRight } from 'lucide-react'; // Assuming lucide-react is installed, else use text

export default function Home() {
    const [products, setProducts] = useState([]);
    const { addToCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await axios.get('http://localhost:5000/shop/products');
                setProducts(res.data);
            } catch (err) {
                console.error(err);
            }
        }
        fetchProducts();
    }, []);

    const GatewayCard = ({ title, image, link, linkText }) => (
        <div className="bg-white flex flex-col p-4 z-20 h-[420px] cursor-pointer" onClick={() => navigate(link)}>
            <h2 className="text-xl font-bold text-neutral-900 mb-4">{title}</h2>
            <div className="flex-grow mb-4 overflow-hidden flex items-center justify-center">
                <img src={image} alt={title} className="max-h-full object-cover" />
            </div>
            <span className="text-xs text-teal-700 hover:text-red-700 hover:underline cursor-pointer">{linkText || 'See more'}</span>
        </div>
    );

    const ProductRow = ({ title, items }) => (
        <div className="bg-white p-6 mb-6">
            <div className="flex items-center gap-4 mb-4">
                <h2 className="text-xl font-bold text-neutral-900">{title}</h2>
                <Link to="/shop" className="text-sm text-teal-700 hover:underline">See all deals</Link>
            </div>
            <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide">
                {items.map(item => (
                    <div key={item.id} className="min-w-[200px] max-w-[200px] flex-shrink-0 cursor-pointer" onClick={() => navigate(`/product/${item.id}`)}>
                        <div className="bg-gray-100 h-48 mb-2 flex items-center justify-center overflow-hidden rounded-md">
                            {item.image_url ? (
                                <img src={item.image_url} alt={item.title} className="w-full h-full object-contain mix-blend-multiply" />
                            ) : (
                                <span className="text-4xl opacity-20">📦</span>
                            )}
                        </div>
                        <h3 className="text-sm font-medium hover:text-red-700 truncate">{item.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-lg font-medium">₹{(item.sale_price || item.base_price)}</span>
                            {item.sale_price && (
                                <span className="text-xs text-gray-500 line-through">M.R.P: ₹{item.base_price}</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const potteryItems = products.filter(p => p.category === 'Pottery').slice(0, 10);
    const textileItems = products.filter(p => p.category === 'Textile').slice(0, 10);
    const decorItems = products.filter(p => p.category === 'Decor').slice(0, 10);

    return (
        <div className="min-h-screen bg-gray-200 pb-10">
            {/* Hero Carousel (Simplified) */}
            <div className="relative w-full h-[600px] bg-gradient-to-t from-gray-200 to-transparent">
                <div className="absolute inset-0 overflow-hidden">
                    <img
                        src="https://images.unsplash.com/photo-1596232074366-0428943f765e?ixlib=rb-4.0.3"
                        alt="Hero"
                        className="w-full h-full object-cover object-center mask-image-gradient"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-gray-200 h-full"></div>
                </div>
            </div>

            {/* Gateway Cards Grid - Overlaps Hero */}
            <div className="max-w-[1500px] mx-auto px-4 -mt-80 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    <GatewayCard
                        title="Revamp your home with Decor"
                        image="https://images.unsplash.com/photo-1616486338812-3dadae4b4f9d?w=500"
                        link="/shop?category=Decor"
                        linkText="Explore Home Decor"
                    />
                    <GatewayCard
                        title="Handcrafted Pottery"
                        image="https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=500"
                        link="/shop?category=Pottery"
                        linkText="Shop Pottery"
                    />
                    <GatewayCard
                        title="Authentic Textiles"
                        image="https://images.unsplash.com/photo-1528574698133-0c1a76313d50?w=500"
                        link="/shop?category=Textile"
                        linkText="See all textiles"
                    />
                    <div className="bg-white flex flex-col p-6 z-20 h-[420px] justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-neutral-900 mb-4">Sign in for the best experience</h2>
                            {!user ? (
                                <button onClick={() => navigate('/auth/login')} className="w-full bg-[#FFD814] hover:bg-[#F7CA00] text-black font-medium py-2 rounded-md shadow-sm border border-[#FCD200]">
                                    Sign in securely
                                </button>
                            ) : (
                                <div className="text-center py-4 bg-gray-50 rounded">
                                    <p>Welcome back, {user.full_name}!</p>
                                </div>
                            )}
                        </div>
                        <img src="https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=500" alt="Promo" className="h-40 object-cover mt-4" />
                    </div>
                </div>

                {/* Horizontal Product Rows */}
                <ProductRow title="Best Sellers in Pottery & Ceramics" items={potteryItems} />
                <ProductRow title="Traditional Textiles from Artisans" items={textileItems} />
                <ProductRow title="Unique Home Decor" items={decorItems} />

                {/* Bottom Banner */}
                <div className="bg-white p-8 mt-8 text-center border border-gray-200">
                    <h3 className="text-xl font-bold mb-2">See personalized recommendations</h3>
                    {!user ? (
                        <button onClick={() => navigate('/auth/login')} className="bg-gradient-to-b from-[#FFD814] to-[#F7CA00] border border-[#FCD200] px-20 py-1.5 rounded-md font-medium text-sm shadow-sm hover:shadow-md">
                            Sign in
                        </button>
                    ) : (
                        <span className="text-sm text-gray-500">Based on your browsing history</span>
                    )}
                    <p className="text-xs text-gray-500 mt-2">New customer? <Link to="/auth/register" className="text-teal-700 hover:underline">Start here.</Link></p>
                </div>
            </div>
        </div>
    );
}
