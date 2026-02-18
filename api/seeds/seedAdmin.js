// seeds/seedAdmin.js
const mongoose = require("mongoose");
const User = require("../schemas/User");
const config = require("../config/config");
const APP_ROLES = require("../utils/checks/roles");

/**
 * 🔐 Seeds a default admin user for development.
 *
 * In production (big companies), this is done via:
 *  - A one-time bootstrap CLI command run by ops
 *  - Or env-var-driven auto-creation on first boot
 *
 * For dev/staging: seeding is the standard approach.
 */
async function seedAdmin() {
  await mongoose.connect(config.db.uri);

  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@gmail.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "123456";
  const adminName = process.env.SEED_ADMIN_NAME || "Super Admin";

  const existing = await User.findOne({ email: adminEmail });

  if (existing) {
    console.log(`⚠️  Admin already exists: ${adminEmail} — skipping.`);
    return;
  }

  // Note: password is auto-hashed by the pre-save hook in User schema
  await User.create({
    name: adminName,
    email: adminEmail,
    password: adminPassword,
    role: APP_ROLES.ADMIN,
  });

  console.log(`✅ Admin seeded: ${adminEmail} / password: ${adminPassword}`);
  console.log(`   ⚠️  Change this password immediately in production!`);
}

module.exports = seedAdmin;
