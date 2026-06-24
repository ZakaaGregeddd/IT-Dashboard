import { Request, Response } from 'express';
import { LayananAppService } from '../services/layanan-app.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

export class LayananAppController {
  static async getWorkOrder(req: Request, res: Response) {
    try {
      const { tahun } = req.query;

      if (!tahun) {
        const data = await LayananAppService.getAllWorkOrders();
        return sendSuccess(res, data, 'Berhasil mengambil semua data Layanan Aplikasi TI', 200);
      }

      const tahunNum = parseInt(tahun as string, 10);

      if (isNaN(tahunNum)) {
        return sendError(res, 'Format tahun harus berupa angka', 400);
      }

      const data = await LayananAppService.getWorkOrder(tahunNum);

      return sendSuccess(res, data, 'Berhasil mengambil data Layanan Aplikasi TI', 200);
    } catch (error: any) {
      console.error('[LayananAppController] Error getting Layanan Aplikasi TI:', error);
      return sendError(res, 'Gagal mengambil data Layanan Aplikasi TI', 500, error.message);
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

      const updatedData = await LayananAppService.saveWorkOrder(
        tahunNum,
        details
      );

      return sendSuccess(res, updatedData, 'Berhasil menyimpan data Layanan Aplikasi TI', 200);
    } catch (error: any) {
      console.error('[LayananAppController] Error saving Layanan Aplikasi TI:', error);
      return sendError(res, 'Gagal menyimpan data Layanan Aplikasi TI', 500, error.message);
    }
  }
}
