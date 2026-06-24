import { Request, Response } from 'express';
import { OperasionalService } from '../services/operasional.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

export class OperasionalController {
  static async getWorkOrder(req: Request, res: Response) {
    try {
      const { tahun } = req.query;

      if (!tahun) {
        const data = await OperasionalService.getAllWorkOrders();
        return sendSuccess(res, data, 'Berhasil mengambil semua data Layanan Operasional TI', 200);
      }

      const tahunNum = parseInt(tahun as string, 10);

      if (isNaN(tahunNum)) {
        return sendError(res, 'Format tahun harus berupa angka', 400);
      }

      const data = await OperasionalService.getWorkOrder(tahunNum);

      return sendSuccess(res, data, 'Berhasil mengambil data Layanan Operasional TI', 200);
    } catch (error: any) {
      console.error('[OperasionalController] Error getting Layanan Operasional TI:', error);
      return sendError(res, 'Gagal mengambil data Layanan Operasional TI', 500, error.message);
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

      const updatedData = await OperasionalService.saveWorkOrder(
        tahunNum,
        details
      );

      return sendSuccess(res, updatedData, 'Berhasil menyimpan data Layanan Operasional TI', 200);
    } catch (error: any) {
      console.error('[OperasionalController] Error saving Layanan Operasional TI:', error);
      return sendError(res, 'Gagal menyimpan data Layanan Operasional TI', 500, error.message);
    }
  }
}
