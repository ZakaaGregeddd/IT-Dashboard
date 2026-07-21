import { Request, Response } from 'express';
import { UtilisasiMemoryAppService } from '../services/utilisasi-memory-app.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

export class UtilisasiMemoryAppController {
  /**
   * Get application Memory utilization by month & year, or all if no query params provided
   */
  static async getUtilisasi(req: Request, res: Response) {
    try {
      const { bulan, tahun } = req.query;

      if (!bulan || !tahun) {
        const data = await UtilisasiMemoryAppService.getAllUtilisasi();
        return sendSuccess(res, data, 'Berhasil mengambil semua data utilisasi Memory Aplikasi', 200);
      }

      const bulanNum = parseInt(bulan as string, 10);
      const tahunNum = parseInt(tahun as string, 10);

      if (isNaN(bulanNum) || isNaN(tahunNum)) {
        return sendError(res, 'Format bulan dan tahun harus berupa angka', 400);
      }

      const data = await UtilisasiMemoryAppService.getUtilisasi(bulanNum, tahunNum);

      return sendSuccess(res, data, 'Berhasil mengambil data utilisasi Memory Aplikasi', 200);
    } catch (error: any) {
      console.error('[UtilisasiMemoryAppController] Error getting Memory Aplikasi utilisasi:', error);
      return sendError(res, 'Gagal mengambil data utilisasi Memory Aplikasi', 500, error.message);
    }
  }

  /**
   * Save or update application Memory utilization (Master and Details)
   */
  static async saveUtilisasi(req: Request, res: Response) {
    try {
      const { bulan, tahun, details } = req.body;

      if (
        bulan === undefined ||
        tahun === undefined ||
        !Array.isArray(details)
      ) {
        return sendError(res, 'Data bulan, tahun, dan details (array) wajib dikirimkan', 400);
      }

      const bulanNum = parseInt(bulan, 10);
      const tahunNum = parseInt(tahun, 10);

      if (isNaN(bulanNum) || isNaN(tahunNum)) {
        return sendError(res, 'Format bulan dan tahun harus berupa angka', 400);
      }

      const updatedData = await UtilisasiMemoryAppService.saveUtilisasi(
        bulanNum,
        tahunNum,
        details
      );

      return sendSuccess(res, updatedData, 'Berhasil menyimpan data utilisasi memory aplikasi', 200);
    } catch (error: any) {
      console.error('[UtilisasiMemoryAppController] Error saving memory aplikasi utilisasi:', error);
      return sendError(res, 'Gagal menyimpan data utilisasi memory aplikasi', 500, error.message);
    }
  }

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

      const deleted = await UtilisasiMemoryAppService.deleteUtilisasi(bulanNum, tahunNum);

      if (!deleted) {
        return sendError(res, 'Data utilisasi memory aplikasi untuk periode tersebut tidak ditemukan', 404);
      }

      return sendSuccess(res, null, 'Berhasil menghapus data utilisasi memory aplikasi', 200);
    } catch (error: any) {
      console.error('[UtilisasiMemoryAppController] Error deleting memory aplikasi utilisasi:', error);
      return sendError(res, 'Gagal menghapus data utilisasi memory aplikasi', 500, error.message);
    }
  }
}
