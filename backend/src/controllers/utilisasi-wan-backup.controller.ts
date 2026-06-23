import { Request, Response } from 'express';
import { UtilisasiWanBackupService } from '../services/utilisasi-wan-backup.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

export class UtilisasiWanBackupController {
  static async getUtilisasi(req: Request, res: Response) {
    try {
      const { bulan, tahun } = req.query;

      if (!bulan || !tahun) {
        const data = await UtilisasiWanBackupService.getAllUtilisasi();
        return sendSuccess(res, data, 'Berhasil mengambil semua data ketersediaan backup wan', 200);
      }

      const bulanNum = parseInt(bulan as string, 10);
      const tahunNum = parseInt(tahun as string, 10);

      if (isNaN(bulanNum) || isNaN(tahunNum)) {
        return sendError(res, 'Format bulan dan tahun harus berupa angka', 400);
      }

      const data = await UtilisasiWanBackupService.getUtilisasi(bulanNum, tahunNum);
      return sendSuccess(res, data, 'Berhasil mengambil data ketersediaan backup wan', 200);
    } catch (error: any) {
      console.error('[UtilisasiWanBackupController] Error getting ketersediaan backup wan:', error);
      return sendError(res, 'Gagal mengambil data ketersediaan backup wan', 500, error.message);
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

      const updatedData = await UtilisasiWanBackupService.saveUtilisasi(
        bulanNum,
        tahunNum,
        details
      );

      return sendSuccess(res, updatedData, 'Berhasil menyimpan data ketersediaan backup wan', 200);
    } catch (error: any) {
      console.error('[UtilisasiWanBackupController] Error saving ketersediaan backup wan:', error);
      return sendError(res, 'Gagal menyimpan data ketersediaan backup wan', 500, error.message);
    }
  }
}
