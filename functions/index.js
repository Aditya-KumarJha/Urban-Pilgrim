// functions/index.js
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
const Razorpay = require("razorpay");

const { google } = require("googleapis");
const { OAuth2Client } = require("google-auth-library");
require("dotenv").config();

const cors = require("cors")({ origin: true });

admin.initializeApp();
const db = admin.firestore();

const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);
const gmailEmail = process.env.APP_GMAIL;
const gmailPassword = process.env.APP_GMAIL_PASSWORD;

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
                        <p style="color: #999; margin: 0; font-size: 12px;">© 2024 Urban Pilgrim. All rights reserved.</p>
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
        to: gmailEmail,
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
        return { success: true, message: "Email sent!" }; // ✅ return directly
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
        const { userId, email, name, cartData, total, paymentResponse, formData, } = data.data;

        const adminEmail = "urbanpilgrim25@gmail.com";

        // ------------------------
        // 1) Save purchase in user's Firestore
        // ------------------------
        const userRef = db
            .collection("users")
            .doc(userId)
            .collection("info")
            .doc("details");
        await userRef.set(
            {
                yourPrograms: admin.firestore.FieldValue.arrayUnion(
                    ...cartData.map((item) => ({
                        ...item,
                        purchasedAt: new Date().toISOString(),
                        paymentId: paymentResponse.razorpay_payment_id,
                        orderId: paymentResponse.razorpay_order_id,
                    }))
                ),
            },
            { merge: true }
        );

        // ------------------------
        // 2) Update each program document
        // ------------------------
        for (const program of cartData) {
            try {
                let programRef;
                let updateData = {};

                if (program.type === "guide" || program.category === "guide") {
                    programRef = db
                        .collection("pilgrim_guides")
                        .doc("pilgrim_guides")
                        .collection("guides")
                        .doc("data");
                    const guideSnap = await programRef.get();
                    if (guideSnap.exists) {
                        const guides = guideSnap.data().slides || [];
                        const updatedGuides = guides.map((guide) => {
                            if (guide?.title === program.title) {
                                return {
                                    ...guide,
                                    purchasedUsers: [
                                        ...(guide.purchasedUsers || []),
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
                                            slot: program.slot,
                                            date: program.date,
                                            mode: program.mode,
                                            subscriptionType: program.subscriptionType,
                                            ...formData,
                                        },
                                    ],
                                };
                            }
                            return guide;
                        });
                        updateData = { guides: updatedGuides };
                    }
                } else if (
                    program.type === "retreat" ||
                    program.category === "retreat"
                ) {
                    programRef = db
                        .collection("pilgrim_retreat")
                        .doc("user-uid")
                        .collection("retreats")
                        .doc("data");
                    const retreatSnap = await programRef.get();
                    if (retreatSnap.exists) {
                        const retreatData = retreatSnap.data();
                        const updatedData = { ...retreatData };
                        
                        // Find and update the matching retreat by iterating through numbered keys
                        Object.keys(retreatData).forEach((key) => {
                            const retreat = retreatData[key];
                            if (retreat?.pilgrimRetreatCard?.title === program.title) {
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
                            }
                        });
                        updateData = updatedData;
                    }
                } else if (
                    program.type === "live" ||
                    program.category === "live"
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
                    program.type === "recorded" ||
                    program.category === "recorded"
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
                const startDateTime = new Date(
                    `${program.date}T${program.slot.time}:00`
                );
                const endDateTime = new Date(
                    `${program.date}T${program.slot.endTime || program.slot.time}:00`
                );
                
                // Add 1 hour if no end time specified
                if (!program.slot.endTime) {
                    endDateTime.setHours(endDateTime.getHours() + 1);
                }

                // console.log("Guide organizer data:", program);
                const event = {
                    summary: `Guide Session: ${program.title}`,
                    description: `Guide session booking for ${program.title}
                                    Mode: ${program.mode}
                                    Subscription: ${program.subscriptionType}
                                    Duration: ${program.slot.duration || 60} minutes
                                    Join here: ${program?.organizer?.googleMeetLink || 'TBD'}`,
                    location: program.mode === 'Online' ? 
                        (program?.organizer?.googleMeetLink || 'Online Session') : 
                        (program.slot.location || 'In-person Session'),
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
                        { email: program?.organizer?.email || adminEmail },
                    ],
                };

                const createdEvent = await calendar.events.insert({
                    calendarId: organizerCalendar,
                    resource: event,
                    sendUpdates: "all",
                });

                console.log(
                    "Created Google Calendar event for guide:",
                    createdEvent.data
                );

                const meetLink = program?.organizer?.googleMeetLink || 'TBD';
                console.log("Guide Meet Link:", meetLink);

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
            status: "success",
            message: "Payment confirmed and booking saved",
        };
    } catch (error) {
        console.error("confirmPayment Error:", error);
        return { status: "error", message: error.message };
    }
});
