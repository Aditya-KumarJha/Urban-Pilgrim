import { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../services/firebase';
import { setUserPrograms, removeExpiredSubscriptions } from '../features/userProgramsSlice';
import { getSubscriptionStatus, isSubscriptionExpired } from '../utils/subscriptionUtils';

/**
 * Custom hook for managing subscription status
 * Handles checking expiration, cleanup, and status updates
 */
export const useSubscriptionStatus = () => {
    const dispatch = useDispatch();
    const user = useSelector(state => state.auth.user);
    const userPrograms = useSelector(state => state.userProgram);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Check subscription status with backend
     */
    const checkSubscriptionStatus = useCallback(async () => {
        if (!user?.uid) return;

        setLoading(true);
        setError(null);

        try {
            const checkStatus = httpsCallable(functions, 'checkUserSubscriptionStatus');
            const result = await checkStatus();
            
            if (result.data.activePrograms) {
                dispatch(setUserPrograms(result.data.activePrograms));
            }

            if (result.data.expiredPrograms?.length > 0) {
                console.log('Expired subscriptions removed:', result.data.expiredPrograms);
            }

            return result.data;
        } catch (err) {
            console.error('Error checking subscription status:', err);
            setError(err.message);
            return null;
        } finally {
            setLoading(false);
        }
    }, [user?.uid, dispatch]);

    /**
     * Clean up expired subscriptions locally
     */
    const cleanupExpiredLocal = useCallback(() => {
        dispatch(removeExpiredSubscriptions());
    }, [dispatch]);

    /**
     * Get subscription status for a specific program
     */
    const getProgramStatus = useCallback((programId) => {
        const program = userPrograms.find(p => p.id === programId);
        if (!program) return null;
        
        return getSubscriptionStatus(program);
    }, [userPrograms]);

    /**
     * Get all programs with their status
     */
    const getProgramsWithStatus = useCallback(() => {
        return userPrograms.map(program => ({
            ...program,
            status: getSubscriptionStatus(program)
        }));
    }, [userPrograms]);

    /**
     * Get programs expiring soon (within 7 days)
     */
    const getExpiringSoonPrograms = useCallback(() => {
        return userPrograms.filter(program => {
            if (!program.expirationDate) return false;
            const status = getSubscriptionStatus(program);
            return status.type === 'expiring_soon';
        });
    }, [userPrograms]);

    /**
     * Check if user has access to a specific program
     */
    const hasAccess = useCallback((programId) => {
        const program = userPrograms.find(p => p.id === programId);
        if (!program) return false;
        
        // Check if subscription is expired
        return !isSubscriptionExpired(program.expirationDate);
    }, [userPrograms]);

    /**
     * Auto-check status on component mount and user change
     */
    useEffect(() => {
        if (user?.uid) {
            checkSubscriptionStatus();
        }
    }, [user?.uid, checkSubscriptionStatus]);

    /**
     * Set up periodic check for expiring subscriptions (every 5 minutes)
     */
    useEffect(() => {
        const interval = setInterval(() => {
            cleanupExpiredLocal();
        }, 5 * 60 * 1000); // 5 minutes

        return () => clearInterval(interval);
    }, [cleanupExpiredLocal]);

    return {
        // State
        loading,
        error,
        userPrograms,
        
        // Actions
        checkSubscriptionStatus,
        cleanupExpiredLocal,
        
        // Utilities
        getProgramStatus,
        getProgramsWithStatus,
        getExpiringSoonPrograms,
        hasAccess,
        
        // Computed values
        totalActivePrograms: userPrograms.length,
        expiringSoonCount: getExpiringSoonPrograms().length
    };
};
