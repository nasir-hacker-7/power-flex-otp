# 🤖 Telegram OTP Bot

Telegram bot ke liye jo phone numbers se OTP receive karta hai aur users ko deliver karta hai.

## 📋 Features

- ✅ Multiple countries support (PK, TZ, IN, BD, NG, KE, UG, GH, ZA, EG)
- 📱 Phone number allocation system
- 🔐 OTP retrieval via external API
- 👥 User verification through channel membership
- 💾 MySQL database for data storage
- ⚡ Rate limiting and message deduplication

## 🚀 Railway.app Par Deploy Karne Ka Tareeqa

### Step 1: Railway Account Banayen

1. [Railway.app](https://railway.app) par jayen
2. GitHub se sign up karen
3. Account verify karen

### Step 2: New Project Banayen

1. Railway dashboard par "New Project" click karen
2. "Deploy from GitHub repo" select karen
3. Apna GitHub repository select karen (pehle code GitHub par upload karen)

### Step 3: MySQL Database Add Karen

1. Railway project mein "Add New Service" click karen
2. "Database" → "MySQL" select karen
3. MySQL service automatically deploy ho jayegi
4. Database credentials automatically miljayenge

### Step 4: Environment Variables Set Karen

Railway dashboard mein "Variables" tab par jayen aur ye sab add karen:

```bash
TELEGRAM_BOT_TOKEN=8526222698:AAHej5d8w8kHtGhwYzGVmXs1n_TMjgaJ8wc
ADMIN_ID=8290661165
DP_NUMBERS_CHANNEL=https://t.me/dp_numbers
DP_OTP_ZONE_CHANNEL=https://t.me/dp_otp_zone
OTP_API_URL=http://51.77.216.195/crapi/dgroup/viewstats
OTP_API_TOKEN=RVBXRjRSQouDZnhDQZBYSWdqj2tZlWp7VnFUf3hSdVeEjXV1gGeP
```

**Note:** `DATABASE_URL` Railway automatically set kar dega MySQL addon se.

### Step 5: Deploy Karen

1. Code push karen GitHub par
2. Railway automatically detect karega aur deploy karega
3. Build logs check karen
4. Deploy successful hone ka wait karen

## 📦 Local Testing (Optional)

Agar aap local par test karna chahte hain:

```bash
# Dependencies install karen
npm install

# .env file banayen aur credentials add karen
cp .env.example .env

# Bot start karen
npm start
```

## 🔧 Bot Commands

### User Commands
- `/start` - Bot start karen
- `/help` - Help information dekhen

### Admin Commands (Only for ADMIN_ID)
- `/addnumbers PK` - Pakistan numbers add karen
- `/addnumbers TZ` - Tanzania numbers add karen
- `/addnumbers IN` - India numbers add karen

**Example:**
```
/addnumbers PK
+923366413930
+923366413931
+923366413932
```

## 🌍 Supported Countries

| Code | Country | Flag |
|------|---------|------|
| PK | Pakistan | 🇵🇰 |
| TZ | Tanzania | 🇹🇿 |
| IN | India | 🇮🇳 |
| BD | Bangladesh | 🇧🇩 |
| NG | Nigeria | 🇳🇬 |
| KE | Kenya | 🇰🇪 |
| UG | Uganda | 🇺🇬 |
| GH | Ghana | 🇬🇭 |
| ZA | South Africa | 🇿🇦 |
| EG | Egypt | 🇪🇬 |

## 📊 Database Tables

Bot automatically ye tables bana dega:

1. **phone_numbers** - Phone numbers store karta hai
2. **telegram_users** - User information store karta hai
3. **otp_logs** - OTP requests log karta hai

## 🔐 Security Features

- Channel membership verification
- Admin-only commands
- Rate limiting (1 request per 60 seconds)
- Message deduplication
- Secure database connection

## 🛠️ Railway Specific Requirements

### Required Services:
1. **Node.js Service** - Bot run karne ke liye
2. **MySQL Database** - Data store karne ke liye

### Auto-detected Files:
- `package.json` - Dependencies
- `bot.js` - Main bot file

### Build Command:
```bash
npm install
```

### Start Command:
```bash
npm start
```

## ⚡ Important Notes

1. **Bot Token**: Apni bot token BotFather se len aur `.env` mein add karen
2. **Admin ID**: Apna Telegram ID @userinfobot se len
3. **Channels**: Apne channels banayen aur unke links add karen
4. **Database**: Railway ka MySQL addon use karen (automatic configuration)
5. **Numbers**: Deploy ke baad `/addnumbers` command se numbers add karen

## 🔍 Troubleshooting

**Bot respond nahi kar raha?**
- Check karen ki TELEGRAM_BOT_TOKEN sahi hai
- Railway logs dekhen errors ke liye
- Database connection check karen

**OTP nahi mil raha?**
- Check karen phone number format sahi hai
- API token verify karen
- Thoda wait karen aur retry karen

**Numbers show nahi ho rahe?**
- Database connection check karen
- `/addnumbers` command se numbers add karen
- Country code verify karen

## 📞 Support

Issues ke liye Railway logs check karen:
```bash
Railway Dashboard → Your Service → Logs
```

## 🎯 Next Steps After Deployment

1. Bot ko Telegram par test karen (`/start` bhejkar)
2. Channels mein bot ko admin banayen
3. Admin command se numbers add karen
4. Users ko invite karen

---

**Ready for Railway Deployment!** 🚀
