import React from "react";
import { Link } from "react-router-dom";
import { IMAGES } from "../constants";

const QuestDetail = () => {
  return (
    <div className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-[1200px]">
      {/* Breadcrumbs */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm">
          <Link to="/dashboard" className="text-slate-500 dark:text-[#9d9db9] font-medium hover:text-primary transition-colors flex items-center gap-1">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            All Quests
          </Link>
          <span className="text-slate-400 dark:text-[#505068]">/</span>
          <span className="text-slate-900 dark:text-white font-medium">Bridge to Base Alpha</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Context & Media */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Main Visual */}
          <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden shadow-2xl shadow-primary/10 border border-slate-200 dark:border-border-dark group">
            <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: `url("${IMAGES.bridgeBg}")` }}></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
            <div className="absolute bottom-4 left-4 right-4">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs font-bold text-white mb-2">
                <span className="material-symbols-outlined text-[14px] text-primary">diamond</span>
                RARE DROP
              </div>
            </div>
          </div>
          
          {/* Title & Description */}
          <div>
            <h1 className="text-3xl lg:text-4xl font-black leading-tight tracking-[-0.02em] mb-4 text-slate-900 dark:text-white">Bridge to Base Alpha</h1>
            <div className="prose prose-invert max-w-none text-slate-600 dark:text-[#9d9db9]">
              <p className="mb-4">
                Initiate your journey by bridging ETH to the Base network. This is the first step in the Odyssey. Only those who cross the bridge can shape the future of the ecosystem.
              </p>
              <p className="text-sm border-l-2 border-primary pl-4 italic text-slate-500 dark:text-[#6d6d89]">
                "The bridge is not just a path, it is a test of resolve. Cross it, and leave the old world behind."
              </p>
            </div>
          </div>

          {/* Rewards Preview */}
          <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-[#6d6d89] mb-4">Quest Rewards</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 bg-slate-50 dark:bg-[#111118] p-3 rounded-lg border border-slate-100 dark:border-border-dark flex-1">
                <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">bolt</span>
                </div>
                <div>
                  <div className="text-lg font-bold text-slate-900 dark:text-white">500 XP</div>
                  <div className="text-xs text-slate-500 dark:text-[#6d6d89]">Reputation Points</div>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-slate-50 dark:bg-[#111118] p-3 rounded-lg border border-slate-100 dark:border-border-dark flex-1 relative overflow-hidden">
                <div className="absolute -right-4 -top-4 w-16 h-16 bg-primary/20 blur-xl rounded-full"></div>
                <div className="size-10 rounded-lg bg-cover bg-center shrink-0" style={{ backgroundImage: `url("${IMAGES.genesisCube}")` }}></div>
                <div className="relative z-10 overflow-hidden">
                  <div className="text-sm font-bold text-slate-900 dark:text-white truncate">Genesis Cube</div>
                  <div className="text-xs text-primary font-medium">NFT Item</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Action Console */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Status Header */}
          <div className="flex items-center justify-between bg-white dark:bg-card-dark p-4 rounded-xl border border-slate-200 dark:border-border-dark shadow-sm">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
              </span>
              <span className="font-bold text-slate-900 dark:text-white">Quest Active</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-[#9d9db9]">
              <span className="material-symbols-outlined text-[18px]">timer</span>
              <span>Time remaining: 2d 4h</span>
            </div>
          </div>

          {/* Objectives List (Stepper) */}
          <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-border-dark overflow-hidden shadow-lg shadow-black/5">
            <div className="p-5 border-b border-slate-200 dark:border-border-dark">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Mission Objectives</h2>
              <p className="text-sm text-slate-500 dark:text-[#9d9db9]">Complete all tasks to claim your reward.</p>
            </div>
            <div className="flex flex-col">
              {/* Step 1: Completed */}
              <div className="flex gap-4 p-5 border-b border-slate-200 dark:border-border-dark/50 bg-slate-50/50 dark:bg-transparent">
                <div className="flex flex-col items-center">
                  <div className="size-8 rounded-full bg-green-500 text-white flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-sm font-bold">check</span>
                  </div>
                  <div className="w-0.5 grow bg-green-500/30 my-2"></div>
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white line-through decoration-slate-400 dark:decoration-slate-600 decoration-2">Connect Wallet</h3>
                      <p className="text-slate-500 dark:text-[#6d6d89] text-sm mt-1">Link your EVM compatible wallet to start.</p>
                    </div>
                    <span className="px-2 py-1 rounded text-xs font-bold bg-green-500/10 text-green-500">COMPLETED</span>
                  </div>
                </div>
              </div>

              {/* Step 2: Active */}
              <div className="flex gap-4 p-5 border-b border-slate-200 dark:border-border-dark/50 bg-primary/5 dark:bg-primary/5 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
                <div className="flex flex-col items-center">
                  <div className="size-8 rounded-full bg-white dark:bg-[#111118] border-2 border-primary text-primary flex items-center justify-center shrink-0 z-10 shadow-lg shadow-primary/20">
                    <span className="font-bold text-sm">2</span>
                  </div>
                  <div className="w-0.5 grow bg-slate-200 dark:bg-border-dark my-2"></div>
                </div>
                <div className="flex-1 pb-2">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">Bridge Assets</h3>
                      <p className="text-slate-600 dark:text-[#9d9db9] text-sm mt-1 mb-3 max-w-md">Transfer at least 0.01 ETH from Ethereum Mainnet to Base Network using the official bridge.</p>
                      <div className="flex gap-2">
                        <span className="px-2 py-1 rounded text-xs font-medium bg-slate-200 dark:bg-border-dark text-slate-600 dark:text-[#9d9db9]">~ $25 USD value</span>
                        <span className="px-2 py-1 rounded text-xs font-medium bg-slate-200 dark:bg-border-dark text-slate-600 dark:text-[#9d9db9]">Gas: Low</span>
                      </div>
                    </div>
                    <button className="shrink-0 flex items-center justify-center gap-2 h-12 px-6 rounded-lg bg-primary text-white font-bold text-sm shadow-[0_0_20px_rgba(43,43,238,0.3)] hover:shadow-[0_0_25px_rgba(43,43,238,0.5)] hover:bg-primary/90 transition-all transform hover:-translate-y-0.5 group">
                      <span>Bridge Now</span>
                      <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">open_in_new</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Step 3: Locked */}
              <div className="flex gap-4 p-5 opacity-60">
                <div className="flex flex-col items-center">
                  <div className="size-8 rounded-full bg-slate-200 dark:bg-border-dark text-slate-400 dark:text-[#6d6d89] flex items-center justify-center shrink-0 border border-slate-300 dark:border-[#3d3d52]">
                    <span className="font-bold text-sm">3</span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">Mint 'Arrival' Zorb</h3>
                      <p className="text-slate-500 dark:text-[#6d6d89] text-sm mt-1">Commemorate your arrival by minting the free entry NFT on Zora.</p>
                    </div>
                    <span className="material-symbols-outlined text-slate-400 dark:text-[#505068]">lock</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Final Action Area */}
          <div className="mt-2 flex flex-col items-center justify-center p-8 rounded-xl border border-dashed border-slate-300 dark:border-border-dark bg-slate-50 dark:bg-[#111118]/50 text-center">
            <div className="size-16 rounded-full bg-slate-200 dark:bg-card-dark flex items-center justify-center mb-4 text-slate-400 dark:text-[#505068]">
              <span className="material-symbols-outlined text-3xl">redeem</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Rewards Locked</h3>
            <p className="text-slate-500 dark:text-[#6d6d89] max-w-sm mx-auto mb-6">Complete the bridge and minting tasks above to unlock your 500 XP and Rare Genesis Cube NFT.</p>
            <button className="flex w-full max-w-xs cursor-not-allowed items-center justify-center rounded-lg h-12 px-4 bg-slate-200 dark:bg-border-dark text-slate-400 dark:text-[#6d6d89] text-sm font-bold leading-normal" disabled>
              Claim Rewards
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestDetail;
