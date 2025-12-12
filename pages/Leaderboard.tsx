import React, { useEffect, useMemo, useState } from "react";
import { getUsers } from "../services/api";
import { getConnectedWallet } from "../services/wallet.ts";
import { IMAGES } from "../constants";

const Leaderboard = () => {
  const [users, setUsers] = useState<{ _id: string; handle?: string; address?: string; xp?: number; avatarUrl?: string; level?: number }[]>([]);
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
        quests: 0,
        avatarUrl: u.avatarUrl || IMAGES.defaultAvatar,
        isMe: false,
      })),
    [users]
  );

  const wallet = getConnectedWallet();
  const myIndex = users.findIndex((u) => u.address === wallet.address);
  const myUser = myIndex >= 0 ? users[myIndex] : undefined;

  return (
    <div className="flex-1 w-full max-w-[1200px] mx-auto px-4 md:px-8 py-8 flex flex-col gap-8">
      {/* Header & Stats */}
      <div className="flex flex-col lg:flex-row gap-8 justify-between items-end">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-4xl">trophy</span>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white">Global Ranking</h1>
          </div>
          <p className="text-text-secondary text-lg">Compete with the best onchain. Season ends in <span className="text-white font-bold">12d 4h 22m</span>.</p>
        </div>
        {/* Personal Stats Card */}
        <div className="w-full lg:w-auto flex-1 max-w-3xl">
          <div className="bg-card-dark border border-border-dark rounded-xl p-5 flex flex-wrap gap-6 items-center shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-500"></div>
            <div className="flex items-center gap-4 min-w-[200px]">
              <div className="relative">
                <div className="size-14 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-0.5">
                  <div className="w-full h-full bg-[#111118] rounded-full flex items-center justify-center overflow-hidden">
                    <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url("${IMAGES.defaultAvatar}")` }}></div>
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 bg-[#111118] rounded-full p-1">
                  <div className="bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">LVL 42</div>
                </div>
              </div>
              <div>
                <p className="text-white font-bold text-lg">{myUser?.handle || (wallet.address ? wallet.address.slice(0,6) + '...' + wallet.address.slice(-4) : 'You')}</p>
                <p className="text-text-secondary text-sm font-mono">{myUser?.address || wallet.address || "0x..."}</p>
              </div>
            </div>
            <div className="h-10 w-[1px] bg-border-dark hidden sm:block"></div>
            <div className="flex flex-1 justify-around gap-4">
              <div className="flex flex-col">
                <span className="text-text-secondary text-xs uppercase tracking-wider font-semibold">Current Rank</span>
                <span className="text-2xl font-bold text-white">#{myIndex >= 0 ? myIndex + 1 : 0}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-text-secondary text-xs uppercase tracking-wider font-semibold">Total XP</span>
                <span className="text-primary text-2xl font-bold">{(myUser?.xp ?? 0).toLocaleString()}</span>
              </div>
              <div className="flex flex-col hidden sm:flex">
                <span className="text-text-secondary text-xs uppercase tracking-wider font-semibold">Next Tier</span>
                <span className="text-white text-2xl font-bold">-550 <span className="text-sm font-normal text-text-secondary">XP</span></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top 3 Podium Section */}
      {loading && (
        <div className="text-text-secondary">Loading leaderboard...</div>
      )}
      {error && (
        <div className="text-red-400">{error}</div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 items-end">
        {/* 2nd Place */}
        <div className="order-2 md:order-1 bg-card-dark/50 border border-border-dark rounded-xl p-6 flex flex-col items-center relative hover:bg-card-dark transition-all duration-300">
          <div className="absolute -top-4 bg-[#111118] border border-border-dark px-3 py-1 rounded-full text-sm font-bold text-[#c0c0c0] flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">workspace_premium</span> #2
          </div>
          <div className="size-20 rounded-full border-2 border-[#c0c0c0] p-1 mb-3">
            <div className="w-full h-full rounded-full bg-cover bg-center" style={{ backgroundImage: `url("${topThree[0]?.avatarUrl || IMAGES.defaultAvatar}")` }}></div>
          </div>
          <h3 className="text-xl font-bold text-white mb-1">{topThree[1]?.handle || topThree[1]?.address || "Unknown"}</h3>
          <p className="text-primary font-bold">{(topThree[1]?.xp || 0).toLocaleString()} XP</p>
          <p className="text-text-secondary text-sm mt-2">0 Quests</p>
        </div>

        {/* 1st Place */}
        <div className="order-1 md:order-2 bg-gradient-to-b from-[#1a1a2e] to-[#111118] border border-primary/30 rounded-xl p-8 flex flex-col items-center relative shadow-[0_0_30px_rgba(43,43,238,0.15)] z-10 transform md:-translate-y-4">
          <div className="absolute -top-6">
            <span className="material-symbols-outlined text-5xl text-yellow-400 drop-shadow-lg">crown</span>
          </div>
          <div className="size-24 rounded-full border-4 border-yellow-400 p-1 mb-4 shadow-[0_0_20px_rgba(250,204,21,0.3)]">
            <div className="w-full h-full rounded-full bg-cover bg-center" style={{ backgroundImage: `url("${topThree[2]?.avatarUrl || IMAGES.defaultAvatar}")` }}></div>
          </div>
          <h3 className="text-2xl font-black text-white mb-1">{topThree[0]?.handle || topThree[0]?.address || "Unknown"}</h3>
          <div className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">Grandmaster</div>
          <p className="text-white text-3xl font-bold">{(topThree[0]?.xp || 0).toLocaleString()} XP</p>
          <p className="text-text-secondary text-sm mt-2">0 Quests</p>
        </div>

        {/* 3rd Place */}
        <div className="order-3 bg-card-dark/50 border border-border-dark rounded-xl p-6 flex flex-col items-center relative hover:bg-card-dark transition-all duration-300">
          <div className="absolute -top-4 bg-[#111118] border border-border-dark px-3 py-1 rounded-full text-sm font-bold text-[#cd7f32] flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">workspace_premium</span> #3
          </div>
          <div className="size-20 rounded-full border-2 border-[#cd7f32] p-1 mb-3">
            <div className="w-full h-full rounded-full bg-cover bg-center" style={{ backgroundImage: `url("${topThree[1]?.avatarUrl || IMAGES.defaultAvatar}")` }}></div>
          </div>
          <h3 className="text-xl font-bold text-white mb-1">{topThree[2]?.handle || topThree[2]?.address || "Unknown"}</h3>
          <p className="text-primary font-bold">{(topThree[2]?.xp || 0).toLocaleString()} XP</p>
          <p className="text-text-secondary text-sm mt-2">0 Quests</p>
        </div>
      </div>

      {/* Leaderboard Table Section */}
      <div className="flex flex-col bg-card-dark border border-border-dark rounded-xl overflow-hidden shadow-xl mt-4">
        {/* Filters & Search */}
        <div className="p-4 border-b border-border-dark flex flex-col sm:flex-row gap-4 justify-between items-center bg-[#16161f]">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-text-secondary">list_alt</span>
            Top 100 Contenders
          </h3>
          <div className="flex w-full sm:w-auto gap-3">
            <div className="relative group flex-1 sm:w-64">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-white transition-colors">search</span>
              <input value={q} onChange={(e) => setQ(e.target.value)} className="w-full bg-[#111118] border border-border-dark text-white text-sm rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder-gray-600 transition-all" placeholder="Search by name or address..." type="text"/>
            </div>
            <button className="bg-border-dark hover:bg-[#32324a] text-white p-2.5 rounded-lg border border-[#3f3f5a] transition-colors" title="Filter">
              <span className="material-symbols-outlined">filter_list</span>
            </button>
          </div>
        </div>
        
        {/* Table Header */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#111118] text-text-secondary text-xs uppercase tracking-wider border-b border-border-dark">
                <th className="px-6 py-4 font-semibold w-24 text-center">Rank</th>
                <th className="px-6 py-4 font-semibold">User</th>
                <th className="px-6 py-4 font-semibold text-right cursor-pointer hover:text-white group transition-colors">
                  Quests <span className="material-symbols-outlined align-middle text-sm opacity-0 group-hover:opacity-100">arrow_drop_down</span>
                </th>
                <th className="px-6 py-4 font-semibold text-right cursor-pointer hover:text-white group transition-colors text-primary">
                  Total XP <span className="material-symbols-outlined align-middle text-sm">arrow_drop_down</span>
                </th>
                <th className="px-6 py-4 font-semibold text-center hidden md:table-cell">Tier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-dark">
              {others.map((entry, idx) => (
                <React.Fragment key={entry.rank}>
                   {idx === 3 && ( // Simulate separator for "You"
                     <tr>
                        <td className="px-6 py-4 text-center text-text-secondary text-sm bg-[#111118]/50" colSpan={5}>
                            <span className="material-symbols-outlined text-base">more_vert</span>
                        </td>
                     </tr>
                   )}
                   <tr className={`group hover:bg-[#22223b] transition-colors ${entry.isMe ? 'bg-primary/10 border-l-4 border-l-primary hover:bg-primary/15' : ''}`}>
                    <td className="px-6 py-4 text-center">
                      <span className={`font-bold ${entry.isMe ? 'text-primary' : 'text-white'}`}>#{entry.rank}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`size-8 rounded-full bg-cover bg-center ${entry.isMe ? 'border border-primary' : ''}`} style={{ backgroundImage: `url("${entry.avatarUrl}")` }}></div>
                        <span className="font-bold text-white">{entry.name}</span>
                        {entry.isMe && <span className="bg-primary text-white text-[10px] px-1.5 rounded ml-1">ME</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-white font-medium">{entry.quests}</td>
                    <td className="px-6 py-4 text-right text-primary font-bold">{entry.xp.toLocaleString()}</td>
                    <td className="px-6 py-4 text-center hidden md:table-cell">
                      {entry.tier && (
                        <span className={`px-2 py-1 rounded text-xs font-bold border ${entry.tier === 'Master' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' : entry.tier === 'Diamond' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' : 'bg-green-500/20 text-green-300 border-green-500/30'}`}>
                          {entry.tier}
                        </span>
                      )}
                    </td>
                  </tr>
                </React.Fragment>
              ))}
              {/* Fake rows for visual completeness */}
              <tr className="group hover:bg-[#22223b] transition-colors">
                 <td className="px-6 py-4 text-center text-text-secondary text-sm bg-[#111118]/50" colSpan={5}>
                    <span className="material-symbols-outlined text-base">more_vert</span>
                 </td>
              </tr>
               <tr className="group hover:bg-[#22223b] transition-colors">
                <td className="px-6 py-4 text-center">
                    <span className="font-bold text-text-secondary">#99</span>
                </td>
                <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                    <div className="size-8 rounded-full bg-gradient-to-r from-gray-700 to-gray-600 flex items-center justify-center text-xs font-bold text-white">0x3f</div>
                    <span className="font-medium text-text-secondary">0x3f...e92a</span>
                    </div>
                </td>
                <td className="px-6 py-4 text-right text-white font-medium">21</td>
                <td className="px-6 py-4 text-right text-text-secondary font-bold">101,200</td>
                <td className="px-6 py-4 text-center hidden md:table-cell">
                    <span className="bg-gray-500/20 text-gray-300 px-2 py-1 rounded text-xs font-bold border border-gray-500/30">Novice</span>
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
