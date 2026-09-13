import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';

export const DEFAULT_GOOD_HUMAN_SCORE = 400;

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/railassist';
const DB_NAME = 'railassist';

let cachedClient = global._mongoClient;
let cachedDb = global._mongoDb;
let initialized = false;

export async function connectDB() {
  if (cachedDb && initialized) {
    return cachedDb;
  }

  if (!cachedClient) {
    cachedClient = new MongoClient(MONGODB_URI);
    global._mongoClient = cachedClient;
    await cachedClient.connect();
  }

  const db = cachedClient.db(DB_NAME);
  cachedDb = db;
  global._mongoDb = db;

  if (!initialized) {
    await initializeCollections(db);
    initialized = true;
  }

  return db;
}

export async function getDB() {
  if (cachedDb) return cachedDb;
  return await connectDB();
}

async function initializeCollections(db) {
  try {
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);

    if (!collectionNames.includes('users')) await db.createCollection('users');
    if (!collectionNames.includes('coolies')) await db.createCollection('coolies');
    if (!collectionNames.includes('bookings')) await db.createCollection('bookings');
    if (!collectionNames.includes('complaints')) await db.createCollection('complaints');
    if (!collectionNames.includes('notifications')) await db.createCollection('notifications');
    for (const name of ['reward_catalog', 'reward_plans', 'reward_coupons', 'reward_transactions', 'score_transactions', 'reward_config', 'premium_applications', 'audit_logs']) {
      if (!collectionNames.includes(name)) await db.createCollection(name);
    }
    if (!collectionNames.includes('sequences')) {
      await db.createCollection('sequences');
      await db.collection('sequences').insertMany([
        { _id: 'userId', seq: 1 },
        { _id: 'coolieId', seq: 1 },
        { _id: 'bookingId', seq: 1 },
        { _id: 'complaintId', seq: 1 },
        { _id: 'notificationId', seq: 1 }
      ]);
    }
    if (!await db.collection('sequences').findOne({ _id: 'complaintId' })) {
      await db.collection('sequences').insertOne({ _id: 'complaintId', seq: 1 });
    }
    if (!await db.collection('sequences').findOne({ _id: 'notificationId' })) {
      await db.collection('sequences').insertOne({ _id: 'notificationId', seq: 1 });
    }
    if (!await db.collection('sequences').findOne({ _id: 'scoreTransactionId' })) {
      await db.collection('sequences').insertOne({ _id: 'scoreTransactionId', seq: 1 });
    }
    if (!await db.collection('sequences').findOne({ _id: 'rewardTransactionId' })) {
      await db.collection('sequences').insertOne({ _id: 'rewardTransactionId', seq: 1 });
    }
    await db.collection('reward_transactions').createIndex({ user_id: 1, idempotency_key: 1 }, { unique: true });
    await db.collection('score_transactions').createIndex({ idempotency_key: 1 }, { unique: true });
    await seedRewards(db);

    // Seed default admin
    const adminExists = await db.collection('users').findOne({ email: 'admin@railassist.com' });
    if (!adminExists) {
      await db.collection('users').insertOne({
        id: await nextId('users', db),
        name: 'System Admin',
        email: 'admin@railassist.com',
        password_hash: await bcrypt.hash('0000', 10),
        role: 'ADMIN',
        good_human_score: DEFAULT_GOOD_HUMAN_SCORE,
        created_at: new Date().toISOString()
      });
      console.log('✅ Seeded default admin (admin@railassist.com / 0000)');
    }

    async function seedRewards(db) {
      if (!await db.collection('reward_config').findOne({ _id: 'defaults' })) {
        await db.collection('reward_config').insertOne({ _id: 'defaults', safe_score_threshold: 200, max_score: 1000, coin_name: 'RailCoins' });
      }
      await db.collection('reward_catalog').updateOne({ id: 'tea-voucher-50' }, { $set: { title: '₹50 RailAssist food voucher', description: 'Valid at participating RailAssist food partners.', coupon_code: 'RAILASSIST50' } });
      const plans = [
        ['premium-1-day', 'RailAssist Premium — 1 Day', 1, 75, 29],
        ['premium-1-week', 'RailAssist Premium — 1 Week', 7, 150, 79],
        ['premium-1-month', 'RailAssist Premium — 1 Month', 30, 300, 149],
        ['premium-3-months', 'RailAssist Premium — 3 Months', 90, 750, 349],
        ['premium-6-months', 'RailAssist Premium — 6 Months', 180, 1300, 599],
        ['premium-1-year', 'RailAssist Premium — 1 Year', 365, 2200, 999],
      ];
      await db.collection('reward_plans').updateOne({ id: 'safe-traveller' }, { $set: { active: false } });
      for (const [id, title, duration_days, cost_coins, money_price] of plans) {
        await db.collection('reward_plans').updateOne(
          { id },
          { $set: { title, description: `${title} with priority support and premium rewards.`, duration_days, cost_coins, money_price, currency: 'INR', minimum_score: 0, active: true, benefits: ['Priority support', 'Exclusive RailCoins offers'] } },
          { upsert: true },
        );
      }
    }

    // Seed default employee
    const employeeExists = await db.collection('users').findOne({ email: 'employee1@railassist.com' });
    if (!employeeExists) {
      await db.collection('users').insertOne({
        id: await nextId('users', db),
        name: 'Ramu Porter',
        email: 'employee1@railassist.com',
        password_hash: await bcrypt.hash('0000', 10),
        role: 'PROVIDER',
        good_human_score: DEFAULT_GOOD_HUMAN_SCORE,
        provider_type: 'PORTER',
        station: 'New Delhi',
        available: true,
        rating: 5.0,
        completed_jobs: 0,
        earnings: 0,
        price_per_bag: 60,
        created_at: new Date().toISOString()
      });
      console.log('✅ Seeded default employee (employee1@railassist.com / 0000)');
    }

    const managerExists = await db.collection('users').findOne({ email: 'manager@railassist.com' });
    if (!managerExists) {
      await db.collection('users').insertOne({
        id: await nextId('users', db),
        name: 'Complaints Manager',
        email: 'manager@railassist.com',
        password_hash: await bcrypt.hash('0000', 10),
        role: 'MANAGER',
        good_human_score: DEFAULT_GOOD_HUMAN_SCORE,
        created_at: new Date().toISOString()
      });
      console.log('✅ Seeded complaints manager (manager@railassist.com / 0000)');
    }

    // Seed coolies if empty
    const coolieCount = await db.collection('coolies').countDocuments();
    if (coolieCount === 0) {
      await seedCoolies(db);
    }
  } catch (err) {
    console.error('Error during collection initialization:', err);
  }
}

