import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useState, useEffect } from 'react';
import { Search, User, ShoppingBag, LogOut, Menu, Mic, X } from 'lucide-react';

export default function Navbar() {
    const { user, logout } = useAuth();
    const { cartItems } = useCart();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/shop?search=${searchTerm}`);
            setIsMobileMenuOpen(false);
        }
    };

    const handleVoiceSearch = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            alert("Your browser does not support voice search. Please use Chrome or Edge.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        setIsListening(true);

        recognition.onstart = () => {
            console.log("Voice recognition started");
        }

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setSearchTerm(transcript);
            navigate(`/shop?search=${transcript}`);
            setIsListening(false);
        };

        recognition.onerror = (event) => {
            console.error("Voice recognition error", event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.start();
    };


    return (
        <div className="flex flex-col relative">
            {/* Top Announcement Banner */}
            <div className="bg-primary py-2.5 text-center relative overflow-hidden">
                <div className="flex justify-center items-center gap-12 text-[9px] font-black uppercase tracking-[0.3em] text-black italic animate-marquee">
                    <span className="whitespace-nowrap">AUTHENTIC CRAFT LEDGER</span>
                    <span className="whitespace-nowrap">•</span>
                    <span className="whitespace-nowrap">FREE SHIPPING ON MASTERPIECES</span>
                    <span className="whitespace-nowrap">•</span>
                    <span className="whitespace-nowrap">DIRECT-FROM-ARTISAN PROTOCOL</span>
                    <span className="whitespace-nowrap">•</span>
                    <span className="whitespace-nowrap">ESTABLISHED MMXXIV VARNA</span>
                </div>
            </div>

            <nav className="bg-white border-b-2 border-black sticky top-0 z-50 py-6">
                <div className="max-w-7xl mx-auto flex items-center justify-between px-8">
                    {/* Left: Nav Links */}
                    <div className="hidden lg:flex items-center gap-10 font-black text-[10px] uppercase tracking-[0.25em] italic">
                        <Link to="/shop" className="hover:text-primary transition-colors border-b-2 border-transparent hover:border-black pb-1">COLLECTION</Link>
                        <Link to="/shop?category=Pottery" className="hover:text-primary transition-colors border-b-2 border-transparent hover:border-black pb-1">POTTERY</Link>
                        <Link to="/shop?category=Textile" className="hover:text-primary transition-colors border-b-2 border-transparent hover:border-black pb-1">TEXTILES</Link>
                        <Link to="/shop?category=Decor" className="hover:text-primary transition-colors border-b-2 border-transparent hover:border-black pb-1">DECOR</Link>
                    </div>

                    {/* Center: Logo */}
                    <div className="flex-1 lg:flex-none flex justify-center lg:absolute lg:left-1/2 lg:-translate-x-1/2">
                        <Link to="/" className="group flex items-center gap-2">
                            <span className="text-4xl font-black italic tracking-tighter text-black transition-all group-hover:blur-[1px]">VARNA.</span>
                        </Link>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-8">
                        {/* Search Bar - Minimalist */}
                        <form onSubmit={handleSearch} className="hidden md:flex relative group items-center bg-gray-50 border-b-2 border-transparent focus-within:border-black transition-all">
                            <input
                                type="text"
                                placeholder="SEARCH ARCHIVE"
                                className="w-32 focus:w-48 transition-all duration-500 bg-transparent text-black placeholder-gray-400 text-[10px] font-black uppercase tracking-widest px-4 py-2 outline-none italic"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <button type="button" onClick={handleVoiceSearch} className={`mr-2 transition-colors ${isListening ? 'text-red-600 animate-pulse' : 'text-gray-400 hover:text-black'}`}>
                                <Mic size={14} strokeWidth={3} />
                            </button>
                            <button type="submit" className="pr-3 text-gray-400 group-hover:text-black transition-colors">
                                <Search size={14} strokeWidth={3} />
                            </button>
                        </form>

                        <div className="flex items-center gap-6">
                            {/* Profile */}
                            <Link to={user ? (user.role === 'CUSTOMER' ? "/profile" : "/dashboard") : "/auth/login"} className="flex items-center gap-2 group">
                                <User size={20} strokeWidth={2.5} className="group-hover:text-primary transition-colors" />
                                <span className="hidden sm:block text-[10px] font-black uppercase tracking-widest italic pt-1">
                                    {user ? (user.full_name?.split(' ')[0] || 'IDENTIFIED') : 'ACCESS'}
                                </span>
                            </Link>

                            {/* Cart */}
                            <Link to="/cart" className="relative group flex items-center gap-2">
                                <ShoppingBag size={20} strokeWidth={2.5} className="group-hover:text-primary transition-colors" />
                                {cartItems.length > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-black text-white font-black text-[8px] w-4 h-4 flex items-center justify-center italic">
                                        {cartItems.length}
                                    </span>
                                )}
                                <span className="hidden sm:block text-[10px] font-black uppercase tracking-widest italic pt-1">BAG</span>
                            </Link>

                            {user && (
                                <button onClick={logout} className="text-gray-300 hover:text-black transition-colors md:block hidden">
                                    <LogOut size={18} strokeWidth={2.5} />
                                </button>
                            )}

                            {/* Mobile Menu Icon */}
                            <button
                                className="lg:hidden text-black pt-1 z-50 relative"
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            >
                                {isMobileMenuOpen ? <X size={24} strokeWidth={3} /> : <Menu size={24} strokeWidth={3} />}
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 bg-white z-40 flex flex-col pt-32 px-8 lg:hidden animate-in slide-in-from-top-10 fade-in duration-300">
                    <div className="flex flex-col gap-8 text-2xl font-black uppercase tracking-tighter italic">
                        <form onSubmit={handleSearch} className="flex relative group items-center bg-gray-50 border-b-2 border-black mb-8">
                            <input
                                type="text"
                                placeholder="SEARCH ARCHIVE"
                                className="w-full bg-transparent text-black placeholder-gray-400 text-sm font-black uppercase tracking-widest px-4 py-4 outline-none italic"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <button type="button" onClick={handleVoiceSearch} className={`mr-4 transition-colors ${isListening ? 'text-red-600 animate-pulse' : 'text-gray-400'}`}>
                                <Mic size={20} strokeWidth={3} />
                            </button>
                            <button type="submit" className="pr-4 text-black">
                                <Search size={20} strokeWidth={3} />
                            </button>
                        </form>

                        <Link to="/shop" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-primary transition-colors">COLLECTION</Link>
                        <Link to="/shop?category=Pottery" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-primary transition-colors">POTTERY</Link>
                        <Link to="/shop?category=Textile" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-primary transition-colors">TEXTILES</Link>
                        <Link to="/shop?category=Decor" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-primary transition-colors">DECOR</Link>

                        {user && (
                            <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="text-left text-gray-400 hover:text-red-600 transition-colors mt-8 text-sm tracking-widest">
                                DISCONNECT SESSION (LOGOUT)
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
