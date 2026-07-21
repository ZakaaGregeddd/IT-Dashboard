import { Request, Response } from 'express';
import { UtilisasiMemoryService } from '../services/utilisasi-memory.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

export class UtilisasiMemoryController {
  /**
   * Get Memory utilization by month & year, or all if no query params provided
   */
  static async getUtilisasi(req: Request, res: Response) {
    try {
      const { bulan, tahun } = req.query;

      if (!bulan || !tahun) {
        const data = await UtilisasiMemoryService.getAllUtilisasi();
        return sendSuccess(res, data, 'Berhasil mengambil semua data utilisasi memori', 200);
      }

      const bulanNum = parseInt(bulan as string, 10);
      const tahunNum = parseInt(tahun as string, 10);

      if (isNaN(bulanNum) || isNaN(tahunNum)) {
        return sendError(res, 'Format bulan dan tahun harus berupa angka', 400);
      }

      const data = await UtilisasiMemoryService.getUtilisasi(bulanNum, tahunNum);

      return sendSuccess(res, data, 'Berhasil mengambil data utilisasi memori', 200);
    } catch (error: any) {
      console.error('[UtilisasiMemoryController] Error getting memory utilisasi:', error);
      return sendError(res, 'Gagal mengambil data utilisasi memori', 500, error.message);
    }
  }

  /**
   * Save or update Memory utilization (Master and Details)
   */
  static async saveUtilisasi(req: Request, res: Response) {
    try {
      const { bulan, tahun, target_utilisasi_persen, details } = req.body;

      if (
        bulan === undefined ||
        tahun === undefined ||
        target_utilisasi_persen === undefined ||
        !Array.isArray(details)
      ) {
        return sendError(res, 'Data bulan, tahun, target utilisasi persen, dan details (array) wajib dikirimkan', 400);
      }

      const bulanNum = parseInt(bulan, 10);
      const tahunNum = parseInt(tahun, 10);

      if (isNaN(bulanNum) || isNaN(tahunNum)) {
        return sendError(res, 'Format bulan dan tahun harus berupa angka', 400);
      }

      const updatedData = await UtilisasiMemoryService.saveUtilisasi(
        bulanNum,
        tahunNum,
        parseFloat(target_utilisasi_persen),
        details
      );

      return sendSuccess(res, updatedData, 'Berhasil menyimpan data utilisasi memori', 200);
    } catch (error: any) {
      console.error('[UtilisasiMemoryController] Error saving memory utilisasi:', error);
      return sendError(res, 'Gagal menyimpan data utilisasi memori', 500, error.message);
    }
  }

  /**
   * Delete Memory utilization data by month & year
   */
  static async deleteUtilisasi(req: Request, res: Response) {
    try {
      const { bulan, tahun } = req.query;

      if (!bulan || !tahun) {
        return sendError(res, 'Bulan dan tahun wajib dikirimkan', 400);
      }

      const bulanNum = parseInt(bulan as string, 10);
      const tahunNum = parseInt(tahun as string, 10);

      if (isNaN(bulanNum) || isNaN(tahunNum)) {
        return sendError(res, 'Format bulan dan tahun harus berupa angka', 400);
      }

      const deleted = await UtilisasiMemoryService.deleteUtilisasi(bulanNum, tahunNum);

      if (!deleted) {
        return sendError(res, 'Data utilisasi memori untuk periode tersebut tidak ditemukan', 404);
      }

      return sendSuccess(res, null, 'Berhasil menghapus data utilisasi memori', 200);
    } catch (error: any) {
      console.error('[UtilisasiMemoryController] Error deleting memory utilisasi:', error);
      return sendError(res, 'Gagal menghapus data utilisasi memori', 500, error.message);
    }
  }
}

