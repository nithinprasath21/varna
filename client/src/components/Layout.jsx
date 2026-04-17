import { Outlet, useLocation, Link } from 'react-router-dom';
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
                            <li><Link to="/about" className="hover:text-primary transition-colors block">Our Story</Link></li>
                            <li><Link to="/shop" className="hover:text-primary transition-colors block">Shop Artisans</Link></li>
                            <li><Link to="/about" className="hover:text-primary transition-colors block">Ledger Verification</Link></li>
                        </ul>
                    </div>

                    <div className="space-y-6">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-primary italic">II. PARTNERSHIPS</h4>
                        <ul className="space-y-4 text-xs font-black uppercase tracking-widest italic text-gray-500">
                            <li><Link to="/auth/register" className="hover:text-primary transition-colors block">Sell Products</Link></li>
                            <li><Link to="/auth/register" className="hover:text-primary transition-colors block">NGO Onboarding</Link></li>
                            <li><Link to="/auth/login" className="hover:text-primary transition-colors block">Portal Login</Link></li>
                        </ul>
                    </div>

                    <div className="space-y-6">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-primary italic">III. YOUR ACCOUNT</h4>
                        <ul className="space-y-4 text-xs font-black uppercase tracking-widest italic text-gray-500">
                            <li><Link to="/profile" className="hover:text-primary transition-colors block">User Profile</Link></li>
                            <li><Link to="/orders" className="hover:text-primary transition-colors block">Track Orders</Link></li>
                            <li><Link to="/cart" className="hover:text-primary transition-colors block">Shopping Cart</Link></li>
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
