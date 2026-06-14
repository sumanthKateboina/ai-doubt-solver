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
    <nav className="bg-slate-950/60 backdrop-blur-md border-b border-slate-850/80 sticky top-0 z-20 shadow-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-tr from-indigo-600 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-white hidden sm:block">AI Doubt Solver</span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <Link
            to="/dashboard"
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-850 rounded-lg transition-colors"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span className="hidden sm:block">Dashboard</span>
          </Link>

          {/* User avatar / dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(p => !p)}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 hover:bg-slate-850 rounded-lg transition-colors"
            >
              <div className="w-7 h-7 bg-indigo-950/60 border border-indigo-500/20 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-indigo-400" />
              </div>
              <span className="text-sm font-medium text-slate-300 hidden sm:block">
                {user?.name?.split(' ')[0]}
              </span>
            </button>

            {showMenu && (
              <>
                {/* Click-outside overlay */}
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-full mt-1 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-1 w-48 z-20">
                  <div className="px-3 py-2 border-b border-slate-850">
                    <p className="font-semibold text-sm text-white">{user?.name}</p>
                    <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                    {user?.grade && (
                      <p className="text-xs text-indigo-400 mt-0.5">Grade: {user.grade}</p>
                    )}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-950/20 transition-colors"
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

