# Firebase Cloud Functions Documentation

## Overview
This folder contains all Firebase Cloud Functions for the Urban Pilgrim platform. These serverless functions handle backend operations like payments, notifications, authentication, and data processing.

## Main Functions File

### index.js
**Purpose**: Main Cloud Functions entry point containing all function definitions

## Authentication Functions

>### sendOtp
**Purpose**: Send OTP for user authentication

**Trigger**: HTTPS Callable

**Parameters**:
```javascript
{
  phoneNumber: string, // or email
  type: 'phone' | 'email'
}
```

**Process**:
1. Generate 6-digit OTP
2. Store in Firestore with 5-minute expiration
3. Send via SMS (phone) or email
4. Return success status

**Response**:
```javascript
{
  success: boolean,
  message: string
}
```

>### verifyOtp
**Purpose**: Verify OTP and create user session

**Trigger**: HTTPS Callable

**Parameters**:
```javascript
{
  phoneNumber: string, // or email
  otp: string
}
```

**Process**:
1. Fetch OTP from Firestore
2. Check expiration
3. Verify OTP matches
4. Create custom Firebase token
5. Delete OTP document
6. Return token

**Response**:
```javascript
{
  success: boolean,
  token: string,
  user: object
}
```

>### sendAdminOtp
**Purpose**: Send OTP for admin authentication

**Trigger**: HTTPS Callable

**Parameters**:
```javascript
{
  email: string
}
```

**Process**:
1. Validate email exists in `admins` collection
2. Generate 6-digit OTP
3. Store in Firestore with 5-minute expiration
4. Send via email
5. Return success status

**Security**: Only emails in `admins` collection can receive OTP

>### verifyAdminOtp
**Purpose**: Verify admin OTP and create admin session

**Trigger**: HTTPS Callable

**Parameters**:
```javascript
{
  email: string,
  otp: string
}
```

**Process**:
1. Verify OTP
2. Create custom token with admin claims
3. Set custom claims: `{ admin: true, role: 'admin' }`
4. Return token

**Response**:
```javascript
{
  success: boolean,
  token: string,
  admin: { email, role, permissions }
}
```

## Payment Functions

>### createOrder
**Purpose**: Create Razorpay order for payment

**Trigger**: HTTPS Callable

**Parameters**:
```javascript
{
  amount: number,
  currency: 'INR',
  cartItems: array,
  userId: string,
  couponCode: string | null
}
```

**Process**:
1. Validate cart items
2. Calculate total amount
3. Apply coupon if provided
4. Create Razorpay order
5. Store order in Firestore
6. Return order details

**Response**:
```javascript
{
  orderId: string,
  amount: number,
  currency: string,
  key: string // Razorpay key
}
```

>### confirmPayment
**Purpose**: Confirm payment and process booking

**Trigger**: HTTPS Callable

**Parameters**:
```javascript
{
  orderId: string,
  paymentId: string,
  signature: string,
  userId: string
}
```

**Process**:
1. Verify Razorpay signature
2. Fetch order details
3. Create booking records
4. Update program capacities
5. Update coupon usage (if applicable)
6. Send confirmation email
7. Send invoice PDF
8. **Retreat-specific**: Send notifications to guide
   - Email to `meetGuide.email`
   - WhatsApp to `meetGuide.number`
9. Grant program access to user
10. Return confirmation

**Retreat Notification Logic**:
```javascript
// Detects retreats by:
- program.type === 'retreat'
- program.category === 'retreat'
- program.title.toLowerCase().includes('retreat')

// Sends to guide:
- Email with booking details
- WhatsApp message with customer info
```

**Response**:
```javascript
{
  success: boolean,
  bookingId: string,
  invoiceUrl: string,
  message: string
}
```

**Email Content**:
- Booking confirmation to user
- Retreat guide notification (if retreat)
- Professional HTML template
- Booking details and next steps

**WhatsApp Content**:
- Structured booking information
- Customer contact details
- Retreat date and time
- Payment confirmation

>### createGiftCardProgramOrder
**Purpose**: Create order for gift card purchase

**Trigger**: HTTPS Callable

**Parameters**:
```javascript
{
  amount: number,
  giftCardType: 'wellness-retreat' | 'wellness-program' | 'pilgrim-guide',
  quantity: number,
  userId: string
}
```

**Process**:
1. Calculate total (amount × quantity)
2. Create Razorpay order
3. Store gift card order details
4. Return order info

**Response**:
```javascript
{
  orderId: string,
  amount: number,
  currency: string
}
```

>### confirmGiftCardProgramPayment
**Purpose**: Confirm gift card payment and generate coupons

**Trigger**: HTTPS Callable

