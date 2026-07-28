import { Request, Response } from 'express';
import prisma from '../config/db';
import * as xlsx from 'xlsx';
import { logAction } from '../utils/logger';

export const exportStudents = async (req: Request, res: Response) => {
  try {
    const students = await prisma.students.findMany({
      where: { is_deleted: false },
      include: {
        branch: { select: { name: true } },
        student_groups: {
          include: { group: { select: { name: true, course: { select: { name: true } } } } }
        }
      }
    });

    const data = students.map(s => {
      const activeGroup = s.student_groups.find(sg => sg.status === 'ACTIVE')?.group;
      return {
        'Ismi Sharif': s.fullname,
        'Telefon': s.phone || '',
        'Tug\'ilgan sana': s.birthday ? s.birthday.toISOString().split('T')[0] : '',
        'Jinsi': s.gender === 'MALE' ? 'Erkak' : (s.gender === 'FEMALE' ? 'Ayol' : ''),
        'Filial': s.branch?.name || '',
        'Guruh': activeGroup?.name || '',
        'Kurs': activeGroup?.course?.name || ''
      };
    });

    const ws = xlsx.utils.json_to_sheet(data);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, "O'quvchilar");

    const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

    await logAction(req.user?.userId, 'EXPORT', 'STUDENT_LIST', "O'quvchilar ro'yxati Excel shaklida yuklab olindi");

    res.setHeader('Content-Disposition', 'attachment; filename="oquvchilar.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (error) {
    console.error('Error exporting students:', error);
    res.status(500).json({ message: 'Error exporting students', error });
  }
};

export const importStudents = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Excel fayl yuklanmadi' });
    }

    const wb = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = wb.SheetNames[0] || '';
    const ws = wb.Sheets[sheetName] || {};
    const data: any[] = xlsx.utils.sheet_to_json(ws);

    let branchId = null;
    if (req.user?.role === 'ADMIN') {
      let userBranch = await prisma.branches.findFirst({ where: { manager_id: req.user.userId } });
      if (!userBranch) {
        userBranch = await prisma.branches.findFirst();
      }
      branchId = userBranch?.id || null;
    }

    let addedCount = 0;

    for (const row of data) {
      const fullname = row['Ismi Sharif'] || row['Ism'] || row['Name'] || row['fullname'];
      const phone = row['Telefon'] || row['Phone'] || row['phone'];
      if (!fullname || !phone) continue;

      try {
        await prisma.students.create({
          data: {
            fullname: String(fullname),
            phone: String(phone),
            branch_id: branchId
          }
        });
        addedCount++;
      } catch (err: any) {
        // P2002 xatosi (Takroriy telefon raqam) bo'lsa o'tkazib yuboramiz
        if (err.code !== 'P2002') {
          console.error('Row import error:', err);
        }
      }
    }

    await logAction(req.user?.userId, 'IMPORT', 'STUDENT_LIST', `${addedCount} ta o'quvchi Exceldan yuklandi`);

    res.status(200).json({ message: `${addedCount} ta o'quvchi muvaffaqiyatli qo'shildi` });
  } catch (error) {
    console.error('Error importing students:', error);
    res.status(500).json({ message: 'Error importing students', error });
  }
};
