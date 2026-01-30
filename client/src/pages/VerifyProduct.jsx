import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ShieldCheck, ShieldAlert, Cpu, Hash, Calendar, ShoppingBag, ArrowLeft } from 'lucide-react';

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
                setError('Invalid or fraudulent ledger entry detected.');
            } finally {
                setLoading(false);
            }
        };
        verify();
    }, [hash]);

    if (loading) return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-black border-t-primary animate-spin" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] italic">Scanning Ledger</span>
            </div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen flex items-center justify-center bg-white p-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full text-center border-[10px] border-black p-12 bg-white"
            >
                <ShieldAlert className="mx-auto text-red-600 mb-6" size={64} strokeWidth={3} />
                <h2 className="text-4xl font-black italic uppercase tracking-tighter text-black mb-4">Integrity Loss</h2>
                <p className="text-xs font-black uppercase tracking-widest text-gray-400 italic mb-8">{error}</p>
                <Link to="/" className="inline-block bg-black text-white px-10 py-4 text-[10px] font-black uppercase tracking-widest italic hover:bg-primary hover:text-black transition-all">
                    RETURN TO SAFETY
                </Link>
            </motion.div>
        </div>
    );

    return (
        <div className="min-h-screen bg-white p-8 md:p-24 flex items-center justify-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white max-w-2xl w-full border-[12px] border-black shadow-[20px_20px_0px_0px_rgba(255,210,0,1)] relative p-12 overflow-hidden"
            >
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <ShieldCheck size={200} strokeWidth={1} />
                </div>

                <div className="relative z-10">
                    <div className="flex justify-between items-start border-b-4 border-black pb-8 mb-12">
                        <div>
                            <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none">Varna.<br /><span className="text-primary not-italic">Verified.</span></h1>
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 italic mt-4">CERTIFICATE OF AUTHENTICITY</p>
                        </div>
                        <div className="bg-black p-4 rotate-12">
                            <ShieldCheck className="text-primary" size={48} strokeWidth={3} />
                        </div>
                    </div>

                    <div className="space-y-10 mb-16">
                        <div className="space-y-4">
                            <p className="text-[9px] font-black uppercase tracking-[0.5em] text-primary italic">BLOCKCHAIN IDENTIFIER</p>
                            <div className="flex items-center gap-4 bg-gray-50 p-4 border-l-8 border-black">
                                <Hash size={16} className="text-gray-400" />
                                <span className="text-xs font-black uppercase tracking-widest truncate">{record.tx_hash}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-2">
                                <p className="text-[9px] font-black uppercase tracking-[0.5em] text-gray-400 italic">MASTERPIECE TITLE</p>
                                <p className="text-2xl font-black italic uppercase tracking-tighter">{record.title}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-[9px] font-black uppercase tracking-[0.5em] text-gray-400 italic">STUDIO ORIGIN</p>
                                <p className="text-2xl font-black italic uppercase tracking-tighter text-primary">{record.store_name}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-[9px] font-black uppercase tracking-[0.5em] text-gray-400 italic">CLASSIFICATION</p>
                                <p className="text-xl font-black italic uppercase tracking-tighter">{record.category}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-[9px] font-black uppercase tracking-[0.5em] text-gray-400 italic">MINTING EPOCH</p>
                                <p className="text-xl font-black italic uppercase tracking-tighter">{new Date(record.mint_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}</p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 border-t-2 border-dashed border-gray-200 flex flex-col items-center gap-8">
                        <div className="flex items-center gap-4 text-gray-300">
                            <Cpu size={16} />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] italic">SECURE POLYGON LEDGER INTERFACE MMXXIV</span>
                        </div>

                        <div className="flex flex-wrap justify-center gap-6">
                            <Link to="/" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-black hover:text-primary transition-colors underline underline-offset-8 italic">
                                <ArrowLeft size={14} strokeWidth={3} /> RETURN HOME
                            </Link>
                            <Link to="/shop" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-black hover:text-primary transition-colors underline underline-offset-8 italic">
                                <ShoppingBag size={14} strokeWidth={3} /> SHOP ARCHIVE
                            </Link>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
