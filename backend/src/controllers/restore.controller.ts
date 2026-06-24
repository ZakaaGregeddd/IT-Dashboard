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

      return sendSuccess(res, updatedData, 'Berhasil menyimpan data Realisasi Restore Ellipse', 200);
    } catch (error: any) {
      console.error('[RestoreController] Error saving Realisasi Restore Ellipse:', error);
      return sendError(res, 'Gagal menyimpan data Realisasi Restore Ellipse', 500, error.message);
    }
  }
}
