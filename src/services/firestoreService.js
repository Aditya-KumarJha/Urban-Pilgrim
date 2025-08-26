import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../services/firebase'; // Adjust path as needed

// Fetch unique values from Firestore collections for filter options
export const firestoreService = {
  // Get unique categories from pilgrim retreats
  async getRetreatCategories() {
    try {
      const retreatsRef = collection(db, 'pilgrim_retreat', 'user-uid', 'retreats');
      const snapshot = await getDocs(retreatsRef);
      const categories = new Set();
      
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.pilgrimRetreatCard?.categories) {
          data.pilgrimRetreatCard.categories.forEach(cat => categories.add(cat));
        }
      });
      
      return Array.from(categories);
    } catch (error) {
      console.error('Error fetching retreat categories:', error);
      return [];
    }
  },

  // Get unique locations from pilgrim retreats
  async getRetreatLocations() {
    try {
      const retreatsRef = collection(db, 'pilgrim_retreat', 'user-uid', 'retreats');
      const snapshot = await getDocs(retreatsRef);
      const locations = new Set();
      
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.location) {
          locations.add(data.location);
        }
      });
      
      return Array.from(locations);
    } catch (error) {
      console.error('Error fetching retreat locations:', error);
      return [];
    }
  },

  // Get unique features from pilgrim retreats
  async getRetreatFeatures() {
    try {
      const retreatsRef = collection(db, 'pilgrim_retreat', 'user-uid', 'retreats');
      const snapshot = await getDocs(retreatsRef);
      const features = new Set();
      
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.features && Array.isArray(data.features)) {
          data.features.forEach(feature => {
            if (typeof feature === 'string') {
              // If feature is a string, add it directly
              features.add(feature);
            } else if (feature.image) {
              // Extract meaningful name from image URL
              const imageName = feature.image.split('/').pop().split('.')[0];
              features.add(imageName);
            }
          });
        }
      });
      
      return Array.from(features);
    } catch (error) {
      console.error('Error fetching retreat features:', error);
      return [];
    }
  },

  // Get unique FAQ titles from pilgrim retreats
  async getRetreatFaqTitles() {
    try {
      const retreatsRef = collection(db, 'pilgrim_retreat', 'user-uid', 'retreats');
      const snapshot = await getDocs(retreatsRef);
      const faqTitles = new Set();
      
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.faqs && Array.isArray(data.faqs)) {
          data.faqs.forEach(faq => {
            if (faq.title) {
              faqTitles.add(faq.title);
            } else if (faq.description) {
              // Use description if title is not available
              faqTitles.add(faq.description.substring(0, 50) + '...');
            }
          });
        }
      });
      
      return Array.from(faqTitles);
    } catch (error) {
      console.error('Error fetching retreat FAQ titles:', error);
      return [];
    }
  },

  // Get unique categories from pilgrim guides
  async getGuideCategories() {
    try {
      const guidesRef = collection(db, 'pilgrim_guides', 'pilgrim_guides', 'guides');
      const snapshot = await getDocs(guidesRef);
      const categories = new Set();
      
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.slides) {
          data.slides.forEach(slide => {
            if (slide.guideCard?.category) {
              categories.add(slide.guideCard.category);
            }
          });
        }
      });
      
      return Array.from(categories);
    } catch (error) {
      console.error('Error fetching guide categories:', error);
      return [];
    }
  },

  // Get unique subcategories from pilgrim guides
  async getGuideSubcategories() {
    try {
      const guidesRef = collection(db, 'pilgrim_guides', 'pilgrim_guides', 'guides');
      const snapshot = await getDocs(guidesRef);
      const subcategories = new Set();
      
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.slides) {
          data.slides.forEach(slide => {
            if (slide.guideCard?.subcategory) {
              subcategories.add(slide.guideCard.subcategory);
            }
          });
        }
      });
      
      return Array.from(subcategories);
    } catch (error) {
      console.error('Error fetching guide subcategories:', error);
      return [];
    }
  },

  // Get unique categories from live sessions
  async getLiveSessionCategories() {
    try {
      const sessionsRef = collection(db, 'pilgrim_sessions', 'pilgrim_sessions', 'sessions');
      const liveSessionsQuery = query(sessionsRef, where('liveSession', '!=', null));
      const snapshot = await getDocs(liveSessionsQuery);
      const categories = new Set();
      
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.slides) {
          data.slides.forEach(slide => {
            if (slide.liveSessionCard?.category) {
              categories.add(slide.liveSessionCard.category);
            }
          });
        }
      });
      
      return Array.from(categories);
    } catch (error) {
      console.error('Error fetching live session categories:', error);
      return [];
    }
  },

  // Get unique features from live sessions
  async getLiveSessionFeatures() {
    try {
      const sessionsRef = collection(db, 'pilgrim_sessions', 'pilgrim_sessions', 'sessions');
      const liveSessionsQuery = query(sessionsRef, where('liveSession', '!=', null));
      const snapshot = await getDocs(liveSessionsQuery);
      const features = new Set();
      
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.features && Array.isArray(data.features)) {
          data.features.forEach(feature => {
            if (feature.title) {
              features.add(feature.title);
            }
          });
        }
      });
      
      return Array.from(features);
    } catch (error) {
      console.error('Error fetching live session features:', error);
      return [];
    }
  },

  // Get unique categories from recorded sessions
  async getRecordedSessionCategories() {
    try {
      const sessionsRef = collection(db, 'pilgrim_sessions', 'pilgrim_sessions', 'sessions');
      const recordedSessionsQuery = query(sessionsRef, where('recordedSession', '!=', null));
      const snapshot = await getDocs(recordedSessionsQuery);
      const categories = new Set();
      
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.slides) {
          data.slides.forEach(slide => {
            if (slide.recordedProgramCard?.category) {
              categories.add(slide.recordedProgramCard.category);
            }
          });
        }
      });
      
      return Array.from(categories);
    } catch (error) {
      console.error('Error fetching recorded session categories:', error);
      return [];
    }
  },

  // Get unique features from recorded sessions
  async getRecordedSessionFeatures() {
    try {
      const sessionsRef = collection(db, 'pilgrim_sessions', 'pilgrim_sessions', 'sessions');
      const recordedSessionsQuery = query(sessionsRef, where('recordedSession', '!=', null));
      const snapshot = await getDocs(recordedSessionsQuery);
      const features = new Set();
      
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.features && Array.isArray(data.features)) {
          data.features.forEach(feature => {
            if (feature.title) {
              features.add(feature.title);
            }
          });
        }
      });
      
      return Array.from(features);
    } catch (error) {
      console.error('Error fetching recorded session features:', error);
      return [];
    }
  }
};
