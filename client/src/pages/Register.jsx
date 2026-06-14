// ============================================
// Register.jsx - Registration Page
// ============================================
// Multi-field registration form with grade
// selector and optional subject tag toggling.
// Calls register() from AuthContext on submit.
// ============================================

import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Brain, Eye, EyeOff, Loader2 } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';

const GRADES   = ['8th', '9th', '10th', '11th', '12th', 'College', 'Other'];
const SUBJECTS = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology',
  'History', 'Geography', 'English', 'Computer Science', 'Economics',
];

export default function Register() {
  const [form, setForm] = useState({
    name: '', email: '', password: '', grade: 'Other', subjects: [],
  });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const toggleSubject = (sub) => {
    setForm(prev => {
      const isSelected = prev.subjects.includes(sub);
      return {
        ...prev,
        subjects: isSelected
          ? prev.subjects.filter(s => s !== sub)
          : [...prev.subjects, sub]
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error('All fields are required');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created! Welcome aboard!');
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl text-white">AI Doubt Solver</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Create your account</h1>
          <p className="text-slate-400 text-sm mt-1">Start solving doubts with AI</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-350 mb-1.5">Full Name *</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Your name"
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-350 mb-1.5">Email *</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-350 mb-1.5">Password *</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min. 6 characters"
                  className="input-field pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-350 mb-1.5">Grade</label>
              <select name="grade" value={form.grade} onChange={handleChange} className="input-field bg-slate-950 text-slate-100">
                {GRADES.map(g => <option key={g} value={g} className="bg-slate-900 text-slate-100">{g}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-350 mb-2">Subjects (optional)</label>
              <div className="flex flex-wrap gap-2">
                {SUBJECTS.map(sub => (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => toggleSubject(sub)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
                      form.subjects.includes(sub)
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20'
                        : 'bg-slate-955 text-slate-300 border-slate-800 hover:border-indigo-500/50 hover:text-indigo-400'
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 mt-2">
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Creating account...</>
              ) : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-400 font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
