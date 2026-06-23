import { Request, Response } from 'express';
import { UtilisasiCpuAppService } from '../services/utilisasi-cpu-app.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

export class UtilisasiCpuAppController {
  /**
   * Get application CPU utilization by month & year, or all if no query params provided
   */
  static async getUtilisasi(req: Request, res: Response) {
    try {
      const { bulan, tahun } = req.query;

      if (!bulan || !tahun) {
        const data = await UtilisasiCpuAppService.getAllUtilisasi();
        return sendSuccess(res, data, 'Berhasil mengambil semua data utilisasi CPU Aplikasi', 200);
      }

      const bulanNum = parseInt(bulan as string, 10);
      const tahunNum = parseInt(tahun as string, 10);

      if (isNaN(bulanNum) || isNaN(tahunNum)) {
        return sendError(res, 'Format bulan dan tahun harus berupa angka', 400);
      }

      const data = await UtilisasiCpuAppService.getUtilisasi(bulanNum, tahunNum);

      return sendSuccess(res, data, 'Berhasil mengambil data utilisasi CPU Aplikasi', 200);
    } catch (error: any) {
      console.error('[UtilisasiCpuAppController] Error getting CPU Aplikasi utilisasi:', error);
      return sendError(res, 'Gagal mengambil data utilisasi CPU Aplikasi', 500, error.message);
    }
  }

  /**
   * Save or update application CPU utilization (Master and Details)
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

      const updatedData = await UtilisasiCpuAppService.saveUtilisasi(
        bulanNum,
        tahunNum,
        details
      );

      return sendSuccess(res, updatedData, 'Berhasil menyimpan data utilisasi CPU Aplikasi', 200);
    } catch (error: any) {
      console.error('[UtilisasiCpuAppController] Error saving CPU Aplikasi utilisasi:', error);
      return sendError(res, 'Gagal menyimpan data utilisasi CPU Aplikasi', 500, error.message);
    }
  }
}
