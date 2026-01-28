import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);

    useEffect(() => {
        const storedCart = localStorage.getItem('cart');
        if (storedCart) {
            setCartItems(JSON.parse(storedCart));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (product) => {
        // Check existence using current state snapshot (good enough for UI actions)
        const existing = cartItems.find(item => item.id === product.id);

        if (existing) {
            toast.success('Increased quantity');
            setCartItems(prev => prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
        } else {
            toast.success('Added to cart');
            setCartItems(prev => [...prev, { ...product, qty: 1 }]);
        }
    };

    const removeFromCart = (id) => {
        setCartItems(prev => prev.filter(item => item.id !== id));
        toast.success('Removed from cart');
    };

    const updateQuantity = (id, qty) => {
        setCartItems(prev => prev.map(item => {
            if (item.id === id) {
                return { ...item, qty: Math.max(1, qty) };
            }
            return item;
        }));
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const total = cartItems.reduce((acc, item) => acc + (Number(item.base_price) * item.qty), 0);

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, total }}>
            {children}
        </CartContext.Provider>
    );
};
