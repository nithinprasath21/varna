import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import axios from 'axios';

export default function Cart() {
    const { cartItems, removeFromCart, updateQuantity, total, clearCart } = useCart();
    const navigate = useNavigate();
    const [isCheckout, setIsCheckout] = useState(false);

    // Checkout State
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [showAddAddress, setShowAddAddress] = useState(false);
    const [newAddress, setNewAddress] = useState({ full_name: '', street: '', city: '', state: '', pincode: '' });

    const [couponCode, setCouponCode] = useState('');
    const [discountAmount, setDiscountAmount] = useState(0);

    // Payment State
    const [paymentMode, setPaymentMode] = useState('UPI');
    const [paymentDetails, setPaymentDetails] = useState({
        upiId: '',
        cardNumber: '',
        cardExpiry: '',
        cardCvv: '',
        bankName: ''
    });

    const fetchAddresses = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/auth/profile', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAddresses(res.data.addresses);
            const defaultAddr = res.data.addresses.find(a => a.is_default);
            if (defaultAddr) setSelectedAddress(defaultAddr.id);
            else if (res.data.addresses.length > 0) setSelectedAddress(res.data.addresses[0].id);
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
        fetchAddresses();
    };

    const handleSaveAddress = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('http://localhost:5000/auth/address', { ...newAddress, is_default: addresses.length === 0 }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAddresses([...addresses, res.data]);
            setSelectedAddress(res.data.id);
            setShowAddAddress(false);
            setNewAddress({ full_name: '', street: '', city: '', state: '', pincode: '' });
        } catch (err) {
            toast.error('Failed to save address');
        }
    };

    const applyCoupon = () => {
        const sellingPriceTotal = cartItems.reduce((acc, item) => acc + ((item.sale_price || item.base_price) * item.qty), 0);
        const code = couponCode.toUpperCase();

        if (code === 'VARNA20') {
            const discount = Math.round(sellingPriceTotal * 0.2);
            setDiscountAmount(discount);
            toast.success('Coupon Applied! 20% Off');
        } else if (code === 'WELCOME500') {
            setDiscountAmount(500);
            toast.success('Coupon Applied! ₹500 Off');
        } else {
            toast.error('Invalid Coupon Code');
            setDiscountAmount(0);
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
        if (!selectedAddress) return toast.error('Please select a delivery address');
        if (!validatePayment()) return;

        try {
            const token = localStorage.getItem('token');
            const finalAmount = Math.max(0, sellingPriceTotal - discountAmount);

            await axios.post('http://localhost:5000/orders', {
                items: cartItems,
                address_id: selectedAddress,
                payment_mode: paymentMode,
                total_amount: finalAmount
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
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <h2 className="text-2xl font-bold mb-4">Your Cart is Empty</h2>
                <button onClick={() => navigate('/shop')} className="text-primary hover:underline">
                    Continue Shopping
                </button>
            </div>
        );
    }

    if (isCheckout) {
        return (
            <div className="min-h-screen bg-slate-50 py-12 px-4">
                <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* Left Column: Address & Payment */}
                    <div className="space-y-6">
                        {/* Address Section (Same as before) */}
                        <div className="bg-white p-6 rounded-xl shadow-lg">
                            <h3 className="font-bold text-lg mb-4 flex justify-between">
                                <span>1. Delivery Address</span>
                                <button onClick={() => setShowAddAddress(!showAddAddress)} className="text-primary text-sm">+ Add New</button>
                            </h3>

                            {showAddAddress && (
                                <form onSubmit={handleSaveAddress} className="bg-gray-50 p-4 rounded mb-4 text-sm space-y-3">
                                    <input placeholder="Full Name" className="w-full p-2 border rounded" value={newAddress.full_name} onChange={e => setNewAddress({ ...newAddress, full_name: e.target.value })} required />
                                    <input placeholder="Street Address" className="w-full p-2 border rounded" value={newAddress.street} onChange={e => setNewAddress({ ...newAddress, street: e.target.value })} required />
                                    <div className="grid grid-cols-3 gap-2">
                                        <input placeholder="City" className="p-2 border rounded" value={newAddress.city} onChange={e => setNewAddress({ ...newAddress, city: e.target.value })} required />
                                        <input placeholder="State" className="p-2 border rounded" value={newAddress.state} onChange={e => setNewAddress({ ...newAddress, state: e.target.value })} required />
                                        <input placeholder="Pin" className="p-2 border rounded" value={newAddress.pincode} onChange={e => setNewAddress({ ...newAddress, pincode: e.target.value })} required />
                                    </div>
                                    <button className="bg-secondary text-white px-4 py-2 rounded font-bold w-full">Save & Use</button>
                                </form>
                            )}

                            <div className="space-y-3 max-h-60 overflow-y-auto">
                                {addresses.map(addr => (
                                    <label key={addr.id} className={`block p-3 border rounded-lg cursor-pointer transition-all ${selectedAddress === addr.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:bg-gray-50'}`}>
                                        <div className="flex items-start gap-3">
                                            <input
                                                type="radio"
                                                name="address"
                                                checked={selectedAddress === addr.id}
                                                onChange={() => setSelectedAddress(addr.id)}
                                                className="mt-1"
                                            />
                                            <div className="text-sm">
                                                <p className="font-bold">{addr.full_name}</p>
                                                <p>{addr.street}, {addr.city}</p>
                                                <p>{addr.state} - {addr.pincode}</p>
                                            </div>
                                        </div>
                                    </label>
                                ))}
                                {addresses.length === 0 && !showAddAddress && <p className="text-sm text-gray-500 italic">No saved addresses. Please add one.</p>}
                            </div>
                        </div>

                        {/* Payment Section */}
                        <div className="bg-white p-6 rounded-xl shadow-lg">
                            <h3 className="font-bold text-lg mb-4">2. Payment Method</h3>
                            <div className="space-y-4">
                                {/* UPI Option */}
                                <div className={`border rounded-lg p-3 ${paymentMode === 'UPI' ? 'border-primary bg-primary/5' : ''}`}>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input type="radio" name="payment" value="UPI" checked={paymentMode === 'UPI'} onChange={(e) => setPaymentMode(e.target.value)} className="text-primary" />
                                        <span className="font-medium">UPI (Google Pay, PhonePe)</span>
                                    </label>
                                    {paymentMode === 'UPI' && (
                                        <div className="mt-3 ml-6 animate-in fade-in">
                                            <input
                                                placeholder="Enter UPI ID (e.g. user@okaxis)"
                                                className="w-full p-2 border rounded text-sm"
                                                value={paymentDetails.upiId}
                                                onChange={e => setPaymentDetails({ ...paymentDetails, upiId: e.target.value })}
                                            />
                                            <p className="text-xs text-gray-500 mt-1">We will send a payment request to this UPI ID.</p>
                                        </div>
                                    )}
                                </div>

                                {/* Card Option */}
                                <div className={`border rounded-lg p-3 ${paymentMode === 'Credit/Debit Card' ? 'border-primary bg-primary/5' : ''}`}>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input type="radio" name="payment" value="Credit/Debit Card" checked={paymentMode === 'Credit/Debit Card'} onChange={(e) => setPaymentMode(e.target.value)} className="text-primary" />
                                        <span className="font-medium">Credit / Debit Card</span>
                                    </label>
                                    {paymentMode === 'Credit/Debit Card' && (
                                        <div className="mt-3 ml-6 grid grid-cols-2 gap-3 animate-in fade-in">
                                            <input
                                                placeholder="Card Number"
                                                className="col-span-2 p-2 border rounded text-sm"
                                                value={paymentDetails.cardNumber}
                                                onChange={e => setPaymentDetails({ ...paymentDetails, cardNumber: e.target.value })}
                                                maxLength={16}
                                            />
                                            <input
                                                placeholder="Expiry (MM/YY)"
                                                className="p-2 border rounded text-sm"
                                                value={paymentDetails.cardExpiry}
                                                onChange={e => setPaymentDetails({ ...paymentDetails, cardExpiry: e.target.value })}
                                                maxLength={5}
                                            />
                                            <input
                                                type="password"
                                                placeholder="CVV"
                                                className="p-2 border rounded text-sm"
                                                value={paymentDetails.cardCvv}
                                                onChange={e => setPaymentDetails({ ...paymentDetails, cardCvv: e.target.value })}
                                                maxLength={3}
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Netbanking Option */}
                                <div className={`border rounded-lg p-3 ${paymentMode === 'Netbanking' ? 'border-primary bg-primary/5' : ''}`}>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input type="radio" name="payment" value="Netbanking" checked={paymentMode === 'Netbanking'} onChange={(e) => setPaymentMode(e.target.value)} className="text-primary" />
                                        <span className="font-medium">Netbanking</span>
                                    </label>
                                    {paymentMode === 'Netbanking' && (
                                        <div className="mt-3 ml-6 animate-in fade-in">
                                            <select
                                                className="w-full p-2 border rounded text-sm"
                                                value={paymentDetails.bankName}
                                                onChange={e => setPaymentDetails({ ...paymentDetails, bankName: e.target.value })}
                                            >
                                                <option value="">Select Bank</option>
                                                <option value="HDFC">HDFC Bank</option>
                                                <option value="SBI">SBI</option>
                                                <option value="ICICI">ICICI Bank</option>
                                                <option value="Axis">Axis Bank</option>
                                            </select>
                                        </div>
                                    )}
                                </div>

                                {/* COD Option */}
                                <div className={`border rounded-lg p-3 ${paymentMode === 'Cash on Delivery' ? 'border-primary bg-primary/5' : ''}`}>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input type="radio" name="payment" value="Cash on Delivery" checked={paymentMode === 'Cash on Delivery'} onChange={(e) => setPaymentMode(e.target.value)} className="text-primary" />
                                        <span className="font-medium">Cash on Delivery</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Summary */}
                    <div className="h-fit space-y-6">
                        <div className="bg-white p-6 rounded-xl shadow-lg sticky top-6">
                            <h3 className="font-bold text-lg mb-4">Order Summary</h3>
                            <div className="space-y-2 mb-4 text-sm text-gray-600 max-h-40 overflow-y-auto">
                                {cartItems.map(item => (
                                    <div key={item.id} className="flex justify-between">
                                        <span className="truncate w-40">{item.title} x {item.qty}</span>
                                        <span>₹{(item.qty * (item.sale_price || item.base_price)).toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Coupon Input */}
                            <div className="mb-4 pt-4 border-t border-dashed">
                                <label className="text-xs font-bold text-gray-500 mb-1 block">Have a Coupon?</label>
                                <div className="flex gap-2">
                                    <input
                                        className="flex-1 border border-gray-300 rounded p-2 text-sm uppercase"
                                        placeholder="Enter Code"
                                        value={couponCode}
                                        onChange={e => setCouponCode(e.target.value)}
                                    />
                                    <button onClick={applyCoupon} className="bg-gray-800 text-white px-4 rounded text-sm font-bold hover:bg-black">Apply</button>
                                </div>
                                {discountAmount > 0 && <p className="text-xs text-green-600 font-bold mt-1">Discount Applied!</p>}
                            </div>

                            <div className="border-t pt-4 space-y-2">
                                <div className="flex justify-between text-gray-600">
                                    <span>Total MRP</span>
                                    <span>₹{cartItems.reduce((acc, item) => acc + (Number(item.base_price) * item.qty), 0).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-green-600">
                                    <span>Product Discount</span>
                                    <span>- ₹{(cartItems.reduce((acc, item) => acc + (Number(item.base_price) * item.qty), 0) - sellingPriceTotal).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-green-600">
                                    <span>Coupon Discount</span>
                                    <span>- ₹{discountAmount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between font-bold text-xl text-neutral-900 pt-2 border-t">
                                    <span>Order Total</span>
                                    <span>₹{Math.max(0, sellingPriceTotal - discountAmount).toLocaleString()}</span>
                                </div>
                            </div>

                            <button
                                onClick={confirmOrder}
                                disabled={!selectedAddress}
                                className="w-full mt-6 bg-secondary text-white py-3 rounded-lg font-bold hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Place Order
                            </button>
                            <button onClick={() => setIsCheckout(false)} className="w-full mt-2 text-center text-sm text-gray-500 hover:underline">
                                Back to Cart
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

                <div className="flex flex-col md:flex-row gap-8">
                    <div className="flex-grow space-y-4">
                        {cartItems.map(item => (
                            <div key={item.id} className="bg-white p-4 rounded-lg shadow-sm flex flex-col sm:flex-row items-center gap-4">
                                <div className="w-24 h-24 bg-gray-100 rounded-md flex items-center justify-center text-2xl">
                                    {item.category === 'Pottery' ? '🏺' : item.category === 'Textile' ? '🧶' : '🎁'}
                                </div>
                                <div className="flex-grow text-center sm:text-left">
                                    <h3 className="font-bold">{item.title}</h3>
                                    <p className="text-sm text-gray-500 mb-1">{item.category}</p>
                                    <p className="font-bold text-emerald-600">₹{(item.sale_price || item.base_price).toLocaleString()}</p>
                                </div>

                                <div className="flex items-center gap-3 bg-gray-100 rounded-lg p-1">
                                    <button
                                        onClick={() => updateQuantity(item.id, item.qty - 1)}
                                        className="w-8 h-8 flex items-center justify-center font-bold hover:bg-gray-200 rounded"
                                    >
                                        -
                                    </button>
                                    <span className="w-8 text-center font-bold">{item.qty}</span>
                                    <button
                                        onClick={() => updateQuantity(item.id, item.qty + 1)}
                                        className="w-8 h-8 flex items-center justify-center font-bold hover:bg-gray-200 rounded"
                                    >
                                        +
                                    </button>
                                </div>

                                <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700 p-2">
                                    🗑️
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="w-full md:w-80 h-fit bg-white p-6 rounded-xl shadow-md sticky top-24">
                        <h3 className="font-bold text-lg mb-4">Subtotal ({cartItems.length} items):</h3>
                        <p className="text-3xl font-bold text-neutral-900 mb-6">₹{total.toLocaleString()}</p>
                        <button
                            onClick={handleCheckout}
                            className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-accent transition-all shadow-lg"
                        >
                            Proceed to Checkout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
