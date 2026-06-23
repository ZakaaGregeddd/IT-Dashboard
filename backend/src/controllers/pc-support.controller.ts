import { Request, Response } from 'express';
import { PcSupportService } from '../services/pc-support.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

export class PcSupportController {
  static async getWorkOrder(req: Request, res: Response) {
    try {
      const { tahun } = req.query;

      if (!tahun) {
        const data = await PcSupportService.getAllWorkOrders();
        return sendSuccess(res, data, 'Berhasil mengambil semua data PC Support', 200);
      }

      const tahunNum = parseInt(tahun as string, 10);

      if (isNaN(tahunNum)) {
        return sendError(res, 'Format tahun harus berupa angka', 400);
      }

      const data = await PcSupportService.getWorkOrder(tahunNum);

      return sendSuccess(res, data, 'Berhasil mengambil data PC Support', 200);
    } catch (error: any) {
      console.error('[PcSupportController] Error getting PC Support:', error);
      return sendError(res, 'Gagal mengambil data PC Support', 500, error.message);
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

      const updatedData = await PcSupportService.saveWorkOrder(
        tahunNum,
        details
      );

      return sendSuccess(res, updatedData, 'Berhasil menyimpan data PC Support', 200);
    } catch (error: any) {
      console.error('[PcSupportController] Error saving PC Support:', error);
      return sendError(res, 'Gagal menyimpan data PC Support', 500, error.message);
    }
  }
}
