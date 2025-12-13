import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import confetti from "canvas-confetti";
import { IMAGES } from "../constants";
import { getQuests, joinQuest, completeQuest, getUser, upsertWallet } from "../services/api.ts";
import { getConnectedWallet } from "../services/wallet.ts";

const Dashboard = () => {
  const [quests, setQuests] = useState<any[]>([]);
  const allQuestsRef = useRef<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completingSlug, setCompletingSlug] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<{ hours: string; mins: string; secs: string } | null>(null);
  const [currentDay, setCurrentDay] = useState<number>(1);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const accumulatedTimeRef = useRef<number>(0);
  
  const triggerConfetti = () => {
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      zIndex: 1000,
    };

    function fire(particleRatio: number, opts: any) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
      colors: ['#4f46e5', '#818cf8', '#ffffff']
    });

    fire(0.2, {
      spread: 60,
      colors: ['#4f46e5', '#818cf8', '#ffffff']
    });

    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
      colors: ['#4f46e5', '#818cf8', '#ffffff']
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
      colors: ['#4f46e5', '#818cf8', '#ffffff']
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 45,
      colors: ['#4f46e5', '#818cf8', '#ffffff']
    });
  };

  const timerPausedRef = useRef(false);

  // Sync accumulated time to backend
  useEffect(() => {
    const syncInterval = setInterval(() => {
      const w = getConnectedWallet();
      if (w.address && accumulatedTimeRef.current > 0) {
        upsertWallet({ address: w.address, estimatedCost: String(accumulatedTimeRef.current) })
          .catch(err => console.error("Failed to sync timer:", err));
      }
    }, 10000); // Sync every 10 seconds
    return () => clearInterval(syncInterval);
  }, []);

  // Helper to filter quests
  const getVisibleQuests = (all: any[], day: number) => {
    return all.filter(q => (q.day || 0) <= day).sort((a, b) => (a.day || 0) - (b.day || 0));
  };

  useEffect(() => {
    const w = getConnectedWallet();
    setLoading(true);
    setError(null);
    
    // Fetch quests and user data
    Promise.all([
      getQuests({ address: w.address, status: "active" }),
      w.address ? getUser(w.address) : Promise.resolve(null)
    ])
      .then(([fetchedQuests, userData]) => {
        setUser(userData);
        allQuestsRef.current = fetchedQuests;
        
        // Initialize timer from stored state
        let initialTime = 0;
        if (userData && userData.estimatedCost) {
            const parsed = parseInt(userData.estimatedCost, 10);
            if (!isNaN(parsed)) initialTime = parsed;
        }
        accumulatedTimeRef.current = initialTime;
        
        let lastDay = 0;

        const updateTimer = () => {
          const CYCLE_DURATION = 5 * 60 * 1000; // 5 minutes

          // Check for pause condition BEFORE incrementing
          const currentDayCheck = Math.floor(accumulatedTimeRef.current / CYCLE_DURATION) + 1;
          const activeCount = allQuestsRef.current.filter(q => (q.day || 0) <= currentDayCheck && q.status !== 'completed').length;
          
          console.log(`Debug Timer: Day=${currentDayCheck}, Active=${activeCount}, Paused=${timerPausedRef.current}`);

          if (timerPausedRef.current) {
             // If paused, check if we can resume (must complete quests to drop below 5)
             if (activeCount < 5) {
                 timerPausedRef.current = false;
                 setIsTimerPaused(false);
             } else {
                 // Still paused, do not increment
                 setIsTimerPaused(true);
                 return;
             }
          } else {
             // If running, check if we should pause (>= 5 active)
             if (activeCount >= 5) {
                 timerPausedRef.current = true;
                 setIsTimerPaused(true);
                 return;
             }
          }

          // Increment by 1 second (1000ms)
          accumulatedTimeRef.current += 1000;
          const totalTime = accumulatedTimeRef.current;
          
          const currentDayCalc = Math.floor(totalTime / CYCLE_DURATION) + 1;
          const timeInCurrentDay = totalTime % CYCLE_DURATION;
          const diff = CYCLE_DURATION - timeInCurrentDay;

          if (currentDayCalc !== lastDay) {
            lastDay = currentDayCalc;
            setCurrentDay(currentDayCalc);
            // Filter quests based on current day and limit
            setQuests(getVisibleQuests(allQuestsRef.current, currentDayCalc));
          }

          const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
          const mins = Math.floor((diff / (1000 * 60)) % 60);
          const secs = Math.floor((diff / 1000) % 60);
          setTimeLeft({
            hours: hours.toString().padStart(2, "0"),
            mins: mins.toString().padStart(2, "0"),
            secs: secs.toString().padStart(2, "0")
          });
        };

        updateTimer(); // Initial call
        const interval = setInterval(updateTimer, 1000);
        
        return () => clearInterval(interval);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const activeQuests = quests.filter(q => q.status !== 'completed');
  const completedQuests = quests.filter(q => q.status === 'completed');

  const handleComplete = async (q: any) => {
    try {
        const w = getConnectedWallet();
        if (!w.address) return; // Should prompt connect
        
        setCompletingSlug(q.slug);
        
        // If it's a social quest, open link
        if (q.slug.includes('social') || q.slug.includes('share') || q.title.toLowerCase().includes('share')) {
            const text = "I just started my journey on Base Odyssey! 🚀 Join the future of onchain discovery. #BaseOdyssey";
            const url = window.location.origin;
            window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
        }

        const res = await completeQuest({ address: w.address, slug: q.slug });
        
        // Trigger rewards
        triggerConfetti();
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3');
        audio.volume = 0.5;
        audio.play().catch(() => {});

        const updateQuest = (item: any) => item.id === q.id ? { ...item, status: 'completed', progress: 100 } : item;
        const newAllQuests = allQuestsRef.current.map(updateQuest);
        allQuestsRef.current = newAllQuests;
        
        // Recalculate day
        const day = Math.floor(accumulatedTimeRef.current / (5 * 60 * 1000)) + 1;
        // Update visible quests immediately to potentially show next one
        setQuests(getVisibleQuests(newAllQuests, day));
        
        if (res && res.xp !== undefined) {
            setUser((prev: any) => ({ ...prev, xp: res.xp }));
        }
    } catch (e) {
        console.error(e);
        // Could show toast error here
    } finally {
        setCompletingSlug(null);
    }
  };

  const renderQuest = (q: any) => (
    <div key={q.id} className={`group relative flex flex-col md:flex-row gap-6 p-6 rounded-2xl glass-card border transition-all duration-500 hover:-translate-y-2 ${q.status === 'completed' ? 'border-green-500/20 opacity-60 grayscale-[0.5] hover:grayscale-0 hover:opacity-100' : 'hover:border-primary/50'}`}>
        {/* Progress Ring */}
        <div className="relative size-24 shrink-0 self-center md:self-start">
            {/* Glow Effect */}
            <div className={`absolute inset-0 rounded-full blur-xl ${q.status === 'completed' ? 'bg-green-500/20' : 'bg-primary/20'} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
            
            <svg className="size-full -rotate-90 relative z-10" viewBox="0 0 36 36">
                <path className={`text-surface-highlight`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3"></path>
                <path 
                    className={`${q.status === 'completed' ? 'text-green-500' : 'text-primary'} drop-shadow-[0_0_10px_currentColor] transition-all duration-1000 ease-out`} 
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeDasharray={`${q.status === 'completed' ? 100 : (q.progress ?? 0)}, 100`} 
                    strokeWidth="3"
                    strokeLinecap="round"
                ></path>
            </svg>
            <div className={`absolute inset-0 flex items-center justify-center flex-col text-white z-20`}>
                {q.status === 'completed' ? (
                    <span className="material-symbols-outlined text-3xl text-green-500 animate-bounce">check</span>
                ) : (
                    <span className="text-xl font-bold font-display">{(q.progress ?? 0)}%</span>
                )}
            </div>
        </div>
        
        <div className="flex flex-col flex-grow gap-3 z-10">
            <div className="flex justify-between items-start">
                <h3 className={`text-2xl font-bold text-white group-hover:text-primary transition-colors font-display`}>{q.title}</h3>
                <span className="bg-primary/10 text-primary border border-primary/20 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider flex items-center gap-1 shadow-[0_0_15px_rgba(79,70,229,0.2)]">
                    <span className="material-symbols-outlined text-[14px]">bolt</span>
                    +{q.xpReward ?? 0} XP
                </span>
            </div>
            <p className="text-text-secondary text-sm leading-relaxed">{q.description}</p>
            <div className="mt-auto flex gap-4 pt-2">
                {q.status === 'completed' ? (
                  <button disabled className="flex-1 bg-green-500/10 border border-green-500/20 text-green-400 font-bold py-3 px-6 rounded-xl text-sm flex items-center justify-center gap-2 cursor-default backdrop-blur-sm">
                    Completed
                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  </button>
                ) : (
                  <button
                    className={`flex-1 relative overflow-hidden ${completingSlug === q.slug ? 'bg-indigo-700' : 'bg-gradient-to-r from-primary to-primary-glow hover:shadow-[0_0_30px_rgba(79,70,229,0.4)]'} text-white font-bold py-3 px-6 rounded-xl text-sm transition-all duration-300 flex items-center justify-center gap-2 group/btn`}
                    disabled={completingSlug === q.slug}
                    onClick={() => handleComplete(q)}
                  >
                    {completingSlug === q.slug ? (
                        <>
                            <span className="size-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                            <span>Verifying...</span>
                        </>
                    ) : (
                        <>
                            <span>Start Mission</span>
                            <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                        </>
                    )}
                  </button>
                )}
            </div>
        </div>
      </div>
    );

  return (
    <div className="flex-grow px-4 md:px-12 py-12 flex justify-center relative z-10">
      <div className="flex flex-col max-w-7xl w-full gap-16">
        {/* Hero Section: Daily Push Timer */}
        <section className="relative overflow-hidden rounded-[2.5rem] glass-card border border-white/10 p-12 text-center">
          {/* Background Animated Gradients */}
          <div className="absolute top-0 left-1/4 w-1/2 h-full bg-gradient-to-b from-primary/20 to-transparent blur-[100px] animate-pulse-glow"></div>
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-highlight border border-white/10 text-primary text-xs font-bold mb-6 uppercase tracking-widest shadow-lg">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Quest Push
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 mb-4 font-display tracking-tight drop-shadow-sm">
                New Quests Dropping In
            </h1>
            <p className="text-text-secondary text-xl max-w-2xl mx-auto mb-10 font-light">
                Prepare your wallet. The future is built one block at a time.
            </p>

            {/* Timer Component - Digital Clock Style */}
            <div className="flex items-center gap-4 sm:gap-8 p-6 rounded-2xl bg-black/40 backdrop-blur-md border border-white/5 shadow-2xl relative">
                {isTimerPaused && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse shadow-lg z-20">
                        PAUSED (Limit Reached)
                    </div>
                )}
                {[
                  { label: 'Hours', value: timeLeft?.hours || '00' },
                  { label: 'Mins', value: timeLeft?.mins || '00' },
                  { label: 'Secs', value: timeLeft?.secs || '00' }
                ].map((item, idx) => (
                   <React.Fragment key={item.label}>
                    <div className="flex flex-col items-center gap-2 min-w-[80px]">
                        <div className="relative">
                            <span className={`text-5xl md:text-6xl font-black font-display tracking-tighter ${item.label === 'Secs' ? 'text-primary drop-shadow-[0_0_15px_rgba(79,70,229,0.5)]' : 'text-white'}`}>
                                {item.value}
                            </span>
                        </div>
                        <span className="text-[10px] text-text-secondary uppercase font-bold tracking-[0.2em]">{item.label}</span>
                    </div>
                    {idx < 2 && <div className="text-4xl text-white/20 font-light mb-6">:</div>}
                   </React.Fragment> 
                ))}
            </div>
          </div>
        </section>

        {/* Quests Grid */}
        <section>
          <div className="flex items-end justify-between mb-10 border-b border-white/5 pb-4">
            <div>
                <h2 className="text-3xl font-bold text-white flex items-center gap-3 font-display">
                <span className="flex items-center justify-center size-10 rounded-lg bg-primary/20 text-primary">
                    <span className="material-symbols-outlined">bolt</span>
                </span>
                Active Quests (Quest {currentDay})
                </h2>
                <p className="text-text-secondary mt-2 ml-14">Complete these tasks to earn XP and climb the leaderboard.</p>
            </div>
            
            <div className="flex items-center gap-4 hidden sm:flex">
                 {user && (
                    <div className="bg-surface-highlight border border-white/5 px-5 py-2.5 rounded-xl text-white font-bold flex items-center gap-2 shadow-lg">
                        <span className="text-primary material-symbols-outlined">military_tech</span>
                        {user.xp?.toLocaleString()} XP
                    </div>
                 )}
                 <Link to="#" className="text-sm font-medium text-text-secondary hover:text-white transition-colors flex items-center gap-1 group">
                    View History 
                    <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                 </Link>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {error && <div className="col-span-2 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-bold text-center">Failed to fetch: {error}</div>}
            
            {loading && (
              <div className="col-span-2 text-center py-20">
                  <div className="inline-block size-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
                  <p className="text-text-secondary animate-pulse">Loading quests...</p>
              </div>
            )}
            
            {!loading && activeQuests.length === 0 && (
              <div className="col-span-2 text-center py-20 bg-surface-highlight/30 rounded-[2rem] border border-white/5 backdrop-blur-sm">
                 <div className="size-20 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center mx-auto mb-6">
                    <span className="material-symbols-outlined text-4xl">check_circle</span>
                 </div>
                 <h3 className="text-2xl font-bold text-white mb-2 font-display">All Caught Up!</h3>
                 <p className="text-text-secondary max-w-md mx-auto">You've completed all active quests for this cycle. Check back when the timer resets for more rewards.</p>
              </div>
            )}
            
            {activeQuests.map(renderQuest)}
          </div>

          {completedQuests.length > 0 && (
            <div className="mt-20">
                <div className="flex items-center gap-4 mb-8 opacity-50 hover:opacity-100 transition-opacity duration-300">
                    <div className="h-[1px] flex-grow bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-green-500">history</span>
                        Completed History
                    </h2>
                    <div className="h-[1px] flex-grow bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {completedQuests.map(renderQuest)}
                </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
