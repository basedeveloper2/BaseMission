import React, { useEffect, useState } from "react";
import { getUser, upsertWallet } from "../services/api";
import { getConnectedWallet } from "../services/wallet";
import { IMAGES } from "../constants";

const Profile = () => {
  const [user, setUser] = useState<{ handle?: string; address?: string; xp?: number; level?: number; avatarUrl?: string; badges?: any[]; inventory?: any[]; totalXp?: number; questsCompleted?: number; rank?: number; streakDays?: number; createdAt?: string; category?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [editCategory, setEditCategory] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const { address } = getConnectedWallet();
    if (!address) {
      setError("Wallet not connected");
      setLoading(false);
      return;
    }

    getUser(address)
      .then((u) => {
        if (!u) {
           // Fallback if user doesn't exist in DB yet but wallet is connected
           // This might happen if indexing hasn't caught up or user is new
           setUser({ address, xp: 0, level: 0, streakDays: 0, createdAt: new Date().toISOString() }); 
        } else {
           setUser(u as any);
           setEditCategory(u.category || "newcomer");
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!user?.address) return;
    setSaving(true);
    try {
        await upsertWallet({ address: user.address, category: editCategory });
        setUser(prev => prev ? ({ ...prev, category: editCategory }) : null);
        setEditing(false);
    } catch (e: any) {
        setError(e.message || "Failed to update profile");
    } finally {
        setSaving(false);
    }
  };

  const joinedDate = user?.createdAt 
    ? `Joined ${new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}` 
    : "Joined recently";

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
      {/* Profile Header & XP Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        {/* Left: Profile Info */}
        <div className="lg:col-span-8 flex flex-col gap-8 glass-card rounded-[2rem] p-8 relative overflow-hidden">
          {/* Background Decor */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] rounded-full pointer-events-none"></div>

          <div className="flex flex-col sm:flex-row gap-8 items-start sm:items-center relative z-10">
            <div className="relative group">
                <div className="size-32 rounded-full border-4 border-surface-highlight bg-cover bg-center shrink-0 shadow-2xl" style={{ backgroundImage: `url("${IMAGES.userProfile}")` }}></div>
                <div className="absolute -bottom-2 -right-2 bg-black/80 backdrop-blur text-white text-xs font-bold px-3 py-1 rounded-full border border-white/10 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-yellow-500">star</span>
                    Lvl {user?.level || 0}
                </div>
            </div>
            
            <div className="flex flex-col flex-1 gap-2">
              <div className="flex items-center gap-4 flex-wrap">
                <h1 className="text-4xl font-black tracking-tight text-white font-display">
                  {user?.handle || (user?.address ? `${user.address.slice(0, 6)}...${user.address.slice(-4)}` : (loading ? "Loading..." : "Unknown"))}
                </h1>
                <span className="inline-flex items-center rounded-lg bg-primary/20 border border-primary/20 px-3 py-1 text-xs font-bold text-primary uppercase tracking-wider">
                  Explorer
                </span>
              </div>
              <p className="text-text-secondary font-medium flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                {joinedDate} 
                <span className="w-1 h-1 bg-white/20 rounded-full mx-1"></span>
                <span className="capitalize text-white">{user?.category || "Early Adopter"}</span>
              </p>
              
              {editing && (
                <div className="mt-6 p-6 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 animate-fade-in">
                    <label className="block text-sm font-bold text-white mb-3 uppercase tracking-wider">Update Category</label>
                    <div className="flex flex-wrap gap-3 mb-6">
                      {["newcomer", "builder", "creator", "defi"].map(cat => (
                        <button
                          key={cat}
                          onClick={() => setEditCategory(cat)}
                          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 border ${editCategory === cat ? 'bg-primary border-primary text-white shadow-lg shadow-primary/25' : 'bg-surface-highlight border-white/5 text-text-secondary hover:bg-white/5 hover:text-white'}`}
                        >
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-3">
                      <button onClick={handleSave} disabled={saving} className="px-5 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-green-500/20 disabled:opacity-50 transition-colors">
                        {saving ? "Saving..." : "Save Changes"}
                      </button>
                      <button onClick={() => setEditing(false)} disabled={saving} className="px-5 py-2.5 bg-surface-highlight hover:bg-white/10 text-white rounded-xl text-sm font-bold border border-white/5 transition-colors">
                        Cancel
                      </button>
                    </div>
                </div>
              )}
            </div>
            {!editing && (
              <button 
                onClick={() => {
                    setEditing(true);
                    setEditCategory(user?.category || "newcomer");
                }}
                className="sm:self-start rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-bold hover:bg-white/10 transition-all text-white backdrop-blur-sm"
              >
                Edit Profile
              </button>
            )}
          </div>
          
          {/* XP Bar */}
          <div className="mt-4 flex flex-col gap-3 relative z-10">
            <div className="flex justify-between items-end">
              <div>
                <span className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-1 block">XP Progress</span>
                <div className="text-3xl font-black text-white font-display">{(user?.xp ?? 0).toLocaleString()} <span className="text-lg font-medium text-text-secondary">/ {((Math.floor((user?.xp || 0) / 1000) + 1) * 1000).toLocaleString()} XP</span></div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">Next Lvl: {((user?.level || 0) + 1)}</span>
              </div>
            </div>
            <div className="relative h-6 w-full overflow-hidden rounded-full bg-black/50 border border-white/5 shadow-inner">
              <div className="h-full bg-gradient-to-r from-primary-glow to-primary relative overflow-hidden" style={{ width: `${Math.min(100, ((user?.xp || 0) % 1000) / 10)}%` }}>
                <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.1)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.1)_50%,rgba(255,255,255,0.1)_75%,transparent_75%,transparent)] bg-[length:20px_20px] animate-[move-bg_1s_linear_infinite]"></div>
                <div className="absolute inset-0 bg-white/20 w-full h-full animate-pulse-glow"></div>
              </div>
            </div>
          </div>
          
          {/* Motivational Banner */}
          <div className="mt-4 p-5 rounded-2xl bg-gradient-to-r from-primary/10 to-transparent border border-primary/10 flex items-center gap-4 relative overflow-hidden">
            <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
                <span className="material-symbols-outlined">rocket_launch</span>
            </div>
            <p className="text-base font-bold text-white relative z-10">You’re now ahead of 94.7% of builders. Keep pushing!</p>
          </div>
        </div>
        
        {/* Right: Highlight Stats */}
        <div className="lg:col-span-4 grid grid-cols-2 lg:grid-cols-1 gap-6 h-full">
          <div className="glass-card rounded-[2rem] p-8 flex flex-col justify-center relative overflow-hidden group hover:border-orange-500/30 transition-colors">
            <div className="absolute -right-4 -top-4 size-32 bg-orange-500/10 rounded-full blur-2xl group-hover:bg-orange-500/20 transition-colors"></div>
            <div className="flex items-center gap-3 mb-4 relative z-10">
              <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-500 ring-1 ring-orange-500/20">
                <span className="material-symbols-outlined">local_fire_department</span>
              </div>
              <span className="text-sm font-bold text-text-secondary uppercase tracking-wider">Current Streak</span>
            </div>
            <p className="text-4xl font-black text-white mb-2 font-display relative z-10">{user?.questsCompleted ?? 0} <span className="text-lg font-medium text-text-secondary">Quests</span></p>
            <p className="text-xs font-bold text-green-400 flex items-center gap-1 relative z-10">
                <span className="material-symbols-outlined text-[14px]">trending_up</span>
                Top 5% of users
            </p>
          </div>
          
          <div className="glass-card rounded-[2rem] p-8 flex flex-col justify-center relative overflow-hidden group hover:border-purple-500/30 transition-colors">
            <div className="absolute -right-4 -top-4 size-32 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-colors"></div>
            <div className="flex items-center gap-3 mb-4 relative z-10">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500 ring-1 ring-purple-500/20">
                <span className="material-symbols-outlined">trophy</span>
              </div>
              <span className="text-sm font-bold text-text-secondary uppercase tracking-wider">Global Rank</span>
            </div>
            <p className="text-4xl font-black text-white mb-2 font-display relative z-10">#{user?.rank ?? 0}</p>
            <p className="text-xs font-bold text-text-secondary relative z-10">Global Leaderboard</p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Column: Activity & Badges */}
        <div className="xl:col-span-2 flex flex-col gap-8">
          {/* Badges Section */}
          <section className="glass-card rounded-[2rem] p-8">
             <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold flex items-center gap-3 text-white font-display">
                <span className="flex items-center justify-center size-10 rounded-xl bg-yellow-500/10 text-yellow-500 ring-1 ring-yellow-500/20">
                    <span className="material-symbols-outlined">military_tech</span>
                </span>
                Earned Badges
              </h3>
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-xs font-bold text-text-secondary">{user?.badges?.length || 0} Unlocked</span>
            </div>
            
            {(!user?.badges || user.badges.length === 0) ? (
                <div className="text-center py-16 text-text-secondary bg-black/20 rounded-2xl border border-white/5 border-dashed">
                    <span className="material-symbols-outlined text-5xl mb-4 opacity-30">lock</span>
                    <p className="font-medium">No badges earned yet. Complete quests to unlock!</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {user.badges.map((badge: any) => (
                        <div key={badge.id} className={`flex flex-col items-center p-6 rounded-2xl bg-black/20 border border-white/5 hover:border-primary/30 hover:bg-white/5 transition-all group relative cursor-pointer`}>
                            <div className={`size-16 rounded-2xl flex items-center justify-center mb-4 ${badge.color} shadow-lg transition-transform group-hover:scale-110 duration-300`}>
                                <span className="material-symbols-outlined text-3xl">{badge.icon}</span>
                            </div>
                            <h4 className="font-bold text-sm text-white text-center mb-1">{badge.name}</h4>
                            <p className="text-[10px] text-text-secondary text-center leading-tight line-clamp-2">{badge.description}</p>
                            
                            {/* Tooltip */}
                            <div className="absolute inset-0 bg-black/90 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 p-4 text-center z-10 border border-white/10">
                                <span className="material-symbols-outlined text-green-500 mb-2">check_circle</span>
                                <p className="text-[10px] text-text-secondary font-bold uppercase tracking-wider mb-1">Awarded On</p>
                                <p className="text-sm font-bold text-white">{new Date(badge.awardedAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
          </section>

          {/* Activity Log */}
          <section className="glass-card rounded-[2rem] p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold flex items-center gap-3 text-white font-display">
                <span className="flex items-center justify-center size-10 rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
                    <span className="material-symbols-outlined">calendar_month</span>
                </span>
                Activity Log
              </h3>
              <div className="flex items-center gap-2 text-xs font-medium text-text-secondary bg-black/20 px-3 py-1.5 rounded-lg">
                <span>Less</span>
                <div className="w-3 h-3 rounded bg-white/5"></div>
                <div className="w-3 h-3 rounded bg-primary/40"></div>
                <div className="w-3 h-3 rounded bg-primary/70"></div>
                <div className="w-3 h-3 rounded bg-primary"></div>
                <span>More</span>
              </div>
            </div>
            {/* Heatmap Grid */}
            <div className="w-full overflow-x-auto pb-4 no-scrollbar">
              <div className="flex gap-1.5 min-w-max">
                <div className="flex flex-col gap-1.5 text-[10px] font-bold text-text-secondary mr-3 justify-between py-1">
                  <span>Mon</span>
                  <span>Wed</span>
                  <span>Fri</span>
                </div>
                <div className="flex gap-1.5">
                  {Array.from({ length: 24 }).map((_, weekIndex) => (
                    <div key={weekIndex} className="flex flex-col gap-1.5">
                      {Array.from({ length: 7 }).map((_, dayIndex) => {
                         const opacity = Math.random() > 0.7 ? (Math.random() > 0.5 ? 'bg-primary shadow-[0_0_8px_rgba(79,70,229,0.6)]' : 'bg-primary/50') : (Math.random() > 0.5 ? 'bg-primary/20' : 'bg-white/5');
                         return (
                            <div key={dayIndex} className={`size-3.5 rounded-[2px] ${opacity} hover:ring-1 ring-white transition-all cursor-pointer`} title="Activity"></div>
                         )
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Soulbound NFTs */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold flex items-center gap-2 text-white">
              <span className="material-symbols-outlined text-purple-400">diamond</span>
              Soulbound
            </h3>
          </div>
          <div className="space-y-4">
            {(user?.inventory ?? []).map((nft: any) => (
                <div key={nft.id} className="group relative overflow-hidden rounded-xl border border-gray-200 dark:border-border-dark bg-white dark:bg-card-dark hover:border-primary/50 transition-colors">
                    <div className="aspect-[4/3] bg-cover bg-center group-hover:scale-105 transition-transform duration-500" style={{ backgroundImage: `url("${nft.imageUrl}")` }}></div>
                    <div className="p-4 relative bg-white dark:bg-card-dark">
                        <div className="flex justify-between items-start mb-1">
                            <h4 className="font-bold text-lg text-white">{nft.name}</h4>
                            <span className={`text-[10px] uppercase font-bold tracking-wider ${nft.rarity === 'Rare' ? 'bg-purple-500/10 text-purple-500' : 'bg-pink-500/10 text-pink-500'} px-2 py-1 rounded`}>{nft.rarity}</span>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{nft.description}</p>
                        <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                            <span className="material-symbols-outlined text-[16px]">schedule</span>
                            Acquired {nft.dateAcquired}
                        </div>
                    </div>
                </div>
            ))}
            <button className="w-full py-3 rounded-xl border border-dashed border-gray-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-primary transition-all flex items-center justify-center gap-2">
              <span className="material-symbols-outlined">add_circle</span>
              View Full Collection
            </button>
          </div>
          
          {/* Mini Stats / Referrals */}
          <div className="bg-gradient-to-br from-primary to-blue-700 rounded-2xl p-6 text-white relative overflow-hidden mt-4">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <h4 className="font-bold text-xl mb-2">Invite Builders</h4>
              <p className="text-blue-100 text-sm mb-4">Earn 500 XP for every friend who completes the first quest.</p>
              <div className="flex gap-2">
                <input className="flex-1 bg-white/20 border-none rounded-lg px-3 py-2 text-sm text-white placeholder-blue-200 focus:ring-2 focus:ring-white/50" readOnly type="text" value="base.org/ref/0xBuilder"/>
                <button className="bg-white text-primary p-2 rounded-lg hover:bg-blue-50 transition-colors">
                  <span className="material-symbols-outlined">content_copy</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
