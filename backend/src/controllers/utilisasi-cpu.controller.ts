import { Request, Response } from 'express';
import { UtilisasiCpuService } from '../services/utilisasi-cpu.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

export class UtilisasiCpuController {
  /**
   * Get CPU utilization by month & year, or all if no query params provided
   */
  static async getUtilisasi(req: Request, res: Response) {
    try {
      const { bulan, tahun } = req.query;

      if (!bulan || !tahun) {
        const data = await UtilisasiCpuService.getAllUtilisasi();
        return sendSuccess(res, data, 'Berhasil mengambil semua data utilisasi CPU', 200);
      }

      const bulanNum = parseInt(bulan as string, 10);
      const tahunNum = parseInt(tahun as string, 10);

      if (isNaN(bulanNum) || isNaN(tahunNum)) {
        return sendError(res, 'Format bulan dan tahun harus berupa angka', 400);
      }

      const data = await UtilisasiCpuService.getUtilisasi(bulanNum, tahunNum);

      return sendSuccess(res, data, 'Berhasil mengambil data utilisasi CPU', 200);
    } catch (error: any) {
      console.error('[UtilisasiCpuController] Error getting CPU utilisasi:', error);
      return sendError(res, 'Gagal mengambil data utilisasi CPU', 500, error.message);
    }
  }

  /**
   * Save or update CPU utilization (Master and Details)
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

      const updatedData = await UtilisasiCpuService.saveUtilisasi(
        bulanNum,
        tahunNum,
        parseFloat(target_utilisasi_persen),
        details
      );

      return sendSuccess(res, updatedData, 'Berhasil menyimpan data utilisasi CPU', 200);
    } catch (error: any) {
      console.error('[UtilisasiCpuController] Error saving CPU utilisasi:', error);
      return sendError(res, 'Gagal menyimpan data utilisasi CPU', 500, error.message);
    }
  }
}
