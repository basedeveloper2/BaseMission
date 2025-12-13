import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { connectCoinbaseWallet, disconnectWallet, getConnectedWallet } from "../services/wallet.ts";
import { upsertWallet, getUser } from "../services/api.ts";

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [address, setAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);
  const [category, setCategory] = useState<string>("newcomer");
  const [handle, setHandle] = useState<string>("odyssey_explorer");

  useEffect(() => {
    const w = getConnectedWallet();
    if (w.address) {
      setAddress(w.address);
      checkUserExists(w.address);
    }
  }, []);

  async function checkUserExists(addr: string) {
     try {
       const user = await getUser(addr);
       if (user && user.category) {
         // User already exists and has category, redirect to dashboard immediately
         navigate("/dashboard");
       } else {
         // New user or missing category, show step 2
         setStep(2);
       }
     } catch {
       // On error, assume new user or retry? For now let them proceed to claim
       setStep(2);
     }
  }

  async function handleConnect() {
    try {
      setConnecting(true);
      const { address } = await connectCoinbaseWallet();
      setAddress(address);
      
      // Check if existing user before showing claim step
      const user = await getUser(address);
      if (user && user.category) {
         navigate("/dashboard");
         return;
      }
      
      await fetch("/api/v1/users/wallet", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...( (import.meta as any).env?.VITE_API_TOKEN ? { authorization: `Bearer ${(import.meta as any).env?.VITE_API_TOKEN}` } : {}),
        },
        body: JSON.stringify({ address })
      });
      setStep(2);
    } catch (e) {
      console.error(e);
    } finally {
      setConnecting(false);
    }
  }

  function handleDisconnect() {
    disconnectWallet();
    setAddress(null);
    setStep(1);
  }

  return (
    <div className="flex-1 flex flex-col items-center py-12 px-4 sm:px-6 w-full max-w-7xl mx-auto relative z-10">
      <div className="w-full max-w-[640px] flex flex-col gap-12">
        {/* Progress */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-black tracking-tight font-display bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">Onboarding</h1>
            <span className="text-primary-glow text-sm font-bold tracking-wider uppercase">Step {step} of 4 Active</span>
          </div>
          <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden backdrop-blur-sm border border-white/5">
            <div 
              className="h-full bg-gradient-to-r from-primary to-primary-glow rounded-full relative transition-all duration-500 ease-out shadow-[0_0_10px_rgba(79,70,229,0.5)]"
              style={{ width: `${(step / 4) * 100}%` }}
            >
              <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white/20 to-transparent"></div>
            </div>
          </div>
        </div>

        {/* Step 1: Wallet Connection (Completed) */}
        <section 
          className={`glass-card p-8 rounded-2xl transition-all duration-300 ${step > 1 ? 'opacity-60 grayscale-[0.5] hover:opacity-100 hover:grayscale-0' : 'ring-1 ring-primary/50 shadow-[0_0_30px_rgba(79,70,229,0.15)]'}`}
        >
          <div className="flex items-center gap-4 mb-6">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl shadow-inner ${step > 1 ? 'bg-primary/20 text-primary border border-primary/20' : 'bg-white/5 text-text-secondary border border-white/10'}`}>
              <span className="material-symbols-outlined text-[24px]">{step > 1 ? 'check' : '1'}</span>
            </div>
            <div>
               <h2 className="text-xl font-bold text-white">Connect Wallet</h2>
               <p className="text-sm text-text-secondary">Link your wallet to start tracking progress.</p>
            </div>
          </div>
          
          {step === 1 && (
            <div className="pl-[56px]">
              {address ? (
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 group hover:border-primary/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                        <span className="material-symbols-outlined text-white text-[18px]">account_balance_wallet</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-white tracking-wide font-mono">{address.slice(0, 6)}...{address.slice(-4)}</span>
                        <span className="text-[10px] text-green-400 font-medium flex items-center gap-1">
                            <span className="size-1.5 rounded-full bg-green-400 animate-pulse"></span>
                            Connected
                        </span>
                    </div>
                  </div>
                  <button onClick={handleDisconnect} className="text-xs text-text-secondary hover:text-white underline decoration-white/30 hover:decoration-white transition-all">
                    Disconnect
                  </button>
                </div>
              ) : (
                <button 
                  onClick={handleConnect} 
                  disabled={connecting}
                  className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-primary to-primary-glow hover:brightness-110 active:scale-[0.98] text-white font-bold transition-all shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
                >
                  {connecting ? (
                     <>
                        <span className="size-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                        <span>Connecting...</span>
                     </>
                  ) : (
                     <>
                        <span className="material-symbols-outlined group-hover:rotate-12 transition-transform">account_balance_wallet</span>
                        <span>Connect Coinbase Wallet</span>
                     </>
                  )}
                </button>
              )}
            </div>
          )}
        </section>

        {/* Step 2: Identity (Active) */}
        {(step === 2 || !!address) && (
          <section className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
            <div className="relative glass-card p-6 sm:p-8 rounded-2xl shadow-2xl">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-glow text-white shadow-lg shadow-primary/25">
                      <span className="text-sm font-bold">2</span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Claim Identity</h2>
                      <p className="text-sm text-text-secondary mt-1">Choose your unique onchain handle. This will be your username across the Base ecosystem.</p>
                    </div>
                  </div>
                </div>
                <div className="pl-0 sm:pl-[56px] flex flex-col gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-white uppercase tracking-wider">Username</label>
                    <div className="relative flex items-center group/input">
                      <div className="absolute inset-0 bg-gradient-to-r from-primary to-purple-600 rounded-xl blur opacity-0 group-hover/input:opacity-20 transition-opacity"></div>
                      <input 
                        value={handle} 
                        onChange={(e) => setHandle(e.target.value)} 
                        className="relative z-10 h-14 w-full rounded-xl bg-black/40 border border-white/10 focus:border-primary/50 focus:bg-black/60 focus:ring-0 text-white placeholder-text-secondary pl-5 pr-32 transition-all font-bold text-lg" 
                        placeholder="superfan2024" 
                        type="text" 
                      />
                      <span className="absolute right-5 text-text-secondary font-bold select-none text-lg z-20">.base.eth</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-400 text-sm mt-1 animate-pulse">
                      <span className="material-symbols-outlined text-[18px]">check_circle</span>
                      <span className="font-bold">Available!</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center rounded-xl bg-white/5 p-4 border border-white/5">
                    <span className="text-sm text-text-secondary font-medium">Estimated Cost</span>
                    <span className="text-sm font-bold text-white bg-green-500/20 text-green-400 px-3 py-1 rounded-full">Free <span className="text-white/50 font-normal ml-1">(+ Gas)</span></span>
                  </div>
                  <div className="flex flex-col gap-3">
                    <label className="text-sm font-bold text-white uppercase tracking-wider">Choose Category</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { key: "newcomer", label: "Newcomer", xp: 50 },
                        { key: "builder", label: "Builder", xp: 120 },
                        { key: "creator", label: "Creator", xp: 100 },
                        { key: "defi", label: "DeFi/Degeneracy", xp: 110 },
                      ].map((opt) => (
                        <button
                          key={opt.key}
                          onClick={() => setCategory(opt.key)}
                          className={`relative overflow-hidden rounded-xl px-4 py-3 text-sm font-bold border transition-all duration-300 ${category === opt.key ? 'bg-primary/20 text-white border-primary shadow-[0_0_15px_rgba(79,70,229,0.3)]' : 'bg-white/5 text-text-secondary border-transparent hover:bg-white/10 hover:text-white hover:border-white/10'}`}
                        >
                          <div className="flex justify-between items-center relative z-10">
                            <span>{opt.label}</span>
                            <span className={`text-xs ${category === opt.key ? 'text-primary-glow' : 'text-text-secondary'}`}>+{opt.xp} XP</span>
                          </div>
                          {category === opt.key && <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent"></div>}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      if (!address || claiming) return;
                      setClaimError(null);
                      setClaiming(true);
                      try {
                        await upsertWallet({ address, handle, category, estimatedCost: 'Free (+ Gas)' });
                        setStep(3);
                      } catch (e: any) {
                        setClaimError(e?.message ? String(e.message) : "Failed to claim identity");
                      } finally {
                        setClaiming(false);
                      }
                    }}
                    disabled={claiming}
                    className={`mt-4 w-full py-4 rounded-xl font-bold text-white transition-all duration-300 shadow-lg ${claiming ? 'bg-primary/50 cursor-not-allowed' : 'bg-gradient-to-r from-primary to-primary-glow hover:brightness-110 active:scale-[0.98] shadow-primary/25'} flex items-center justify-center gap-2 group`}
                  >
                    {claiming ? (
                      <>
                        <span className="size-5 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                        <span>Minting Identity...</span>
                      </>
                    ) : (
                      <>
                        <span>Claim Identity</span>
                        <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                      </>
                    )}
                  </button>
                  {claimError && (
                    <div className="mt-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400 font-medium flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">error</span>
                      {claimError}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Step 3: Profile Setup */}
        <section className={`transition-all duration-500 ${step === 3 ? 'opacity-100 translate-y-0' : 'opacity-60 grayscale-[0.5] hover:opacity-100 hover:grayscale-0'}`}>
           <div className={`glass-card p-8 rounded-2xl transition-all duration-300 ${step === 3 ? 'ring-1 ring-primary/50 shadow-[0_0_30px_rgba(79,70,229,0.15)]' : ''}`}>
             <div className="flex items-center gap-4 mb-6">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl shadow-inner ${step === 3 ? 'bg-gradient-to-br from-primary to-primary-glow text-white shadow-lg shadow-primary/25' : 'bg-white/5 text-text-secondary border border-white/10'}`}>
                <span className="text-sm font-bold">3</span>
              </div>
              <div>
                <h3 className={`text-xl font-bold ${step === 3 ? 'text-white' : 'text-text-secondary'}`}>Setup Profile</h3>
                {step === 3 && <p className="text-sm text-text-secondary">Customize your public profile for the leaderboard.</p>}
              </div>
            </div>
            {step === 3 && (
              <div className="flex flex-col gap-8 pl-0 sm:pl-[56px] animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-6">
                  <div className="relative size-24 rounded-full bg-white/5 flex items-center justify-center overflow-hidden group cursor-pointer border-2 border-dashed border-white/20 hover:border-primary transition-all duration-300 hover:bg-white/10">
                    <span className="material-symbols-outlined text-text-secondary text-3xl group-hover:text-primary transition-colors">add_a_photo</span>
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-xs font-bold text-white">Upload</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <h4 className="font-bold text-white">Profile Photo</h4>
                    <p className="text-sm text-text-secondary">Upload a PNG or JPG. Max 2MB.</p>
                  </div>
                </div>
                <div className="grid gap-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Display Name</label>
                      <input className="h-12 rounded-xl bg-black/40 border border-white/10 text-white focus:border-primary/50 focus:ring-0 placeholder-text-secondary/50 px-4 font-medium transition-all" placeholder="e.g. Alex Doe" type="text"/>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Email (Optional)</label>
                      <input className="h-12 rounded-xl bg-black/40 border border-white/10 text-white focus:border-primary/50 focus:ring-0 placeholder-text-secondary/50 px-4 font-medium transition-all" placeholder="alex@example.com" type="email"/>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Interests</label>
                    <div className="flex flex-wrap gap-2">
                      {['DeFi', 'NFTs', 'DAO', 'Gaming', 'Infrastructure'].map((tag) => (
                        <button key={tag} className="rounded-full bg-white/5 border border-white/10 px-4 py-2 text-sm font-bold text-text-secondary hover:bg-primary/20 hover:text-white hover:border-primary/50 transition-all active:scale-95">
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex justify-end gap-3">
                  <button onClick={() => setStep(4)} className="px-6 py-3 rounded-xl text-sm font-bold text-text-secondary hover:text-white hover:bg-white/5 transition-colors">Skip</button>
                  <button onClick={() => setStep(4)} className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-primary-glow text-sm font-bold text-white hover:brightness-110 shadow-lg shadow-primary/25 active:scale-95 transition-all">Continue</button>
                </div>
              </div>
            )}
           </div>
        </section>

        {/* Step 4: Referral */}
        <section className={`transition-all duration-500 ${step === 4 ? 'opacity-100 translate-y-0' : 'opacity-60 grayscale-[0.5] hover:opacity-100 hover:grayscale-0'}`}>
            <div className={`glass-card p-8 rounded-2xl transition-all duration-300 ${step === 4 ? 'ring-1 ring-primary/50 shadow-[0_0_30px_rgba(79,70,229,0.15)]' : ''}`}>
              <div className="flex items-center gap-4 mb-6">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl shadow-inner ${step === 4 ? 'bg-gradient-to-br from-primary to-primary-glow text-white shadow-lg shadow-primary/25' : 'bg-white/5 text-text-secondary border border-white/10'}`}>
                  <span className="text-sm font-bold">4</span>
                </div>
                <div>
                   <h3 className={`text-xl font-bold ${step === 4 ? 'text-white' : 'text-text-secondary'}`}>Referral Code</h3>
                   {step === 4 && <p className="text-sm text-text-secondary">Have a code? Enter it to earn bonus XP.</p>}
                </div>
              </div>
              
              {step === 4 && (
                <div className="flex flex-col sm:flex-row gap-4 items-end sm:items-center animate-in fade-in slide-in-from-bottom-4 duration-500 pl-0 sm:pl-[56px]">
                  <div className="flex-1 w-full">
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2 block">Enter Code (Optional)</label>
                    <div className="relative group/input">
                      <div className="absolute inset-0 bg-gradient-to-r from-primary to-purple-600 rounded-xl blur opacity-0 group-hover/input:opacity-20 transition-opacity"></div>
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-text-secondary text-[20px] z-10">key</span>
                      <input className="relative z-10 h-14 w-full rounded-xl bg-black/40 border border-white/10 text-white pl-12 focus:border-primary/50 focus:bg-black/60 focus:ring-0 px-4 font-bold tracking-widest uppercase transition-all placeholder:normal-case placeholder:tracking-normal placeholder:font-medium" placeholder="ODYSSEY-XXXX" type="text"/>
                    </div>
                  </div>
                  <Link to="/dashboard" className="h-14 px-8 rounded-xl bg-gradient-to-r from-primary to-primary-glow text-white font-bold w-full sm:w-auto hover:brightness-110 flex items-center justify-center shadow-lg shadow-primary/25 active:scale-95 transition-all">
                    Apply & Finish
                  </Link>
                </div>
              )}
            </div>
        </section>
      </div>
      
      {/* Background Texture */}
      <div className="fixed bottom-0 left-0 w-full h-[50vh] -z-10 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-transparent to-transparent"></div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl mx-auto bg-primary/5 blur-[100px] rounded-full"></div>
      </div>
    </div>
  );
};

export default Onboarding;
