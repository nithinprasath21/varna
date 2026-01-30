import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Star, ShieldCheck, Truck, RotateCcw, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProductDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart, cartItems, updateQuantity } = useCart();
    const { user } = useAuth();

    // State
    const [product, setProduct] = useState(null);
    const [selectedImage, setSelectedImage] = useState('');
    const [recommendations, setRecommendations] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    // Review Form State
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewTitle, setReviewTitle] = useState('');
    const [reviewComment, setReviewComment] = useState('');

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (!user) {
            toast.error("Please login to review");
            navigate('/auth/login');
            return;
        }
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/reviews', {
                product_id: product.id,
                rating: reviewRating,
                title: reviewTitle,
                comment: reviewComment
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Review submitted!");
            setShowReviewForm(false);
            setReviewTitle('');
            setReviewComment('');
            fetchProductDetails(); // Refresh reviews
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Failed to submit review");
        }
    };

    useEffect(() => {
        fetchProductDetails();
    }, [id]);

    const fetchProductDetails = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`http://localhost:5000/shop/products/${id}`);
            setProduct(res.data);
            setSelectedImage(res.data.image_url);
            fetchRecommendations(res.data.category, res.data.id);

            // Fetch all reviews
            const reviewsRes = await axios.get(`http://localhost:5000/reviews/${id}`);
            setReviews(reviewsRes.data);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load product");
        } finally {
            setLoading(false);
        }
    };

    const fetchRecommendations = async (category, currentId) => {
        try {
            const res = await axios.get(`http://localhost:5000/shop/recommendations?category=${category}&excludeId=${currentId}`);
            setRecommendations(res.data);
        } catch (err) {
            console.error("Failed recommendations", err);
        }
    };

    const handleAddToCart = () => {
        addToCart(product);
        toast.success("Added to Studio Cart");
    };

    const handleBuyNow = () => {
        addToCart(product);
        navigate('/cart');
    };

    if (loading) return <div className="min-h-screen bg-white flex items-center justify-center font-black italic text-4xl uppercase tracking-tighter">Acquiring Essence...</div>;
    if (!product) return <div className="min-h-screen bg-white flex items-center justify-center font-black italic text-4xl uppercase tracking-tighter text-red-600">Product Lost in Void</div>;

    const cartItem = cartItems.find(item => item.id === product.id);
    const qty = cartItem ? cartItem.qty : 0;
    const discountPercentage = product.sale_price ? Math.round(((product.base_price - product.sale_price) / product.base_price) * 100) : 0;

    return (
        <div className="min-h-screen bg-white pb-40">
            {/* Header / Breadcrumb */}
            <div className="bg-white border-b border-gray-100 py-6 mb-12">
                <div className="max-w-[1500px] mx-auto px-8 flex justify-between items-center">
                    <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-gray-400">
                        <Link to="/" className="hover:text-black transition-colors italic">Home</Link>
                        <span>/</span>
                        <Link to="/shop" className="hover:text-black transition-colors italic">Collection</Link>
                        <span>/</span>
                        <span className="text-black italic">{product.title}</span>
                    </div>
                </div>
            </div>

            <div className="max-w-[1500px] mx-auto px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">

                    {/* Left Column: Visuals (Col 7) */}
                    <div className="lg:col-span-7 space-y-8">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="aspect-[4/5] bg-gray-50 overflow-hidden relative border-2 border-black/5"
                        >
                            {selectedImage ? (
                                <img src={selectedImage} alt={product.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-8xl font-black italic text-gray-100">VARNA</div>
                            )}

                            {product.is_premium && (
                                <div className="absolute top-8 left-8 bg-black text-white px-6 py-3 font-black italic text-xs tracking-widest uppercase shadow-[6px_6px_0px_0px_rgba(255,210,0,1)]">
                                    [BLOCKCHAIN CERTIFIED GEN-1]
                                </div>
                            )}
                        </motion.div>

                        <div className="grid grid-cols-4 gap-4">
                            {[product.image_url, product.image_url, product.image_url].map((img, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => setSelectedImage(img)}
                                    className={`aspect-square cursor-pointer border-4 transition-all ${selectedImage === img ? 'border-primary' : 'border-transparent grayscale hover:grayscale-0'}`}
                                >
                                    {img && <img src={img} className="w-full h-full object-cover" />}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column: Essentials (Col 5) */}
                    <div className="lg:col-span-5 space-y-12 h-fit sticky top-24">
                        <div className="space-y-4">
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary bg-black px-4 py-2 inline-block italic">{product.category}</span>
                            <h1 className="text-6xl font-black italic uppercase tracking-tighter leading-[0.9] text-black">{product.title}</h1>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 italic pt-2">Released by {product.store_name} Studio</p>
                        </div>

                        <div className="flex items-center gap-6 py-6 border-y border-gray-100">
                            <div className="flex items-center gap-2">
                                <span className="text-lg font-black italic">{product.average_rating || '5.0'}</span>
                                <div className="flex text-primary">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <Star key={star} size={16} fill={star <= Math.round(product.average_rating || 5) ? "currentColor" : "none"} stroke="currentColor" strokeWidth={3} />
                                    ))}
                                </div>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">Reviewed by {product.review_count || 0} Citizens</span>
                        </div>

                        <div className="space-y-4">
                            {product.sale_price ? (
                                <div className="flex items-baseline gap-6">
                                    <span className="text-5xl font-black italic text-black">₹{product.sale_price}</span>
                                    <span className="text-xl text-gray-300 line-through italic font-bold">₹{product.base_price}</span>
                                    <span className="text-[10px] font-black uppercase bg-primary px-3 py-1 italic shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">-{discountPercentage}% VALUE OFF</span>
                                </div>
                            ) : (
                                <span className="text-5xl font-black italic text-black">₹{product.base_price}</span>
                            )}
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">Inclusive of all logistics & digital minting fees</p>
                        </div>

                        <div className="grid grid-cols-1 gap-4 pt-4">
                            <button
                                onClick={handleBuyNow}
                                className="w-full bg-black text-white py-6 flex items-center justify-between px-10 hover:bg-primary hover:text-black transition-all group shadow-[12px_12px_0px_0px_rgba(255,210,0,1)]"
                            >
                                <span className="text-[12px] font-black uppercase tracking-[0.3em] italic">Immediate Acquisition</span>
                                <ArrowRight className="group-hover:translate-x-2 transition-transform" strokeWidth={3} />
                            </button>
                            <button
                                onClick={handleAddToCart}
                                className="w-full border-4 border-black py-6 text-[12px] font-black uppercase tracking-[0.3em] italic hover:bg-black hover:text-white transition-all"
                            >
                                {qty > 0 ? `In Studio Cart (${qty})` : "Add to Repository"}
                            </button>
                        </div>

                        <div className="grid grid-cols-3 gap-8 pt-10">
                            {[
                                { icon: ShieldCheck, label: "POLY AUTH" },
                                { icon: Truck, label: "VELO SHIP" },
                                { icon: RotateCcw, label: "7D PURGE" }
                            ].map((item, idx) => (
                                <div key={idx} className="flex flex-col items-center gap-3 border-r border-gray-100 last:border-none">
                                    <div className="w-12 h-12 bg-gray-50 flex items-center justify-center text-black border border-gray-200">
                                        <item.icon size={20} strokeWidth={2.5} />
                                    </div>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 italic">{item.label}</span>
                                </div>
                            ))}
                        </div>

                        <div className="pt-10 space-y-6">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 italic">Product Narrative</h3>
                            <p className="text-sm font-medium text-black leading-relaxed italic border-l-4 border-primary pl-6 py-2">
                                {product.description}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Reviews Section */}
                <div className="mt-40 border-t-8 border-black pt-20">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
                        <div className="lg:col-span-4 space-y-12">
                            <div>
                                <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-8 underline decoration-primary decoration-8 underline-offset-8">Public Records</h2>
                                <div className="flex items-center gap-4 mb-4">
                                    <span className="text-6xl font-black italic">{product.average_rating || "5.0"}</span>
                                    <div className="flex flex-col">
                                        <div className="flex text-primary">
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <Star key={star} size={20} fill={star <= Math.round(product.average_rating || 5) ? "currentColor" : "none"} stroke="currentColor" strokeWidth={3} />
                                            ))}
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-1">{product.review_count || 0} VERIFIED LOGS</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h3 className="text-[12px] font-black uppercase tracking-[0.3em] italic">Submit Your Feedback / ⚙️</h3>
                                {!showReviewForm ? (
                                    <button
                                        onClick={() => user ? setShowReviewForm(true) : navigate('/auth/login')}
                                        className="w-full bg-white border-2 border-black py-4 text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all italic"
                                    >
                                        Establish New Record
                                    </button>
                                ) : (
                                    <form onSubmit={handleSubmitReview} className="space-y-6 bg-gray-50 p-8 border-l-8 border-primary">
                                        <div>
                                            <label className="block text-[9px] font-black uppercase tracking-widest text-gray-500 mb-2">Rating Scale</label>
                                            <div className="flex gap-2">
                                                {[1, 2, 3, 4, 5].map(star => (
                                                    <button type="button" key={star} onClick={() => setReviewRating(star)} className="text-primary hover:scale-110 transition-transform">
                                                        <Star size={24} fill={star <= reviewRating ? "currentColor" : "none"} stroke="currentColor" strokeWidth={3} />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <input
                                                type="text"
                                                className="w-full bg-transparent border-b-2 border-gray-200 focus:border-black py-3 text-sm font-bold placeholder:text-gray-300 outline-none uppercase"
                                                placeholder="Headline / Summation"
                                                value={reviewTitle}
                                                onChange={e => setReviewTitle(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <textarea
                                                className="w-full bg-transparent border-b-2 border-gray-200 focus:border-black py-3 text-sm font-medium placeholder:text-gray-300 outline-none italic h-32"
                                                placeholder="Your technical analysis of this piece..."
                                                value={reviewComment}
                                                onChange={e => setReviewComment(e.target.value)}
                                                required
                                            ></textarea>
                                        </div>
                                        <div className="flex justify-between items-center pt-4">
                                            <button type="button" onClick={() => setShowReviewForm(false)} className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black italic">Abort</button>
                                            <button type="submit" className="bg-black text-white px-8 py-4 text-[10px] font-black uppercase tracking-widest italic hover:bg-primary hover:text-black transition-all">Submit Log</button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>

                        <div className="lg:col-span-8 space-y-16">
                            {reviews && reviews.length > 0 ? (
                                reviews.map(review => (
                                    <div key={review.id} className="relative pl-10">
                                        <div className="absolute left-0 top-0 w-1 h-full bg-gray-100" />
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-start">
                                                <div className="space-y-1">
                                                    <div className="flex text-primary mb-2">
                                                        {[1, 2, 3, 4, 5].map(star => (
                                                            <Star key={star} size={12} fill={star <= review.rating ? "currentColor" : "none"} stroke="currentColor" strokeWidth={3} />
                                                        ))}
                                                    </div>
                                                    <h4 className="text-lg font-black italic uppercase tracking-tight text-black">{review.title || 'Verified Transaction'}</h4>
                                                </div>
                                                <span className="text-[10px] font-black text-gray-300 uppercase italic tracking-widest">{new Date(review.created_at).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-sm font-medium text-gray-600 leading-relaxed italic pr-20">{review.comment}</p>
                                            <div className="flex items-center gap-4 pt-4">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-black">Citizen {review.user_name}</span>
                                                <span className="w-8 h-[2px] bg-primary" />
                                                <span className="text-[9px] font-black uppercase text-gray-300 italic tracking-[0.2em]">Authenticity Confirmed</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-20 text-center border-4 border-dashed border-gray-100 italic">
                                    <p className="text-[12px] font-black uppercase tracking-[0.4em] text-gray-200">Awaiting First Public Record</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Recommendations */}
                {recommendations.length > 0 && (
                    <div className="mt-40">
                        <div className="flex justify-between items-end mb-12 border-b-2 border-black pb-8">
                            <h2 className="text-4xl font-black italic uppercase tracking-tighter">Extended Collection</h2>
                            <Link to="/shop" className="text-[10px] font-black uppercase tracking-widest italic border-b-4 border-primary pb-1 hover:text-primary transition-colors">Manifest All</Link>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            {recommendations.map(item => (
                                <Link to={`/product/${item.id}`} key={item.id} className="group space-y-4">
                                    <div className="aspect-[3/4] bg-gray-50 overflow-hidden relative">
                                        {item.image_url ? (
                                            <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-4xl font-black italic text-gray-100">VARNA</div>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-xs font-black italic uppercase tracking-tight text-black group-hover:text-primary transition-colors truncate">{item.title}</h3>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-sm font-black italic">₹{item.sale_price || item.base_price}</span>
                                            {item.sale_price && <span className="text-[9px] text-gray-300 line-through font-bold italic">₹{item.base_price}</span>}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
