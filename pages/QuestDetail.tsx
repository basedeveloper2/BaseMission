import React from "react";
import { Link } from "react-router-dom";
import { IMAGES } from "../constants";

const QuestDetail = () => {
  return (
    <div className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-[1200px] relative z-10">
      {/* Breadcrumbs */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm">
          <Link to="/dashboard" className="text-text-secondary font-bold hover:text-white transition-colors flex items-center gap-1 group">
            <div className="p-1 rounded-full bg-white/5 group-hover:bg-primary/20 transition-colors">
               <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            </div>
            Back to Quests
          </Link>
          <span className="text-white/20">/</span>
          <span className="text-white font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">Bridge to Base Alpha</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Context & Media */}
        <div className="lg:col-span-5 flex flex-col gap-8">
          {/* Main Visual */}
          <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl shadow-primary/10 border border-white/10 group">
            <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: `url("${IMAGES.bridgeBg}")` }}></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
            <div className="absolute bottom-6 left-6 right-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs font-bold text-white mb-3 shadow-lg">
                <span className="material-symbols-outlined text-[16px] text-primary animate-pulse">diamond</span>
                <span className="tracking-wide">RARE DROP</span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-black leading-tight tracking-tight mb-2 text-white font-display">Bridge to Base Alpha</h1>
            </div>
          </div>
          
          {/* Description */}
          <div className="glass-card p-6 rounded-2xl">
            <div className="prose prose-invert max-w-none text-text-secondary">
              <p className="mb-6 leading-relaxed text-lg">
                Initiate your journey by bridging ETH to the Base network. This is the first step in the Odyssey. Only those who cross the bridge can shape the future of the ecosystem.
              </p>
              <div className="relative pl-6 italic text-slate-400 border-l-2 border-primary/50">
                <span className="absolute -left-1.5 -top-3 text-4xl text-primary/20 font-serif">"</span>
                The bridge is not just a path, it is a test of resolve. Cross it, and leave the old world behind.
              </div>
            </div>
          </div>

          {/* Rewards Preview */}
          <div className="glass-card p-6 rounded-2xl">
            <h3 className="text-xs font-bold uppercase tracking-widest text-text-secondary mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">redeem</span>
                Quest Rewards
            </h3>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-full flex items-center gap-4 bg-black/20 p-4 rounded-xl border border-white/5 group hover:border-primary/30 transition-all">
                <div className="size-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary shadow-inner group-hover:scale-110 transition-transform duration-300">
                  <span className="material-symbols-outlined">bolt</span>
                </div>
                <div>
                  <div className="text-xl font-black text-white group-hover:text-primary-glow transition-colors">500 XP</div>
                  <div className="text-xs font-bold text-text-secondary uppercase tracking-wide">Reputation</div>
                </div>
              </div>
              <div className="w-full flex items-center gap-4 bg-black/20 p-4 rounded-xl border border-white/5 relative overflow-hidden group hover:border-primary/30 transition-all">
                <div className="absolute -right-8 -top-8 w-24 h-24 bg-primary/20 blur-2xl rounded-full group-hover:bg-primary/30 transition-colors"></div>
                <div className="size-12 rounded-xl bg-cover bg-center shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300" style={{ backgroundImage: `url("${IMAGES.genesisCube}")` }}></div>
                <div className="relative z-10">
                  <div className="text-lg font-bold text-white group-hover:text-primary-glow transition-colors">Genesis Cube</div>
                  <div className="text-xs font-bold text-primary uppercase tracking-wide">NFT Artifact</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Action Console */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Status Header */}
          <div className="flex items-center justify-between glass-card p-4 rounded-xl">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
              </span>
              <span className="font-bold text-white tracking-wide">Quest Active</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-primary-glow font-mono font-bold">
              <span className="material-symbols-outlined text-[18px] animate-pulse">timer</span>
              <span>Time remaining: 2d 4h</span>
            </div>
          </div>

          {/* Objectives List (Stepper) */}
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-white/5 bg-white/5">
              <h2 className="text-xl font-black text-white font-display tracking-tight">Mission Objectives</h2>
              <p className="text-sm text-text-secondary mt-1">Complete all tasks to claim your reward.</p>
            </div>
            <div className="flex flex-col">
              {/* Step 1: Completed */}
              <div className="flex gap-4 p-6 border-b border-white/5 bg-black/20 group hover:bg-black/30 transition-colors">
                <div className="flex flex-col items-center">
                  <div className="size-8 rounded-full bg-green-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-green-500/20">
                    <span className="material-symbols-outlined text-sm font-bold">check</span>
                  </div>
                  <div className="w-0.5 grow bg-green-500/30 my-2 rounded-full"></div>
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-white/50 line-through decoration-white/30 decoration-2">Connect Wallet</h3>
                      <p className="text-text-secondary/50 text-sm mt-1">Link your EVM compatible wallet to start.</p>
                    </div>
                    <span className="px-2 py-1 rounded text-[10px] font-black bg-green-500/10 text-green-400 tracking-wider uppercase border border-green-500/20">COMPLETED</span>
                  </div>
                </div>
              </div>

              {/* Step 2: Active */}
              <div className="flex gap-4 p-6 border-b border-white/5 bg-primary/5 relative overflow-hidden group">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-primary-glow"></div>
                <div className="flex flex-col items-center">
                  <div className="size-8 rounded-full bg-black border-2 border-primary text-primary flex items-center justify-center shrink-0 z-10 shadow-[0_0_15px_rgba(79,70,229,0.4)]">
                    <span className="font-bold text-sm">2</span>
                  </div>
                  <div className="w-0.5 grow bg-white/10 my-2 rounded-full"></div>
                </div>
                <div className="flex-1 pb-2">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6">
                    <div>
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        Bridge Assets
                        <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
                      </h3>
                      <p className="text-text-secondary text-sm mt-1 mb-3 max-w-md leading-relaxed">Transfer at least 0.01 ETH from Ethereum Mainnet to Base Network using the official bridge.</p>
                      <div className="flex gap-2">
                        <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-white/5 text-text-secondary border border-white/5">~ $25 USD value</span>
                        <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-white/5 text-green-400 border border-white/5">Gas: Low</span>
                      </div>
                    </div>
                    <a href="https://bridge.base.org/" target="_blank" rel="noopener noreferrer" className="shrink-0 flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-gradient-to-r from-primary to-primary-glow text-white font-bold text-sm shadow-[0_0_20px_rgba(43,43,238,0.3)] hover:shadow-[0_0_30px_rgba(43,43,238,0.5)] hover:brightness-110 transition-all transform hover:-translate-y-1 active:scale-95 group/btn">
                      <span>Bridge Now</span>
                      <span className="material-symbols-outlined text-[18px] group-hover/btn:translate-x-1 transition-transform">open_in_new</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Step 3: Locked */}
              <div className="flex gap-4 p-6 opacity-50 grayscale hover:grayscale-0 hover:opacity-80 transition-all duration-500">
                <div className="flex flex-col items-center">
                  <div className="size-8 rounded-full bg-white/5 text-text-secondary flex items-center justify-center shrink-0 border border-white/10">
                    <span className="font-bold text-sm">3</span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-bold text-white">Mint 'Arrival' Zorb</h3>
                      <p className="text-text-secondary text-sm mt-1">Commemorate your arrival by minting the free entry NFT on Zora.</p>
                    </div>
                    <span className="material-symbols-outlined text-text-secondary">lock</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Final Action Area */}
          <div className="mt-2 flex flex-col items-center justify-center p-8 rounded-2xl border border-dashed border-white/10 bg-white/5 text-center group hover:bg-white/10 transition-colors">
            <div className="size-16 rounded-full bg-black/40 flex items-center justify-center mb-4 text-white/20 group-hover:text-primary group-hover:scale-110 transition-all duration-300">
              <span className="material-symbols-outlined text-3xl">redeem</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Rewards Locked</h3>
            <p className="text-text-secondary max-w-sm mx-auto mb-6">Complete the bridge and minting tasks above to unlock your 500 XP and Rare Genesis Cube NFT.</p>
            <button className="flex w-full max-w-xs cursor-not-allowed items-center justify-center rounded-xl h-14 px-4 bg-white/5 text-text-secondary border border-white/5 text-sm font-bold tracking-wide uppercase transition-all" disabled>
              <span className="material-symbols-outlined mr-2 text-[18px]">lock</span>
              Claim Rewards
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestDetail;
