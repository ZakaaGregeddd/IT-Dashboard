import { Request, Response } from 'express';
import { LicenseService } from '../services/license.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

export class LicenseController {
  /**
   * Get Licenses by month and year, or all if no query params provided
   */
  static async getLicenses(req: Request, res: Response) {
    try {
      const { bulan, tahun } = req.query;

      if (!bulan || !tahun) {
        const data = await LicenseService.getAllLicenses();
        return sendSuccess(res, data, 'Berhasil mengambil semua data Lisensi', 200);
      }

      const bulanNum = parseInt(bulan as string, 10);
      const tahunNum = parseInt(tahun as string, 10);

      if (isNaN(bulanNum) || isNaN(tahunNum)) {
        return sendError(res, 'Format bulan dan tahun harus berupa angka', 400);
      }

      const data = await LicenseService.getLicenses(bulanNum, tahunNum);
      
      return sendSuccess(res, data || { detail_lisensi: [] }, 'Berhasil mengambil data Lisensi', 200);
    } catch (error: any) {
      console.error('[LicenseController] Error getting licenses:', error);
      return sendError(res, 'Gagal mengambil data Lisensi', 500, error.message);
    }
  }

  /**
   * Save or update Licenses (Master and Details)
   */
  static async saveLicenses(req: Request, res: Response) {
    try {
      const { bulan, tahun, total_keseluruhan_lisensi, details } = req.body;

      if (
        bulan === undefined || 
        tahun === undefined || 
        total_keseluruhan_lisensi === undefined || 
        !Array.isArray(details)
      ) {
        return sendError(res, 'Data bulan, tahun, total keseluruhan lisensi, dan details (array) wajib dikirimkan', 400);
      }

      const bulanNum = parseInt(bulan, 10);
      const tahunNum = parseInt(tahun, 10);

      if (isNaN(bulanNum) || isNaN(tahunNum)) {
        return sendError(res, 'Format bulan dan tahun harus berupa angka', 400);
      }

      const updatedData = await LicenseService.saveLicenses(
        bulanNum,
        tahunNum,
        parseInt(total_keseluruhan_lisensi, 10),
        details
      );

      return sendSuccess(res, updatedData, 'Berhasil menyimpan data Lisensi', 200);
    } catch (error: any) {
      console.error('[LicenseController] Error saving licenses:', error);
      return sendError(res, 'Gagal menyimpan data Lisensi', 500, error.message);
    }
  }
}
