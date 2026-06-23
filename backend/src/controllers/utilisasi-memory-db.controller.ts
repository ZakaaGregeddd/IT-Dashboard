import { Request, Response } from 'express';
import { UtilisasiMemoryDbService } from '../services/utilisasi-memory-db.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

export class UtilisasiMemoryDbController {
  static async getUtilisasi(req: Request, res: Response) {
    try {
      const { bulan, tahun } = req.query;

      if (!bulan || !tahun) {
        const data = await UtilisasiMemoryDbService.getAllUtilisasi();
        return sendSuccess(res, data, 'Berhasil mengambil semua data utilisasi memory database', 200);
      }

      const bulanNum = parseInt(bulan as string, 10);
      const tahunNum = parseInt(tahun as string, 10);

      if (isNaN(bulanNum) || isNaN(tahunNum)) {
        return sendError(res, 'Format bulan dan tahun harus berupa angka', 400);
      }

      const data = await UtilisasiMemoryDbService.getUtilisasi(bulanNum, tahunNum);
      return sendSuccess(res, data, 'Berhasil mengambil data utilisasi memory database', 200);
    } catch (error: any) {
      console.error('[UtilisasiMemoryDbController] Error getting memory database utilisasi:', error);
      return sendError(res, 'Gagal mengambil data utilisasi memory database', 500, error.message);
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
        return sendError(res, 'Data bulan, tahun, and details (array) wajib dikirimkan', 400);
      }

      const bulanNum = parseInt(bulan, 10);
      const tahunNum = parseInt(tahun, 10);

      if (isNaN(bulanNum) || isNaN(tahunNum)) {
        return sendError(res, 'Format bulan and tahun harus berupa angka', 400);
      }

      const updatedData = await UtilisasiMemoryDbService.saveUtilisasi(
        bulanNum,
        tahunNum,
        details
      );

      return sendSuccess(res, updatedData, 'Berhasil menyimpan data utilisasi memory database', 200);
    } catch (error: any) {
      console.error('[UtilisasiMemoryDbController] Error saving memory database utilisasi:', error);
      return sendError(res, 'Gagal menyimpan data utilisasi memory database', 500, error.message);
    }
  }
}
