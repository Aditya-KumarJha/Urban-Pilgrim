// functions/index.js
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
const Razorpay = require("razorpay");
const express = require("express");

const { google } = require("googleapis");
const { OAuth2Client } = require("google-auth-library");
require("dotenv").config();

const cors = require("cors")({ origin: true });

// Import routes
const slotsRoutes = require("./routes/slots");

admin.initializeApp();
const db = admin.firestore();

const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);
const gmailEmail = "nabinagrawal64@gmail.com";
const gmailPassword = "ehhhfqgdjkqsykuv";

const razorpay = new Razorpay({
    key_id: "rzp_test_5Qxb0fQ1nBKqtZ",
    key_secret: "P5jUmWpLEhbO6xwedDb55jZr",
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
        from: "nabinagrawal64@gmail.com",
        to: email,
        subject: "Your OTP Code",
        text: `Your OTP code is ${Otp}. It will expire in 5 minutes.`,
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
        const {
            userId,
            email,
            name,
            cartData,
            total,
            paymentResponse,
            formData,
        } = data.data;

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
                        const guides = guideSnap.data().guides || [];
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
                        .doc(userId)
                        .collection("retreats")
                        .doc("data");
                    const retreatSnap = await programRef.get();
                    if (retreatSnap.exists) {
                        const retreats = retreatSnap.data().retreats || [];
                        const updatedRetreats = retreats.map((retreat) => {
                            if (retreat?.title === program.title) {
                                return {
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
                            return retreat;
                        });
                        updateData = { retreats: updatedRetreats };
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
            subject: "Urban Pilgrim - Purchase Confirmation",
            html: `<h2>Hi ${name},</h2>
                <p>Thank you for your purchase. You bought:</p>
                <p><b>${programList}</b></p>
                <p>Total Paid: ₹${total}</p>
                <p>Payment ID: ${paymentResponse.razorpay_payment_id}</p>`,
        });

        // Email to admin
        await transporter.sendMail({
            from: gmailEmail,
            to: adminEmail,
            subject: "New Program Purchase - Urban Pilgrim",
            html: `<h3>New Purchase</h3>
                <p>User: ${name} (${email})</p>
                <p>Programs: ${programList}</p>
                <p>Total: ₹${total}</p>
                <p>Payment ID: ${paymentResponse.razorpay_payment_id}</p>`,
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

                    console.log(
                        "Created Google Calendar event:",
                        createdEvent.data
                    );

                    // const meetLink = createdEvent.data.conferenceData?.entryPoints?.[0]?.uri;
                    const meetLink = program?.organizer?.googleMeetLink;
                    console.log("Google Meet Link:", meetLink);

                    const mailHtml = `<h2>Booking Confirmed: ${program.title}</h2>
                            <p><b>Date:</b> ${slot.date}</p>
                            <p><b>Time:</b> ${slot.startTime} - ${slot.endTime}</p>
                            <p><b>Persons:</b> ${program.persons}</p>
                            <p><b>Google Meet Link:</b> <a href="${meetLink}" target="_blank">${meetLink}</a></p>`;

                    // Mail send to admin
                    await transporter.sendMail({
                        from: gmailEmail,
                        to: adminEmail,
                        subject: `A user is booked a live session - ${program.title}`,
                        html: mailHtml,
                    });
                }
                console.log("All events created successfully");
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

// Get available slots for a guide
exports.getGuideSlots = functions.https.onCall(async (data, context) => {
    try {
        const { guideId, mode, plan } = data;
        
        if (!guideId || !mode) {
            throw new functions.https.HttpsError(
                'invalid-argument',
                'Missing required parameters: guideId and mode'
            );
        }

        // Fetch slots from Firestore
        const slotsRef = db.collection('guide_slots')
            .where('guideId', '==', guideId)
            .where('mode', '==', mode.toLowerCase());
        
        const slotsSnapshot = await slotsRef.get();
        
        if (slotsSnapshot.empty) {
            return { slots: [] };
        }

        const slots = [];
        slotsSnapshot.forEach(doc => {
            const slotData = doc.data();
            slots.push({
                id: doc.id,
                ...slotData,
                // Convert Firestore timestamp to ISO string if needed
                date: slotData.date?.toDate?.() ? slotData.date.toDate().toISOString().split('T')[0] : slotData.date
            });
        });

        // Filter slots based on plan type if needed
        let filteredSlots = slots;
        if (plan) {
            filteredSlots = slots.filter(slot => 
                slot.availableForPlans?.includes(plan) || !slot.availableForPlans
            );
        }

        // Sort by date and time
        filteredSlots.sort((a, b) => {
            const dateA = new Date(`${a.date} ${a.time}`);
            const dateB = new Date(`${b.date} ${b.time}`);
            return dateA - dateB;
        });

        return { slots: filteredSlots };
    } catch (error) {
        console.error('Error fetching slots:', error);
        throw new functions.https.HttpsError('internal', 'Failed to fetch slots');
    }
});

// Book a guide slot
exports.bookGuideSlot = functions.https.onCall(async (data, context) => {
    try {
        const { 
            slotId, 
            guideId, 
            userId, 
            userDetails, 
            sessionData, 
            selectedPlan, 
            mode 
        } = data;

        if (!slotId || !guideId || !userDetails) {
            throw new functions.https.HttpsError(
                'invalid-argument',
                'Missing required booking information'
            );
        }

        // Start a transaction
        const batch = db.batch();

        // Update slot availability
        const slotRef = db.collection('guide_slots').doc(slotId);
        batch.update(slotRef, { 
            available: false,
            bookedBy: userId,
            bookedAt: new Date(),
            bookingDetails: {
                userDetails,
                selectedPlan,
                mode
            }
        });

        // Create booking record
        const bookingRef = db.collection('guide_bookings').doc();
        const bookingData = {
            id: bookingRef.id,
            slotId,
            guideId,
            userId,
            userDetails,
            sessionData,
            selectedPlan,
            mode,
            status: 'confirmed',
            createdAt: new Date(),
            updatedAt: new Date()
        };
        batch.set(bookingRef, bookingData);

        // Commit transaction
        await batch.commit();

        // Send confirmation emails
        await sendGuideBookingEmails(bookingData);

        return { 
            success: true, 
            bookingId: bookingRef.id,
            message: 'Booking confirmed successfully' 
        };
    } catch (error) {
        console.error('Error booking slot:', error);
        throw new functions.https.HttpsError('internal', 'Failed to book slot');
    }
});

// Send guide booking confirmation emails
async function sendGuideBookingEmails(bookingData) {
    try {
        const { 
            userDetails, 
            sessionData, 
            selectedPlan, 
            mode,
            slotId 
        } = bookingData;

        // Get slot details
        const slotDoc = await db.collection('guide_slots').doc(slotId).get();
        const slotData = slotDoc.data();

        // Get guide details
        const guideDoc = await db.collection('pilgrim_guides').doc(bookingData.guideId).get();
        const guideData = guideDoc.data();

        const emailData = {
            // User details
            userName: userDetails.name,
            userEmail: userDetails.email,
            userPhone: userDetails.phone,
            
            // Session details
            sessionTitle: sessionData?.session?.title || 'Guide Session',
            sessionDescription: sessionData?.session?.sessiondescription || '',
            guideName: guideData?.session?.title || 'Guide',
            
            // Booking details
            planType: selectedPlan,
            mode: mode,
            date: slotData?.date,
            time: slotData?.time,
            duration: slotData?.duration || 60,
            timezone: 'Asia/Calcutta',
            
            // Booking metadata
            bookingId: bookingData.id,
            bookingDate: new Date().toLocaleDateString('en-IN'),
            bookingTime: new Date().toLocaleTimeString('en-IN')
        };

        const adminEmail = "urbanpilgrim25@gmail.com";

        // Send email to user
        await transporter.sendMail({
            from: gmailEmail,
            to: userDetails.email,
            subject: `Booking Confirmation - ${emailData.sessionTitle}`,
            html: generateGuideBookingEmail('user', emailData)
        });

        // Send email to organizer/guide (if email exists)
        if (guideData?.organizer?.email) {
            await transporter.sendMail({
                from: gmailEmail,
                to: guideData.organizer.email,
                subject: `New Booking - ${emailData.sessionTitle}`,
                html: generateGuideBookingEmail('organizer', emailData)
            });
        }

        // Send email to admin
        await transporter.sendMail({
            from: gmailEmail,
            to: adminEmail,
            subject: `New Guide Booking - ${emailData.sessionTitle}`,
            html: generateGuideBookingEmail('admin', emailData)
        });

        console.log('Guide booking confirmation emails sent successfully');
    } catch (error) {
        console.error('Error sending guide booking emails:', error);
        // Don't throw error as booking is already confirmed
    }
}

// Generate email content for guide bookings
function generateGuideBookingEmail(type, data) {
    switch (type) {
        case 'user':
            return `
                <h2>Booking Confirmation</h2>
                <p>Dear ${data.userName},</p>
                <p>Your booking has been confirmed for <strong>${data.sessionTitle}</strong></p>
                
                <h3>Booking Details:</h3>
                <ul>
                    <li><strong>Session:</strong> ${data.sessionTitle}</li>
                    <li><strong>Guide:</strong> ${data.guideName}</li>
                    <li><strong>Mode:</strong> ${data.mode}</li>
                    <li><strong>Plan:</strong> ${data.planType}</li>
                    <li><strong>Date:</strong> ${data.date}</li>
                    <li><strong>Time:</strong> ${data.time}</li>
                    <li><strong>Duration:</strong> ${data.duration} minutes</li>
                    <li><strong>Timezone:</strong> ${data.timezone}</li>
                    <li><strong>Booking ID:</strong> ${data.bookingId}</li>
                </ul>
                
                <p>We look forward to your session!</p>
                <p>Best regards,<br>Urban Pilgrim Team</p>
            `;
            
        case 'organizer':
            return `
                <h2>New Booking Notification</h2>
                <p>You have received a new booking for <strong>${data.sessionTitle}</strong></p>
                
                <h3>Booking Details:</h3>
                <ul>
                    <li><strong>Student:</strong> ${data.userName}</li>
                    <li><strong>Email:</strong> ${data.userEmail}</li>
                    <li><strong>Phone:</strong> ${data.userPhone}</li>
                    <li><strong>Mode:</strong> ${data.mode}</li>
                    <li><strong>Plan:</strong> ${data.planType}</li>
                    <li><strong>Date:</strong> ${data.date}</li>
                    <li><strong>Time:</strong> ${data.time}</li>
                    <li><strong>Duration:</strong> ${data.duration} minutes</li>
                    <li><strong>Booking ID:</strong> ${data.bookingId}</li>
                </ul>
                
                <p>Please prepare for the session accordingly.</p>
            `;
            
        case 'admin':
            return `
                <h2>New Guide Booking</h2>
                <p>A new booking has been made for <strong>${data.sessionTitle}</strong></p>
                
                <h3>Booking Details:</h3>
                <ul>
                    <li><strong>Student:</strong> ${data.userName} (${data.userEmail})</li>
                    <li><strong>Phone:</strong> ${data.userPhone}</li>
                    <li><strong>Guide:</strong> ${data.guideName}</li>
                    <li><strong>Mode:</strong> ${data.mode}</li>
                    <li><strong>Plan:</strong> ${data.planType}</li>
                    <li><strong>Date:</strong> ${data.date}</li>
                    <li><strong>Time:</strong> ${data.time}</li>
                    <li><strong>Duration:</strong> ${data.duration} minutes</li>
                    <li><strong>Booking ID:</strong> ${data.bookingId}</li>
                    <li><strong>Booked on:</strong> ${data.bookingDate} at ${data.bookingTime}</li>
                </ul>
            `;
            
        default:
            return '<p>Booking confirmation</p>';
    }
}
