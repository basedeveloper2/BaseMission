import React, { useEffect, useState } from "react";
import { IMAGES } from "../constants";
import { getUsers } from "../services/api.ts";

const SquadLeaderboard = () => {
  const [users, setUsers] = useState<{ _id: string; handle?: string; address?: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getUsers().then(setUsers).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, []);

  const handleInvite = () => {
    const text = "Join my squad on Base Odyssey and let's dominate the leaderboard! 🚀 #BaseOdyssey";
    const url = window.location.origin;
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(shareUrl, '_blank');
  };

  return (
    <div className="px-4 md:px-20 lg:px-40 flex flex-1 justify-center py-5 pb-24 relative z-10">
      <div className="flex flex-col max-w-[1024px] flex-1 gap-8">
        {/* Page Heading & Stats */}
        <div className="flex flex-col gap-8 p-4">
          <div className="flex flex-wrap justify-between gap-6 items-end">
            <div className="flex min-w-72 flex-col gap-3">
              <h1 className="text-white text-5xl font-black leading-tight tracking-tight font-display bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">Squad Leaderboard</h1>
              <p className="text-text-secondary text-lg font-normal leading-normal">Compete with friends and rule the Base ecosystem.</p>
            </div>
            <button onClick={handleInvite} className="flex items-center justify-center gap-2 rounded-xl h-12 px-6 bg-gradient-to-r from-primary to-primary-glow text-white text-sm font-bold leading-normal hover:brightness-110 transition-all shadow-lg shadow-primary/25 active:scale-95 group">
              <span className="material-symbols-outlined text-[20px] group-hover:rotate-12 transition-transform">share</span>
              <span className="truncate">Invite Friends</span>
            </button>
          </div>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-4">
            <div className="flex flex-1 gap-4 rounded-2xl glass-card p-6 flex-col hover:-translate-y-1 transition-transform duration-300 group">
              <div className="text-primary-glow group-hover:scale-110 transition-transform origin-left">
                <span className="material-symbols-outlined text-[32px] drop-shadow-[0_0_8px_rgba(79,70,229,0.5)]">group</span>
              </div>
              <div className="flex flex-col gap-1">
                <h2 className="text-white text-2xl font-black leading-tight">Alpha Team</h2>
                <p className="text-text-secondary text-sm font-bold uppercase tracking-wider">Your Squad</p>
              </div>
            </div>
            <div className="flex flex-1 gap-4 rounded-2xl glass-card p-6 flex-col hover:-translate-y-1 transition-transform duration-300 group">
              <div className="text-yellow-400 group-hover:scale-110 transition-transform origin-left">
                <span className="material-symbols-outlined text-[32px] drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]">emoji_events</span>
              </div>
              <div className="flex flex-col gap-1">
                <h2 className="text-white text-2xl font-black leading-tight">1,240,500 XP</h2>
                <p className="text-text-secondary text-sm font-bold uppercase tracking-wider">Total XP</p>
              </div>
            </div>
            <div className="flex flex-1 gap-4 rounded-2xl glass-card p-6 flex-col hover:-translate-y-1 transition-transform duration-300 group">
              <div className="text-green-400 group-hover:scale-110 transition-transform origin-left">
                <span className="material-symbols-outlined text-[32px] drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]">person_add</span>
              </div>
              <div className="flex flex-col gap-1">
                <h2 className="text-white text-2xl font-black leading-tight">12 Members</h2>
                <p className="text-text-secondary text-sm font-bold uppercase tracking-wider">Squad Size</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Filters */}
        <div className="px-4">
          <div className="flex h-14 w-full sm:w-auto sm:inline-flex items-center justify-center rounded-xl bg-black/20 border border-white/5 p-1.5 backdrop-blur-sm">
            {['Weekly', 'All-Time', 'Friends'].map((filter, idx) => (
               <label key={filter} className="flex cursor-pointer h-full grow sm:grow-0 sm:w-32 items-center justify-center overflow-hidden rounded-lg px-4 has-[:checked]:bg-white/10 has-[:checked]:text-white text-text-secondary hover:text-white transition-all text-sm font-bold leading-normal relative group">
                <span className="truncate z-10">{filter}</span>
                <input defaultChecked={idx===0} className="invisible w-0 absolute" name="period" type="radio" value={filter}/>
                <div className="absolute inset-0 bg-primary/20 opacity-0 group-has-[:checked]:opacity-100 transition-opacity"></div>
              </label>
            ))}
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="px-4 @container">
          <div className="flex overflow-hidden rounded-2xl glass-card shadow-2xl">
            <table className="flex-1 w-full">
              <thead>
                <tr className="bg-black/20 border-b border-white/5">
                  <th className="px-6 py-5 text-left text-text-secondary w-20 text-xs font-bold uppercase tracking-wider">Rank</th>
                  <th className="px-6 py-5 text-left text-text-secondary w-full sm:w-64 text-xs font-bold uppercase tracking-wider">Member</th>
                  <th className="px-6 py-5 text-center text-text-secondary w-24 hidden sm:table-cell text-xs font-bold uppercase tracking-wider">Level</th>
                  <th className="px-6 py-5 text-left text-text-secondary min-w-[200px] hidden md:table-cell text-xs font-bold uppercase tracking-wider">
                      Quests Completed
                  </th>
                  <th className="px-6 py-5 text-right text-text-secondary w-40 text-xs font-bold uppercase tracking-wider">Total XP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((u, idx) => (
                    <tr key={u._id} className="hover:bg-white/5 transition-colors group">
                        <td className="px-6 py-4 text-white text-xl font-bold">
                            <div className={`size-8 flex items-center justify-center rounded-full text-text-secondary pl-2`}>
                                {idx + 1}
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div className={`bg-center bg-no-repeat bg-cover rounded-full size-12 border border-white/10 shadow-sm`} style={{ backgroundImage: `url("${IMAGES.defaultAvatar}")` }}></div>
                                    <div className="absolute -bottom-1 -right-1 bg-black rounded-full p-0.5">
                                        <div className="size-3 rounded-full bg-green-500 border-2 border-black"></div>
                                    </div>
                                </div>
                                <div className="flex flex-col">
                                    <p className="text-base font-bold text-white leading-tight group-hover:text-primary-glow transition-colors">{u.handle || u.address?.slice(0, 8) || "Anonymous"}</p>
                                    <p className="text-xs font-medium text-text-secondary">{u.address ? `${u.address.slice(0,6)}...${u.address.slice(-4)}` : "0x..."}</p>
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-center hidden sm:table-cell">
                            <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-md bg-white/5 border border-white/5 text-xs font-bold text-white">
                                12
                            </span>
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell">
                            <div className="flex flex-col gap-1.5 w-full max-w-[140px]">
                                <div className="flex justify-between text-xs">
                                    <span className="text-white font-bold">8/12</span>
                                    <span className="text-text-secondary">66%</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-primary to-primary-glow w-[66%] rounded-full"></div>
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                            <div className="flex flex-col items-end gap-0.5">
                                <span className="text-lg font-black text-white tracking-tight">{(12500 + idx * 100).toLocaleString()}</span>
                                <span className="text-[10px] font-bold text-primary-glow uppercase tracking-wide">XP Points</span>
                            </div>
                        </td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sticky User Stats at Bottom */}
        <div className="fixed bottom-0 left-0 right-0 z-40 px-4 md:px-20 lg:px-40 pb-4 pt-8 bg-gradient-to-t from-background-dark via-background-dark to-transparent pointer-events-none">
            <div className="max-w-[1024px] mx-auto pointer-events-auto">
                <div className="flex items-center justify-between glass-card rounded-xl px-6 py-4 shadow-2xl ring-1 ring-primary/50">
                    <div className="flex items-center gap-6 flex-1">
                        <span className="text-white text-xl font-black w-8 text-center drop-shadow-md">12</span>
                        <div className="flex items-center gap-4">
                            <div className="bg-center bg-no-repeat bg-cover rounded-full size-12 border-2 border-primary shadow-[0_0_15px_rgba(79,70,229,0.4)]" style={{ backgroundImage: `url("${IMAGES.me}")` }}></div>
                            <div className="flex flex-col">
                                <span className="text-white font-bold text-lg">You</span>
                                <span className="text-primary-glow text-xs font-mono font-bold">0xYOU...123</span>
                            </div>
                        </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-10 mr-8">
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] text-text-secondary uppercase font-bold tracking-widest mb-0.5">Level</span>
                            <span className="text-white font-black text-lg">24</span>
                        </div>
                         <div className="flex flex-col items-end min-w-[120px]">
                            <span className="text-[10px] text-text-secondary uppercase font-bold tracking-widest mb-1.5">Progress</span>
                             <div className="w-full flex items-center gap-2">
                                <div className="h-2 w-full rounded-full bg-black/40 overflow-hidden border border-white/5">
                                    <div className="h-full rounded-full bg-gradient-to-r from-primary to-primary-glow" style={{ width: '45%' }}></div>
                                </div>
                             </div>
                        </div>
                    </div>
                    <div className="flex flex-col items-end">
                         <span className="text-[10px] text-text-secondary uppercase font-bold tracking-widest mb-0.5">Total XP</span>
                         <span className="text-white font-black font-mono text-xl drop-shadow-[0_0_8px_rgba(79,70,229,0.5)]">28,450</span>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SquadLeaderboard;
