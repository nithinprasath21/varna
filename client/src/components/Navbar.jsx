import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useState } from 'react';

export default function Navbar() {
    const { user, logout } = useAuth();
    const { cartItems } = useCart();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        navigate(`/shop?search=${searchTerm}`);
    };

    return (
        <nav className="bg-neutral-900 text-white sticky top-0 z-50 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
                {/* Logo */}
                <Link to="/" className="text-2xl font-display font-bold tracking-tight text-white hover:text-gray-200">
                    VARNA
                </Link>

                {/* Search Bar */}
                <form onSubmit={handleSearch} className="flex-grow max-w-2xl hidden md:flex">
                    <div className="relative w-full">
                        <input
                            type="text"
                            placeholder="Search for handcrafted items..."
                            className="w-full h-10 px-4 rounded-l-md text-black focus:outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button type="submit" className="absolute right-0 top-0 h-10 px-6 bg-primary hover:bg-accent rounded-r-md transition-colors font-bold">
                            Search
                        </button>
                    </div>
                </form>

                {/* Right Actions */}
                <div className="flex items-center gap-6">
                    <Link to="/shop" className="hover:text-primary transition-colors font-medium">Shop</Link>

                    {/* Account Dropdown / Login */}
                    {user ? (
                        <div className="relative group">
                            <button className="flex flex-col text-left">
                                <span className="text-xs text-gray-300">Hello, {user.role === 'CUSTOMER' ? 'User' : user.role}</span>
                                <span className="font-bold text-sm">Account & Lists</span>
                            </button>
                            {/* Dropdown Content */}
                            <div className="absolute right-0 w-48 bg-white text-black shadow-xl rounded-md overflow-hidden hidden group-hover:block transition-all transform origin-top-right">
                                {user.role !== 'CUSTOMER' ? (
                                    <Link to="/dashboard" className="block px-4 py-2 hover:bg-gray-100">Dashboard</Link>
                                ) : (
                                    <Link to="/profile" className="block px-4 py-2 hover:bg-gray-100">Your Profile</Link>
                                )}
                                <button onClick={logout} className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600">Logout</button>
                            </div>
                        </div>
                    ) : (
                        <Link to="/auth/login" className="flex flex-col text-left hover:text-primary">
                            <span className="text-xs text-gray-300">Hello, sign in</span>
                            <span className="font-bold text-sm">Account & Lists</span>
                        </Link>
                    )}

                    {/* Cart */}
                    <Link to="/cart" className="flex items-end gap-1 relative hover:text-primary">
                        <div className="relative">
                            <span className="text-2xl">🛒</span>
                            <span className="absolute -top-2 -right-2 bg-primary text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                                {cartItems.length}
                            </span>
                        </div>
                        <span className="font-bold hidden sm:block">Cart</span>
                    </Link>
                </div>
            </div>

            {/* Secondary Nav (Categories) */}
            <div className="bg-neutral-800 text-sm py-2 px-4 shadow-inner overflow-x-auto whitespace-nowrap scrollbar-hide">
                <div className="max-w-7xl mx-auto flex gap-6 text-gray-300">
                    <Link to="/shop" className="hover:text-white transition-colors">All</Link>
                    <Link to="/shop?category=Pottery" className="hover:text-white transition-colors">Pottery</Link>
                    <Link to="/shop?category=Textile" className="hover:text-white transition-colors">Textiles</Link>
                    <Link to="/shop?category=Woodwork" className="hover:text-white transition-colors">Woodwork</Link>
                    <Link to="/shop?category=Jewelry" className="hover:text-white transition-colors">Jewelry</Link>
                    <Link to="/shop?category=Decor" className="hover:text-white transition-colors">Home Decor</Link>
                </div>
            </div>
        </nav>
    );
}
