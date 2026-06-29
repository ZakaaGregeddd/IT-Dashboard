import fs from 'fs/promises';
import path from 'path';
import { storageConfig } from '../config/storage.js';

export interface IStorageService {
  saveFile(fileBuffer: Buffer, storageKey: string): Promise<void>;
  getFile(storageKey: string): Promise<Buffer>;
  deleteFile(storageKey: string): Promise<void>;
}

class LocalStorageService implements IStorageService {
  private uploadDir: string;

  constructor() {
    this.uploadDir = path.resolve(storageConfig.local.path);
    this.init();
  }

  private async init() {
    try {
      await fs.mkdir(this.uploadDir, { recursive: true });
    } catch (err) {
      console.error('Failed to create upload directory:', err);
    }
  }

  async saveFile(fileBuffer: Buffer, storageKey: string): Promise<void> {
    const filePath = path.join(this.uploadDir, storageKey);
    await fs.writeFile(filePath, fileBuffer);
  }

  async getFile(storageKey: string): Promise<Buffer> {
    const filePath = path.join(this.uploadDir, storageKey);
    return fs.readFile(filePath);
  }

  async deleteFile(storageKey: string): Promise<void> {
    const filePath = path.join(this.uploadDir, storageKey);
    try {
      await fs.unlink(filePath);
    } catch (err: any) {
      if (err.code !== 'ENOENT') {
        throw err;
      }
    }
  }
}

class S3StorageService implements IStorageService {
  constructor() {
    // Di production, instansiasikan AWS SDK S3Client di sini:
    // this.s3Client = new S3Client({ region: storageConfig.s3.region, credentials: { ... } });
    console.log('S3 Storage Service Initialized (Placeholder for production).');
  }

  async saveFile(fileBuffer: Buffer, storageKey: string): Promise<void> {
    console.log(`[Production S3] Uploading file: ${storageKey} to bucket: ${storageConfig.s3.bucketName}`);
    // Cuplikan kode untuk implementasi production:
    /*
    const command = new PutObjectCommand({
      Bucket: storageConfig.s3.bucketName,
      Key: storageKey,
      Body: fileBuffer,
    });
    await this.s3Client.send(command);
    */
  }

  async getFile(storageKey: string): Promise<Buffer> {
    console.log(`[Production S3] Retrieving file: ${storageKey} from bucket: ${storageConfig.s3.bucketName}`);
    // Cuplikan kode untuk implementasi production:
    /*
    const command = new GetObjectCommand({
      Bucket: storageConfig.s3.bucketName,
      Key: storageKey,
    });
    const response = await this.s3Client.send(command);
    const stream = response.Body as Readable;
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('error', reject);
      stream.on('end', () => resolve(Buffer.concat(chunks)));
    });
    */
    throw new Error('S3 implementation not initialized. Configure S3 Credentials in .env.');
  }

  async deleteFile(storageKey: string): Promise<void> {
    console.log(`[Production S3] Deleting file: ${storageKey} from bucket: ${storageConfig.s3.bucketName}`);
    /*
    const command = new DeleteObjectCommand({
      Bucket: storageConfig.s3.bucketName,
      Key: storageKey,
    });
    await this.s3Client.send(command);
    */
  }
}

// Factory untuk mengekspor instance service storage yang tepat berdasarkan konfigurasi
export const storageService: IStorageService =
  storageConfig.provider === 's3' ? new S3StorageService() : new LocalStorageService();
