import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronRight, Star, Disc } from 'lucide-react';

export default function Home() {
    const [products, setProducts] = useState([]);
    const { addToCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await axios.get(`${import.meta.env.API_URL}/shop/products`);
                setProducts(res.data);
            } catch (err) {
                console.error(err);
            }
        }
        fetchProducts();
    }, []);

    const GatewayCard = ({ title, image, link, linkText }) => (
        <div className="bg-white flex flex-col group cursor-pointer overflow-hidden border-2 border-transparent hover:border-black transition-all p-2" onClick={() => navigate(link)}>
            <div className="relative aspect-[3/4] overflow-hidden bg-gray-50 flex items-center justify-center border-2 border-black">
                <img src={image} alt={title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            <div className="py-6 px-4">
                <h2 className="text-xl font-black italic uppercase tracking-tighter text-black mb-2">{title}</h2>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 group-hover:text-primary transition-colors flex items-center gap-2 italic">
                    {linkText || 'SHOP NOW'} <ArrowRight size={12} strokeWidth={3} />
                </span>
            </div>
        </div>
    );

    const ProductRow = ({ title, items }) => (
        <div className="bg-white py-24 border-t-2 border-black">
            <div className="flex items-baseline justify-between mb-16 px-4">
                <div>
                    <h2 className="text-5xl font-black italic uppercase tracking-tighter text-black leading-none">{title}</h2>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic mt-2">Latest additions to the authenticated ledger</p>
                </div>
                <Link to="/shop" className="text-[10px] font-black uppercase tracking-[0.3em] border-b-4 border-primary pb-1 hover:bg-black hover:text-white transition-all px-2 italic">VIEW ALL RECORDS</Link>
            </div>
            <div className="flex overflow-x-auto gap-1 pb-10 scrollbar-hide">
                {items.map(item => (
                    <motion.div
                        whileHover={{ y: -10 }}
                        key={item.id}
                        className="min-w-[320px] max-w-[320px] flex-shrink-0 group cursor-pointer bg-white p-4 border-2 border-transparent hover:border-black transition-all"
                        onClick={() => navigate(`/product/${item.id}`)}
                    >
                        <div className="bg-gray-50 aspect-[3/4] mb-6 flex items-center justify-center overflow-hidden relative border-2 border-black">
                            {item.image_url ? (
                                <img src={item.image_url} alt={item.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000" />
                            ) : (
                                <Disc size={48} className="text-gray-200 animate-spin-slow" />
                            )}
                            {item.sale_price && (
                                <div className="absolute top-0 right-0 bg-primary text-black text-[10px] font-black px-4 py-2 uppercase italic">SALE</div>
                            )}
                        </div>
                        <div className="space-y-3">
                            <h3 className="text-lg font-black italic uppercase tracking-tighter text-black leading-tight group-hover:text-primary transition-colors">{item.title}</h3>
                            <div className="flex items-center gap-4">
                                <span className="text-xl font-black italic">₹{(item.sale_price || item.base_price).toLocaleString()}</span>
                                {item.sale_price && (
                                    <span className="text-xs text-gray-300 line-through italic font-bold">₹{item.base_price.toLocaleString()}</span>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );

    const potteryItems = products.filter(p => p.category === 'Pottery').slice(0, 5);
    const textileItems = products.filter(p => p.category === 'Textile').slice(0, 5);

    return (
        <div className="min-h-screen bg-white">
            <div className="relative h-screen bg-black overflow-hidden group">
                <img
                    src="https://www.poojn.in/wp-content/uploads/2025/06/Keralas-Cultural-Heritage-A-Festival-Journey.jpeg.jpg"
                    alt="Hero"
                    className="w-full h-full object-cover opacity-50 grayscale group-hover:grayscale-0 transition-all duration-[2s]"
                />
                <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-12">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 1 }}
                    >
                        <h1 className="text-white text-7xl md:text-9xl font-black italic leading-[0.8] tracking-tighter mb-8 mt-12">
                            VARNA<br /><span className="text-primary not-italic">STORE.</span>
                        </h1>
                        <p className="text-white text-[10px] md:text-sm tracking-[0.6em] uppercase mb-12 max-w-2xl mx-auto italic font-black">
                            100% AUTHENTIC HANDCRAFTED PRODUCTS DIRECTLY FROM ARTISANS
                        </p>
                        <div className="flex flex-col md:flex-row gap-6 justify-center">
                            <button onClick={() => navigate('/shop')} className="bg-primary text-black px-16 py-6 text-xs font-black uppercase tracking-[0.3em] hover:bg-white transition-all italic border-4 border-primary">
                                SHOP NOW
                            </button>
                            <button onClick={() => navigate('/about')} className="bg-transparent text-white px-16 py-6 text-xs font-black uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all italic border-4 border-white">
                                ABOUT US
                            </button>
                        </div>
                    </motion.div>
                </div>

                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4">
                    <span className="text-[10px] font-black text-white italic tracking-[0.5em] uppercase">SCROLL</span>
                    <div className="w-1 h-12 bg-white/20 relative overflow-hidden">
                        <motion.div
                            animate={{ y: [0, 48] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                            className="absolute top-0 left-0 w-full h-1/2 bg-primary"
                        />
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-8 py-12 md:py-20">
                <div className="mb-16 md:mb-24 bg-gray-50 border-2 border-black">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-0 items-center">
                        <div className="relative aspect-video overflow-hidden border-b-2 md:border-b-0 md:border-r-2 border-black bg-black">
                            <video 
                                autoPlay 
                                loop 
                                muted 
                                playsInline
                                className="w-full h-full object-cover"
                                src="https://img.indiahandmade.com/wysiwyg/about.webm" 
                            />
                        </div>
                        <div className="p-10 md:p-16 space-y-8 bg-white h-full flex flex-col justify-center">
                            <div>
                                <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-primary mb-4 italic">ABOUT VARNA</h3>
                                <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-black leading-tight">
                                    PRESERVING <br/> HERITAGE.
                                </h2>
                            </div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest leading-loose">
                                We are on a mission to bring authentic, handcrafted products directly from master artisans to the global market. 
                                By eliminating intermediaries, we ensure fair compensation for their craft and preserve the rich cultural heritage of rural India for generations to come.
                            </p>
                            <div>
                                <button onClick={() => navigate('/shop')} className="text-xs font-black uppercase tracking-[0.3em] bg-black text-white px-8 py-4 hover:bg-primary hover:text-black transition-colors italic border-2 border-black">
                                    SHOP HANDCRAFTED
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mb-12 md:mb-20 max-w-3xl">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-primary mb-6 italic">OUR SHOPS</h3>
                    <p className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-black leading-tight border-b-8 border-primary pb-8 mb-12">
                        DISCOVER BEAUTIFUL HANDCRAFTED PRODUCTS.
                    </p>
                    <p className="text-sm md:text-base font-black uppercase tracking-widest text-gray-400 italic leading-relaxed">
                        DIRECT LOGIN TO MASTER ARTISANS. REMOVING INTERMEDIARIES. <br />
                        ESTABLISHING THE GOLD STANDARD OF AUTHENTICITY.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-1 mb-16 md:mb-24 border-2 border-black bg-black">
                    <GatewayCard
                        title="POTTERY SHOP"
                        image="https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800"
                        link="/shop?category=Pottery"
                        linkText="POTTERY SHOP"
                    />
                    <GatewayCard
                        title="TEXTILE SHOP"
                        image="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRFp1YEn3dKfspZAnasrR_jjeRzXfdT24NPHg&s"
                        link="/shop?category=Textile"
                        linkText="TEXTILE SHOP"
                    />
                    <div className="bg-primary flex flex-col items-start justify-end p-10 text-black min-h-[500px] group relative overflow-hidden">
                        <Star className="absolute top-10 right-10 opacity-20 scale-[5]" size={100} strokeWidth={1} />
                        <div className="relative z-10 space-y-8">
                            <h2 className="text-5xl font-black italic uppercase tracking-tighter leading-none">JOIN THE <br />CLUB.</h2>
                            <p className="text-[10px] tracking-widest uppercase text-black font-black italic leading-loose">
                                EXCLUSIVE DROPS • MEMBER LOGS • EARLY REQUISITION
                            </p>
                            {!user ? (
                                <button onClick={() => navigate('/auth/register')} className="bg-black text-white px-10 py-5 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all italic">
                                    SIGN UP
                                </button>
                            ) : (
                                <div className="text-2xl font-black italic border-b-2 border-black pb-2">
                                    WELCOME, {user.full_name?.toUpperCase().split(' ')[0]}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <ProductRow title="Store Pottery" items={potteryItems} />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 my-16 md:my-24">
                    <motion.div whileHover={{ y: -5 }} className="bg-gray-50 border-2 border-black p-8 md:p-12 flex flex-col justify-between group overflow-hidden">
                        <div className="mb-12">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-primary mb-4 italic">THE ARTISAN PORTAL</h3>
                            <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-black leading-tight">
                                EMPOWERING <br/> CREATORS.
                            </h2>
                            <p className="mt-6 text-xs font-bold text-gray-500 uppercase tracking-widest leading-loose">
                                Our dedicated dashboard gives authenticated artisans full control over their inventory, pricing, and global logistics, ensuring they are the masters of their own commerce.
                            </p>
                            <button onClick={() => navigate('/auth/login')} className="mt-8 text-[10px] font-black uppercase tracking-[0.3em] bg-transparent text-black px-6 py-4 hover:bg-black hover:text-white transition-colors italic border-2 border-black inline-block w-max">
                                PORTAL LOGIN
                            </button>
                        </div>
                        <div className="relative aspect-[4/3] border-2 border-black overflow-hidden bg-black mt-auto">
                            <img src="https://images.pexels.com/photos/26762715/pexels-photo-26762715.jpeg" alt="Weaving" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105" />
                        </div>
                    </motion.div>

                    <motion.div whileHover={{ y: -5 }} className="bg-black text-white p-8 md:p-12 flex flex-col justify-between group overflow-hidden border-2 border-black">
                        <div className="relative aspect-[4/3] border-2 border-white overflow-hidden bg-white mb-12">
                            <img src="https://img.freepik.com/premium-vector/gold-brown-label-that-says-artisan-products_1090394-157916.jpg?semt=ais_hybrid&w=740&q=80" alt="Pottery Hands" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105" />
                        </div>
                        <div className="mt-auto">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-primary mb-4 italic">VERIFIED BY LEDGER</h3>
                            <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter leading-tight">
                                ABSOLUTE <br/> AUTHENTICITY.
                            </h2>
                            <p className="mt-6 text-xs font-bold text-gray-400 uppercase tracking-widest leading-loose">
                                Every artifact purchased comes with an immutable, auditable certificate of authenticity. Track its geographical origin, cultural significance, and the very hands that crafted it.
                            </p>
                        </div>
                    </motion.div>
                </div>

                <ProductRow title="Textile Archives" items={textileItems} />

                <div onClick={() => navigate('/about')} className="my-16 md:my-24 bg-primary p-12 md:p-20 text-center border-4 border-black relative overflow-hidden group hover:bg-black transition-colors duration-1000 cursor-pointer">
                    <div className="relative z-10">
                        <h3 className="text-xl md:text-3xl font-black italic uppercase tracking-tighter text-black group-hover:text-primary mb-6 transition-colors duration-1000">
                            WHAT WE DO AT VARNA.
                        </h3>
                        <p className="text-[10px] md:text-xs font-bold text-black/80 group-hover:text-gray-400 uppercase tracking-widest max-w-3xl mx-auto leading-loose transition-colors duration-1000">
                            LEDGER VERIFICATION • AI CULTURAL NOTES • DIRECT FULFILLMENT • NGO ONBOARDING • FAIR COMPENSATION
                        </p>
                        <button className="mt-10 text-[10px] font-black uppercase tracking-[0.3em] bg-black group-hover:bg-primary text-white group-hover:text-black px-10 py-5 transition-colors duration-1000 italic border-2 border-black">
                            EXPLORE OUR MISSION
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
