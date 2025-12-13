import React, { useState, useEffect } from "react";
import { Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import QuestDetail from "./pages/QuestDetail";
import Profile from "./pages/Profile";
import Leaderboard from "./pages/Leaderboard";
import SquadLeaderboard from "./pages/SquadLeaderboard";
import Lottery from "./pages/Lottery";
import { IMAGES } from "./constants";
import { getConnectedWallet, connectCoinbaseWallet, disconnectWallet } from "./services/wallet";
import { getUser } from "./services/api";

const App = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isOnboarding = location.pathname === "/";
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  useEffect(() => {
    const w = getConnectedWallet();
    if (w.address) {
      setWalletAddress(w.address);
    }
  }, []);

  const handleConnect = async () => {
    try {
      const { address } = await connectCoinbaseWallet();
      setWalletAddress(address);
      
      // Check if user exists, if not redirect to onboarding
      try {
        const user = await getUser(address);
        if (!user) {
           navigate("/");
        }
      } catch {
         // If error checking user, safe to assume might need onboarding or just stay
      }
    } catch (e) {
      console.error("Failed to connect wallet", e);
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    setWalletAddress(null);
    navigate("/");
  };

  const NavLink = ({ to, label, icon }: { to: string; label: string; icon?: string }) => {
     const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
     return (
        <Link 
            to={to} 
            className={`
                relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 group
                ${isActive 
                    ? 'bg-primary text-white shadow-lg shadow-primary/25 translate-y-[-1px]' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }
            `}
        >
            {icon && (
                <span className={`material-symbols-outlined text-[18px] transition-transform duration-300 ${isActive ? '' : 'group-hover:scale-110'}`}>
                    {icon}
                </span>
            )}
            <span>{label}</span>
            {isActive && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white/50"></div>
            )}
        </Link>
     );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#0A0A0F] text-white font-sans selection:bg-primary/30 relative overflow-hidden">
      {/* Global Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[20%] w-[60%] h-[60%] rounded-full bg-primary/5 blur-[120px] animate-pulse-glow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/5 blur-[120px] animate-pulse-glow" style={{ animationDelay: "2s" }}></div>
      </div>

      {/* Navigation */}
      {!isOnboarding && (
        <nav className="sticky top-4 z-50 mx-4 lg:mx-auto max-w-7xl transition-all duration-300">
          <div className="bg-[#13131F]/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/50 px-4 py-3 lg:px-6">
            <div className="flex items-center justify-between">
                {/* Left: Logo */}
                <Link to="/dashboard" className="flex items-center gap-3 group shrink-0">
                    <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-glow text-white shadow-lg shadow-primary/20 group-hover:scale-110 transition-all duration-300 border border-white/10">
                        <span className="material-symbols-outlined text-[24px]">rocket_launch</span>
                    </div>
                    <span className="text-xl font-bold tracking-tight font-display bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent hidden sm:block">
                        Base Missions
                    </span>
                </Link>

                {/* Center: Navigation Links */}
                <div className="hidden xl:flex items-center gap-1 bg-black/20 p-1.5 rounded-2xl border border-white/5 backdrop-blur-sm">
                    <NavLink to="/dashboard" label="Quests" icon="explore" />
                    <NavLink to="/leaderboard" label="Leaderboard" icon="leaderboard" />
                    <NavLink to="/squad" label="Squad" icon="groups" />
                    <NavLink to="/lottery" label="Lottery" icon="casino" />
                    <NavLink to="/profile" label="Profile" icon="person" />
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-4 shrink-0">
                    {/* Streak Counter (Compact) */}
                    <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400">
                        <span className="material-symbols-outlined text-[18px]">local_fire_department</span>
                        <span className="text-xs font-bold">Active</span>
                    </div>

                    <div className="h-6 w-[1px] bg-white/10 hidden md:block"></div>

                    {/* Wallet Button */}
                    <button 
                        onClick={walletAddress ? handleDisconnect : handleConnect}
                        className={`
                            relative flex items-center justify-center gap-2 rounded-xl h-10 px-4 text-sm font-bold transition-all duration-300 overflow-hidden group
                            ${walletAddress 
                                ? 'bg-[#1A1A24] text-slate-300 border border-white/10 hover:border-white/20 hover:text-white hover:bg-white/5' 
                                : 'bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/20'
                            }
                        `}
                    >
                        {walletAddress ? (
                            <>
                                <div className="size-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse"></div>
                                <span className="font-mono">{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
                                <span className="material-symbols-outlined text-[16px] text-slate-500 group-hover:text-white transition-colors">logout</span>
                            </>
                        ) : (
                            <>
                                <span>Connect</span>
                                <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
                            </>
                        )}
                    </button>

                    {/* Mobile Menu Button (Visible on small screens) */}
                    <div className="xl:hidden">
                         <Link to="/profile" className="size-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                            <span className="material-symbols-outlined text-white">menu</span>
                         </Link>
                    </div>
                </div>
            </div>
          </div>
          
          {/* Mobile Navigation (Bottom Bar) */}
          <div className="xl:hidden fixed bottom-6 left-6 right-6 z-50">
             <div className="bg-[#13131F]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/50 p-2 flex justify-between items-center">
                <Link to="/dashboard" className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${location.pathname === '/dashboard' ? 'text-primary bg-primary/10' : 'text-slate-400'}`}>
                    <span className="material-symbols-outlined">explore</span>
                </Link>
                <Link to="/leaderboard" className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${location.pathname === '/leaderboard' ? 'text-primary bg-primary/10' : 'text-slate-400'}`}>
                    <span className="material-symbols-outlined">leaderboard</span>
                </Link>
                <Link to="/squad" className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${location.pathname === '/squad' ? 'text-primary bg-primary/10' : 'text-slate-400'}`}>
                    <span className="material-symbols-outlined">groups</span>
                </Link>
                <Link to="/lottery" className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${location.pathname === '/lottery' ? 'text-primary bg-primary/10' : 'text-slate-400'}`}>
                    <span className="material-symbols-outlined">casino</span>
                </Link>
                <Link to="/profile" className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${location.pathname === '/profile' ? 'text-primary bg-primary/10' : 'text-slate-400'}`}>
                    <span className="material-symbols-outlined">person</span>
                </Link>
             </div>
          </div>
        </nav>
      )}

      {/* Main Content */}
      <main className="flex-grow z-10">
        <Routes>
          <Route path="/" element={<Onboarding />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/quest/:id" element={<QuestDetail />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/squad" element={<SquadLeaderboard />} />
          <Route path="/lottery" element={<Lottery />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>

      {/* Footer */}
      {!isOnboarding && (
         <footer className="border-t border-border-dark bg-[#111118] py-8">
            <div className="max-w-[1200px] mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2 text-text-secondary">
                    <span className="material-symbols-outlined">rocket_launch</span>
                    <span className="text-sm font-medium">© 2025 Base Mission. All rights reserved.</span>
                </div>
                <div className="flex gap-8 text-sm text-text-secondary">
                    <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                    <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                    <a href="#" className="hover:text-white transition-colors">Support</a>
                </div>
            </div>
         </footer>
      )}
    </div>
  );
};

export default App;
