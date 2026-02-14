# 🖼️ Bot Image Setup Guide

## 📸 Welcome Image Feature

Bot ab har message ke saath **professional cyberpunk image** bhejega!

## 🎯 Image Kahan Use Hota Hai:

1. **Welcome Screen** - /start command
2. **Verify Screen** - Channel verification
3. **Country Selection** - Available countries
4. **Number Display** - Number + Country info
5. **OTP Display** - OTP code with number

## 📦 Image File Details:

**File Name:** `welcome-image.jpg`  
**Location:** Bot ke root folder mein  
**Size:** Koi bhi (recommended: under 2MB)  
**Format:** JPG, PNG supported

## 🚀 Railway Par Deploy Karte Waqt:

### Method 1: Image Code Ke Saath Upload Karen (Recommended)

1. Bot folder mein `welcome-image.jpg` file rakhen
2. Sare files GitHub par push karen
3. Railway automatically image upload kar dega
4. Done! ✅

### Method 2: Railway Dashboard Se Upload

Agar baad mein image change karni ho:

1. Railway dashboard mein jayen
2. Bot service select karen
3. "Settings" → "Volumes" (if available)
4. Image manually upload karen

**Note:** Method 1 easiest hai - image ko code ke saath hi GitHub mein rakhen.

## 📁 File Structure:

```
telegram-otp-bot/
├── bot.js
├── welcome-image.jpg  ← Ye file zaroori hai!
├── package.json
├── .env.example
└── ...
```

## 🎨 Custom Image Use Karna:

Apni khud ki image use karna chahte hain?

1. **Apni image** choose karen (cyberpunk, neon, tech style recommended)
2. **Naam change karen** to `welcome-image.jpg`
3. Bot folder mein **replace** kar den
4. GitHub par push karen
5. Railway automatically update ho jayega!

## ✅ Image Requirements:

- **Aspect Ratio:** 16:9 or 4:3 best hai
- **Resolution:** 1920x1080 ya 1280x720 recommended
- **File Size:** Under 2MB (Telegram limit: 10MB)
- **Format:** JPG, PNG (JPG faster hai)
- **Style:** Cyberpunk, neon, tech theme best lagta hai

## 🔧 Agar Image Load Nahi Ho:

Bot mein **automatic fallback** hai:

```javascript
try {
  await bot.sendPhoto(chatId, './welcome-image.jpg', {...});
} catch (error) {
  // Fallback to text-only message
  await bot.sendMessage(chatId, 'Welcome!', {...});
}
```

**Matlab:** Agar image fail ho to bot text message bhej dega.

## 📊 Bot Flow with Images:

```
User: /start

Bot: [Sends Image]
     👋 Welcome!
     Join our channels to get started:
     [⚜️ Join KAMI_BROKON]
     [⚜️ Join Kami Method]
     [⚡ VERIFY & START]

User: Clicks VERIFY & START

Bot: [Sends Image]
     ✅ Verification successful!
     👋 Welcome!
     [📱 Get Number]

User: Clicks Get Number

Bot: [Sends Image]
     🌍 Select Country
     Found 5 countries.
     [🇵🇰 Pakistan]
     [🇳🇬 Nigeria]
     ...

User: Selects Pakistan

Bot: [Sends Image]
     📡 Server: NUMBER PANEL 🔥
     🇵🇰 Country: Pakistan
     📱 Number: +923366413930
     [📨 GET OTP CODE]
     [🔄 Change Number]
     [🔙 Main Menu]

User: Clicks GET OTP CODE

Bot: [Sends Image]
     📡 Server: NUMBER PANEL 🔥
     🇵🇰 Country: Pakistan
     📱 Number: +923366413930
     🔐 OTP CODE: 123456
     [📨 GET OTP CODE]
     [🔄 Change Number]
     [🔙 Main Menu]
```

## 🎯 Screenshots Match:

Bot ab bilkul screenshots jaisa work karega:

- ✅ Har message mein image
- ✅ Professional look
- ✅ Emoji icons
- ✅ Clean buttons
- ✅ Server name display
- ✅ Country flags
- ✅ Copy-friendly OTP

## 💡 Pro Tips:

1. **Image Quality**: High resolution use karen but file size chhoti rakhen
2. **Consistent Theme**: Ek hi style ki image use karen throughout
3. **Text Visibility**: Image par text readable hona chahiye
4. **Fast Loading**: 500KB-1MB images fast load hoti hain

## 🔄 Image Update Process:

Agar image change karni ho:

1. Naya image `welcome-image.jpg` naam se save karen
2. Bot folder mein purani image replace karen
3. GitHub par commit & push karen
4. Railway automatic deploy karega
5. Done! New image live ho jayegi

## 📞 Troubleshooting:

**Issue:** Image show nahi ho rahi  
**Solution:** 
- Check karo file name exactly `welcome-image.jpg` hai
- File bot ke root folder mein hai
- GitHub par properly push hui hai
- Railway logs mein error nahi hai

**Issue:** Image bahut badi hai  
**Solution:**
- Image compress karen (TinyPNG.com use karen)
- Recommended size: 500KB-1MB
- Resolution kam karen if needed

**Issue:** Image quality kharab hai  
**Solution:**
- Higher quality image use karen
- 1920x1080 resolution try karen
- JPG format use karen PNG ke bajaye

## ✅ Final Checklist:

Deploy se pehle:
- [ ] `welcome-image.jpg` bot folder mein hai
- [ ] Image size under 2MB hai
- [ ] File name exactly correct hai
- [ ] GitHub par pushed hai
- [ ] Railway deploy successful hai

Test karne ke liye:
- [ ] `/start` command se image aati hai
- [ ] Country selection mein image hai
- [ ] Number display mein image hai
- [ ] OTP display mein image hai
- [ ] Sab buttons kaam kar rahe hain

**All set! Bot ready hai with professional images!** 🎉

---

## 🎨 Included Image:

Aapki di hui "POWER MODZ" cyberpunk image already included hai as `welcome-image.jpg`!

**Features:**
- ✅ Cyberpunk neon style
- ✅ Purple & blue theme
- ✅ Professional look
- ✅ Perfect for tech bot

**Deploy karo aur enjoy!** 🚀
