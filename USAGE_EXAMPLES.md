# 📱 Bot Usage Examples

## ✅ Key Feature: Dynamic Country Selection

Ab bot **sirf un countries ko show karega jinke numbers database mein available hain**!

## 🎯 Working Flow

### Step 1: Admin Numbers Add Karta Hai

Admin ye command use karta hai:

```
/addnumbers PK
+923366413930
+923366413931
+923366413932
```

**Result:** 3 Pakistan numbers database mein add ho gaye.

### Step 2: User "Get Number" Click Karta Hai

Jab user "Get Number" button click karta hai, to bot check karta hai database mein **kon kon se countries ke numbers available hain**.

**Example:** Agar sirf Pakistan ke numbers hain, to sirf ye show hoga:
```
🌍 Select a country to get a phone number:

Available countries: 1

🇵🇰 Pakistan
```

Agar Pakistan, Tanzania aur India ke numbers hain:
```
🌍 Select a country to get a phone number:

Available countries: 3

🇵🇰 Pakistan
🇹🇿 Tanzania
🇮🇳 India
```

### Step 3: User Country Select Karta Hai

User "🇵🇰 Pakistan" click karta hai.

**Bot Response:**
```
🇵🇰 PAKISTAN NUMBER

📱 Number: +923366413930

Use this number to receive OTP codes.
Click "Check SMS" to retrieve OTP.

[📨 Check SMS]  [🔄 Change Number]
```

### Step 4: User "Check SMS" Click Karta Hai

User "Check SMS" button click karta hai.

**Bot Processing:**
```
⏳ Fetching OTP for 🇵🇰 +923366413930...

Please wait...
```

**If OTP Found - Success Response:**
```
✅ OTP RECEIVED!

🇵🇰 PAKISTAN
📱 Number: +923366413930

🔐 OTP CODE: 123456

📝 Message: Your verification code is 123456

Click on the OTP code to copy it

[🔄 Check Again]  [📱 Get New Number]
```

**If OTP Not Found Yet:**
```
❌ No OTP found yet. Please wait a few seconds and try again.
```

**If Rate Limited:**
```
⏰ Rate limit reached. Please wait 1 minute and try again.
```

## 🔍 Real-World Scenarios

### Scenario 1: Only PK Numbers Available

Admin ne sirf Pakistan numbers add kiye:
```
/addnumbers PK
+923366413930
+923366413931
```

**User dekh raha hai:**
```
🌍 Select a country:
Available countries: 1

🇵🇰 Pakistan
```

### Scenario 2: Multiple Countries

Admin ne PK, TZ, IN numbers add kiye:
```
/addnumbers PK
+923366413930

/addnumbers TZ
+255621016460

/addnumbers IN
+919876543210
```

**User dekh raha hai:**
```
🌍 Select a country:
Available countries: 3

🇵🇰 Pakistan
🇹🇿 Tanzania
🇮🇳 India
```

### Scenario 3: All PK Numbers Used

Sare Pakistan numbers assigned ho chuke hain but Tanzania available hai:

**User dekh raha hai:**
```
🌍 Select a country:
Available countries: 1

🇹🇿 Tanzania
```

Agar user PK number ke liye rate limit ho:
```
⏰ Please wait 60 seconds before requesting another number.
```

### Scenario 4: No Numbers Available

Database mein koi bhi number available nahi:

**User ko message:**
```
❌ No numbers available right now. Please contact admin.
```

## 📊 API Response Handling

Bot 3 tarah se OTP extract karta hai:

### Format 1: Standard JSON
```json
{
  "otp": "123456",
  "message": "Your OTP is 123456"
}
```

### Format 2: OTP in Message
```json
{
  "message": "Your verification code is 123456"
}
```
Bot regex se extract karega: `123456`

### Format 3: Any Numeric Code
Bot kisi bhi 4-8 digit code ko detect karega.

## 🔄 Complete User Journey

1. **User starts:** `/start`
2. **Verification:** Join channels → Click "Verify"
3. **Get Number:** Click "Get Number"
4. **Select Country:** Choose from available countries (dynamic list)
5. **Receive Number:** Get assigned number with flag and country name
6. **Check OTP:** Click "Check SMS"
7. **Get OTP:** Receive formatted OTP with copy-friendly code
8. **Options:**
   - "Check Again" - Same number se dobara check karen
   - "Get New Number" - Different country ka number len

## 💡 Admin Examples

### Add Pakistan Numbers
```
/addnumbers PK
+923366413930
+923366413931
+923366413932
```

### Add Tanzania Numbers
```
/addnumbers TZ
+255621016460
+255621016461
```

### Add India Numbers
```
/addnumbers IN
+919876543210
+919876543211
```

### Add Multiple Countries at Once

Admin ko har country ke liye alag command dena hoga:

```
/addnumbers PK
+923366413930
+923366413931

/addnumbers TZ
+255621016460

/addnumbers IN
+919876543210
```

## ✅ Key Improvements

1. **Dynamic Country List**: Sirf available countries show hoti hain
2. **Better OTP Detection**: Multiple formats support
3. **Clear Messaging**: User ko har step par clear instructions
4. **Error Handling**: Proper error messages with helpful suggestions
5. **Country Information**: Flag aur naam har jagah consistent
6. **Copy-Friendly**: OTP monospace format mein (easy to copy)
7. **Action Buttons**: User aasani se next action le sakta hai

---

**Bot ab production-ready hai with all improvements!** 🚀
