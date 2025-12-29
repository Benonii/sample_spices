# Ethiopian Spice Platform - Seed Instructions

## Overview
This document explains how to seed the database with Ethiopian spice products and clean up non-spice products.

## Prerequisites
- Database connection configured (DATABASE_URL in .env)
- At least one user exists in the database (or set ADMIN_USER_ID env variable)

## Seeding Spice Products

### Run the seed script:
```bash
cd apps/backend
bun run seed-spices.ts
```

### What it does:
- Creates "Ethiopian Spices" category if it doesn't exist
- Adds 12 authentic Ethiopian spice products with:
  - Descriptions
  - Prices ($8.99 - $24.99)
  - Inventory levels
  - Placeholder images (Unsplash URLs)
  - Category assignments

### Products added:
1. Authentic Berbere Spice Blend
2. Mitmita - Hot Chili Powder
3. Awaze - Spicy Paste Blend
4. Korerima - Ethiopian Cardamom
5. Tikur Azmud - Black Cumin
6. Rue - Traditional Ethiopian Herb
7. Kosseret - Ethiopian Basil
8. Fenugreek Seeds
9. Ground Turmeric
10. Ground Cumin
11. Ground Coriander
12. Black Pepper - Whole & Ground

### Environment Variables:
- `ADMIN_USER_ID` (optional): Use a specific user ID for product ownership
- If not set, uses the first user found in the database

## Cleaning Up Non-Spice Products

### Run the cleanup script:
```bash
cd apps/backend
bun run cleanup-non-spices.ts
```

### Dry Run (default):
By default, the script runs in DRY_RUN mode and only shows what would be deleted:
```bash
bun run cleanup-non-spices.ts
```

### Actually Delete:
To actually perform the cleanup:
```bash
DRY_RUN=false bun run cleanup-non-spices.ts
```

### What it does:
- Finds all products NOT in the "Ethiopian Spices" category
- Soft deletes them (sets deletedAt and status to ARCHIVED)
- Products will not appear in listings but remain in database

## Notes
- Both scripts are idempotent - safe to run multiple times
- Seed script skips products that already exist (by name)
- Cleanup script only affects active, non-deleted products
- All changes are logged to console

