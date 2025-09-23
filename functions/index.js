// functions/index.js
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
const Razorpay = require("razorpay");
const twilio = require("twilio");

// Import subscription cleanup functions - moved inline to avoid import issues

const { google } = require("googleapis");
const { OAuth2Client } = require("google-auth-library");
require("dotenv").config();

const cors = require("cors")({ origin: true });

admin.initializeApp();
const db = admin.firestore();

// Guide Monthly Weekly Slot Booking (Transactional)
// Params: { guideTitle, mode: 'online'|'offline', rowIdx, tIdx, type: 'individual'|'couple'|'group', userId }
exports.bookGuideMonthlyWeeklySlot = functions.https.onCall(async (data, context) => {
    const { guideTitle, mode, rowIdx, tIdx, type, userId } = data.data || {};

    if (!guideTitle || !mode || rowIdx === undefined || tIdx === undefined || !type || !userId) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing required parameters');
    }

    const modeKey = (mode || '').toLowerCase(); // 'online' | 'offline'
    if (!['online', 'offline'].includes(modeKey)) {
        throw new functions.https.HttpsError('invalid-argument', 'Invalid mode');
    }

    const docRef = db
        .collection('pilgrim_guides')
        .doc('pilgrim_guides')
        .collection('guides')
        .doc('data');

    return await db.runTransaction(async (tx) => {
        const snap = await tx.get(docRef);
        if (!snap.exists) {
            throw new functions.https.HttpsError('not-found', 'Guides data not found');
        }

        const dataObj = snap.data() || {};
        const slides = Array.isArray(dataObj.slides) ? [...dataObj.slides] : [];
        const idx = slides.findIndex((s) => {
            const title = (s?.guideCard?.title || s?.title || '').toString();
            return title === guideTitle;
        });
        if (idx === -1) {
            throw new functions.https.HttpsError('not-found', 'Guide slide not found');
        }

        const slide = { ...slides[idx] };
        const monthly = slide?.[modeKey]?.monthly;
        if (!monthly || !Array.isArray(monthly.weeklyPattern)) {
            throw new functions.https.HttpsError('failed-precondition', 'Weekly pattern not configured');
        }

        if (!monthly.weeklyPattern[rowIdx]) {
            throw new functions.https.HttpsError('invalid-argument', 'Row index out of range');
        }
        const row = { ...monthly.weeklyPattern[rowIdx] };
        const times = Array.isArray(row.times) ? [...row.times] : [];
        if (!times[tIdx]) {
            throw new functions.https.HttpsError('invalid-argument', 'Time index out of range');
        }
        const timeItem = { ...times[tIdx] };

        // Enforce type consistency
        const timeType = (timeItem.type || 'individual');
        if (timeType !== type) {
            throw new functions.https.HttpsError('failed-precondition', 'Slot type mismatch');
        }

        // Determine capacity
        let maxCap = 1;
        if (type === 'couple') maxCap = 2;
        else if (type === 'group') {
            const gMax = Number(slide?.[modeKey]?.monthly?.groupMax || 0);
            if (!gMax || gMax <= 0) {
                throw new functions.https.HttpsError('failed-precondition', 'Group max not configured');
            }
            maxCap = gMax;
        }

        const booked = Number(timeItem.bookedCount || 0);
        if (booked >= maxCap) {
            throw new functions.https.HttpsError('resource-exhausted', 'Slot is full');
        }

        // Increment booked count
        timeItem.bookedCount = booked + 1;
        times[tIdx] = timeItem;
        row.times = times;
        const pattern = [...monthly.weeklyPattern];
        pattern[rowIdx] = row;

        slides[idx] = {
            ...slide,
            [modeKey]: {
                ...slide[modeKey],
                monthly: {
                    ...monthly,
                    weeklyPattern: pattern,
                },
            },
            bookings: [
                ...(Array.isArray(slide.bookings) ? slide.bookings : []),
                {
                    userId,
                    at: new Date().toISOString(),
                    mode: modeKey,
                    subscriptionType: 'monthly',
                    rowIdx,
                    tIdx,
                    type,
                },
            ],
        };

        tx.update(docRef, { slides });
        return { success: true, bookedCount: timeItem.bookedCount, maxCap };
    });
});

// Optional: Cancel booking (decrement), with floor at 0
exports.cancelGuideMonthlyWeeklySlot = functions.https.onCall(async (data, context) => {
    const { guideTitle, mode, rowIdx, tIdx, type, userId } = data.data || {};
    const modeKey = (mode || '').toLowerCase();
    if (!guideTitle || !modeKey || rowIdx === undefined || tIdx === undefined || !type) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing required parameters');
    }

    const docRef = db
        .collection('pilgrim_guides')
        .doc('pilgrim_guides')
        .collection('guides')
        .doc('data');

    return await db.runTransaction(async (tx) => {
        const snap = await tx.get(docRef);
        if (!snap.exists) throw new functions.https.HttpsError('not-found', 'Guides data not found');

        const dataObj = snap.data() || {};
        const slides = Array.isArray(dataObj.slides) ? [...dataObj.slides] : [];
        const idx = slides.findIndex((s) => ((s?.guideCard?.title || s?.title || '') === guideTitle));
        if (idx === -1) throw new functions.https.HttpsError('not-found', 'Guide slide not found');

        const slide = { ...slides[idx] };
        const monthly = slide?.[modeKey]?.monthly;
        if (!monthly || !Array.isArray(monthly.weeklyPattern)) throw new functions.https.HttpsError('failed-precondition', 'Weekly pattern not configured');
        const row = { ...(monthly.weeklyPattern[rowIdx] || {}) };
        const times = Array.isArray(row.times) ? [...row.times] : [];
        const timeItem = { ...(times[tIdx] || {}) };

        if ((timeItem.type || 'individual') !== type) throw new functions.https.HttpsError('failed-precondition', 'Slot type mismatch');

        const booked = Number(timeItem.bookedCount || 0);
        timeItem.bookedCount = Math.max(0, booked - 1);
        times[tIdx] = timeItem;
        row.times = times;
        const pattern = [...monthly.weeklyPattern];
        pattern[rowIdx] = row;

        slides[idx] = {
            ...slide,
            [modeKey]: {
                ...slide[modeKey],
                monthly: {
                    ...monthly,
                    weeklyPattern: pattern,
                },
            },
            bookings: (Array.isArray(slide.bookings) ? slide.bookings : []).filter(b => !(b.userId === userId && b.mode === modeKey && b.subscriptionType === 'monthly' && b.rowIdx === rowIdx && b.tIdx === tIdx && b.type === type)),
        };

        tx.update(docRef, { slides });
        return { success: true, bookedCount: timeItem.bookedCount };
    });
});

