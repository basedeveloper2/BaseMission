
export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string; // Tailwind color class for background/text
}

export const BADGES: BadgeDefinition[] = [
  { 
    id: "first-step", 
    name: "First Step", 
    description: "Complete your first quest", 
    icon: "footprint",
    color: "text-blue-500 bg-blue-500/10 border-blue-500/20"
  },
  { 
    id: "high-five", 
    name: "High Five", 
    description: "Complete 5 quests", 
    icon: "handshake",
    color: "text-green-500 bg-green-500/10 border-green-500/20"
  },
  { 
    id: "perfect-10", 
    name: "Perfect 10", 
    description: "Complete 10 quests", 
    icon: "star",
    color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20"
  },
  { 
    id: "quest-master", 
    name: "Quest Master", 
    description: "Complete 25 quests", 
    icon: "trophy",
    color: "text-purple-500 bg-purple-500/10 border-purple-500/20"
  },
  { 
    id: "early-bird", 
    name: "Early Bird", 
    description: "Complete a quest between 4 AM and 8 AM", 
    icon: "wb_twilight",
    color: "text-orange-400 bg-orange-400/10 border-orange-400/20"
  },
  { 
    id: "night-owl", 
    name: "Night Owl", 
    description: "Complete a quest between 10 PM and 4 AM", 
    icon: "bedtime",
    color: "text-indigo-400 bg-indigo-400/10 border-indigo-400/20"
  },
  { 
    id: "weekend-warrior", 
    name: "Weekend Warrior", 
    description: "Complete a quest on Saturday or Sunday", 
    icon: "weekend",
    color: "text-pink-500 bg-pink-500/10 border-pink-500/20"
  },
  {
    id: "speed-demon",
    name: "Speed Demon",
    description: "Complete 3 quests in one day",
    icon: "speed",
    color: "text-red-500 bg-red-500/10 border-red-500/20"
  }
];

export function checkBadges(
  currentBadges: string[], 
  stats: { questsCompleted: number; questsToday: number }, 
  context: { hour: number; day: number }
): string[] {
  const newBadges: string[] = [];

  const award = (id: string) => {
    if (!currentBadges.includes(id) && !newBadges.includes(id)) {
      newBadges.push(id);
    }
  };

  if (stats.questsCompleted >= 1) award("first-step");
  if (stats.questsCompleted >= 5) award("high-five");
  if (stats.questsCompleted >= 10) award("perfect-10");
  if (stats.questsCompleted >= 25) award("quest-master");

  if (context.hour >= 4 && context.hour < 8) award("early-bird");
  if (context.hour >= 22 || context.hour < 4) award("night-owl");
  
  // 0 = Sunday, 6 = Saturday
  if (context.day === 0 || context.day === 6) award("weekend-warrior");

  if (stats.questsToday >= 3) award("speed-demon");

  return newBadges;
}
