# Testing in TikTok Development Mode

## Overview

When your TikTok app is in **Development Mode**, only accounts that have been explicitly added as **Test Users** can authenticate with your application. This is a security measure to prevent unauthorized access during development.

## What Types of Accounts Can You Test?

### ✅ Accounts You CAN Test With

1. **Personal TikTok Accounts**
   - Your own TikTok account
   - Accounts of team members/collaborators
   - Any TikTok account you have access to
   - **Requirement**: Must be added as a Test User in Developer Portal

2. **Test/Dummy Accounts**
   - Accounts created specifically for testing
   - Accounts with minimal followers/content
   - **Requirement**: Must be added as a Test User in Developer Portal

3. **Business/Creator Accounts**
   - Business TikTok accounts
   - Creator accounts
   - **Requirement**: Must be added as a Test User in Developer Portal

### ❌ Accounts You CANNOT Test With

- **Any account NOT added as a Test User** - Will receive `client_key` error
- **Accounts that haven't been explicitly added** in Developer Portal

## Test User Limitations

### Maximum Test Users
- **Up to 10 test users** per app in Development Mode
- This is a hard limit set by TikTok

### Test User Requirements
- Must be a valid TikTok account (username or email)
- Account must exist and be active
- Account must be able to log in to TikTok

## How to Add Test Users

### Step-by-Step Instructions

1. **Log in to TikTok Developer Portal**
   ```
   https://developers.tiktok.com
   ```

2. **Navigate to Your App**
   - Click **"My Apps"** in the top navigation
   - Select your app (Client Key: `awi1hq5inmipe3cx`)

3. **Go to Test Users Section**
   - Click **"App Permissions"** in the left sidebar
   - Click **"Test Users"** tab

4. **Add Test User**
   - Click **"Add Test User"** button
   - Enter one of the following:
     - **TikTok Username** (e.g., `@username` or just `username`)
     - **TikTok Email** (email associated with TikTok account)
   - Click **"Add"** or **"Save"**

5. **Verify Test User Added**
   - You should see the test user in the list
   - Status should show as "Active" or "Added"

### Adding Multiple Test Users

You can add up to 10 test users. To add more:

1. Repeat steps 4-5 for each account
2. Each test user must be added individually
3. You can remove test users and add different ones if needed

## Testing Workflow

### Prerequisites Checklist

- [ ] TikTok Developer account created
- [ ] App created in Developer Portal
- [ ] App is in **Development Mode**
- [ ] Test users added (up to 10)
- [ ] Redirect URI configured: `http://localhost:3000/api/auth/callback`
- [ ] Environment variables set in `.env`

### Testing Steps

1. **Ensure Test User is Added**
   - Verify account is in Test Users list in Developer Portal

2. **Log Out of TikTok**
   - If already logged in, log out completely
   - Clear browser cookies if needed

3. **Log In with Test User Account**
   - Go to [tiktok.com](https://www.tiktok.com)
   - Log in with the test user account
   - Verify you're logged in correctly

4. **Start Your Development Server**
   ```bash
   npm run dev
   ```

5. **Navigate to Connect Page**
   ```
   http://localhost:3000/connect
   ```

6. **Click "Connect TikTok Account"**
   - You'll be redirected to TikTok authorization page
   - Should see authorization prompt (not an error)

7. **Authorize the App**
   - Click "Authorize" or "Allow"
   - You'll be redirected back to your app

8. **Verify Success**
   - Should see success message
   - Account should appear in connected accounts list

## Common Testing Scenarios

### Scenario 1: Testing with Your Own Account

**Setup:**
- Add your personal TikTok account as a test user
- Log in to TikTok with your account
- Connect through your app

**Use Case:** Testing basic OAuth flow, user data fetching

### Scenario 2: Testing with Multiple Accounts

**Setup:**
- Add multiple test users (up to 10)
- Test connecting different accounts
- Verify each account's data is fetched correctly

**Use Case:** Testing multi-account support, data isolation

### Scenario 3: Testing with Different Account Types

**Setup:**
- Add a personal account
- Add a business account
- Add a creator account
- Test each type

**Use Case:** Verifying app works with different account types

### Scenario 4: Testing Error Handling

**Setup:**
- Try connecting with an account NOT in test users list
- Should receive `client_key` error
- Verify error message is displayed correctly

**Use Case:** Testing error handling and user feedback

## Best Practices

### 1. Use Dedicated Test Accounts
- Create separate TikTok accounts for testing
- Don't use your main personal account if possible
- Makes it easier to identify test data

### 2. Document Your Test Users
- Keep a list of test users and their purposes
- Note which accounts are for which test scenarios
- Makes testing more organized

### 3. Test Regularly
- Test OAuth flow after code changes
- Verify tokens are stored correctly
- Check that user data is fetched properly

### 4. Monitor Test User Limits
- You can only have 10 test users at once
- Remove unused test users to add new ones
- Plan which accounts you need for testing

### 5. Test Different Scenarios
- Test with accounts that have different follower counts
- Test with accounts that have different content types
- Test edge cases (new accounts, accounts with no videos, etc.)

## Troubleshooting Test Users

### Issue: "client_key" Error Still Appears

**Possible Causes:**
1. Account not added as test user
2. Wrong username/email entered
3. Account doesn't exist or is inactive
4. Not logged in with test user account

**Solutions:**
- Double-check test user is added in Developer Portal
- Verify username/email is correct
- Make sure you're logged into TikTok with test user account
- Try logging out and back in

### Issue: Can't Add More Test Users

**Cause:** You've reached the 10 test user limit

**Solution:**
- Remove unused test users
- Add the new test user
- You can always re-add removed users later

### Issue: Test User Shows as "Inactive"

**Possible Causes:**
- Account was deleted or deactivated
- Username/email was incorrect

**Solution:**
- Verify account still exists
- Remove and re-add with correct information
- Use email instead of username (or vice versa)

## Moving to Production

When you're ready to move to Production Mode:

1. **Submit App for Review**
   - Go to Developer Portal
   - Submit your app for review
   - Wait for approval (can take days/weeks)

2. **Switch to Production Mode**
   - Once approved, switch to Production Mode
   - **Any TikTok user** can now authenticate
   - No test user limit
   - No need to add users manually

3. **Update Redirect URIs**
   - Add production URL: `https://yourdomain.com/api/auth/callback`
   - Update environment variables for production

## Quick Reference

| Aspect | Development Mode | Production Mode |
|--------|-----------------|-----------------|
| **Test Users Required** | ✅ Yes (up to 10) | ❌ No |
| **Any User Can Auth** | ❌ No | ✅ Yes |
| **App Review Required** | ❌ No | ✅ Yes |
| **Best For** | Testing & Development | Live Production |
| **Test User Limit** | 10 users | Unlimited |

## Example Test User List

Here's an example of how you might organize test users:

```
Test Users (10 max):
1. @your_personal_account - Personal testing
2. @test_account_1 - Basic functionality
3. @test_account_2 - Multi-account testing
4. business@example.com - Business account testing
5. creator@example.com - Creator account testing
6. (5 more slots available)
```

## Additional Resources

- [TikTok Developer Portal](https://developers.tiktok.com)
- [TikTok OAuth Documentation](https://developers.tiktok.com/doc/oauth-overview/)
- [TikTok Login Kit](https://developers.tiktok.com/doc/login-kit-desktop/)

