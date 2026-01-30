import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff } from 'lucide-react';

export default function OfflineBanner() {
    const [isOffline, setIsOffline] = useState(!navigator.onLine);

    useEffect(() => {
        const handleOffline = () => setIsOffline(true);
        const handleOnline = () => setIsOffline(false);

        window.addEventListener('offline', handleOffline);
        window.addEventListener('online', handleOnline);

        return () => {
            window.removeEventListener('offline', handleOffline);
            window.removeEventListener('online', handleOnline);
        };
    }, []);

    return (
        <AnimatePresence>
            {isOffline && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="bg-black text-primary text-center py-3 text-[10px] font-black uppercase tracking-[0.4em] italic flex items-center justify-center gap-4 border-b-2 border-primary"
                >
                    <WifiOff size={14} strokeWidth={3} />
                    LEDGER DISCONNECTED / PROTOCOL OPERATING IN LOCAL BUFFER MODE
                </motion.div>
            )}
        </AnimatePresence>
    );
}
