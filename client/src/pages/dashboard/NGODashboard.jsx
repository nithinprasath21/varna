import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

export default function NGODashboard() {
    const { user, logout } = useAuth();
    const [artisans, setArtisans] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchArtisans();
    }, []);

    const fetchArtisans = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/ngo/artisans', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setArtisans(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleRelease = async (artisanId) => {
        if (!window.confirm("Are you sure you want to release this artisan? They will proceed independently.")) return;

        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/ngo/release-artisan', { artisanId }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Artisan released successfully');
            fetchArtisans(); // Refresh list
        } catch (err) {
            toast.error('Failed to release artisan');
        }
    };

    const handleLinkTest = async () => {
        const email = prompt("Enter Artisan Email to Link (Testing only):");
        if (!email) return;
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/ngo/link-artisan', { artisanEmail: email }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Linked!');
            fetchArtisans();
        } catch (err) {
            toast.error('Link failed');
        }
    }

    return (
        <div className="min-h-screen bg-background p-8">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-display font-bold text-secondary">NGO Dashboard</h1>
                    <p className="text-gray-600">Managing Artisans for {user.email}</p>
                </div>
                <div className="flex gap-4">
                    <button onClick={handleLinkTest} className="text-sm text-blue-600 underline">Test: Link Artisan</button>
                    <button onClick={logout} className="text-red-500 hover:text-red-700 font-medium">Logout</button>
                </div>
            </header>

            <div className="bg-surface p-8 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-secondary mb-6">Managed Artisans</h2>

                {loading ? <p>Loading...</p> : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name/Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {artisans.map((artisan) => (
                                    <tr key={artisan.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{artisan.store_name || 'No Store Name'}</div>
                                            <div className="text-sm text-gray-500">{artisan.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{artisan.phone_number}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                Active
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => handleRelease(artisan.id)}
                                                className="text-indigo-600 hover:text-indigo-900 border border-indigo-200 px-3 py-1 rounded hover:bg-indigo-50"
                                            >
                                                Release
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {artisans.length === 0 && <p className="text-center py-4 text-gray-500">No artisans managed currently.</p>}
                    </div>
                )}
            </div>
        </div>
    );
}
