import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const getFallbackEmoji = (craft) => {
    const c = craft.toLowerCase();
    if (c.includes('wood')) return '🪓';
    if (c.includes('clay') || c.includes('potter')) return '🏺';
    if (c.includes('stone') || c.includes('marble')) return '⛏️';
    if (c.includes('toda') || c.includes('textile') || c.includes('embroid')) return '🧵';
    return '⚒️';
};

export default function ArtisansDirectory() {
    const navigate = useNavigate();
    const [artisans, setArtisans] = useState([]);
    const [activeCat, setActiveCat] = useState('all');
    const [activeNgo, setActiveNgo] = useState('all');
    const [selectedArtisan, setSelectedArtisan] = useState(null);

    useEffect(() => {
        window.scrollTo(0, 0);
        axios.get(`${import.meta.env.API_URL}/shop/artisans`)
            .then(res => {
                const validArtisans = res.data.filter(a => a.email !== 'artisan2@varna.com');
                setArtisans(validArtisans);
            })
            .catch(err => console.error("Error fetching artisans", err));
    }, []);

    const determineCat = (craft) => {
        const c = (craft || '').toLowerCase();
        if (c.includes('wood')) return 'wood';
        if (c.includes('clay') || c.includes('potter') || c.includes('terracota')) return 'clay';
        if (c.includes('textile') || c.includes('embroid') || c.includes('running stitch')) return 'textile';
        if (c.includes('stone') || c.includes('marble')) return 'stone-art';
        return 'other';
    };

    const determineNgo = (ngoName) => {
        const n = (ngoName || '').toLowerCase();
        if (n.includes('keystone')) return 'keystone';
        if (n.includes('sencholai')) return 'sencholai';
        return 'other';
    };

    const filtered = artisans.filter(a => {
        const cOk = activeCat === 'all' || determineCat(a.craft_type) === activeCat;
        const nOk = activeNgo === 'all' || determineNgo(a.ngo_name) === activeNgo;
        return cOk && nOk;
    });

    const uniqueNgocount = new Set(artisans.filter(a => a.ngo_name).map(a => a.ngo_name)).size;
    
    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-primary selection:text-black">
            {/* HERO SECTION */}
            <section className="relative px-10 py-24 md:py-32 text-center border-b border-[#1a1a1a] overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(255,214,0,0.07)_0%,transparent_70%)] pointer-events-none"></div>
                <div className="relative z-10 max-w-4xl mx-auto">
                    <span className="inline-block text-[11px] font-black tracking-[0.3em] uppercase text-primary mb-6 border border-primary/30 px-4 py-1.5 bg-primary/5">
                        VARNA — ARTISAN STORIES
                    </span>
                    <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-[0.95] mb-6">
                        THE HANDS <br /> <span className="text-primary">BEHIND THE CRAFT.</span>
                    </h1>
                    <p className="text-sm tracking-widest uppercase text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed">
                        {artisans.length} heritage artisans — each carrying a living tradition, handcrafted for you without intermediaries.
                    </p>
                    
                    <div className="inline-flex border border-[#1f1f1f] bg-black/50 backdrop-blur-sm">
                        <div className="px-8 md:px-12 py-6 text-center border-r border-[#1f1f1f]">
                            <div className="text-3xl md:text-4xl font-black text-primary leading-none">{artisans.length}</div>
                            <div className="text-[10px] tracking-widest uppercase text-gray-500 mt-2">Artisans</div>
                        </div>
                        <div className="px-8 md:px-12 py-6 text-center border-r border-[#1f1f1f]">
                            <div className="text-3xl md:text-4xl font-black text-primary leading-none">{uniqueNgocount || 2}</div>
                            <div className="text-[10px] tracking-widest uppercase text-gray-500 mt-2">NGO Partners</div>
                        </div>
                        <div className="px-8 md:px-12 py-6 text-center">
                            <div className="text-3xl md:text-4xl font-black text-primary leading-none">100%</div>
                            <div className="text-[10px] tracking-widest uppercase text-gray-500 mt-2">Authentic</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FILTER BAR */}
            <div className="bg-[#0a0a0a] border-b border-[#1a1a1a] px-8 py-4 flex items-center gap-4 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">CRAFT TYPE</span>
                <div className="w-px h-5 bg-[#222]"></div>
                {[
                    { id: 'all', label: 'All' },
                    { id: 'wood', label: 'Wood & Stone' },
                    { id: 'clay', label: 'Clay & Pottery' },
                    { id: 'textile', label: 'Textile' },
                    { id: 'stone-art', label: 'Stone Art' }
                ].map(cat => (
                    <button 
                        key={cat.id}
                        onClick={() => setActiveCat(cat.id)}
                        className={`text-[11px] font-black uppercase tracking-widest px-4 py-1.5 border transition-all ${
                            activeCat === cat.id 
                            ? 'bg-primary border-primary text-black' 
                            : 'border-[#2a2a2a] text-gray-400 hover:border-primary hover:text-primary'
                        }`}
                    >
                        {cat.label}
                    </button>
                ))}

                <div className="w-px h-5 bg-[#222] hidden lg:block ml-auto"></div>
                <div className="flex items-center gap-4 ml-auto lg:ml-0 flex-wrap">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">NGO PARTNERS</span>
                    <button 
                        onClick={() => setActiveNgo('all')}
                        className={`text-[11px] font-black uppercase tracking-widest px-4 py-1.5 border transition-all ${
                            activeNgo === 'all' ? 'bg-primary border-primary text-black' : 'border-[#2a2a2a] text-gray-400 hover:border-primary hover:text-primary'
                        }`}
                    >
                        All NGOs
                    </button>
                    <button 
                        onClick={() => setActiveNgo('keystone')}
                        className={`text-[11px] font-black uppercase tracking-widest px-4 py-1.5 border transition-all ${
                            activeNgo === 'keystone' ? 'bg-purple-600 border-purple-600 text-white' : 'border-purple-600/30 text-purple-400 hover:bg-purple-600 hover:text-white'
                        }`}
                    >
                        Keystone Foundation
                    </button>
                    <button 
                        onClick={() => setActiveNgo('sencholai')}
                        className={`text-[11px] font-black uppercase tracking-widest px-4 py-1.5 border transition-all ${
                            activeNgo === 'sencholai' ? 'bg-orange-600 border-orange-600 text-white' : 'border-orange-600/30 text-orange-400 hover:bg-orange-600 hover:text-white'
                        }`}
                    >
                        Sencholai
                    </button>
                </div>
            </div>

            {/* ARTISAN GRID */}
            <div className="max-w-7xl mx-auto px-8 py-16 md:py-24">
                <div className="flex justify-between items-baseline mb-10">
                    <h2 className="text-xl font-black uppercase tracking-[0.2em]">Our Artisans</h2>
                    <span className="text-xs tracking-widest uppercase text-gray-500">Showing {filtered.length} artisans</span>
                </div>

                {filtered.length === 0 ? (
                    <div className="text-center py-32 border-2 border-[#1a1a1a] bg-[#111]">
                        <p className="text-xl font-black italic uppercase tracking-widest text-gray-500 mb-4">No matching artisans found in network.</p>
                        <button onClick={() => { setActiveCat('all'); setActiveNgo('all'); }} className="text-xs uppercase tracking-widest text-primary hover:text-white transition-colors">Clear Filters</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[2px] bg-[#222] border-[2px] border-[#222]">
                        {filtered.map(artisan => (
                            <ArtisanCard key={artisan.id} artisan={artisan} onReadStory={() => setSelectedArtisan(artisan)} />
                        ))}
                    </div>
                )}
            </div>

            {/* MODAL */}
            <AnimatePresence>
                {selectedArtisan && (
                    <ArtisanModal artisan={selectedArtisan} onClose={() => setSelectedArtisan(null)} />
                )}
            </AnimatePresence>
        </div>
    );
}

