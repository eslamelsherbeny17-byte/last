import crypto from 'crypto';

export async function uploadToCloudinary(
  file: File | any
): Promise<string> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary credentials missing in .env file');
  }

  try {
    const formData = new FormData();
    
    if (file instanceof File) {
      formData.append('file', file);
    } else {
      throw new Error('Invalid file format provided for upload');
    }
    
    const timestamp = Math.floor(Date.now() / 1000).toString();
    
    formData.append('api_key', apiKey);
    formData.append('timestamp', timestamp);

    const strToSign = `timestamp=${timestamp}${apiSecret}`;
    
    const signature = crypto
        .createHash('sha1')
        .update(strToSign)
        .digest('hex');
    
    formData.append('signature', signature);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Cloudinary upload failed: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('🔥 Cloudinary upload error:', error);
    throw error;
  }
}