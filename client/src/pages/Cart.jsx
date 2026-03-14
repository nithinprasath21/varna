import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Trash2, Plus, Minus, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';

export default function Cart() {
    const { cartItems, removeFromCart, updateQuantity, total, clearCart } = useCart();
    const navigate = useNavigate();
    const [isCheckout, setIsCheckout] = useState(false);

    const [addresses, setLogistics] = useState([]);
    const [selectedLogistics, setSelectedLogistics] = useState(null);
    const [showAddLogistics, setShowAddLogistics] = useState(false);
    const [newLogistics, setNewLogistics] = useState({ full_name: '', street: '', city: '', state: '', pincode: '' });

    const [couponCode, setCouponCode] = useState('');
    const [discountAmount, setDiscountAmount] = useState(0);
    const [validatedCoupon, setValidatedCoupon] = useState(null);

    const [paymentMode, setPaymentMode] = useState('UPI');
    const [paymentDetails, setPaymentDetails] = useState({
        upiId: '',
        cardNumber: '',
        cardExpiry: '',
        cardCvv: '',
        bankName: ''
    });

    const fetchLogistics = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${import.meta.env.API_URL}/auth/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLogistics(res.data.addresses);
            const defaultAddr = res.data.addresses.find(a => a.is_default);
            if (defaultAddr) setSelectedLogistics(defaultAddr.id);
            else if (res.data.addresses.length > 0) setSelectedLogistics(res.data.addresses[0].id);
        } catch (err) {
            console.error("Auth fetch failed", err);
        }
    };

    const handleCheckout = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/auth/login', { state: { from: '/cart' } });
            return;
        }
        setIsCheckout(true);
        fetchLogistics();
    };

    const handleSaveLogistics = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${import.meta.env.API_URL}/auth/address`, { ...newLogistics, is_default: addresses.length === 0 }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLogistics([...addresses, res.data]);
            setSelectedLogistics(res.data.id);
            setShowAddLogistics(false);
            setNewLogistics({ full_name: '', street: '', city: '', state: '', pincode: '' });
        } catch (err) {
            toast.error('Failed to save address');
        }
    };

    const applyCoupon = async () => {
        if (!couponCode) return toast.error('Enter a token');

        try {
            const sellingPriceTotal = cartItems.reduce((acc, item) => acc + ((item.sale_price || item.base_price) * item.qty), 0);
            const token = localStorage.getItem('token');
            const res = await axios.post(`${import.meta.env.API_URL}/coupons/validate`, {
                code: couponCode.toUpperCase()
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const coupon = res.data.coupon || res.data; // Handle both direct result or nested
            const discount = Math.round(sellingPriceTotal * (coupon.discount_percentage / 100));
            setDiscountAmount(discount);
            setValidatedCoupon(coupon.code);
            toast.success(`Protocol Applied: ${coupon.discount_percentage}% OFF`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Token verification failed');
            setDiscountAmount(0);
            setValidatedCoupon(null);
        }
    };

    const validatePayment = () => {
        if (paymentMode === 'UPI' && !paymentDetails.upiId) {
            toast.error('Please enter UPI ID');
            return false;
        }
        if (paymentMode === 'Credit/Debit Card') {
            if (!paymentDetails.cardNumber || !paymentDetails.cardExpiry || !paymentDetails.cardCvv) {
                toast.error('Please enter complete card details');
                return false;
            }
        }
        if (paymentMode === 'Netbanking' && !paymentDetails.bankName) {
            toast.error('Please select a Bank');
            return false;
        }
        return true;
    };

    const confirmOrder = async () => {
        if (!selectedLogistics) return toast.error('Please select a delivery address');
        if (!validatePayment()) return;

        try {
            const token = localStorage.getItem('token');
            const finalAmount = Math.max(0, sellingPriceTotal - discountAmount);

            await axios.post(`${import.meta.env.API_URL}/orders`, {
                items: cartItems,
                address_id: selectedLogistics,
                payment_mode: paymentMode,
                total_amount: finalAmount,
                coupon_code: validatedCoupon
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast.success(`Order Placed Successfully!`);
            clearCart();
            navigate('/orders');
        } catch (err) {
            console.error(err);
            toast.error('Failed to place order');
        }
    };

    const sellingPriceTotal = cartItems.reduce((acc, item) => acc + ((item.sale_price || item.base_price) * item.qty), 0);
    const finalTotal = Math.max(0, sellingPriceTotal - discountAmount);

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8">
                <h2 className="text-6xl font-black italic uppercase tracking-tighter mb-8 blur-[1px] opacity-20 select-none">Empty Cart</h2>
                <button
                    onClick={() => navigate('/shop')}
                    className="group flex items-center gap-4 text-xs font-black uppercase tracking-widest border-b-4 border-primary pb-2 hover:translate-x-2 transition-transform"
                >
                    Shop Now <ArrowRight size={16} strokeWidth={3} />
                </button>
            </div>
        );
    }

    if (isCheckout) {
        return (
            <div className="min-h-screen bg-white py-20 px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-16 flex items-baseline justify-between border-b-2 border-black pb-8">
                        <h1 className="text-5xl font-black italic uppercase tracking-tighter">Settlement / <span className="text-primary italic">02</span></h1>
                        <button onClick={() => setIsCheckout(false)} className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2 hover:text-black transition-colors">
                            <ArrowLeft size={14} /> Back to Cart
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
                        <div className="lg:col-span-7 space-y-16">
                            <section>
                                <div className="flex justify-between items-baseline mb-8">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 italic">I. DELIVERY LOGISTICS</h3>
                                    <button onClick={() => setShowAddLogistics(!showAddLogistics)} className="text-[10px] font-black uppercase tracking-widest text-primary hover:bg-black px-4 py-1 transition-colors">
                                        {showAddLogistics ? 'CANCEL' : 'Add New Logistics'}
                                    </button>
                                </div>

                                {showAddLogistics && (
                                    <form onSubmit={handleSaveLogistics} className="bg-gray-50 p-8 border-l-8 border-primary space-y-6 mb-8">
                                        <input placeholder="RECEIPIENT NAME" className="w-full bg-transparent border-b-2 border-gray-200 focus:border-black py-3 text-sm font-black uppercase tracking-tight outline-none" value={newLogistics.full_name} onChange={e => setNewLogistics({ ...newLogistics, full_name: e.target.value })} required />
                                        <input placeholder="STREET LOGISTICS / STORE" className="w-full bg-transparent border-b-2 border-gray-200 focus:border-black py-3 text-sm font-bold uppercase tracking-tight outline-none" value={newLogistics.street} onChange={e => setNewLogistics({ ...newLogistics, street: e.target.value })} required />
                                        <div className="grid grid-cols-3 gap-8">
                                            <input placeholder="CITY" className="bg-transparent border-b-2 border-gray-200 focus:border-black py-3 text-sm font-bold uppercase tracking-tight outline-none" value={newLogistics.city} onChange={e => setNewLogistics({ ...newLogistics, city: e.target.value })} required />
                                            <input placeholder="STATE" className="bg-transparent border-b-2 border-gray-200 focus:border-black py-3 text-sm font-bold uppercase tracking-tight outline-none" value={newLogistics.state} onChange={e => setNewLogistics({ ...newLogistics, state: e.target.value })} required />
                                            <input placeholder="PINCODE" className="bg-transparent border-b-2 border-gray-200 focus:border-black py-3 text-sm font-bold uppercase tracking-tight outline-none" value={newLogistics.pincode} onChange={e => setNewLogistics({ ...newLogistics, pincode: e.target.value })} required />
                                        </div>
                                        <button className="bg-black text-white px-8 py-4 text-[10px] font-black uppercase tracking-widest italic hover:bg-primary hover:text-black transition-all">SAVE LOGISTICS</button>
                                    </form>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {addresses.map(addr => (
                                        <label key={addr.id} className={`block p-6 border-4 cursor-pointer transition-all relative ${selectedLogistics === addr.id ? 'border-black' : 'border-gray-50 hover:border-gray-100'}`}>
                                            <input type="radio" name="address" checked={selectedLogistics === addr.id} onChange={() => setSelectedLogistics(addr.id)} className="sr-only" />
                                            <div className="space-y-2">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">LOGISTICS {addr.id}</p>
                                                <p className="font-black italic uppercase text-lg">{addr.full_name}</p>
                                                <p className="text-xs font-bold text-gray-500 uppercase leading-loose">{addr.street}, {addr.city}, {addr.state} - {addr.pincode}</p>
                                            </div>
                                            {selectedLogistics === addr.id && (
                                                <div className="absolute top-4 right-4 bg-primary text-black p-1">
                                                    <ShieldCheck size={16} strokeWidth={3} />
                                                </div>
                                            )}
                                        </label>
                                    ))}
                                    {addresses.length === 0 && !showAddLogistics && <p className="text-[10px] font-black uppercase tracking-widest text-gray-300 italic">NO LOGISTICS FOUND</p>}
                                </div>
                            </section>

                            <section>
                                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 italic mb-8">II. PAYMENT METHOD</h3>
                                <div className="space-y-4">
                                    {[
                                        { id: 'UPI', label: 'UPI' },
                                        { id: 'Credit/Debit Card', label: 'CREDIT/DEBIT CARD' },
                                        { id: 'Netbanking', label: 'NETBANKING' },
                                        { id: 'Cash on Delivery', label: 'CASH ON DELIVERY' }
                                    ].map(mode => (
                                        <div key={mode.id} className={`border-4 transition-all ${paymentMode === mode.id ? 'border-black' : 'border-gray-50'}`}>
                                            <label className="flex items-center gap-6 p-6 cursor-pointer group">
                                                <div className={`w-4 h-4 rounded-none border-2 transition-all ${paymentMode === mode.id ? 'bg-primary border-black rotate-45 scale-125' : 'border-gray-200'}`} />
                                                <input type="radio" name="payment" value={mode.id} checked={paymentMode === mode.id} onChange={(e) => setPaymentMode(e.target.value)} className="sr-only" />
                                                <span className={`text-xs font-black uppercase tracking-widest ${paymentMode === mode.id ? 'text-black' : 'text-gray-300 group-hover:text-black'}`}>{mode.label}</span>
                                            </label>

                                            {paymentMode === mode.id && paymentMode === 'UPI' && (
                                                <div className="px-16 pb-8 space-y-4">
                                                    <input placeholder="ENTER UPI ID (E.G. CITIZEN@OKVARNA)" className="w-full bg-transparent border-b-2 border-black py-3 text-sm font-black uppercase tracking-tight outline-none" value={paymentDetails.upiId} onChange={e => setPaymentDetails({ ...paymentDetails, upiId: e.target.value })} />
                                                </div>
                                            )}

                                            {paymentMode === mode.id && paymentMode === 'Credit/Debit Card' && (
                                                <div className="px-16 pb-8 grid grid-cols-2 gap-8">
                                                    <input placeholder="CARD NUMBER" className="col-span-2 bg-transparent border-b-2 border-black py-3 text-sm font-black uppercase tracking-tight outline-none" value={paymentDetails.cardNumber} onChange={e => setPaymentDetails({ ...paymentDetails, cardNumber: e.target.value })} maxLength={16} />
                                                    <input placeholder="EXPIRY (MM/YY)" className="bg-transparent border-b-2 border-black py-3 text-sm font-black uppercase tracking-tight outline-none" value={paymentDetails.cardExpiry} onChange={e => setPaymentDetails({ ...paymentDetails, cardExpiry: e.target.value })} maxLength={5} />
                                                    <input type="password" placeholder="CVV" className="bg-transparent border-b-2 border-black py-3 text-sm font-black uppercase tracking-tight outline-none" value={paymentDetails.cardCvv} onChange={e => setPaymentDetails({ ...paymentDetails, cardCvv: e.target.value })} maxLength={3} />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>

                        <div className="lg:col-span-5 h-fit">
                            <div className="border-[6px] border-black p-10 space-y-8 sticky top-24">
                                <h3 className="text-2xl font-black italic uppercase tracking-tighter border-b-2 border-black pb-4">Order Summary</h3>

                                <div className="space-y-4 max-h-60 overflow-y-auto pr-4 scrollbar-hide">
                                    {cartItems.map(item => (
                                        <div key={item.id} className="flex justify-between items-baseline gap-4">
                                            <span className="text-[10px] font-black uppercase tracking-widest truncate flex-grow italic">{item.title} [x{item.qty}]</span>
                                            <span className="text-sm font-black italic">₹{(item.qty * (item.sale_price || item.base_price)).toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-8 border-t-2 border-black space-y-4">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 italic">Coupons</h4>
                                    <div className="flex gap-4">
                                        <input className="flex-grow bg-gray-50 border-2 border-transparent focus:border-black px-4 py-3 text-xs font-black uppercase outline-none" placeholder="ENTER COUPON CODE" value={couponCode} onChange={e => setCouponCode(e.target.value)} />
                                        <button onClick={applyCoupon} className="bg-black text-white px-6 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-black transition-all italic underline underline-offset-4">APPLY COUPON</button>
                                    </div>
                                </div>

                                <div className="pt-8 border-t-2 border-black space-y-3">
                                    <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest italic">
                                        <span>Subtotal</span>
                                        <span>₹{cartItems.reduce((acc, item) => acc + (Number(item.base_price) * item.qty), 0).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-[10px] font-black text-primary uppercase tracking-widest italic">
                                        <span>Discount</span>
                                        <span>- ₹{(cartItems.reduce((acc, item) => acc + (Number(item.base_price) * item.qty), 0) - sellingPriceTotal).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-[10px] font-black text-primary uppercase tracking-widest italic">
                                        <span>Coupon Discount</span>
                                        <span>- ₹{discountAmount.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between pt-6">
                                        <span className="text-xl font-black italic uppercase tracking-tighter">Total Amount</span>
                                        <span className="text-3xl font-black italic text-black">₹{Math.max(0, sellingPriceTotal - discountAmount).toLocaleString()}</span>
                                    </div>
                                </div>

                                <button onClick={confirmOrder} disabled={!selectedLogistics} className="w-full bg-black text-white py-6 text-xs font-black uppercase tracking-[0.3em] italic shadow-[12px_12px_0px_0px_rgba(255,210,0,1)] hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all disabled:opacity-50">
                                    PLACE ORDER
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white py-20 px-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-16 flex items-baseline justify-between border-b-2 border-black pb-8">
                    <h1 className="text-5xl font-black italic uppercase tracking-tighter">Repository / <span className="text-primary italic">01</span></h1>
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic italic">Items in Cart: {cartItems.length} Products</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
                    <div className="lg:col-span-8 space-y-12">
                        {cartItems.map(item => (
                            <motion.div
                                layout
                                key={item.id}
                                className="group relative flex flex-col md:flex-row gap-10 items-start md:items-center border-b border-gray-100 pb-12 last:border-none"
                            >
                                <div className="w-40 aspect-[3/4] bg-gray-50 relative overflow-hidden flex-shrink-0 border border-gray-100">
                                    {item.image_url ? (
                                        <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-2xl font-black italic text-gray-100 uppercase">VARNA</div>
                                    )}
                                </div>

                                <div className="flex-grow space-y-4">
                                    <div className="space-y-1">
                                        <h3 className="text-2xl font-black italic uppercase tracking-tighter">{item.title}</h3>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">{item.category}</p>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="flex flex-col">
                                            <span className="text-xl font-black italic">₹{(item.sale_price || item.base_price).toLocaleString()}</span>
                                            {item.sale_price && <span className="text-[10px] text-gray-300 line-through font-bold">₹{item.base_price}</span>}
                                        </div>
                                        <div className="w-[2px] h-8 bg-gray-100" />
                                        <div className="flex items-center gap-4 bg-gray-50 px-4 py-2">
                                            <button onClick={() => updateQuantity(item.id, item.qty - 1)} className="text-xl font-black hover:text-primary">-</button>
                                            <span className="text-xs font-black italic w-6 text-center">{item.qty}</span>
                                            <button onClick={() => updateQuantity(item.id, item.qty + 1)} className="text-xl font-black hover:text-primary">+</button>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => removeFromCart(item.id)}
                                    className="md:absolute md:right-0 md:top-2 p-2 text-gray-200 hover:text-red-600 transition-colors"
                                >
                                    <Trash2 size={24} strokeWidth={2.5} />
                                </button>
                            </motion.div>
                        ))}
                    </div>

                    <div className="lg:col-span-4 h-fit">
                        <div className="border-[6px] border-black p-10 space-y-8 sticky top-24">
                            <h2 className="text-2xl font-black italic uppercase tracking-tighter">Summary</h2>
                            <div className="space-y-4">
                                <div className="flex justify-between items-baseline">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Subtotal</span>
                                    <span className="text-lg font-black italic">₹{total.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-baseline pt-4 border-t border-gray-100">
                                    <span className="text-lg font-black italic uppercase tracking-tighter">Total</span>
                                    <span className="text-4xl font-black italic text-black">₹{total.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 text-[10px] font-bold text-gray-400 uppercase leading-loose italic">
                                <p>* Every piece is direct-from-artisan. Fees across the blockchain may vary.</p>
                                <p>* Shipping estimated at next stage.</p>
                            </div>

                            <button
                                onClick={handleCheckout}
                                className="w-full bg-black text-white py-6 text-xs font-black uppercase tracking-[0.3em] italic shadow-[12px_12px_0px_0px_rgba(255,210,0,1)] hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all group overflow-hidden relative"
                            >
                                <span className="relative z-10">PROCEED TO CHECKOUT</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
