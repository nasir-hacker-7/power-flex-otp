# 🗄️ MySQL Bot Ke Saath Kaise Connect Karen

## Railway.app Par MySQL Setup (Recommended)

### Option 1: Railway MySQL Addon (Easiest ✅)

Railway automatic MySQL setup karta hai. Ye sabse aasan tareeqa hai.

#### Steps:

1. **Railway Dashboard** mein apne project par jayen
2. **"+ New"** button click karen
3. **"Database"** select karen
4. **"Add MySQL"** click karen
5. MySQL service automatically create ho jayegi

#### DATABASE_URL Automatic Miljayega:

Railway automatically `DATABASE_URL` environment variable set kar dega:
```
DATABASE_URL=mysql://root:password@mysql.railway.internal:3306/railway
```

**Kuch bhi manually karne ki zaroorat nahi!** Bot automatically connect ho jayega.

---

## Option 2: External MySQL Database

Agar aap Railway ke MySQL ke bajaye koi aur MySQL use karna chahte hain:

### 2.1 Free MySQL Providers:

#### A) **FreeSQLDatabase.com**
- Free MySQL database
- 5MB storage
- Good for testing

**Steps:**
1. https://www.freesqldatabase.com par jayen
2. Sign up karen
3. Database credentials copy karen
4. Railway environment variables mein add karen

#### B) **Railway MySQL** (Still Best Option)
- $5/month free credits
- Fast and reliable
- Auto-configured

#### C) **Aiven.io**
- Free tier available
- Good performance
- Multiple regions

### 2.2 DATABASE_URL Format:

```
mysql://username:password@host:port/database_name
```

**Example:**
```
mysql://root:mypassword123@db.example.com:3306/otp_bot_db
```

**Railway par set kaise karen:**
1. Railway Dashboard → Your Project
2. Bot service select karen
3. "Variables" tab par jayen
4. "New Variable" click karen
5. Name: `DATABASE_URL`
6. Value: Your MySQL connection string
7. "Add" click karen

---

## 🔧 MySQL Database Tables

Bot automatically ye tables bana dega first run par:

### Table 1: phone_numbers
```sql
CREATE TABLE phone_numbers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  number VARCHAR(20) NOT NULL UNIQUE,
  country VARCHAR(5) NOT NULL,
  countryFlag VARCHAR(10),
  isAvailable TINYINT DEFAULT 1,
  assignedToTelegramId VARCHAR(50),
  assignedAt DATETIME,
  usageCount INT DEFAULT 0,
  lastUsedAt DATETIME,
  deletedAt DATETIME,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Table 2: telegram_users
```sql
CREATE TABLE telegram_users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  telegramId VARCHAR(50) NOT NULL UNIQUE,
  firstName VARCHAR(100),
  lastName VARCHAR(100),
  username VARCHAR(100),
  currentPhoneNumberId INT,
  isVerified TINYINT DEFAULT 0,
  totalRequests INT DEFAULT 0,
  totalOtpRequests INT DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Table 3: otp_logs
```sql
CREATE TABLE otp_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  telegramId VARCHAR(50),
  phoneNumberId INT,
  phoneNumber VARCHAR(20),
  otpCode VARCHAR(20),
  status VARCHAR(50),
  requestedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Note:** Ye tables automatic ban jayenge - manually kuch karne ki zaroorat nahi!

---

## ✅ Connection Test Kaise Karen

### Method 1: Railway Logs Dekhen

Deploy karne ke baad:
1. Railway Dashboard → Deployments
2. Latest deployment click karen
3. "View Logs" dekhen

**Success Message:**
```
✅ Database initialized successfully
🤖 Bot started successfully!
```

### Method 2: Bot Ko Test Karen

1. Telegram par bot ko `/start` bhejein
2. Agar bot respond kare = Database connected ✅
3. Agar error aaye = Check logs for connection error

---

## 🐛 Troubleshooting

### Issue 1: "Connection refused"

**Solution:**
```bash
# Check DATABASE_URL format
mysql://username:password@host:port/database
```

Ensure:
- Username correct hai
- Password correct hai
- Host reachable hai
- Port correct hai (usually 3306)

### Issue 2: "Access denied for user"

**Solution:**
- Username/password verify karen
- Database permissions check karen
- Railway addon use kar rahe hain to automatically theek hoga

### Issue 3: "Unknown database"

**Solution:**
Railway MySQL addon use karen - automatic database creation

Or manually database banayen:
```sql
CREATE DATABASE otp_bot_db;
```

### Issue 4: "Too many connections"

**Solution:**
Code mein connection pooling already hai:
```javascript
connectionLimit: 10
```

Railway free tier sufficient hai.

---

## 📊 Database Management

### View Data (Optional):

Railway dashboard mein MySQL service:
1. "Connect" tab
2. Database credentials dekhen
3. MySQL client use karen (optional)

### Popular MySQL Clients:
- **MySQL Workbench** (Desktop)
- **phpMyAdmin** (Web)
- **TablePlus** (Desktop, Mac/Windows)
- **DBeaver** (Desktop, Free)

---

## 🎯 Quick Setup Summary

### For Railway (Easiest):

1. ✅ Railway project banayen
2. ✅ MySQL addon add karen (+New → Database → MySQL)
3. ✅ Bot service deploy karen
4. ✅ Done! DATABASE_URL automatic set ho gaya

### DATABASE_URL Automatic Format:
```
mysql://root:xxxxxx@mysql.railway.internal:3306/railway
```

Railway automatically inject kar dega - **manual setup ki zaroorat nahi!**

---

## 💡 Best Practices

1. **Railway MySQL addon use karen** - sabse aasan
2. **DATABASE_URL ko .env file mein** kabhi commit na karen
3. **Connection pooling** already code mein hai
4. **Tables automatic** ban jayenge
5. **Regular backups** (Railway provides this)

---

## 🔐 Security Notes

1. **DATABASE_URL** kabhi public na karen
2. **Railway dashboard** se hi manage karen
3. **Strong password** use karen (Railway auto-generates)
4. **SSL connection** Railway automatically provide karta hai

---

## 📞 Common Questions

**Q: Kya manually database banana hoga?**
A: Nahi! Railway automatic MySQL provision karta hai.

**Q: Tables manually banana hoga?**
A: Nahi! Bot first run par automatic create karta hai.

**Q: Cost kitna hai?**
A: Railway $5/month free credits - bot + MySQL dono ke liye enough!

**Q: Data backup?**
A: Railway automatic backups provide karta hai.

**Q: Connection limit?**
A: Code mein 10 connections pooling - sufficient hai.

---

## ✅ Final Checklist

Deploy se pehle:
- [ ] Railway MySQL addon add kiya
- [ ] Bot service deploy kiya
- [ ] Logs mein "Database initialized successfully" dikha
- [ ] Bot `/start` command respond kar raha hai
- [ ] Admin `/addnumbers` command test kiya
- [ ] Numbers successfully add ho gaye

**Sab green ho to MySQL perfectly connected hai!** 🎉

---

## 🚀 Example: Complete Setup

```bash
# Step 1: Railway Project
railway.app → New Project → Deploy from GitHub

# Step 2: Add MySQL
Project → + New → Database → MySQL
# DATABASE_URL automatic set ho jayega

# Step 3: Deploy Bot
# Bot automatically MySQL se connect ho jayega

# Step 4: Check Logs
Deployments → View Logs
# Dekhen: "✅ Database initialized successfully"

# Step 5: Test
Telegram → /start → Bot responds ✅
```

**That's it! MySQL connected!** 🎉
