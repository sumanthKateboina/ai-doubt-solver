// ============================================
// TransitionWrapper.jsx - Page Transitions
// ============================================
// Performs a hardware-accelerated horizontal slide-in
// entry transition whenever navigation occurs.
// ============================================

import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export default function TransitionWrapper({ children }) {
  const [animationKey, setAnimationKey] = useState(0);
  const location = useLocation();

  useEffect(() => {
    // Incrementing key forces the container to re-mount,
    // which restarts the slide-in CSS animation on route change.
    setAnimationKey(prev => prev + 1);
  }, [location.pathname]);

  return (
    <div key={animationKey} className="animate-page-slide min-h-screen">
      {children}
    </div>
  );
}
