import dotenv from 'dotenv';
dotenv.config();

export const storageConfig = {
  provider: (process.env.STORAGE_PROVIDER || 'local') as 'local' | 's3',
  local: {
    path: process.env.STORAGE_LOCAL_PATH || './uploads',
  },
  s3: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
    region: process.env.S3_REGION || '',
    bucketName: process.env.S3_BUCKET_NAME || '',
  },
};
