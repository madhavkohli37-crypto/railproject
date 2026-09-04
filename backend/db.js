const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/railassist';
const DB_NAME = 'railassist';

let db = null;
let client = null;

async function connectDB() {
  try {
    client = new MongoClient(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    await client.connect();
    db = client.db(DB_NAME);

    console.log('✅ Connected to MongoDB:', MONGODB_URI);

    // Initialize collections if they don't exist
    await initializeCollections();

    return db;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

async function initializeCollections() {
  try {
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);

    // Create collections if they don't exist
    if (!collectionNames.includes('users')) {
      await db.createCollection('users');
      console.log('📦 Created users collection');
    }

    if (!collectionNames.includes('coolies')) {
      await db.createCollection('coolies');
      console.log('📦 Created coolies collection');
    }

    if (!collectionNames.includes('bookings')) {
      await db.createCollection('bookings');
      console.log('📦 Created bookings collection');
    }

    if (!collectionNames.includes('sequences')) {
      await db.createCollection('sequences');
      await db.collection('sequences').insertMany([
        { _id: 'userId', seq: 1 },
        { _id: 'coolieId', seq: 1 },
        { _id: 'bookingId', seq: 1 }
      ]);
      console.log('📦 Created sequences collection');
    }

    // Seed coolies if collection is empty
    const coolieCount = await db.collection('coolies').countDocuments();
    if (coolieCount === 0) {
      await seedCoolies();
    }
  } catch (error) {
    console.error('Error initializing collections:', error);
  }
}

async function seedCoolies() {
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
  console.log('✅ Seeded 16 coolies across major stations');
}

async function nextId(table) {
  const seqMap = {
    'users': 'userId',
    'coolies': 'coolieId',
    'bookings': 'bookingId'
  };

  const result = await db.collection('sequences').findOneAndUpdate(
    { _id: seqMap[table] },
    { $inc: { seq: 1 } },
    { returnDocument: 'after' }
  );

  return result.value.seq;
}

function getDB() {
  if (!db) {
    throw new Error('Database not connected');
  }
  return db;
}

async function closeDB() {
  if (client) {
    await client.close();
    console.log('📴 MongoDB connection closed');
  }
}

module.exports = { connectDB, getDB, nextId, closeDB };
