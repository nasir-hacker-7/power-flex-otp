const TelegramBot = require('node-telegram-bot-api');
const mysql = require('mysql2/promise');
const axios = require('axios');

// Environment variables
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8526222698:AAHej5d8w8kHtGhwYzGVmXs1n_TMjgaJ8wc';
const ADMIN_ID = process.env.ADMIN_ID || '8290661165';
const DP_NUMBERS_CHANNEL = process.env.DP_NUMBERS_CHANNEL || 'https://t.me/dp_numbers';
const DP_OTP_ZONE_CHANNEL = process.env.DP_OTP_ZONE_CHANNEL || 'https://t.me/dp_otp_zone';
const OTP_API_URL = process.env.OTP_API_URL || 'http://51.77.216.195/crapi/dgroup/viewstats';
const OTP_API_TOKEN = process.env.OTP_API_TOKEN || 'RVBXRjRSQouDZnhDQZBYSWdqj2tZlWp7VnFUf3hSdVeEjXV1gGeP';
const DATABASE_URL = process.env.DATABASE_URL;

// Create bot instance
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// Database connection pool
let pool;

// Message deduplication
const processingMessages = new Map();
const MESSAGE_DEDUP_WINDOW = 2000; // 2 seconds

// Track last message ID for each user (for deletion)
const userLastMessages = new Map();

// Rate limiting
const userRateLimit = new Map();
const RATE_LIMIT_WINDOW = 15000; // 15 seconds (reduced from 60)

// Country flags
const COUNTRY_FLAGS = {
  PK: '🇵🇰',
  TZ: '🇹🇿',
  IN: '🇮🇳',
  BD: '🇧🇩',
  NG: '🇳🇬',
  KE: '🇰🇪',
  UG: '🇺🇬',
  GH: '🇬🇭',
  ZA: '🇿🇦',
  EG: '🇪🇬'
};

const COUNTRY_NAMES = {
  PK: 'Pakistan',
  TZ: 'Tanzania',
  IN: 'India',
  BD: 'Bangladesh',
  NG: 'Nigeria',
  KE: 'Kenya',
  UG: 'Uganda',
  GH: 'Ghana',
  ZA: 'South Africa',
  EG: 'Egypt'
};

