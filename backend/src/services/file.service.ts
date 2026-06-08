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
    userId: string,
    version: string
  ) {
    if (!version || version.trim() === '') {
      throw new Error('Version is required and cannot be empty.');
    }

    // Check if a file with the exact same name already exists in the system
    const existingFile = await prisma.file.findFirst({
      where: { originalName },
      include: {
        versions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    // Check if this version string is already used for this file (to prevent duplicates)
    if (existingFile) {
      const versionExists = await prisma.fileVersion.findFirst({
        where: {
          fileId: existingFile.id,
          version: version.trim(),
        },
      });

      if (versionExists) {
        throw new Error(`Version '${version}' already exists for file '${originalName}'.`);
      }
    }

    const storageKey = `${crypto.randomUUID()}-${originalName.replace(/\s+/g, '_')}`;
    const fileSize = BigInt(buffer.length);
    const checksum = this.calculateChecksum(buffer);

    // Save to storage (local disk or S3)
    await storageService.saveFile(buffer, storageKey);

    if (existingFile) {
      // If file exists, treat this as uploading a new version of the existing file
      return prisma.$transaction(async (tx) => {
        const updatedFile = await tx.file.update({
          where: { id: existingFile.id },
          data: {
            storageKey, // Point main storageKey to the latest version key
            mimeType,
            fileSize,
            checksum,
            // Keep original uploader (uploadedBy) unchanged, but updatedAt is updated automatically
          },
        });

        // Register new version with the custom user version string
        await tx.fileVersion.create({
          data: {
            fileId: existingFile.id,
            version: version.trim(),
            storageKey,
            fileSize,
            checksum,
            createdBy: userId,
          },
        });

        return updatedFile;
      });
    } else {
      // If file does not exist, register a brand new file with the user-defined version
      return prisma.$transaction(async (tx) => {
        const file = await tx.file.create({
          data: {
            originalName,
            storageKey,
            mimeType,
            fileSize,
            checksum,
            uploadedBy: userId,
          },
        });

        // Create initial version record using the custom version string
        await tx.fileVersion.create({
          data: {
            fileId: file.id,
            version: version.trim(),
            storageKey,
            fileSize,
            checksum,
            createdBy: userId,
          },
        });

        return file;
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
        versions: {
          orderBy: { createdAt: 'desc' },
          include: {
            creator: {
              select: { id: true, name: true, email: true },
            },
          },
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

  static async downloadFile(id: string, version?: string) {
    const file = await prisma.file.findUnique({
      where: { id },
    });

    if (!file) {
      throw new Error('File not found');
    }

    let storageKey = file.storageKey;

    if (version) {
      const fileVersion = await prisma.fileVersion.findFirst({
        where: { fileId: id, version: version.trim() },
      });
      if (!fileVersion) {
        throw new Error(`Version '${version}' of file not found`);
      }
      storageKey = fileVersion.storageKey;
    }

    const buffer = await storageService.getFile(storageKey);
    return {
      buffer,
      originalName: file.originalName,
      mimeType: file.mimeType,
    };
  }

  static async deleteFile(id: string) {
    const file = await prisma.file.findUnique({
      where: { id },
      include: { versions: true },
    });

    if (!file) {
      throw new Error('File not found');
    }

    // Delete all files from storage first
    for (const version of file.versions) {
      await storageService.deleteFile(version.storageKey);
    }
    // Delete main file key if different
    if (!file.versions.some(v => v.storageKey === file.storageKey)) {
      await storageService.deleteFile(file.storageKey);
    }

    // Delete DB records (Cascade will delete file_versions automatically)
    return prisma.file.delete({
      where: { id },
    });
  }
}
