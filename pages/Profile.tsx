import React, { useEffect, useState } from "react";
import { getUser, upsertWallet } from "../services/api";
import { getConnectedWallet } from "../services/wallet";
import { IMAGES } from "../constants";

const Profile = () => {
  const [user, setUser] = useState<{ handle?: string; address?: string; xp?: number; level?: number; avatarUrl?: string; badges?: any[]; inventory?: any[]; totalXp?: number; questsCompleted?: number; streakDays?: number; createdAt?: string; category?: string } | null>(null);
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
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header & XP Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* Left: Profile Info */}
        <div className="lg:col-span-8 flex flex-col gap-6 bg-white dark:bg-card-dark rounded-2xl p-6 border border-gray-200 dark:border-border-dark shadow-sm">
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
            <div className="size-24 rounded-full border-4 border-primary/20 bg-cover bg-center shrink-0" style={{ backgroundImage: `url("${IMAGES.userProfile}")` }}></div>
            <div className="flex flex-col flex-1 gap-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {user?.handle || (user?.address ? `${user.address.slice(0, 6)}...${user.address.slice(-4)}` : (loading ? "Loading..." : "Unknown"))}
                </h1>
                <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  Level {user?.level || 0} Explorer
                </span>
              </div>
              <p className="text-slate-500 dark:text-slate-400">{joinedDate} • <span className="capitalize">{user?.category || "Early Adopter"}</span></p>
              
              {editing && (
                <div className="mt-4 p-4 bg-slate-800 rounded-lg border border-slate-700">
                    <label className="block text-sm font-medium text-slate-300 mb-2">Update Category</label>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {["newcomer", "builder", "creator", "defi"].map(cat => (
                        <button
                          key={cat}
                          onClick={() => setEditCategory(cat)}
                          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${editCategory === cat ? 'bg-primary text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                        >
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={handleSave} disabled={saving} className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium disabled:opacity-50">
                        {saving ? "Saving..." : "Save Changes"}
                      </button>
                      <button onClick={() => setEditing(false)} disabled={saving} className="px-3 py-1.5 bg-slate-600 hover:bg-slate-500 text-white rounded-md text-sm font-medium">
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
                className="sm:self-start rounded-lg border border-gray-200 dark:border-border-dark px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-white"
              >
                Edit Profile
              </button>
            )}
          </div>
          {/* XP Bar */}
          <div className="mt-2 flex flex-col gap-2">
            <div className="flex justify-between items-end">
              <div>
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">XP Progress</span>
                <div className="text-2xl font-bold text-primary">{(user?.xp ?? 0).toLocaleString()} <span className="text-base font-normal text-slate-400 dark:text-slate-500">/ {((Math.floor((user?.xp || 0) / 1000) + 1) * 1000).toLocaleString()} XP</span></div>
              </div>
              <div className="text-right">
                <span className="text-sm text-slate-500 dark:text-slate-400">Next: Level {((user?.level || 0) + 1)}</span>
              </div>
            </div>
            <div className="relative h-4 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-[#3b3b54]">
              <div className="h-full bg-gradient-to-r from-blue-600 to-primary transition-all duration-500 ease-out" style={{ width: `${Math.min(100, ((user?.xp || 0) % 1000) / 10)}%` }}>
                <div className="absolute inset-0 bg-white/20 w-full h-full animate-pulse"></div>
              </div>
            </div>
          </div>
          {/* Motivational Banner */}
          <div className="mt-2 p-4 rounded-xl bg-gradient-to-r from-primary/20 to-transparent border border-primary/10 flex items-center gap-3">
            <span className="material-symbols-outlined text-primary">rocket_launch</span>
            <p className="text-base font-semibold text-primary">You’re now ahead of 94.7% of builders. Keep pushing!</p>
          </div>
        </div>
        
        {/* Right: Highlight Stats */}
        <div className="lg:col-span-4 grid grid-cols-2 lg:grid-cols-1 gap-4">
          <div className="bg-white dark:bg-card-dark rounded-2xl p-6 border border-gray-200 dark:border-border-dark shadow-sm flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500">
                <span className="material-symbols-outlined">local_fire_department</span>
              </div>
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Current Streak</span>
            </div>
            <p className="text-3xl font-bold text-white">{user?.streakDays ?? 0} Days</p>
            <p className="text-xs text-green-500 mt-1 font-medium">Top 5% of users</p>
          </div>
          <div className="bg-white dark:bg-card-dark rounded-2xl p-6 border border-gray-200 dark:border-border-dark shadow-sm flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
                <span className="material-symbols-outlined">trophy</span>
              </div>
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Rank</span>
            </div>
            <p className="text-3xl font-bold text-white">#0</p>
            <p className="text-xs text-slate-500 mt-1">Global Leaderboard</p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Column: Activity & Badges */}
        <div className="xl:col-span-2 flex flex-col gap-8">
          {/* Activity Log */}
          <section className="bg-white dark:bg-card-dark rounded-2xl p-6 border border-gray-200 dark:border-border-dark shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2 text-white">
                <span className="material-symbols-outlined text-primary">calendar_month</span>
                Activity Log
              </h3>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span>Less</span>
                <div className="w-3 h-3 rounded bg-slate-100 dark:bg-[#2A2A3C]"></div>
                <div className="w-3 h-3 rounded bg-primary/40"></div>
                <div className="w-3 h-3 rounded bg-primary/70"></div>
                <div className="w-3 h-3 rounded bg-primary"></div>
                <span>More</span>
              </div>
            </div>
            {/* Heatmap Grid */}
            <div className="w-full overflow-x-auto pb-2 no-scrollbar">
              <div className="flex gap-1 min-w-max">
                <div className="flex flex-col gap-1 text-[10px] text-slate-400 mr-2 justify-between py-1">
                  <span>Mon</span>
                  <span>Wed</span>
                  <span>Fri</span>
                </div>
                <div className="flex gap-1">
                  {Array.from({ length: 24 }).map((_, weekIndex) => (
                    <div key={weekIndex} className="flex flex-col gap-1">
                      {Array.from({ length: 7 }).map((_, dayIndex) => {
                         const opacity = Math.random() > 0.7 ? (Math.random() > 0.5 ? 'bg-primary' : 'bg-primary/50') : (Math.random() > 0.5 ? 'bg-primary/20' : 'bg-slate-100 dark:bg-[#2A2A3C]');
                         return (
                            <div key={dayIndex} className={`w-3.5 h-3.5 rounded-sm ${opacity} hover:ring-2 ring-white transition-all cursor-pointer`} title="Activity"></div>
                         )
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-border-dark flex gap-6 text-sm text-slate-500 dark:text-slate-400">
              <p><strong className="text-slate-900 dark:text-white">{user?.questsCompleted ?? 0}</strong> Quests Completed</p>
              <p><strong className="text-slate-900 dark:text-white">{(user?.totalXp ?? user?.xp ?? 0).toLocaleString()}</strong> Total XP Earned</p>
            </div>
          </section>

          {/* Badges Wall */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2 text-white">
                <span className="material-symbols-outlined text-yellow-500">verified</span>
                Badges Wall
              </h3>
              <a className="text-sm text-primary hover:text-primary/80 font-medium" href="#">View All</a>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {(user?.badges ?? []).map((badge: any) => (
                <div key={badge.id} className="group relative bg-white dark:bg-card-dark p-4 rounded-xl border border-gray-200 dark:border-border-dark hover:border-primary/50 transition-all cursor-pointer flex flex-col items-center gap-3 text-center">
                  <div className={`size-16 rounded-full bg-gradient-to-br ${badge.colorClass} flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform`}>
                    <span className={`material-symbols-outlined ${badge.iconColorClass} text-3xl`}>{badge.icon}</span>
                  </div>
                  <div>
                    <p className="font-bold text-sm leading-tight text-white">{badge.name}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">{badge.dateAcquired}</p>
                  </div>
                </div>
              ))}
              {/* Locked Examples */}
              <div className="group relative bg-gray-50 dark:bg-[#1f1f33] p-4 rounded-xl border border-gray-200 dark:border-border-dark flex flex-col items-center gap-3 text-center opacity-70">
                <div className="size-16 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center grayscale group-hover:grayscale-0 transition-all">
                  <span className="material-symbols-outlined text-slate-400 text-3xl">rocket_launch</span>
                </div>
                <div>
                  <p className="font-bold text-sm text-slate-500 leading-tight">Base God</p>
                  <p className="text-[10px] text-slate-400 mt-1">Locked</p>
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
