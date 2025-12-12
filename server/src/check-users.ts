import "dotenv/config";
import { getSupabase } from "./db";

async function checkDuplicates() {
  const s = getSupabase();
  if (!s) return;

  // Check if address has unique constraint by trying to fetch duplicates
  const { data: users, error } = await s.from("users").select("address, id");
  
  if (error) {
    console.error("Error fetching users:", error);
    return;
  }

  const map = new Map<string, string[]>();
  const duplicates: string[] = [];

  users?.forEach(u => {
    const addr = u.address.toLowerCase();
    if (map.has(addr)) {
      map.get(addr)?.push(u.id);
      duplicates.push(addr);
    } else {
      map.set(addr, [u.id]);
    }
  });

  if (duplicates.length > 0) {
    console.log(`Found ${duplicates.length} duplicate addresses.`);
    console.log("Duplicates:", [...new Set(duplicates)]);
    
    // Cleanup: Keep the one with most progress or oldest? Usually oldest or newest.
    // Let's just list them for now.
  } else {
    console.log("No duplicate users found by address.");
  }

  // Check constraint existence (indirectly via SQL query if possible, or just assume from schema)
  // We can try to add the constraint and see if it fails (already exists) or succeeds.
  // But standard Supabase client doesn't run raw SQL easily without RPC.
  // We'll rely on the "No duplicates found" + adding constraint via SQL tool if needed.
}

checkDuplicates();