// Initialize database
async function initDatabase() {
  let retries = 3;
  let lastError = null;

  while (retries > 0) {
    try {
      // Check if DATABASE_URL is set
      if (!DATABASE_URL) {
        console.error('❌ DATABASE_URL not set! Please add MySQL addon in Railway.');
        console.log('Steps:');
        console.log('1. Go to Railway dashboard');
        console.log('2. Click "+ New"');
        console.log('3. Select "Database"');
        console.log('4. Click "Add MySQL"');
        process.exit(1);
      }

      pool = mysql.createPool({
        uri: DATABASE_URL,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0
      });

      // Test connection
      const connection = await pool.getConnection();
      console.log('✅ Database connection successful');
      
      // Create tables if they don't exist
      console.log('📊 Creating tables...');

      await connection.query(`
        CREATE TABLE IF NOT EXISTS phone_numbers (
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
        )
      `);
      console.log('✅ Table phone_numbers created/verified');

      await connection.query(`
        CREATE TABLE IF NOT EXISTS telegram_users (
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
        )
      `);
      console.log('✅ Table telegram_users created/verified');

      await connection.query(`
        CREATE TABLE IF NOT EXISTS otp_logs (
          id INT PRIMARY KEY AUTO_INCREMENT,
          telegramId VARCHAR(50),
          phoneNumberId INT,
          phoneNumber VARCHAR(20),
          otpCode VARCHAR(20),
          status VARCHAR(50),
          requestedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ Table otp_logs created/verified');

      // Verify tables exist
      const [tables] = await connection.query('SHOW TABLES');
      console.log('📋 Tables in database:', tables.map(t => Object.values(t)[0]).join(', '));

      connection.release();
      console.log('✅ Database initialized successfully');
      return; // Success, exit retry loop

    } catch (error) {
      lastError = error;
      retries--;
      console.error(`❌ Database initialization error (${3 - retries}/3):`, error.message);
      
      if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        console.error('');
        console.error('🔧 Fix Steps:');
        console.error('1. Make sure MySQL addon is added in Railway');
        console.error('2. Check DATABASE_URL environment variable is set');
        console.error('3. Restart the bot service');
        console.error('');
      }

      if (retries > 0) {
        console.log(`⏳ Retrying in 5 seconds... (${retries} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }

  // If all retries failed
  console.error('❌ Failed to initialize database after 3 attempts');
  throw lastError;
}

// Check if user is in required channels
async function checkUserVerification(userId) {
  try {
    const channel1 = '@dp_numbers';
    const channel2 = '@dp_otp_zone';

    const [member1, member2] = await Promise.all([
      bot.getChatMember(channel1, userId).catch(() => null),
      bot.getChatMember(channel2, userId).catch(() => null)
    ]);

    const isVerified = 
      member1 && ['member', 'administrator', 'creator'].includes(member1.status) &&
      member2 && ['member', 'administrator', 'creator'].includes(member2.status);

    return isVerified;
  } catch (error) {
    console.error('Verification check error:', error);
    return false;
  }
}

// Get or create user
async function getOrCreateUser(msg) {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(
      'SELECT * FROM telegram_users WHERE telegramId = ?',
      [msg.from.id.toString()]
    );

    if (rows.length > 0) {
      return rows[0];
    }

    await connection.query(
      'INSERT INTO telegram_users (telegramId, firstName, lastName, username) VALUES (?, ?, ?, ?)',
      [msg.from.id.toString(), msg.from.first_name, msg.from.last_name || '', msg.from.username || '']
    );

    const [newRows] = await connection.query(
      'SELECT * FROM telegram_users WHERE telegramId = ?',
      [msg.from.id.toString()]
    );

    return newRows[0];
  } finally {
    connection.release();
  }
}

// Check rate limit
function checkRateLimit(userId) {
  const now = Date.now();
  const lastRequest = userRateLimit.get(userId);
  
  if (lastRequest && now - lastRequest < RATE_LIMIT_WINDOW) {
    return false;
  }
  
  userRateLimit.set(userId, now);
  return true;
}

// Allocate phone number
async function allocatePhoneNumber(userId, country) {
  const connection = await pool.getConnection();
  try {
    // Check rate limit
    if (!checkRateLimit(userId)) {
      return { error: '⏰ Please wait 15 seconds before requesting another number.' };
    }

    // Get available number for selected country
    const [numbers] = await connection.query(
      'SELECT * FROM phone_numbers WHERE country = ? AND isAvailable = 1 AND deletedAt IS NULL LIMIT 1',
      [country]
    );

    if (numbers.length === 0) {
      return { error: '❌ Numbers not available. Try another country.' };
    }

    const phoneNumber = numbers[0];

    // Update number as allocated
    await connection.query(
      'UPDATE phone_numbers SET isAvailable = 0, assignedToTelegramId = ?, assignedAt = NOW() WHERE id = ?',
      [userId.toString(), phoneNumber.id]
    );

    // Update user's current number
    await connection.query(
      'UPDATE telegram_users SET currentPhoneNumberId = ?, totalRequests = totalRequests + 1 WHERE telegramId = ?',
      [phoneNumber.id, userId.toString()]
    );

    return { success: true, phoneNumber };
  } finally {
    connection.release();
  }
}

// Fetch OTP from API
async function fetchOTP(phoneNumber) {
  try {
    const cleanNumber = phoneNumber.replace(/\+/g, '');
    const response = await axios.get(OTP_API_URL, {
      params: {
        token: OTP_API_TOKEN,
        number: cleanNumber
      },
      timeout: 15000
    });

    console.log('OTP API Response:', response.data);

    // Check different possible response formats
    if (response.data) {
      // Format 1: Direct OTP in response.data.otp
      if (response.data.otp) {
        return { 
          success: true, 
          otp: response.data.otp, 
          message: response.data.message || 'OTP received successfully!' 
        };
      }
      
      // Format 2: OTP in message field
      if (response.data.message) {
        // Try to extract OTP from message using regex
        const otpMatch = response.data.message.match(/\b\d{4,8}\b/);
        if (otpMatch) {
          return { 
            success: true, 
            otp: otpMatch[0], 
            message: response.data.message 
          };
        }
      }

      // Format 3: Check if entire response contains OTP
      const responseStr = JSON.stringify(response.data);
      const otpMatch = responseStr.match(/\b\d{4,8}\b/);
      if (otpMatch) {
        return { 
          success: true, 
          otp: otpMatch[0], 
          message: 'OTP extracted from response' 
        };
      }
    }

    return { error: '❌ No OTP found yet. Please wait a few seconds and try again.' };
  } catch (error) {
    console.error('OTP API Error:', error.message);
    
    if (error.response) {
      console.error('API Response Error:', error.response.data);
      
      // Check if rate limited
      if (error.response.status === 429 || 
          (error.response.data && typeof error.response.data === 'string' && 
           error.response.data.includes('too many times'))) {
        return { error: '⏰ Rate limit reached. Please wait 1 minute and try again.' };
      }
    }
    
    return { error: '❌ Failed to fetch OTP. Please try again in a few seconds.' };
  }
}

// /start command
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  try {
    // Delete old bot message if exists
    const lastMsgId = userLastMessages.get(userId);
    if (lastMsgId) {
      try {
        await bot.deleteMessage(chatId, lastMsgId);
      } catch (e) {
        // Message already deleted or too old
      }
    }

    const user = await getOrCreateUser(msg);
    const isVerified = await checkUserVerification(userId);

    if (!isVerified) {
      // Send welcome image with channel buttons
      const sentMsg = await bot.sendPhoto(chatId, './welcome-image.jpg', {
        caption: `👋 *Welcome!*\n\n` +
          `Join our channels to get started:`,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: '⚜️ Join POWER_NUMBR', url: DP_NUMBERS_CHANNEL }],
            [{ text: '⚜️ Join POWER OTP', url: DP_OTP_ZONE_CHANNEL }],
            [{ text: '⚡ VERIFY & START', callback_data: 'verify' }]
          ]
        }
      });
      userLastMessages.set(userId, sentMsg.message_id);
    } else {
      // Send welcome image with get number button
      const sentMsg = await bot.sendPhoto(chatId, './welcome-image.jpg', {
        caption: `👋 *Welcome!*`,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: '📱 Get Number', callback_data: 'get_number' }]
          ]
        }
      });
      userLastMessages.set(userId, sentMsg.message_id);
    }
  } catch (error) {
    console.error('Start command error:', error);
    // Fallback to text-only message if image fails
    await bot.sendMessage(chatId, 
      `👋 Welcome!\n\n` +
      `Join our channels to get started.`,
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: '⚜️ Join Channel 1', url: DP_NUMBERS_CHANNEL }],
            [{ text: '⚜️ Join Channel 2', url: DP_OTP_ZONE_CHANNEL }],
            [{ text: '⚡ VERIFY & START', callback_data: 'verify' }]
          ]
        }
      }
    );
  }
});

