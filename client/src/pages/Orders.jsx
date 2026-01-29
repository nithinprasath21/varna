import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/orders', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrders(res.data);
        } catch (err) {
            console.error('Failed to fetch orders', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center bg-background min-h-screen">Loading orders...</div>;

    return (
        <div className="bg-white min-h-screen py-8">
            <div className="max-w-[1000px] mx-auto px-4">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-3xl font-normal text-gray-900">Your Orders</h1>
                    <div className="flex gap-4">
                        <div className="relative">
                            <input type="text" placeholder="Search all orders" className="border border-gray-300 rounded shadow-sm px-3 py-1.5 w-64 text-sm focus:ring-1 focus:ring-primary focus:outline-none" />
                            <button className="absolute right-0 top-0 h-full px-3 bg-[#303333] text-white rounded-r border border-[#303333] font-bold text-sm">Search</button>
                        </div>
                    </div>
                </div>

                <div className="flex gap-6 border-b border-gray-200 mb-6 text-sm">
                    <button className="pb-3 border-b-2 border-[#e77600] text-[#e77600] font-bold">Orders</button>
                    <button className="pb-3 border-b-2 border-transparent hover:text-[#e77600] text-gray-600">Buy Again</button>
                    <button className="pb-3 border-b-2 border-transparent hover:text-[#e77600] text-gray-600">Not Yet Shipped</button>
                    <button className="pb-3 border-b-2 border-transparent hover:text-[#e77600] text-gray-600">Cancelled Orders</button>
                </div>

                {orders.length === 0 ? (
                    <div className="text-center py-20 border border-gray-200 rounded-lg">
                        <p className="text-gray-500 mb-4">You have no orders.</p>
                        <Link to="/shop" className="text-teal-700 font-medium hover:underline hover:text-red-700">Start Shopping</Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map(order => (
                            <div key={order.id} className="border border-gray-300 rounded-lg overflow-hidden">
                                {/* Order Header */}
                                <div className="bg-[#f0f2f2] px-6 py-3 flex text-sm text-gray-600 justify-between items-start border-b border-gray-200">
                                    <div className="flex gap-8">
                                        <div>
                                            <p className="uppercase text-xs font-bold">Order Placed</p>
                                            <p>{new Date(order.created_at).toLocaleDateString()}</p>
                                        </div>
                                        <div>
                                            <p className="uppercase text-xs font-bold">Total</p>
                                            <p>₹{Number(order.total_amount).toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <p className="uppercase text-xs font-bold">Ship To</p>
                                            <p className="text-teal-700 hover:underline hover:text-red-700 cursor-pointer group relative">
                                                {order.shipping_address?.full_name || 'User'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="uppercase text-xs font-bold">Order # {String(order.id).split('-')[0]}</p>
                                        <div className="flex gap-2 justify-end text-teal-700">
                                            <span className="hover:underline hover:text-red-700 cursor-pointer">View order details</span>
                                            <span>|</span>
                                            <span className="hover:underline hover:text-red-700 cursor-pointer">Invoice</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Order Body */}
                                <div className="p-6">
                                    <div className="mb-4">
                                        <h3 className="font-bold text-lg text-gray-900">
                                            {order.status === 'Delivered' ? 'Delivered' : 'Arriving soon'}
                                        </h3>
                                        {order.status === 'Delivered' && <p className="text-sm text-green-700">Package was left near the front door or porch</p>}
                                    </div>

                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="flex gap-6 mb-8 last:mb-0">
                                            <div className="w-24 h-24 flex-shrink-0 flex items-center justify-center">
                                                <Link to={`/product/${item.product_id}`}>
                                                    {item.image_url ? (
                                                        <img src={item.image_url} alt={item.product_title} className="max-w-full max-h-full object-contain" />
                                                    ) : (
                                                        <div className="w-full h-full bg-gray-100 flex items-center justify-center text-2xl">📦</div>
                                                    )}
                                                </Link>
                                            </div>
                                            <div className="flex-grow">
                                                <Link to={`/product/${item.product_id}`} className="font-bold text-teal-700 hover:text-red-700 hover:underline text-base mb-1 inline-block">
                                                    {item.product_title}
                                                </Link>
                                                <p className="text-xs text-gray-500 mb-4">Return window closed on {new Date(new Date(order.created_at).setDate(new Date(order.created_at).getDate() + 7)).toLocaleDateString()}</p>

                                                <div className="flex gap-4">
                                                    <button className="bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] rounded-lg px-4 py-1 text-sm shadow-sm">Buy it again</button>
                                                    <Link to={`/product/${item.product_id}`} className="bg-white border border-gray-300 hover:bg-gray-50 rounded-lg px-4 py-1 text-sm shadow-sm text-center pt-1.5">View your item</Link>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2 w-48">
                                                <button className="w-full bg-white border border-gray-300 hover:bg-gray-50 rounded-lg px-3 py-1 text-sm shadow-sm">Track package</button>
                                                <Link to={`/product/${item.product_id}`} className="w-full block bg-white border border-gray-300 hover:bg-gray-50 rounded-lg px-3 py-1 text-sm shadow-sm text-center">Write a product review</Link>
                                                <button className="w-full bg-white border border-gray-300 hover:bg-gray-50 rounded-lg px-3 py-1 text-sm shadow-sm">Return or replace items</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="bg-gray-50 px-6 py-2 border-t border-gray-200">
                                    <span className="text-teal-700 text-sm hover:underline hover:text-red-700 cursor-pointer">Archive Order</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
