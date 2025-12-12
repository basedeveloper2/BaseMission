import "dotenv/config";
import { getSupabase } from "./db";

const rawData = [
  { day: 1, newcomer: "Connect wallet & claim your free base.eth subname", builder: "Deploy a free \"Hello World\" contract (1-click thirdweb)", creator: "Post “GM Base” on Farcaster with #BaseQuest", defi: "Swap $5 on Uniswap V3 on Base" },
  { day: 2, newcomer: "Bridge $1 from Ethereum → Base (official bridge)", builder: "Mint the free Base Day #2 NFT on Zora", creator: "Post a meme about how cheap Base feels", defi: "Add $10 liquidity to any pool on Baseswap" },
  { day: 3, newcomer: "Follow @base on Twitter & @jessepollak", builder: "Deploy your own ERC-20 memecoin (template provided)", creator: "Make a 3-tweet thread: “Why I moved to Base”", defi: "Buy any memecoin that launched <24h ago" },
  { day: 4, newcomer: "Send 0.0001 ETH to a friend on Base", builder: "Create a free Base ENS subdomain for someone else", creator: "Post a screenshot of your first Base tx with caption", defi: "Provide liquidity on Aerodrome & screenshot" },
  { day: 5, newcomer: "Claim free testnet ETH from Base Sepolia faucet", builder: "Deploy a simple onchain guestbook (template)", creator: "Record a 7-second video saying “I build on Base”", defi: "Zap $20 into a Base vault (Beefy, ExtraFi, etc.)" },
  { day: 6, newcomer: "Turn on Base in your Phantom wallet", builder: "Mint your first NFT on Sound Protocol (free)", creator: "Post your Base portfolio screenshot (blur amounts)", defi: "Play one round of Friend.tech on Base" },
  { day: 7, newcomer: "Register on app.basequest.xyz & set profile pic", builder: "Deploy a free Farcaster frame (we give code)", creator: "Post “I just finished Week 1 of BaseQuest” + tag 3 friends", defi: "Farm MOON points on Moonwell" },
  { day: 8, newcomer: "Claim the official Base OG Citizen NFT (free)", builder: "Launch a 1/1 NFT collection on Zora (free mint)", creator: "Create a “Base vs Solana” meme", defi: "Snipe a newly launched coin on Ave.ai" },
  { day: 9, newcomer: "Bridge from Arbitrum → Base", builder: "Deploy an onchain tic-tac-toe game", creator: "Post your Day 9 streak screenshot + @base", defi: "Deposit into a Base lending market (Compound/Aave)" },
  { day: 10, newcomer: "Get your first friend to sign up (referral)", builder: "Deploy a contract that pays you 0.001 ETH when someone calls “gm()”", creator: "Thread: “10 things I did in my first 10 days on Base”", defi: "Buy $BALD or $TOSHI (yes, still)" },
  { day: 11, newcomer: "Turn on Rainbow or Zerion Base chain", builder: "Create a free Base domain with Base Names", creator: "Make a Canva poster “I’m all in on Base”", defi: "Provide single-sided liquidity on Sushi on Base" },
  { day: 12, newcomer: "Claim free $DEGEN from the Degen tip bot", builder: "Deploy a simple onchain voting poll", creator: "Post a Farcaster frame that you built yesterday", defi: "Enter a Base memecoin raffle (e.g., BaseGod, Tycoon)" },
  { day: 13, newcomer: "Send a Base NFT to a friend", builder: "Deploy your own airdrop contract (we give template)", creator: "Record a Spaces or Twitter live saying why Base wins", defi: "Long $BRETT or $BASED with 5x leverage" },
  { day: 14, newcomer: "Set Base as default chain in MetaMask", builder: "Launch a free NFT for your Twitter followers on Base", creator: "Post “2-week streak on BaseQuest” + leaderboard screenshot", defi: "Farm $AERO points on Aerodrome" },
  { day: 15, newcomer: "Claim the Base Halfway Citizen NFT", builder: "Deploy a contract with a hidden message for finders", creator: "Create a meme coin logo for a fake coin called $QUEST", defi: "Bridge $50+ from any L2 → Base today" },
  { day: 16, newcomer: "Join the Base Discord", builder: "Deploy a simple onchain lottery", creator: "Post a tutorial of any quest from the past 15 days", defi: "Ape into the top gainer on Base in last 24h (DexScreener)" },
  { day: 17, newcomer: "Mint the daily free NFT from BasedArt", builder: "Add a “pay me in Base” button to your Twitter bio (we give code)", creator: "Post your wallet age vs your BaseQuest level", defi: "Stake $BASE on Balancer or Beethoven" },
  { day: 18, newcomer: "Turn on Coinbase Smart Wallet", builder: "Deploy an onchain will (who gets your tokens if inactive)", creator: "Create a Farcaster cast with >50 likes today", defi: "Use a Base perpetuals DEX (Hyperliquid, etc.)" },
  { day: 19, newcomer: "Get 3 friends to complete today’s newcomer quest", builder: "Deploy a contract that mints an NFT when someone sends ETH", creator: "Post “I’ve done every single BaseQuest so far”", defi: "Enter a Base prediction market (Polymarket Base pool)" },
  { day: 20, newcomer: "Claim 20-day OG role in Base Discord", builder: "Launch a free 10k PFP collection (yes, you can)", creator: "Make a TikTok/Reel about BaseQuest (min 5k views goal)", defi: "Farm $Higher (or any new points meta)" },
  { day: 21, newcomer: "Mint the free Base 3-week badge NFT", builder: "Deploy a contract with a built-in referral system", creator: "Host a 5-minute Twitter Space titled “Why Base is eating”", defi: "100x long any memecoin for 10 minutes (and screenshot)" },
  { day: 22, newcomer: "Bridge from Optimism → Base", builder: "Deploy onchain leaderboard for your friends", creator: "Post a love letter to Jesse Pollak on Farcaster", defi: "Supply/Borrow on Seamless or Moonwell" },
  { day: 23, newcomer: "Claim free $BASE from a faucet (yes, they exist)", builder: "Deploy a simple token-gated website on Base", creator: "Create a meme that gets reposted by a Base KOL", defi: "Buy an NFT on Base under $10" },
  { day: 24, newcomer: "Send your first onchain resume (there’s a site)", builder: "Deploy a contract that pays people to GM you", creator: "Thread ranking top 10 Base projects right now", defi: "Use BaseSwap’s new concentrated liquidity" },
  { day: 25, newcomer: "Mint the free Base Christmas NFT (seasonal)", builder: "Launch a memecoin with 0% tax (for the culture)", creator: "Post your full BaseQuest streak + wallet screenshot", defi: "Stake in a Base restaking protocol (EigenLayer on Base coming)" },
  { day: 26, newcomer: "Get your mom/dad to make a Base wallet", builder: "Deploy an onchain advent calendar", creator: "Make a video “Day 26 of building on Base every day”", defi: "YOLO $100 into a Base memecoin launch" },
  { day: 27, newcomer: "Claim the “Almost There” badge", builder: "Deploy a contract that burns tokens when someone rages", creator: "Get 100+ likes on any Base-related cast today", defi: "Farm the newest Base points program" },
  { day: 28, newcomer: "Send 28 Base NFTs to 28 different people", builder: "Deploy your own BaseQuest clone (mini version)", creator: "Post “I’m top 1,000 on BaseQuest leaderboard”", defi: "Bridge $420 to Base" },
  { day: 29, newcomer: "Mint the free “29/30” NFT", builder: "Deploy something that has never been deployed before", creator: "Create the official $QUEST meme coin pitch thread", defi: "Provide liquidity to the $QUEST/WETH pool (when live)" },
  { day: 30, newcomer: "Claim your Month 1 Legend soulbound NFT", builder: "Deploy the contract for your own app on Base (yes, today)", creator: "Post a 30-tweet thread recapping your 30-day journey", defi: "Donate all your degenerate profits to Base Gitcoin round" }
];

const categories = [
  { key: "newcomer", xp: 50 },
  { key: "builder", xp: 120 },
  { key: "creator", xp: 100 },
  { key: "defi", xp: 110 }
];

async function seedQuests() {
  const s = getSupabase();
  if (!s) {
    console.error("Supabase not connected");
    return;
  }

  console.log("Starting quest seed...");
  
  for (const row of rawData) {
    for (const cat of categories) {
      const slug = `${cat.key}-day-${row.day}`;
      const title = (row as any)[cat.key];
      const payload = {
        slug,
        title,
        description: title,
        category: "daily",
        audiencecategory: cat.key, // Lowercase to match Postgres column
        status: "active",
        rewardtype: "xp", // Lowercase
        rewardvalue: cat.xp, // Lowercase
        displayorder: row.day, // Lowercase
        day: row.day,
        createdat: new Date().toISOString() // Lowercase just in case
      };

      const { error } = await s.from("quests").upsert(payload, { onConflict: "slug" });
      if (error) {
        console.error(`Failed to upsert ${slug}:`, error.message);
      } else {
        // console.log(`Upserted ${slug}`);
      }
    }
  }
  console.log("Quest seed completed.");
}

seedQuests();
