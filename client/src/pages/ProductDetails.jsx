import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Star, ShieldCheck, Truck, RotateCcw } from 'lucide-react';

export default function ProductDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart, cartItems, updateQuantity } = useCart();
    const { user } = useAuth();

    // State
    const [product, setProduct] = useState(null);
    const [selectedImage, setSelectedImage] = useState('');
    const [recommendations, setRecommendations] = useState([]);
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
        toast.success("Added to Cart");
    };

    const handleBuyNow = () => {
        addToCart(product);
        navigate('/cart');
    };

    if (loading) return <div className="min-h-screen bg-white flex items-center justify-center">Loading...</div>;
    if (!product) return <div className="min-h-screen bg-white flex items-center justify-center">Product Not Found</div>;

    const cartItem = cartItems.find(item => item.id === product.id);
    const qty = cartItem ? cartItem.qty : 0;
    const discountPercentage = product.sale_price ? Math.round(((product.base_price - product.sale_price) / product.base_price) * 100) : 0;

    return (
        <div className="min-h-screen bg-white pb-20">
            {/* Breadcrumb - Keeping it simple */}
            <div className="bg-gray-100 py-2 px-4 mb-4 text-xs text-gray-500">
                <Link to="/" className="hover:underline">Home</Link> &rsaquo;
                <Link to="/shop" className="hover:underline ml-1">Shop</Link> &rsaquo;
                <span className="ml-1 font-bold text-gray-700">{product.category}</span>
            </div>

            <div className="max-w-[1500px] mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Left Column: Images (Col 5) */}
                    <div className="lg:col-span-5 flex gap-4 sticky top-24 h-fit">
                        {/* Thumbnails (Vertical) */}
                        <div className="flex flex-col gap-2">
                            {/* Only showing main image repeatedly as placeholder for gallery support later */}
                            {[product.image_url, product.image_url, product.image_url].map((img, idx) => (
                                <div key={idx} onMouseEnter={() => setSelectedImage(img)} className={`w-12 h-16 border rounded cursor-pointer overflow-hidden ${selectedImage === img ? 'border-primary ring-2 ring-primary/50' : 'border-gray-200 hover:border-black'}`}>
                                    {img ? <img src={img} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-100"></div>}
                                </div>
                            ))}
                        </div>
                        {/* Main Image */}
                        <div className="flex-grow flex items-center justify-center bg-white border border-gray-100 rounded-lg p-4 h-[500px]">
                            {selectedImage ? (
                                <img src={selectedImage} alt={product.title} className="max-h-full max-w-full object-contain" />
                            ) : (
                                <span className="text-6xl opacity-10">📦</span>
                            )}
                        </div>
                    </div>

                    {/* Middle Column: Details (Col 4) */}
                    <div className="lg:col-span-4 space-y-4">
                        <h1 className="text-3xl font-medium text-gray-900 leading-tight">{product.title}</h1>

                        <div className="text-sm text-teal-700 hover:underline cursor-pointer">
                            Visit the {product.store_name} Store
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-gray-700">{product.average_rating || '0.0'}</span>
                            <div className="flex text-[#F7CA00]">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <Star key={star} size={16} fill={star <= Math.round(product.average_rating || 0) ? "currentColor" : "none"} stroke="currentColor" />
                                ))}
                            </div>
                            <span className="text-sm text-teal-700 hover:underline cursor-pointer">{product.review_count || 0} ratings</span>
                        </div>

                        <div className="border-t border-b border-gray-200 py-4 my-4">
                            {product.sale_price ? (
                                <div>
                                    <div className="flex items-start gap-2">
                                        <span className="text-red-600 text-2xl font-light">-{discountPercentage}%</span>
                                        <span className="text-3xl font-medium relative top-[-4px]">
                                            <sup className="text-sm font-normal">₹</sup>{product.sale_price}
                                        </span>
                                    </div>
                                    <p className="text-gray-500 text-xs mt-1">
                                        M.R.P.: <span className="line-through">₹{product.base_price}</span>
                                    </p>
                                </div>
                            ) : (
                                <span className="text-3xl font-medium">
                                    <sup className="text-sm font-normal">₹</sup>{product.base_price}
                                </span>
                            )}
                            <p className="text-sm text-gray-600 mt-2">Inclusive of all taxes</p>
                        </div>

                        {/* Offers / Badges */}
                        <div className="flex gap-4 mb-6 text-xs text-center">
                            <div className="w-24">
                                <div className="w-10 h-10 bg-gray-100 rounded-full mx-auto mb-2 flex items-center justify-center text-teal-700"><ShieldCheck size={20} /></div>
                                <span className="block text-teal-700">Polygon Verified</span>
                            </div>
                            <div className="w-24">
                                <div className="w-10 h-10 bg-gray-100 rounded-full mx-auto mb-2 flex items-center justify-center text-teal-700"><Truck size={20} /></div>
                                <span className="block text-teal-700">Free Delivery</span>
                            </div>
                            <div className="w-24">
                                <div className="w-10 h-10 bg-gray-100 rounded-full mx-auto mb-2 flex items-center justify-center text-teal-700"><RotateCcw size={20} /></div>
                                <span className="block text-teal-700">7 days Replacement</span>
                            </div>
                        </div>

                        <div className="py-4">
                            <h3 className="font-bold text-lg mb-2">About this item</h3>
                            <p className="text-sm text-gray-700 leading-relaxed max-h-60 overflow-y-auto">
                                {product.description}
                            </p>
                        </div>

                        {/* Technical Details Table */}
                        {product.technical_details && Object.keys(product.technical_details).length > 0 && (
                            <div className="py-4">
                                <h3 className="font-bold text-lg mb-4">Technical Details</h3>
                                <table className="w-full text-sm text-left text-gray-500 border-collapse">
                                    <tbody>
                                        {Object.entries(product.technical_details).map(([key, value]) => (
                                            <tr key={key} className="border-b border-gray-100">
                                                <th className="py-2 px-4 bg-gray-50 font-medium text-gray-700 w-1/3">{key}</th>
                                                <td className="py-2 px-4">{value}</td>
                                            </tr>
                                        ))}
                                        <tr className="border-b border-gray-100">
                                            <th className="py-2 px-4 bg-gray-50 font-medium text-gray-700">Category</th>
                                            <td className="py-2 px-4">{product.category}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Buy Box (Col 3) */}
                    <div className="lg:col-span-3">
                        <div className="border rounded-lg p-5 shadow-sm sticky top-24">
                            <div className="text-2xl font-bold mb-2">
                                <sup className="text-sm font-normal">₹</sup>{product.sale_price || product.base_price}
                            </div>
                            <div className="text-sm text-gray-600 mb-4">
                                FREE delivery <span className="font-bold text-black">Monday, 2 Jan</span>. Order within <span className="text-green-600">4 hrs 3 mins.</span>
                            </div>

                            <div className="mb-4">
                                <span className="text-lg text-green-700 font-medium">In stock</span>
                            </div>

                            <div className="text-sm mb-4">
                                <p className="mb-1">Sold by <span className="text-teal-700 hover:underline cursor-pointer">{product.store_name}</span> and fulfilled by VARNA.</p>
                            </div>

                            {/* Quantity & Buttons */}
                            <div className="space-y-3">
                                {qty > 0 && (
                                    <div className="flex items-center justify-between bg-gray-50 p-2 rounded mb-2">
                                        <span className="text-sm">In Cart:</span>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => updateQuantity(product.id, qty - 1)} className="w-6 h-6 bg-gray-200 rounded font-bold">-</button>
                                            <span className="font-bold">{qty}</span>
                                            <button onClick={() => updateQuantity(product.id, qty + 1)} className="w-6 h-6 bg-gray-200 rounded font-bold">+</button>
                                        </div>
                                    </div>
                                )}

                                <button onClick={handleAddToCart} className="w-full bg-[#FFD814] hover:bg-[#F7CA00] text-black py-2 rounded-full text-sm font-medium shadow-sm border border-[#FCD200]">
                                    Add to Cart
                                </button>
                                <button onClick={handleBuyNow} className="w-full bg-[#FFA41C] hover:bg-[#FA8900] text-black py-2 rounded-full text-sm font-medium shadow-sm border border-[#FF8F00]">
                                    Buy Now
                                </button>
                            </div>

                            <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                                <ShieldCheck size={16} />
                                <span>Secure transaction</span>
                            </div>
                        </div>
                    </div>
                </div>

                <hr className="my-8 border-gray-200" />

                {/* Reviews Section */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-8">
                    <div className="lg:col-span-4">
                        <h2 className="text-2xl font-bold mb-4">Customer Reviews</h2>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="flex text-[#F7CA00]">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <Star key={star} size={20} fill={star <= Math.round(product.average_rating || 0) ? "currentColor" : "none"} stroke="currentColor" />
                                ))}
                            </div>
                            <span className="text-lg font-medium">{product.average_rating} out of 5</span>
                        </div>
                        <p className="text-gray-500 text-sm mb-6">{product.review_count} global ratings</p>

                        {/* Mock Rating Bars */}
                        {[5, 4, 3, 2, 1].map(num => (
                            <div key={num} className="flex items-center gap-2 mb-2 text-sm hover:text-primary cursor-pointer">
                                <span className="w-3">{num} star</span>
                                <div className="flex-grow h-5 bg-gray-100 rounded overflow-hidden border border-gray-200 shadow-inner">
                                    {/* Random width for effect */}
                                    <div className="bg-[#FFA41C] h-full" style={{ width: `${num === 5 ? 70 : num === 4 ? 20 : 5}%` }}></div>
                                </div>
                                <span className="w-8 text-right text-gray-500">{num === 5 ? '70%' : num === 4 ? '20%' : '5%'}</span>
                            </div>
                        ))}

                        <div className="mt-8 border-t pt-8">
                            <h3 className="font-bold text-lg mb-2">Review this product</h3>
                            <p className="text-sm text-gray-600 mb-4">Share your thoughts with other customers.</p>

                            {!showReviewForm ? (
                                <button
                                    onClick={() => user ? setShowReviewForm(true) : navigate('/auth/login')}
                                    className="w-full border border-gray-300 py-2 rounded shadow-sm text-sm font-medium hover:bg-gray-50"
                                >
                                    Write a product review
                                </button>
                            ) : (
                                <form onSubmit={handleSubmitReview} className="bg-gray-50 p-4 rounded-md border border-gray-200">
                                    <div className="mb-4">
                                        <label className="block text-sm font-bold mb-1">Overall rating</label>
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <button type="button" key={star} onClick={() => setReviewRating(star)}>
                                                    <Star size={24} fill={star <= reviewRating ? "#F7CA00" : "none"} stroke={star <= reviewRating ? "#F7CA00" : "#ccc"} />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-sm font-bold mb-1">Add a headline</label>
                                        <input
                                            type="text"
                                            className="w-full border border-gray-300 rounded p-2 text-sm"
                                            placeholder="What's most important to know?"
                                            value={reviewTitle}
                                            onChange={e => setReviewTitle(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-sm font-bold mb-1">Add a written review</label>
                                        <textarea
                                            className="w-full border border-gray-300 rounded p-2 text-sm h-24"
                                            placeholder="What did you like or dislike?"
                                            value={reviewComment}
                                            onChange={e => setReviewComment(e.target.value)}
                                            required
                                        ></textarea>
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <button type="button" onClick={() => setShowReviewForm(false)} className="text-sm text-gray-600 hover:underline">Cancel</button>
                                        <button type="submit" className="bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] rounded px-4 py-1 text-sm font-medium shadow-sm">Submit</button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>

                    <div className="lg:col-span-8">
                        <h3 className="font-bold text-lg mb-4">Top reviews from India</h3>
                        {product.reviews && product.reviews.length > 0 ? (
                            product.reviews.map(review => (
                                <div key={review.id} className="mb-6 pb-6 border-b border-gray-100">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="p-1 bg-gray-200 rounded-full"><span className="text-xs">👤</span></div>
                                        <span className="text-sm font-medium">{review.user_name}</span>
                                    </div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="flex text-[#F7CA00]">
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <Star key={star} size={14} fill={star <= review.rating ? "currentColor" : "none"} stroke="currentColor" />
                                            ))}
                                        </div>
                                        <span className="font-bold text-sm">{review.title || 'Verified Purchase'}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 mb-2">Reviewed in India on {new Date(review.created_at).toLocaleDateString()}</p>
                                    <p className="text-sm text-gray-800 leading-relaxed mb-4">{review.comment}</p>
                                    <div className="flex items-center gap-4">
                                        <button className="text-xs text-gray-500 border px-4 py-1 rounded shadow-sm hover:bg-white">Helpful</button>
                                        <span className="text-xs text-gray-400">Report</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 italic">No reviews yet. Be the first to review!</p>
                        )}
                    </div>
                </div>

                {/* Recommendations */}
                {recommendations.length > 0 && (
                    <div className="my-12 pt-8 border-t border-gray-300">
                        <h2 className="text-2xl font-bold mb-6">Products related to this item</h2>
                        <div className="flex overflow-x-auto gap-6 pb-4 scrollbar-hide">
                            {recommendations.map(item => (
                                <Link to={`/product/${item.id}`} key={item.id} className="min-w-[200px] max-w-[200px] flex-shrink-0 group">
                                    <div className="bg-gray-100 h-40 mb-2 flex items-center justify-center overflow-hidden rounded-md border border-gray-100 group-hover:border-gray-300">
                                        {item.image_url ? (
                                            <img src={item.image_url} alt={item.title} className="w-full h-full object-contain mix-blend-multiply" />
                                        ) : (
                                            <span className="text-4xl opacity-20">📦</span>
                                        )}
                                    </div>
                                    <h3 className="text-sm font-medium text-teal-700 group-hover:text-red-700 hover:underline truncate">{item.title}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="flex text-[#F7CA00]">
                                            <Star size={12} fill="currentColor" stroke="none" />
                                            <Star size={12} fill="currentColor" stroke="none" />
                                            <Star size={12} fill="currentColor" stroke="none" />
                                            <Star size={12} fill="currentColor" stroke="none" />
                                            <Star size={12} stroke="currentColor" />
                                        </div>
                                        <span className="text-xs text-gray-500">239</span>
                                    </div>
                                    <div className="mt-1">
                                        <span className="text-red-700 font-medium">₹{item.sale_price || item.base_price}</span>
                                        {item.sale_price && <span className="text-xs text-gray-500 line-through ml-2">₹{item.base_price}</span>}
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
