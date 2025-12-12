export interface User {
  id: string;
  handle: string;
  avatarUrl: string;
  address: string;
  level: number;
  xp: number;
  totalXp: number;
  rank: number;
  questsCompleted: number;
  badges: Badge[];
  inventory: NFT[];
  streakDays: number;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  dateAcquired?: string;
  locked?: boolean;
  colorClass: string;
  iconColorClass?: string;
}

export interface NFT {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  rarity: "Common" | "Rare" | "Epic" | "Legendary";
  dateAcquired: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  progress: number;
  status: "active" | "completed" | "locked" | "new";
  image?: string;
  category?: string;
  tags?: string[];
  isFeatured?: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  handle?: string;
  avatarUrl: string;
  xp: number;
  quests: number;
  badgesCount?: number;
  tier?: string;
  isMe?: boolean;
  trend?: "up" | "down" | "same";
}

export interface SquadMember {
  rank: number;
  name: string;
  handle: string;
  avatarUrl: string;
  level: number;
  questsCompleted: number;
  totalQuests: number;
  totalXp: number;
}
