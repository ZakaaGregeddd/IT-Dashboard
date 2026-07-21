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

      return sendSuccess(res, updatedData, 'Berhasil menyimpan data operasional TI', 200);
    } catch (error: any) {
      console.error('[OperasionalController] Error saving Operasional TI:', error);
      return sendError(res, 'Gagal menyimpan data operasional TI', 500, error.message);
    }
  }

  static async deleteOperasional(req: Request, res: Response) {
    try {
      const { tahun } = req.query;

      if (!tahun) {
        return sendError(res, 'Tahun wajib dikirimkan', 400);
      }

      const tahunNum = parseInt(tahun as string, 10);

      if (isNaN(tahunNum)) {
        return sendError(res, 'Format tahun harus berupa angka', 400);
      }

      const deleted = await OperasionalService.deleteOperasional(tahunNum);

      if (!deleted) {
        return sendError(res, 'Data operasional TI untuk tahun tersebut tidak ditemukan', 404);
      }

      return sendSuccess(res, null, 'Berhasil menghapus data operasional TI', 200);
    } catch (error: any) {
      console.error('[OperasionalController] Error deleting Operasional TI:', error);
      return sendError(res, 'Gagal menghapus data operasional TI', 500, error.message);
    }
  }
}
