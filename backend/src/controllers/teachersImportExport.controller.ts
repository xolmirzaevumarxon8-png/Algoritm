import { Request, Response } from 'express';
import prisma from '../config/db';
import * as xlsx from 'xlsx';
import bcrypt from 'bcrypt';
import { logAction } from '../utils/logger';

export const exportTeachers = async (req: Request, res: Response) => {
  try {
    const teachers = await prisma.teachers.findMany({
      where: { is_deleted: false },
      include: {
        user: { select: { fullname: true, phone: true, email: true } },
        branch: { select: { name: true } }
      }
    });

    const data = teachers.map(t => ({
      'Ismi Sharif': t.user.fullname,
      'Telefon': t.user.phone || '',
      'Email': t.user.email || '',
      'Filial': t.branch?.name || '',
      'Oylik (Har bir o\'quvchi uchun)': t.salary_per_student ? Number(t.salary_per_student) : 0
    }));

    const ws = xlsx.utils.json_to_sheet(data);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, "O'qituvchilar");

    const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

    await logAction(req.user?.userId, 'EXPORT', 'TEACHER_LIST', "O'qituvchilar ro'yxati Excel shaklida yuklab olindi");

    res.setHeader('Content-Disposition', 'attachment; filename="oqituvchilar.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (error) {
    console.error('Error exporting teachers:', error);
    res.status(500).json({ message: 'Error exporting teachers', error });
  }
};

export const importTeachers = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Excel fayl yuklanmadi' });
    }

    const wb = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = wb.SheetNames[0];
    const ws = wb.Sheets[sheetName];
    const data: any[] = xlsx.utils.sheet_to_json(ws);

    let branchId = null;
    if (req.user?.role === 'ADMIN') {
      let userBranch = await prisma.branches.findFirst({ where: { manager_id: req.user.userId } });
      if (!userBranch) {
        userBranch = await prisma.branches.findFirst();
      }
      branchId = userBranch?.id || null;
    }

    let teacherRole = await prisma.roles.findFirst({ where: { name: 'TEACHER' } });
    if (!teacherRole) {
      teacherRole = await prisma.roles.create({
        data: { name: 'TEACHER', level: 4 }
      });
    }

    let addedCount = 0;

    for (const row of data) {
      const fullname = row['Ismi Sharif'] || row['Ism'] || row['Name'] || row['fullname'];
      const phone = row['Telefon'] || row['Phone'] || row['phone'];
      const email = row['Email'] || row['email'] || null;
      const salary = row['Oylik (Har bir o\'quvchi uchun)'] || row['Salary'] || null;

      if (!fullname || !phone) continue;

      const cleanPhone = String(phone).replace(/\D/g, '');
      const defaultPassword = cleanPhone.length >= 4 ? cleanPhone.slice(-4) : 'password123';
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);

      try {
        await prisma.$transaction(async (tx) => {
          const user = await tx.users.create({
            data: {
              fullname: String(fullname),
              phone: String(phone),
              email: email ? String(email) : null,
              password_hash: hashedPassword,
              role_id: teacherRole!.id
            }
          });

          await tx.teachers.create({
            data: {
              user_id: user.id,
              branch_id: branchId,
              salary_per_student: salary ? Number(salary) : null
            }
          });
        });
        addedCount++;
      } catch (err: any) {
        if (err.code !== 'P2002') {
          console.error('Row import error:', err);
        }
      }
    }

    await logAction(req.user?.userId, 'IMPORT', 'TEACHER_LIST', `${addedCount} ta o'qituvchi Exceldan yuklandi`);

    res.status(200).json({ message: `${addedCount} ta o'qituvchi muvaffaqiyatli qo'shildi` });
  } catch (error) {
    console.error('Error importing teachers:', error);
    res.status(500).json({ message: 'Error importing teachers', error });
  }
};
