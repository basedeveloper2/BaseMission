import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { IMAGES } from "../constants";
import { getQuests, joinQuest, completeQuest, getUser } from "../services/api.ts";
import { getConnectedWallet } from "../services/wallet.ts";

const Dashboard = () => {
  const [quests, setQuests] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completingSlug, setCompletingSlug] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<{ hours: string; mins: string; secs: string } | null>(null);
  const [currentDay, setCurrentDay] = useState<number>(1);

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
        // Calculate current day and timer based on walletConnectedAt
        let day = 1;
        let startTime = Date.now();

        if (userData && (userData.walletConnectedAt || userData.createdAt)) {
          startTime = new Date(userData.walletConnectedAt || userData.createdAt!).getTime();
        }
        
        const updateTimer = () => {
          const now = Date.now();
          const msPerDay = 24 * 60 * 60 * 1000;
          const elapsed = now - startTime;
          const currentDayCalc = Math.floor(elapsed / msPerDay) + 1;
          const nextDayStart = startTime + (currentDayCalc * msPerDay);
          const diff = nextDayStart - now;

          setCurrentDay(currentDayCalc);
          // Filter quests based on current day
          const availableQuests = fetchedQuests.filter(q => (q.day || 0) <= currentDayCalc);
          setQuests(availableQuests);

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

  const renderQuest = (q: any) => (
    <div key={q.id} className={`group relative flex flex-col md:flex-row gap-6 p-6 rounded-2xl bg-card-dark border ${q.status === 'completed' ? 'border-green-900/30 opacity-75 hover:opacity-100' : 'border-border-dark hover:border-primary/50'} transition-all hover:shadow-[0_0_30px_-10px_rgba(43,43,238,0.2)] hover:-translate-y-1`}>
        {/* Progress Ring */}
        <div className="relative size-24 shrink-0 self-center md:self-start">
            <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                <path className={`text-border-dark`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3"></path>
                <path 
                    className={`text-primary drop-shadow-[0_0_4px_rgba(43,43,238,0.8)]`} 
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeDasharray={`${q.progress ?? 0}, 100`} 
                    strokeWidth="3"
                ></path>
            </svg>
            <div className={`absolute inset-0 flex items-center justify-center flex-col text-white`}>
                <span className="text-sm font-bold">{(q.progress ?? 0)}%</span>
            </div>
        </div>
        
        <div className="flex flex-col flex-grow gap-2">
            <div className="flex justify-between items-start">
                <h3 className={`text-xl font-bold text-white group-hover:text-primary transition-colors`}>{q.title}</h3>
                <span className="bg-primary/10 text-primary border border-primary/20 text-xs px-2 py-1 rounded font-bold">+{(q.xpReward ?? 0)} XP</span>
            </div>
            <p className="text-slate-400 text-sm mb-4">{q.description}</p>
            <div className="mt-auto flex gap-3">
                {q.status === 'completed' ? (
                  <button disabled className="flex-1 bg-green-900/20 border border-green-500/30 text-green-500 font-bold py-2.5 px-4 rounded-lg text-sm flex items-center justify-center gap-2 cursor-default">
                    Completed
                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  </button>
                ) : (
                  <button
                    className={`flex-1 ${completingSlug === q.slug ? 'bg-blue-700' : 'bg-green-600 hover:bg-green-700'} text-white font-bold py-2.5 px-4 rounded-lg text-sm transition-colors flex items-center justify-center gap-2`}
                    disabled={completingSlug === q.slug}
                    onClick={async () => {
                      try {
                        const w = getConnectedWallet();
                        setCompletingSlug(q.slug);
                        const res = await completeQuest({ address: w.address, slug: q.slug });
                        setQuests((prev) => prev.map((item) => item.id === q.id ? { ...item, status: 'completed', progress: 100 } : item));
                        if (res.awarded && res.xp !== undefined) {
                          setUser((prev: any) => ({ ...prev, xp: res.xp }));
                        }
                      } catch (e: any) {
                        setError(e.message || 'Failed to complete quest');
                      } finally {
                        setCompletingSlug(null);
                      }
                    }}
                  >
                    {completingSlug === q.slug ? 'Completing...' : 'Mark as Done'}
                    <span className="material-symbols-outlined text-[18px]">check</span>
                  </button>
                )}
            </div>
        </div>
    </div>
  );

  return (
    <div className="flex-grow px-4 md:px-12 py-8 flex justify-center">
      <div className="flex flex-col max-w-6xl w-full gap-12">
        {/* Hero Section: Daily Push Timer */}
        <section className="flex flex-col items-center justify-center gap-6 py-10 relative overflow-hidden rounded-3xl bg-card-dark border border-white/5">
          {/* Background Glow Effect */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 blur-[120px] rounded-full pointer-events-none"></div>
          
          <div className="text-center z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary text-xs font-bold mb-4 uppercase tracking-wider">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Daily Push
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">New Quests Dropping In</h1>
            <p className="text-slate-400 text-lg">Prepare your wallet. Build the future.</p>
          </div>

          {/* Timer Component */}
          <div className="flex flex-wrap justify-center gap-4 z-10 mt-2">
            {[
              { label: 'Hours', value: timeLeft?.hours || '00' },
              { label: 'Mins', value: timeLeft?.mins || '00' },
              { label: 'Secs', value: timeLeft?.secs || '00' }
            ].map((item, idx) => (
               <React.Fragment key={item.label}>
                <div className="flex flex-col items-center gap-2">
                    <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-background-dark border border-border-dark shadow-inner">
                        <span className={`text-3xl font-bold font-mono ${item.label === 'Secs' ? 'text-primary' : 'text-white'}`}>{item.value}</span>
                    </div>
                    <span className="text-xs text-slate-500 uppercase font-bold tracking-widest">{item.label}</span>
                </div>
                {idx < 2 && <div className="h-20 flex items-center text-border-dark text-2xl font-bold">:</div>}
               </React.Fragment> 
            ))}
          </div>
        </section>

        {/* Quests Grid */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">bolt</span>
              Active Quests (Day {currentDay})
            </h2>
            <div className="flex items-center gap-4">
                 {user && (
                    <div className="bg-primary/20 border border-primary/30 px-4 py-2 rounded-lg text-primary font-bold">
                        {user.xp?.toLocaleString()} XP
                    </div>
                 )}
                 <Link to="#" className="text-sm text-slate-400 hover:text-white transition-colors">View all history -{'>'}</Link>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {error && <div className="text-red-500 font-bold">Failed to fetch: {error}</div>}
            {loading && (
              <div className="text-text-secondary">Loading quests...</div>
            )}
            {!loading && activeQuests.length === 0 && (
              <div className="text-text-secondary col-span-2 text-center py-10 bg-card-dark rounded-xl border border-white/5">
                 <span className="material-symbols-outlined text-4xl text-green-500 mb-2">check_circle</span>
                 <p>All active quests completed! Great job.</p>
              </div>
            )}
            {activeQuests.map(renderQuest)}
          </div>

          {completedQuests.length > 0 && (
            <div className="mt-12">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2 opacity-80">
                    <span className="material-symbols-outlined text-green-500">check_circle</span>
                    Completed Quests
                    </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-75 grayscale-[0.3] hover:grayscale-0 transition-all">
                    {completedQuests.map(renderQuest)}
                </div>
            </div>
          )}
        </section>

        {/* Footer Teaser */}
        <section className="border-t border-border-dark pt-8 pb-12">
          <div className="rounded-2xl bg-gradient-to-r from-card-dark to-primary/10 p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-white/5">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">emoji_events</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Season 2 Rewards Unlocked</h3>
                <p className="text-slate-400 text-sm">You've reached level 5. Claim your mystery box.</p>
              </div>
            </div>
            <button className="whitespace-nowrap rounded-lg bg-white text-black px-6 py-3 font-bold hover:bg-slate-200 transition-colors">
              Claim Rewards
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
