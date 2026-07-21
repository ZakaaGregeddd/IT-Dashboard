import { Request, Response } from 'express';
import { KetersediaanKeamananService } from '../services/ketersediaan-keamanan.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

export class KetersediaanKeamananController {
  static async getKetersediaan(req: Request, res: Response) {
    try {
      const { bulan, tahun } = req.query;

      if (!bulan || !tahun) {
        const data = await KetersediaanKeamananService.getAllKetersediaan();
        return sendSuccess(res, data, 'Berhasil mengambil semua data ketersediaan keamanan', 200);
      }

      const bulanNum = parseInt(bulan as string, 10);
      const tahunNum = parseInt(tahun as string, 10);

      if (isNaN(bulanNum) || isNaN(tahunNum)) {
        return sendError(res, 'Format bulan dan tahun harus berupa angka', 400);
      }

      const data = await KetersediaanKeamananService.getKetersediaan(bulanNum, tahunNum);

      return sendSuccess(res, data, 'Berhasil mengambil data ketersediaan keamanan', 200);
    } catch (error: any) {
      console.error('[KetersediaanKeamananController] Error getting ketersediaan keamanan:', error);
      return sendError(res, 'Gagal mengambil data ketersediaan keamanan', 500, error.message);
    }
  }

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

      const updatedData = await KetersediaanKeamananService.saveKetersediaan(
        bulanNum,
        tahunNum,
        details
      );

      return sendSuccess(res, updatedData, 'Berhasil menyimpan data ketersediaan keamanan TI', 200);
    } catch (error: any) {
      console.error('[KetersediaanKeamananController] Error saving ketersediaan keamanan TI:', error);
      return sendError(res, 'Gagal menyimpan data ketersediaan keamanan TI', 500, error.message);
    }
  }

  static async deleteKetersediaan(req: Request, res: Response) {
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

      const deleted = await KetersediaanKeamananService.deleteKetersediaan(bulanNum, tahunNum);

      if (!deleted) {
        return sendError(res, 'Data ketersediaan keamanan untuk periode tersebut tidak ditemukan', 404);
      }

      return sendSuccess(res, null, 'Berhasil menghapus data ketersediaan keamanan', 200);
    } catch (error: any) {
      console.error('[KetersediaanKeamananController] Error deleting ketersediaan keamanan:', error);
      return sendError(res, 'Gagal menghapus data ketersediaan keamanan', 500, error.message);
    }
  }
}
