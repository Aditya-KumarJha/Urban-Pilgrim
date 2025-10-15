# Gift Card Components Documentation

## Overview
This folder contains components related to gift card functionality, including display, purchase, and redemption interfaces.

## Components

### GiftCardList.jsx
**Purpose**: Display grid of available gift cards

**Features**:
- **Card Types Display**: Shows all available gift card types
- **Price Options**: Multiple denominations (₹500, ₹1000, ₹2000, ₹5000, custom)
- **Category Filtering**: Filter by program type (retreat, session, guide)
- **Responsive Grid**: 3 columns desktop, 2 tablet, 1 mobile
- **Hover Effects**: Interactive card animations
- **Quick Purchase**: Direct "Buy Now" buttons

**Gift Card Types**:
```javascript
const giftCardTypes = [
  {
    id: 'wellness-retreat',
    title: 'Wellness Retreat Gift Card',
    description: 'Perfect for retreat programs',
    image: '/images/gift-cards/retreat.jpg',
    applicableTo: 'retreat',
    denominations: [500, 1000, 2000, 5000]
  },
  {
    id: 'wellness-program',
    title: 'Wellness Program Gift Card',
    description: 'For live and recorded sessions',
    image: '/images/gift-cards/program.jpg',
    applicableTo: 'live',
    denominations: [500, 1000, 2000, 5000]
  },
  {
    id: 'pilgrim-guide',
    title: 'Pilgrim Guide Gift Card',
    description: 'For guide services',
    image: '/images/gift-cards/guide.jpg',
    applicableTo: 'guide',
    denominations: [500, 1000, 2000, 5000]
  }
];
```

**Card Component Structure**:
```javascript
<div className="gift-card">
  <img src={card.image} alt={card.title} />
  <h3>{card.title}</h3>
  <p>{card.description}</p>
  <div className="denominations">
    {card.denominations.map(amount => (
      <button onClick={() => handleSelect(card.id, amount)}>
        ₹{amount}
      </button>
    ))}
  </div>
  <button onClick={() => navigate(`/gift-cards/${card.id}`)}>
    View Details
  </button>
</div>
```

### GiftCardDetails.jsx
**Purpose**: Detailed view and purchase interface for specific gift card

**Features**:
- **Card Preview**: Large image and description
- **Amount Selection**: Choose denomination or enter custom amount
- **Quantity Selector**: Purchase multiple cards
- **Total Calculation**: Real-time price calculation
- **Recipient Info**: Optional recipient details for gifting
- **Payment Integration**: Razorpay payment gateway
- **Loading States**: Purchase progress indicators

**State Management**:
```javascript
const [selectedAmount, setSelectedAmount] = useState(1000);
const [quantity, setQuantity] = useState(1);
const [customAmount, setCustomAmount] = useState('');
const [recipientEmail, setRecipientEmail] = useState('');
const [recipientName, setRecipientName] = useState('');
const [isGift, setIsGift] = useState(false);
const [loading, setLoading] = useState(false);
```

**Purchase Flow**:
```javascript
const handlePurchase = async () => {
  try {
    setLoading(true);
    
    // Create order
    const orderData = await createGiftCardProgramOrder({
      amount: selectedAmount,
      giftCardType: cardType,
      quantity: quantity
    });
    
    // Initialize Razorpay
    const options = {
      key: process.env.REACT_APP_RAZORPAY_KEY,
      amount: orderData.amount,
      currency: 'INR',
      order_id: orderData.orderId,
      handler: async (response) => {
        await confirmGiftCardProgramPayment({
          orderId: response.razorpay_order_id,
          paymentId: response.razorpay_payment_id,
          signature: response.razorpay_signature,
          userId: user.uid
        });
        
        toast.success('Gift card purchased successfully!');
        navigate('/gift-cards/success');
      }
    };
    
    const razorpay = new window.Razorpay(options);
    razorpay.open();
  } catch (error) {
    toast.error('Purchase failed');
  } finally {
    setLoading(false);
  }
};
```

**Amount Selection UI**:
```javascript
<div className="amount-selection">
  <h3>Select Amount</h3>
  <div className="preset-amounts">
    {[500, 1000, 2000, 5000].map(amount => (
      <button
        key={amount}
        className={selectedAmount === amount ? 'active' : ''}
        onClick={() => setSelectedAmount(amount)}
      >
        ₹{amount}
      </button>
    ))}
  </div>
  
  <div className="custom-amount">
    <label>Or enter custom amount</label>
    <input
      type="number"
      min="100"
      max="50000"
      value={customAmount}
      onChange={(e) => {
        setCustomAmount(e.target.value);
        setSelectedAmount(parseInt(e.target.value));
      }}
      placeholder="Enter amount"
    />
  </div>
</div>
```

### GiftCardRedemption.jsx
**Purpose**: Interface for redeeming gift card codes

**Features**:
- **Code Input**: Enter gift card code
- **Validation**: Real-time code verification
- **Balance Display**: Show remaining balance
- **Apply to Cart**: Automatic coupon application
- **History**: View redemption history
- **Error Handling**: Invalid code messages

**Redemption Flow**:
```javascript
const handleRedeem = async (code) => {
  try {
    setValidating(true);
    
    // Validate code
    const coupon = await validateCouponCode(code);
    
    if (!coupon) {
      toast.error('Invalid gift card code');
      return;
    }
    
    if (coupon.usedCount >= coupon.usageLimit) {
      toast.error('Gift card already used');
      return;
    }
    
    if (new Date(coupon.expirationDate) < new Date()) {
      toast.error('Gift card expired');
      return;
    }
    
    // Apply to cart
    dispatch(applyCoupon(coupon));
    toast.success(`Gift card applied! Discount: ₹${coupon.discountValue}`);
    navigate('/cart');
    
  } catch (error) {
    toast.error('Redemption failed');
  } finally {
    setValidating(false);
  }
};
```

