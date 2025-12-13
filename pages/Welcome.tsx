import React from "react";
import { Link } from "react-router-dom";

const Welcome = () => {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[20%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[100px] animate-pulse-glow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/10 blur-[120px] animate-pulse-glow" style={{ animationDelay: "2s" }}></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12 flex-grow flex flex-col items-center justify-center text-center">
        
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-4">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-sm font-medium text-slate-300">Live on Base Mainnet</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black tracking-tight font-display bg-gradient-to-br from-white via-white/90 to-white/50 bg-clip-text text-transparent leading-[1.1]">
            Master the Base Ecosystem
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Complete daily quests, earn XP, and collect exclusive badges. 
            Join the community of builders and explorers shaping the future.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Link 
              to="/onboarding"
              className="group relative px-8 py-4 bg-primary hover:bg-primary-hover text-white font-bold rounded-2xl shadow-[0_0_40px_-10px_rgba(79,70,229,0.5)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_60px_-15px_rgba(79,70,229,0.6)] flex items-center gap-3 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:animate-shine"></div>
              <span className="text-lg">Start Your Journey</span>
              <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </Link>
            
            <a 
              href="https://base.org" 
              target="_blank" 
              rel="noreferrer"
              className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-medium rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300 backdrop-blur-sm"
            >
              Learn about Base
            </a>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 w-full max-w-6xl">
          <FeatureCard 
            icon="rocket_launch"
            title="Daily Quests"
            description="New challenges every 24 hours. Test your knowledge and on-chain skills."
          />
          <FeatureCard 
            icon="military_tech"
            title="Earn Rewards"
            description="Collect XP and exclusive NFTs. Climb the ranks to unlock special perks."
          />
          <FeatureCard 
            icon="groups"
            title="Squad Goals"
            description="Team up with friends. Compete in squad leaderboards for massive prizes."
          />
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: string, title: string, description: string }) => (
  <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-primary/30 hover:bg-white/10 transition-all duration-300 group text-left">
    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
      <span className="material-symbols-outlined text-primary text-3xl">{icon}</span>
    </div>
    <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
    <p className="text-slate-400 leading-relaxed">{description}</p>
  </div>
);

export default Welcome;
