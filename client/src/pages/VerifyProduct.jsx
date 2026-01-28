import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';

export default function VerifyProduct() {
    const { hash } = useParams();
    const [record, setRecord] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const verify = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/blockchain/verify/${hash}`);
                setRecord(res.data.record);
            } catch (err) {
                setError('Invalid or fake authentic toy record.');
            } finally {
                setLoading(false);
            }
        };
        verify();
    }, [hash]);

    if (loading) return <div className="p-8 text-center">Verifying blockchain record...</div>;

    if (error) return (
        <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
            <div className="text-center">
                <h1 className="text-4xl mb-4">❌</h1>
                <h2 className="text-2xl font-bold text-red-600 mb-2">Verification Failed</h2>
                <p className="text-gray-600">{error}</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-neutral-50 p-8 flex items-center justify-center">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white p-8 rounded-2xl shadow-xl max-w-lg w-full border-4 border-primary"
            >
                <div className="text-center mb-6">
                    <div className="text-6xl mb-4">✅</div>
                    <h1 className="text-3xl font-display font-bold text-secondary">Verified Authentic</h1>
                    <p className="text-sm text-gray-500 uppercase tracking-widest mt-2">{record.tx_hash}</p>
                </div>

                <div className="space-y-4 border-t border-b py-6 my-6 border-gray-100">
                    <div className="flex justify-between">
                        <span className="text-gray-500">Product</span>
                        <span className="font-bold">{record.title}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Category</span>
                        <span className="font-bold">{record.category}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Artisan Store</span>
                        <span className="font-bold text-primary">{record.store_name}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Minted On</span>
                        <span className="font-bold">{new Date(record.mint_date).toLocaleDateString()}</span>
                    </div>
                </div>

                <div className="text-center">
                    <p className="text-xs text-gray-400">Secured by Polygon Network (Simulated)</p>
                </div>
            </motion.div>
        </div>
    );
}