// /help command
bot.onText(/\/help/, async (msg) => {
  const chatId = msg.chat.id;
  
  await bot.sendMessage(chatId,
    `📖 *How to Use This Bot*\n\n` +
    `1️⃣ Join both required channels\n` +
    `2️⃣ Click "Verify Membership"\n` +
    `3️⃣ Click "Get Number"\n` +
    `4️⃣ Select your country\n` +
    `5️⃣ Use the number for OTP\n` +
    `6️⃣ Click "Check SMS" to get OTP\n\n` +
    `💡 Commands:\n` +
    `/start - Start the bot\n` +
    `/help - Show this help`,
    { parse_mode: 'Markdown' }
  );
});

// /addnumbers command (Admin only)
bot.onText(/\/addnumbers (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  if (userId.toString() !== ADMIN_ID) {
    await bot.sendMessage(chatId, '❌ This command is only for admins.');
    return;
  }

  const country = match[1].toUpperCase();
  
  // Accept any 2-3 letter country code
  if (country.length < 2 || country.length > 3 || !/^[A-Z]+$/.test(country)) {
    await bot.sendMessage(chatId, 
      `❌ Invalid country code format.\n\n` +
      `Use 2 or 3 letter country codes:\n` +
      `Examples: PK, IN, US, ZW, etc.\n\n` +
      `Common countries:\n` +
      `${Object.keys(COUNTRY_FLAGS).map(code => `${COUNTRY_FLAGS[code]} ${code} - ${COUNTRY_NAMES[code]}`).join('\n')}`
    );
    return;
  }

  // Get flag and name if available, otherwise use defaults
  const countryFlag = COUNTRY_FLAGS[country] || '🌍';
  const countryName = COUNTRY_NAMES[country] || country;

  await bot.sendMessage(chatId, 
    `📝 Adding numbers for ${countryFlag} ${countryName}\n\n` +
    `Please send phone numbers (one per line):\n\n` +
    `Format:\n` +
    `923366413930\n` +
    `923366413931\n` +
    `or\n` +
    `+923366413930\n` +
    `+923366413931`
  );

  // Listen for next message with numbers
  const messageListener = async (reply) => {
    if (reply.chat.id !== chatId || reply.from.id.toString() !== ADMIN_ID) return;

    // Remove the listener
    bot.removeListener('message', messageListener);

    const numbers = reply.text
      .split('\n')
      .map(n => n.trim())
      .filter(n => n.length > 0)
      .map(n => {
        // Add + if not present
        if (!n.startsWith('+')) {
          return '+' + n;
        }
        return n;
      });

    const connection = await pool.getConnection();
    
    try {
      let added = 0;
      let skipped = 0;

      for (const number of numbers) {
        try {
          await connection.query(
            'INSERT INTO phone_numbers (number, country, countryFlag) VALUES (?, ?, ?)',
            [number, country, countryFlag]
          );
          added++;
        } catch (error) {
          if (error.code === 'ER_DUP_ENTRY') {
            skipped++;
          } else {
            console.error('Error adding number:', error);
            skipped++;
          }
        }
      }

      await bot.sendMessage(chatId, 
        `✅ *Numbers Added!*\n\n` +
        `${countryFlag} Country: *${countryName}*\n` +
        `Code: ${country}\n\n` +
        `➕ Added: ${added}\n` +
        `⏭️ Skipped (duplicates): ${skipped}\n` +
        `📊 Total processed: ${numbers.length}`,
        { parse_mode: 'Markdown' }
      );

      // Show sample of added numbers
      if (added > 0) {
        const sampleNumbers = numbers.slice(0, 3).join('\n');
        await bot.sendMessage(chatId,
          `📱 Sample numbers added:\n\`\`\`\n${sampleNumbers}\n\`\`\``,
          { parse_mode: 'Markdown' }
        );
      }
    } finally {
      connection.release();
    }
  };

  bot.on('message', messageListener);
});

