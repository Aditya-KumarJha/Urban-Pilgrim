const { db } = require('../config/firebase');

// Get available slots for a guide session
exports.getSlots = async (req, res) => {
    try {
        const { guideId, mode, plan } = req.query;
        
        if (!guideId || !mode) {
            return res.status(400).json({ 
                error: 'Missing required parameters: guideId and mode' 
            });
        }

        // Fetch slots from Firestore
        const slotsRef = db.collection('guide_slots')
            .where('guideId', '==', guideId)
            .where('mode', '==', mode.toLowerCase());
        
        const slotsSnapshot = await slotsRef.get();
        
        if (slotsSnapshot.empty) {
            return res.json({ slots: [] });
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

        res.json({ slots: filteredSlots });
    } catch (error) {
        console.error('Error fetching slots:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Book a slot
exports.bookSlot = async (req, res) => {
    try {
        const { 
            slotId, 
            guideId, 
            userId, 
            userDetails, 
            sessionData, 
            selectedPlan, 
            mode 
        } = req.body;

        if (!slotId || !guideId || !userDetails) {
            return res.status(400).json({ 
                error: 'Missing required booking information' 
            });
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
        await sendBookingEmails(bookingData);

        res.json({ 
            success: true, 
            bookingId: bookingRef.id,
            message: 'Booking confirmed successfully' 
        });
    } catch (error) {
        console.error('Error booking slot:', error);
        res.status(500).json({ error: 'Failed to book slot' });
    }
};

// Send booking confirmation emails
async function sendBookingEmails(bookingData) {
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

        // Send email to user
        await sendEmail({
            to: userDetails.email,
            subject: `Booking Confirmation - ${emailData.sessionTitle}`,
            template: 'guide-booking-user',
            data: emailData
        });

        // Send email to organizer/guide (if email exists)
        if (guideData?.organizer?.email) {
            await sendEmail({
                to: guideData.organizer.email,
                subject: `New Booking - ${emailData.sessionTitle}`,
                template: 'guide-booking-organizer',
                data: emailData
            });
        }

        // Send email to admin
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@urbanpilgrim.com';
        await sendEmail({
            to: adminEmail,
            subject: `New Guide Booking - ${emailData.sessionTitle}`,
            template: 'guide-booking-admin',
            data: emailData
        });

        console.log('Booking confirmation emails sent successfully');
    } catch (error) {
        console.error('Error sending booking emails:', error);
        // Don't throw error as booking is already confirmed
    }
}

// Email sending function (integrate with your existing email service)
async function sendEmail({ to, subject, template, data }) {
    // TODO: Integrate with your existing email service (nodemailer, sendgrid, etc.)
    // This is a placeholder - replace with your actual email sending logic
    
    const emailContent = generateEmailContent(template, data);
    
    console.log(`Sending email to: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Content: ${emailContent}`);
    
    // Example with nodemailer (uncomment and configure):
    /*
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransporter({
        // Your email configuration
    });
    
    await transporter.sendMail({
        from: process.env.FROM_EMAIL,
        to: to,
        subject: subject,
        html: emailContent
    });
    */
}

// Generate email content based on template
function generateEmailContent(template, data) {
    switch (template) {
        case 'guide-booking-user':
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
            
        case 'guide-booking-organizer':
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
            
        case 'guide-booking-admin':
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
