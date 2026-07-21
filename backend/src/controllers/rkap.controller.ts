import { Request, Response } from 'express';
import { RKAPService } from '../services/rkap.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

export class RKAPController {
  /**
   * Get RKAP TI by month and year, or all if no query params provided
   */
  static async getRKAP(req: Request, res: Response) {
    try {
      const { bulan, tahun } = req.query;

      if (!bulan || !tahun) {
        const data = await RKAPService.getAllRKAP();
        return sendSuccess(res, data, 'Berhasil mengambil semua data RKAP', 200);
      }

      const bulanNum = parseInt(bulan as string, 10);
      const tahunNum = parseInt(tahun as string, 10);

      if (isNaN(bulanNum) || isNaN(tahunNum)) {
        return sendError(res, 'Format bulan dan tahun harus berupa angka', 400);
      }

      const data = await RKAPService.getRKAP(bulanNum, tahunNum);
      
      return sendSuccess(res, data || { detail_rkap_ti: [] }, 'Berhasil mengambil data RKAP', 200);
    } catch (error: any) {
      console.error('[RKAPController] Error getting rkap:', error);
      return sendError(res, 'Gagal mengambil data RKAP', 500, error.message);
    }
  }

  /**
   * Save or update RKAP TI (Master and Details)
   */
  static async saveRKAP(req: Request, res: Response) {
    try {
      const { bulan, tahun, kalkulasi_cost_reduction_rp, kalkulasi_persentase_realisasi, details } = req.body;

      if (
        bulan === undefined || 
        tahun === undefined || 
        kalkulasi_cost_reduction_rp === undefined || 
        kalkulasi_persentase_realisasi === undefined || 
        !Array.isArray(details)
      ) {
        return sendError(res, 'Data bulan, tahun, kalkulasi, dan details (array) wajib dikirimkan', 400);
      }

      const bulanNum = parseInt(bulan, 10);
      const tahunNum = parseInt(tahun, 10);

      if (isNaN(bulanNum) || isNaN(tahunNum)) {
        return sendError(res, 'Format bulan dan tahun harus berupa angka', 400);
      }

      const updatedData = await RKAPService.saveRKAP(
        bulanNum,
        tahunNum,
        parseFloat(kalkulasi_cost_reduction_rp),
        parseFloat(kalkulasi_persentase_realisasi),
        details
      );

      return sendSuccess(res, updatedData, 'Berhasil menyimpan data RKAP', 200);
    } catch (error: any) {
      console.error('[RKAPController] Error saving rkap:', error);
      return sendError(res, 'Gagal menyimpan data RKAP', 500, error.message);
    }
  }

  static async deleteRKAP(req: Request, res: Response) {
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

      const deleted = await RKAPService.deleteRkap(bulanNum, tahunNum);

      if (!deleted) {
        return sendError(res, 'Data RKAP untuk periode tersebut tidak ditemukan', 404);
      }

      return sendSuccess(res, null, 'Berhasil menghapus data RKAP', 200);
    } catch (error: any) {
      console.error('[RKAPController] Error deleting rkap:', error);
      return sendError(res, 'Gagal menghapus data RKAP', 500, error.message);
    }
  }
}