const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);
const gmailEmail = process.env.APP_GMAIL;
const gmailPassword = process.env.APP_GMAIL_PASSWORD;
const contactEmail = process.env.CONTACT_EMAIL

const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Configure email transporter (using Gmail/SendGrid/etc)
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: gmailEmail,
        pass: gmailPassword,
    },
});

// User OTP Functions
exports.sendOtp = functions.https.onCall(async (data, context) => {
    console.log("data from sendOtp", data.data);
    const { email } = data.data;
    if (!email)
        throw new functions.https.HttpsError(
            "invalid-argument",
            "Email required"
        );

    const Otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
    const ExpiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    await db.collection("emailOtps").doc(email).set({ Otp, ExpiresAt });

    // Send OTP email
    await transporter.sendMail({
        from: gmailEmail,
        to: email,
        subject: "Your Urban Pilgrim Verification Code",
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Urban Pilgrim OTP</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f4f4f4;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <div style="background: linear-gradient(135deg, #2F6288 0%, #C5703F 100%); padding: 30px 20px; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">Urban Pilgrim</h1>
                        <p style="color: #ffffff; margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">Your Spiritual Journey Awaits</p>
                    </div>
                    
                    <!-- Content -->
                    <div style="padding: 40px 30px;">
                        <div style="text-align: center; margin-bottom: 30px;">
                            <h2 style="color: #2F6288; margin: 0 0 10px 0; font-size: 24px;">Verification Code</h2>
                            <p style="color: #666; margin: 0; font-size: 16px;">Enter this code to complete your login</p>
                        </div>
                        
                        <!-- OTP Code -->
                        <div style="background: #f8f9fa; border: 2px dashed #C5703F; border-radius: 12px; padding: 25px; text-align: center; margin: 30px 0;">
                            <div style="font-size: 36px; font-weight: bold; color: #2F6288; letter-spacing: 8px; font-family: 'Courier New', monospace;">${Otp}</div>
                        </div>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <p style="color: #666; margin: 0 0 10px 0; font-size: 14px;">This code will expire in <strong style="color: #C5703F;">5 minutes</strong></p>
                            <p style="color: #999; margin: 0; font-size: 13px;">If you didn't request this code, please ignore this email.</p>
                        </div>
                    </div>
                    
                    <!-- Footer -->
                    <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
                        <p style="color: #999; margin: 0; font-size: 12px;">© 2025 Urban Pilgrim. All rights reserved.</p>
                        <p style="color: #999; margin: 5px 0 0 0; font-size: 12px;">This is an automated message, please do not reply.</p>
                    </div>
                </div>
            </body>
            </html>
        `,
    });

    return { success: true };
});

exports.verifyOtp = functions.https.onCall(async (data, context) => {
    console.log("data from verifyOtp", data.data);
    const { email, otp } = data.data;
    const doc = await db.collection("emailOtps").doc(email).get();

    if (!doc.exists)
        throw new functions.https.HttpsError("not-found", "OTP not found");

    console.log("OTP document found:", doc.data());
    const { Otp, ExpiresAt } = doc.data();
    console.log("OTP:", Otp, "ExpiresAt:", ExpiresAt);

    if (Date.now() > ExpiresAt)
        throw new functions.https.HttpsError(
            "deadline-exceeded",
            "OTP expired"
        );

    if (Number(Otp) !== Number(otp))
        throw new functions.https.HttpsError("invalid-argument", "Invalid OTP");
    console.log("OTP verified successfully");

    // Create or get Firebase Auth user
    let user;
    try {
        user = await admin.auth().getUserByEmail(email);
    } catch {
        user = await admin.auth().createUser({ email });
    }

    // Generate custom token
    console.log("Generating custom token for user:", user);
    const token = await admin.auth().createCustomToken(user.uid, {
        role: "user",
    });

    // Delete OTP after use
    await db.collection("emailOtps").doc(email).delete();

    return { token };
});

// Admin OTP Functions
exports.sendAdminOtp = functions.https.onCall(async (data, context) => {
    console.log("data from sendAdminOtp", data.data);
    const { email } = data.data;
    if (!email)
        throw new functions.https.HttpsError(
            "invalid-argument",
            "Email required"
        );

    // Check if email is authorized admin email
    const adminQuery = await db.collection("admins").where("email", "==", email).get();
    if (adminQuery.empty) {
        throw new functions.https.HttpsError(
            "permission-denied",
            "This email is not authorized as an admin. Please contact the system administrator."
        );
    }

    // Check if admin is active
    const adminData = adminQuery.docs[0].data();
    if (adminData.isActive === false) {
        throw new functions.https.HttpsError(
            "permission-denied",
            "Admin account is deactivated. Please contact the system administrator."
        );
    }

    const Otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
    const ExpiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    await db.collection("adminOtps").doc(email).set({ Otp, ExpiresAt });

    // Send OTP email
    await transporter.sendMail({
        from: gmailEmail,
        to: email,
        subject: "Urban Pilgrim Admin Portal - Verification Code",
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Urban Pilgrim Admin OTP</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f4f4f4;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 30px 20px; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">Urban Pilgrim Admin</h1>
                        <p style="color: #ffffff; margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">Admin Portal Access</p>
                    </div>
                    
                    <!-- Content -->
                    <div style="padding: 40px 30px;">
                        <div style="text-align: center; margin-bottom: 30px;">
                            <h2 style="color: #1e40af; margin: 0 0 10px 0; font-size: 24px;">Admin Verification Code</h2>
                            <p style="color: #666666; margin: 0; font-size: 16px; line-height: 1.5;">Enter this code to access the admin dashboard</p>
                        </div>
                        
                        <!-- OTP Display -->
                        <div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border: 2px solid #3b82f6; border-radius: 12px; padding: 25px; text-align: center; margin: 30px 0;">
                            <div style="font-size: 36px; font-weight: bold; color: #1e40af; letter-spacing: 8px; margin-bottom: 10px;">${Otp}</div>
                            <p style="color: #1e40af; margin: 0; font-size: 14px; font-weight: 500;">This code expires in 5 minutes</p>
                        </div>
                        
                        <!-- Security Notice -->
                        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
                            <p style="color: #92400e; margin: 0; font-size: 14px; font-weight: 500;">🔒 Security Notice</p>
                            <p style="color: #92400e; margin: 5px 0 0 0; font-size: 13px;">This is an admin access code. Do not share this code with anyone. All admin access is logged and monitored.</p>
                        </div>
                        
                        <div style="text-align: center; margin-top: 30px;">
                            <p style="color: #666666; margin: 0; font-size: 14px;">If you didn't request this code, please ignore this email.</p>
                        </div>
                    </div>
                    
                    <!-- Footer -->
                    <div style="background-color: #f8fafc; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                        <p style="color: #64748b; margin: 0; font-size: 12px;">© 2024 Urban Pilgrim. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `,
    });

    return { success: true };
});

