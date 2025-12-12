import "dotenv/config";
import { getSupabase } from "./db";

async function checkData() {
  const s = getSupabase();
  if (!s) {
    console.log("Supabase not connected");
    return;
  }

  // Check Quests
  const { data: quests, error: qError } = await s.from("quests").select("*");
  if (qError) {
    console.error("Error fetching quests:", qError);
  } else {
    console.log(`Found ${quests?.length} quests.`);
    if (quests && quests.length > 0) {
      console.log("Sample quest:", quests[0]);
      // Log all quests with their title and audienceCategory
      console.log("All Quests Categories:");
      quests.forEach(q => console.log(`- ${q.title}: ${q.audiencecategory} (Day ${q.day})`));
      
      console.log("Categories present:", [...new Set(quests.map(q => q.audiencecategory))]);
      console.log("Days present:", [...new Set(quests.map(q => q.day))]);
      console.log("Statuses present:", [...new Set(quests.map(q => q.status))]);
    }
  }

  // Check Users
  const { data: users, error: uError } = await s.from("users").select("*");
  if (uError) {
    console.error("Error fetching users:", uError);
  } else {
    console.log(`Found ${users?.length} users.`);
    if (users && users.length > 0) {
      console.log("All Users:");
      users.forEach(u => console.log(`- ${u.address}: ${u.category}`));
    }
  }
}

checkData();
