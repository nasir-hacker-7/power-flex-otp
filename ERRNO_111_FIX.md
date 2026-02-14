# 🔧 Quick Fix for errno: -111

## ✅ Railway MySQL Variables Dekh Liye!

Aapke MySQL service mein ye variables hain:
- MYSQL_URL (Internal - Private network)
- MYSQL_PUBLIC_URL (External - Public network)

## 🎯 Bot Service Mein DATABASE_URL Set Karen:

### **Option 1: Railway Internal URL (Recommended)**

Bot service → Variables → Add/Edit:

```
Name: DATABASE_URL
Value: ${{MySQL.MYSQL_URL}}
```

### **Option 2: Direct Complete URL**

Agar upar wala kaam na kare, to ye use karen:

```
Name: DATABASE_URL  
Value: mysql://root:ixBJCmMCsSopJJTXnSExBVcQajhiBGnn@${{MySQL.RAILWAY_PRIVATE_DOMAIN}}:3306/railway
```

### **Option 3: Manual Complete String (Last Resort)**

Railway variables se manually construct karen:

```
Name: DATABASE_URL
Value: mysql://root:ixBJCmMCsSopJJTXnSExBVcQajhiBGnn@{PRIVATE_DOMAIN}:3306/railway
```

Replace `{PRIVATE_DOMAIN}` with actual Railway private domain.

## 📋 Complete Steps:

```
STEP 1: Bot service click karen
        ↓
STEP 2: "Variables" tab
        ↓
STEP 3: Find "DATABASE_URL"
        ↓
STEP 4: Edit ya Add karen:
        Name: DATABASE_URL
        Value: ${{MySQL.MYSQL_URL}}
        ↓
STEP 5: "Add" ya "Update" click karen
        ↓
STEP 6: Bot automatic restart hoga
        ↓
STEP 7: Logs check karen (30 seconds wait)
        ↓
STEP 8: Success! ✅
```

## ✅ Expected Logs After Fix:

```
✅ Database connection successful
📊 Creating tables...
✅ Table phone_numbers created/verified
✅ Table telegram_users created/verified
✅ Table otp_logs created/verified
📋 Tables in database: phone_numbers, telegram_users, otp_logs
✅ Database initialized successfully
🤖 Bot started successfully!
Bot username: your_bot_name
```

## 🔍 Variable Reference Explained:

Railway automatically variables ko link karta hai:

```
${{MySQL.MYSQL_URL}}
     ↑      ↑
     |      └── Variable name in MySQL service
     └────────── Service name
```

Ye Railway ko batata hai ki MySQL service se MYSQL_URL variable use karo.

## 💡 Why This Works:

Railway ke services ek doosre se internal network pe connect hote hain:
- `RAILWAY_PRIVATE_DOMAIN` = Internal hostname
- Port `3306` = MySQL default port
- Database name = `railway`

## 🚨 Common Mistakes to Avoid:

❌ **Don't use:**
```
DATABASE_URL=mysql://localhost:3306/railway
DATABASE_URL=mysql://127.0.0.1:3306/railway
DATABASE_URL=${{DATABASE_URL}}  (circular reference)
```

✅ **Use:**
```
DATABASE_URL=${{MySQL.MYSQL_URL}}
```

## 🎊 After Setting DATABASE_URL:

1. Bot service automatic restart hogi
2. 30-60 seconds wait karen
3. Logs mein success messages dekhni chahiye
4. Telegram par `/start` test karen

Done! 🚀
