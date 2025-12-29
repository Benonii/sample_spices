import { Hono } from 'hono'
import { supabase } from '@/utils/supabase'

const uploadRouter = new Hono()

uploadRouter.post('/presigned_url', async (c) => {
  const { filename } = await c.req.json<{ filename: string }>()

  if (!filename) {
    return c.json({ error: 'filename is required' }, 400)
  }

  // Create unique key (include folder if you want)
  const uniqueName = `${Date.now()}-${filename}`

  const { data, error } = await supabase.storage
    .from('product_images')
    .createSignedUploadUrl(uniqueName)

  if (error) {
    return c.json({ error: error.message }, 500)
  }

  // Generate the public URL using Supabase's getPublicUrl method
  const { data: publicUrlData } = supabase.storage
    .from('product_images')
    .getPublicUrl(uniqueName)

  return c.json({
    storageKey: uniqueName,
    fileName: filename,
    imageUrl: publicUrlData.publicUrl,
    imagePath: `product_images/${uniqueName}`,
    uploadUrl: data.signedUrl,
    bucket: 'product_images',
  })
})

export default uploadRouter