function ArtisanCard({ artisan, onReadStory }) {
    const isGI = artisan.bio?.toLowerCase().includes('gi tag') || artisan.craft_type?.toLowerCase().includes('toda');
    const isKF = artisan.ngo_name?.toLowerCase().includes('keystone');
    const isSC = artisan.ngo_name?.toLowerCase().includes('sencholai');

    return (
        <div onClick={onReadStory} className="bg-[#0a0a0a] hover:bg-[#111] transition-colors duration-300 flex flex-col group cursor-pointer relative">
            <div className="h-64 relative overflow-hidden bg-black border-b border-[#222]">
                {artisan.image_url ? (
                    <img src={artisan.image_url} alt={artisan.store_name} className="w-full h-full object-cover filter grayscale-[25%] brightness-90 group-hover:scale-105 transition-transform duration-700" />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-800">
                        <span className="text-6xl mb-4 opacity-50">{getFallbackEmoji(artisan.craft_type)}</span>
                        <span className="text-[10px] uppercase tracking-widest font-black px-4 text-center">{artisan.craft_type}</span>
                    </div>
                )}
                
                {/* Top Overlays */}
                <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start">
                    {isGI && <span className="text-[9px] font-black tracking-widest uppercase px-2 py-1 bg-black/60 border border-primary/50 text-primary backdrop-blur-sm">GI Tagged</span>}
                    {isKF && <span className="text-[9px] font-black tracking-widest uppercase px-2 py-1 bg-purple-900/30 border border-purple-500/50 text-purple-300 backdrop-blur-sm ml-auto">Keystone</span>}
                    {isSC && <span className="text-[9px] font-black tracking-widest uppercase px-2 py-1 bg-orange-900/30 border border-orange-500/50 text-orange-300 backdrop-blur-sm ml-auto">Sencholai</span>}
                </div>

                {/* Bottom Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent">
                    <span className="text-[10px] font-black tracking-widest uppercase text-primary/90">{artisan.experience_years} Years Experience</span>
                </div>
            </div>

            <div className="p-6 flex-1 flex flex-col">
                <div className="text-[10px] font-black tracking-[0.2em] uppercase text-primary mb-2">{artisan.craft_type}</div>
                <h3 className="text-2xl font-black uppercase tracking-tight text-white mb-4 leading-none">{artisan.store_name}</h3>
                
                <div className="mb-4 pl-3 border-l-2 border-primary bg-primary/5 py-2 pr-2">
                    <p className="text-xs text-gray-400 italic line-clamp-2">"{artisan.bio?.split('.')[0] || "Dedicated to authentic craftsmanship."}"</p>
                </div>

                <div className="text-xs text-gray-500 leading-relaxed line-clamp-3 flex-1 mb-6">
                    {artisan.bio}
                </div>

                <div className="border-t border-[#1a1a1a] pt-4 mt-auto flex items-center justify-between">
                    <div>
                        <div className="text-[9px] tracking-widest uppercase text-gray-500 mb-1">Starting From</div>
                        <div className="text-lg font-black text-primary">₹{artisan.min_price || '---'}</div>
                    </div>
                    <button className="text-[10px] uppercase tracking-widest font-black border border-[#333] px-4 py-2 text-gray-400 group-hover:bg-primary group-hover:text-black group-hover:border-primary transition-colors">
                        Read Story ↗
                    </button>
                </div>
            </div>
        </div>
    );
}

function ArtisanModal({ artisan, onClose }) {
    const isGI = artisan.bio?.toLowerCase().includes('gi tag') || artisan.craft_type?.toLowerCase().includes('toda');
    const navigate = useNavigate();

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 md:p-8"
        >
            <motion.div 
                initial={{ y: 50, scale: 0.95 }}
                animate={{ y: 0, scale: 1 }}
                exit={{ y: 50, scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-[#0a0a0a] border border-[#222] max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            >
                <div className="relative h-64 md:h-80 bg-black">
                    <button onClick={onClose} className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/70 border border-[#333] text-white hover:bg-primary hover:text-black hover:border-primary transition-colors flex items-center justify-center text-xl">
                        ×
                    </button>
                    {artisan.image_url ? (
                        <img src={artisan.image_url} alt={artisan.store_name} className="w-full h-full object-cover filter grayscale-[15%] brightness-[0.85]" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-8xl opacity-20 relative">
                            {getFallbackEmoji(artisan.craft_type)}
                        </div>
                    )}
                </div>

                <div className="p-8 md:p-10">
                    <div className="text-[10px] font-black tracking-[0.3em] uppercase text-primary mb-2">{artisan.craft_type}</div>
                    <h2 className="text-4xl font-black uppercase tracking-tighter text-white leading-none mb-6">{artisan.store_name}</h2>
                    
                    <div className="flex gap-2 flex-wrap mb-8">
                        {isGI && <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-primary/10 border border-primary/30 text-primary">GI Tagged</span>}
                        <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-[#111] border border-[#222] text-gray-400">{artisan.experience_years} Years Practice</span>
                        {artisan.ngo_name && <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-white/5 border border-white/10 text-gray-300">Supported by {artisan.ngo_name}</span>}
                    </div>

                    <div className="text-[10px] font-black tracking-[0.3em] uppercase text-white border-b border-[#222] pb-2 mb-4">Heritage Narrative</div>
                    <p className="text-sm text-gray-400 leading-loose mb-8 whitespace-pre-wrap">{artisan.bio}</p>

                    {artisan.products && artisan.products.length > 0 && (
                        <>
                            <div className="text-[10px] font-black tracking-[0.3em] uppercase text-white border-b border-[#222] pb-2 mb-4">Product Catalogue Overview</div>
                            <div className="grid grid-cols-2 gap-2 mb-8">
                                {artisan.products.slice(0,6).map((p, i) => (
                                    <div key={i} className="bg-[#111] border border-[#1a1a1a] p-3 text-xs text-gray-400">{p}</div>
                                ))}
                            </div>
                        </>
                    )}

                    <div className="flex items-center justify-between border-t border-[#1a1a1a] pt-8 mt-4">
                        <div>
                            <div className="text-[10px] font-black tracking-[0.2em] uppercase text-gray-500 mb-1">Price Range</div>
                            <div className="text-2xl font-black text-primary">₹{artisan.min_price || 0} – ₹{artisan.max_price || 'Premium'}</div>
                        </div>
                        <button onClick={() => navigate(`/shop?search=${encodeURIComponent(artisan.store_name)}`)} className="bg-primary text-black font-black uppercase tracking-widest text-[11px] px-8 py-4 hover:bg-white transition-colors">
                            View Inventory ↗
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
