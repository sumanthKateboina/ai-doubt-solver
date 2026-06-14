// ============================================
// Navbar.jsx - Top Navigation Bar
// ============================================
// Sticky top bar with logo, dashboard link,
// and a user avatar dropdown with sign-out.
// ============================================

import { Link, useNavigate } from 'react-router-dom';
import { Brain, LogOut, User, LayoutDashboard } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { useState, useContext } from 'react';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white/75 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 rounded-lg flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Brain className="w-5 h-5 text-slate-950" />
          </div>
          <span className="font-bold text-slate-800 hover:text-amber-500 transition-colors hidden sm:block">AI Doubt Solver</span>
        </Link>
 
        {/* Right side */}
        <div className="flex items-center gap-2">
          <Link
            to="/dashboard"
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span className="hidden sm:block">Dashboard</span>
          </Link>
 
          {/* User avatar / dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(p => !p)}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <div className="w-7 h-7 bg-amber-100 border border-amber-500/30 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-amber-600" />
              </div>
              <span className="text-sm font-medium text-slate-600 hidden sm:block">
                {user?.name?.split(' ')[0]}
              </span>
            </button>
 
            {showMenu && (
              <>
                {/* Click-outside overlay */}
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-2xl py-1 w-48 z-20">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="font-semibold text-sm text-slate-800">{user?.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                    {user?.grade && (
                      <p className="text-xs text-amber-600 mt-0.5">Grade: {user.grade}</p>
                    )}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

