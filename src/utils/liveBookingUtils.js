import { doc, runTransaction, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

// Capacity per occupancy
function getCapacityForType(occupancyType, groupMax) {
  const t = (occupancyType || '').toLowerCase();
  if (t.includes('group')) {
    const max = Number(groupMax || 0);
    return isNaN(max) || max <= 0 ? Infinity : max;
  }
  if (t.includes('couple') || t.includes('twin')) return 2;
  return 1; // individual
}

function slotKey(slot) {
  // Normalize a slot key so we can match array entries
  return `${slot.date}|${slot.startTime}|${slot.endTime}|${(slot.type || 'individual').toLowerCase()}`;
}

// Resolve a Firestore doc reference based on provided sessionId.
// Path provided by user: /pilgrim_sessions/pilgrim_sessions/sessions/liveSession
// We assume sessionId identifies a doc under the 'liveSession' collection.
function getLiveSessionDocRef(sessionId) {
  if (sessionId) {
    // .../liveSession/{sessionId}
    return doc(db, 'pilgrim_sessions', 'pilgrim_sessions', 'sessions', 'liveSession', sessionId);
  }
  // Fallback to the fixed doc .../liveSession (no sessionId)
  return doc(db, 'pilgrim_sessions', 'pilgrim_sessions', 'sessions', 'liveSession');
}

/**
 * Reserve (increment bookedCount) for the given picked slots after successful payment.
 * - Enforces capacity per slot based on occupancyType and groupMax from the document
 * - Ignores slots that are already full
 *
 * @param {string} sessionId - Live session ID used as doc id under .../liveSession/{sessionId}
 * @param {'individual'|'couple'|'group'} occupancyType
 * @param {Array<{date:string,startTime:string,endTime:string,type:string}>} pickedSlots
 * @returns {Promise<{updated:number, skipped:number}>}
 */
export async function reserveLiveSlotsAfterPayment(sessionId, occupancyType, pickedSlots) {
  if (!Array.isArray(pickedSlots) || pickedSlots.length === 0) return { updated: 0, skipped: 0 };

  const ref = getLiveSessionDocRef(sessionId);

  return await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(ref);
    if (!snap.exists()) throw new Error('Live session document not found');
    const data = snap.data() || {};

    const otp = data?.oneTimeSubscription || {};
    const liveSlots = Array.isArray(data?.liveSlots) ? [...data.liveSlots] : null;
    const otpSlots = Array.isArray(otp?.slots) ? [...otp.slots] : null;
    const baseSlots = liveSlots || otpSlots || [];
    const writeField = liveSlots ? 'liveSlots' : 'oneTimeSubscription.slots';
    const groupMax = Number(otp.groupMax || data?.groupMax || 0);
    const cap = getCapacityForType(occupancyType, groupMax);

    // Index slots by key
    const index = new Map();
    baseSlots.forEach((s, i) => index.set(slotKey(s), i));

    let updated = 0, skipped = 0;
    for (const s of pickedSlots) {
      const k = slotKey(s);
      const idx = index.get(k);
      if (idx == null) { skipped++; continue; }
      const curr = baseSlots[idx];
      const currBooked = Number(curr.bookedCount || 0);
      if (currBooked >= cap) { skipped++; continue; }
      
      // Check if slot is locked for a different occupancy type
      if (curr.lockedForType && curr.lockedForType !== occupancyType.toLowerCase()) {
        skipped++; 
        continue;
      }
      
      const next = Math.min(currBooked + 1, cap);
      
      // Lock slot for this occupancy type on first booking
      const updatedSlot = { 
        ...curr, 
        bookedCount: next,
        lockedForType: currBooked === 0 ? occupancyType.toLowerCase() : curr.lockedForType
      };
      
      baseSlots[idx] = updatedSlot;
      updated++;
    }

    // Write back
    transaction.update(ref, { [writeField]: baseSlots });

    return { updated, skipped };
  });
}

/**
 * Convenience wrapper to decrement (e.g., on refund/failed payment) if needed.
 */
export async function unreserveLiveSlots(sessionId, occupancyType, pickedSlots) {
  if (!Array.isArray(pickedSlots) || pickedSlots.length === 0) return { updated: 0, skipped: 0 };
  const ref = getLiveSessionDocRef(sessionId);
  return await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(ref);
    if (!snap.exists()) throw new Error('Live session document not found');
    const data = snap.data() || {};

    const otp = data?.oneTimeSubscription || {};
    const liveSlots = Array.isArray(data?.liveSlots) ? [...data.liveSlots] : null;
    const otpSlots = Array.isArray(otp?.slots) ? [...otp.slots] : null;
    const baseSlots = liveSlots || otpSlots || [];
    const writeField = liveSlots ? 'liveSlots' : 'oneTimeSubscription.slots';

    // Index slots by key
    const index = new Map();
    baseSlots.forEach((s, i) => index.set(slotKey(s), i));

    let updated = 0, skipped = 0;
    for (const s of pickedSlots) {
      const k = slotKey(s);
      const idx = index.get(k);
      if (idx == null) { skipped++; continue; }
      const curr = baseSlots[idx];
      const currBooked = Number(curr.bookedCount || 0);
      const next = Math.max(currBooked - 1, 0);
      baseSlots[idx] = { ...curr, bookedCount: next };
      updated++;
    }

    transaction.update(ref, { [writeField]: baseSlots });

    return { updated, skipped };
  });
}