// /broadcast command (Admin only)
bot.onText(/\/broadcast(.*)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  console.log(`Broadcast command from user ${userId}, Admin ID: ${ADMIN_ID}`);

  if (userId.toString() !== ADMIN_ID) {
    await bot.sendMessage(chatId, '❌ This command is only for admins.');
    return;
  }

  // Check if message is provided directly after command
  const messageText = match[1].trim();
  
  if (messageText) {
    // Broadcast directly if message provided
    await broadcastMessage(chatId, messageText, null);
    return;
  }

  // Otherwise ask for message
  await bot.sendMessage(chatId,
    `📢 *Broadcast Message*\n\n` +
    `Send the message you want to broadcast to all users.\n\n` +
    `*Option 1:* Send text message now\n` +
    `*Option 2:* Use: \`/broadcast Your message here\`\n\n` +
    `You can send:\n` +
    `• Text message\n` +
    `• Photo with caption\n` +
    `• Any message type`,
    { parse_mode: 'Markdown' }
  );

  // Listen for broadcast message
  const broadcastListener = async (reply) => {
    if (reply.chat.id !== chatId || reply.from.id.toString() !== ADMIN_ID) return;
    
    // Ignore if it's another command
    if (reply.text && reply.text.startsWith('/')) return;

    // Remove the listener
    bot.removeListener('message', broadcastListener);

    // Broadcast the message
    if (reply.photo) {
      await broadcastMessage(chatId, reply.caption || '', reply.photo[reply.photo.length - 1].file_id, 'photo');
    } else if (reply.text) {
      await broadcastMessage(chatId, reply.text, null);
    } else if (reply.document) {
      await broadcastMessage(chatId, reply.caption || '', reply.document.file_id, 'document');
    } else if (reply.video) {
      await broadcastMessage(chatId, reply.caption || '', reply.video.file_id, 'video');
    } else {
      await bot.sendMessage(chatId, '❌ Unsupported message type.');
    }
  };

  bot.on('message', broadcastListener);
  
  // Auto-remove listener after 5 minutes
  setTimeout(() => {
    bot.removeListener('message', broadcastListener);
  }, 300000);
});