async function seedCoolies(db) {
  const seedData = [
    { name: 'Ramesh Kumar',   station: 'Mumbai CST',         badge_number: 'MUM001', phone: '9876543210', rating: 4.8, price_per_bag: 60, experience_years: 8,  available: true },
    { name: 'Suresh Yadav',   station: 'Mumbai CST',         badge_number: 'MUM002', phone: '9876543211', rating: 4.5, price_per_bag: 55, experience_years: 5,  available: true },
    { name: 'Anand Patil',    station: 'Mumbai CST',         badge_number: 'MUM003', phone: '9876543222', rating: 4.3, price_per_bag: 50, experience_years: 3,  available: true },
    { name: 'Rajesh Singh',   station: 'New Delhi',          badge_number: 'DEL001', phone: '9876543212', rating: 4.7, price_per_bag: 65, experience_years: 10, available: true },
    { name: 'Mohan Lal',      station: 'New Delhi',          badge_number: 'DEL002', phone: '9876543213', rating: 4.3, price_per_bag: 60, experience_years: 6,  available: true },
    { name: 'Deepak Sharma',  station: 'New Delhi',          badge_number: 'DEL003', phone: '9876543223', rating: 4.6, price_per_bag: 65, experience_years: 7,  available: true },
    { name: 'Kumar Swamy',    station: 'Bengaluru City',     badge_number: 'BLR001', phone: '9876543214', rating: 4.6, price_per_bag: 55, experience_years: 9,  available: true },
    { name: 'Venkat Rao',     station: 'Bengaluru City',     badge_number: 'BLR002', phone: '9876543215', rating: 4.4, price_per_bag: 50, experience_years: 4,  available: true },
    { name: 'Selvam P',       station: 'Chennai Central',    badge_number: 'CHE001', phone: '9876543216', rating: 4.9, price_per_bag: 60, experience_years: 12, available: true },
    { name: 'Murugan K',      station: 'Chennai Central',    badge_number: 'CHE002', phone: '9876543224', rating: 4.5, price_per_bag: 55, experience_years: 6,  available: true },
    { name: 'Arjun Das',      station: 'Kolkata Howrah',     badge_number: 'KOL001', phone: '9876543217', rating: 4.5, price_per_bag: 50, experience_years: 7,  available: true },
    { name: 'Bimal Roy',      station: 'Kolkata Howrah',     badge_number: 'KOL002', phone: '9876543225', rating: 4.2, price_per_bag: 45, experience_years: 4,  available: true },
    { name: 'Pradeep Gupta',  station: 'Ahmedabad Junction', badge_number: 'AHM001', phone: '9876543218', rating: 4.2, price_per_bag: 45, experience_years: 3,  available: true },
    { name: 'Vikram Tiwari',  station: 'Pune Junction',      badge_number: 'PUN001', phone: '9876543219', rating: 4.6, price_per_bag: 55, experience_years: 8,  available: true },
    { name: 'Santosh Mishra', station: 'Hyderabad Deccan',   badge_number: 'HYD001', phone: '9876543220', rating: 4.7, price_per_bag: 55, experience_years: 9,  available: true },
    { name: 'Deepak Nair',    station: 'Kochi Central',      badge_number: 'KOC001', phone: '9876543221', rating: 4.8, price_per_bag: 60, experience_years: 11, available: true },
  ];

  const cooliesWithId = seedData.map((coolie, index) => ({
    id: index + 1,
    ...coolie
  }));

  await db.collection('coolies').insertMany(cooliesWithId);
}

export async function nextId(table, dbInstance = null) {
  const db = dbInstance || await getDB();
  const seqMap = {
    'users': 'userId',
    'coolies': 'coolieId',
    'bookings': 'bookingId',
    'complaints': 'complaintId',
    'complaintAppeals': 'complaintAppealId',
    'notifications': 'notificationId',
    'premiumApplications': 'premiumApplicationId',
    'scoreTransactions': 'scoreTransactionId',
    'rewardTransactions': 'rewardTransactionId'
  };

  const result = await db.collection('sequences').findOneAndUpdate(
    { _id: seqMap[table] },
    { $inc: { seq: 1 } },
    { returnDocument: 'after' }
  );

  const doc = result && result.value !== undefined ? result.value : result;
  if (!doc) {
    await db.collection('sequences').insertOne({ _id: seqMap[table], seq: 1 });
    return 1;
  }
  return doc.seq;
}
