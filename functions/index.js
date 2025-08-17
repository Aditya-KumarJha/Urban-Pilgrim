// functions/index.js
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

admin.initializeApp();
const db = admin.firestore();

// Configure email transporter (using Gmail/SendGrid/etc)
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "nabinagrawal64@gmail.com",
        pass: "ehhhfqgdjkqsykuv",
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
