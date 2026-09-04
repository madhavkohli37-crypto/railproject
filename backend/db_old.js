const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const path = require('path');

// File-based JSON database — no native compilation needed
const adapter = new FileSync(path.join(__dirname, 'railassist.json'));
const db = low(adapter);

// ---------------------------------------------------------------------------
// Schema defaults
// ---------------------------------------------------------------------------
db.defaults({
  users: [],
  coolies: [],
  bookings: [],
  _seq: { users: 1, coolies: 1, bookings: 1 }
}).write();

// Auto-increment ID helper
function nextId(table) {
  const id = db.get(`_seq.${table}`).value();
  db.update(`_seq.${table}`, n => n + 1).write();
  return id;
}

// ---------------------------------------------------------------------------
// Seed coolies on first run
// ---------------------------------------------------------------------------
if (db.get('coolies').value().length === 0) {
  const seedCoolies = [
    { name: 'Ramesh Kumar',   station: 'Mumbai CST',         badge_number: 'MUM001', phone: '9876543210', rating: 4.8, price_per_bag: 60, experience_years: 8,  available: 1 },
    { name: 'Suresh Yadav',   station: 'Mumbai CST',         badge_number: 'MUM002', phone: '9876543211', rating: 4.5, price_per_bag: 55, experience_years: 5,  available: 1 },
    { name: 'Anand Patil',    station: 'Mumbai CST',         badge_number: 'MUM003', phone: '9876543222', rating: 4.3, price_per_bag: 50, experience_years: 3,  available: 1 },
    { name: 'Rajesh Singh',   station: 'New Delhi',          badge_number: 'DEL001', phone: '9876543212', rating: 4.7, price_per_bag: 65, experience_years: 10, available: 1 },
    { name: 'Mohan Lal',      station: 'New Delhi',          badge_number: 'DEL002', phone: '9876543213', rating: 4.3, price_per_bag: 60, experience_years: 6,  available: 1 },
    { name: 'Deepak Sharma',  station: 'New Delhi',          badge_number: 'DEL003', phone: '9876543223', rating: 4.6, price_per_bag: 65, experience_years: 7,  available: 1 },
    { name: 'Kumar Swamy',    station: 'Bengaluru City',     badge_number: 'BLR001', phone: '9876543214', rating: 4.6, price_per_bag: 55, experience_years: 9,  available: 1 },
    { name: 'Venkat Rao',     station: 'Bengaluru City',     badge_number: 'BLR002', phone: '9876543215', rating: 4.4, price_per_bag: 50, experience_years: 4,  available: 1 },
    { name: 'Selvam P',       station: 'Chennai Central',    badge_number: 'CHE001', phone: '9876543216', rating: 4.9, price_per_bag: 60, experience_years: 12, available: 1 },
    { name: 'Murugan K',      station: 'Chennai Central',    badge_number: 'CHE002', phone: '9876543224', rating: 4.5, price_per_bag: 55, experience_years: 6,  available: 1 },
    { name: 'Arjun Das',      station: 'Kolkata Howrah',     badge_number: 'KOL001', phone: '9876543217', rating: 4.5, price_per_bag: 50, experience_years: 7,  available: 1 },
    { name: 'Bimal Roy',      station: 'Kolkata Howrah',     badge_number: 'KOL002', phone: '9876543225', rating: 4.2, price_per_bag: 45, experience_years: 4,  available: 1 },
    { name: 'Pradeep Gupta',  station: 'Ahmedabad Junction', badge_number: 'AHM001', phone: '9876543218', rating: 4.2, price_per_bag: 45, experience_years: 3,  available: 1 },
    { name: 'Vikram Tiwari',  station: 'Pune Junction',      badge_number: 'PUN001', phone: '9876543219', rating: 4.6, price_per_bag: 55, experience_years: 8,  available: 1 },
    { name: 'Santosh Mishra', station: 'Hyderabad Deccan',   badge_number: 'HYD001', phone: '9876543220', rating: 4.7, price_per_bag: 55, experience_years: 9,  available: 1 },
    { name: 'Deepak Nair',    station: 'Kochi Central',      badge_number: 'KOC001', phone: '9876543221', rating: 4.8, price_per_bag: 60, experience_years: 11, available: 1 },
  ];

  for (const coolie of seedCoolies) {
    db.get('coolies').push({ id: nextId('coolies'), ...coolie }).write();
  }
  console.log('✅ Seeded 16 coolies across major stations');
}

module.exports = { db, nextId };