exports.verifyAdminOtp = functions.https.onCall(async (data, context) => {
    console.log("data from verifyAdminOtp", data.data);
    const { email, otp } = data.data;
    const doc = await db.collection("adminOtps").doc(email).get();

    if (!doc.exists) {
        throw new functions.https.HttpsError(
            "not-found",
            "OTP not found or expired"
        );
    }

    const { Otp, ExpiresAt } = doc.data();

    if (Date.now() > ExpiresAt) {
        await db.collection("adminOtps").doc(email).delete();
        throw new functions.https.HttpsError("deadline-exceeded", "OTP expired");
    }

    if (parseInt(otp) !== Otp) {
        throw new functions.https.HttpsError("invalid-argument", "Invalid OTP");
    }

    // Verify admin exists and get admin data
    const adminQuery = await db.collection("admins").where("email", "==", email).get();
    if (adminQuery.empty) {
        throw new functions.https.HttpsError(
            "permission-denied",
            "Admin not found in database"
        );
    }

    const adminData = adminQuery.docs[0].data();
    
    // Check if admin is active
    if (adminData.isActive === false) {
        throw new functions.https.HttpsError(
            "permission-denied",
            "Admin account is deactivated"
        );
    }

    // Get existing Firebase Auth user (only verify, don't create)
    let user;
    try {
        user = await admin.auth().getUserByEmail(email);
    } catch (error) {
        throw new functions.https.HttpsError(
            "not-found",
            "Admin user not found in Firebase Auth. Please contact system administrator."
        );
    }

    // Generate custom token with admin claims
    console.log("Generating custom token for admin:", user.uid);
    const token = await admin.auth().createCustomToken(user.uid, {
        role: "admin",
        permissions: adminData.permissions || [],
        adminLevel: adminData.level || "standard"
    });

    // Delete OTP after use
    await db.collection("adminOtps").doc(email).delete();

    return { 
        token,
        adminData: {
            role: adminData.role || 'admin',
            permissions: adminData.permissions || [],
            level: adminData.level || 'standard',
            name: adminData.name
        }
    };
});

