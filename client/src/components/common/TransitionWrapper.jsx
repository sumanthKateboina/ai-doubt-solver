// ============================================
// TransitionWrapper.jsx - Snake Page Transitions
// ============================================
// Performs a multi-layered slithering visual wipe
// whenever a student navigates between pages.
// ============================================

import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export default function TransitionWrapper({ children }) {
  const [animating, setAnimating] = useState(true);
  const location = useLocation();

  useEffect(() => {
    setAnimating(true);
    const timer = setTimeout(() => {
      setAnimating(false);
    }, 800); // Transition duration
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div className="relative overflow-hidden min-h-screen">
      {animating && (
        <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
          {/* Snake Layer 1 - Deep Royal Blue */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-blue-900 to-indigo-950 animate-slither-1 opacity-95" />
          {/* Snake Layer 2 - Metallic Gold */}
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 animate-slither-2 opacity-95" />
          {/* Snake Layer 3 - Royal Purple */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-950 animate-slither-3" />
        </div>
      )}
      <div className="animate-page-reveal min-h-screen">
        {children}
      </div>
    </div>
  );
}
