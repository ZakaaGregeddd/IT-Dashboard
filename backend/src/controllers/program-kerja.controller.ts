import { Request, Response } from 'express';
import { ProgramKerjaService } from '../services/program-kerja.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

export class ProgramKerjaController {
  /**
   * Get Program Kerja TI by month and year
   */
  static async getProgramKerja(req: Request, res: Response) {
    try {
      const { bulan, tahun } = req.query;

      if (!bulan || !tahun) {
        const data = await ProgramKerjaService.getAllProgramKerja();
        return sendSuccess(res, data, 'Berhasil mengambil semua data program kerja', 200);
      }

      const bulanNum = parseInt(bulan as string, 10);
      const tahunNum = parseInt(tahun as string, 10);

      if (isNaN(bulanNum) || isNaN(tahunNum)) {
        return sendError(res, 'Format bulan dan tahun harus berupa angka', 400);
      }

      const data = await ProgramKerjaService.getProgramKerja(bulanNum, tahunNum);
      
      return sendSuccess(res, data || { detail_program_kerja_ti: [] }, 'Berhasil mengambil data program kerja', 200);
    } catch (error: any) {
      console.error('[ProgramKerjaController] Error getting program kerja:', error);
      return sendError(res, 'Gagal mengambil data program kerja', 500, error.message);
    }
  }

  /**
   * Save or update Program Kerja TI (Master and Details)
   */
  static async saveProgramKerja(req: Request, res: Response) {
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

      const updatedData = await ProgramKerjaService.saveProgramKerja(
        bulanNum,
        tahunNum,
        details
      );

      return sendSuccess(res, updatedData, 'Berhasil menyimpan data program kerja', 200);
    } catch (error: any) {
      console.error('[ProgramKerjaController] Error saving program kerja:', error);
      return sendError(res, 'Gagal menyimpan data program kerja', 500, error.message);
    }
  }

  static async deleteProgramKerja(req: Request, res: Response) {
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

      const deleted = await ProgramKerjaService.deleteProgramKerja(bulanNum, tahunNum);

      if (!deleted) {
        return sendError(res, 'Data program kerja untuk periode tersebut tidak ditemukan', 404);
      }

      return sendSuccess(res, null, 'Berhasil menghapus data program kerja', 200);
    } catch (error: any) {
      console.error('[ProgramKerjaController] Error deleting program kerja:', error);
      return sendError(res, 'Gagal menghapus data program kerja', 500, error.message);
    }
  }
}