exports.sendContactEmail = functions.https.onCall(async (data, context) => {
    const { name, email, message, phone } = data.data; // ✅ comes directly from frontend

    if (!name || !email || !message) {
        throw new functions.https.HttpsError(
            "invalid-argument",
            "Missing required fields"
        );
    }

    const mailOptions = {
        from: email,
        to: contactEmail,
        subject: `📩 New Contact Us Message from ${name}`,
        html: `
            <div style="line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
                <div style="background: #4CAF50; color: white; padding: 15px; text-align: center; font-size: 18px; font-weight: bold;">
                    New Contact Us Message
                </div>
                <div style="padding: 20px;">
                    <p><strong>Name:</strong> ${name}</p>
                    <p><strong>Email:</strong> <a href="mailto:${email}" style="color: #4CAF50;">${email}</a></p>
                    <p><strong>Phone:</strong> ${phone || "Not Provided"}</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 15px 0;">
                    <p style="margin: 0;"><strong>Message:</strong></p>
                    <p style="background: #f9f9f9; padding: 10px; border-radius: 6px; white-space: pre-line;">
                        ${message}
                    </p>
                </div>
                <div style="background: #f1f1f1; padding: 10px; font-size: 12px; text-align: center; color: #555;">
                    This email was generated from your website's Contact Us form.
                </div>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        return { success: true, message: "Email sent!" }; // return directly
    } catch (error) {
        console.error("Email error:", error);
        throw new functions.https.HttpsError(
            "internal",
            "Failed to send email"
        );
    }
});

// Razorpay
exports.createOrder = functions.https.onCall(async (data, context) => {
    console.log("data from createOrder", data.data);
    const options = {
        amount: data.data.amount * 100, // paise
        currency: "INR",
        receipt: `order_${Date.now()}`,
    };

    try {
        const order = await razorpay.orders.create(options);
        return order;
    } catch (err) {
        throw new functions.https.HttpsError("internal", err.message);
    }
});

exports.confirmPayment = functions.https.onCall(async (data, context) => {
    try {
        const { userId, email, name, cartData, total, paymentResponse, formData, coupon } = data.data;

        const adminEmail = "urbanpilgrim25@gmail.com";

        // ------------------------
        // 1) Save purchase in user's Firestore with expiration data
        // ------------------------
        const userRef = db
            .collection("users")
            .doc(userId)
            .collection("info")
            .doc("details");
        
        // Also save individual programs with expiration data
        const userProgramsRef = db.collection("users").doc(userId).collection("programs");
        const batch = db.batch();
        
        // Save to existing structure for compatibility
        batch.set(userRef, {
            yourPrograms: admin.firestore.FieldValue.arrayUnion(
                ...cartData.map((item) => ({
                    ...item,
                    purchasedAt: new Date().toISOString(),
                    paymentId: paymentResponse.razorpay_payment_id,
                    orderId: paymentResponse.razorpay_order_id,
                }))
            ),
        }, { merge: true });
        
        // Save individual programs with expiration tracking
        cartData.forEach((item) => {
            const programDoc = userProgramsRef.doc(item.id);
            batch.set(programDoc, {
                ...item,
                purchasedAt: new Date().toISOString(),
                paymentId: paymentResponse.razorpay_payment_id,
                orderId: paymentResponse.razorpay_order_id,
                // Include expiration data if present
                ...(item.subscriptionType && { subscriptionType: item.subscriptionType }),
                ...(item.expirationDate && { expirationDate: item.expirationDate }),
                isExpired: false
            });
        });
        
        await batch.commit();

        // ------------------------
        // 1.5) Update coupon usage if coupon was applied
        // ------------------------
        if (coupon && coupon.code) {
            try {
                const couponsRef = db.collection('coupons');
                const couponQuery = await couponsRef.where('code', '==', coupon.code).get();
                
                if (!couponQuery.empty) {
                    const couponDoc = couponQuery.docs[0];
                    const currentUsedCount = couponDoc.data().usedCount || 0;
                    const restrict = couponDoc.data().restrictToProgram || null;
                    // If coupon restricted to a specific program, ensure it's in cart
                    if (restrict && (restrict.id || restrict.title)) {
                        const match = (cartData || []).some(item => {
                            const byId = restrict.id && item.id === restrict.id;
                            const byTitle = restrict.title && item.title === restrict.title;
                            return byId || byTitle;
                        });
                        if (!match) {
                            console.log('Coupon restrictToProgram does not match any cart item, skipping usage update');
                            // Do not update usage if restriction not satisfied
                            return { success: true };
                        }
                    }
                    
                    const nextCount = currentUsedCount + 1;
                    const isGiftCard = couponDoc.data().isGiftCard === true;
                    const usageLimit = couponDoc.data().usageLimit || 1;

                    if (isGiftCard && nextCount >= usageLimit) {
                        // Delete after single use
                        await couponDoc.ref.delete();
                        console.log(`Deleted gift card coupon ${coupon.code} after redemption`);
                    } else {
                        await couponDoc.ref.update({
                            usedCount: nextCount,
                            lastUsedAt: new Date(),
                            lastUsedBy: {
                                userId,
                                email,
                                name,
                                paymentId: paymentResponse.razorpay_payment_id
                            }
                        });
                    }
                    
                    console.log(`Updated coupon ${coupon.code} usage count to ${currentUsedCount + 1}`);
                }
            } catch (couponError) {
                console.error('Error updating coupon usage:', couponError);
                // Don't fail the entire payment for coupon update errors
            }
        }

        // ------------------------
        // 2) Update each program document
        // ------------------------
        for (const program of cartData) {
            try {
                let programRef;
                let updateData = {};
                console.log("program from loop: ", program)
                console.log("program.type raw:", program.type, typeof program.type);

                if (program.type && program.type.toLowerCase().trim() === 'guide') {
                    programRef = db
                        .collection("pilgrim_guides")
                        .doc("pilgrim_guides")
                        .collection("guides")
                        .doc("data");
                    console.log("programRef: ", programRef);
                    const guideSnap = await programRef.get();
                    console.log("guideSnap: ", guideSnap);
                    if (guideSnap.exists) {
                        // Use the correct field name 'slides' and match title from guideCard.title
                        const slides = guideSnap.data().slides || [];
                        const updatedSlides = slides.map((slide) => {
                            const slideTitle = slide?.guideCard?.title || slide?.title;
                            if (slideTitle === program.title) {
                                // Append purchaser info
                                const updatedSlide = {
                                    ...slide,
                                    purchasedUsers: [
                                        ...(slide.purchasedUsers || []),
                                        {
                                            uid: userId,
                                            name,
                                            email,
                                            purchasedAt: new Date().toISOString(),
                                            paymentId: paymentResponse.razorpay_payment_id,
                                            orderId: paymentResponse.razorpay_order_id,
                                            slot: program.slot,
                                            date: program.date,
                                            mode: program.mode,
                                            subscriptionType: program.subscriptionType,
                                            ...formData,
                                        },
                                    ],
                                };

                                // Capacity updates and availability adjustments
                                try {
                                    const modeKey = (program.mode || '').toLowerCase(); // 'online' | 'offline'
                                    const subKey = program.subscriptionType; // 'monthly' | 'oneTime' | 'quarterly' etc.
                                    if (
                                        modeKey &&
                                        updatedSlide[modeKey] &&
                                        updatedSlide[modeKey][subKey] &&
                                        Array.isArray(updatedSlide[modeKey][subKey].slots)
                                    ) {
                                        const existingSlots = updatedSlide[modeKey][subKey].slots;
                                        let nextSlots = existingSlots;

                                        if (subKey === 'monthly' && Array.isArray(program.selectedSlots) && Array.isArray(updatedSlide[modeKey]?.monthly?.weeklyPattern)) {
                                            // Increment bookedCount per selected weeklyPattern time with caps
                                            const wp = [...(updatedSlide[modeKey].monthly.weeklyPattern || [])];
                                            const gMax = Number(updatedSlide[modeKey].monthly.groupMax || 0) || 0;
                                            program.selectedSlots.forEach(sel => {
                                                const r = Number(sel.rowIdx);
                                                const t = Number(sel.tIdx);
                                                const stype = (sel.type || 'individual');
                                                if (!isNaN(r) && !isNaN(t) && wp[r] && Array.isArray(wp[r].times) && wp[r].times[t]) {
                                                    const ti = { ...(wp[r].times[t] || {}) };
                                                    let cap = 1;
                                                    if (stype === 'couple') cap = 2;
                                                    if (stype === 'group') cap = gMax > 0 ? gMax : 0;
                                                    const current = Number(ti.bookedCount || 0);
                                                    const next = (cap > 0) ? Math.min(cap, current + 1) : current + 1;
                                                    ti.bookedCount = next;
                                                    wp[r].times[t] = ti;
                                                }
                                            });
                                            updatedSlide[modeKey].monthly.weeklyPattern = wp;

                                        } else if (program.date && program.slot && (program.slot.startTime || program.slot.start_time)) {
                                            // Capacity-based reservation for non-monthly (e.g., one-time)
                                            const sStart = program.slot.startTime || program.slot.start_time;
                                            const sEnd = program.slot.endTime || program.slot.end_time;
                                            // Key to track bookings per slot
                                            const sbKey = `${program.date}|${sStart}|${sEnd}`;
                                            const currentBookings = (updatedSlide[modeKey][subKey].slotBookings && typeof updatedSlide[modeKey][subKey].slotBookings === 'object')
                                                ? updatedSlide[modeKey][subKey].slotBookings
                                                : {};
                                            const currentLocks = (updatedSlide[modeKey][subKey].slotLocks && typeof updatedSlide[modeKey][subKey].slotLocks === 'object')
                                                ? updatedSlide[modeKey][subKey].slotLocks
                                                : {};
                                            const prevCount = Number(currentBookings[sbKey] || 0);
                                            // Each successful payment counts as ONE booking towards capacity
                                            const bookingIncrement = 1;
                                            // Determine capacity per slot from occupancyType and guide config
                                            let maxPerSlot = 2; // default couples capacity
                                            const occType = (program.occupancyType || '').toString().toLowerCase();
                                            try {
                                                const occs = (updatedSlide?.guideCard?.occupancies || []).map(o => ({
                                                    type: (o?.type || '').toString().toLowerCase(),
                                                    max: Number(o?.max || 0)
                                                }));
                                                if (occType) {
                                                    const match = occs.find(o => o.type === occType);
                                                    if (match && match.max > 0) {
                                                        maxPerSlot = match.max;
                                                    } else if (occType.includes('individual')) {
                                                        maxPerSlot = 1;
                                                    } else if (occType.includes('couple') || occType.includes('twin')) {
                                                        maxPerSlot = 2;
                                                    }
                                                }
                                            } catch (e) {
                                                console.log('capacity detection failed, using default 2:', e?.message);
                                            }
                                            const newCount = Math.min(maxPerSlot, prevCount + bookingIncrement);
                                            // Record lock on first booking if none exists
                                            const existingLock = currentLocks[sbKey];
                                            if (!existingLock && occType) {
                                                currentLocks[sbKey] = occType;
                                            }
                                            // Do NOT remove slots from Firestore; keep the slots array unchanged.
        	                                // Frontend will use slotBookings and slotLocks to disable or hide full slots.
                                            nextSlots = existingSlots;

                                            updatedSlide[modeKey][subKey] = {
                                                ...updatedSlide[modeKey][subKey],
                                                slotBookings: { ...currentBookings, [sbKey]: newCount },
                                                slotLocks: { ...currentLocks }
                                            };
                                        }

                                        // Apply filtered slots back
                                        updatedSlide[modeKey][subKey] = {
                                            ...updatedSlide[modeKey][subKey],
                                            slots: nextSlots,
                                            // slotBookings retained if set above
                                        };
                                    }
                                } catch (slotErr) {
                                    console.error('Error updating guide slots after reservation:', slotErr);
                                }

                                return updatedSlide;
                            }
                            return slide;
                        });
                        updateData = { slides: updatedSlides };
                    } else {
                        console.log("Guide not found");
                    }
                } else if (
                    program.type == "retreat" ||
                    program.category == "retreat" ||
                    // Check if it's a retreat by checking if it has an id (retreats use numbered ids)
                    (program.id && !program.type && !program.category)
                ) {
                    console.log("Processing retreat purchase for:", program.title);
                    programRef = db
                        .collection("pilgrim_retreat")
                        .doc("user-uid")
                        .collection("retreats")
                        .doc("data");
                    const retreatSnap = await programRef.get();
                    if (retreatSnap.exists) {
                        const retreatData = retreatSnap.data();
                        const updatedData = { ...retreatData };
                        console.log("RetreatData from backend: ", retreatData)
                        
                        // Find and update the matching retreat by iterating through numbered keys
                        let retreatFound = false;
                        Object.keys(retreatData).forEach((key) => {
                            const retreat = retreatData[key];
                            console.log("Retreat from backend: ", retreat)
                            if (retreat?.pilgrimRetreatCard?.title === program.title) {
                                console.log("Found matching retreat, updating purchasedUsers");
                                updatedData[key] = {
                                    ...retreat,
                                    purchasedUsers: [
                                        ...(retreat.purchasedUsers || []),
                                        {
                                            uid: userId,
                                            name,
                                            email,
                                            purchasedAt:
                                                new Date().toISOString(),
                                            paymentId:
                                                paymentResponse.razorpay_payment_id,
                                            orderId:
                                                paymentResponse.razorpay_order_id,
                                            ...formData,
                                        },
                                    ],
                                };
                                retreatFound = true;
                            }
                        });
                        
                        if (retreatFound) {
                            updateData = updatedData;
                            console.log("UpdateData for retreat: ", updateData);
                        } else {
                            console.log("No matching retreat found for title: ", program.title);
                        }
                    }
                } else if (
                    program.type == "live" ||
                    program.category == "live"
                ) {
                    programRef = db
                        .collection("pilgrim_sessions")
                        .doc("pilgrim_sessions")
                        .collection("sessions")
                        .doc("liveSession");
                    const liveSnap = await programRef.get();
                    if (liveSnap.exists) {
                        const slides = liveSnap.data().slides || [];
                        const updatedSlides = slides.map((slide) => {
                            if (
                                slide?.liveSessionCard?.title === program.title
                            ) {
                                return {
                                    ...slide,
                                    purchasedUsers: [
                                        ...(slide.purchasedUsers || []),
                                        {
                                            uid: userId,
                                            name,
                                            email,
                                            purchasedAt:
                                                new Date().toISOString(),
                                            paymentId:
                                                paymentResponse.razorpay_payment_id,
                                            orderId:
                                                paymentResponse.razorpay_order_id,
                                            ...formData,
                                        },
                                    ],
                                };
                            }
                            return slide;
                        });
                        updateData = { slides: updatedSlides };
                    }
                } else if (
                    program.type == "recorded" ||
                    program.category == "recorded"
                ) {
                    programRef = db
                        .collection("pilgrim_sessions")
                        .doc("pilgrim_sessions")
                        .collection("sessions")
                        .doc("recordedSession");
                    const recordedSnap = await programRef.get();
                    if (recordedSnap.exists) {
                        const slides = recordedSnap.data().slides || [];
                        const updatedSlides = slides.map((slide) => {
                            if (
                                slide?.recordedProgramCard?.title ===
                                program.title
                            ) {
                                return {
                                    ...slide,
                                    purchasedUsers: [
                                        ...(slide.purchasedUsers || []),
                                        {
                                            uid: userId,
                                            name,
                                            email,
                                            purchasedAt:
                                                new Date().toISOString(),
                                            paymentId:
                                                paymentResponse.razorpay_payment_id,
                                            orderId:
                                                paymentResponse.razorpay_order_id,
                                            ...formData,
                                        },
                                    ],
                                };
                            }
                            return slide;
                        });
                        updateData = { slides: updatedSlides };
                    }
                }

                if (programRef && Object.keys(updateData).length > 0) {
                    await programRef.update(updateData);
                    console.log(
                        `Updated ${program.type || program.category} program: ${
                            program.title
                        }`
                    );
                }
            } catch (err) {
                console.error(`Error updating program ${program.title}:`, err);
            }
        }

        // ------------------------
        // 3) Send Emails
        // ------------------------
        const programList = cartData
            .map((p) => `${p.title} (₹${p.price} x${p.quantity})`)
            .join(", ");

        // Email to user
        await transporter.sendMail({
            from: gmailEmail,
            to: email,
            subject: "Purchase Confirmed - Urban Pilgrim",
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Purchase Confirmation</title>
                </head>
                <body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f4f4f4;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                        <!-- Header -->
                        <div style="background: linear-gradient(135deg, #2F6288 0%, #C5703F 100%); padding: 30px 20px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">Urban Pilgrim</h1>
                            <p style="color: #ffffff; margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">Your Spiritual Journey Begins</p>
                        </div>
                        
                        <!-- Content -->
                        <div style="padding: 20px 30px 40px;">
                            <h2 style="color: #2F6288; text-align: center; margin: 20px 0; font-size: 24px;">Purchase Confirmed!</h2>
                            <p style="color: #666; text-align: center; margin: 0 0 30px 0; font-size: 16px;">Hi ${name}, thank you for choosing Urban Pilgrim for your spiritual journey.</p>
                            
                            <!-- Purchase Details -->
                            <div style="background: #f8f9fa; border-radius: 12px; padding: 25px; margin: 25px 0;">
                                <h3 style="color: #2F6288; margin: 0 0 15px 0; font-size: 18px;">📋 Purchase Details</h3>
                                <div style="border-left: 4px solid #C5703F; padding-left: 15px; margin: 15px 0;">
                                    <p style="color: #333; margin: 0; font-size: 15px; line-height: 1.6;">${programList}</p>
                                </div>
                                
                                <div style="border-top: 1px solid #eee; padding-top: 15px; margin-top: 20px;">
                                    <div style="display: flex; justify-content: space-between; margin: 8px 0;">
                                        <span style="color: #666; font-size: 14px;">Total Amount:</span>
                                        <span style="color: #2F6288; font-weight: bold; font-size: 18px;">₹${total}</span>
                                    </div>
                                    <div style="display: flex; justify-content: space-between; margin: 8px 0;">
                                        <span style="color: #666; font-size: 14px;">Payment ID:</span>
                                        <span style="color: #666; font-size: 14px; font-family: monospace;">${paymentResponse.razorpay_payment_id}</span>
                                    </div>
                                    <div style="display: flex; justify-content: space-between; margin: 8px 0;">
                                        <span style="color: #666; font-size: 14px;">Purchase Date:</span>
                                        <span style="color: #666; font-size: 14px;">${new Date().toLocaleDateString('en-IN')}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Next Steps -->
                            <div style="background: linear-gradient(135deg, #2F6288, #C5703F); border-radius: 12px; padding: 20px; margin: 25px 0; text-align: center;">
                                <h3 style="color: #ffffff; margin: 0 0 10px 0; font-size: 18px;">🚀 What's Next?</h3>
                                <p style="color: #ffffff; margin: 0; opacity: 0.9; font-size: 14px;">You'll receive separate emails with session details and calendar invites for your programs.</p>
                            </div>
                            
                            <div style="text-align: center; margin: 30px 0;">
                                <p style="color: #666; margin: 0; font-size: 14px;">Need help? Contact us at <a href="mailto:urbanpilgrim25@gmail.com" style="color: #C5703F;">urbanpilgrim25@gmail.com</a></p>
                            </div>
                        </div>
                        
                        <!-- Footer -->
                        <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
                            <p style="color: #999; margin: 0; font-size: 12px;">© 2024 Urban Pilgrim. All rights reserved.</p>
                            <p style="color: #999; margin: 5px 0 0 0; font-size: 12px;">Thank you for being part of our spiritual community.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
        });

        // Email to admin
        await transporter.sendMail({
            from: gmailEmail,
            to: adminEmail,
            subject: "New Purchase Alert - Urban Pilgrim",
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>New Purchase Alert</title>
                </head>
                <body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f4f4f4;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                        <!-- Header -->
                        <div style="background: linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%); padding: 25px 20px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold;">New Purchase Alert</h1>
                            <p style="color: #ffffff; margin: 10px 0 0 0; opacity: 0.9; font-size: 14px;">Urban Pilgrim Admin Dashboard</p>
                        </div>
                        
                        <!-- Content -->
                        <div style="padding: 30px;">
                            <div style="background: #f8f9fa; border-left: 4px solid #4CAF50; padding: 20px; margin: 20px 0; border-radius: 8px;">
                                <h3 style="color: #2E7D32; margin: 0 0 15px 0; font-size: 18px;">Customer Information</h3>
                                <p style="color: #333; margin: 5px 0; font-size: 15px;"><strong>Name:</strong> ${name}</p>
                                <p style="color: #333; margin: 5px 0; font-size: 15px;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #4CAF50;">${email}</a></p>
                            </div>
                            
                            <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 20px 0; border-radius: 8px;">
                                <h3 style="color: #856404; margin: 0 0 15px 0; font-size: 18px;">Purchase Details</h3>
                                <p style="color: #333; margin: 10px 0; font-size: 15px; line-height: 1.6;">${programList}</p>
                                <div style="border-top: 1px solid #ffeaa7; padding-top: 15px; margin-top: 15px;">
                                    <p style="color: #333; margin: 5px 0; font-size: 16px;"><strong>Total Amount: ₹${total}</strong></p>
                                    <p style="color: #666; margin: 5px 0; font-size: 14px;">Payment ID: <code style="background: #f1f1f1; padding: 2px 6px; border-radius: 4px;">${paymentResponse.razorpay_payment_id}</code></p>
                                    <p style="color: #666; margin: 5px 0; font-size: 14px;">Date: ${new Date().toLocaleString('en-IN')}</p>
                                </div>
                            </div>
                            
                            <div style="text-align: center; margin: 25px 0;">
                                <p style="color: #666; margin: 0; font-size: 14px;">Please follow up with the customer for session scheduling if required.</p>
                            </div>
                        </div>
                        
                        <!-- Footer -->
                        <div style="background: #f8f9fa; padding: 15px; text-align: center; border-top: 1px solid #eee;">
                            <p style="color: #999; margin: 0; font-size: 12px;">Urban Pilgrim Admin Notification System</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
        });

        // ------------------------
        // 4) Google Calendar for live sessions
        // ------------------------
        const oAuth2Client = new OAuth2Client(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI
        );

        oAuth2Client.setCredentials({
            refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
        });

        const calendar = google.calendar({ version: "v3", auth: oAuth2Client });
        const organizerCalendar = adminEmail; // urbanpilgrim25@gmail.com
        console.log("cart Data:", cartData);

        for (const program of cartData) {
            console.log("program type: ", program.type || program.category)
            if (
                (program.type === "live" || program.category === "live") &&
                program.slots?.length
            ) {
                for (const slot of program.slots) {
                    const startDateTime = new Date(
                        `${slot.date}T${slot.startTime}:00`
                    );
                    const endDateTime = new Date(
                        `${slot.date}T${slot.endTime}:00`
                    );

                    console.log("organizer data:", program);
                    const event = {
                        summary: program.title,
                        description: `Live session booking for ${program.title}
                                        Persons: ${program.persons}
                                        Join here: ${program?.organizer?.googleMeetLink}`,
                        location: program?.organizer?.googleMeetLink,
                        start: {
                            dateTime: startDateTime.toISOString(),
                            timeZone: "Asia/Kolkata",
                        },
                        end: {
                            dateTime: endDateTime.toISOString(),
                            timeZone: "Asia/Kolkata",
                        },
                        attendees: [
                            { email },
                            { email: adminEmail },
                            { email: program?.organizer?.email },
                        ],
                    };

                    const createdEvent = await calendar.events.insert({
                        calendarId: organizerCalendar,
                        resource: event,
                        sendUpdates: "all",
                    });

                    // const meetLink = createdEvent.data.conferenceData?.entryPoints?.[0]?.uri;
                    const meetLink = program?.organizer?.googleMeetLink;
                    console.log("Google Meet Link:", meetLink);

                    const mailHtml = `
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <meta charset="utf-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>Live Session Booking</title>
                        </head>
                        <body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f4f4f4;">
                            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                                <!-- Header -->
                                <div style="background: linear-gradient(135deg, #2F6288 0%, #C5703F 100%); padding: 25px 20px; text-align: center;">
                                    <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold;">Live Session Confirmed</h1>
                                    <p style="color: #ffffff; margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">${program.title}</p>
                                </div>
                                
                                <!-- Content -->
                                <div style="padding: 30px;">
                                    <div style="background: #f8f9fa; border-radius: 12px; padding: 25px; margin: 20px 0;">
                                        <div style="margin: 15px 0;">
                                            <span style="color: #666; font-size: 14px; display: block; margin-bottom: 5px;">Date</span>
                                            <span style="color: #333; font-size: 16px; font-weight: bold;">${slot.date}</span>
                                        </div>
                                        <div style="margin: 15px 0;">
                                            <span style="color: #666; font-size: 14px; display: block; margin-bottom: 5px;">Time</span>
                                            <span style="color: #333; font-size: 16px; font-weight: bold;">${slot.startTime} - ${slot.endTime}</span>
                                        </div>
                                        <div style="margin: 15px 0;">
                                            <span style="color: #666; font-size: 14px; display: block; margin-bottom: 5px;">Participants</span>
                                            <span style="color: #333; font-size: 16px; font-weight: bold;">${program.persons}</span>
                                        </div>
                                        <div style="margin: 15px 0;">
                                            <span style="color: #666; font-size: 14px; display: block; margin-bottom: 5px;">🔗 Meeting Link</span>
                                            <a href="${meetLink}" target="_blank" style="color: #C5703F; font-size: 16px; font-weight: bold; text-decoration: none;">${meetLink}</a>
                                        </div>
                                    </div>
                                    
                                    <div style="background: linear-gradient(135deg, #2F6288, #C5703F); border-radius: 12px; padding: 20px; margin: 25px 0; text-align: center;">
                                        <p style="color: #ffffff; margin: 0; font-size: 14px;">Calendar invite has been sent to all participants</p>
                                    </div>
                                </div>
                                
                                <!-- Footer -->
                                <div style="background: #f8f9fa; padding: 15px; text-align: center; border-top: 1px solid #eee;">
                                    <p style="color: #999; margin: 0; font-size: 12px;">Urban Pilgrim Live Sessions</p>
                                </div>
                            </div>
                        </body>
                        </html>
                    `;

                    // Mail send to admin
                    await transporter.sendMail({
                        from: gmailEmail,
                        to: adminEmail,
                        subject: `🎯 Live Session Booked - ${program.title}`,
                        html: mailHtml,
                    });
                }
                console.log("All live session events created successfully");
            }

            // ------------------------
            // 5) Google Calendar for guide sessions
            // ------------------------
            if (
                (program.type === "guide" || program.category === "guide") &&
                program.slot && program.date
            ) {
                // Build local datetime strings and validate range
                const durationMin = Number(program?.slot?.duration || program?.duration || 60);
                const startLocal = `${program.date}T${program.slot.time}:00`;
                let endLocal = `${program.date}T${program.slot.endTime || program.slot.time}:00`;

                const toMs = (s) => new Date(s).getTime();
                if (!program.slot.endTime || toMs(endLocal) <= toMs(startLocal)) {
                    const endMs = toMs(startLocal) + durationMin * 60 * 1000;
                    const endIso = new Date(endMs).toISOString();
                    endLocal = endIso.slice(0, 19); // YYYY-MM-DDTHH:MM:SS
                }

                const guideEvent = {
                    summary: `Guide Session: ${program.title}`,
                    description: `Guide session booking for ${program.title}
                                        Mode: ${program.mode}
                                        Subscription: ${program.subscriptionType}
                                        Duration: ${durationMin} minutes
                                        Join here: ${program?.organizer?.googleMeetLink}`,
                    location: program.mode === 'Offline' ? 'In-person Session' : program?.organizer?.googleMeetLink,
                    start: { dateTime: startLocal, timeZone: "Asia/Kolkata" },
                    end:   { dateTime: endLocal,   timeZone: "Asia/Kolkata" },
                    attendees: [
                        { email },
                        { email: adminEmail },
                        { email: program?.organizer?.email },
                    ],
                };

                // Define meet link for emails
                const meetLink = program?.organizer?.googleMeetLink;

                // Insert calendar event only for Online mode; do not block on failure
                if (calendar) {
                    try {
                        await calendar.events.insert({
                            calendarId: organizerCalendar,
                            resource: guideEvent,
                            sendUpdates: "all",
                        });
                    } catch (e) {
                        console.warn('Guide calendar insert failed:', e?.message || e);
                    }
                }

                const guideMailHtml = `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="utf-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Guide Session Booking</title>
                    </head>
                    <body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f4f4f4;">
                        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                            <!-- Header -->
                            <div style="background: linear-gradient(135deg, #2F6288 0%, #C5703F 100%); padding: 25px 20px; text-align: center;">
                                <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold;">Guide Session Booked</h1>
                                <p style="color: #ffffff; margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">${program.title}</p>
                            </div>
                            
                            <!-- Customer Info -->
                            <div style="background: #e3f2fd; padding: 20px; margin: 0;">
                                <h3 style="color: #1976d2; margin: 0 0 10px 0; font-size: 16px;">Customer Information</h3>
                                <p style="color: #333; margin: 5px 0; font-size: 14px;"><strong>Name:</strong> ${name}</p>
                                <p style="color: #333; margin: 5px 0; font-size: 14px;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #1976d2;">${email}</a></p>
                            </div>
                            
                            <!-- Content -->
                            <div style="padding: 30px;">
                                <div style="background: #f8f9fa; border-radius: 12px; padding: 25px; margin: 20px 0;">
                                    <div style="margin: 15px 0;">
                                        <span style="color: #666; font-size: 14px; display: block; margin-bottom: 5px;">Date</span>
                                        <span style="color: #333; font-size: 16px; font-weight: bold;">${program.date}</span>
                                    </div>
                                    <div style="margin: 15px 0;">
                                        <span style="color: #666; font-size: 14px; display: block; margin-bottom: 5px;">Time</span>
                                        <span style="color: #333; font-size: 16px; font-weight: bold;">${program.slot.time}${program.slot.endTime ? ` - ${program.slot.endTime}` : ' (1 hour)'}</span>
                                    </div>
                                    <div style="margin: 15px 0;">
                                        <span style="color: #666; font-size: 14px; display: block; margin-bottom: 5px;">Mode</span>
                                        <span style="color: #333; font-size: 16px; font-weight: bold;">${program.mode}</span>
                                    </div>
                                    <div style="margin: 15px 0;">
                                        <span style="color: #666; font-size: 14px; display: block; margin-bottom: 5px;">Subscription</span>
                                        <span style="color: #333; font-size: 16px; font-weight: bold;">${program.subscriptionType}</span>
                                    </div>
                                    <div style="margin: 15px 0;">
                                        <span style="color: #666; font-size: 14px; display: block; margin-bottom: 5px;"> Duration</span>
                                        <span style="color: #333; font-size: 16px; font-weight: bold;">${program.slot.duration || 60} minutes</span>
                                    </div>
                                    ${program.mode === 'Online' ? 
                                        `<div style="margin: 15px 0;">
                                            <span style="color: #666; font-size: 14px; display: block; margin-bottom: 5px;">🔗 Meeting Link</span>
                                            <a href="${meetLink}" target="_blank" style="color: #C5703F; font-size: 16px; font-weight: bold; text-decoration: none;">${meetLink}</a>
                                        </div>` :
                                        `<div style="margin: 15px 0;">
                                            <span style="color: #666; font-size: 14px; display: block; margin-bottom: 5px;">Location</span>
                                            <span style="color: #333; font-size: 16px; font-weight: bold;">${program.slot.location || 'In-person session'}</span>
                                        </div>`
                                    }
                                </div>
                                
                                <div style="background: linear-gradient(135deg, #2F6288, #C5703F); border-radius: 12px; padding: 20px; margin: 25px 0; text-align: center;">
                                    <p style="color: #ffffff; margin: 0; font-size: 14px;">Calendar invite has been sent to all participants</p>
                                </div>
                            </div>
                            
                            <!-- Footer -->
                            <div style="background: #f8f9fa; padding: 15px; text-align: center; border-top: 1px solid #eee;">
                                <p style="color: #999; margin: 0; font-size: 12px;">Urban Pilgrim Guide Sessions</p>
                            </div>
                        </div>
                    </body>
                    </html>
                `;

                // Mail to admin
                await transporter.sendMail({
                    from: gmailEmail,
                    to: adminEmail,
                    subject: `🧘‍♀️ Guide Session Booked - ${program.title}`,
                    html: guideMailHtml,
                });

                console.log("Guide session emails sent successfully");
            }
        }

        return { 
            success: true, 
            message: "Payment confirmed",
            programsWithExpiration: cartData.filter(item => item.expirationDate).length,
            totalPrograms: cartData.length
        };
    } catch (error) {
        console.error("confirmPayment Error:", error);
        return { status: "error", message: error.message };
    }
});

// Subscription Cleanup Functions
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { onRequest } = require("firebase-functions/v2/https");


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
exports.checkUserSubscriptionStatus = functions.https.onCall(async (data, context) => {
    try {
        const { uid } = context.auth;
        if (!uid) {
            throw new functions.https.HttpsError(
                "unauthenticated",
                "User not authenticated"
            );
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
        throw new functions.https.HttpsError(
            "internal",
            "Failed to check subscription status"
        );
    }
});

// Gift Card: Create order (separate entry-point)
exports.createGiftCardOrder = functions.https.onCall(async (data, context) => {
    console.log("data from createGiftCardOrder", data.data);
    const { amount } = data.data || {};
    if (!amount || amount <= 0) {
        throw new functions.https.HttpsError("invalid-argument", "Valid amount required");
    }
    const options = {
        amount: amount * 100,
        currency: "INR",
        receipt: `gift_${Date.now()}`,
        notes: { type: "gift_card" }
    };
    try {
        const order = await razorpay.orders.create(options);
        return order;
    } catch (err) {
        throw new functions.https.HttpsError("internal", err.message);
    }
});

// Helper to generate uppercase coupon code
function generateCouponCode(len = 10) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let out = '';
    for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
    return out;
}

// Gift Card: Confirm payment, generate one-time coupon bound to a program, and email it
exports.confirmGiftCardPayment = functions.https.onCall(async (data, context) => {
    try {
        const { purchaserEmail, purchaserName, programTitle, programType, programId, amount, paymentResponse } = data.data || {};
        if (!purchaserEmail || !amount || !paymentResponse) {
            throw new functions.https.HttpsError("invalid-argument", "Missing required fields");
        }

        // Generate unique code (retry small number of times if collision)
        const couponsRef = db.collection('coupons');
        let code = generateCouponCode(10);
        for (let i = 0; i < 3; i++) {
            const exists = await couponsRef.where('code', '==', code).limit(1).get();
            if (exists.empty) break;
            code = generateCouponCode(10);
        }

        const couponDoc = {
            code,
            discountType: 'fixed',
            discountValue: amount,
            programType: programType || 'any',
            // Restrict to a specific program by title/id if provided
            restrictToProgram: {
                id: programId || null,
                title: programTitle || null,
            },
            minOrderAmount: 0,
            maxDiscount: amount,
            usageLimit: 1,
            usedCount: 0,
            isActive: true,
            isGiftCard: true,
            description: `Gift card for ${programTitle || 'Urban Pilgrim program'}`,
            createdAt: new Date(),
            updatedAt: new Date(),
            lastUsedAt: null,
            lastUsedBy: null,
        };

        await couponsRef.add(couponDoc);

        // Email code to purchaser
        const html = `
            <div style="font-family: Arial, sans-serif; line-height:1.6;">
                <h2 style="color:#2F6288;">Your Urban Pilgrim Gift Card</h2>
                <p>Hi ${purchaserName || 'Pilgrim'},</p>
                <p>Thank you for your purchase. Here is your one-time gift coupon code:</p>
                <div style="border:2px dashed #C5703F; padding:16px; border-radius:8px; display:inline-block; font-weight:bold; font-size:20px; letter-spacing:2px;">${code}</div>
                <p style="margin-top:12px;">Value: <strong>₹${amount}</strong></p>
                ${programTitle ? `<p>Applicable Program: <strong>${programTitle}</strong></p>` : ''}
                <p>You can apply this code in the cart's coupon field. This code can be used only once.</p>
            </div>
        `;
        await transporter.sendMail({
            from: gmailEmail,
            to: purchaserEmail,
            subject: 'Your Urban Pilgrim Gift Card',
            html
        });

        return { success: true, code };
    } catch (err) {
        console.error('confirmGiftCardPayment error:', err);
        throw new functions.https.HttpsError('internal', err.message);
    }
});


// twilio for whatsapp
exports.sendWhatsappReminder = functions.https.onCall(async (data, context) => {
    try {
        const { phoneNumber, message } = data.data;
  
        const res = await client.messages.create({
            from: "whatsapp:+14155238886", // Twilio sandbox/approved number
            to: `whatsapp:${phoneNumber}`, // User's phone e.g. +9198XXXXXXX
            body: message,
        });

        return { success: true, sid: res.sid };
    } catch (error) {
        console.error("Error sending WhatsApp message:", error);
        return { success: false, error: error.message };
    }
});

  