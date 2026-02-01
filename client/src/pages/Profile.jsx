import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Shield, MapPin, Package, LogOut, Plus, X, Edit3, Trash2 } from 'lucide-react';

export default function Profile() {
    const { logout } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [showProfileForm, setShowProfileForm] = useState(false);

    const [currentAddress, setCurrentAddress] = useState({
        id: null,
        full_name: '',
        street: '',
        city: '',
        state: '',
        pincode: '',
        is_default: false
    });

    const [userProfileData, setUserProfileData] = useState({
        full_name: '',
        phone_number: ''
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
            setUserProfileData({
                full_name: res.data.user.full_name,
                phone_number: res.data.user.phone_number
            });
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

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.put('http://localhost:5000/auth/profile', userProfileData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Identity Updated!');
            setShowProfileForm(false);
            fetchProfile();
        } catch (err) {
            toast.error('Identity update failed');
        }
    };

    const resetForm = () => {
        setCurrentAddress({ id: null, full_name: '', street: '', city: '', state: '', pincode: '', is_default: false });
        setShowAddressForm(false);
    };

    if (loading) return (
        // ... (previous return)
        <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-black border-t-primary animate-spin" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] italic">Accessing Ledger</span>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-white py-20 px-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-20 flex flex-col md:flex-row md:items-baseline justify-between border-b-2 border-black pb-8 gap-8">
                    <div>
                        <h1 className="text-6xl font-black italic uppercase tracking-tighter">Identity</h1>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic mt-2">Verified Profile & Security Parameters</p>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="text-right">
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">MEMBER SINCE</p>
                            <p className="text-sm font-black italic">EST {new Date(profile.user.created_at).getFullYear()}</p>
                        </div>
                        <button
                            onClick={() => setShowProfileForm(true)}
                            className="w-12 h-12 bg-primary flex items-center justify-center border-2 border-black transform rotate-12 hover:scale-110 transition-transform group"
                        >
                            <Edit3 size={20} className="-rotate-12 group-hover:scale-125 transition-transform" />
                        </button>
                    </div>
                </div>

                {/* Profile Dashboard Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-1 mb-20">
                    <motion.div
                        whileHover={{ y: -5 }}
                        onClick={() => window.location.href = '/orders'}
                        className="bg-gray-50 p-10 flex flex-col gap-6 cursor-pointer group hover:bg-black transition-all duration-500"
                    >
                        <div className="w-12 h-12 flex items-center justify-center bg-white group-hover:bg-primary transition-colors border-2 border-black">
                            <Package size={24} className="group-hover:text-black transition-colors" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black italic uppercase tracking-tighter group-hover:text-white transition-colors">Acquisitions</h2>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic group-hover:text-gray-500 transition-colors mt-2">Historical Log of Purchases</p>
                        </div>
                    </motion.div>

                    <motion.div
                        whileHover={{ y: -5 }}
                        onClick={() => { if (window.confirm('TERMINATE SESSION?')) logout(); }}
                        className="bg-gray-50 p-10 flex flex-col gap-6 cursor-pointer group hover:bg-black transition-all duration-500"
                    >
                        <div className="w-12 h-12 flex items-center justify-center bg-white group-hover:bg-primary transition-colors border-2 border-black">
                            <Shield size={24} className="group-hover:text-black transition-colors" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black italic uppercase tracking-tighter group-hover:text-white transition-colors">Access Logic</h2>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic group-hover:text-gray-500 transition-colors mt-2">Role: {profile.user.role} [ TERMINATE ]</p>
                        </div>
                    </motion.div>

                    <motion.div
                        whileHover={{ y: -5 }}
                        onClick={() => document.getElementById('addresses-section').scrollIntoView({ behavior: 'smooth' })}
                        className="bg-gray-50 p-10 flex flex-col gap-6 cursor-pointer group hover:bg-black transition-all duration-500"
                    >
                        <div className="w-12 h-12 flex items-center justify-center bg-white group-hover:bg-primary transition-colors border-2 border-black">
                            <MapPin size={24} className="group-hover:text-black transition-colors" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black italic uppercase tracking-tighter group-hover:text-white transition-colors">Logistics</h2>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic group-hover:text-gray-500 transition-colors mt-2">Saved Delivery Destinations</p>
                        </div>
                    </motion.div>
                </div>

                {/* Addresses Section */}
                <div id="addresses-section" className="space-y-12">
                    <div className="flex justify-between items-baseline border-b-2 border-black pb-6">
                        <h2 className="text-4xl font-black italic uppercase tracking-tighter">Logistics Records</h2>
                        <button
                            onClick={() => { resetForm(); setShowAddressForm(true); }}
                            className="bg-black text-white px-8 py-3 text-[10px] font-black uppercase tracking-widest italic hover:bg-primary hover:text-black transition-all"
                        >
                            ADD DESTINATION
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {profile.addresses.map(addr => (
                            <motion.div
                                layout
                                key={addr.id}
                                className="border-4 border-gray-100 p-8 relative flex flex-col hover:border-black transition-all group"
                            >
                                {addr.is_default && (
                                    <div className="absolute top-0 right-0 bg-black text-white px-3 py-1 text-[8px] font-black uppercase tracking-widest italic">
                                        PRIMARY
                                    </div>
                                )}
                                <div className="space-y-4 mb-10">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">RECORD {addr.id}</p>
                                    <p className="text-xl font-black italic uppercase tracking-tighter">{addr.full_name}</p>
                                    <p className="text-xs font-bold uppercase leading-relaxed text-gray-600">
                                        {addr.street}<br />
                                        {addr.city}, {addr.state} {addr.pincode}<br />
                                        IN / +91 {profile.user.phone_number}
                                    </p>
                                </div>

                                <div className="mt-auto flex gap-6 pt-6 border-t border-gray-100">
                                    <button onClick={() => handleEditAddress(addr)} className="text-[10px] font-black uppercase tracking-widest text-black hover:text-primary flex items-center gap-2 italic">
                                        <Edit3 size={12} /> MODIFY
                                    </button>
                                    <button onClick={() => handleDeleteAddress(addr.id)} className="text-[10px] font-black uppercase tracking-widest text-gray-300 hover:text-red-600 flex items-center gap-2 italic">
                                        <Trash2 size={12} /> PURGE
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Address Management Modal / Overlay */}
                <AnimatePresence>
                    {showAddressForm && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-8 backdrop-blur-sm"
                        >
                            <motion.div
                                initial={{ y: 50 }}
                                animate={{ y: 0 }}
                                exit={{ y: 50 }}
                                className="bg-white p-12 max-w-2xl w-full border-[8px] border-black relative"
                            >
                                <button onClick={resetForm} className="absolute top-8 right-8 text-black hover:text-primary transition-colors">
                                    <X size={32} strokeWidth={3} />
                                </button>

                                <h4 className="text-4xl font-black italic uppercase tracking-tighter mb-12 border-b-4 border-primary pb-4 inline-block">
                                    {currentAddress.id ? 'MODIFY DESTINATION' : 'NEW DESTINATION'}
                                </h4>

                                <form onSubmit={handleAddressSubmit} className="space-y-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">RECEIPIENT IDENTIFIER</label>
                                        <input
                                            className="w-full bg-gray-50 border-b-4 border-transparent focus:border-black p-4 text-sm font-black uppercase outline-none"
                                            value={currentAddress.full_name}
                                            onChange={e => setCurrentAddress({ ...currentAddress, full_name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">LOGISTICS PATHWAY (STREET / STUDIO)</label>
                                        <input
                                            className="w-full bg-gray-50 border-b-4 border-transparent focus:border-black p-4 text-sm font-black uppercase outline-none"
                                            value={currentAddress.street}
                                            onChange={e => setCurrentAddress({ ...currentAddress, street: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">CITY</label>
                                            <input
                                                className="w-full bg-gray-50 border-b-4 border-transparent focus:border-black p-4 text-sm font-black uppercase outline-none"
                                                value={currentAddress.city}
                                                onChange={e => setCurrentAddress({ ...currentAddress, city: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">STATE</label>
                                            <input
                                                className="w-full bg-gray-50 border-b-4 border-transparent focus:border-black p-4 text-sm font-black uppercase outline-none"
                                                value={currentAddress.state}
                                                onChange={e => setCurrentAddress({ ...currentAddress, state: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">PINCODE</label>
                                            <input
                                                className="w-full bg-gray-50 border-b-4 border-transparent focus:border-black p-4 text-sm font-black uppercase outline-none"
                                                value={currentAddress.pincode}
                                                onChange={e => setCurrentAddress({ ...currentAddress, pincode: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="flex items-end pb-4">
                                            <label className="flex items-center gap-4 cursor-pointer">
                                                <div className={`w-6 h-6 border-4 flex items-center justify-center transition-all ${currentAddress.is_default ? 'bg-primary border-black rotate-45' : 'border-gray-100'}`}>
                                                    {currentAddress.is_default && <div className="-rotate-45 w-2 h-2 bg-black" />}
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    checked={currentAddress.is_default}
                                                    onChange={e => setCurrentAddress({ ...currentAddress, is_default: e.target.checked })}
                                                    className="sr-only"
                                                />
                                                <span className="text-[10px] font-black uppercase tracking-widest italic">SET AS PRIMARY</span>
                                            </label>
                                        </div>
                                    </div>
                                    <button type="submit" className="w-full bg-black text-white py-6 text-xs font-black uppercase tracking-[0.3em] italic shadow-[12px_12px_0px_0px_rgba(255,210,0,1)] hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all">
                                        {currentAddress.id ? 'UPDATE ARCHIVE' : 'ESTABLISH RECORD'}
                                    </button>
                                </form>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Profile Edit Modal */}
                <AnimatePresence>
                    {showProfileForm && (
                        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="bg-white border-[10px] border-black shadow-[20px_20px_0px_0px_rgba(255,210,0,1)] w-full max-w-md overflow-hidden"
                            >
                                <div className="bg-black p-8 text-white flex justify-between items-center">
                                    <div>
                                        <h3 className="text-2xl font-black italic uppercase tracking-tighter">Modify Identity</h3>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-primary mt-1 italic">Personal Authentication Logic</p>
                                    </div>
                                    <button onClick={() => setShowProfileForm(false)} className="bg-primary p-2 text-black hover:bg-white transition-colors">
                                        <X size={20} strokeWidth={3} />
                                    </button>
                                </div>

                                <form onSubmit={handleProfileSubmit} className="p-8 space-y-8">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 italic">Full Name</label>
                                        <input
                                            type="text"
                                            className="w-full p-4 bg-gray-50 border-b-4 border-transparent focus:border-black outline-none text-sm font-black transition-all"
                                            value={userProfileData.full_name}
                                            onChange={(e) => setUserProfileData({ ...userProfileData, full_name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 italic">Contact Protocol (Phone)</label>
                                        <input
                                            type="text"
                                            className="w-full p-4 bg-gray-50 border-b-4 border-transparent focus:border-black outline-none text-sm font-black transition-all"
                                            value={userProfileData.phone_number}
                                            onChange={(e) => setUserProfileData({ ...userProfileData, phone_number: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <button type="submit" className="w-full bg-black text-white py-5 text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-black transition-all">
                                        COMMIT CHANGES
                                    </button>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
