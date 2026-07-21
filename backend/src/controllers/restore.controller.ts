import { Request, Response } from 'express';
import { RestoreService } from '../services/restore.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

export class RestoreController {
  static async getWorkOrder(req: Request, res: Response) {
    try {
      const { tahun } = req.query;

      if (!tahun) {
        const data = await RestoreService.getAllWorkOrders();
        return sendSuccess(res, data, 'Berhasil mengambil semua data Realisasi Restore Ellipse', 200);
      }

      const tahunNum = parseInt(tahun as string, 10);

      if (isNaN(tahunNum)) {
        return sendError(res, 'Format tahun harus berupa angka', 400);
      }

      const data = await RestoreService.getWorkOrder(tahunNum);

      return sendSuccess(res, data, 'Berhasil mengambil data Realisasi Restore Ellipse', 200);
    } catch (error: any) {
      console.error('[RestoreController] Error getting Realisasi Restore Ellipse:', error);
      return sendError(res, 'Gagal mengambil data Realisasi Restore Ellipse', 500, error.message);
    }
  }

  static async saveWorkOrder(req: Request, res: Response) {
    try {
      const { tahun, details } = req.body;

      if (tahun === undefined || !Array.isArray(details)) {
        return sendError(res, 'Data tahun dan details (array) wajib dikirimkan', 400);
      }

      const tahunNum = parseInt(tahun, 10);

      if (isNaN(tahunNum)) {
        return sendError(res, 'Format tahun harus berupa angka', 400);
      }

      const updatedData = await RestoreService.saveWorkOrder(
        tahunNum,
        details
      );

      return sendSuccess(res, updatedData, 'Berhasil menyimpan data restore', 200);
    } catch (error: any) {
      console.error('[RestoreController] Error saving restore:', error);
      return sendError(res, 'Gagal menyimpan data restore', 500, error.message);
    }
  }

  static async deleteRestore(req: Request, res: Response) {
    try {
      const { tahun } = req.query;

      if (!tahun) {
        return sendError(res, 'Tahun wajib dikirimkan', 400);
      }

      const tahunNum = parseInt(tahun as string, 10);

      if (isNaN(tahunNum)) {
        return sendError(res, 'Format tahun harus berupa angka', 400);
      }

      const deleted = await RestoreService.deleteRestore(tahunNum);

      if (!deleted) {
        return sendError(res, 'Data restore untuk tahun tersebut tidak ditemukan', 404);
      }

      return sendSuccess(res, null, 'Berhasil menghapus data restore', 200);
    } catch (error: any) {
      console.error('[RestoreController] Error deleting restore:', error);
      return sendError(res, 'Gagal menghapus data restore', 500, error.message);
    }
  }
}
