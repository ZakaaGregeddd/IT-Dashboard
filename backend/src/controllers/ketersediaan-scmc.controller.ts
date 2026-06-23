import { Request, Response } from 'express';
import { KetersediaanScmcService } from '../services/ketersediaan-scmc.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

export class KetersediaanScmcController {
  /**
   * Get SCMC report availability by month & year, or all if no query params provided
   */
  static async getKetersediaan(req: Request, res: Response) {
    try {
      const { bulan, tahun } = req.query;

      if (!bulan || !tahun) {
        const data = await KetersediaanScmcService.getAllKetersediaan();
        return sendSuccess(res, data, 'Berhasil mengambil semua data ketersediaan report SCMC', 200);
      }

      const bulanNum = parseInt(bulan as string, 10);
      const tahunNum = parseInt(tahun as string, 10);

      if (isNaN(bulanNum) || isNaN(tahunNum)) {
        return sendError(res, 'Format bulan dan tahun harus berupa angka', 400);
      }

      const data = await KetersediaanScmcService.getKetersediaan(bulanNum, tahunNum);

      return sendSuccess(res, data, 'Berhasil mengambil data ketersediaan report SCMC', 200);
    } catch (error: any) {
      console.error('[KetersediaanScmcController] Error getting ketersediaan scmc:', error);
      return sendError(res, 'Gagal mengambil data ketersediaan report SCMC', 500, error.message);
    }
  }

  /**
   * Save or update SCMC report availability (Master and Details)
   */
  static async saveKetersediaan(req: Request, res: Response) {
    try {
      const { bulan, tahun, details } = req.body;

      if (bulan === undefined || tahun === undefined || !Array.isArray(details)) {
        return sendError(res, 'Data bulan, tahun, dan details (array) wajib dikirimkan', 400);
      }

      const bulanNum = parseInt(bulan, 10);
      const tahunNum = parseInt(tahun, 10);

      if (isNaN(bulanNum) || isNaN(tahunNum)) {
        return sendError(res, 'Format bulan dan tahun harus berupa angka', 400);
      }

      const updatedData = await KetersediaanScmcService.saveKetersediaan(
        bulanNum,
        tahunNum,
        details
      );

      return sendSuccess(res, updatedData, 'Berhasil menyimpan data ketersediaan report SCMC', 200);
    } catch (error: any) {
      console.error('[KetersediaanScmcController] Error saving ketersediaan scmc:', error);
      return sendError(res, 'Gagal menyimpan data ketersediaan report SCMC', 500, error.message);
    }
  }
}
