import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

export default function Profile() {
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
        <div className="min-h-screen bg-slate-50 py-8 px-4">
            <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">

                {/* Sidebar / User Info */}
                <div className="md:col-span-1">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
                        <div className="w-24 h-24 bg-primary text-white text-3xl font-bold rounded-full flex items-center justify-center mx-auto mb-4">
                            {profile.user.email[0].toUpperCase()}
                        </div>
                        <h2 className="text-xl font-bold mb-1 break-words">{profile.user.email}</h2>
                        <p className="text-sm text-gray-500 mb-4">{profile.user.role}</p>

                        <div className="border-t pt-4 text-left">
                            <label className="text-xs text-gray-400 font-bold uppercase">Phone</label>
                            <p className="font-medium">{profile.user.phone_number}</p>
                        </div>
                    </div>
                </div>

                {/* Main Content (Addresses & Orders) */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-secondary">Your Addresses</h3>
                            <button
                                onClick={() => { resetForm(); setShowAddressForm(true); }}
                                className="text-primary text-sm font-bold hover:underline"
                            >
                                + Add Address
                            </button>
                        </div>

                        {showAddressForm && (
                            <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200 animate-in fade-in relative">
                                <button onClick={resetForm} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600">&times;</button>
                                <h4 className="font-bold mb-3">{currentAddress.id ? 'Edit Address' : 'Add New Address'}</h4>
                                <form onSubmit={handleAddressSubmit}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <input
                                            placeholder="Full Name"
                                            className="p-2 border rounded w-full"
                                            value={currentAddress.full_name}
                                            onChange={e => setCurrentAddress({ ...currentAddress, full_name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <input
                                            placeholder="Address (House No, Building, Street)"
                                            className="w-full p-2 border rounded"
                                            value={currentAddress.street}
                                            onChange={e => setCurrentAddress({ ...currentAddress, street: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                        <input
                                            placeholder="City"
                                            className="p-2 border rounded w-full"
                                            value={currentAddress.city}
                                            onChange={e => setCurrentAddress({ ...currentAddress, city: e.target.value })}
                                            required
                                        />
                                        <input
                                            placeholder="State"
                                            className="p-2 border rounded w-full"
                                            value={currentAddress.state}
                                            onChange={e => setCurrentAddress({ ...currentAddress, state: e.target.value })}
                                            required
                                        />
                                        <input
                                            placeholder="Pincode"
                                            className="p-2 border rounded w-full"
                                            value={currentAddress.pincode}
                                            onChange={e => setCurrentAddress({ ...currentAddress, pincode: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <input
                                            type="checkbox"
                                            checked={currentAddress.is_default}
                                            onChange={e => setCurrentAddress({ ...currentAddress, is_default: e.target.checked })}
                                        />
                                        <label className="text-sm text-gray-700">Make this my default address</label>
                                    </div>
                                    <button type="submit" className="bg-secondary text-white px-4 py-2 rounded text-sm font-bold">Save Address</button>
                                </form>
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-4">
                            {profile.addresses.length === 0 && !showAddressForm && (
                                <p className="text-gray-400 text-sm">No addresses saved yet.</p>
                            )}
                            {profile.addresses.map(addr => (
                                <div key={addr.id} className="border border-gray-200 rounded-lg p-4 relative hover:border-primary transition-colors">
                                    {addr.is_default && <span className="absolute top-2 right-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Default</span>}
                                    <p className="font-bold text-sm">{addr.full_name}</p>
                                    <p className="text-sm text-gray-600">{addr.street}</p>
                                    <p className="text-sm text-gray-600">{addr.city}, {addr.state} - {addr.pincode}</p>
                                    <div className="mt-3 flex gap-3 text-sm font-medium text-primary">
                                        <button onClick={() => handleEditAddress(addr)} className="hover:underline">Edit</button>
                                        <button onClick={() => handleDeleteAddress(addr.id)} className="hover:underline text-red-500">Remove</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
