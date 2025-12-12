import React, { useState, useEffect } from "react";
import { Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import QuestDetail from "./pages/QuestDetail";
import Profile from "./pages/Profile";
import Leaderboard from "./pages/Leaderboard";
import SquadLeaderboard from "./pages/SquadLeaderboard";
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

  const NavLink = ({ to, label }: { to: string; label: string }) => {
     const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
     return (
        <Link 
            to={to} 
            className={`text-sm font-medium transition-colors ${isActive ? 'text-primary' : 'text-slate-400 hover:text-white'}`}
        >
            {label}
        </Link>
     );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background-dark text-white font-sans selection:bg-primary/30">
      {/* Navigation */}
      {!isOnboarding && (
        <nav className="sticky top-0 z-50 border-b border-white/5 bg-background-dark/80 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-8">
              <Link to="/dashboard" className="flex items-center gap-2 group">
                <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  <span className="material-symbols-outlined text-[20px]">rocket_launch</span>
                </div>
                <span className="text-lg font-bold tracking-tight">Base Missions</span>
              </Link>
              <div className="hidden md:flex items-center gap-1">
                <NavLink to="/dashboard" label="Quests" />
                <NavLink to="/leaderboard" label="Leaderboard" />
                <NavLink to="/squad" label="Squad" />
                <NavLink to="/profile" label="Profile" />
              </div>
            </div>

            <div className="flex items-center gap-4">
                {/* Streak Counter - only visible on dashboard typically but good everywhere */}
                <button className="hidden lg:flex group items-center gap-2 rounded-lg bg-card-dark border border-primary/30 px-4 py-2 text-sm font-bold text-white transition-all hover:border-primary hover:shadow-[0_0_15px_-5px_rgba(43,43,238,0.5)]">
                    <span className="material-symbols-outlined text-orange-500 text-[20px] group-hover:scale-110 transition-transform">local_fire_department</span>
                    <span>12 Day Streak</span>
                </button>

                <button 
                    onClick={walletAddress ? handleDisconnect : handleConnect}
                    className={`flex min-w-[84px] items-center justify-center rounded-lg h-10 px-4 text-sm font-bold transition-colors ${walletAddress ? 'bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer' : 'bg-primary text-white hover:bg-primary/90 shadow-[0_0_15px_rgba(43,43,238,0.3)]'}`}
                >
                    {walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : 'Connect Wallet'}
                </button>

                <Link to="/profile" className="relative size-10 overflow-hidden rounded-full border border-border-dark cursor-pointer bg-cover bg-center" style={{ backgroundImage: `url("${IMAGES.userProfile}")` }}>
                </Link>
            </div>
          </div>
        </nav>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative">
        <Routes>
          <Route path="/" element={<Onboarding />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/quest/:id" element={<QuestDetail />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/squad" element={<SquadLeaderboard />} />
        </Routes>
      </main>

      {/* Footer */}
      {!isOnboarding && (
         <footer className="border-t border-border-dark bg-[#111118] py-8">
            <div className="max-w-[1200px] mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2 text-text-secondary">
                    <span className="material-symbols-outlined">rocket_launch</span>
                    <span className="text-sm font-medium">© 2024 Base Odyssey. All rights reserved.</span>
                </div>
                <div className="flex gap-6">
                    <a href="#" className="text-text-secondary hover:text-white text-sm transition-colors">Privacy Policy</a>
                    <a href="#" className="text-text-secondary hover:text-white text-sm transition-colors">Terms of Service</a>
                    <a href="#" className="text-text-secondary hover:text-white text-sm transition-colors">Support</a>
                </div>
            </div>
        </footer>
      )}
    </div>
  );
};

export default App;
