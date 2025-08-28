# Admin Authentication Setup Guide

## Overview
This guide explains how to set up and use the admin authentication system for Urban Pilgrim.

## Firebase Setup Required

### 1. Create Admin Collection in Firestore

You need to manually create admin documents in Firestore before admins can log in.

**Collection:** `admins`

**Sample Admin Document:**
```javascript
// Document ID: auto-generated or custom
{
  email: "admin@urbanpilgrim.com",
  name: "Admin User",
  role: "admin",
  level: "super", // or "standard"
  permissions: [
    "manage_retreats",
    "manage_sessions", 
    "manage_guides",
    "manage_events",
    "manage_bundles",
    "view_analytics"
  ],
  createdAt: new Date(),
  isActive: true
}
```

### 2. Deploy Firebase Functions

Deploy the new admin OTP functions:

```bash
cd functions
firebase deploy --only functions:sendAdminOtp,verifyAdminOtp
```

## How Admin Authentication Works

### 1. Route Protection
- When accessing `/admin`, the system checks if admin is authenticated
- If not authenticated, shows `AdminSignIn` component
- If authenticated, shows the admin dashboard

### 2. Login Flow
1. Admin enters email address
2. System validates email exists in `admins` collection
3. If valid, sends OTP to admin email
4. Admin enters OTP
5. System verifies OTP and creates custom token with admin claims
6. Admin is logged in and can access dashboard

### 3. Admin Features
- **Protected Routes**: Only authenticated admins can access `/admin`
- **Admin Info Display**: Shows admin email and role in sidebar
- **Logout**: Logout button in sidebar clears admin session
- **Persistent State**: Admin auth state persists across browser sessions

## Security Features

### 1. Email Validation
- Only emails in the `admins` Firestore collection can receive OTP
- Unauthorized emails are rejected immediately

### 2. OTP Security
- 6-digit OTP with 5-minute expiration
- OTP is deleted after successful verification
- Failed attempts are logged

### 3. Admin Claims
- Custom Firebase tokens include admin role and permissions
- Different admin levels supported (super, standard)
- Permissions array for granular access control

## Testing the System

### 1. Create Test Admin
Add a document to the `admins` collection in Firestore:

```javascript
{
  email: "test@admin.com", // Use your email for testing
  name: "Test Admin",
  role: "admin",
  level: "super",
  permissions: ["manage_all"],
  createdAt: new Date(),
  isActive: true
}
```

### 2. Test Login Flow
1. Navigate to `/admin`
2. Enter the test admin email
3. Check your email for OTP
4. Enter OTP to complete login
5. Verify you can access admin dashboard
6. Test logout functionality

## Admin Dashboard Features

### Current Sections
- Home Page management
- Pilgrim Retreats management
- Pilgrim Sessions management
- Pilgrim Guides management
- Upcoming Events management
- Bundle Programs management

### Admin Sidebar
- Displays admin info (email, role)
- Navigation between sections
- Logout button at bottom

## Environment Variables

Ensure these are set in Firebase Functions:

```
GOOGLE_SERVICE_ACCOUNT=<your-service-account-json>
APP_GMAIL=<gmail-for-sending-emails>
APP_GMAIL_PASSWORD=<gmail-app-password>
```

## Error Handling

### Common Issues
1. **"Unauthorized admin email"** - Email not in admins collection
2. **"OTP expired"** - OTP older than 5 minutes
3. **"Invalid OTP"** - Wrong OTP entered
4. **"Permission denied"** - Admin document missing or inactive

### Troubleshooting
1. Check Firestore `admins` collection exists and has correct data
2. Verify Firebase Functions are deployed
3. Check email configuration in environment variables
4. Review Firebase Functions logs for errors

## Future Enhancements

### Planned Features
- Admin role-based permissions
- Admin activity logging
- Password reset functionality
- Multi-factor authentication
- Admin user management interface

### Security Improvements
- Rate limiting for OTP requests
- IP-based access restrictions
- Session timeout management
- Audit trail for admin actions
