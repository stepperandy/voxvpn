import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';


export default function PageNotFound() {
    const location = useLocation();

    // Auto-redirect unknown routes to home after 1.5s
    useEffect(() => {
        const timer = setTimeout(() => { window.location.href = '/'; }, 1500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[#0a1628]">
            <div className="text-center space-y-4">
                <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-white text-lg font-medium">Redirecting...</p>
                <p className="text-gray-400 text-sm">Taking you to the home screen</p>
            </div>
        </div>
    );
}