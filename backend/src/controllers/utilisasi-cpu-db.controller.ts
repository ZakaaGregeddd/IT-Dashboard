import { Request, Response } from 'express';
import { UtilisasiCpuDbService } from '../services/utilisasi-cpu-db.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

export class UtilisasiCpuDbController {
  static async getUtilisasi(req: Request, res: Response) {
    try {
      const { bulan, tahun } = req.query;

      if (!bulan || !tahun) {
        const data = await UtilisasiCpuDbService.getAllUtilisasi();
        return sendSuccess(res, data, 'Berhasil mengambil semua data utilisasi CPU database', 200);
      }

      const bulanNum = parseInt(bulan as string, 10);
      const tahunNum = parseInt(tahun as string, 10);

      if (isNaN(bulanNum) || isNaN(tahunNum)) {
        return sendError(res, 'Format bulan dan tahun harus berupa angka', 400);
      }

      const data = await UtilisasiCpuDbService.getUtilisasi(bulanNum, tahunNum);
      return sendSuccess(res, data, 'Berhasil mengambil data utilisasi CPU database', 200);
    } catch (error: any) {
      console.error('[UtilisasiCpuDbController] Error getting CPU database utilisasi:', error);
      return sendError(res, 'Gagal mengambil data utilisasi CPU database', 500, error.message);
    }
  }

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

      const updatedData = await UtilisasiCpuDbService.saveUtilisasi(
        bulanNum,
        tahunNum,
        details
      );

      return sendSuccess(res, updatedData, 'Berhasil menyimpan data utilisasi CPU database', 200);
    } catch (error: any) {
      console.error('[UtilisasiCpuDbController] Error saving CPU database utilisasi:', error);
      return sendError(res, 'Gagal menyimpan data utilisasi CPU database', 500, error.message);
    }
  }
}