**Parameters**:
```javascript
{
  orderId: string,
  paymentId: string,
  signature: string,
  userId: string
}
```

**Process**:
1. Verify payment signature
2. Fetch order details
3. Generate unique coupon codes (one per quantity)
4. Map gift card type to program type:
   - `'wellness-retreat'` → `'retreat'`
   - `'wellness-program'` → `'live'`
   - `'pilgrim-guide'` → `'guide'`
5. Create coupon documents in Firestore
6. Send email with coupon codes
7. Return success

**Coupon Generation**:
- Unique 10-character codes
- Collision detection and retry
- Fixed discount type (full gift card value)
- Program-specific restrictions
- One-time usage limit

**Email Template**:
- Professional HTML design
- Prominent coupon code display
- Gift card details (type, value, validity)
- Usage instructions
- Urban Pilgrim branding

**Response**:
```javascript
{
  success: boolean,
  coupons: [{ code: string, value: number }],
  message: string
}
```

## Notification Functions

>### sendWhatsApp
**Purpose**: Send WhatsApp message via API

**Trigger**: Internal utility function

**Parameters**:
```javascript
{
  phoneNumber: string,
  message: string
}
```

**Process**:
1. Format phone number (add +91 for Indian numbers)
2. Call WhatsApp Business API
3. Log delivery status
4. Return success/failure

**Phone Number Formatting**:
- Adds country code if missing
- Removes spaces and special characters
- Validates format

>### sendEmail
**Purpose**: Send email via Nodemailer

**Trigger**: Internal utility function

**Parameters**:
```javascript
{
  to: string,
  subject: string,
  html: string,
  attachments: array | null
}
```

**Process**:
1. Configure email transporter
2. Build email with HTML template
3. Attach files if provided
4. Send email
5. Log delivery status

**Email Templates**:
- Booking confirmation
- Payment receipt
- Gift card delivery
- Retreat guide notification
- OTP verification
- Password reset

>### sendBookingConfirmation
**Purpose**: Send booking confirmation email

**Parameters**:
```javascript
{
  userEmail: string,
  userName: string,
  bookingDetails: object,
  programDetails: object
}
```

**Email Content**:
- Booking ID and date
- Program details
- Schedule information
- Payment summary
- Access instructions
- Cancellation policy

>### sendRetreatGuideNotification
**Purpose**: Notify retreat guide of new booking

**Parameters**:
```javascript
{
  guideEmail: string,
  guidePhone: string,
  retreatDetails: object,
  customerDetails: object,
  bookingDate: string,
  paymentId: string
}
```

**Notification Channels**:
1. **Email**: Professional HTML template with booking details
2. **WhatsApp**: Structured text message with customer info

**Email Template**:
- Urban Pilgrim branded header
- Retreat name and details
- Customer information
- Booking date and payment ID
- Next steps for guide
- Contact information

**WhatsApp Message**:
- Retreat booking notification
- Customer name, email, phone
- Booking date and time
- Payment confirmation
- Professional formatting

## PDF Generation Functions

>### invoicePdfKit.js
**Purpose**: Generate user invoice PDF

**Features**:
- Urban Pilgrim logo and branding
- Invoice number and date
- Customer details
- Itemized program list
- Subtotal, discount, tax, total
- Payment method and status
- Terms and conditions

**Usage**:
```javascript
const generateInvoice = require('./invoicePdfKit');
const pdfBuffer = await generateInvoice(invoiceData);
```

>### invoiceOrganizerPdfKit.js
**Purpose**: Generate organizer invoice PDF

**Features**:
- Similar to user invoice
- Organizer-specific details
- Commission breakdown
- Payout information

## Scheduled Functions

>### subscriptionCleanup.js
**Purpose**: Clean up expired subscriptions

**Trigger**: Scheduled (daily at midnight)

**Process**:
1. Query subscriptions with `endDate < now`
2. Update status to 'expired'
3. Revoke program access
4. Send expiration notification
5. Log cleanup results

**Schedule**: `0 0 * * *` (daily at 00:00 UTC)

## Workshop Functions

>### workshopRequests.js
**Purpose**: Handle workshop inquiry requests

**Functions**:

#### submitWorkshopRequest
**Trigger**: HTTPS Callable

**Process**:
1. Validate request data
2. Create request document
3. Send notification to admin
4. Send confirmation to user
5. Return request ID

#### updateWorkshopRequestStatus
**Trigger**: HTTPS Callable (admin only)

**Process**:
1. Verify admin authentication
2. Update request status
3. Send notification to user
4. Log status change

## Helper Functions

>### validateRazorpaySignature
**Purpose**: Verify Razorpay payment signature

