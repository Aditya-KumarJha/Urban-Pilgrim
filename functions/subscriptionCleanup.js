const { onSchedule } = require("firebase-functions/v2/scheduler");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
    initializeApp();
}

const db = getFirestore();

/**
 * Scheduled function to clean up expired subscriptions
 * Runs daily at 2 AM UTC
 */
exports.cleanupExpiredSubscriptions = onSchedule({
    schedule: "0 2 * * *", // Daily at 2 AM UTC
    timeZone: "UTC",
    memory: "256MiB",
    timeoutSeconds: 540
}, async (event) => {
    console.log("Starting expired subscription cleanup...");
    
    try {
        const now = new Date();
        const batch = db.batch();
        let cleanupCount = 0;
        
        // Get all users
        const usersSnapshot = await db.collection('users').get();
        
        for (const userDoc of usersSnapshot.docs) {
            const userId = userDoc.id;
            const userProgramsRef = db.collection('users').doc(userId).collection('programs');
            const programsSnapshot = await userProgramsRef.get();
            
            for (const programDoc of programsSnapshot.docs) {
                const program = programDoc.data();
                
                // Check if program has expiration date and is expired
                if (program.expirationDate) {
                    const expirationDate = new Date(program.expirationDate);
                    
                    if (now > expirationDate) {
                        console.log(`Removing expired subscription: ${program.title} for user ${userId}`);
                        batch.delete(programDoc.ref);
                        cleanupCount++;
                    }
                }
            }
        }
        
        // Commit all deletions
        if (cleanupCount > 0) {
            await batch.commit();
            console.log(`Successfully cleaned up ${cleanupCount} expired subscriptions`);
        } else {
            console.log("No expired subscriptions found");
        }
        
        return { success: true, cleanupCount };
        
    } catch (error) {
        console.error("Error during subscription cleanup:", error);
        throw error;
    }
});

/**
 * HTTP function to manually trigger subscription cleanup
 * Useful for testing or manual cleanup
 */
exports.manualCleanupExpiredSubscriptions = onRequest({
    cors: true,
    memory: "256MiB",
    timeoutSeconds: 540
}, async (req, res) => {
    try {
        // Verify admin access (you can add authentication here)
        const { adminKey } = req.body;
        if (adminKey !== process.env.ADMIN_CLEANUP_KEY) {
            return res.status(403).json({ error: "Unauthorized" });
        }
        
        console.log("Manual cleanup triggered...");
        
        const now = new Date();
        const batch = db.batch();
        let cleanupCount = 0;
        
        // Get all users
        const usersSnapshot = await db.collection('users').get();
        
        for (const userDoc of usersSnapshot.docs) {
            const userId = userDoc.id;
            const userProgramsRef = db.collection('users').doc(userId).collection('programs');
            const programsSnapshot = await userProgramsRef.get();
            
            for (const programDoc of programsSnapshot.docs) {
                const program = programDoc.data();
                
                // Check if program has expiration date and is expired
                if (program.expirationDate) {
                    const expirationDate = new Date(program.expirationDate);
                    
                    if (now > expirationDate) {
                        console.log(`Removing expired subscription: ${program.title} for user ${userId}`);
                        batch.delete(programDoc.ref);
                        cleanupCount++;
                    }
                }
            }
        }
        
        // Commit all deletions
        if (cleanupCount > 0) {
            await batch.commit();
        }
        
        res.json({ 
            success: true, 
            message: `Cleaned up ${cleanupCount} expired subscriptions`,
            cleanupCount 
        });
        
    } catch (error) {
        console.error("Error during manual cleanup:", error);
        res.status(500).json({ error: "Cleanup failed", details: error.message });
    }
});

/**
 * Function to check and update user's subscription status
 * Called when user logs in or accesses programs
 */
exports.checkUserSubscriptionStatus = onCall({
    cors: true,
    memory: "128MiB"
}, async (request) => {
    try {
        const { uid } = request.auth;
        if (!uid) {
            throw new Error("User not authenticated");
        }
        
        const now = new Date();
        const userProgramsRef = db.collection('users').doc(uid).collection('programs');
        const programsSnapshot = await userProgramsRef.get();
        
        const activePrograms = [];
        const expiredPrograms = [];
        const batch = db.batch();
        
        for (const programDoc of programsSnapshot.docs) {
            const program = { id: programDoc.id, ...programDoc.data() };
            
            if (program.expirationDate) {
                const expirationDate = new Date(program.expirationDate);
                
                if (now > expirationDate) {
                    // Mark as expired and remove
                    expiredPrograms.push(program);
                    batch.delete(programDoc.ref);
                } else {
                    // Still active
                    activePrograms.push(program);
                }
            } else {
                // One-time purchase, never expires
                activePrograms.push(program);
            }
        }
        
        // Remove expired subscriptions
        if (expiredPrograms.length > 0) {
            await batch.commit();
        }
        
        return {
            activePrograms,
            expiredPrograms: expiredPrograms.map(p => ({ id: p.id, title: p.title })),
            message: expiredPrograms.length > 0 
                ? `${expiredPrograms.length} expired subscription(s) removed`
                : "All subscriptions are active"
        };
        
    } catch (error) {
        console.error("Error checking subscription status:", error);
        throw new Error("Failed to check subscription status");
    }
});
