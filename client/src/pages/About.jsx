import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
    ShieldCheck, 
    Cpu, 
    Network, 
    Users, 
    TrendingUp, 
    Package, 
    ArrowRight 
} from 'lucide-react';

export default function About() {
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const FeatureBlock = ({ icon: Icon, title, description, borderRight }) => (
        <div className={`p-10 md:p-16 border-b-2 border-black ${borderRight ? 'md:border-r-2' : ''} bg-white hover:bg-black hover:text-white transition-colors duration-700 group cursor-default`}>
            <Icon size={40} strokeWidth={1} className="mb-8 text-black group-hover:text-primary transition-colors duration-700" />
            <h3 className="text-xl font-black italic uppercase tracking-tighter mb-4 leading-tight">{title}</h3>
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500 group-hover:text-gray-400 leading-loose transition-colors duration-700">
                {description}
            </p>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="bg-black text-white px-8 py-32 md:py-48 text-center border-b-8 border-primary relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 flex items-center justify-center pointer-events-none">
                    <span className="text-[15rem] md:text-[30rem] font-black italic tracking-tighter text-white select-none mix-blend-overlay">MISSION</span>
                </div>
                
                <motion.div 
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 1 }}
                    className="relative z-10 max-w-4xl mx-auto"
                >
                    <h3 className="text-[10px] md:text-sm font-black uppercase tracking-[1em] text-primary mb-8 italic">OUR PURPOSE</h3>
                    <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-none mb-8">
                        REWIRING <br/> THE SUPPLY CHAIN.
                    </h1>
                    <p className="text-xs md:text-sm font-black uppercase tracking-widest text-gray-400 leading-loose max-w-2xl mx-auto">
                        Varna is a digital ecosystem built to eliminate middlemen, protect cultural integrity, and enforce absolute financial transparency for rural artisans.
                    </p>
                </motion.div>
            </div>

            <div className="max-w-7xl mx-auto border-x-2 border-black">
                <div className="grid grid-cols-1 md:grid-cols-2">
                    <FeatureBlock 
                        icon={Network}
                        title="Zero Intermediaries"
                        description="By connecting master artisans directly to global consumers, we secure 100% of profits for the creators. No middlemen. No exploitative markups. Just pure trade."
                        borderRight={true}
                    />
                    <FeatureBlock 
                        icon={ShieldCheck}
                        title="Immutable Ledger"
                        description="Every single artifact sold on Varna undergoes cryptographic hashing. Buyers can scan their digital receipt to verify its exact origin, material, and creator on the ledger."
                        borderRight={false}
                    />
                    <FeatureBlock 
                        icon={Cpu}
                        title="Generative AI Integration"
                        description="Varna utilizes large language models to securely analyze product metadata, generating rich cultural context notes and optimizing artisan marketplace listings for better reach."
                        borderRight={true}
                    />
                    <FeatureBlock 
                        icon={Users}
                        title="NGO Onboarding Workflows"
                        description="We built a dedicated portal for Non-Governmental Organizations to safely onboard disconnected rural artisans, manage their logistics, and bridge their digital literacy gap."
                        borderRight={false}
                    />
                    <FeatureBlock 
                        icon={Package}
                        title="Integrated Logistics"
                        description="From the moment a product leaves an artisan's workshop, our fulfillment dashboard tracks the tracking number, courier, and proof-of-dispatch in real-time."
                        borderRight={true}
                    />
                    <FeatureBlock 
                        icon={TrendingUp}
                        title="Creator-First Economy"
                        description="This isn't just an e-commerce store. It is a data-driven toolkit giving artisans direct access to market analytics, stock health metrics, and their own customer acquisition graphs."
                        borderRight={false}
                    />
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-8 mt-24 mb-24">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    <motion.div 
                        whileHover={{ scale: 1.02 }}
                        className="lg:col-span-7 aspect-video border-4 border-black bg-black overflow-hidden"
                    >
                        <img 
                            src="https://images.unsplash.com/photo-1533669955142-6a73332af4db?q=80&w=1200" 
                            alt="Artisan Craftsmanship" 
                            className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000"
                        />
                    </motion.div>
                    
                    <div className="lg:col-span-5 space-y-8">
                        <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-black leading-tight border-b-4 border-primary pb-6">
                            THE GOLD <br/> STANDARD.
                        </h2>
                        <div className="space-y-6 text-sm font-bold text-gray-600 tracking-widest leading-loose uppercase">
                            <p>
                                Mass production has eroded the perceived value of true craftsmanship. Countless imitations flood the market while the actual artisans remain in poverty. 
                            </p>
                            <p>
                                Varna solves this by merging ancient craftsmanship with modern cryptographic authentication. When you purchase from Varna, you aren't just buying decor—you are buying a verified piece of geographical heritage.
                            </p>
                        </div>
                        <button 
                            onClick={() => navigate('/shop')} 
                            className="mt-4 flex items-center gap-4 bg-black text-white px-8 py-5 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-primary hover:text-black transition-colors italic border-2 border-black"
                        >
                            EXPLORE THE ARCHIVES <ArrowRight size={16} strokeWidth={3} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-8">
                <div className="bg-primary border-4 border-black p-12 md:p-24 text-center">
                    <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-black mb-8">
                        ARE YOU AN ARTISAN <br /> OR AN NGO?
                    </h2>
                    <p className="text-xs md:text-sm font-black uppercase tracking-widest text-black/80 max-w-2xl mx-auto leading-loose mb-12">
                        Join the portal. Take full control of your supply chain and bring your cultural heritage to the global stage today.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-6 justify-center">
                        <button onClick={() => navigate('/auth/register')} className="bg-black text-white px-10 py-5 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-colors italic border-2 border-black">
                            JOIN THE NETWORK
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