// Broadcast helper function
async function broadcastMessage(adminChatId, text, mediaFileId = null, mediaType = null) {
  const connection = await pool.getConnection();
  try {
    const [users] = await connection.query('SELECT DISTINCT telegramId FROM telegram_users');
    
    if (users.length === 0) {
      await bot.sendMessage(adminChatId, '❌ No users found in database.');
      return;
    }

    await bot.sendMessage(adminChatId,
      `📤 *Broadcasting to ${users.length} users...*\n\n` +
      `Please wait...`,
      { parse_mode: 'Markdown' }
    );

    let sent = 0;
    let failed = 0;

    // Broadcast to all users
    for (const user of users) {
      try {
        if (mediaType === 'photo' && mediaFileId) {
          await bot.sendPhoto(user.telegramId, mediaFileId, {
            caption: text || ''
          });
        } else if (mediaType === 'document' && mediaFileId) {
          await bot.sendDocument(user.telegramId, mediaFileId, {
            caption: text || ''
          });
        } else if (mediaType === 'video' && mediaFileId) {
          await bot.sendVideo(user.telegramId, mediaFileId, {
            caption: text || ''
          });
        } else if (text) {
          await bot.sendMessage(user.telegramId, text);
        }
        sent++;
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 50));
      } catch (error) {
        failed++;
        console.error(`Failed to send to ${user.telegramId}:`, error.message);
      }
    }

    await bot.sendMessage(adminChatId,
      `✅ *Broadcast Complete!*\n\n` +
      `📤 Sent: ${sent}\n` +
      `❌ Failed: ${failed}\n` +
      `📊 Total: ${users.length}`,
      { parse_mode: 'Markdown' }
    );

  } finally {
    connection.release();
  }
}

// /stats command (Admin only) - Show bot statistics
bot.onText(/\/stats/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  if (userId.toString() !== ADMIN_ID) {
    await bot.sendMessage(chatId, '❌ This command is only for admins.');
    return;
  }

  const connection = await pool.getConnection();
  try {
    // Get statistics
    const [totalUsers] = await connection.query('SELECT COUNT(*) as count FROM telegram_users');
    const [verifiedUsers] = await connection.query('SELECT COUNT(*) as count FROM telegram_users WHERE isVerified = 1');
    const [totalNumbers] = await connection.query('SELECT COUNT(*) as count FROM phone_numbers');
    const [availableNumbers] = await connection.query('SELECT COUNT(*) as count FROM phone_numbers WHERE isAvailable = 1 AND deletedAt IS NULL');
    const [deletedNumbers] = await connection.query('SELECT COUNT(*) as count FROM phone_numbers WHERE deletedAt IS NOT NULL');
    const [totalOTPRequests] = await connection.query('SELECT COUNT(*) as count FROM otp_logs');
    const [successfulOTPs] = await connection.query('SELECT COUNT(*) as count FROM otp_logs WHERE status = "success"');
    
    // Numbers by country
    const [numbersByCountry] = await connection.query(
      'SELECT country, COUNT(*) as count FROM phone_numbers WHERE deletedAt IS NULL GROUP BY country ORDER BY count DESC'
    );

    let countryStats = '';
    if (numbersByCountry.length > 0) {
      countryStats = numbersByCountry.map(row => 
        `${COUNTRY_FLAGS[row.country] || ''} ${COUNTRY_NAMES[row.country] || row.country}: ${row.count}`
      ).join('\n');
    }

    await bot.sendMessage(chatId,
      `📊 *Bot Statistics*\n\n` +
      `👥 *Users:*\n` +
      `Total: ${totalUsers[0].count}\n` +
      `Verified: ${verifiedUsers[0].count}\n\n` +
      `📱 *Numbers:*\n` +
      `Total: ${totalNumbers[0].count}\n` +
      `Available: ${availableNumbers[0].count}\n` +
      `Used/Deleted: ${deletedNumbers[0].count}\n\n` +
      `${countryStats ? '🌍 *By Country:*\n' + countryStats + '\n\n' : ''}` +
      `📨 *OTP Requests:*\n` +
      `Total: ${totalOTPRequests[0].count}\n` +
      `Successful: ${successfulOTPs[0].count}`,
      { parse_mode: 'Markdown' }
    );

  } finally {
    connection.release();
  }
});

