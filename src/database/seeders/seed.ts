import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import { Role } from '../models/Role.model';
import { User } from '../models/User.model';
import { Settings } from '../models/Settings.model';
import { ProductCategory } from '../models/ProductCategory.model';
import { hashPassword } from '../../utils/passwordUtils';
import { ROLE_PERMISSIONS } from '../../constants/permissions';
import { Role as RoleEnum, ROLE_DISPLAY_NAMES } from '../../constants/roles';
import { slugify } from '../../utils/slugify';

const MONGODB_URI = process.env.MONGODB_URI ?? 'mongodb://localhost:27017/medisource';
const isClean = process.argv.includes('--clean');

const seed = async (): Promise<void> => {
  console.log('🌱 Starting seed...');
  await mongoose.connect(MONGODB_URI);

  if (isClean) {
    console.log('🧹 Cleaning existing data...');
    await Promise.all([
      Role.deleteMany({}),
      User.deleteMany({}),
      Settings.deleteMany({}),
      ProductCategory.deleteMany({}),
    ]);
  }

  // ── 1. Seed Roles ─────────────────────────────────────────
  console.log('👥 Seeding roles...');
  const roleNames = Object.values(RoleEnum);
  const createdRoles: Record<string, mongoose.Types.ObjectId> = {};

  for (const name of roleNames) {
    const role = await Role.findOneAndUpdate(
      { name },
      {
        name,
        displayName: ROLE_DISPLAY_NAMES[name as RoleEnum],
        permissions: ROLE_PERMISSIONS[name] ?? [],
        isSystem: true,
      },
      { upsert: true, new: true },
    );
    createdRoles[name] = role._id;
    console.log(`   ✅ Role: ${role.displayName}`);
  }

  // ── 2. Seed Super Admin ───────────────────────────────────
  console.log('👤 Seeding super admin...');
  const adminEmail = process.env.DEFAULT_SUPER_ADMIN_EMAIL ?? 'superadmin@medisource.com';
  const adminPassword = process.env.DEFAULT_SUPER_ADMIN_PASSWORD ?? 'Admin@123456';
  const adminName = process.env.DEFAULT_SUPER_ADMIN_NAME ?? 'Super Admin';

  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    const hashedPassword = await hashPassword(adminPassword);
    await User.create({
      name: adminName,
      email: adminEmail,
      password: hashedPassword,
      role: createdRoles[RoleEnum.SUPER_ADMIN],
      status: 'active',
    });
    console.log(`   ✅ Super Admin: ${adminEmail} / ${adminPassword}`);
  } else {
    console.log(`   ℹ️  Super Admin already exists: ${adminEmail}`);
  }

  // ── 3. Seed Product Categories ────────────────────────────
  console.log('📦 Seeding product categories...');
  const categories = [
    'Medical Devices', 'Pharmaceuticals', 'Diagnostics', 'Surgical Equipment',
    'Personal Protective Equipment', 'Laboratory Supplies', 'Hospital Furniture',
  ];

  for (const name of categories) {
    const slug = slugify(name);
    await ProductCategory.findOneAndUpdate(
      { slug },
      { name, slug, status: 'active' },
      { upsert: true, new: true },
    );
  }
  console.log(`   ✅ ${categories.length} categories seeded`);

  // ── 4. Seed Default Settings ──────────────────────────────
  console.log('⚙️  Seeding site settings...');
  await Settings.findOneAndUpdate(
    { key: 'site_settings' },
    {
      key: 'site_settings',
      companyName: 'MediSource Global',
      tagline: 'Your Trusted Medical Distribution Partner',
      description: 'MediSource Global is a leading medical distribution company supplying high-quality medical devices and pharmaceuticals worldwide.',
      contact: {
        email: 'info@medisource.com',
        phone: '+1 (555) 000-0000',
        address: '123 Medical Plaza, Health City, HC 00000',
      },
      notifications: {
        emailOnInquiry: true,
        emailOnApplicant: true,
        adminEmail: adminEmail,
      },
    },
    { upsert: true, new: true },
  );
  console.log('   ✅ Settings seeded');

  console.log('\n✅ Seed completed successfully!\n');
  console.log('━'.repeat(50));
  console.log('  Admin Login Credentials:');
  console.log(`  Email    : ${adminEmail}`);
  console.log(`  Password : ${adminPassword}`);
  console.log('━'.repeat(50));

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
