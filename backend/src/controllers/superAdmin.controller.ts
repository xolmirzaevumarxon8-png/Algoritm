import { Request, Response } from 'express';
import prisma from '../config/db';

let systemSettingsStore = {
  centerName: "Algoritm IT O'quv Markazi",
  logoUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100&h=100&fit=crop",
  smsProvider: "Eskiz.uz",
  smsApiKey: "eskiz_secret_api_key_884920",
  telegramBotToken: "7129481023:AAHx8491-09238401924",
  smsNotificationEnabled: true,
  autoBackupEnabled: true
};

export const getSuperAdminStats = async (req: Request, res: Response) => {
  try {
    const branchesCount = await prisma.branches.count();
    const studentsCount = await prisma.students.count();
    const teachersCount = await prisma.teachers.count();

    const paymentsAgg = await prisma.payments.aggregate({
      _sum: { amount: true }
    });
    const totalRevenue = Number(paymentsAgg._sum.amount || 0);

    const branches = await prisma.branches.findMany();
    const branchComparison = await Promise.all(branches.map(async b => {
      const stCount = await prisma.students.count({ where: { branch_id: b.id } });
      const pAgg = await prisma.payments.aggregate({
        _sum: { amount: true },
        where: { finance_account: { student: { branch_id: b.id } } }
      });
      return {
        id: b.id,
        name: b.name,
        students: stCount,
        revenue: Number(pAgg._sum.amount || 0)
      };
    }));

    res.status(200).json({
      branchesCount,
      studentsCount,
      teachersCount,
      totalRevenue,
      branchComparison,
      systemSettings: systemSettingsStore
    });
  } catch (error) {
    console.error('Error fetching Super Admin stats:', error);
    res.status(500).json({ message: 'Error fetching Super Admin stats', error });
  }
};

export const getDatabaseBackup = async (req: Request, res: Response) => {
  try {
    const [branches, users, students, teachers, groups, courses, payments, expenses, exams] = await Promise.all([
      prisma.branches.findMany(),
      prisma.users.findMany({ select: { id: true, fullname: true, phone: true, is_active: true, created_at: true } }),
      prisma.students.findMany(),
      prisma.teachers.findMany(),
      prisma.groups.findMany(),
      prisma.courses.findMany(),
      prisma.payments.findMany(),
      prisma.expenses.findMany(),
      prisma.exams.findMany()
    ]);

    const backupData = {
      exportedAt: new Date().toISOString(),
      system: "Algoritm IT Enterprise LMS",
      version: "2.0.0",
      data: {
        branches,
        users,
        students,
        teachers,
        groups,
        courses,
        payments,
        expenses,
        exams
      }
    };

    const fileName = `lms_backup_${new Date().toISOString().split('T')[0]}.json`;

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.status(200).send(JSON.stringify(backupData, null, 2));
  } catch (error) {
    console.error('Error generating database backup:', error);
    res.status(500).json({ message: 'Error generating database backup', error });
  }
};

export const getSystemSettings = async (req: Request, res: Response) => {
  res.status(200).json(systemSettingsStore);
};

export const updateSystemSettings = async (req: Request, res: Response) => {
  try {
    const newSettings = req.body;
    systemSettingsStore = { ...systemSettingsStore, ...newSettings };
    res.status(200).json({ message: "Sozlamalar saqlandi", settings: systemSettingsStore });
  } catch (error) {
    res.status(500).json({ message: "Sozlamalarni saqlashda xatolik", error });
  }
};
