import "dotenv/config";
import { getSupabase } from "./db";

async function main() {
  const s = getSupabase();
  if (!s) return;
  const { data: existingUser } = await s.from("users").select("id").eq("address", "0xbasedeveloper").single();
  if (!existingUser) {
    await s.from("users").insert({ address: "0xbasedeveloper", isActive: true, category: "newcomer" });
  }
  // Seed 30-day quests per category
  const newcomer: string[] = [
    "Connect wallet & claim your free base.eth subname",
    "Bridge $1 from Ethereum → Base (official bridge)",
    "Follow @base on Twitter & @jessepollak",
    "Send 0.0001 ETH to a friend on Base",
    "Claim free testnet ETH from Base Sepolia faucet",
    "Turn on Base in your Phantom wallet",
    "Register on app.basequest.xyz & set profile pic",
    "Claim the official Base OG Citizen NFT (free)",
    "Bridge from Arbitrum → Base",
    "Get your first friend to sign up (referral)",
    "Turn on Rainbow or Zerion Base chain",
    "Claim free $DEGEN from the Degen tip bot",
    "Send a Base NFT to a friend",
    "Set Base as default chain in MetaMask",
    "Claim the Base Halfway Citizen NFT",
    "Join the Base Discord",
    "Mint the daily free NFT from BasedArt",
    "Turn on Coinbase Smart Wallet",
    "Get 3 friends to complete today’s newcomer quest",
    "Claim 20-day OG role in Base Discord",
    "Mint the free Base 3-week badge NFT",
    "Bridge from Optimism → Base",
    "Claim free $BASE from a faucet (yes, they exist)",
    "Send your first onchain resume (there’s a site)",
    "Mint the free Base Christmas NFT (seasonal)",
    "Get your mom/dad to make a Base wallet",
    "Claim the “Almost There” badge",
    "Send 28 Base NFTs to 28 different people",
    "Mint the free “29/30” NFT",
    "Claim your Month 1 Legend soulbound NFT",
  ];
  const builder: string[] = [
    "Deploy a free \"Hello World\" contract (1-click thirdweb)",
    "Mint the free Base Day #2 NFT on Zora",
    "Deploy your own ERC-20 memecoin (template provided)",
    "Create a free Base ENS subdomain for someone else",
    "Deploy a simple onchain guestbook (template)",
    "Mint your first NFT on Sound Protocol (free)",
    "Deploy a free Farcaster frame (we give code)",
    "Launch a 1/1 NFT collection on Zora (free mint)",
    "Deploy an onchain tic-tac-toe game",
    "Deploy a contract that pays you 0.001 ETH when someone calls “gm()”",
    "Create a free Base domain with Base Names",
    "Deploy a simple onchain voting poll",
    "Deploy your own airdrop contract (we give template)",
    "Launch a free NFT for your Twitter followers on Base",
    "Deploy a contract with a hidden message for finders",
    "Deploy a simple onchain lottery",
    "Add a “pay me in Base” button to your Twitter bio (we give code)",
    "Deploy an onchain will (who gets your tokens if inactive)",
    "Deploy a contract that mints an NFT when someone sends ETH",
    "Launch a free 10k PFP collection (yes, you can)",
    "Deploy a contract with a built-in referral system",
    "Deploy onchain leaderboard for your friends",
    "Deploy a simple token-gated website on Base",
    "Deploy a contract that pays people to GM you",
    "Launch a memecoin with 0% tax (for the culture)",
    "Deploy an onchain advent calendar",
    "Deploy a contract that burns tokens when someone rages",
    "Deploy your own BaseQuest clone (mini version)",
    "Deploy something that has never been deployed before",
    "Deploy the contract for your own app on Base (yes, today)",
  ];
  const creator: string[] = [
    "Post “GM Base” on Farcaster with #BaseQuest",
    "Post a meme about how cheap Base feels",
    "Make a 3-tweet thread: “Why I moved to Base”",
    "Post a screenshot of your first Base tx with caption",
    "Record a 7-second video saying “I build on Base”",
    "Post your Base portfolio screenshot (blur amounts)",
    "Post “I just finished Week 1 of BaseQuest” + tag 3 friends",
    "Create a “Base vs Solana” meme",
    "Post your Day 9 streak screenshot + @base",
    "Thread: “10 things I did in my first 10 days on Base”",
    "Make a Canva poster “I’m all in on Base”",
    "Post a Farcaster frame that you built yesterday",
    "Record a Spaces or Twitter live saying why Base wins",
    "Post “2-week streak on BaseQuest” + leaderboard screenshot",
    "Create a meme coin logo for a fake coin called $QUEST",
    "Post a tutorial of any quest from the past 15 days",
    "Post your wallet age vs your BaseQuest level",
    "Create a Farcaster cast with >50 likes today",
    "Post “I’ve done every single BaseQuest so far”",
    "Make a TikTok/Reel about BaseQuest (min 5k views goal)",
    "Host a 5-minute Twitter Space titled “Why Base is eating”",
    "Post a love letter to Jesse Pollak on Farcaster",
    "Create a meme that gets reposted by a Base KOL",
    "Thread ranking top 10 Base projects right now",
    "Make a video “Day 26 of building on Base every day”",
    "Record a 7-second video saying “I build on Base” (remix)",
    "Get 100+ likes on any Base-related cast today",
    "Post “I’m top 1,000 on BaseQuest leaderboard”",
    "Create the official $QUEST meme coin pitch thread",
    "Post a 30-tweet thread recapping your 30-day journey",
  ];
  const defi: string[] = [
    "Swap $5 on Uniswap V3 on Base",
    "Add $10 liquidity to any pool on Baseswap",
    "Buy any memecoin that launched <24h ago",
    "Provide liquidity on Aerodrome & screenshot",
    "Zap $20 into a Base vault (Beefy, ExtraFi, etc.)",
    "Play one round of Friend.tech on Base",
    "Farm MOON points on Moonwell",
    "Snipe a newly launched coin on Ave.ai",
    "Deposit into a Base lending market (Compound/Aave)",
    "Buy $BALD or $TOSHI (yes, still)",
    "Provide single-sided liquidity on Sushi on Base",
    "Enter a Base memecoin raffle (e.g., BaseGod, Tycoon)",
    "Long $BRETT or $BASED with 5x leverage",
    "Farm $AERO points on Aerodrome",
    "Bridge $50+ from any L2 → Base today",
    "Ape into the top gainer on Base in last 24h (DexScreener)",
    "Stake $BASE on Balancer or Beethoven",
    "Use a Base perpetuals DEX (Hyperliquid, etc.)",
    "Enter a Base prediction market (Polymarket Base pool)",
    "Farm $Higher (or any new points meta)",
    "100x long any memecoin for 10 minutes (and screenshot)",
    "Supply/Borrow on Seamless or Moonwell",
    "Buy an NFT on Base under $10",
    "Use BaseSwap’s new concentrated liquidity",
    "Stake in a Base restaking protocol (EigenLayer on Base coming)",
    "YOLO $100 into a Base memecoin launch",
    "Farm the newest Base points program",
    "Bridge $420 to Base",
    "Provide liquidity to the $QUEST/WETH pool (when live)",
    "Donate all your degenerate profits to Base Gitcoin round",
  ];

  const categories: { key: "newcomer" | "builder" | "creator" | "defi"; items: string[]; xp: number }[] = [
    { key: "newcomer", items: newcomer, xp: 50 },
    { key: "builder", items: builder, xp: 120 },
    { key: "creator", items: creator, xp: 100 },
    { key: "defi", items: defi, xp: 110 },
  ];

  for (const cat of categories) {
    for (let day = 1; day <= 30; day++) {
      const title = cat.items[day - 1];
      const slug = `${cat.key}-day-${day}`;
      await s.from("quests").upsert({ slug, title, description: title, status: "active", rewardType: "xp", rewardValue: cat.xp, audienceCategory: cat.key, day, displayOrder: day }, { onConflict: "slug" });
    }
  }
}

main();
