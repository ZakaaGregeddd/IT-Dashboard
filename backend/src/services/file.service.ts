import crypto from 'crypto';
import { prisma } from '../config/database.js';
import { storageService } from './storage.service.js';

export class FileService {
  private static calculateChecksum(buffer: Buffer): string {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  static async uploadFile(
    originalName: string,
    mimeType: string,
    buffer: Buffer,
    userId: string
  ) {
    // Check if a file with the exact same name already exists in the system
    const existingFile = await prisma.file.findFirst({
      where: { originalName },
    });

    const storageKey = `${crypto.randomUUID()}-${originalName.replace(/\s+/g, '_')}`;
    const fileSize = BigInt(buffer.length);
    const checksum = this.calculateChecksum(buffer);

    // Save to storage (local disk or S3)
    await storageService.saveFile(buffer, storageKey);

    if (existingFile) {
      // If file exists, delete the old physical file first to avoid leaking storage space
      try {
        await storageService.deleteFile(existingFile.storageKey);
      } catch (err) {
        console.error(`Failed to delete old storage file for ${existingFile.originalName}:`, err);
      }

      // Update existing database record
      return prisma.file.update({
        where: { id: existingFile.id },
        data: {
          storageKey,
          mimeType,
          fileSize,
          checksum,
          uploadedBy: userId,
        },
      });
    } else {
      // If file does not exist, register a brand new file
      return prisma.file.create({
        data: {
          originalName,
          storageKey,
          mimeType,
          fileSize,
          checksum,
          uploadedBy: userId,
        },
      });
    }
  }

  static async getFileMetadata(id: string) {
    return prisma.file.findUnique({
      where: { id },
      include: {
        uploader: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  static async listAllFiles() {
    return prisma.file.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        uploader: {
          select: { id: true, name: true },
        },
      },
    });
  }

  static async downloadFile(id: string) {
    const file = await prisma.file.findUnique({
      where: { id },
    });

    if (!file) {
      throw new Error('File not found');
    }

    const buffer = await storageService.getFile(file.storageKey);
    return {
      buffer,
      originalName: file.originalName,
      mimeType: file.mimeType,
    };
  }

  static async deleteFile(id: string) {
    const file = await prisma.file.findUnique({
      where: { id },
    });

    if (!file) {
      throw new Error('File not found');
    }

    // Delete the single file from physical storage
    await storageService.deleteFile(file.storageKey);

    // Delete the database record
    return prisma.file.delete({
      where: { id },
    });
  }
}
