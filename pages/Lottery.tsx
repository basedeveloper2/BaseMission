import React, { useState, useEffect } from "react";
import { getEligibleLotteryUsers, getLatestLotteryWinner, LotteryUser, LotteryWinnerResponse } from "../services/api";

const Lottery = () => {
  const [users, setUsers] = useState<LotteryUser[]>([]);
  const [winnerInfo, setWinnerInfo] = useState<LotteryWinnerResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!winnerInfo?.nextDraw) return;
    
    const updateTimer = () => {
        const now = new Date().getTime();
        const target = new Date(winnerInfo.nextDraw).getTime();
        const diff = target - now;
        
        if (diff <= 0) {
            setTimeLeft("Draw in progress...");
        } else {
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
        }
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [winnerInfo]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [eligible, latest] = await Promise.all([
          getEligibleLotteryUsers(),
          getLatestLotteryWinner()
      ]);
      setUsers(eligible.eligibleUsers);
      setWinnerInfo(latest);
    } catch (e) {
      console.error("Failed to load lottery data", e);
    } finally {
      setLoading(false);
    }
  };

  const winner = winnerInfo?.winner;

  return (
    <div className="min-h-screen pt-24 pb-12 px-6 lg:px-12">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Header & Countdown */}
        <div className="text-center space-y-6">
          <h1 className="text-4xl lg:text-5xl font-bold font-display tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            Weekly Quest Lottery
          </h1>
          
          <div className="inline-flex flex-col items-center gap-2 p-6 rounded-2xl bg-surface-dark/50 border border-white/5 backdrop-blur-sm">
            <span className="text-sm font-bold text-primary uppercase tracking-wider">Next Draw In</span>
            <div className="text-4xl font-mono font-bold text-white tabular-nums">
                {timeLeft || "--d --h --m --s"}
            </div>
            <span className="text-xs text-slate-500">Every Saturday at 22:00 SAST</span>
          </div>

          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Complete more than 25 quests this week to automatically enter the draw!
          </p>
        </div>

        {/* Latest Winner Announcement */}
        {winner && (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 p-8 text-center animate-pulse-glow">
            <div className="absolute inset-0 bg-noise opacity-10"></div>
            <div className="relative z-10 space-y-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-yellow-500/20 border border-yellow-500/50 mb-2">
                <span className="material-symbols-outlined text-2xl text-yellow-400">trophy</span>
              </div>
              <h2 className="text-2xl font-bold text-white">Last Week's Winner</h2>
              <div className="flex flex-col items-center gap-3">
                {winner.avatarUrl ? (
                    <img src={winner.avatarUrl} alt={winner.handle || "Winner"} className="w-24 h-24 rounded-full border-4 border-yellow-500 shadow-xl shadow-yellow-500/20" />
                ) : (
                    <div className="w-24 h-24 rounded-full bg-yellow-500/30 border-4 border-yellow-500 flex items-center justify-center text-3xl font-bold shadow-xl shadow-yellow-500/20">
                        {(winner.handle || winner.userId).substring(0, 2).toUpperCase()}
                    </div>
                )}
                <div className="text-2xl font-bold text-yellow-200">
                    {winner.handle || (winner.userId.substring(0, 6) + "..." + winner.userId.substring(winner.userId.length - 4))}
                </div>
                <div className="text-sm text-yellow-200/70">
                    Drawn on {new Date(winner.drawnAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Eligible List */}
        <div className="bg-surface-dark/50 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">groups</span>
                    Eligible for Next Draw ({users.length})
                </h3>
            </div>
            
            {loading ? (
                <div className="p-12 flex justify-center">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : users.length > 0 ? (
                <div className="divide-y divide-white/5 max-h-[500px] overflow-y-auto">
                    {users.map((user, i) => (
                        <div key={user.userId} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="text-slate-500 font-mono w-6 text-right">#{i + 1}</div>
                                {user.avatarUrl ? (
                                    <img src={user.avatarUrl} alt="" className="w-10 h-10 rounded-full bg-surface-highlight" />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-surface-highlight flex items-center justify-center text-sm font-bold text-slate-300">
                                        {(user.handle || user.userId).substring(0, 2).toUpperCase()}
                                    </div>
                                )}
                                <div>
                                    <div className="font-bold text-slate-200">
                                        {user.handle || (user.userId.substring(0, 6) + "..." + user.userId.substring(user.userId.length - 4))}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                                <span className="text-primary font-bold">{user.questCount}</span>
                                <span className="text-xs text-primary/80 uppercase tracking-wider">Quests</span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="p-12 text-center text-slate-500">
                    No users eligible yet. Keep completing quests!
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Lottery;
