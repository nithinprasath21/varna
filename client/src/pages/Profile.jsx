import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
    const { logout } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showAddressForm, setShowAddressForm] = useState(false);

    const [currentAddress, setCurrentAddress] = useState({
        id: null,
        full_name: '',
        street: '',
        city: '',
        state: '',
        pincode: '',
        is_default: false
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/auth/profile', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProfile(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            toast.error('Failed to load profile');
            setLoading(false);
        }
    };

    const handleEditAddress = (addr) => {
        setCurrentAddress(addr);
        setShowAddressForm(true);
    };

    const handleDeleteAddress = async (id) => {
        if (!window.confirm('Delete this address?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/auth/address/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Address deleted');
            fetchProfile();
        } catch (err) {
            toast.error('Delete failed');
        }
    };

    const handleAddressSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            if (currentAddress.id) {
                // Update
                await axios.put(`http://localhost:5000/auth/address/${currentAddress.id}`, currentAddress, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('Address Updated!');
            } else {
                // Add
                await axios.post('http://localhost:5000/auth/address', currentAddress, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('Address Added!');
            }
            setShowAddressForm(false);
            setCurrentAddress({ id: null, full_name: '', street: '', city: '', state: '', pincode: '', is_default: false });
            fetchProfile();
        } catch (err) {
            toast.error('Action failed');
        }
    };

    const resetForm = () => {
        setCurrentAddress({ id: null, full_name: '', street: '', city: '', state: '', pincode: '', is_default: false });
        setShowAddressForm(false);
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading Profile...</div>;

    return (
        <div className="min-h-screen bg-white py-8 px-4">
            <div className="max-w-[1000px] mx-auto">
                <h1 className="text-3xl font-normal text-gray-900 mb-6">Your Account</h1>

                {/* Account Dashboard Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div onClick={() => window.location.href = '/orders'} className="border border-gray-300 rounded-lg p-4 flex gap-4 cursor-pointer hover:bg-gray-50 items-center">
                        <div className="w-12 h-12 flex-shrink-0">
                            <img src="https://m.media-amazon.com/images/G/31/x-locale/cs/help/images/gateway/Box-t3.png" alt="Orders" className="opacity-80" />
                        </div>
                        <div>
                            <h2 className="text-lg font-normal text-gray-800">Your Orders</h2>
                            <p className="text-sm text-gray-500">Track, return, or buy things again</p>
                        </div>
                    </div>

                    <div onClick={() => { if (window.confirm('Are you sure you want to logout?')) logout(); }} className="border border-gray-300 rounded-lg p-4 flex gap-4 cursor-pointer hover:bg-gray-50 items-center">
                        <div className="w-12 h-12 flex-shrink-0">
                            <img src="https://m.media-amazon.com/images/G/31/x-locale/cs/help/images/gateway/sign-in-lock.png" alt="Security" className="opacity-80" />
                        </div>
                        <div>
                            <h2 className="text-lg font-normal text-gray-800">Login & security</h2>
                            <p className="text-sm text-gray-500">Edit login, name, and mobile number (Logout)</p>
                        </div>
                    </div>

                    <div onClick={() => document.getElementById('addresses-section').scrollIntoView({ behavior: 'smooth' })} className="border border-gray-300 rounded-lg p-4 flex gap-4 cursor-pointer hover:bg-gray-50 items-center">
                        <div className="w-12 h-12 flex-shrink-0">
                            <img src="https://m.media-amazon.com/images/G/31/x-locale/cs/help/images/gateway/address-map-pin.png" alt="Address" className="opacity-80" />
                        </div>
                        <div>
                            <h2 className="text-lg font-normal text-gray-800">Your Addresses</h2>
                            <p className="text-sm text-gray-500">Edit addresses for orders and gifts</p>
                        </div>
                    </div>
                </div>

                <hr className="my-8 border-gray-200" />

                {/* Addresses Section */}
                <div id="addresses-section" className="space-y-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold">Your Addresses</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Add Address Card */}
                        <div
                            onClick={() => { resetForm(); setShowAddressForm(true); }}
                            className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:border-gray-400 hover:bg-gray-50 h-[250px]"
                        >
                            <span className="text-4xl text-gray-300 font-light">+</span>
                            <span className="font-bold text-lg mt-2">Add Address</span>
                        </div>

                        {/* Existing Addresses */}
                        {profile.addresses.map(addr => (
                            <div key={addr.id} className="border border-gray-300 rounded-lg p-6 relative h-[250px] flex flex-col">
                                {addr.is_default && <div className="text-xs text-gray-500 border-b pb-2 mb-2">Default: <span className="font-bold">Amazon</span></div>}
                                <p className="font-bold text-sm text-gray-900">{addr.full_name}</p>
                                <p className="text-sm text-gray-900">{addr.street}</p>
                                <p className="text-sm text-gray-900 uppercase">{addr.city}, {addr.state} {addr.pincode}</p>
                                <p className="text-sm text-gray-900">India</p>
                                <p className="text-sm text-gray-900 mt-2">Phone number: {profile.user.phone_number}</p>

                                <div className="mt-auto flex gap-3 text-sm text-teal-700">
                                    <button onClick={() => handleEditAddress(addr)} className="hover:underline hover:text-red-700">Edit</button>
                                    <span>|</span>
                                    <button onClick={() => handleDeleteAddress(addr.id)} className="hover:underline hover:text-red-700">Remove</button>
                                    {!addr.is_default && (
                                        <>
                                            <span>|</span>
                                            <button className="hover:underline hover:text-red-700">Set as Default</button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {showAddressForm && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
                            <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full m-4">
                                <div className="flex justify-between items-center mb-4 border-b pb-2">
                                    <h4 className="font-bold text-lg">{currentAddress.id ? 'Edit Address' : 'Add a new address'}</h4>
                                    <button onClick={resetForm} className="text-2xl font-light">&times;</button>
                                </div>
                                <form onSubmit={handleAddressSubmit}>
                                    <div className="mb-4">
                                        <label className="block text-sm font-bold mb-1">Full name (First and Last name)</label>
                                        <input
                                            className="p-2 border border-gray-400 rounded w-full shadow-inner focus:ring-1 focus:ring-[#e77600] outline-none"
                                            value={currentAddress.full_name}
                                            onChange={e => setCurrentAddress({ ...currentAddress, full_name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-sm font-bold mb-1">Address</label>
                                        <input
                                            placeholder="Street address, P.O. box, company name, c/o"
                                            className="w-full p-2 border border-gray-400 rounded shadow-inner focus:ring-1 focus:ring-[#e77600] outline-none mb-2"
                                            value={currentAddress.street}
                                            onChange={e => setCurrentAddress({ ...currentAddress, street: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <label className="block text-sm font-bold mb-1">City</label>
                                            <input
                                                className="p-2 border border-gray-400 rounded w-full shadow-inner focus:ring-1 focus:ring-[#e77600] outline-none"
                                                value={currentAddress.city}
                                                onChange={e => setCurrentAddress({ ...currentAddress, city: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold mb-1">State</label>
                                            <input
                                                className="p-2 border border-gray-400 rounded w-full shadow-inner focus:ring-1 focus:ring-[#e77600] outline-none"
                                                value={currentAddress.state}
                                                onChange={e => setCurrentAddress({ ...currentAddress, state: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-sm font-bold mb-1">Pincode</label>
                                        <input
                                            className="p-2 border border-gray-400 rounded w-full shadow-inner focus:ring-1 focus:ring-[#e77600] outline-none md:w-1/2"
                                            value={currentAddress.pincode}
                                            onChange={e => setCurrentAddress({ ...currentAddress, pincode: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="flex items-center gap-2 mb-6">
                                        <input
                                            type="checkbox"
                                            checked={currentAddress.is_default}
                                            onChange={e => setCurrentAddress({ ...currentAddress, is_default: e.target.checked })}
                                            className="w-4 h-4 text-[#e77600] focus:ring-[#e77600]"
                                        />
                                        <label className="text-sm text-gray-900">Make this my default address</label>
                                    </div>
                                    <button type="submit" className="bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] text-black px-4 py-2 rounded-lg text-sm font-medium shadow-sm">
                                        {currentAddress.id ? 'Save changes' : 'Add address'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
