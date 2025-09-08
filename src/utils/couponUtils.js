import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';

export const validateCoupon = async (couponCode, cartData, programType = null) => {
  try {
    if (!couponCode) {
      return { valid: false, error: 'Please enter a coupon code' };
    }

    // Query for the coupon
    const couponsRef = collection(db, 'coupons');
    const q = query(couponsRef, where('code', '==', couponCode.toUpperCase()));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return { valid: false, error: 'Invalid coupon code' };
    }

    const couponDoc = querySnapshot.docs[0];
    const coupon = { id: couponDoc.id, ...couponDoc.data() };

    // Check if coupon is active
    if (!coupon.isActive) {
      return { valid: false, error: 'This coupon is no longer active' };
    }

    // Check expiration
    const now = new Date();
    const expirationDate = new Date(coupon.expirationDate);
    if (expirationDate < now) {
      return { valid: false, error: 'This coupon has expired' };
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return { valid: false, error: 'This coupon has reached its usage limit' };
    }

    // Check program type compatibility
    const cartProgramTypes = getCartProgramTypes(cartData);
    if (!cartProgramTypes.includes(coupon.programType)) {
      return { 
        valid: false, 
        error: `This coupon is only valid for ${getProgramTypeLabel(coupon.programType)}` 
      };
    }

    // Calculate subtotal for applicable items
    const applicableSubtotal = calculateApplicableSubtotal(cartData, coupon.programType);

    // Check minimum order amount
    if (coupon.minOrderAmount && applicableSubtotal < coupon.minOrderAmount) {
      return { 
        valid: false, 
        error: `Minimum order amount of ₹${coupon.minOrderAmount} required for this coupon` 
      };
    }

    // Calculate discount
    const discount = calculateDiscount(applicableSubtotal, coupon);

    return {
      valid: true,
      coupon,
      discount,
      applicableSubtotal
    };

  } catch (error) {
    console.error('Error validating coupon:', error);
    return { valid: false, error: 'Failed to validate coupon. Please try again.' };
  }
};

export const calculateDiscount = (subtotal, coupon) => {
  let discount = 0;

  if (coupon.discountType === 'percentage') {
    discount = (subtotal * coupon.discountValue) / 100;
    // Apply maximum discount limit if specified
    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount;
    }
  } else if (coupon.discountType === 'fixed') {
    discount = Math.min(coupon.discountValue, subtotal);
  }

  return Math.round(discount);
};

export const getCartProgramTypes = (cartData) => {
  const types = new Set();
  
  cartData.forEach(item => {
    if (item.type === 'live_session' || item.category === 'live_sessions') {
      types.add('live_sessions');
    } else if (item.type === 'recorded_session' || item.category === 'recorded_sessions') {
      types.add('recorded_sessions');
    } else if (item.type === 'retreat' || item.category === 'retreats') {
      types.add('retreats');
    } else if (item.type === 'guide' || item.category === 'guides') {
      types.add('guides');
    }
  });

  return Array.from(types);
};

export const calculateApplicableSubtotal = (cartData, programType) => {
  return cartData
    .filter(item => {
      if (programType === 'live_sessions') {
        return item.type === 'live_session' || item.category === 'live_sessions';
      } else if (programType === 'recorded_sessions') {
        return item.type === 'recorded_session' || item.category === 'recorded_sessions';
      } else if (programType === 'retreats') {
        return item.type === 'retreat' || item.category === 'retreats';
      } else if (programType === 'guides') {
        return item.type === 'guide' || item.category === 'guides';
      }
      return false;
    })
    .reduce((sum, item) => {
      return sum + (item.price * (item.persons ?? 1) * (item.quantity ?? 1) * (item.duration ?? 1));
    }, 0);
};

export const getProgramTypeLabel = (type) => {
  const labels = {
    'live_sessions': 'Live Sessions',
    'recorded_sessions': 'Recorded Sessions',
    'retreats': 'Pilgrim Retreats',
    'guides': 'Pilgrim Guides'
  };
  return labels[type] || type;
};

export const applyCouponToCart = (cartData, coupon, discount) => {
  return {
    items: cartData,
    coupon: {
      code: coupon.code,
      discount,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      programType: coupon.programType
    }
  };
};