### GiftCardSuccess.jsx
**Purpose**: Purchase confirmation and code display

**Features**:
- **Success Message**: Confirmation of purchase
- **Code Display**: Show generated coupon codes
- **Email Confirmation**: Sent to user email
- **Download Option**: PDF with codes
- **Share Options**: Email, WhatsApp sharing
- **Usage Instructions**: How to redeem

**Success Display**:
```javascript
<div className="success-container">
  <div className="success-icon">✓</div>
  <h1>Gift Card Purchased Successfully!</h1>
  
  <div className="gift-codes">
    <h2>Your Gift Card Codes</h2>
    {codes.map((code, index) => (
      <div key={index} className="code-card">
        <span className="code">{code}</span>
        <button onClick={() => copyToClipboard(code)}>
          Copy
        </button>
      </div>
    ))}
  </div>
  
  <div className="actions">
    <button onClick={downloadPDF}>
      Download PDF
    </button>
    <button onClick={shareViaEmail}>
      Email to Recipient
    </button>
    <button onClick={shareViaWhatsApp}>
      Share via WhatsApp
    </button>
  </div>
  
  <div className="instructions">
    <h3>How to Use</h3>
    <ol>
      <li>Go to cart page</li>
      <li>Enter gift card code</li>
      <li>Discount will be applied automatically</li>
      <li>Complete your purchase</li>
    </ol>
  </div>
</div>
```

### GiftCardHistory.jsx
**Purpose**: User's gift card purchase and redemption history

**Features**:
- **Purchase History**: All purchased gift cards
- **Redemption Status**: Used/unused codes
- **Balance Tracking**: Remaining value
- **Date Filters**: Filter by date range
- **Export**: Download history as CSV

## Styling

### Gift Card Design
```css
.gift-card {
  @apply relative overflow-hidden rounded-lg;
  @apply bg-gradient-to-br from-blue-500 to-purple-600;
  @apply text-white shadow-lg;
  @apply transform transition-all duration-300;
  @apply hover:scale-105 hover:shadow-2xl;
}

.gift-card-amount {
  @apply text-4xl font-bold;
  @apply bg-white text-blue-600;
  @apply rounded-full w-24 h-24;
  @apply flex items-center justify-center;
}

.gift-card-code {
  @apply font-mono text-2xl tracking-wider;
  @apply bg-gray-100 text-gray-900;
  @apply px-6 py-3 rounded-md;
  @apply border-2 border-dashed border-gray-400;
}
```

## Firebase Integration

### Gift Card Orders Collection
```javascript
// Collection: gift_card_orders
{
  userId: string,
  giftCardType: 'wellness-retreat' | 'wellness-program' | 'pilgrim-guide',
  amount: number,
  quantity: number,
  totalAmount: number,
  couponCodes: string[],
  purchaseDate: timestamp,
  paymentId: string,
  status: 'completed' | 'pending' | 'failed'
}
```

### Coupon Generation
```javascript
const generateGiftCardCoupon = async (orderData) => {
  const codes = [];
  
  for (let i = 0; i < orderData.quantity; i++) {
    const code = generateUniqueCouponCode();
    
    await addDoc(collection(db, 'coupons'), {
      code: code,
      discountType: 'fixed',
      discountValue: orderData.amount,
      programType: getGiftCardProgramType(orderData.giftCardType),
      usageLimit: 1,
      usedCount: 0,
      isActive: true,
      expirationDate: addMonths(new Date(), 12),
      createdAt: serverTimestamp(),
      source: 'gift_card',
      orderId: orderData.id
    });
    
    codes.push(code);
  }
  
  return codes;
};
```

## Payment Integration

### Razorpay Configuration
```javascript
const razorpayOptions = {
  key: process.env.REACT_APP_RAZORPAY_KEY,
  amount: totalAmount * 100, // Convert to paise
  currency: 'INR',
  name: 'Urban Pilgrim',
  description: 'Gift Card Purchase',
  image: '/logo.png',
  order_id: orderId,
  handler: handlePaymentSuccess,
  prefill: {
    name: user.displayName,
    email: user.email,
    contact: user.phoneNumber
  },
  theme: {
    color: '#3B82F6'
  }
};
```

## Email Templates

### Purchase Confirmation Email
- Gift card codes prominently displayed
- Usage instructions
- Expiration date
- Terms and conditions
- Customer support contact

### Gift Card Delivery Email (for recipients)
- Personalized message from sender
- Gift card code
- How to redeem
- Urban Pilgrim branding

## Best Practices

1. **Security**: Never expose codes in URLs
2. **Validation**: Server-side code validation
3. **Expiration**: Clear expiration dates
4. **Usage Tracking**: Monitor redemption patterns
5. **Fraud Prevention**: Limit purchase quantities
6. **User Experience**: Clear instructions
7. **Mobile Optimization**: Touch-friendly interfaces
8. **Error Handling**: Graceful failure messages

## Future Enhancements

- Scheduled delivery for gifts
- Personalized card designs
- Video message attachments
- Bulk purchase discounts
- Corporate gift card programs
- Balance reload functionality
- Gift card exchange/transfer
- Promotional gift cards
