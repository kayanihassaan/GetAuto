import Dexie from 'dexie';

const db = new Dexie('GetAutoDB');

db.version(3).stores({
  users: '++id, phone, name, role, createdAt',
  vehicles: '++id, ownerId, type, name, variant, rentPerDay, imagePath, description, location, isBooked, createdAt',
  bookings: '++id, vehicleId, userId, customerName, contactNumber, startDate, endDate, totalPrice, paymentMethod, status',
  otps: '++id, phone, code, expiresAt',
  wishlist: '++id, userId, vehicleId, createdAt',
  ratings: '++id, vehicleId, userId, rating, review, createdAt'
});

db.version(4).stores({
  users: '++id, email, name, role, createdAt',
  vehicles: '++id, ownerId, type, name, variant, rentPerDay, imagePath, description, location, isBooked, createdAt',
  bookings: '++id, vehicleId, userId, customerName, contactNumber, startDate, endDate, totalPrice, paymentMethod, status',
  otps: '++id, email, code, expiresAt',
  wishlist: '++id, userId, vehicleId, createdAt',
  ratings: '++id, vehicleId, userId, rating, review, createdAt'
});

export default db;
