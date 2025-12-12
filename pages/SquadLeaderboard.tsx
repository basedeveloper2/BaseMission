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

  return (
    <div className="px-4 md:px-20 lg:px-40 flex flex-1 justify-center py-5 pb-24">
      <div className="flex flex-col max-w-[1024px] flex-1 gap-6">
        {/* Page Heading & Stats */}
        <div className="flex flex-col gap-6 p-4">
          <div className="flex flex-wrap justify-between gap-6 items-end">
            <div className="flex min-w-72 flex-col gap-3">
              <h1 className="text-white text-4xl font-black leading-tight tracking-[-0.033em]">Squad Leaderboard</h1>
              <p className="text-text-secondary text-base font-normal leading-normal">Compete with friends and rule the Base ecosystem.</p>
            </div>
            <button className="flex items-center justify-center gap-2 rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal hover:bg-primary/90 transition-all shadow-[0_0_15px_rgba(43,43,238,0.3)]">
              <span className="material-symbols-outlined text-[20px]">share</span>
              <span className="truncate">Invite Friends</span>
            </button>
          </div>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            <div className="flex flex-1 gap-3 rounded-xl border border-border-dark bg-card-dark p-5 flex-col hover:border-primary/50 transition-colors group">
              <div className="text-primary group-hover:scale-110 transition-transform origin-left">
                <span className="material-symbols-outlined text-[28px]">group</span>
              </div>
              <div className="flex flex-col gap-1">
                <h2 className="text-white text-lg font-bold leading-tight">Alpha Team</h2>
                <p className="text-text-secondary text-sm font-normal leading-normal">Your Squad</p>
              </div>
            </div>
            <div className="flex flex-1 gap-3 rounded-xl border border-border-dark bg-card-dark p-5 flex-col hover:border-primary/50 transition-colors group">
              <div className="text-primary group-hover:scale-110 transition-transform origin-left">
                <span className="material-symbols-outlined text-[28px]">emoji_events</span>
              </div>
              <div className="flex flex-col gap-1">
                <h2 className="text-white text-lg font-bold leading-tight">1,240,500 XP</h2>
                <p className="text-text-secondary text-sm font-normal leading-normal">Total XP</p>
              </div>
            </div>
            <div className="flex flex-1 gap-3 rounded-xl border border-border-dark bg-card-dark p-5 flex-col hover:border-primary/50 transition-colors group">
              <div className="text-primary group-hover:scale-110 transition-transform origin-left">
                <span className="material-symbols-outlined text-[28px]">person_add</span>
              </div>
              <div className="flex flex-col gap-1">
                <h2 className="text-white text-lg font-bold leading-tight">12 Members</h2>
                <p className="text-text-secondary text-sm font-normal leading-normal">Squad Size</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Filters */}
        <div className="px-4">
          <div className="flex h-12 w-full sm:w-auto sm:inline-flex items-center justify-center rounded-lg bg-card-dark border border-border-dark p-1">
            {['Weekly', 'All-Time', 'Friends'].map((filter, idx) => (
               <label key={filter} className="flex cursor-pointer h-full grow sm:grow-0 sm:w-32 items-center justify-center overflow-hidden rounded-md px-4 has-[:checked]:bg-background-dark has-[:checked]:text-white text-text-secondary hover:text-white transition-colors text-sm font-medium leading-normal relative group">
                <span className="truncate z-10">{filter}</span>
                <input defaultChecked={idx===0} className="invisible w-0 absolute" name="period" type="radio" value={filter}/>
                <div className="absolute inset-0 bg-primary/10 opacity-0 group-has-[:checked]:opacity-100 rounded-md transition-opacity"></div>
              </label>
            ))}
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="px-4 @container">
          <div className="flex overflow-hidden rounded-xl border border-border-dark bg-background-dark shadow-2xl">
            <table className="flex-1 w-full">
              <thead>
                <tr className="bg-card-dark border-b border-border-dark">
                  <th className="px-4 py-4 text-left text-text-secondary w-16 text-sm font-semibold uppercase tracking-wider">Rank</th>
                  <th className="px-4 py-4 text-left text-text-secondary w-full sm:w-64 text-sm font-semibold uppercase tracking-wider">Member</th>
                  <th className="px-4 py-4 text-center text-text-secondary w-24 hidden sm:table-cell text-sm font-semibold uppercase tracking-wider">Level</th>
                  <th className="px-4 py-4 text-left text-text-secondary min-w-[200px] hidden md:table-cell text-sm font-semibold uppercase tracking-wider">
                      Quests Completed
                  </th>
                  <th className="px-4 py-4 text-right text-text-secondary w-32 text-sm font-semibold uppercase tracking-wider">Total XP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-dark">
                {users.map((u, idx) => (
                    <tr key={u._id} className="hover:bg-card-dark/50 transition-colors group">
                        <td className="px-4 py-3 text-white text-lg font-bold">
                            <div className={`size-8 flex items-center justify-center rounded-full text-text-secondary pl-2`}>
                                {idx + 1}
                            </div>
                        </td>
                        <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className={`bg-center bg-no-repeat bg-cover rounded-full size-10 bg-border-dark`} style={{ backgroundImage: `url("${IMAGES.defaultAvatar}")` }}></div>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-white font-bold text-base">{u.handle || "Unknown"}</span>
                                    <span className="text-text-secondary text-xs font-mono">{u.address || "0x..."}</span>
                                </div>
                            </div>
                        </td>
                        <td className="px-4 py-3 text-center hidden sm:table-cell">
                            <div className="inline-flex items-center justify-center rounded-full px-3 py-1 bg-border-dark text-white text-xs font-bold border border-white/5">
                                Lvl 0
                            </div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                            <div className="flex flex-col gap-1 w-full max-w-[240px]">
                                <div className="flex justify-between text-xs text-text-secondary mb-1">
                                    <span>0/0 Quests</span>
                                    <span className="text-primary font-bold">0%</span>
                                </div>
                                <div className="h-2 w-full rounded-full bg-border-dark overflow-hidden">
                                    <div className="h-full rounded-full bg-gradient-to-r from-primary to-blue-400" style={{ width: `0%` }}></div>
                                </div>
                            </div>
                        </td>
                        <td className="px-4 py-3 text-right text-white font-bold font-mono text-base tracking-tight">0</td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sticky User Stats at Bottom */}
        <div className="fixed bottom-0 left-0 right-0 z-40 px-4 md:px-20 lg:px-40 pb-4 pt-2 bg-gradient-to-t from-background-dark via-background-dark to-transparent">
            <div className="max-w-[1024px] mx-auto">
                <div className="flex items-center justify-between bg-primary/20 backdrop-blur-md border border-primary/50 rounded-xl px-4 py-3 shadow-[0_0_20px_rgba(43,43,238,0.2)]">
                    <div className="flex items-center gap-4 flex-1">
                        <span className="text-white text-sm font-bold w-6 text-center">12</span>
                        <div className="flex items-center gap-3">
                            <div className="bg-center bg-no-repeat bg-cover rounded-full size-10 border border-primary" style={{ backgroundImage: `url("${IMAGES.me}")` }}></div>
                            <div className="flex flex-col">
                                <span className="text-white font-bold text-base">You</span>
                                <span className="text-primary/80 text-xs font-mono">0xYOU...123</span>
                            </div>
                        </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-8 mr-4">
                        <div className="flex flex-col items-end">
                            <span className="text-xs text-text-secondary uppercase font-bold tracking-wider">Level</span>
                            <span className="text-white font-bold">24</span>
                        </div>
                         <div className="flex flex-col items-end min-w-[100px]">
                            <span className="text-xs text-text-secondary uppercase font-bold tracking-wider">Progress</span>
                             <div className="w-full flex items-center gap-2">
                                <div className="h-1.5 w-full rounded-full bg-background-dark overflow-hidden">
                                    <div className="h-full rounded-full bg-primary" style={{ width: '45%' }}></div>
                                </div>
                             </div>
                        </div>
                    </div>
                    <div className="flex flex-col items-end">
                         <span className="text-xs text-text-secondary uppercase font-bold tracking-wider">Total XP</span>
                         <span className="text-white font-bold font-mono text-lg">28,450</span>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SquadLeaderboard;
