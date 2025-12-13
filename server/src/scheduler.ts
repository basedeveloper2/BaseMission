import { performDraw } from "./routes/lottery";

export function startScheduler() {
    console.log("Scheduler started");
    // Run every minute
    setInterval(async () => {
        try {
            const now = new Date();
            // Check if it is Saturday 22:00 SAST (20:00 UTC) or later
            const day = now.getUTCDay(); // 6 = Saturday
            const hour = now.getUTCHours(); // 20 = 22:00 SAST
            
            // We run the check if it's Saturday and past 22:00 SAST.
            // The performDraw function ensures idempotency (only one winner per week).
            if (day === 6 && hour >= 20) {
                 await performDraw();
            }
        } catch (e) {
            console.error("Scheduler error:", e);
        }
    }, 60000); 
}