**Parameters**:
```javascript
{
  orderId: string,
  paymentId: string,
  signature: string
}
```

**Process**:
1. Create expected signature using HMAC SHA256
2. Compare with received signature
3. Return validation result

>### generateCouponCode
**Purpose**: Generate unique coupon code

**Algorithm**:
1. Generate random 10-character alphanumeric code
2. Check Firestore for collisions
3. Retry if collision found
4. Return unique code

**Format**: Uppercase letters and numbers (e.g., `ABC123XYZ9`)

>### formatPhoneNumber
**Purpose**: Format phone number for international use

**Process**:
1. Remove spaces and special characters
2. Add country code if missing
3. Validate format
4. Return formatted number

**Example**: `9876543210` → `+919876543210`

>### calculateTax
**Purpose**: Calculate tax amount

**Formula**: `(subtotal - discount) * taxRate`

**Tax Rate**: 18% GST (configurable)

>### generateInvoiceNumber
**Purpose**: Generate unique invoice number

**Format**: `INV-YYYYMMDD-XXXX`

**Example**: `INV-20250114-0001`

## Environment Variables

>### Required Variables (.env)
```
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
WHATSAPP_API_KEY=xxxxx
WHATSAPP_API_URL=https://api.whatsapp.com
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=noreply@urbanpilgrim.com
EMAIL_PASSWORD=xxxxx
FIREBASE_PROJECT_ID=urban-pilgrim
ADMIN_EMAIL=admin@urbanpilgrim.com
```

## Security Considerations

>### Authentication
- All callable functions verify user authentication
- Admin functions check custom claims
- Rate limiting on sensitive operations

>### Data Validation
- Validate all input parameters
- Sanitize user inputs
- Check data types and ranges

>### Payment Security
- Verify Razorpay signatures
- Double-check amounts server-side
- Log all payment operations
- Handle refunds securely

>### Error Handling
```javascript
try {
  // Function logic
} catch (error) {
  console.error('Function error:', error);
  
  // Log to monitoring
  logError(error);
  
  // Return user-friendly error
  throw new functions.https.HttpsError(
    'internal',
    'Operation failed. Please try again.'
  );
}
```

## Deployment

>### Deploy All Functions
```bash
firebase deploy --only functions
```

>### Deploy Specific Function
```bash
firebase deploy --only functions:confirmPayment
```

>### View Logs
```bash
firebase functions:log
```

>### Test Locally
```bash
firebase emulators:start --only functions
```

## Monitoring

>### Cloud Function Logs
- View in Firebase Console
- Filter by function name
- Check execution time and errors

>### Error Tracking
- Automatic error logging
- Email alerts for critical errors
- Performance monitoring

>### Metrics
- Invocation count
- Execution time
- Error rate
- Memory usage

## Best Practices

1. **Idempotency**: Functions should be idempotent (safe to retry)
2. **Timeouts**: Set appropriate timeout limits
3. **Memory**: Allocate sufficient memory
4. **Error Handling**: Always handle errors gracefully
5. **Logging**: Log important operations
6. **Security**: Validate all inputs
7. **Testing**: Test with emulators before deployment
8. **Monitoring**: Set up alerts for errors
9. **Documentation**: Document complex logic
10. **Versioning**: Use versioned function names for breaking changes

## Testing

>### Unit Tests
```javascript
const test = require('firebase-functions-test')();

describe('confirmPayment', () => {
  it('should confirm payment successfully', async () => {
    const result = await confirmPayment({
      orderId: 'test_order',
      paymentId: 'test_payment',
      signature: 'valid_signature',
      userId: 'test_user'
    });
    
    expect(result.success).toBe(true);
  });
});
```

>### Integration Tests
- Test with Firebase emulators
- Mock external API calls
- Test error scenarios

## Troubleshooting

>### Common Issues

**Function Timeout**:
- Increase timeout in function config
- Optimize database queries
- Use batch operations

**Memory Exceeded**:
- Increase memory allocation
- Optimize data processing
- Use streaming for large files

**Permission Denied**:
- Check Firebase Security Rules
- Verify user authentication
- Check custom claims

**Payment Verification Failed**:
- Verify Razorpay credentials
- Check signature calculation
- Validate order details

## Function Configuration

>### Runtime Options
```javascript
const runtimeOpts = {
  timeoutSeconds: 300,
  memory: '1GB'
};

exports.confirmPayment = functions
  .runWith(runtimeOpts)
  .https.onCall(async (data, context) => {
    // Function logic
  });
```

>### Region Configuration
```javascript
exports.confirmPayment = functions
  .region('asia-south1')
  .https.onCall(async (data, context) => {
    // Function logic
  });
```
