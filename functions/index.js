// functions/index.js
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
const Razorpay = require("razorpay");
const { google } = require("googleapis");
const cors = require("cors")({ origin: true });

admin.initializeApp();
const db = admin.firestore();

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
    console.log("data from confirmPayment", data.data);
    const { userId, email, name, cartData, total, paymentResponse, formData } =
        data.data;
    const adminEmail = "urbanpilgrim25@gmail.com";

    // =============================
    // 1) Save in user’s Firestore
    // =============================
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

    // =============================
    // 2) Add user under Program → purchasedUsers
    // =============================
    const programRef = db
        .collection("pilgrim_sessions")
        .doc("pilgrim_sessions")
        .collection("sessions")
        .doc("recordedSession");

    const programSnap = await programRef.get();
    if (programSnap.exists) {
        const slides = programSnap.data().slides || [];

        const updatedSlides = slides.map((slide) => {
            const match = cartData.find(
                (c) => c?.title === slide?.recordedProgramCard?.title
            );
            if (match) {
                return {
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
                            ...formData,
                        },
                    ],
                };
            }
            return slide;
        });

        await programRef.update({ slides: updatedSlides });
    } else {
        console.log("No such program document!");
        return;
    }

    // =============================
    // 3) Helper functions for formatting
    // =============================
    function formatDateWithSuffix(dateStr) {
        const date = new Date(dateStr);
        const day = date.getDate();
        const suffix =
            day > 3 && day < 21
                ? "th"
                : ["st", "nd", "rd"][((day % 10) - 1) % 3] || "th";
        const month = date.toLocaleString("en-US", { month: "short" });
        return `${day}${suffix} ${month}`;
    }

    function formatTime(timeStr) {
        return new Date(`1970-01-01T${timeStr}`).toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        });
    }

    async function getOAuth2Client() {
        const oauth2Client = new google.auth.OAuth2(
            "747989822476-imovatiemei2rcivhe3k7rjbdg92t8u6.apps.googleusercontent.com",
            "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",
            "https://developers.google.com/oauthplayground" // redirect URI
        );

        oauth2Client.setCredentials({
            refresh_token: "1//04BACbcnUSWeSCgYIARAAGAQSNwF-L9IrBM36T44YgPSbKvWkN9MkQUMmNJkAjS5kCrEHJ4fwpcIPFyDwzVeKpEzjJNVLesRi98I",
        });

        return oauth2Client;
    }

    // =============================
    // 4) Emails
    // =============================
    const programList = cartData
        .map((p) => `${p.title} (₹${p.price} x${p.quantity})`)
        .join(", ");

    // Generic Purchase Email to User
    await transporter.sendMail({
        from: gmailEmail,
        to: email,
        subject: "Urban Pilgrim - Purchase Confirmation",
        html: `
            <h2>Hi ${name},</h2>
            <p>Thank you for your purchase. You successfully bought:</p>
            <p><b>${programList}</b></p>
            <p>Total Paid: ₹${total}</p>
            <p>Payment ID: ${paymentResponse.razorpay_payment_id}</p>
        `,
    });

    // Generic Email to Admin
    await transporter.sendMail({
        from: gmailEmail,
        to: adminEmail,
        subject: "New Program Purchase - Urban Pilgrim",
        html: `
            <h3>New Purchase</h3>
            <p>User: ${name} (${email})</p>
            <p>Programs: ${programList}</p>
            <p>Total: ₹${total}</p>
            <p>Payment ID: ${paymentResponse.razorpay_payment_id}</p>
        `,
    });

    // 4) Handle Live Sessions → Google Calendar
    const oauth2Client = await getOAuth2Client();
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    for (const program of cartData) {
        if (program.type === "live" && program.slots?.length) {
            for (const slot of program.slots) {
                const slotDate = formatDateWithSuffix(slot.date);
                const slotTime = `${formatTime(slot.startTime)} - ${formatTime(
                    slot.endTime
                )}`;

                const startDateTime = new Date(
                    `${slot.date}T${slot.startTime}:00`
                );
                const endDateTime = new Date(`${slot.date}T${slot.endTime}:00`);

                const event = {
                    summary: program.title,
                    description: `Live session booking for ${program.title}\nPersons: ${program.persons}`,
                    start: {
                        dateTime: startDateTime.toISOString(),
                        timeZone: "Asia/Kolkata",
                    },
                    end: {
                        dateTime: endDateTime.toISOString(),
                        timeZone: "Asia/Kolkata",
                    },
                    attendees: [
                        { email }, // user
                        { email: adminEmail }, // admin
                        { email: program.organizerEmail }, // organizer
                    ],
                    conferenceData: {
                        createRequest: {
                            requestId: `${program.id}-${Date.now()}`,
                            conferenceSolutionKey: { type: "hangoutsMeet" },
                        },
                    },
                };

                const createdEvent = await calendar.events.insert({
                    calendarId: program.organizerEmail, // event hosted by organizer
                    resource: event,
                    conferenceDataVersion: 1,
                    sendUpdates: "all",
                });

                const meetLink =
                    createdEvent.data.conferenceData?.entryPoints?.[0]?.uri;

                // Mail with Meet Link
                const mailHtml = `
                    <h2>Booking Confirmed: ${program.title}</h2>
                    <p><b>Date:</b> ${slotDate}</p>
                    <p><b>Time:</b> ${slotTime}</p>
                    <p><b>Persons:</b> ${program.persons}</p>
                    <p><b>Google Meet Link:</b> <a href="${meetLink}" target="_blank">${meetLink}</a></p>
                `;

                await transporter.sendMail({
                    from: gmailEmail,
                    to: email,
                    subject: `Your Live Session Booking - ${program.title}`,
                    html: mailHtml,
                });

                await transporter.sendMail({
                    from: gmailEmail,
                    to: adminEmail,
                    subject: `New Live Session Booking - ${program.title}`,
                    html: mailHtml,
                });

                if (program.organizerEmail) {
                    await transporter.sendMail({
                        from: gmailEmail,
                        // to: program.organizerEmail,
                        to: "pradhansambit2005@gmail.com",
                        subject: `New Booking for Your Session - ${program.title}`,
                        html: mailHtml,
                    });
                }
            }
        }
    }

    return { success: true };
});
