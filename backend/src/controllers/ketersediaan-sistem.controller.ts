import { Request, Response } from 'express';
import { KetersediaanSistemService } from '../services/ketersediaan-sistem.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

export class KetersediaanSistemController {
  /**
   * Get system availability by month & year, or all if no query params provided
   */
  static async getKetersediaan(req: Request, res: Response) {
    try {
      const { bulan, tahun } = req.query;

      if (!bulan || !tahun) {
        const data = await KetersediaanSistemService.getAllKetersediaan();
        return sendSuccess(res, data, 'Berhasil mengambil semua data ketersediaan sistem', 200);
      }

      const bulanNum = parseInt(bulan as string, 10);
      const tahunNum = parseInt(tahun as string, 10);

      if (isNaN(bulanNum) || isNaN(tahunNum)) {
        return sendError(res, 'Format bulan dan tahun harus berupa angka', 400);
      }

      const data = await KetersediaanSistemService.getKetersediaan(bulanNum, tahunNum);

      return sendSuccess(res, data, 'Berhasil mengambil data ketersediaan sistem', 200);
    } catch (error: any) {
      console.error('[KetersediaanSistemController] Error getting ketersediaan sistem:', error);
      return sendError(res, 'Gagal mengambil data ketersediaan sistem', 500, error.message);
    }
  }

  /**
   * Save or update system availability (Master and Details)
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

      const updatedData = await KetersediaanSistemService.saveKetersediaan(
        bulanNum,
        tahunNum,
        details
      );

      return sendSuccess(res, updatedData, 'Berhasil menyimpan data ketersediaan sistem', 200);
    } catch (error: any) {
      console.error('[KetersediaanSistemController] Error saving ketersediaan sistem:', error);
      return sendError(res, 'Gagal menyimpan data ketersediaan sistem', 500, error.message);
    }
  }
}
