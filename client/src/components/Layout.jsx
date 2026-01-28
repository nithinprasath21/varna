import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import OfflineBanner from './OfflineBanner';

export default function Layout() {
    const location = useLocation();

    // Hide navbar on auth pages only if desired, but "Amazon" usually keeps it or simplified version.
    // For now, we show it everywhere except maybe Dashboard if we want a different layout there.
    // Let's keep it global for consistency.

    return (
        <div className="min-h-screen flex flex-col font-sans text-neutral-900 bg-background">
            <OfflineBanner />
            <Navbar />
            <main className="flex-grow">
                <Outlet />
            </main>
            <footer className="bg-neutral-900 text-gray-400 py-12 text-center text-sm">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-left px-8">
                    <div>
                        <h4 className="text-white font-bold mb-4">Get to Know Us</h4>
                        <ul className="space-y-2">
                            <li>About VARNA</li>
                            <li>Careers</li>
                            <li>Press Releases</li>
                            <li>Varna Science</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-4">Connect with Us</h4>
                        <ul className="space-y-2">
                            <li>Facebook</li>
                            <li>Twitter</li>
                            <li>Instagram</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-4">Make Money with Us</h4>
                        <ul className="space-y-2">
                            <li>Sell on VARNA</li>
                            <li>Become an Affiliate</li>
                            <li>Fulfilment by VARNA</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-4">Let Us Help You</h4>
                        <ul className="space-y-2">
                            <li>Your Account</li>
                            <li>Returns Centre</li>
                            <li>Help</li>
                        </ul>
                    </div>
                </div>
                <hr className="border-gray-800 mb-8 max-w-7xl mx-auto" />
                <p>&copy; {new Date().getFullYear()} VARNA. All rights reserved.</p>
            </footer>
        </div>
    );
}
