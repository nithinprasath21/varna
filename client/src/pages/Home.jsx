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
                const res = await axios.get('http://localhost:5000/shop/products');
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
                    {linkText || 'EXPLORE COLLECTION'} <ArrowRight size={12} strokeWidth={3} />
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
                                <div className="absolute top-0 right-0 bg-primary text-black text-[10px] font-black px-4 py-2 uppercase italic">PRICE ADJUSTED</div>
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
            {/* Hero Section - High Fashion Branding */}
            <div className="relative h-screen bg-black overflow-hidden group">
                <img
                    src="https://images.unsplash.com/photo-1596232074366-0428943f765e?ixlib=rb-4.0.3"
                    alt="Hero"
                    className="w-full h-full object-cover opacity-50 grayscale group-hover:grayscale-0 transition-all duration-[2s]"
                />
                <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-12">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 1 }}
                    >
                        <h1 className="text-white text-7xl md:text-[12rem] font-black italic leading-[0.8] tracking-tighter mb-8">
                            VARNA<br /><span className="text-primary not-italic">STUDIO.</span>
                        </h1>
                        <p className="text-white text-[10px] md:text-sm tracking-[0.6em] uppercase mb-12 max-w-2xl mx-auto italic font-black">
                            AUTHENTIC HUMAN CRAFT • BLOCKCHAIN VERIFIED • ORIGIN DIRECTED
                        </p>
                        <div className="flex flex-col md:flex-row gap-6 justify-center">
                            <button onClick={() => navigate('/shop')} className="bg-primary text-black px-16 py-6 text-xs font-black uppercase tracking-[0.3em] hover:bg-white transition-all italic border-4 border-primary">
                                EXPLORE COLLECTION
                            </button>
                            <button onClick={() => navigate('/about')} className="bg-transparent text-white px-16 py-6 text-xs font-black uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all italic border-4 border-white">
                                THE PROTOCOL
                            </button>
                        </div>
                    </motion.div>
                </div>

                {/* Scroll Indicator */}
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

            <div className="max-w-7xl mx-auto px-8 py-40">
                {/* Intro Section */}
                <div className="mb-40 max-w-3xl">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-primary mb-6 italic">AESTHETIC ARCHIVE I.</h3>
                    <p className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-black leading-tight border-b-8 border-primary pb-8 mb-12">
                        WE DEFINE THE NEW FRONTIER OF ANCIENT CRAFT.
                    </p>
                    <p className="text-lg font-black uppercase tracking-widest text-gray-400 italic leading-relaxed">
                        DIRECT ACCESS TO MASTER ARTISANS. REMOVING INTERMEDIARIES. <br />
                        ESTABLISHING THE GOLD STANDARD OF AUTHENTICITY.
                    </p>
                </div>

                {/* Visual Categories Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-1 mb-40 border-2 border-black bg-black">
                    <GatewayCard
                        title="THE CERAMIC EDIT"
                        image="https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800"
                        link="/shop?category=Pottery"
                        linkText="POTTERY PROTOCOL"
                    />
                    <GatewayCard
                        title="WEAVING STORIES"
                        image="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRFp1YEn3dKfspZAnasrR_jjeRzXfdT24NPHg&s"
                        link="/shop?category=Textile"
                        linkText="TEXTILE LEDGER"
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
                                    REGISTER NOW
                                </button>
                            ) : (
                                <div className="text-2xl font-black italic border-b-2 border-black pb-2">
                                    WELCOME, {user.full_name?.toUpperCase().split(' ')[0]}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Collections */}
                <ProductRow title="Studio Pottery" items={potteryItems} />

                {/* Mid Promo Banner */}
                <motion.div
                    whileInView={{ x: [100, 0], opacity: [0, 1] }}
                    className="bg-black p-20 my-40 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-full h-full opacity-20 flex items-center justify-center pointer-events-none">
                        <span className="text-[30rem] font-black italic tracking-tighter text-white select-none">VARNA</span>
                    </div>

                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                        <div className="text-white max-w-xl">
                            <h2 className="text-6xl md:text-7xl font-black italic tracking-tighter mb-4 leading-none lowercase italic">support <span className="text-primary NOT-ITALIC not-italic uppercase">living</span> legends.</h2>
                            <p className="text-xs font-black tracking-[0.4em] uppercase text-gray-400 italic">100% OF PROFITS REACH THE CREATORS IN REAL-TIME.</p>
                        </div>
                        <button onClick={() => navigate('/shop')} className="bg-primary text-black px-16 py-6 text-xs font-black uppercase tracking-[0.4em] hover:bg-white transition-all italic shadow-[10px_10px_0px_0px_rgba(255,255,255,1)]">
                            THE IMPACT MAP
                        </button>
                    </div>
                </motion.div>

                <ProductRow title="Textile Archives" items={textileItems} />

                {/* Newsletter / Custom Footer Look */}
                <div className="mt-60 text-center space-y-12">
                    <div className="flex justify-center gap-4">
                        <Disc size={24} className="text-primary animate-spin-slow" />
                        <Disc size={24} className="text-primary animate-spin-slow" />
                        <Disc size={24} className="text-primary animate-spin-slow" />
                    </div>
                    <div>
                        <h3 className="text-4xl font-black italic uppercase tracking-tighter mb-4 text-black italic leading-none">THE VARNA VERDICT.</h3>
                        <p className="text-[10px] text-gray-400 max-w-md mx-auto tracking-[0.5em] uppercase leading-relaxed font-black italic">
                            WEEKLY LOGS FROM THE STUDIO FLOOR. <br /> NO SPAM. ONLY AUTHENTICITY.
                        </p>
                    </div>
                    <div className="flex max-w-lg mx-auto overflow-hidden border-b-4 border-black pb-4 hover:border-primary transition-colors">
                        <input
                            type="text"
                            placeholder="OPERATOR EMAIL ADDRESS"
                            className="flex-grow bg-transparent border-none focus:ring-0 text-lg font-black uppercase tracking-widest placeholder:text-gray-100 italic"
                        />
                        <button className="text-lg font-black uppercase tracking-widest hover:text-primary transition-colors flex items-center gap-2 italic">
                            SUBSCRIBE <ArrowRight strokeWidth={4} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
