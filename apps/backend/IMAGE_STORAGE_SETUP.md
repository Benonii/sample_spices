# Image Storage Implementation Guide

This guide will walk you through setting up image storage for products using Supabase Storage.

## Prerequisites

1. **Supabase Project**: You need an active Supabase project
2. **Database**: Currently using SQLite, but PostgreSQL-compatible schema is provided

## Setup Steps

### 1. Supabase Configuration

#### Create Storage Bucket
1. Go to your Supabase dashboard
2. Navigate to Storage → Buckets
3. Create a new bucket called `product-images`
4. Set it as public
5. Configure CORS if needed

#### Get API Keys
1. Go to Settings → API
2. Copy your:
   - Project URL (`SUPABASE_URL`)
   - Anon key (`SUPABASE_ANON_KEY`)
   - Service role key (`SUPABASE_SERVICE_ROLE_KEY`)

### 2. Environment Configuration

Create a `.env.development` file in your backend directory:

```bash
# Database Configuration
DATABASE_URL="file:./drizzle/dev.db"
POSTGRES_URL="postgresql://username:password@localhost:5432/driptech"

# Supabase Configuration
SUPABASE_URL="https://your-project-id.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# CORS Configuration
CORS_WHITELIST="http://localhost:3000,http://localhost:5173"

# Environment
NODE_ENV="development"
PORT="3001"
```

### 3. Database Migration

The migration has already been created and applied. It:
- Creates a new `product_images` table
- Removes the old `image` column from the `product` table
- Establishes proper foreign key relationships

### 4. API Endpoints

#### Create Product with Images
```http
POST /api/admin/product
Content-Type: application/json

{
  "name": "Product Name",
  "description": "Product Description",
  "price": 29.99,
  "images": [
    {
      "name": "image1.jpg",
      "type": "image/jpeg",
      "size": 1024000
    }
  ],
  "status": "ACTIVE",
  "categoryID": "optional-category-id",
  "inventory": 10
}
```

#### Upload Images to Existing Product
```http
POST /api/admin/product/{productId}/images
Content-Type: multipart/form-data

Form data:
- images: [file1, file2, ...]
```

### 5. Database Schema

#### Product Images Table
```sql
CREATE TABLE `product_images` (
  `id` text PRIMARY KEY NOT NULL,
  `product_id` text NOT NULL,
  `image_url` text NOT NULL,
  `image_path` text NOT NULL,
  `file_name` text NOT NULL,
  `is_primary` integer NOT NULL,
  `order_index` integer NOT NULL,
  `created_at` integer NOT NULL,
  FOREIGN KEY (`product_id`) REFERENCES `product`(`id`) ON DELETE cascade
);
```

### 6. Switching to PostgreSQL

If you want to switch to PostgreSQL:

1. **Update Drizzle Config**:
   ```typescript
   // drizzle.config.ts
   export default {
     schema: "./src/db/schema-postgres.ts",
     out: "./drizzle",
     dialect: "postgresql",
     dbCredentials: {
       url: process.env.POSTGRES_URL!,
     },
   };
   ```

2. **Update Database Connection**:
   ```typescript
   // src/db/index.ts
   import { drizzle } from 'drizzle-orm/postgres-js';
   import postgres from 'postgres';
   
   const client = postgres(env.POSTGRES_URL);
   export const db = drizzle(client);
   ```

3. **Run Migrations**:
   ```bash
   bun run drizzle:sync
   ```

### 7. Frontend Integration

#### Upload Images
```typescript
const uploadImages = async (productId: string, files: File[]) => {
  const formData = new FormData();
  files.forEach(file => formData.append('images', file));
  
  const response = await fetch(`/api/admin/product/${productId}/images`, {
    method: 'POST',
    body: formData,
  });
  
  return response.json();
};
```

#### Display Images
```typescript
const ProductImages = ({ images }: { images: ProductImage[] }) => {
  const primaryImage = images.find(img => img.isPrimary);
  const otherImages = images.filter(img => !img.isPrimary);
  
  return (
    <div>
      {primaryImage && (
        <img 
          src={primaryImage.imageUrl} 
          alt="Primary product image"
          className="w-full h-64 object-cover"
        />
      )}
      <div className="flex gap-2 mt-2">
        {otherImages.map(img => (
          <img 
            key={img.id}
            src={img.imageUrl} 
            alt={img.fileName}
            className="w-20 h-20 object-cover"
          />
        ))}
      </div>
    </div>
  );
};
```

## Features

- **Multiple Images**: Support for multiple images per product
- **Primary Image**: Designate one image as primary
- **Ordering**: Images can be ordered
- **File Validation**: Size and type validation
- **Automatic Cleanup**: Images are deleted when products are deleted
- **Public URLs**: Images are publicly accessible
- **Cross-Platform**: Works with both SQLite and PostgreSQL

## Security Considerations

1. **File Size Limits**: 5MB maximum per image
2. **File Type Validation**: Only image files allowed
3. **Authentication**: Endpoints should be protected (currently commented out)
4. **CORS**: Configure CORS properly for your domains

## Troubleshooting

### Common Issues

1. **Bucket Not Found**: Ensure the `product-images` bucket exists in Supabase
2. **Permission Denied**: Check your service role key has proper permissions
3. **CORS Errors**: Verify CORS settings in Supabase and your app
4. **File Upload Fails**: Check file size and type constraints

### Debug Mode

Enable debug logging by setting:
```typescript
// In src/utils/supabase.ts
console.log('Supabase URL:', env.SUPABASE_URL);
console.log('Bucket name:', PRODUCT_IMAGES_BUCKET);
```

## Next Steps

1. **Implement Authentication**: Uncomment and configure auth middleware
2. **Add Image Management**: Create endpoints for reordering, deleting, and setting primary images
3. **Image Optimization**: Add image resizing and compression
4. **CDN Integration**: Consider using Supabase's CDN features
5. **Backup Strategy**: Implement image backup and recovery

## Support

If you encounter issues:
1. Check the Supabase dashboard for storage errors
2. Verify environment variables are set correctly
3. Check browser console for CORS errors
4. Review server logs for detailed error messages



