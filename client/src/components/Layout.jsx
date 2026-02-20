import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import OfflineBanner from './OfflineBanner';

export default function Layout() {
    return (
        <div className="min-h-screen flex flex-col font-sans text-black bg-white">
            <OfflineBanner />
            <Navbar />
            <main className="flex-grow">
                <Outlet />
            </main>
            <footer className="bg-black text-white py-24 px-12">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16 text-left">
                    <div className="space-y-8 col-span-1 md:col-span-1">
                        <h3 className="text-4xl font-black italic tracking-tighter uppercase">VARNA.</h3>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] leading-relaxed text-gray-400 italic">
                            The authenticated ledger of human craft. Products direct from origin.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-primary italic">I. ABOUT US</h4>
                        <ul className="space-y-4 text-xs font-black uppercase tracking-widest italic text-gray-500">
                            <li className="hover:text-primary transition-colors cursor-pointer">Our Story</li>
                            <li className="hover:text-primary transition-colors cursor-pointer">Our Artisans</li>
                            <li className="hover:text-primary transition-colors cursor-pointer">How We Verify</li>
                            <li className="hover:text-primary transition-colors cursor-pointer">Sustainability</li>
                        </ul>
                    </div>

                    <div className="space-y-6">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-primary italic">II. SHOP</h4>
                        <ul className="space-y-4 text-xs font-black uppercase tracking-widest italic text-gray-500">
                            <li className="hover:text-primary transition-colors cursor-pointer">Sell Products</li>
                            <li className="hover:text-primary transition-colors cursor-pointer">Partner NGOs</li>
                            <li className="hover:text-primary transition-colors cursor-pointer">Logistics</li>
                        </ul>
                    </div>

                    <div className="space-y-6">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-primary italic">III. CUSTOMER SERVICE</h4>
                        <ul className="space-y-4 text-xs font-black uppercase tracking-widest italic text-gray-500">
                            <li className="hover:text-primary transition-colors cursor-pointer">Help Center</li>
                            <li className="hover:text-primary transition-colors cursor-pointer">Returns & Refunds</li>
                            <li className="hover:text-primary transition-colors cursor-pointer">Privacy Policy</li>
                        </ul>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto mt-24 pt-12 border-t border-gray-900 flex flex-col md:flex-row justify-between items-center gap-8">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-600 italic">
                        &copy; {new Date().getFullYear()} VARNA STORES / GLOBAL PROTOCOL
                    </p>
                    <div className="flex gap-12 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-700">
                        <span className="text-[10px] font-black tracking-widest italic">INSTA @VARNA</span>
                        <span className="text-[10px] font-black tracking-widest italic">TWITTER @VARNA</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
