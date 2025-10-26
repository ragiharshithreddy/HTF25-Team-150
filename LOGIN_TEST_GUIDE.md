# Login Testing Guide

## ✅ Changes Made

1. **Removed Preview/Demo Mode** - No more "Student Mode" and "Admin Mode" buttons
2. **Added Real Login Form** - Email and password required
3. **Proper Authentication** - Uses AuthContext and API backend

## 🧪 How to Test

### Step 1: Access the Application
Open your browser and go to: **http://localhost:3000**

### Step 2: Navigate to Login
Click "Sign In" or go directly to: **http://localhost:3000/login**

### Step 3: Use These Credentials

#### Option 1: Student Login
```
Email: stu1@cosc.in
Password: stu1pass
```
- Should redirect to `/student/dashboard` after login
- Student can view projects, apply, take tests

#### Option 2: Company Admin Login
```
Email: admincosc@mail.in
Password: admincosc
```
- Should redirect to `/admin/dashboard` after login
- Admin can manage projects, review applications

#### Option 3: Super Admin Login
```
Email: pbsr@admin.pvt
Password: adminpbsr
```
- Should redirect to `http://localhost:5001` (separate super admin portal)
- Manages company approvals and system settings

## 🐛 If Login Fails

### Check 1: Verify Backend is Running
```powershell
docker ps --filter "name=project_allocation_api"
```
Should show `Up` and `healthy`

### Check 2: Test API Directly
```powershell
$body = '{"email":"stu1@cosc.in","password":"stu1pass"}'
Invoke-WebRequest -Uri http://localhost:5000/api/auth/login `
  -Method POST `
  -ContentType "application/json" `
  -Body $body `
  -UseBasicParsing
```
Should return JSON with `success: true` and a `token`

### Check 3: Check Browser Console
1. Open Browser DevTools (F12)
2. Go to Console tab
3. Try logging in
4. Look for any red error messages

Common errors:
- **CORS Error**: Backend CORS settings might need adjustment
- **Network Error**: API URL might be incorrect
- **401 Unauthorized**: Wrong credentials
- **400 Bad Request**: Missing email or password

### Check 4: Verify API URL
The frontend should be calling: `http://localhost:5000/api/auth/login`

Check in browser Network tab (F12 → Network → try login → click on "login" request)

### Check 5: Check Backend Logs
```powershell
docker logs project_allocation_api --tail 50
```
Look for login attempts and any errors

## 🔧 Troubleshooting

### If you see "Login failed. Please try again"

This could mean:
1. **Wrong credentials** - Double-check email/password
2. **Backend not responding** - Check if backend container is running
3. **CORS issue** - Backend might not allow frontend origin

**Solution**: Rebuild both containers
```powershell
docker compose down
docker compose up -d --build
```

### If frontend shows old preview buttons

**Solution**: Clear browser cache or hard reload (Ctrl+Shift+R)

### If login succeeds but doesn't redirect

**Solution**: Check AuthContext login function and routing logic

The login flow should be:
1. User submits form
2. Calls `AuthContext.login(email, password)`
3. AuthContext calls `/api/auth/login`
4. Gets back `{token, user}`
5. Saves token to localStorage
6. Sets user state
7. Redirects based on `user.role`

## 📊 Expected Behavior

### After Successful Login:

**Student** (`stu1@cosc.in`):
- ✅ Token saved in localStorage
- ✅ Redirected to `/student/dashboard`
- ✅ Can see navigation sidebar
- ✅ Can access student features

**Admin** (`admincosc@mail.in`):
- ✅ Token saved in localStorage
- ✅ Redirected to `/admin/dashboard`
- ✅ Can see admin navigation
- ✅ Can manage projects/applications

**Super Admin** (`pbsr@admin.pvt`):
- ✅ Redirected to port 5001
- ✅ Super admin interface (if built)
- ✅ Can approve companies

## 🆕 Registration Flow

### For New Students:
1. Go to http://localhost:3000/register
2. Fill in details
3. Select company from dropdown (should show "COSC")
4. Submit
5. Automatically logged in
6. Redirected to dashboard

### For New Companies:
1. Go to http://localhost:3000/company/register
2. Fill in company details (Step 1)
3. Fill in admin details (Step 2)
4. Submit
5. Company created with status "pending"
6. Wait for super admin approval
7. After approval, admin can login

## 📝 Quick Test Checklist

- [ ] Can access login page
- [ ] Form shows email and password fields
- [ ] No "Student Mode" or "Admin Mode" buttons
- [ ] Can submit with student credentials
- [ ] Student login redirects to /student/dashboard
- [ ] Can submit with admin credentials
- [ ] Admin login redirects to /admin/dashboard
- [ ] Can submit with super admin credentials
- [ ] Super admin redirects to port 5001
- [ ] Invalid credentials show error message
- [ ] Loading spinner shows during login
- [ ] Token saved in localStorage after login
- [ ] Can navigate to different pages after login
- [ ] Logout works properly

## 🚀 All Working? Next Steps

1. **Build Super Admin Frontend** - Currently only backend on port 5001
2. **Add Forgot Password** - Email reset functionality
3. **Add Email Verification** - Verify email on registration
4. **Add 2FA** - Two-factor authentication
5. **Add Social Login** - Google, GitHub, etc.

---

**Need Help?** Check the error message and match it against the troubleshooting section above.