// Callback query handler
bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const userId = query.from.id;
  const data = query.data;
  const messageId = query.message.message_id;

  // Message deduplication
  const dedupKey = `${userId}-${data}`;
  if (processingMessages.has(dedupKey)) {
    await bot.answerCallbackQuery(query.id, { text: 'Processing...' });
    return;
  }

  processingMessages.set(dedupKey, true);
  setTimeout(() => processingMessages.delete(dedupKey), MESSAGE_DEDUP_WINDOW);

  try {
    if (data === 'verify') {
      const isVerified = await checkUserVerification(userId);
      
      if (isVerified) {
        // Delete old message and send new one with image
        try {
          await bot.deleteMessage(chatId, messageId);
        } catch (e) {}

        const sentMsg = await bot.sendPhoto(chatId, './welcome-image.jpg', {
          caption: `✅ *Verification successful!*\n\n` +
            `👋 *Welcome!*`,
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [{ text: '📱 Get Number', callback_data: 'get_number' }]
            ]
          }
        });
        userLastMessages.set(userId, sentMsg.message_id);

        const connection = await pool.getConnection();
        await connection.query(
          'UPDATE telegram_users SET isVerified = 1 WHERE telegramId = ?',
          [userId.toString()]
        );
        connection.release();
      } else {
        await bot.answerCallbackQuery(query.id, {
          text: '❌ Please join both channels first!',
          show_alert: true
        });
      }
    }

    else if (data === 'get_number') {
      const isVerified = await checkUserVerification(userId);
      
      if (!isVerified) {
        await bot.answerCallbackQuery(query.id, {
          text: '❌ Please verify your membership first!',
          show_alert: true
        });
        return;
      }

      // Get only countries that have available numbers in database
      const connection = await pool.getConnection();
      const [availableCountries] = await connection.query(
        'SELECT DISTINCT country, countryFlag FROM phone_numbers WHERE isAvailable = 1 AND deletedAt IS NULL ORDER BY country'
      );
      connection.release();

      if (availableCountries.length === 0) {
        await bot.answerCallbackQuery(query.id, {
          text: '❌ Numbers not available. Contact admin.',
          show_alert: true
        });
        return;
      }

      // Delete old message
      try {
        await bot.deleteMessage(chatId, messageId);
      } catch (e) {}

      // Show countries with image
      const keyboard = availableCountries.map(country => [
        { 
          text: `${country.countryFlag || COUNTRY_FLAGS[country.country]} ${COUNTRY_NAMES[country.country] || country.country}`, 
          callback_data: `country_${country.country}` 
        }
      ]);

      const sentMsg = await bot.sendPhoto(chatId, './welcome-image.jpg', {
        caption: `🌍 *Select Country*\n` +
          `Found ${availableCountries.length} countries.`,
        parse_mode: 'Markdown',
        reply_markup: { inline_keyboard: keyboard }
      });
      userLastMessages.set(userId, sentMsg.message_id);
    }

    else if (data.startsWith('country_')) {
      const country = data.replace('country_', '');
      const result = await allocatePhoneNumber(userId, country);

      if (result.error) {
        await bot.answerCallbackQuery(query.id, {
          text: result.error,
          show_alert: true
        });
        return;
      }

      // Delete old message
      try {
        await bot.deleteMessage(chatId, messageId);
      } catch (e) {}

      const phoneNumber = result.phoneNumber;
      const sentMsg = await bot.sendPhoto(chatId, './welcome-image.jpg', {
        caption: `📡 *Server:* NUMBER PANEL 🔥\n` +
          `${countryFlag || COUNTRY_FLAGS[country] || "🌍"} *Country:* ${COUNTRY_NAMES[country] || country}\n` +
          `📱 *Number:* \`${phoneNumber.number}\``,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: '📨 GET OTP CODE', callback_data: 'check_sms' }],
            [{ text: '🔄 Change Number', callback_data: `change_number_${country}` }],
            [{ text: '🔙 Main Menu', callback_data: 'main_menu' }]
          ]
        }
      });
      userLastMessages.set(userId, sentMsg.message_id);
    }

    else if (data === 'main_menu') {
      // Delete old message
      try {
        await bot.deleteMessage(chatId, messageId);
      } catch (e) {}

      const sentMsg = await bot.sendPhoto(chatId, './welcome-image.jpg', {
        caption: `👋 *Welcome!*`,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: '📱 Get Number', callback_data: 'get_number' }]
          ]
        }
      });
      userLastMessages.set(userId, sentMsg.message_id);
    }

    else if (data.startsWith('change_number_')) {
      const country = data.replace('change_number_', '');
      
      // Release current number
      const connection = await pool.getConnection();
      await connection.query(
        'UPDATE phone_numbers SET isAvailable = 1, assignedToTelegramId = NULL WHERE assignedToTelegramId = ?',
        [userId.toString()]
      );
      await connection.query(
        'UPDATE telegram_users SET currentPhoneNumberId = NULL WHERE telegramId = ?',
        [userId.toString()]
      );
      connection.release();

      // Allocate new number from same country
      const result = await allocatePhoneNumber(userId, country);

      if (result.error) {
        await bot.answerCallbackQuery(query.id, {
          text: result.error,
          show_alert: true
        });
        return;
      }

      // Delete old message
      try {
        await bot.deleteMessage(chatId, messageId);
      } catch (e) {}

      const phoneNumber = result.phoneNumber;
      const sentMsg = await bot.sendPhoto(chatId, './welcome-image.jpg', {
        caption: `📡 *Server:* NUMBER PANEL 🔥\n` +
          `${countryFlag || COUNTRY_FLAGS[country] || "🌍"} *Country:* ${COUNTRY_NAMES[country] || country}\n` +
          `📱 *Number:* \`${phoneNumber.number}\``,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: '📨 GET OTP CODE', callback_data: 'check_sms' }],
            [{ text: '🔄 Change Number', callback_data: `change_number_${country}` }],
            [{ text: '🔙 Main Menu', callback_data: 'main_menu' }]
          ]
        }
      });
      userLastMessages.set(userId, sentMsg.message_id);
    }

    else if (data === 'check_sms') {
      await bot.answerCallbackQuery(query.id, { text: '📨 Checking for SMS...' });

      const connection = await pool.getConnection();
      const [users] = await connection.query(
        'SELECT u.*, p.number, p.country, p.countryFlag FROM telegram_users u ' +
        'LEFT JOIN phone_numbers p ON u.currentPhoneNumberId = p.id ' +
        'WHERE u.telegramId = ?',
        [userId.toString()]
      );
      connection.release();

      if (users.length === 0 || !users[0].number) {
        await bot.answerCallbackQuery(query.id, {
          text: '❌ No number assigned. Please get a number first.',
          show_alert: true
        });
        return;
      }

      const phoneNumber = users[0].number;
      const country = users[0].country;
      const countryFlag = users[0].countryFlag || COUNTRY_FLAGS[country];
      const countryName = COUNTRY_NAMES[country] || country;

      const otpResult = await fetchOTP(phoneNumber);

      // Delete old message
      try {
        await bot.deleteMessage(chatId, messageId);
      } catch (e) {}

      if (otpResult.error) {
        // Show "No OTP found yet" status with image
        try {
          const sentMsg = await bot.sendPhoto(chatId, './welcome-image.jpg', {
            caption: `📡 *Server:* NUMBER PANEL 🔥\n` +
              `${countryFlag} *Country:* ${countryName}\n` +
              `📱 *Number:* \`${phoneNumber}\`\n` +
              `⚠️ *Status:* No OTP found yet.`,
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [
                [{ text: '📨 GET OTP CODE', callback_data: 'check_sms' }],
                [{ text: '🔄 Change Number', callback_data: `change_number_${country}` }],
                [{ text: '🔙 Main Menu', callback_data: 'main_menu' }]
              ]
            }
          });
          userLastMessages.set(userId, sentMsg.message_id);
        } catch (imgError) {
          // Fallback to text-only if image fails
          console.error('Image send failed, using text fallback:', imgError.message);
          const sentMsg = await bot.sendMessage(chatId,
            `📡 *Server:* NUMBER PANEL 🔥\n` +
            `${countryFlag} *Country:* ${countryName}\n` +
            `📱 *Number:* \`${phoneNumber}\`\n` +
            `⚠️ *Status:* No OTP found yet.`,
            {
              parse_mode: 'Markdown',
              reply_markup: {
                inline_keyboard: [
                  [{ text: '📨 GET OTP CODE', callback_data: 'check_sms' }],
                  [{ text: '🔄 Change Number', callback_data: `change_number_${country}` }],
                  [{ text: '🔙 Main Menu', callback_data: 'main_menu' }]
                ]
              }
            }
          );
          userLastMessages.set(userId, sentMsg.message_id);
        }

        // Log failed attempt
        const connection2 = await pool.getConnection();
        await connection2.query(
          'INSERT INTO otp_logs (telegramId, phoneNumber, status) VALUES (?, ?, ?)',
          [userId.toString(), phoneNumber, 'failed']
        );
        connection2.release();
        
        return;
      }

      // Log successful OTP request
      const connection2 = await pool.getConnection();
      await connection2.query(
        'INSERT INTO otp_logs (telegramId, phoneNumber, otpCode, status) VALUES (?, ?, ?, ?)',
        [userId.toString(), phoneNumber, otpResult.otp, 'success']
      );
      await connection2.query(
        'UPDATE telegram_users SET totalOtpRequests = totalOtpRequests + 1 WHERE telegramId = ?',
        [userId.toString()]
      );
      await connection2.query(
        'UPDATE phone_numbers SET usageCount = usageCount + 1, lastUsedAt = NOW() WHERE number = ?',
        [phoneNumber]
      );
      
      // AUTO-DELETE: Mark number as deleted after successful OTP
      await connection2.query(
        'UPDATE phone_numbers SET deletedAt = NOW(), isAvailable = 0 WHERE number = ?',
        [phoneNumber]
      );
      console.log(`🗑️ Auto-deleted number ${phoneNumber} after successful OTP`);
      
      // Clear user's assigned number
      await connection2.query(
        'UPDATE telegram_users SET currentPhoneNumberId = NULL WHERE telegramId = ?',
        [userId.toString()]
      );
      
      connection2.release();

      // Send OTP with nice formatting and image
      try {
        const sentMsg = await bot.sendPhoto(chatId, './welcome-image.jpg', {
          caption: `📡 *Server:* NUMBER PANEL 🔥\n` +
            `${countryFlag} *Country:* ${countryName}\n` +
            `📱 *Number:* \`${phoneNumber}\`\n\n` +
            `🔐 *OTP CODE:* \`${otpResult.otp}\`\n\n` +
            `_Click on the OTP code to copy it_`,
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [{ text: '📨 GET OTP CODE', callback_data: 'check_sms' }],
              [{ text: '🔄 Change Number', callback_data: `change_number_${country}` }],
              [{ text: '🔙 Main Menu', callback_data: 'main_menu' }]
            ]
          }
        });
        userLastMessages.set(userId, sentMsg.message_id);
      } catch (imgError) {
        // Fallback to text-only if image fails
        console.error('Image send failed, using text fallback:', imgError.message);
        const sentMsg = await bot.sendMessage(chatId,
          `📡 *Server:* NUMBER PANEL 🔥\n` +
          `${countryFlag} *Country:* ${countryName}\n` +
          `📱 *Number:* \`${phoneNumber}\`\n\n` +
          `🔐 *OTP CODE:* \`${otpResult.otp}\`\n\n` +
          `_Click on the OTP code to copy it_`,
          {
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [
                [{ text: '📨 GET OTP CODE', callback_data: 'check_sms' }],
                [{ text: '🔄 Change Number', callback_data: `change_number_${country}` }],
                [{ text: '🔙 Main Menu', callback_data: 'main_menu' }]
              ]
            }
          }
        );
        userLastMessages.set(userId, sentMsg.message_id);
      }
    }

    await bot.answerCallbackQuery(query.id);
  } catch (error) {
    console.error('Callback query error:', error);
    await bot.answerCallbackQuery(query.id, {
      text: '❌ An error occurred. Please try again.',
      show_alert: true
    });
  }
});

// Start bot
async function startBot() {
  try {
    await initDatabase();
    console.log('🤖 Bot started successfully!');
    console.log('Bot username:', (await bot.getMe()).username);
  } catch (error) {
    console.error('Failed to start bot:', error);
    process.exit(1);
  }
}

startBot();

// Error handling
bot.on('polling_error', (error) => {
  console.error('Polling error:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection:', error);
});
