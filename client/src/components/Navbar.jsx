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
        <div className="flex flex-col">
            <nav className="bg-[#131921] text-white sticky top-0 z-50">
                <div className="flex items-center gap-2 p-2">
                    {/* Logo */}
                    <Link to="/" className="px-2 border border-transparent hover:border-white rounded-sm flex flex-col items-center">
                        <span className="text-2xl font-display font-bold tracking-tight text-white leading-none">VARNA</span>
                        <span className="text-[10px] text-gray-300 -mt-1 tracking-widest text-right w-full">.in</span>
                    </Link>

                    {/* Deliver To */}
                    <div className="hidden md:flex flex-col px-2 border border-transparent hover:border-white rounded-sm cursor-pointer">
                        <span className="text-xs text-gray-300 ml-4">Deliver to</span>
                        <div className="flex items-center font-bold text-sm">
                            <span className="text-white mr-1">📍</span>
                            <span>{user?.addresses?.[0]?.city || 'India'}</span>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="flex-grow flex h-10 rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-[#F7CA00] mx-4">
                        <select className="bg-gray-100 text-gray-600 text-xs px-2 border-r border-gray-300 w-fit max-w-[50px] md:max-w-none focus:outline-none cursor-pointer hover:bg-gray-200">
                            <option>All</option>
                            <option>Pottery</option>
                            <option>Textiles</option>
                            <option>Woodwork</option>
                            <option>Jewelry</option>
                        </select>
                        <input
                            type="text"
                            placeholder="Search Varna.in..."
                            className="bg-white text-black px-3 py-2 flex-grow focus:outline-none placeholder-gray-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button type="submit" className="bg-[#FEBd69] hover:bg-[#F3A847] px-4 flex items-center justify-center text-slate-800">
                            🔍
                        </button>
                    </form>

                    {/* Right Actions */}
                    <div className="flex items-center gap-1 md:gap-4">
                        {/* Language - Mock */}
                        <div className="hidden md:flex items-end px-2 py-2 border border-transparent hover:border-white rounded-sm cursor-pointer gap-1">
                            <span className="text-sm font-bold">EN</span>
                        </div>

                        {/* Account */}
                        <Link to={user ? (user.role === 'CUSTOMER' ? "/profile" : "/dashboard") : "/auth/login"} className="px-2 py-1 border border-transparent hover:border-white rounded-sm">
                            <div className="text-xs text-gray-300">Hello, {user && user.full_name ? user.full_name.split(' ')[0] : 'Member'}</div>
                            <div className="font-bold text-sm leading-none">Account & Lists</div>
                        </Link>

                        {/* Returns & Orders */}
                        <Link to="/orders" className="hidden md:block px-2 py-1 border border-transparent hover:border-white rounded-sm">
                            <div className="text-xs text-gray-300">Returns</div>
                            <div className="font-bold text-sm leading-none">& Orders</div>
                        </Link>

                        {/* Cart */}
                        <Link to="/cart" className="flex items-end px-2 border border-transparent hover:border-white rounded-sm relative">
                            <div className="relative">
                                <span className="text-3xl font-bold">🛒</span>
                                <span className="absolute -top-1 left-1.5 text-[#F08804] font-bold text-base w-5 text-center">
                                    {cartItems.length}
                                </span>
                            </div>
                            <span className="font-bold text-sm mb-1 hidden sm:block">Cart</span>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Secondary Nav */}
            <div className="bg-[#232f3e] text-white flex items-center px-4 py-1.5 overflow-x-auto whitespace-nowrap scrollbar-hide text-sm gap-4">
                <div className="flex items-center gap-1 font-bold cursor-pointer hover:border hover:border-white px-1 rounded-sm">
                    <span>☰</span> All
                </div>
                <Link to="/shop?category=Pottery" className="px-2 border border-transparent hover:border-white rounded-sm cursor-pointer">Best Sellers</Link>
                <Link to="/shop?category=Textile" className="px-2 border border-transparent hover:border-white rounded-sm cursor-pointer">Textiles</Link>
                <Link to="/shop?category=Woodwork" className="px-2 border border-transparent hover:border-white rounded-sm cursor-pointer">Woodwork</Link>
                <Link to="/shop?category=Jewelry" className="px-2 border border-transparent hover:border-white rounded-sm cursor-pointer">Jewelry</Link>
                <Link to="/shop" className="px-2 border border-transparent hover:border-white rounded-sm cursor-pointer">New Releases</Link>
                <Link to="/shop" className="px-2 border border-transparent hover:border-white rounded-sm cursor-pointer hidden md:block">Home & Kitchen</Link>
                <Link to="/shop" className="px-2 border border-transparent hover:border-white rounded-sm cursor-pointer hidden md:block">Computers</Link>
                <Link to="/shop" className="px-2 border border-transparent hover:border-white rounded-sm cursor-pointer hidden md:block">Registry</Link>
            </div>
        </div>
    );
}
