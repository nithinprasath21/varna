import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const getFallbackEmoji = (craft) => {
    const c = (craft || '').toLowerCase();
    if (c.includes('wood')) return '🪓';
    if (c.includes('clay') || c.includes('potter')) return '🏺';
    if (c.includes('stone') || c.includes('marble')) return '⛏️';
    if (c.includes('toda') || c.includes('textile') || c.includes('embroid')) return '🧵';
    return '⚒️';
};

export default function ArtisansCarousel() {
    const navigate = useNavigate();
    const [artisans, setArtisans] = useState([]);

    useEffect(() => {
        axios.get(`${import.meta.env.API_URL}/shop/artisans`)
            .then(res => {
                setArtisans(res.data.filter(a => a.email !== 'artisan2@varna.com'));
            })
            .catch(err => console.error("Error fetching artisans", err));
    }, []);

    if (artisans.length === 0) return null;

    if (artisans.length < 3) {
        return (
            <div className="my-16 md:my-24 bg-black border-2 border-primary p-12 md:p-20 text-center cursor-pointer hover:bg-primary group transition-colors duration-500" onClick={() => navigate('/artisans')}>
                <h3 className="text-xl md:text-3xl font-black italic uppercase tracking-tighter text-primary group-hover:text-black mb-6">EXPLORE OUR ARTISANS</h3>
                <p className="text-[10px] md:text-xs font-bold text-gray-400 group-hover:text-black/80 uppercase tracking-widest max-w-2xl mx-auto leading-loose">
                    Discover the heritage creators mapping the future of decentralized commerce.
                </p>
            </div>
        );
    }

    return (
        <div className="my-16 md:my-24">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6 border-b-8 border-primary pb-8">
                <div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-primary mb-4 italic">OUR ARTISANS</h3>
                    <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter leading-tight text-black">
                        HANDS OF <br /> HERITAGE.
                    </h2>
                </div>
                <button onClick={() => navigate('/artisans')} className="text-[10px] font-black uppercase tracking-[0.3em] bg-black text-white px-8 py-4 hover:bg-primary hover:text-black transition-colors italic border-2 border-black hidden md:block">
                    VIEW DIRECTORY
                </button>
            </div>

            <style>{`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee {
                    animation: marquee 35s linear infinite;
                }
                .animate-marquee:hover {
                    animation-play-state: paused;
                }
            `}</style>

            <div className="overflow-hidden w-full relative">
                <div className="flex w-max animate-marquee gap-1">
                    {[...artisans, ...artisans].map((a, idx) => (
                        <div key={`${a.id}-${idx}`} onClick={() => navigate('/artisans')} className="min-w-[320px] w-[320px] shrink-0 bg-black text-white group cursor-pointer relative overflow-hidden flex flex-col h-[420px] hover:bg-[#111] transition-colors border-2 border-black">
                            <div className="h-56 overflow-hidden relative bg-[#0a0a0a] border-b border-[#222]">
                                {a.image_url ? (
                                    <img src={a.image_url} alt={a.store_name} className="w-full h-full object-cover grayscale-[25%] brightness-90 group-hover:scale-105 transition-transform duration-700" />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center opacity-50 relative">
                                        <span className="text-6xl mb-2">{getFallbackEmoji(a.craft_type)}</span>
                                    </div>
                                )}
                                <div className="absolute top-0 right-0 p-3 flex flex-col items-end gap-1">
                                    {a.ngo_name && <span className="text-[8px] font-black tracking-widest uppercase px-2 py-1 bg-black/60 border border-[#333] text-gray-300 backdrop-blur-sm shadow-xl">{a.ngo_name}</span>}
                                </div>
                            </div>
                            <div className="p-6 flex-1 flex flex-col justify-between">
                                <div>
                                    <div className="text-[9px] font-black tracking-[0.2em] uppercase text-primary mb-2 line-clamp-1">{a.craft_type}</div>
                                    <h3 className="text-2xl font-black uppercase tracking-tighter leading-none mb-3 line-clamp-1 group-hover:text-primary transition-colors">{a.store_name}</h3>
                                    <p className="text-[10px] text-gray-400 uppercase tracking-widest line-clamp-1 leading-relaxed">
                                        {a.experience_years} Years Practice • 📍 {a.store_name}
                                    </p>
                                </div>
                                <div className="mt-4 pt-4 border-t border-[#1a1a1a] flex justify-between items-center text-[10px] font-black tracking-[0.2em] uppercase text-gray-600 group-hover:text-white transition-colors">
                                    <span>Read Full Story</span>
                                    <span>↗</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            <button onClick={() => navigate('/artisans')} className="mt-6 md:hidden text-[10px] font-black uppercase tracking-[0.3em] w-full bg-black text-white border-2 border-black py-4">
                VIEW DIRECTORY
            </button>
        </div>
    );
}
