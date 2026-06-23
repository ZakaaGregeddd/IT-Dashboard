import { Request, Response } from 'express';
import { SDMService } from '../services/sdm.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

export class SDMController {
  /**
   * Get SDM IT by month and year, or all if no query params provided
   */
  static async getSDM(req: Request, res: Response) {
    try {
      const { bulan, tahun } = req.query;

      if (!bulan || !tahun) {
        const data = await SDMService.getAllSDM();
        return sendSuccess(res, data, 'Berhasil mengambil semua data SDM IT', 200);
      }

      const bulanNum = parseInt(bulan as string, 10);
      const tahunNum = parseInt(tahun as string, 10);

      if (isNaN(bulanNum) || isNaN(tahunNum)) {
        return sendError(res, 'Format bulan dan tahun harus berupa angka', 400);
      }

      const data = await SDMService.getSDM(bulanNum, tahunNum);
      
      return sendSuccess(res, data || { detail_sdm_it: [] }, 'Berhasil mengambil data SDM IT', 200);
    } catch (error: any) {
      console.error('[SDMController] Error getting sdm:', error);
      return sendError(res, 'Gagal mengambil data SDM IT', 500, error.message);
    }
  }

  /**
   * Save or update SDM IT (Master and Details)
   */
  static async saveSDM(req: Request, res: Response) {
    try {
      const { bulan, tahun, total_keseluruhan_sdm, details } = req.body;

      if (
        bulan === undefined || 
        tahun === undefined || 
        total_keseluruhan_sdm === undefined || 
        !Array.isArray(details)
      ) {
        return sendError(res, 'Data bulan, tahun, total keseluruhan sdm, dan details (array) wajib dikirimkan', 400);
      }

      const bulanNum = parseInt(bulan, 10);
      const tahunNum = parseInt(tahun, 10);

      if (isNaN(bulanNum) || isNaN(tahunNum)) {
        return sendError(res, 'Format bulan dan tahun harus berupa angka', 400);
      }

      const updatedData = await SDMService.saveSDM(
        bulanNum,
        tahunNum,
        parseInt(total_keseluruhan_sdm, 10),
        details
      );

      return sendSuccess(res, updatedData, 'Berhasil menyimpan data SDM IT', 200);
    } catch (error: any) {
      console.error('[SDMController] Error saving sdm:', error);
      return sendError(res, 'Gagal menyimpan data SDM IT', 500, error.message);
    }
  }
}
