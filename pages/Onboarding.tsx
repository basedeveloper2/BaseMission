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
    <div className="flex-1 flex flex-col items-center py-12 px-4 sm:px-6 w-full max-w-7xl mx-auto">
      <div className="w-full max-w-[640px] flex flex-col gap-12">
        {/* Progress */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">Onboarding</h1>
            <span className="text-text-secondary text-sm font-medium">Step {step} of 4 Active</span>
          </div>
          <div className="h-2 w-full rounded-full bg-surface-highlight overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full relative transition-all duration-500 ease-out"
              style={{ width: `${(step / 4) * 100}%` }}
            >
              <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white/20 to-transparent"></div>
            </div>
          </div>
        </div>

        {/* Step 1: Wallet Connection (Completed) */}
        <section 
          className={`transition-all duration-300 ${step > 1 ? 'opacity-60 grayscale-[0.5] hover:opacity-100 hover:grayscale-0' : ''}`}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full ${step > 1 ? 'bg-primary/20 text-primary' : 'bg-surface-highlight text-text-secondary'}`}>
              <span className="material-symbols-outlined text-[20px]">{step > 1 ? 'check' : '1'}</span>
            </div>
            <h3 className="text-xl font-bold">1. Connect Wallet</h3>
          </div>
          <div className="rounded-xl border border-border-dark bg-card-dark p-6">
            <div className="flex items-center justify-between bg-surface-highlight/30 rounded-lg p-4 border border-primary/30">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-surface-highlight flex items-center justify-center text-white">
                  <span className="material-symbols-outlined">account_balance_wallet</span>
                </div>
                <div>
                  <p className="font-bold text-white">{address ? address.slice(0,6) + "..." + address.slice(-4) : "Not connected"}</p>
                  <p className="text-xs flex items-center gap-1 {address ? 'text-green-400' : 'text-text-secondary'}">
                    <span className={`inline-block w-1.5 h-1.5 rounded-full ${address ? 'bg-green-400' : 'bg-border-dark'}`}></span>
                    {address ? 'Connected via Coinbase Wallet' : 'Connect to continue'}
                  </p>
                </div>
              </div>
              {address ? (
                <button onClick={handleDisconnect} className="text-sm font-medium text-text-secondary hover:text-white">Disconnect</button>
              ) : (
                <button disabled={connecting} onClick={handleConnect} className="text-sm font-bold bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90">
                  {connecting ? 'Connecting...' : 'Connect Coinbase Wallet'}
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Step 2: Identity (Active) */}
        {(step === 2 || !!address) && (
          <section className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-2xl blur opacity-20"></div>
            <div className="relative rounded-2xl border border-border-dark bg-card-dark p-6 sm:p-8 shadow-2xl">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white shadow-[0_0_10px_rgba(43,43,238,0.5)]">
                      <span className="text-sm font-bold">2</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white">Claim Identity</h2>
                  </div>
                  <p className="text-text-secondary pl-11">Choose your unique onchain handle. This will be your username across the Base ecosystem.</p>
                </div>
                <div className="pl-0 sm:pl-11 flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-white">Username</label>
                    <div className="relative flex items-center">
                      <input value={handle} onChange={(e) => setHandle(e.target.value)} className="h-14 w-full rounded-lg bg-surface-highlight border-transparent focus:border-primary focus:bg-[#1a1a24] focus:ring-0 text-white placeholder-text-secondary pl-4 pr-32 transition-all font-medium text-lg" placeholder="superfan2024" type="text" />
                      <span className="absolute right-4 text-text-secondary font-medium select-none text-lg">.base.eth</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-400 text-sm mt-1">
                      <span className="material-symbols-outlined text-[18px]">check_circle</span>
                      <span>Available!</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center rounded-lg bg-surface-highlight/50 p-3">
                    <span className="text-sm text-text-secondary">Estimated Cost</span>
                    <span className="text-sm font-bold text-white">Free <span className="text-text-secondary font-normal ml-1">(+ Gas)</span></span>
                  </div>
                  <div className="flex flex-col gap-3">
                    <label className="text-sm font-medium text-white">Choose Category</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { key: "newcomer", label: "Newcomer (50 XP)" },
                        { key: "builder", label: "Builder (120 XP)" },
                        { key: "creator", label: "Creator (100 XP)" },
                        { key: "defi", label: "DeFi/Degeneracy (110 XP)" },
                      ].map((opt) => (
                        <button
                          key={opt.key}
                          onClick={() => setCategory(opt.key)}
                          className={`rounded-lg px-4 py-2 text-sm font-bold border ${category === opt.key ? 'bg-primary text-white border-primary' : 'bg-surface-highlight text-text-secondary border-border-dark hover:bg-primary/20 hover:text-primary'}`}
                        >
                          {opt.label}
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
                    className={`mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-lg ${claiming ? 'bg-primary/60' : 'bg-primary hover:bg-blue-600'} text-white font-bold active:scale-[0.98] transition-all shadow-[0_4px_14px_0_rgba(43,43,238,0.39)]`}
                  >
                    <span>{claiming ? 'Claiming...' : 'Claim Identity'}</span>
                    <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                  </button>
                  {claimError && (
                    <div className="mt-2 text-sm text-red-400 font-medium">{claimError}</div>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Step 3: Profile Setup */}
        <section className={`${step === 3 ? 'relative' : 'opacity-80'}`}>
           {step === 3 && <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-2xl blur opacity-20"></div>}
           <div className={`relative rounded-xl border border-border-dark bg-card-dark p-6 sm:p-8 ${step !== 3 ? '' : 'shadow-2xl'}`}>
             <div className="flex items-center gap-3 mb-4">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full ${step === 3 ? 'bg-primary text-white' : 'bg-surface-highlight text-text-secondary'} border border-surface-highlight`}>
                <span className="text-sm font-bold">3</span>
              </div>
              <h3 className={`text-xl font-bold ${step === 3 ? 'text-white' : 'text-text-secondary'}`}>Setup Profile</h3>
            </div>
            {step === 3 && (
              <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-6">
                  <div className="relative size-20 rounded-full bg-surface-highlight flex items-center justify-center overflow-hidden group cursor-pointer border-2 border-dashed border-text-secondary/50 hover:border-primary transition-colors">
                    <span className="material-symbols-outlined text-text-secondary text-3xl group-hover:text-primary">add_a_photo</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <h4 className="font-bold text-white">Profile Photo</h4>
                    <p className="text-sm text-text-secondary">Upload a PNG or JPG. Max 2MB.</p>
                  </div>
                </div>
                <div className="grid gap-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-text-secondary">Display Name</label>
                      <input className="h-11 rounded-lg bg-surface-highlight border-none text-white focus:ring-2 focus:ring-primary/50 placeholder-text-secondary/50 px-4" placeholder="e.g. Alex Doe" type="text"/>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-text-secondary">Email (Optional)</label>
                      <input className="h-11 rounded-lg bg-surface-highlight border-none text-white focus:ring-2 focus:ring-primary/50 placeholder-text-secondary/50 px-4" placeholder="alex@example.com" type="email"/>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-text-secondary">Interests</label>
                    <div className="flex flex-wrap gap-2">
                      {['DeFi', 'NFTs', 'DAO', 'Gaming', 'Infrastructure'].map((tag) => (
                        <button key={tag} className="rounded-full bg-surface-highlight border border-transparent px-4 py-1.5 text-sm font-medium text-text-secondary hover:bg-primary/20 hover:text-primary hover:border-primary/50 transition-colors">
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-8 flex justify-end gap-3">
                  <button onClick={() => setStep(4)} className="px-6 py-2.5 rounded-lg text-sm font-bold text-text-secondary hover:text-white transition-colors">Skip</button>
                  <button onClick={() => setStep(4)} className="px-6 py-2.5 rounded-lg bg-primary text-sm font-bold text-white hover:bg-blue-600 transition-colors">Continue</button>
                </div>
              </div>
            )}
           </div>
        </section>

        {/* Step 4: Referral */}
        <section className={`${step === 4 ? 'relative' : 'opacity-50'}`}>
            {step === 4 && <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-2xl blur opacity-20"></div>}
            <div className={`relative rounded-xl border border-border-dark bg-card-dark p-6 ${step === 4 ? 'shadow-2xl' : ''}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full ${step === 4 ? 'bg-primary text-white' : 'bg-surface-highlight text-text-secondary'} border border-surface-highlight`}>
                  <span className="text-sm font-bold">4</span>
                </div>
                <h3 className={`text-xl font-bold ${step === 4 ? 'text-white' : 'text-text-secondary'}`}>Referral Code</h3>
              </div>
              
              {step === 4 && (
                <div className="flex flex-col sm:flex-row gap-4 items-end sm:items-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex-1 w-full">
                    <label className="text-sm font-medium text-text-secondary mb-2 block">Enter Code (Optional)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-text-secondary text-[20px]">key</span>
                      <input className="h-12 w-full rounded-lg bg-surface-highlight border-none text-white pl-10 focus:ring-2 focus:ring-primary/50 px-4" placeholder="ODYSSEY-XXXX" type="text"/>
                    </div>
                  </div>
                  <Link to="/dashboard" className="h-12 px-6 rounded-lg bg-primary text-white font-bold w-full sm:w-auto hover:bg-blue-600 flex items-center justify-center">
                    Apply & Finish
                  </Link>
                </div>
              )}
            </div>
        </section>
      </div>
      
      {/* Background Texture */}
      <div className="fixed bottom-0 left-0 w-full h-96 -z-10 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-gradient-to-t from-background-dark to-transparent"></div>
        <img alt="Background texture" className="w-full h-full object-cover opacity-30 mix-blend-screen" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBunQf3IMsR-G-ZFeIvPXw-y-JYgzxdMVIrVUoovCtj1MZBo5Ux3xICmmva6BD8KlhZznWZ-zaZkICs-NEVZzGFk8aiJB7_YMXURXR6hjuDqc0VHJr9W8ZSb8aXyXUK89U9brtZW9vLn6mz768K3IndFxXTP1niZOMCEI7Mq7EZp1bcJGd4I_KwQjb40cpyqJIe7SCwhCXiXDmKqG2LybXyS3_cjjO1JCYLEUyKc2bQC37Ao_Kx-QnwjkjTSFVZwG06u5Zx3i5AFA"/>
      </div>
    </div>
  );
};

export default Onboarding;
