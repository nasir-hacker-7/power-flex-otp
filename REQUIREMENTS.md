# 📦 Requirements Summary

## Railway.app Par Deploy Karne Ke Liye Zaroori Cheezen

### 1. Services Required on Railway:
- ✅ **Node.js Service** (automatically detect hogi)
- ✅ **MySQL Database** (addon ke through add karni hai)

### 2. Environment Variables (Railway Dashboard Mein Set Karen):

```bash
TELEGRAM_BOT_TOKEN=8526222698:AAHej5d8w8kHtGhwYzGVmXs1n_TMjgaJ8wc
ADMIN_ID=8290661165
DP_NUMBERS_CHANNEL=https://t.me/dp_numbers
DP_OTP_ZONE_CHANNEL=https://t.me/dp_otp_zone
OTP_API_URL=http://51.77.216.195/crapi/dgroup/viewstats
OTP_API_TOKEN=RVBXRjRSQouDZnhDQZBYSWdqj2tZlWp7VnFUf3hSdVeEjXV1gGeP
NODE_ENV=production
```

**Note:** `DATABASE_URL` Railway automatically set karega MySQL addon se.

### 3. Dependencies (package.json mein already hain):

```json
{
  "node-telegram-bot-api": "^0.67.0",
  "mysql2": "^3.6.5",
  "axios": "^1.6.2",
  "dotenv": "^16.3.1"
}
```

### 4. Node.js Version:
- **Minimum:** Node.js 18.0.0
- **Recommended:** Node.js 18.x ya higher

### 5. Database:
- **Type:** MySQL
- **Tables:** Automatically create honge bot start hone par
  - phone_numbers
  - telegram_users
  - otp_logs

### 6. External API:
- **OTP API Endpoint:** http://51.77.216.195/crapi/dgroup/viewstats
- **Already configured:** Credentials included hain

### 7. Telegram Channels (Zaroori!):
- **Channel 1:** @dp_numbers
- **Channel 2:** @dp_otp_zone
- **Action Required:** Bot ko dono channels mein ADMIN banana hoga

### 8. Files Structure:

```
telegram-otp-bot/
├── bot.js                      # Main bot file
├── package.json                # Dependencies
├── .env.example                # Environment variables template
├── .gitignore                  # Git ignore file
├── railway.json                # Railway config
├── README.md                   # English documentation
└── DEPLOYMENT_GUIDE_URDU.md    # Urdu deployment guide
```

## 🎯 Quick Deployment Steps:

1. **GitHub repository** banayen aur code upload karen
2. **Railway.app** par account banayen
3. **New Project** → "Deploy from GitHub repo"
4. **MySQL database** add karen (+New → Database → MySQL)
5. **Environment variables** set karen (Variables tab)
6. **Deploy** aur logs check karen
7. Bot ko **Telegram channels mein admin** banayen
8. `/addnumbers` command se **phone numbers add** karen

## ⚡ Cost:

- **Railway Free Tier:** $5 worth of credits monthly
- **MySQL:** Free tier mein included
- **Bot:** Lightweight, free tier sufficient hai

## 🔍 Success Indicators:

Deployment successful hai agar:
- ✅ Logs mein "Bot started successfully!" dikhai de
- ✅ Logs mein "Database initialized successfully" dikhai de
- ✅ Bot Telegram par respond kare
- ✅ `/start` command work kare
- ✅ Channel verification work kare

## 🚨 Common Railway-Specific Notes:

1. **Auto-deploy:** GitHub se push karne par automatically deploy hota hai
2. **DATABASE_URL:** Railway automatically set karega - manual add na karen
3. **Logs:** Railway dashboard → Deployments → View Logs
4. **Restart:** Settings → Restart service
5. **Free Credits:** $5/month free - bot ke liye sufficient

## 📞 Testing Checklist:

Deployment ke baad test karen:
- [ ] `/start` command bhejein
- [ ] Channels join karen
- [ ] "Verify Membership" click karen
- [ ] "Get Number" click karen
- [ ] Country select karen (e.g., PK)
- [ ] Number receive karen
- [ ] "Check SMS" click karen
- [ ] OTP receive karen

---

**All set! Railway par deploy karne ke liye ready hai!** 🚀
