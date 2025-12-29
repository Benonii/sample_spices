import { createClient } from '@supabase/supabase-js';
import { env } from './env';

// Initialize Supabase client
export const supabase = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

// Storage bucket name for product images
const PRODUCT_IMAGES_BUCKET = 'product_images';

// Initialize storage bucket if it doesn't exist
export async function initializeStorage() {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === PRODUCT_IMAGES_BUCKET);
    
    if (!bucketExists) {
      const { error } = await supabase.storage.createBucket(PRODUCT_IMAGES_BUCKET, {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
        fileSizeLimit: 5242880, // 5MB limit
      });
      
      if (error) {
        console.error('Error creating storage bucket:', error);
        throw error;
      }
      
      console.log('Storage bucket created successfully');
    }
  } catch (error) {
    console.error('Error initializing storage:', error);
    throw error;
  }
}

// Upload product image
export async function uploadProductImage(
  file: Buffer,
  fileName: string,
  productId: string
): Promise<string> {
  try {
    const filePath = `${productId}/${fileName}`;
    
    const { error } = await supabase.storage
      .from(PRODUCT_IMAGES_BUCKET)
      .upload(filePath, file, {
        contentType: 'image/jpeg',
        upsert: true
      });
    
    if (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
    
    // Get public URL
    const { data } = supabase.storage
      .from(PRODUCT_IMAGES_BUCKET)
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  } catch (error) {
    console.error('Error in uploadProductImage:', error);
    throw error;
  }
}

// Delete product image
export async function deleteProductImage(filePath: string): Promise<void> {
  try {
    const { error } = await supabase.storage
      .from(PRODUCT_IMAGES_BUCKET)
      .remove([filePath]);
    
    if (error) {
      console.error('Error deleting image:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteProductImage:', error);
    throw error;
  }
}

export async function getProductImages(productId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase.storage
      .from(PRODUCT_IMAGES_BUCKET)
      .list(productId);
    
    if (error) {
      console.error('Error listing images:', error);
      throw error;
    }
    
    return data.map(file => {
      const { data: urlData } = supabase.storage
        .from(PRODUCT_IMAGES_BUCKET)
        .getPublicUrl(`${productId}/${file.name}`);
      return urlData.publicUrl;
    });
  } catch (error) {
    console.error('Error in getProductImages:', error);
    throw error;
  }
}



