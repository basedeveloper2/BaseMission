import React, { useEffect, useMemo, useState } from "react";
import { getUsers } from "../services/api";
import { getConnectedWallet } from "../services/wallet.ts";
import { IMAGES } from "../constants";

const Leaderboard = () => {
  const [users, setUsers] = useState<{ _id: string; handle?: string; address?: string; xp?: number; avatarUrl?: string; level?: number; questsCompleted?: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    setLoading(true);
    getUsers({ limit: 100, sort: "xp", order: "desc", q })
      .then(setUsers)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [q]);

  useEffect(() => {
    const id = setInterval(() => {
      getUsers({ limit: 100, sort: "xp", order: "desc", q, force: true }).then(setUsers).catch(() => {});
    }, 30000);
    return () => clearInterval(id);
  }, []);

  const topThree = useMemo(() => users.slice(0, 3), [users]);
  const others = useMemo(
    () =>
      users.slice(3).map((u, i) => ({
        rank: i + 4,
        name: u.handle || u.address || `User ${i + 4}`,
        xp: u.xp || 0,
        quests: u.questsCompleted || 0,
        avatarUrl: u.avatarUrl || IMAGES.defaultAvatar,
        isMe: false,
      })),
    [users]
  );

  const wallet = getConnectedWallet();
  const myIndex = users.findIndex((u) => u.address === wallet.address);
  const myUser = myIndex >= 0 ? users[myIndex] : undefined;

  return (
    <div className="flex-1 w-full max-w-[1200px] mx-auto px-4 md:px-8 py-8 flex flex-col gap-8 relative z-10">
      {/* Header & Stats */}
      <div className="flex flex-col lg:flex-row gap-8 justify-between items-end">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary-glow text-4xl animate-float">trophy</span>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight font-display bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">Global Ranking</h1>
          </div>
          <p className="text-text-secondary text-lg">Compete with the best onchain. Season ends in <span className="text-white font-bold">12d 4h 22m</span>.</p>
        </div>
        {/* Personal Stats Card */}
        <div className="w-full lg:w-auto flex-1 max-w-3xl">
          <div className="glass-card p-6 flex flex-wrap gap-6 items-center rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-primary-glow"></div>
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/20 rounded-full blur-[80px] group-hover:bg-primary/30 transition-all duration-500"></div>
            <div className="flex items-center gap-4 min-w-[200px] relative z-10">
              <div className="relative">
                <div className="size-16 rounded-full bg-gradient-to-br from-primary to-purple-600 p-[2px] shadow-lg shadow-primary/20">
                  <div className="w-full h-full bg-black rounded-full flex items-center justify-center overflow-hidden">
                    <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url("${IMAGES.defaultAvatar}")` }}></div>
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 bg-black rounded-full p-1">
                  <div className="bg-gradient-to-r from-primary to-primary-glow text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg">LVL 42</div>
                </div>
              </div>
              <div>
                <p className="text-white font-bold text-lg tracking-wide">{myUser?.handle || (wallet.address ? wallet.address.slice(0,6) + '...' + wallet.address.slice(-4) : 'You')}</p>
                <p className="text-text-secondary text-sm font-mono">{myUser?.address || wallet.address || "0x..."}</p>
              </div>
            </div>
            <div className="h-12 w-[1px] bg-white/10 hidden sm:block"></div>
            <div className="flex flex-1 justify-around gap-4 relative z-10">
              <div className="flex flex-col items-center sm:items-start">
                <span className="text-text-secondary text-[10px] uppercase tracking-widest font-bold mb-1">Current Rank</span>
                <span className="text-2xl font-black text-white">#{myIndex >= 0 ? myIndex + 1 : 0}</span>
              </div>
              <div className="flex flex-col items-center sm:items-start">
                <span className="text-text-secondary text-[10px] uppercase tracking-widest font-bold mb-1">Total XP</span>
                <span className="text-primary-glow text-2xl font-black drop-shadow-[0_0_10px_rgba(79,70,229,0.5)]">{(myUser?.xp ?? 0).toLocaleString()}</span>
                <span className="text-text-secondary text-[10px] mt-1">{myUser?.questsCompleted || 0} Quests</span>
              </div>
              <div className="flex flex-col hidden sm:flex">
                <span className="text-text-secondary text-[10px] uppercase tracking-widest font-bold mb-1">Next Tier</span>
                <span className="text-white text-2xl font-bold">-550 <span className="text-sm font-normal text-text-secondary">XP</span></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top 3 Podium Section */}
      {loading && (
        <div className="text-text-secondary animate-pulse">Loading leaderboard...</div>
      )}
      {error && (
        <div className="text-red-400 bg-red-500/10 p-4 rounded-xl border border-red-500/20">{error}</div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 items-end">
        {/* 2nd Place */}
        <div className="order-2 md:order-1 glass-card p-6 flex flex-col items-center relative rounded-2xl hover:-translate-y-2 transition-transform duration-300">
          <div className="absolute -top-4 bg-black/80 backdrop-blur-md border border-white/10 px-4 py-1.5 rounded-full text-sm font-bold text-gray-300 flex items-center gap-1 shadow-lg">
            <span className="material-symbols-outlined text-sm">workspace_premium</span> #2
          </div>
          <div className="size-24 rounded-full border-2 border-gray-400 p-1 mb-4 shadow-[0_0_20px_rgba(156,163,175,0.2)]">
            <div className="w-full h-full rounded-full bg-cover bg-center" style={{ backgroundImage: `url("${topThree[0]?.avatarUrl || IMAGES.defaultAvatar}")` }}></div>
          </div>
          <h3 className="text-xl font-bold text-white mb-1">{topThree[1]?.handle || topThree[1]?.address || "Unknown"}</h3>
          <p className="text-primary-glow font-bold text-lg">{(topThree[1]?.xp || 0).toLocaleString()} XP</p>
          <p className="text-text-secondary text-sm mt-2 font-medium">{topThree[1]?.questsCompleted || 0} Quests</p>
        </div>

        {/* 1st Place */}
        <div className="order-1 md:order-2 glass-card p-8 flex flex-col items-center relative rounded-2xl shadow-[0_0_50px_rgba(250,204,21,0.15)] z-10 transform md:-translate-y-8 border-yellow-500/30 bg-gradient-to-b from-yellow-500/5 to-transparent">
          <div className="absolute -top-8 animate-float">
            <span className="material-symbols-outlined text-6xl text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]">crown</span>
          </div>
          <div className="size-32 rounded-full border-4 border-yellow-400 p-1 mb-6 shadow-[0_0_30px_rgba(250,204,21,0.4)] relative">
            <div className="absolute inset-0 rounded-full bg-yellow-400/20 blur-xl animate-pulse-glow"></div>
            <div className="w-full h-full rounded-full bg-cover bg-center relative z-10" style={{ backgroundImage: `url("${topThree[2]?.avatarUrl || IMAGES.defaultAvatar}")` }}></div>
          </div>
          <h3 className="text-3xl font-black text-white mb-2">{topThree[0]?.handle || topThree[0]?.address || "Unknown"}</h3>
          <div className="bg-yellow-500/20 text-yellow-300 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-4 border border-yellow-500/30">Grandmaster</div>
          <p className="text-white text-4xl font-black tracking-tight">{(topThree[0]?.xp || 0).toLocaleString()} XP</p>
          <p className="text-text-secondary text-sm mt-2 font-medium">{topThree[0]?.questsCompleted || 0} Quests</p>
        </div>

        {/* 3rd Place */}
        <div className="order-3 glass-card p-6 flex flex-col items-center relative rounded-2xl hover:-translate-y-2 transition-transform duration-300">
          <div className="absolute -top-4 bg-black/80 backdrop-blur-md border border-white/10 px-4 py-1.5 rounded-full text-sm font-bold text-orange-400 flex items-center gap-1 shadow-lg">
            <span className="material-symbols-outlined text-sm">workspace_premium</span> #3
          </div>
          <div className="size-24 rounded-full border-2 border-orange-500 p-1 mb-4 shadow-[0_0_20px_rgba(249,115,22,0.2)]">
            <div className="w-full h-full rounded-full bg-cover bg-center" style={{ backgroundImage: `url("${topThree[1]?.avatarUrl || IMAGES.defaultAvatar}")` }}></div>
          </div>
          <h3 className="text-xl font-bold text-white mb-1">{topThree[2]?.handle || topThree[2]?.address || "Unknown"}</h3>
          <p className="text-primary-glow font-bold text-lg">{(topThree[2]?.xp || 0).toLocaleString()} XP</p>
          <p className="text-text-secondary text-sm mt-2 font-medium">{topThree[2]?.questsCompleted || 0} Quests</p>
        </div>
      </div>

      {/* Leaderboard Table Section */}
      <div className="flex flex-col glass-card rounded-2xl overflow-hidden mt-8">
        {/* Filters & Search */}
        <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row gap-6 justify-between items-center bg-white/5">
          <h3 className="text-xl font-bold text-white flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20 text-primary">
                <span className="material-symbols-outlined">list_alt</span>
            </div>
            Top 100 Contenders
          </h3>
          <div className="flex w-full sm:w-auto gap-3">
            <div className="relative group flex-1 sm:w-72">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-primary transition-colors">search</span>
              <input value={q} onChange={(e) => setQ(e.target.value)} className="w-full bg-black/40 border border-white/10 text-white text-sm rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-primary/50 focus:bg-black/60 placeholder-text-secondary transition-all font-medium" placeholder="Search by name or address..." type="text"/>
            </div>
            <button className="bg-white/5 hover:bg-white/10 text-white p-3 rounded-xl border border-white/10 transition-colors" title="Filter">
              <span className="material-symbols-outlined">filter_list</span>
            </button>
          </div>
        </div>
        
        {/* Table Header */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/20 text-text-secondary text-xs font-bold uppercase tracking-wider border-b border-white/5">
                <th className="px-8 py-5 w-24 text-center">Rank</th>
                <th className="px-8 py-5">User</th>
                <th className="px-8 py-5 text-right cursor-pointer hover:text-white group transition-colors">
                  Quests <span className="material-symbols-outlined align-middle text-sm opacity-0 group-hover:opacity-100 transition-opacity">arrow_drop_down</span>
                </th>
                <th className="px-8 py-5 text-right cursor-pointer hover:text-white group transition-colors text-primary-glow">
                  Total XP <span className="material-symbols-outlined align-middle text-sm">arrow_drop_down</span>
                </th>
                <th className="px-8 py-5 text-center hidden md:table-cell">Tier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {others.map((entry, idx) => (
                <React.Fragment key={entry.rank}>
                   {idx === 3 && ( // Simulate separator for "You"
                     <tr>
                        <td className="px-8 py-4 text-center text-text-secondary text-sm bg-white/5" colSpan={5}>
                            <span className="material-symbols-outlined text-base">more_vert</span>
                        </td>
                     </tr>
                   )}
                   <tr className={`group hover:bg-white/5 transition-colors ${entry.isMe ? 'bg-primary/10 hover:bg-primary/20' : ''}`}>
                    <td className="px-8 py-5 text-center">
                      <span className={`font-bold text-lg ${entry.isMe ? 'text-primary' : 'text-white'}`}>#{entry.rank}</span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className={`size-10 rounded-full bg-cover bg-center shadow-md ${entry.isMe ? 'border-2 border-primary' : 'border border-white/10'}`} style={{ backgroundImage: `url("${entry.avatarUrl}")` }}></div>
                        <span className="font-bold text-white text-base">{entry.name}</span>
                        {entry.isMe && <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full ml-2 shadow-sm">YOU</span>}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right text-white font-medium">{entry.quests}</td>
                    <td className="px-8 py-5 text-right text-primary-glow font-black text-lg drop-shadow-[0_0_8px_rgba(79,70,229,0.3)]">{entry.xp.toLocaleString()}</td>
                    <td className="px-8 py-5 text-center hidden md:table-cell">
                      {entry.tier && (
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${entry.tier === 'Master' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' : entry.tier === 'Diamond' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' : 'bg-green-500/20 text-green-300 border-green-500/30'}`}>
                          {entry.tier}
                        </span>
                      )}
                    </td>
                  </tr>
                </React.Fragment>
              ))}
              {/* Fake rows for visual completeness */}
              <tr className="group hover:bg-white/5 transition-colors">
                 <td className="px-8 py-4 text-center text-text-secondary text-sm bg-white/5" colSpan={5}>
                    <span className="material-symbols-outlined text-base">more_vert</span>
                 </td>
              </tr>
               <tr className="group hover:bg-white/5 transition-colors">
                <td className="px-8 py-5 text-center">
                    <span className="font-bold text-text-secondary text-lg">#99</span>
                </td>
                <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                    <div className="size-10 rounded-full bg-gradient-to-r from-gray-700 to-gray-600 flex items-center justify-center text-xs font-bold text-white border border-white/10">0x3f</div>
                    <span className="font-bold text-text-secondary">0x3f...e92a</span>
                    </div>
                </td>
                <td className="px-8 py-5 text-right text-white font-medium">21</td>
                <td className="px-8 py-5 text-right text-text-secondary font-bold text-lg">101,200</td>
                <td className="px-8 py-5 text-center hidden md:table-cell">
                    <span className="bg-gray-500/20 text-gray-400 px-3 py-1 rounded-full text-xs font-bold border border-gray-500/30">Novice</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
