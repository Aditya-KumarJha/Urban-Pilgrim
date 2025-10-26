# How to Test WhatsApp Reminders

## 1. Check if reminder documents are being created

Open Firebase Console → Firestore → `whatsapp_reminders` collection

After making a booking, you should see documents like:
```
{
  status: 'pending',
  sendAt: Timestamp (60 or 30 minutes before session),
  to: '+91XXXXXXXXXX',
  message: 'Reminder: Your Urban Pilgrim session "Session Name" starts in 60 minutes...',
  programTitle: 'Session Name',
  userId: 'user-id',
  slotDate: '2025-10-26',
  slotTime: '10:00 - 11:00',
  createdAt: Timestamp,
  kind: 'pre-session'
}
```

## 2. Check if processWhatsappReminders is deployed

Run in terminal:
```bash
firebase functions:list | grep processWhatsappReminders
```

You should see:
```
✔ processWhatsappReminders(us-central1) - scheduled function
```

## 3. Check Cloud Scheduler

Go to: https://console.cloud.google.com/cloudscheduler

Look for: `firebase-schedule-processWhatsappReminders`

Status should be: **ENABLED**

## 4. Manual Test

### Create a test reminder (expires in 2 minutes):

Go to Firebase Console → Firestore → `whatsapp_reminders` → Add document:

```json
{
  "status": "pending",
  "sendAt": [Timestamp 2 minutes from now],
  "to": "+91XXXXXXXXXX",
  "message": "TEST: This is a test reminder",
  "programTitle": "Test Session",
  "userId": "test-user",
  "slotDate": "2025-10-26",
  "slotTime": "10:00 - 11:00",
  "createdAt": [Current Timestamp],
  "kind": "test"
}
```

Wait 2-3 minutes and check:
- WhatsApp message received? ✅
- Document status changed to "sent"? ✅
- `sentAt` and `sid` fields added? ✅

## 5. Deploy if not working

```bash
cd functions
firebase deploy --only functions:processWhatsappReminders
```

## 6. Enable Cloud Scheduler (if needed)

If you get error: "Cloud Scheduler API has not been used in project"

Run:
```bash
gcloud services enable cloudscheduler.googleapis.com
gcloud app create --region=asia-south1
```

Then redeploy:
```bash
firebase deploy --only functions:processWhatsappReminders
```
