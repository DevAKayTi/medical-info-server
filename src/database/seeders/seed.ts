/**
 * ============================================================
 * FULL SEED — MediSource Global
 * Seeds: Roles, Super Admin, Users, Categories, Products,
 *        Brands, News, Careers, Certifications, Partners,
 *        Services, Testimonials, Gallery, Downloads, Inquiries
 * ============================================================
 *
 * Usage:
 *   npm run seed              → upsert only (safe, idempotent)
 *   npm run seed -- --clean   → drop all + reseed from scratch
 *   npm run seed -- --data    → skip roles/users, only seed content
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import { Role }            from '../models/Role.model';
import { User }            from '../models/User.model';
import { Settings }        from '../models/Settings.model';
import { ProductCategory } from '../models/ProductCategory.model';
import { Product }         from '../models/Product.model';
import { Brand }           from '../models/Brand.model';
import { News }            from '../models/News.model';
import { Career }          from '../models/Career.model';
import { Certification }   from '../models/Certification.model';
import { Partner }         from '../models/Partner.model';
import { Service }         from '../models/Service.model';
import { Testimonial }     from '../models/Testimonial.model';
import { Gallery }         from '../models/Gallery.model';
import { Download }        from '../models/Download.model';
import { Inquiry }         from '../models/Inquiry.model';

import { hashPassword }       from '../../utils/passwordUtils';
import { ROLE_PERMISSIONS }   from '../../constants/permissions';
import { Role as RoleEnum, ROLE_DISPLAY_NAMES } from '../../constants/roles';
import { slugify }            from '../../utils/slugify';

const MONGODB_URI = process.env.MONGODB_URI ?? 'mongodb://localhost:27017/medisource';
const isClean     = process.argv.includes('--clean');
const dataOnly    = process.argv.includes('--data');

// ── Helpers ──────────────────────────────────────────────────
const img  = (seed: string | number) => `https://picsum.photos/seed/${seed}/800/600`;
const logo = (seed: string)          => `https://logo.clearbit.com/${seed}.com`;

// ═══════════════════════════════════════════════════════════════
const seed = async (): Promise<void> => {
  console.log('\n🌱  MediSource Full Seed Starting...\n');
  await mongoose.connect(MONGODB_URI);

  // ── CLEAN ──────────────────────────────────────────────────
  if (isClean) {
    console.log('🧹 Cleaning all collections...');
    await Promise.all([
      Role.deleteMany({}), User.deleteMany({}), Settings.deleteMany({}),
      ProductCategory.deleteMany({}), Product.deleteMany({}), Brand.deleteMany({}),
      News.deleteMany({}), Career.deleteMany({}), Certification.deleteMany({}),
      Partner.deleteMany({}), Service.deleteMany({}), Testimonial.deleteMany({}),
      Gallery.deleteMany({}), Download.deleteMany({}), Inquiry.deleteMany({}),
    ]);
    console.log('   ✅ All collections cleared\n');
  }

  // ═══════════════════════════════════════════════════════════
  // 1. ROLES
  // ═══════════════════════════════════════════════════════════
  if (!dataOnly) {
    console.log('👥 Seeding roles...');
    const roleNames = Object.values(RoleEnum);
    const createdRoles: Record<string, mongoose.Types.ObjectId> = {};

    for (const name of roleNames) {
      const role = await Role.findOneAndUpdate(
        { name },
        { name, displayName: ROLE_DISPLAY_NAMES[name as RoleEnum], permissions: ROLE_PERMISSIONS[name] ?? [], isSystem: true },
        { upsert: true, new: true },
      );
      createdRoles[name] = role._id;
      console.log(`   ✅ ${role.displayName}`);
    }

    // ═══════════════════════════════════════════════════════════
    // 2. USERS (Super Admin + demo staff)
    // ═══════════════════════════════════════════════════════════
    console.log('\n👤 Seeding users...');
    const adminEmail    = process.env.DEFAULT_SUPER_ADMIN_EMAIL    ?? 'superadmin@medisource.com';
    const adminPassword = process.env.DEFAULT_SUPER_ADMIN_PASSWORD ?? 'Admin@123456';

    let adminUser = await User.findOne({ email: adminEmail });
    if (!adminUser) {
      adminUser = await User.create({
        name: 'Super Admin', email: adminEmail,
        password: await hashPassword(adminPassword),
        role: createdRoles[RoleEnum.SUPER_ADMIN], status: 'active',
      });
      console.log(`   ✅ Super Admin: ${adminEmail}`);
    } else {
      console.log(`   ℹ️  Super Admin already exists`);
    }

    const demoStaff = [
      { name: 'Sarah Johnson',  email: 'sarah@medisource.com',   roleKey: RoleEnum.EDITOR },
      { name: 'Omar Al-Rashidi',email: 'omar@medisource.com',    roleKey: RoleEnum.ADMIN },
      { name: 'Priya Sharma',   email: 'priya@medisource.com',   roleKey: RoleEnum.EDITOR },
    ];
    for (const u of demoStaff) {
      await User.findOneAndUpdate(
        { email: u.email },
        { name: u.name, email: u.email, password: await hashPassword('Staff@123456'), role: createdRoles[u.roleKey], status: 'active' },
        { upsert: true, new: true },
      );
      console.log(`   ✅ ${u.name} (${u.roleKey})`);
    }

    // ═══════════════════════════════════════════════════════════
    // 3. SITE SETTINGS
    // ═══════════════════════════════════════════════════════════
    console.log('\n⚙️  Seeding settings...');
    await Settings.findOneAndUpdate(
      { key: 'site_settings' },
      {
        key: 'site_settings',
        companyName: 'MediSource Global',
        tagline: 'Your Trusted Medical Distribution Partner',
        description: 'MediSource Global is a premier medical distribution company delivering high-quality pharmaceuticals, medical devices, and surgical supplies to healthcare institutions across 18+ countries.',
        contact: {
          email: 'info@medisource.com',
          phone: '+971 4 123 4567',
          address: 'Building 64, Dubai Healthcare City, Phase 2, Dubai, UAE',
        },
        social: {
          linkedin: 'https://linkedin.com/company/medisource',
          twitter: 'https://twitter.com/medisource',
          instagram: 'https://instagram.com/medisource',
        },
        notifications: { emailOnInquiry: true, emailOnApplicant: true, adminEmail },
      },
      { upsert: true, new: true },
    );
    console.log('   ✅ Settings seeded');
  }

  // ═══════════════════════════════════════════════════════════
  // 4. PRODUCT CATEGORIES
  // ═══════════════════════════════════════════════════════════
  console.log('\n📦 Seeding product categories...');
  const categoryData = [
    { name: 'Pharmaceuticals',        desc: 'Prescription and OTC medications from world-leading manufacturers',    order: 1 },
    { name: 'Medical Devices',        desc: 'Diagnostic and therapeutic equipment for clinical settings',           order: 2 },
    { name: 'Surgical Supplies',      desc: 'Premium surgical instruments and single-use products',                  order: 3 },
    { name: 'Diagnostics',            desc: 'Laboratory analyzers, reagents, and rapid diagnostic tests',           order: 4 },
    { name: 'Personal Protective Equipment', desc: 'Medical-grade PPE for healthcare professionals',               order: 5 },
    { name: 'Laboratory Supplies',    desc: 'Consumables and equipment for diagnostic laboratories',                order: 6 },
    { name: 'Hospital Furniture',     desc: 'Ergonomic patient care furniture and clinical equipment',              order: 7 },
  ];

  const categoryMap: Record<string, mongoose.Types.ObjectId> = {};
  for (const c of categoryData) {
    const slug = slugify(c.name);
    const cat = await ProductCategory.findOneAndUpdate(
      { slug },
      { name: c.name, slug, description: c.desc, order: c.order, status: 'active', image: { url: img(`cat-${slug}`), publicId: `cat-${slug}` } },
      { upsert: true, new: true },
    );
    categoryMap[c.name] = cat._id;
  }
  console.log(`   ✅ ${categoryData.length} categories`);

  // ═══════════════════════════════════════════════════════════
  // 5. BRANDS
  // ═══════════════════════════════════════════════════════════
  console.log('\n🏷️  Seeding brands...');
  const brandsData = [
    { name: 'Pfizer',         country: 'USA',         category: 'Pharmaceuticals',  website: 'pfizer.com',       featured: true,  since: 1849, desc: 'Global biopharmaceutical company delivering innovative medicines and vaccines.' },
    { name: 'Abbott',         country: 'USA',         category: 'Medical Devices',  website: 'abbott.com',       featured: true,  since: 1888, desc: 'Healthcare company specializing in diagnostics, medical devices, and nutrition.' },
    { name: 'Johnson & Johnson', country: 'USA',      category: 'Surgical Supplies',website: 'jnj.com',          featured: true,  since: 1886, desc: 'Multinational corporation developing consumer healthcare and medical devices.' },
    { name: 'Roche',          country: 'Switzerland', category: 'Diagnostics',      website: 'roche.com',        featured: true,  since: 1896, desc: 'World leader in in-vitro diagnostics and oncology pharmaceuticals.' },
    { name: 'Siemens Healthineers', country: 'Germany', category: 'Medical Devices',website: 'siemens-healthineers.com', featured: true, since: 1847, desc: 'Pioneer in medical technology including imaging and laboratory diagnostics.' },
    { name: 'Medtronic',      country: 'Ireland',     category: 'Medical Devices',  website: 'medtronic.com',    featured: false, since: 1949, desc: 'Global leader in medical technology, services, and solutions.' },
    { name: 'Baxter',         country: 'USA',         category: 'Pharmaceuticals',  website: 'baxter.com',       featured: false, since: 1931, desc: 'Critical care, hospital products, renal, and pharmaceutical leader.' },
    { name: 'Novartis',       country: 'Switzerland', category: 'Pharmaceuticals',  website: 'novartis.com',     featured: false, since: 1996, desc: 'Science-based global healthcare company transforming medicine.' },
    { name: 'AstraZeneca',    country: 'UK',          category: 'Pharmaceuticals',  website: 'astrazeneca.com',  featured: false, since: 1999, desc: 'Biopharmaceutical company focused on oncology, cardiovascular, and respiratory.' },
    { name: 'Sanofi',         country: 'France',      category: 'Pharmaceuticals',  website: 'sanofi.com',       featured: false, since: 1973, desc: 'Global pharmaceutical company committed to improving access to healthcare.' },
    { name: 'BD (Becton Dickinson)', country: 'USA',  category: 'Diagnostics',      website: 'bd.com',           featured: false, since: 1897, desc: 'Leading medical technology company advancing diagnostics and drug delivery.' },
    { name: 'Stryker',        country: 'USA',         category: 'Surgical Supplies',website: 'stryker.com',      featured: false, since: 1941, desc: 'Medical technology company offering surgical and neurovascular products.' },
  ];

  const brandMap: Record<string, mongoose.Types.ObjectId> = {};
  for (const b of brandsData) {
    const slug = slugify(b.name);
    const brand = await Brand.findOneAndUpdate(
      { slug },
      { name: b.name, slug, category: b.category, country: b.country, description: b.desc, logo: { url: `https://logo.clearbit.com/${b.website}`, publicId: `brand-${slug}` }, website: `https://www.${b.website}`, featured: b.featured, since: b.since, status: 'active' },
      { upsert: true, new: true },
    );
    brandMap[b.name] = brand._id;
  }
  console.log(`   ✅ ${brandsData.length} brands`);

  // ═══════════════════════════════════════════════════════════
  // 6. PRODUCTS
  // ═══════════════════════════════════════════════════════════
  console.log('\n💊 Seeding products...');
  const productsData = [
    // Pharmaceuticals
    { name: 'Amoxicillin 500mg Capsules', sku: 'MS-AMOX-500', cat: 'Pharmaceuticals', brand: 'Pfizer', tags: ['antibiotic', 'penicillin', 'bacterial-infection'], featured: true, inStock: true, specs: [{ label: 'Form', value: 'Capsules' }, { label: 'Strength', value: '500mg' }, { label: 'Pack', value: '100 capsules' }], desc: 'Broad-spectrum penicillin antibiotic used for treatment of susceptible bacterial infections. Effective against gram-positive and selected gram-negative bacteria.', short: 'Broad-spectrum penicillin antibiotic capsules.' },
    { name: 'Paracetamol 1g Tablets', sku: 'MS-PARA-1000', cat: 'Pharmaceuticals', brand: 'Pfizer', tags: ['analgesic', 'antipyretic', 'pain-relief'], featured: true, inStock: true, specs: [{ label: 'Form', value: 'Tablets' }, { label: 'Strength', value: '1000mg' }, { label: 'Pack', value: '500 tablets' }], desc: 'Paracetamol 1g tablets indicated for relief of mild to moderate pain and reduction of fever. Hospital pack with 500 tablets per carton.', short: 'Hospital-grade paracetamol for pain relief and fever.' },
    { name: 'Omeprazole 20mg Capsules', sku: 'MS-OMEP-020', cat: 'Pharmaceuticals', brand: 'AstraZeneca', tags: ['ppi', 'gastric-acid', 'ulcer'], featured: false, inStock: true, specs: [{ label: 'Form', value: 'Delayed-release capsules' }, { label: 'Strength', value: '20mg' }, { label: 'Pack', value: '250 capsules' }], desc: 'Proton pump inhibitor indicated for gastroesophageal reflux disease, duodenal ulcers, and Zollinger-Ellison syndrome.', short: 'Proton pump inhibitor for gastric acid management.' },
    { name: 'Metformin 500mg Tablets', sku: 'MS-METF-500', cat: 'Pharmaceuticals', brand: 'Novartis', tags: ['diabetes', 'biguanide', 'blood-sugar'], featured: false, inStock: true, specs: [{ label: 'Form', value: 'Film-coated tablets' }, { label: 'Strength', value: '500mg' }, { label: 'Pack', value: '500 tablets' }], desc: 'Biguanide antidiabetic medication for type 2 diabetes management. First-line therapy for reducing blood glucose levels.', short: 'First-line oral antidiabetic therapy.' },
    { name: 'Atorvastatin 20mg Tablets', sku: 'MS-ATOR-020', cat: 'Pharmaceuticals', brand: 'Pfizer', tags: ['statin', 'cholesterol', 'cardiovascular'], featured: false, inStock: true, specs: [{ label: 'Form', value: 'Tablets' }, { label: 'Strength', value: '20mg' }, { label: 'Pack', value: '100 tablets' }], desc: 'Statin medication for lowering cholesterol and reducing the risk of cardiovascular disease events.', short: 'Cholesterol-lowering statin for cardiovascular protection.' },
    { name: 'Ibuprofen 400mg Film-Coated Tablets', sku: 'MS-IBUP-400', cat: 'Pharmaceuticals', brand: 'Sanofi', tags: ['nsaid', 'analgesic', 'anti-inflammatory'], featured: false, inStock: true, specs: [{ label: 'Form', value: 'Film-coated tablets' }, { label: 'Strength', value: '400mg' }, { label: 'Pack', value: '250 tablets' }], desc: 'Non-steroidal anti-inflammatory drug for pain relief, fever reduction, and inflammatory conditions.', short: 'NSAID for pain and inflammation management.' },
    { name: 'Amoxicillin 250mg/5ml Oral Suspension', sku: 'MS-AMOX-250S', cat: 'Pharmaceuticals', brand: 'Pfizer', tags: ['antibiotic', 'pediatric', 'suspension'], featured: false, inStock: false, specs: [{ label: 'Form', value: 'Oral suspension' }, { label: 'Concentration', value: '250mg/5ml' }, { label: 'Volume', value: '100ml bottle' }], desc: 'Pediatric formulation of amoxicillin for treatment of bacterial infections in children.', short: 'Pediatric antibiotic oral suspension.' },

    // Medical Devices
    { name: 'Digital Blood Pressure Monitor ProSeries', sku: 'MS-BPMO-001', cat: 'Medical Devices', brand: 'Siemens Healthineers', tags: ['blood-pressure', 'monitoring', 'digital'], featured: true, inStock: true, specs: [{ label: 'Cuff Size', value: 'Standard (22-32cm)' }, { label: 'Memory', value: '60 readings' }, { label: 'Display', value: 'Large LCD' }], desc: 'Professional-grade digital blood pressure monitor with irregular heartbeat detection, large LCD display, and 60-reading memory storage.', short: 'Professional digital BP monitor with HBP indicator.' },
    { name: 'Pulse Oximeter ClipPro 800', sku: 'MS-OXIM-800', cat: 'Medical Devices', brand: 'Medtronic', tags: ['oxygen', 'saturation', 'spo2', 'pulse'], featured: true, inStock: true, specs: [{ label: 'Range', value: '70-100% SpO2' }, { label: 'Accuracy', value: '±2%' }, { label: 'Battery', value: '30+ hours' }], desc: 'Clinical-grade fingertip pulse oximeter for continuous SpO2 and pulse rate monitoring with OLED display and alarm functions.', short: 'Clinical-grade pulse oximeter with OLED display.' },
    { name: 'Digital Glucometer MediCheck Pro', sku: 'MS-GLUC-001', cat: 'Medical Devices', brand: 'Abbott', tags: ['glucose', 'blood-sugar', 'diabetes', 'monitoring'], featured: false, inStock: true, specs: [{ label: 'Range', value: '20-600 mg/dL' }, { label: 'Sample Volume', value: '0.6 µL' }, { label: 'Memory', value: '500 results' }], desc: 'Advanced blood glucose monitoring system requiring only 0.6µL sample with 5-second result time and connectivity options.', short: 'Advanced glucometer with tiny 0.6µL sample requirement.' },
    { name: 'Portable Ultrasound Scanner US-400', sku: 'MS-ULTR-400', cat: 'Medical Devices', brand: 'Siemens Healthineers', tags: ['ultrasound', 'imaging', 'portable'], featured: true, inStock: true, specs: [{ label: 'Probe', value: 'Linear 5-12 MHz' }, { label: 'Display', value: '10.1" touchscreen' }, { label: 'Battery', value: '4 hours' }], desc: 'Point-of-care portable ultrasound with multi-frequency linear probe, 10.1" touchscreen, and cloud connectivity for remote consultations.', short: 'Portable point-of-care ultrasound with cloud connectivity.' },
    { name: 'Infusion Pump SmartFlow IV-300', sku: 'MS-INFP-300', cat: 'Medical Devices', brand: 'Baxter', tags: ['infusion', 'iv-therapy', 'pump'], featured: false, inStock: true, specs: [{ label: 'Flow Rate', value: '0.1-999 mL/hr' }, { label: 'Accuracy', value: '±2%' }, { label: 'Drug Library', value: '1,500+ drugs' }], desc: 'Volumetric infusion pump with built-in drug library, dose error reduction system, and wireless connectivity for hospital networks.', short: 'Smart volumetric infusion pump with drug library.' },
    { name: 'ECG Machine 12-Lead CardioScan', sku: 'MS-ECGM-012', cat: 'Medical Devices', brand: 'Siemens Healthineers', tags: ['ecg', 'ekg', 'cardiac', 'monitoring'], featured: false, inStock: true, specs: [{ label: 'Leads', value: '12' }, { label: 'Sampling Rate', value: '5000 Hz' }, { label: 'Storage', value: '100 ECGs' }], desc: 'Professional 12-lead ECG machine with automatic interpretation, thermal printing, and DICOM-compatible digital storage.', short: '12-lead ECG with auto-interpretation and DICOM.' },

    // Surgical Supplies
    { name: 'Surgical Gloves Latex Sterile Size 7.5', sku: 'MS-GLVS-075', cat: 'Surgical Supplies', brand: 'Johnson & Johnson', tags: ['gloves', 'sterile', 'surgical', 'latex'], featured: false, inStock: true, specs: [{ label: 'Size', value: '7.5' }, { label: 'Pack', value: '50 pairs/box' }, { label: 'Sterility', value: 'EO sterilized' }], desc: 'Premium sterile latex surgical gloves with anatomical shape and powder-free interior for superior tactile sensitivity.', short: 'Premium sterile latex surgical gloves, powder-free.' },
    { name: 'Surgical Sutures Absorbable 2-0', sku: 'MS-SUTS-020', cat: 'Surgical Supplies', brand: 'Johnson & Johnson', tags: ['sutures', 'absorbable', 'wound-closure'], featured: false, inStock: true, specs: [{ label: 'Size', value: '2-0' }, { label: 'Length', value: '75cm' }, { label: 'Needle', value: '1/2 circle curved' }], desc: 'Absorbable polyglycolic acid sutures for internal tissue closure with consistent absorption profile over 60-90 days.', short: 'Absorbable PGA sutures for internal tissue closure.' },
    { name: 'Laparoscopic Trocar Set 5-Port', sku: 'MS-LAPS-005', cat: 'Surgical Supplies', brand: 'Stryker', tags: ['laparoscopy', 'trocar', 'minimally-invasive'], featured: true, inStock: true, specs: [{ label: 'Ports', value: '5 and 10mm' }, { label: 'Blade', value: 'Safety blade mechanism' }, { label: 'Set', value: '5 trocars + accessories' }], desc: 'Complete laparoscopic trocar system with bladeless entry technology for minimally invasive abdominal procedures.', short: 'Complete laparoscopic trocar system with safety mechanism.' },

    // Diagnostics
    { name: 'Rapid COVID-19 Antigen Test', sku: 'MS-COVA-001', cat: 'Diagnostics', brand: 'Abbott', tags: ['covid', 'antigen', 'rapid-test', 'diagnostic'], featured: false, inStock: true, specs: [{ label: 'Result Time', value: '15 minutes' }, { label: 'Sensitivity', value: '97.1%' }, { label: 'Pack', value: '25 tests' }], desc: 'CE-marked rapid antigen test for qualitative detection of SARS-CoV-2 nucleocapsid protein with 97.1% sensitivity.', short: 'CE-marked rapid COVID-19 antigen test, 15-min results.' },
    { name: 'CBC Hematology Analyzer HA-5000', sku: 'MS-HEMA-500', cat: 'Diagnostics', brand: 'Roche', tags: ['hematology', 'cbc', 'blood-count', 'analyzer'], featured: true, inStock: true, specs: [{ label: 'Parameters', value: '22 CBC parameters' }, { label: 'Throughput', value: '80 samples/hr' }, { label: 'Sample Volume', value: '20µL whole blood' }], desc: 'High-throughput hematology analyzer with 22-parameter CBC, auto-DIFF function, and integrated QC software for high-volume labs.', short: '22-parameter CBC analyzer with 80 samples/hr throughput.' },
    { name: 'Urinalysis Strips MultiCheck 10L', sku: 'MS-URIN-010', cat: 'Diagnostics', brand: 'Roche', tags: ['urinalysis', 'urine', 'strips', 'dipstick'], featured: false, inStock: true, specs: [{ label: 'Parameters', value: '10 (glucose, protein, blood, pH, etc.)' }, { label: 'Pack', value: '100 strips' }, { label: 'Reading', value: 'Visual or automated' }], desc: '10-parameter urinalysis strips for rapid semiquantitative detection of metabolic and kidney disorders.', short: '10-parameter urinalysis strips for rapid screening.' },

    // PPE
    { name: 'N95 Respirator Mask NIOSH-Certified', sku: 'MS-N95M-001', cat: 'Personal Protective Equipment', brand: 'Johnson & Johnson', tags: ['n95', 'mask', 'respirator', 'ppe', 'niosh'], featured: true, inStock: true, specs: [{ label: 'Standard', value: 'NIOSH N95 / EN 149 FFP2' }, { label: 'Filtration', value: '≥95% non-oil particles' }, { label: 'Pack', value: '20 masks/box' }], desc: 'NIOSH-certified N95 respirator with double-layer filtration achieving ≥95% filtration efficiency for healthcare settings.', short: 'NIOSH-certified N95 with ≥95% filtration efficiency.' },
    { name: 'Isolation Gown Level 3 AAMI', sku: 'MS-GOWN-L3', cat: 'Personal Protective Equipment', brand: 'Baxter', tags: ['gown', 'isolation', 'ppE', 'aami'], featured: false, inStock: true, specs: [{ label: 'AAMI Level', value: 'Level 3' }, { label: 'Material', value: 'SMS polypropylene' }, { label: 'Pack', value: '10 gowns' }], desc: 'AAMI Level 3 disposable isolation gown providing moderate to high fluid barrier protection for surgical and patient care.', short: 'AAMI Level 3 isolation gown with fluid barrier protection.' },

    // Lab Supplies
    { name: 'Blood Collection Tubes EDTA 4ml', sku: 'MS-BCTU-E4M', cat: 'Laboratory Supplies', brand: 'BD (Becton Dickinson)', tags: ['blood-collection', 'edta', 'vacutainer', 'hematology'], featured: false, inStock: true, specs: [{ label: 'Volume', value: '4ml' }, { label: 'Additive', value: 'K2EDTA' }, { label: 'Pack', value: '100 tubes' }], desc: 'Plastic EDTA blood collection tubes with K2EDTA anticoagulant for hematology testing with colour-coded lavender cap.', short: 'K2EDTA vacutainer tubes for hematology testing.' },
    { name: 'Disposable Syringes 5ml Luer-Lock', sku: 'MS-SYRD-5ML', cat: 'Laboratory Supplies', brand: 'BD (Becton Dickinson)', tags: ['syringe', 'disposable', 'injection', 'luer-lock'], featured: false, inStock: true, specs: [{ label: 'Volume', value: '5ml' }, { label: 'Tip', value: 'Luer-lock' }, { label: 'Pack', value: '100 units' }], desc: 'Sterile single-use polypropylene syringes with luer-lock tip for accurate and safe drug administration.', short: 'Sterile luer-lock disposable syringes, 5ml.' },
  ];

  const adminUser = await User.findOne({ email: process.env.DEFAULT_SUPER_ADMIN_EMAIL ?? 'superadmin@medisource.com' });
  const adminId   = adminUser?._id;

  let productsCreated = 0;
  for (const p of productsData) {
    const slug = slugify(p.name);
    await Product.findOneAndUpdate(
      { slug },
      {
        name: p.name, slug, sku: p.sku,
        category: categoryMap[p.cat],
        brand: brandMap[p.brand],
        description: p.desc, shortDescription: p.short,
        images: [{ url: img(`prod-${slug}`), publicId: `prod-${slug}`, isPrimary: true }],
        specifications: p.specs,
        tags: p.tags,
        inStock: p.inStock, featured: p.featured,
        status: 'active',
        seo: { metaTitle: p.name, metaDescription: p.short },
        createdBy: adminId,
      },
      { upsert: true, new: true },
    );
    productsCreated++;
  }
  console.log(`   ✅ ${productsCreated} products`);

  // ═══════════════════════════════════════════════════════════
  // 7. NEWS ARTICLES
  // ═══════════════════════════════════════════════════════════
  console.log('\n📰 Seeding news articles...');
  const newsData = [
    {
      title: 'MediSource Expands Cold Chain Network to Southeast Asia',
      category: 'Company News', featured: true, status: 'published',
      tags: ['cold-chain', 'expansion', 'southeast-asia', 'logistics'],
      excerpt: 'MediSource Global announces a major expansion of its temperature-controlled distribution network into Singapore, Malaysia, and Thailand, strengthening its position as a leading pharmaceutical distributor in the Asia-Pacific region.',
      content: `MediSource Global is proud to announce a significant expansion of its GDP-compliant cold chain logistics network into Southeast Asia, with new distribution hubs now operational in Singapore, Kuala Lumpur, and Bangkok.

This strategic expansion represents a $15 million investment in state-of-the-art temperature-controlled warehousing and transport infrastructure, enabling MediSource to serve an additional 2,800+ healthcare institutions across the region.

## New Capabilities

Our Southeast Asia network features:
- **Class A clean room storage** at +2°C to +8°C for temperature-sensitive biologics
- **Controlled ambient zones** maintaining 15°C to 25°C for standard pharmaceuticals  
- **Fleet of 40+ refrigerated vehicles** equipped with real-time temperature monitoring
- **24/7 temperature deviation alerts** with automated corrective action protocols

## Regulatory Compliance

All three new facilities have achieved WHO GDP certification and comply with local pharmaceutical regulatory requirements. The Singapore hub is additionally accredited under the Health Sciences Authority (HSA) Wholesale Dealer Licence.

## Serving the Region

"Healthcare infrastructure in Southeast Asia is growing rapidly, and hospitals and clinics deserve the same level of pharmaceutical supply chain reliability available in mature markets," said Ahmed Al-Rashidi, CEO of MediSource Global. "This expansion allows us to deliver our full portfolio of 15,000+ products to the region with the same commitment to quality and timeliness our existing customers depend on."

The expansion is expected to serve over 500 new institutional clients within the first 12 months of operations.`,
      publishedAt: new Date('2025-03-15'),
    },
    {
      title: 'MediSource Achieves WHO GDP Certification Renewal',
      category: 'Compliance', featured: false, status: 'published',
      tags: ['gdp', 'who', 'compliance', 'certification', 'quality'],
      excerpt: 'MediSource Global has successfully renewed its WHO Good Distribution Practice certification across all major distribution hubs, reaffirming its commitment to maintaining the highest standards in pharmaceutical supply chain management.',
      content: `MediSource Global has successfully completed its triennial WHO Good Distribution Practice (GDP) certification renewal audit, maintaining its compliance status across all 8 primary distribution hubs spanning the Middle East, Africa, and Asia.

## Audit Scope

The comprehensive audit, conducted by independent certified auditors, covered:
- Temperature monitoring and control systems
- Inventory management and traceability procedures  
- Staff training and competency assessments
- Recall and withdrawal procedures
- Transportation and handling protocols
- Quality management system documentation

## Zero Critical Findings

For the second consecutive renewal cycle, MediSource received zero critical or major findings across all audited facilities — a result achieved by fewer than 12% of pharmaceutical distributors globally.

"GDP compliance is not just a regulatory checkbox for us — it's the foundation of everything we do," said Omar Al-Rashidi, VP Quality Assurance. "Every product we distribute represents a patient's health outcome, and that drives our obsession with quality."

## Continuous Improvement

Beyond certification maintenance, MediSource has invested in several quality enhancements including blockchain-enabled product authentication, real-time GPS tracking for all cold chain shipments, and AI-powered inventory forecasting to prevent stockouts.`,
      publishedAt: new Date('2025-02-10'),
    },
    {
      title: 'Q1 2025 Distribution Report: Record Volume & On-Time Delivery',
      category: 'Business', featured: false, status: 'published',
      tags: ['quarterly-report', 'distribution', 'performance', 'growth'],
      excerpt: 'MediSource Global reports record-breaking Q1 2025 performance with 2.3 million units distributed, 99.4% on-time delivery rate, and expansion into 3 new markets — reinforcing its position as the region\'s most reliable pharmaceutical distributor.',
      content: `MediSource Global is pleased to report exceptional performance metrics for Q1 2025, with volume, reliability, and customer satisfaction all reaching historic highs.

## Key Performance Indicators

| Metric | Q1 2025 | Q1 2024 | Change |
|--------|---------|---------|--------|
| Units Distributed | 2,312,000 | 1,876,000 | +23.2% |
| On-Time Delivery | 99.4% | 98.1% | +1.3% |
| Active Customers | 3,847 | 3,240 | +18.7% |
| New Markets Entered | 3 | 1 | +200% |
| Cold Chain Products | 48% | 41% | +7% |

## Regional Highlights

**Middle East**: Continued strong growth with 31% volume increase driven by new hospital group partnerships in Saudi Arabia and Kuwait.

**Africa**: Successful launch in Nairobi and Lagos distribution corridors serving rural healthcare networks.

**South Asia**: Expanded India operations with 2 new pharmaceutical warehouses in Mumbai and Hyderabad.

## Outlook

MediSource reaffirms its full-year 2025 guidance of 20-25% revenue growth, supported by a robust pipeline of 180+ institutional client onboardings expected in Q2.`,
      publishedAt: new Date('2025-04-22'),
    },
    {
      title: 'MediSource Partners with WHO to Improve Essential Medicine Access',
      category: 'Company News', featured: true, status: 'published',
      tags: ['who', 'partnership', 'essential-medicines', 'global-health'],
      excerpt: 'MediSource Global has entered into a strategic partnership with the World Health Organization to improve access to essential medicines in underserved healthcare markets across Sub-Saharan Africa and South Asia.',
      content: `MediSource Global has signed a memorandum of understanding with the World Health Organization (WHO) to establish a coordinated essential medicines distribution initiative targeting healthcare facilities in rural and underserved regions of Sub-Saharan Africa and South Asia.

## Programme Overview

The three-year initiative will focus on:
- Distributing WHO Model List essential medicines to 5,000+ rural health facilities
- Establishing cold chain infrastructure in 12 priority countries
- Training local healthcare workers in pharmaceutical storage and handling
- Developing digital inventory systems for real-time demand forecasting

## Target Impact

By 2027, the programme aims to improve access to essential medicines for an estimated 18 million people in communities currently facing critical supply gaps.

"Access to essential medicines should not be determined by geography," said Ahmed Al-Rashidi, CEO. "Partnering with WHO allows us to combine our operational expertise with their global health authority to make a meaningful difference."

## Funding Structure

The programme will be co-funded by MediSource's corporate social responsibility budget, WHO development grants, and philanthropic contributions from partner pharmaceutical manufacturers.`,
      publishedAt: new Date('2025-05-08'),
    },
    {
      title: 'Digital Transformation: MediSource Launches AI-Powered Inventory System',
      category: 'Technology', featured: false, status: 'published',
      tags: ['ai', 'technology', 'inventory', 'digital-transformation'],
      excerpt: 'MediSource introduces its proprietary AI-powered inventory management system, reducing stockouts by 87% and optimising order quantities across its network of 8 distribution hubs through predictive demand forecasting.',
      content: `MediSource Global has deployed MediPredict, its proprietary AI-powered inventory management platform, across all distribution centres — dramatically improving supply chain efficiency and reducing pharmaceutical stockouts.

## The Challenge

Managing inventory of 15,000+ SKUs across 8 distribution hubs, serving 3,800+ customers with varying demand patterns, seasonal fluctuations, and regulatory shelf-life requirements required a step-change in forecasting capability.

## How MediPredict Works

MediPredict processes over 140 demand signals including:
- Historical sales patterns and seasonal trends
- Real-time order flow from healthcare institutions
- Manufacturer lead times and production schedules
- Disease outbreak data and epidemiological signals
- Regulatory expiry profiles for all product categories

## Results After 6 Months

After six months of production deployment:
- **87% reduction** in product stockout incidents
- **23% reduction** in excess inventory holding costs
- **94% accuracy** in 30-day demand forecasts
- **12% improvement** in order fill rate

"MediPredict has fundamentally changed how we manage supply," said the Chief Supply Chain Officer. "We're moving from reactive to proactive, and our customers are experiencing the benefits through better product availability."`,
      publishedAt: new Date('2025-01-20'),
    },
    {
      title: 'MediSource Wins MENA Healthcare Distribution Excellence Award 2025',
      category: 'Events', featured: false, status: 'published',
      tags: ['award', 'mena', 'excellence', 'recognition'],
      excerpt: 'MediSource Global has been recognised as the Most Innovative Pharmaceutical Distributor at the MENA Healthcare Excellence Awards 2025, held in Dubai, celebrating outstanding contributions to regional healthcare supply chain advancement.',
      content: `MediSource Global was honoured at the MENA Healthcare Excellence Awards 2025, receiving the prestigious "Most Innovative Pharmaceutical Distributor" award at a ceremony attended by over 800 healthcare industry leaders at the Jumeirah Emirates Towers, Dubai.

## About the Award

The MENA Healthcare Excellence Awards recognises organisations making measurable contributions to improving healthcare delivery across the Middle East and North Africa. MediSource was selected from 47 nominated organisations across 12 countries.

## Why MediSource Won

The judging panel cited three key achievements:
1. **Technology Leadership**: The MediPredict AI inventory system reducing stockouts by 87%
2. **WHO GDP Excellence**: Zero critical findings for two consecutive certification cycles
3. **Access Initiatives**: The WHO partnership for essential medicines in underserved markets

## Executive Comment

"This recognition belongs to our 1,200+ team members who work tirelessly every day to ensure that medicines and medical devices reach the patients who need them," said Ahmed Al-Rashidi, CEO. "We accept this award on their behalf."

MediSource continues its pursuit of operational excellence with a planned $25 million technology infrastructure investment over the next 24 months.`,
      publishedAt: new Date('2025-06-01'),
    },
    {
      title: 'New Cold Storage Facility Opens in Riyadh, Saudi Arabia',
      category: 'Company News', featured: false, status: 'published',
      tags: ['riyadh', 'saudi-arabia', 'cold-storage', 'facility'],
      excerpt: 'MediSource inaugurates its largest cold chain storage facility to date in Riyadh, with 12,000 square metres of GDP-compliant temperature-controlled warehousing capacity servicing the Saudi healthcare market.',
      content: `MediSource Global has officially inaugurated its newest and largest distribution facility in Riyadh, Saudi Arabia — a 12,000 square metre GDP-compliant pharmaceutical warehouse strategically located in the King Abdullah Economic City logistics zone.

## Facility Specifications

- **Total Area**: 12,000 m² including office, loading bays, and storage zones
- **Cold Room Capacity**: 3,200 m² at 2-8°C for cold chain products
- **Ambient Storage**: 7,500 m² at controlled 15-25°C  
- **Freezer Capacity**: 300 m² at -20°C for ultra-cold requirements
- **Loading Bays**: 24 temperature-controlled docking stations
- **Automation**: Automated guided vehicles (AGVs) for pick-and-pack

## Saudi Healthcare Market

Saudi Arabia's pharmaceutical market represents one of the largest in the MENA region with annual growth of 8-10%. The new facility positions MediSource to serve the Vision 2030 healthcare expansion programme, which plans to develop 300+ new healthcare facilities by 2030.

## SFDA Compliance

The facility is fully licensed under Saudi Food and Drug Authority (SFDA) pharmaceutical wholesale dealer regulations and complies with all applicable GDP guidelines.`,
      publishedAt: new Date('2024-12-05'),
    },
    {
      title: 'Sustainable Supply Chain: MediSource Commits to Carbon Neutrality by 2030',
      category: 'Sustainability', featured: false, status: 'published',
      tags: ['sustainability', 'carbon-neutral', 'esg', 'environment'],
      excerpt: 'MediSource Global unveils its comprehensive ESG roadmap with a firm commitment to achieving carbon-neutral operations by 2030, including fleet electrification, renewable energy adoption, and sustainable packaging initiatives.',
      content: `MediSource Global has today announced its comprehensive Environmental, Social, and Governance (ESG) strategy, with carbon-neutral operations as the headline commitment by 2030.

## Climate Commitment

MediSource commits to:
- **50% reduction** in Scope 1 and 2 emissions by 2027
- **Carbon neutrality** across all operations by 2030
- **Net zero** supply chain (Scope 3) by 2035

## Key Initiatives

**Fleet Electrification**
- 40% of short-haul delivery fleet converted to EV by 2026
- Full EV conversion for urban delivery vehicles by 2028
- Hydrogen fuel cell pilots for long-haul refrigerated transport

**Renewable Energy**
- Solar PV installation at 6 distribution centres (2025)
- 100% renewable electricity procurement by 2027

**Sustainable Packaging**
- Elimination of single-use plastic outer packaging by 2026
- Biodegradable cold pack materials rolled out regionally

"Climate responsibility is not at odds with our mission to deliver healthcare products — it's integral to it," said the Chief Sustainability Officer. "Sustainable operations are more resilient operations, and that ultimately serves our patients better."`,
      publishedAt: new Date('2024-11-18'),
    },
  ];

  let newsCreated = 0;
  for (const n of newsData) {
    const slug = slugify(n.title);
    await News.findOneAndUpdate(
      { slug },
      {
        title: n.title, slug, excerpt: n.excerpt, content: n.content,
        coverImage: { url: img(`news-${newsCreated}`), publicId: `news-${newsCreated}` },
        category: n.category, tags: n.tags,
        author: adminId, status: n.status, featured: n.featured,
        publishedAt: n.publishedAt,
        seo: { metaTitle: n.title, metaDescription: n.excerpt.slice(0, 160) },
      },
      { upsert: true, new: true },
    );
    newsCreated++;
  }
  console.log(`   ✅ ${newsCreated} articles`);

  // ═══════════════════════════════════════════════════════════
  // 8. CAREERS
  // ═══════════════════════════════════════════════════════════
  console.log('\n💼 Seeding careers...');
  const careersData = [
    {
      title: 'Senior Pharmaceutical Sales Manager',
      department: 'Commercial', location: 'Dubai, UAE', type: 'full-time' as const,
      experience: '5+ years', status: 'active' as const, featured: true,
      salaryRange: { min: 15000, max: 22000, currency: 'AED', period: 'monthly' },
      deadline: new Date('2025-09-30'),
      responsibilities: [
        'Manage a portfolio of 40+ institutional accounts across UAE hospitals and clinics',
        'Develop and execute territory sales strategies to exceed quarterly revenue targets',
        'Build and maintain C-level relationships with procurement and pharmacy directors',
        'Lead a team of 5 medical representatives and provide coaching and development',
        'Conduct product training sessions and clinical presentations to healthcare professionals',
        'Monitor competitor activity and market trends, providing intelligence to leadership',
        'Negotiate contracts and tender submissions in collaboration with the commercial team',
      ],
      requirements: [
        'Bachelor\'s degree in Pharmacy, Life Sciences, or Business Administration',
        'Minimum 5 years experience in pharmaceutical sales, with at least 2 in a senior role',
        'Proven track record of consistently exceeding sales targets (>110% achievement)',
        'Strong knowledge of UAE pharmaceutical market regulations and hospital procurement',
        'Excellent communication and presentation skills in English (Arabic preferred)',
        'Valid UAE driving licence',
        'Experience with CRM systems (Salesforce preferred)',
      ],
      benefits: ['Competitive base salary + performance bonus', 'Company vehicle + fuel card', 'Private health insurance (family)', 'Annual flight allowance', 'Professional development budget'],
      desc: 'We are seeking an experienced Senior Pharmaceutical Sales Manager to lead commercial activities across our UAE hospital portfolio, driving revenue growth while building strategic partnerships with key healthcare institutions.',
    },
    {
      title: 'Cold Chain Logistics Coordinator',
      department: 'Operations', location: 'Dubai, UAE', type: 'full-time' as const,
      experience: '3-5 years', status: 'active' as const, featured: true,
      salaryRange: { min: 8000, max: 12000, currency: 'AED', period: 'monthly' },
      deadline: new Date('2025-08-31'),
      responsibilities: [
        'Coordinate daily temperature-controlled shipments across UAE and GCC markets',
        'Monitor real-time temperature logs for all cold chain consignments',
        'Investigate and resolve temperature deviation incidents within 2-hour SLA',
        'Liaise with customs clearance agents for pharmaceutical import documentation',
        'Maintain GDP-compliant records for all cold chain movements',
        'Coordinate with third-party cold chain carriers to ensure SLA compliance',
        'Prepare weekly cold chain performance reports for management review',
      ],
      requirements: [
        'Bachelor\'s degree in Logistics, Supply Chain Management, or related field',
        '3-5 years experience in cold chain logistics, preferably pharmaceutical',
        'Strong knowledge of GDP guidelines and temperature-controlled transport requirements',
        'Experience with temperature monitoring systems (Sensitech, Controlant, or similar)',
        'Proficiency in MS Excel and logistics management software',
        'Ability to work in a fast-paced 24/7 logistics environment',
        'IATA Dangerous Goods certification is an advantage',
      ],
      benefits: ['Competitive salary', 'Annual bonus based on performance', 'Medical insurance', 'Transportation allowance', 'Shift allowances'],
      desc: 'Join our operations team to oversee the integrity of our temperature-controlled pharmaceutical supply chain, ensuring all cold chain products reach healthcare customers within strict temperature specifications.',
    },
    {
      title: 'Quality Assurance Specialist',
      department: 'Quality Assurance', location: 'Abu Dhabi, UAE', type: 'full-time' as const,
      experience: '3-5 years', status: 'active' as const, featured: false,
      salaryRange: { min: 10000, max: 14000, currency: 'AED', period: 'monthly' },
      deadline: new Date('2025-10-15'),
      responsibilities: [
        'Implement and maintain GDP-compliant quality management systems across distribution operations',
        'Conduct internal audits and prepare corrective action plans for non-conformances',
        'Manage product recall and withdrawal procedures in compliance with regulatory requirements',
        'Review and approve batch release documentation for incoming pharmaceutical products',
        'Train warehouse and logistics staff on GDP requirements and quality procedures',
        'Liaise with MOHAP, SFDA, and other regulatory authorities on compliance matters',
        'Manage the deviation, CAPA, and change control management systems',
      ],
      requirements: [
        'Bachelor\'s degree in Pharmacy, Chemistry, or Biological Sciences',
        'Minimum 3 years QA experience in pharmaceutical distribution or manufacturing',
        'Deep knowledge of WHO GDP guidelines and ICH Q10 quality system requirements',
        'Experience with regulatory submissions and authority inspections',
        'Familiar with quality management software (TrackWise, MasterControl, or similar)',
        'Strong analytical and problem-solving skills',
        'Registered Pharmacist with UAE MOH is an advantage',
      ],
      benefits: ['Competitive salary', 'Performance bonus', 'Full medical insurance', 'Education sponsorship', 'Career advancement opportunities'],
      desc: 'We are looking for a dedicated Quality Assurance Specialist to uphold the highest pharmaceutical quality standards across our Abu Dhabi distribution operations, supporting our WHO GDP certification and regulatory compliance commitments.',
    },
    {
      title: 'Business Development Executive — KSA Market',
      department: 'Business Development', location: 'Riyadh, Saudi Arabia', type: 'full-time' as const,
      experience: '3-5 years', status: 'active' as const, featured: false,
      salaryRange: { min: 12000, max: 18000, currency: 'SAR', period: 'monthly' },
      deadline: new Date('2025-08-15'),
      responsibilities: [
        'Identify and develop new business opportunities with hospitals, clinics, and GPOs in KSA',
        'Build and manage a pipeline of prospective institutional clients with AED 10M+ annual potential',
        'Prepare and present business proposals, including pricing, terms, and service offerings',
        'Represent MediSource at Saudi healthcare exhibitions, conferences, and industry events',
        'Collaborate with marketing to develop localised content and campaigns for the KSA market',
        'Onboard new clients and ensure smooth transition to account management',
        'Track and report on BD metrics including pipeline value, conversion rates, and revenue contribution',
      ],
      requirements: [
        'Bachelor\'s degree in Business, Health Sciences, or related field; MBA preferred',
        '3-5 years business development experience in pharmaceutical distribution or healthcare',
        'Established network of contacts within Saudi Arabian hospital procurement and pharmacy',
        'Excellent Arabic communication skills are mandatory',
        'Knowledge of SFDA pharmaceutical distribution regulations',
        'Proven ability to close large institutional contracts (SAR 1M+)',
        'Willingness to travel extensively within KSA',
      ],
      benefits: ['Competitive base + commission', 'Company vehicle', 'Medical and dental insurance', 'Annual leave of 30 days', 'Housing allowance'],
      desc: 'Exciting opportunity for a results-driven business development professional to spearhead MediSource\'s growth strategy in the rapidly expanding Saudi Arabian healthcare market following our new Riyadh facility opening.',
    },
    {
      title: 'Supply Chain Data Analyst',
      department: 'Operations', location: 'Dubai, UAE', type: 'full-time' as const,
      experience: '2-4 years', status: 'active' as const, featured: false,
      salaryRange: { min: 9000, max: 13000, currency: 'AED', period: 'monthly' },
      deadline: new Date('2025-09-15'),
      responsibilities: [
        'Analyse supply chain performance data to identify trends, inefficiencies, and opportunities',
        'Build and maintain interactive dashboards for real-time supply chain visibility',
        'Develop demand forecasting models using statistical and machine learning approaches',
        'Support inventory optimisation initiatives to reduce excess stock and prevent stockouts',
        'Prepare regular reporting packages for operations leadership and board presentations',
        'Collaborate with IT to enhance the data infrastructure supporting MediPredict AI platform',
        'Conduct root cause analyses on supply chain disruptions and present findings',
      ],
      requirements: [
        'Bachelor\'s degree in Data Science, Statistics, Industrial Engineering, or related field',
        '2-4 years analytics experience, ideally in healthcare or pharmaceutical supply chain',
        'Proficiency in Python or R for statistical analysis and machine learning',
        'Advanced Power BI or Tableau dashboard development skills',
        'Experience with SQL and large dataset management',
        'Strong analytical mindset with ability to translate data into actionable insights',
        'Experience with ERP systems (SAP, Oracle) is an advantage',
      ],
      benefits: ['Competitive salary', 'Annual performance bonus', 'Medical insurance', 'Learning and development budget', 'Flexible working arrangements'],
      desc: 'Join MediSource\'s Data Intelligence team to power our supply chain transformation, turning complex operational data into insights that drive better pharmaceutical availability and reduce costs across our distribution network.',
    },
    {
      title: 'Medical Regulatory Affairs Specialist',
      department: 'Regulatory Affairs', location: 'Dubai, UAE', type: 'full-time' as const,
      experience: '3-5 years', status: 'active' as const, featured: false,
      salaryRange: { min: 12000, max: 16000, currency: 'AED', period: 'monthly' },
      deadline: new Date('2025-10-31'),
      responsibilities: [
        'Manage product registration submissions with UAE MOH, SFDA, and other GCC authorities',
        'Prepare and review regulatory dossiers for pharmaceutical and medical device products',
        'Monitor and communicate regulatory changes affecting the product portfolio',
        'Liaise with international regulatory authorities for import licenses and approvals',
        'Coordinate with manufacturers on regulatory documentation requirements',
        'Maintain the regulatory affairs database and document management system',
        'Support quality team on GDP audits and regulatory inspections',
      ],
      requirements: [
        'Bachelor\'s or Master\'s degree in Pharmacy, Regulatory Affairs, or Life Sciences',
        '3-5 years regulatory affairs experience in pharmaceutical or medical device sector',
        'Hands-on experience with UAE MOHAP/CPDD registration processes',
        'Knowledge of GCC mutual recognition procedures',
        'Familiarity with EU MDR, FDA, and ICH guidelines',
        'Strong technical writing skills for dossier preparation',
        'Registered Pharmacist preferred',
      ],
      benefits: ['Competitive salary', 'Annual bonus', 'Full medical coverage', 'Professional memberships funded', 'Career growth in regulatory leadership'],
      desc: 'Critical role supporting MediSource\'s ability to commercialise pharmaceutical and medical device products across GCC markets through expert regulatory strategy and submission management.',
    },
    {
      title: 'Pharmacovigilance & Medical Affairs Officer',
      department: 'Medical Affairs', location: 'Dubai, UAE', type: 'full-time' as const,
      experience: '2-4 years', status: 'draft' as const, featured: false,
      salaryRange: { min: 11000, max: 15000, currency: 'AED', period: 'monthly' },
      deadline: new Date('2025-11-30'),
      responsibilities: [
        'Manage adverse event reporting in compliance with local and international requirements',
        'Maintain the pharmacovigilance database and ensure timely submission of safety reports',
        'Review and approve product labelling from a medical accuracy standpoint',
        'Prepare medical information responses for healthcare professional enquiries',
        'Collaborate with commercial team to develop medically accurate promotional materials',
        'Conduct literature monitoring for safety signals across the product portfolio',
      ],
      requirements: [
        'Medical degree (MBBS) or Bachelor\'s in Pharmacy with advanced PV training',
        '2-4 years pharmacovigilance experience in pharmaceutical industry',
        'Knowledge of ICH E2A-E2F guidelines and local MAH reporting requirements',
        'Experience with safety databases (Argus, ARISg, or similar)',
        'Strong scientific writing skills',
      ],
      benefits: ['Competitive package', 'Medical insurance', 'Annual bonus', 'Continuing medical education support'],
      desc: 'Manage pharmacovigilance and medical affairs activities across MediSource\'s pharmaceutical portfolio, ensuring patient safety and regulatory compliance.',
    },
  ];

  let careersCreated = 0;
  for (const c of careersData) {
    const slug = slugify(c.title);
    await Career.findOneAndUpdate(
      { slug },
      {
        title: c.title, slug, department: c.department, location: c.location,
        type: c.type, experience: c.experience, salaryRange: c.salaryRange,
        description: c.desc, responsibilities: c.responsibilities,
        requirements: c.requirements, benefits: c.benefits,
        status: c.status, featured: c.featured, deadline: c.deadline,
        postedAt: new Date(), createdBy: adminId,
        seo: { metaTitle: c.title },
      },
      { upsert: true, new: true },
    );
    careersCreated++;
  }
  console.log(`   ✅ ${careersCreated} job listings`);

  // ═══════════════════════════════════════════════════════════
  // 9. CERTIFICATIONS
  // ═══════════════════════════════════════════════════════════
  console.log('\n🏅 Seeding certifications...');
  const certificationsData = [
    { name: 'WHO Good Distribution Practice (GDP) Certificate', issuer: 'World Health Organization', type: 'WHO' as const, issueDate: new Date('2024-01-15'), expiryDate: new Date('2027-01-14'), desc: 'Certification confirming compliance with WHO guidelines on good distribution practices for pharmaceutical products.' },
    { name: 'ISO 9001:2015 Quality Management System', issuer: 'Bureau Veritas Certification', type: 'ISO' as const, issueDate: new Date('2024-06-01'), expiryDate: new Date('2027-05-31'), desc: 'International standard certification for quality management systems demonstrating consistent products and services that meet customer and regulatory requirements.' },
    { name: 'ISO 13485:2016 Medical Devices QMS', issuer: 'TÜV Rheinland', type: 'ISO' as const, issueDate: new Date('2024-09-10'), expiryDate: new Date('2027-09-09'), desc: 'Quality management system standard specific to medical devices, demonstrating capability to provide medical devices and related services that consistently meet customer and regulatory requirements.' },
    { name: 'Good Manufacturing Practice (GMP) Audit Certificate', issuer: 'PIC/S Member Authority', type: 'GMP' as const, issueDate: new Date('2025-03-20'), expiryDate: new Date('2027-03-19'), desc: 'GMP audit certificate verifying that storage and handling operations meet internationally recognised pharmaceutical manufacturing and distribution standards.' },
    { name: 'UAE MOHAP Pharmaceutical Distribution License', issuer: 'UAE Ministry of Health & Prevention', type: 'Other' as const, issueDate: new Date('2025-01-01'), expiryDate: new Date('2027-12-31'), desc: 'Official pharmaceutical wholesale distribution license issued by the UAE Ministry of Health & Prevention, authorising distribution of pharmaceutical products across the UAE.' },
    { name: 'Saudi SFDA Wholesale Drug Distributor License', issuer: 'Saudi Food and Drug Authority', type: 'Other' as const, issueDate: new Date('2025-07-01'), expiryDate: new Date('2027-06-30'), desc: 'SFDA-issued wholesale pharmaceutical distributor license for pharmaceutical distribution activities within the Kingdom of Saudi Arabia.' },
    { name: 'CE Marking — Medical Device Distribution', issuer: 'European Commission (via Notified Body)', type: 'CE' as const, issueDate: new Date('2025-04-01'), expiryDate: new Date('2028-03-31'), desc: 'CE certification confirming that medical devices in our portfolio meet European Union health, safety, and environmental protection standards.' },
    { name: 'IATA Dangerous Goods Regulations (DGR) Accreditation', issuer: 'International Air Transport Association', type: 'Other' as const, issueDate: new Date('2025-05-01'), expiryDate: new Date('2027-04-30'), desc: 'IATA DGR accreditation authorising the handling, packaging, and documentation of pharmaceutical products classified as dangerous goods for air freight.' },
  ];

  let certsCreated = 0;
  for (const c of certificationsData) {
    const slug = slugify(c.name);
    const now = new Date();
    const certStatus = c.expiryDate < now ? 'expired' : c.issueDate <= now && c.expiryDate >= now ? 'valid' : 'pending';
    await Certification.findOneAndUpdate(
      { slug },
      {
        name: c.name, slug, issuer: c.issuer, type: c.type,
        description: c.desc, issueDate: c.issueDate, expiryDate: c.expiryDate,
        status: certStatus,
        image: { url: img(`cert-${certsCreated}`), publicId: `cert-${certsCreated}` },
        document: { url: `https://docs.medisource.com/certs/${slug}.pdf`, publicId: `cert-doc-${certsCreated}`, filename: `${slug}.pdf` },
      },
      { upsert: true, new: true },
    );
    certsCreated++;
  }
  console.log(`   ✅ ${certsCreated} certifications`);

  // ═══════════════════════════════════════════════════════════
  // 10. PARTNERS
  // ═══════════════════════════════════════════════════════════
  console.log('\n🤝 Seeding partners...');
  const partnersData = [
    { name: 'Pfizer',              website: 'https://www.pfizer.com',    order: 1,  featured: true },
    { name: 'Abbott Laboratories', website: 'https://www.abbott.com',    order: 2,  featured: true },
    { name: 'Roche',               website: 'https://www.roche.com',     order: 3,  featured: true },
    { name: 'Siemens Healthineers',website: 'https://www.siemens-healthineers.com', order: 4, featured: true },
    { name: 'Johnson & Johnson',   website: 'https://www.jnj.com',       order: 5,  featured: true },
    { name: 'Medtronic',           website: 'https://www.medtronic.com', order: 6,  featured: true },
    { name: 'Novartis',            website: 'https://www.novartis.com',  order: 7,  featured: false },
    { name: 'AstraZeneca',         website: 'https://www.astrazeneca.com', order: 8, featured: false },
    { name: 'Sanofi',              website: 'https://www.sanofi.com',    order: 9,  featured: false },
    { name: 'Baxter International',website: 'https://www.baxter.com',    order: 10, featured: false },
    { name: 'BD (Becton Dickinson)',website: 'https://www.bd.com',       order: 11, featured: false },
    { name: 'Stryker',             website: 'https://www.stryker.com',   order: 12, featured: false },
  ];

  for (let i = 0; i < partnersData.length; i++) {
    const p = partnersData[i];
    const domain = p.website.replace('https://www.', '');
    await Partner.findOneAndUpdate(
      { name: p.name },
      { name: p.name, logo: { url: `https://logo.clearbit.com/${domain}`, publicId: `partner-${i}` }, website: p.website, order: p.order, featured: p.featured, status: 'active' },
      { upsert: true, new: true },
    );
  }
  console.log(`   ✅ ${partnersData.length} partners`);

  // ═══════════════════════════════════════════════════════════
  // 11. SERVICES
  // ═══════════════════════════════════════════════════════════
  console.log('\n🔧 Seeding services...');
  const servicesData = [
    {
      title: 'Cold Chain Distribution', slug: 'cold-chain-distribution', order: 1, featured: true, icon: 'Thermometer',
      excerpt: 'GDP-compliant temperature-controlled distribution maintaining 2°C to 8°C product integrity from warehouse to patient.',
      desc: 'Our cold chain distribution service represents the gold standard in pharmaceutical temperature management. We operate a fully integrated network of temperature-controlled warehouses, refrigerated vehicles, and passive cooling solutions to ensure your temperature-sensitive products maintain their efficacy throughout the supply chain.\n\nWith real-time temperature monitoring at every step and automated deviation alerts, we provide complete cold chain visibility and accountability.',
      features: ['Real-time GPS and temperature monitoring', 'Passive and active cooling options', '2-8°C, 15-25°C, and -20°C storage', 'Deviation alerts within 15 minutes', 'Complete chain of custody documentation', 'WHO GDP-certified facilities'],
    },
    {
      title: 'Pharmaceutical Wholesale Distribution', slug: 'pharmaceutical-wholesale', order: 2, featured: true, icon: 'Package',
      excerpt: 'End-to-end pharmaceutical wholesale distribution serving hospitals, clinics, and pharmacies across 18+ countries.',
      desc: 'MediSource operates one of the most comprehensive pharmaceutical wholesale distribution networks in the MENA and Asia-Pacific regions. Our portfolio of 15,000+ SKUs from 200+ manufacturers covers the full spectrum of pharmaceutical categories.\n\nWith dedicated account managers for each institutional client and a 99.4% on-time delivery rate, we deliver the reliability that healthcare institutions depend on.',
      features: ['15,000+ pharmaceutical SKUs', '99.4% on-time delivery rate', 'Same-day delivery in UAE metro areas', 'Automated reorder management', 'Dedicated account management', 'Regulatory import documentation support'],
    },
    {
      title: 'Medical Device Supply & Maintenance', slug: 'medical-device-supply', order: 3, featured: true, icon: 'Activity',
      excerpt: 'Complete medical device procurement, installation support, and ongoing maintenance coordination for healthcare facilities.',
      desc: 'Beyond supply, MediSource provides comprehensive medical device lifecycle support. From pre-procurement consultation and clinical evaluation to installation coordination, operator training, and preventive maintenance planning, we are your single point of contact for medical device management.\n\nOur biomedical engineering partnerships ensure your equipment operates at peak performance, maximising return on investment.',
      features: ['Full product portfolio from global manufacturers', 'Clinical evaluation and demonstration support', 'Installation and commissioning coordination', 'Operator training programmes', 'Preventive maintenance planning', 'Spare parts and consumables supply'],
    },
    {
      title: 'Regulatory Affairs Support', slug: 'regulatory-affairs-support', order: 4, featured: false, icon: 'Shield',
      excerpt: 'Expert regulatory affairs guidance for product registration and market authorisation across GCC and MENA markets.',
      desc: 'Navigating pharmaceutical and medical device regulatory requirements across multiple jurisdictions is complex and time-consuming. MediSource\'s regulatory affairs team provides expert support for product registration with UAE MOHAP, Saudi SFDA, Qatar MOH, Kuwait MOH, and other regional authorities.\n\nWe manage the complete dossier preparation, authority submissions, query responses, and approval tracking, enabling manufacturers to focus on product development.',
      features: ['UAE MOHAP product registration', 'Saudi SFDA registration management', 'GCC mutual recognition submissions', 'Medical device CE/FDA compliance guidance', 'Import license management', 'Regulatory intelligence monitoring'],
    },
    {
      title: 'Hospital Procurement Solutions', slug: 'hospital-procurement', order: 5, featured: false, icon: 'Building2',
      excerpt: 'Streamlined procurement solutions for hospital groups, including group purchasing, e-procurement integration, and demand forecasting.',
      desc: 'MediSource\'s hospital procurement solutions simplify the purchasing process for healthcare institutions through technology, consolidated ordering, and dedicated procurement support. We integrate with major hospital procurement systems including SAP, Oracle, and dedicated healthcare EPRs, enabling automated order generation and real-time inventory visibility.\n\nFor hospital groups and GPOs, we offer volume-based pricing frameworks and consolidated invoicing to maximise procurement efficiency.',
      features: ['ERP and e-procurement system integration', 'Group purchasing price agreements', 'Formulary management support', 'Automated reorder triggers', 'Consolidated invoicing for hospital groups', 'Consignment stock management options'],
    },
    {
      title: 'Surgical & Theatre Supply Management', slug: 'surgical-theatre-supply', order: 6, featured: false, icon: 'Scissors',
      excerpt: 'Dedicated surgical supply management including consignment stock, usage tracking, and just-in-time theatre replenishment.',
      desc: 'Operating theatre supply management demands precision and reliability. A missing implant or out-of-stock consumable can mean a cancelled surgery and serious patient harm. MediSource\'s surgical supply service is purpose-built for the operating theatre environment.\n\nWe provide consignment stock management, automated usage tracking, and guaranteed same-day emergency replenishment to ensure your operating theatres are always fully equipped.',
      features: ['Consignment stock management', 'Automated usage-based replenishment', 'Same-day emergency supply', 'Surgeon preference card management', 'Expiry date tracking and rotation', 'Vendor-managed inventory (VMI) available'],
    },
  ];

  let servicesCreated = 0;
  for (const s of servicesData) {
    await Service.findOneAndUpdate(
      { slug: s.slug },
      {
        title: s.title, slug: s.slug, excerpt: s.excerpt, description: s.desc,
        icon: s.icon, features: s.features, order: s.order, featured: s.featured, status: 'active',
        image: { url: img(`service-${servicesCreated}`), publicId: `service-${servicesCreated}` },
      },
      { upsert: true, new: true },
    );
    servicesCreated++;
  }
  console.log(`   ✅ ${servicesCreated} services`);

  // ═══════════════════════════════════════════════════════════
  // 12. TESTIMONIALS
  // ═══════════════════════════════════════════════════════════
  console.log('\n💬 Seeding testimonials...');
  const testimonialsData = [
    { name: 'Dr. Khalid Al-Mahmoud', position: 'Chief Pharmacist', company: 'King Fahad Medical City', rating: 5, featured: true,  content: 'MediSource has been our trusted pharmaceutical distribution partner for over 6 years. Their cold chain reliability is unmatched — we\'ve never had a temperature excursion with a shipment from them. The real-time tracking system gives us complete visibility and confidence that our temperature-sensitive biologics arrive in perfect condition.' },
    { name: 'Ms. Jennifer Thompson', position: 'Director of Supply Chain', company: 'NMC Health Group', rating: 5, featured: true,  content: 'With 50+ hospitals to supply, we need a distributor that can handle scale without sacrificing reliability. MediSource\'s automated reorder system and dedicated account management have reduced our procurement costs by 18% while improving our fill rates to 99.1%. Genuinely outstanding service.' },
    { name: 'Dr. Ahmed Hamdan', position: 'Medical Director', company: 'Aster DM Healthcare', rating: 5, featured: true,  content: 'What sets MediSource apart is their pharmacovigilance and regulatory support. When we needed to add new product lines to our formulary, their regulatory team handled the MOH registration process efficiently. It\'s not just distribution — it\'s a comprehensive pharmaceutical partnership.' },
    { name: 'Mr. Tariq Al-Farsi', position: 'Head of Procurement', company: 'SEHA Health System', rating: 5, featured: false, content: 'Managing pharmaceutical procurement for a 13-hospital network requires a supplier who truly understands our operational needs. MediSource\'s formulary management tools and group pricing agreements have simplified our procurement significantly. Their 24/7 emergency supply service has saved us on several critical occasions.' },
    { name: 'Dr. Priya Nambiar', position: 'Senior Clinical Pharmacist', company: 'Dubai Hospital', rating: 4, featured: false, content: 'The quality of pharmaceutical products supplied by MediSource is consistently high, and their documentation — certificates of analysis, batch records — is always complete and accurate. This is critical for a tertiary care hospital like ours where regulatory compliance cannot be compromised.' },
    { name: 'Mr. Hassan Khalil', position: 'CEO', company: 'PharmaCare Clinics', rating: 5, featured: false, content: 'As a growing clinic chain, we needed a supplier who could scale with us and give us access to a comprehensive formulary. MediSource\'s product breadth across pharmaceuticals and medical devices means we can consolidate our supplier base significantly, reducing administration and improving terms. Highly recommended.' },
  ];

  for (const t of testimonialsData) {
    await Testimonial.findOneAndUpdate(
      { name: t.name, company: t.company },
      {
        name: t.name, position: t.position, company: t.company,
        avatar: { url: `https://i.pravatar.cc/150?u=${encodeURIComponent(t.name)}`, publicId: `avatar-${slugify(t.name)}` },
        content: t.content, rating: t.rating, featured: t.featured, status: 'active',
      },
      { upsert: true, new: true },
    );
  }
  console.log(`   ✅ ${testimonialsData.length} testimonials`);

  // ═══════════════════════════════════════════════════════════
  // 13. GALLERY
  // ═══════════════════════════════════════════════════════════
  console.log('\n🖼️  Seeding gallery...');
  const galleryData = [
    { title: 'Dubai Main Warehouse — Overview', category: 'warehouse', tags: ['warehouse', 'dubai', 'facility'] },
    { title: 'Cold Storage Room — Temperature-Controlled Zone', category: 'warehouse', tags: ['cold-chain', 'storage', 'warehouse'] },
    { title: 'Automated Picking System', category: 'warehouse', tags: ['automation', 'technology', 'operations'] },
    { title: 'Quality Control Laboratory', category: 'facility', tags: ['quality', 'laboratory', 'compliance'] },
    { title: 'Loading Bay — GDP Compliant Operations', category: 'warehouse', tags: ['logistics', 'gdp', 'operations'] },
    { title: 'Riyadh Distribution Centre', category: 'facility', tags: ['riyadh', 'facility', 'saudi-arabia'] },
    { title: 'MediSource Team — Annual Conference 2024', category: 'team', tags: ['team', 'conference', 'event'] },
    { title: 'Clinical Training Session — Healthcare Partners', category: 'event', tags: ['training', 'healthcare', 'partners'] },
    { title: 'MENA Healthcare Excellence Awards 2025', category: 'event', tags: ['award', 'mena', 'event'] },
    { title: 'Pharmaceutical Product Portfolio Display', category: 'product', tags: ['products', 'pharmaceuticals', 'portfolio'] },
    { title: 'Medical Device Demonstration — Siemens Healthineers', category: 'product', tags: ['medical-devices', 'demonstration', 'partner'] },
    { title: 'Cold Chain Delivery Fleet', category: 'warehouse', tags: ['fleet', 'cold-chain', 'delivery'] },
    { title: 'Supply Chain Data Dashboard', category: 'facility', tags: ['technology', 'dashboard', 'digital'] },
    { title: 'Community Health Initiative — Nairobi', category: 'event', tags: ['community', 'africa', 'health'] },
    { title: 'Executive Team — MediSource Leadership', category: 'team', tags: ['leadership', 'executive', 'team'] },
    { title: 'ISO Audit Team — Quality Assurance', category: 'facility', tags: ['iso', 'audit', 'quality'] },
    { title: 'Southeast Asia Hub — Singapore', category: 'facility', tags: ['singapore', 'asia', 'facility'] },
    { title: 'Annual Staff Recognition Ceremony', category: 'event', tags: ['staff', 'recognition', 'event'] },
  ];

  for (let i = 0; i < galleryData.length; i++) {
    const g = galleryData[i];
    const slug = slugify(g.title);
    await Gallery.findOneAndUpdate(
      { title: g.title },
      {
        title: g.title, alt: g.title, description: g.title,
        image: { url: img(`gallery-${i}`), publicId: `gallery-${i}`, width: 800, height: 600, format: 'jpg', bytes: 150000 + i * 5000 },
        thumbnail: { url: img(`gallery-thumb-${i}`), publicId: `gallery-thumb-${i}` },
        category: g.category, tags: g.tags, order: i, featured: i < 4, uploadedBy: adminId,
      },
      { upsert: true, new: true },
    );
  }
  console.log(`   ✅ ${galleryData.length} gallery images`);

  // ═══════════════════════════════════════════════════════════
  // 14. DOWNLOADS
  // ═══════════════════════════════════════════════════════════
  console.log('\n📥 Seeding downloads...');
  const downloadsData = [
    { title: 'MediSource Company Profile 2025', category: 'Corporate', slug: 'company-profile-2025', desc: 'Comprehensive overview of MediSource Global, including company history, capabilities, product portfolio, and geographic reach.', tags: ['company', 'profile', 'corporate'] },
    { title: 'Product Catalogue 2025 — Pharmaceuticals', category: 'Catalogue', slug: 'product-catalogue-pharmaceuticals-2025', desc: 'Complete pharmaceutical product catalogue including SKUs, dosage forms, pack sizes, and manufacturer information.', tags: ['catalogue', 'pharmaceuticals', 'products'] },
    { title: 'Product Catalogue 2025 — Medical Devices', category: 'Catalogue', slug: 'product-catalogue-medical-devices-2025', desc: 'Full medical device and equipment catalogue with technical specifications, compliance certifications, and ordering information.', tags: ['catalogue', 'medical-devices', 'products'] },
    { title: 'Cold Chain Quality Manual', category: 'Quality', slug: 'cold-chain-quality-manual', desc: 'Our comprehensive cold chain quality management manual covering temperature monitoring protocols, deviation management, and SOP references.', tags: ['cold-chain', 'quality', 'gdp', 'manual'] },
    { title: 'WHO GDP Compliance Certificate 2024', category: 'Certificates', slug: 'who-gdp-certificate-2024', desc: 'Current WHO Good Distribution Practice certificate valid through 2027, issued following successful triennial audit.', tags: ['gdp', 'who', 'certificate', 'compliance'] },
    { title: 'ISO 9001:2015 Certificate', category: 'Certificates', slug: 'iso-9001-certificate-2023', desc: 'ISO 9001:2015 Quality Management System certification issued by Bureau Veritas, valid through 2026.', tags: ['iso', 'quality', 'certificate'] },
    { title: 'Pharmaceutical Storage & Handling Guidelines', category: 'Guidelines', slug: 'pharmaceutical-storage-guidelines', desc: 'Best practice guidelines for pharmaceutical storage and handling at healthcare facilities, aligned with WHO GDP requirements.', tags: ['guidelines', 'storage', 'handling', 'gdp'] },
    { title: 'Medical Device Procurement Guide for Hospitals', category: 'Guidelines', slug: 'medical-device-procurement-guide', desc: 'Step-by-step procurement guide for hospital biomedical departments covering evaluation, tendering, and post-purchase support.', tags: ['medical-devices', 'procurement', 'guide', 'hospital'] },
    { title: 'MediSource ESG Report 2024', category: 'Corporate', slug: 'esg-report-2024', desc: 'Environmental, Social, and Governance performance report detailing MediSource\'s sustainability progress and 2030 carbon neutrality roadmap.', tags: ['esg', 'sustainability', 'report', 'environment'] },
    { title: 'Emergency Supply Procedures', category: 'Quality', slug: 'emergency-supply-procedures', desc: 'Emergency pharmaceutical supply procedures including 24/7 contact protocols, critical shortage management, and escalation pathways.', tags: ['emergency', 'supply', 'procedures', 'operations'] },
  ];

  for (const d of downloadsData) {
    await Download.findOneAndUpdate(
      { slug: d.slug },
      {
        title: d.title, slug: d.slug, description: d.desc, category: d.category,
        file: { url: `https://docs.medisource.com/downloads/${d.slug}.pdf`, publicId: `download-${d.slug}`, filename: `${d.slug}.pdf`, size: 2500000, mimeType: 'application/pdf' },
        thumbnail: { url: '', publicId: '' },
        tags: d.tags, downloadCount: Math.floor(Math.random() * 500) + 50,
        requiresAuth: false, status: 'active', createdBy: adminId,
      },
      { upsert: true, new: true },
    );
  }
  console.log(`   ✅ ${downloadsData.length} downloads`);

  // ═══════════════════════════════════════════════════════════
  // 15. SAMPLE INQUIRIES
  // ═══════════════════════════════════════════════════════════
  console.log('\n📬 Seeding sample inquiries...');
  const inquiriesData = [
    { firstName: 'Dr. Ahmed', lastName: 'Al-Hassan', email: 'ahmed.hassan@kfmc.sa', phone: '+966 11 123 4567', company: 'King Fahad Medical City', dept: 'Pharmacy Procurement', subject: 'Request for Pharmaceutical Product List & Pricing', message: 'We are interested in establishing a distribution partnership with MediSource for our hospital network. Could you please provide us with your complete pharmaceutical catalogue, pricing framework, and terms of supply? We have approximately 1,200 beds across 3 facilities in Riyadh.', status: 'in_progress' as const },
    { firstName: 'Sarah', lastName: 'Williams', email: 's.williams@nmchealth.ae', phone: '+971 2 999 8888', company: 'NMC Health', dept: 'Supply Chain', subject: 'Cold Chain Distribution Partnership Enquiry', message: 'NMC Health operates 50+ hospitals and clinics across the GCC. We are reviewing our cold chain pharmaceutical distribution partners and would like to understand MediSource\'s capabilities in temperature-controlled logistics, including your GDP compliance status, monitoring systems, and SLA terms for temperature deviations.', status: 'new' as const },
    { firstName: 'Omar', lastName: 'Khalid', email: 'o.khalid@asterhealth.ae', phone: '+971 4 777 6655', company: 'Aster DM Healthcare', dept: 'General Enquiry', subject: 'Medical Device Procurement — Diagnostic Equipment', message: 'We are in the process of equipping 3 new diagnostic centres opening in Q3 2025. We require a comprehensive range of laboratory analysers, imaging equipment, and point-of-care devices. Could your team arrange a product presentation and provide indicative pricing for a full diagnostic centre setup?', status: 'new' as const },
    { firstName: 'Fatima', lastName: 'Al-Rashidi', email: 'fatima.rashidi@seha.ae', phone: '+971 2 811 1234', company: 'SEHA Health System', dept: 'Partnership', subject: 'Strategic Distribution Partnership — Abu Dhabi Region', message: 'SEHA Health System manages 14 hospitals and 47 primary health centres across Abu Dhabi. We are seeking a strategic pharmaceutical distribution partner with strong GCC regulatory expertise and cold chain capabilities. Please contact me to arrange an introductory meeting.', status: 'resolved' as const },
    { firstName: 'John', lastName: 'Smith', email: 'john.smith@ipharmacy.com', phone: '+44 20 7946 0200', company: 'International Pharmacy Group', dept: 'Sales & Distribution', subject: 'Wholesale Pharmaceutical Supply Agreement', message: 'We are a UK-based pharmaceutical wholesaler seeking to source products from GCC/MENA manufacturers and distributors. MediSource was recommended to us by our contacts at MENA Healthcare Conference. Please provide information on your export capabilities, minimum order quantities, and available therapeutic areas.', status: 'new' as const },
    { firstName: 'Ravi', lastName: 'Sharma', email: 'ravi.sharma@apollohospitals.com', phone: '+91 40 6060 6060', company: 'Apollo Hospitals Group', dept: 'Supply Chain', subject: 'Request for Surgical Supplies Catalogue', message: 'Apollo Hospitals is expanding our supply chain partnerships to include Middle East distributors for specialised surgical supplies. We are particularly interested in orthopaedic implants, cardiovascular devices, and minimally invasive surgery instruments from your premium brand partners.', status: 'archived' as const },
  ];

  let inquiriesCreated = 0;
  for (const i of inquiriesData) {
    const exists = await Inquiry.findOne({ email: i.email, subject: i.subject });
    if (!exists) {
      await Inquiry.create({
        firstName: i.firstName, lastName: i.lastName, email: i.email,
        phone: i.phone, company: i.company, department: i.dept,
        subject: i.subject, message: i.message, status: i.status,
      });
      inquiriesCreated++;
    }
  }
  console.log(`   ✅ ${inquiriesCreated} inquiries`);

  // ═══════════════════════════════════════════════════════════
  // FINAL SUMMARY
  // ═══════════════════════════════════════════════════════════
  console.log('\n' + '═'.repeat(55));
  console.log('  ✅  MediSource Seed Completed Successfully!');
  console.log('═'.repeat(55));
  console.log('  📦  Categories  : ' + categoryData.length);
  console.log('  🏷️   Brands      : ' + brandsData.length);
  console.log('  💊  Products    : ' + productsCreated);
  console.log('  📰  News        : ' + newsCreated);
  console.log('  💼  Careers     : ' + careersCreated);
  console.log('  🏅  Certs       : ' + certsCreated);
  console.log('  🤝  Partners    : ' + partnersData.length);
  console.log('  🔧  Services    : ' + servicesCreated);
  console.log('  💬  Testimonials: ' + testimonialsData.length);
  console.log('  🖼️   Gallery     : ' + galleryData.length);
  console.log('  📥  Downloads   : ' + downloadsData.length);
  console.log('  📬  Inquiries   : ' + inquiriesCreated);
  console.log('═'.repeat(55));
  console.log('  🔐  Admin Login:');
  console.log('  Email    : ' + (process.env.DEFAULT_SUPER_ADMIN_EMAIL ?? 'superadmin@medisource.com'));
  console.log('  Password : ' + (process.env.DEFAULT_SUPER_ADMIN_PASSWORD ?? 'Admin@123456'));
  console.log('  Staff PW : Staff@123456');
  console.log('═'.repeat(55) + '\n');

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('\n❌ Seed failed:', err.message ?? err);
  process.exit(1);
});
