import { Request, Response, NextFunction } from 'express';
import { FileService } from '../services/file.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

const formatFileResponse = (file: any) => {
  if (!file) return file;
  
  const serialize = (obj: any) => {
    const res = { ...obj };
    if (res.fileSize !== undefined && typeof res.fileSize === 'bigint') {
      res.fileSize = Number(res.fileSize);
    }
    return res;
  };

  return serialize(file);
};

export class FileController {
  static async uploadFile(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return sendError(res, 'No file uploaded. Please send a file.', 400);
      }

      if (!req.user) {
        return sendError(res, 'Unauthorized', 401);
      }

      const file = await FileService.uploadFile(
        req.file.originalname,
        req.file.mimetype,
        req.file.buffer,
        req.user.id
      );

      return sendSuccess(res, formatFileResponse(file), 'File uploaded and registered in SSOT successfully', 201);
    } catch (error: any) {
      if (error.message.includes('already exists') || error.message.includes('required')) {
        return sendError(res, error.message, 400);
      }
      next(error);
    }
  }

  static async listAllFiles(req: Request, res: Response, next: NextFunction) {
    try {
      const files = await FileService.listAllFiles();
      const formattedFiles = files.map((file) => formatFileResponse(file));
      return sendSuccess(res, formattedFiles, 'Files retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getFileMetadata(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const file = await FileService.getFileMetadata(id);
      if (!file) {
        return sendError(res, 'File not found', 404);
      }
      return sendSuccess(res, formatFileResponse(file), 'File metadata retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async downloadFile(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const fileData = await FileService.downloadFile(id);

      res.setHeader('Content-Type', fileData.mimeType);
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${encodeURIComponent(fileData.originalName)}"`
      );
      res.setHeader('X-Content-Type-Options', 'nosniff');
      
      return res.send(fileData.buffer);
    } catch (error: any) {
      if (error.message === 'File not found' || error.message.includes('not found')) {
        return sendError(res, error.message, 404);
      }
      next(error);
    }
  }

  static async deleteFile(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await FileService.deleteFile(id);
      return sendSuccess(res, null, 'File deleted successfully from SSOT and physical storage');
    } catch (error: any) {
      if (error.message === 'File not found') {
        return sendError(res, error.message, 404);
      }
      next(error);
    }
  }
}
