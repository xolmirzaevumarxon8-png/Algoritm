import { Request, Response } from 'express';
import prisma from '../config/db';
import bcrypt from 'bcrypt';
import { logAction } from '../utils/logger';

export const getTeachers = async (req: Request, res: Response) => {
  try {
    let whereClause: any = { is_deleted: false };
    if (req.user?.role === 'ADMIN') {
      let userBranch = await prisma.branches.findFirst({ where: { manager_id: req.user.userId } });
      if (!userBranch) {
        userBranch = await prisma.branches.findFirst();
      }
      if (userBranch) {
        whereClause.branch_id = userBranch.id;
      } else {
        return res.status(200).json([]);
      }
    }

    const teachers = await prisma.teachers.findMany({
      where: whereClause,
      include: {
        user: { select: { fullname: true, phone: true } },
        branch: { select: { name: true } },
        groups: true
      }
    });
    res.status(200).json(teachers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching teachers', error });
  }
};

export const createTeacherProfile = async (req: Request, res: Response) => {
  try {
    const { fullname, phone, email, salaryPerStudent, branchId, isActive, password } = req.body;
    
    let finalPassword = password;
    if (!finalPassword) {
      if (phone) {
        const cleanPhone = phone.replace(/\D/g, '');
        if (cleanPhone.length >= 4) {
          finalPassword = cleanPhone.slice(-4);
        } else {
          finalPassword = 'password123';
        }
      } else {
        finalPassword = 'password123';
      }
    }
    
    const hashedPassword = await bcrypt.hash(finalPassword, 10);
    
    // Transaction orqali avval User, keyin Teacher yaratamiz
    const newTeacher = await prisma.$transaction(async (prisma) => {
      // O'qituvchi rolini topish yoki yaratish
      let teacherRole = await prisma.roles.findFirst({ where: { name: 'TEACHER' } });
      if (!teacherRole) {
        teacherRole = await prisma.roles.create({
          data: { name: 'TEACHER', level: 4 }
        });
      }

      // 1. User yaratish
      const user = await prisma.users.create({
        data: {
          fullname,
          phone,
          email,
          password_hash: hashedPassword,
          role_id: teacherRole.id,
          is_active: isActive !== undefined ? isActive : true,
        }
      });
      
      let adminBranchId = branchId;
      if (req.user?.role === 'ADMIN') {
        let userBranch = await prisma.branches.findFirst({ where: { manager_id: req.user.userId } });
        if (!userBranch) {
          userBranch = await prisma.branches.findFirst();
        }
        adminBranchId = userBranch?.id || null;
      }

      // 2. Teacher profilini yaratish
      const teacher = await prisma.teachers.create({
        data: {
          user_id: user.id,
          branch_id: adminBranchId || null,
          salary_per_student: salaryPerStudent ? Number(salaryPerStudent) : null
        },
        include: {
          user: true
        }
      });
      
      return teacher;
    });
    
    await logAction(req.user?.userId, 'CREATE', 'TEACHER', `Yangi o'qituvchi qo'shildi: ${fullname}`);
    res.status(201).json(newTeacher);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ message: "Bu ma'lumot (telefon yoki ism) allaqachon tizimda mavjud." });
    }
    console.error(error);
    res.status(500).json({ message: 'Error creating teacher', error });
  }
};

export const updateTeacherKPI = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { salaryPerStudent, isActive } = req.body;
    
    const updated = await prisma.teachers.update({
      where: { id: id as string },
      data: { 
        salary_per_student: salaryPerStudent ? Number(salaryPerStudent) : undefined, 
        is_active: isActive 
      },
      include: { user: true }
    });
    
    await logAction(req.user?.userId, 'UPDATE', 'TEACHER', `O'qituvchi ma'lumotlari tahrirlandi: ${updated.user.fullname}`);
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error updating teacher KPI', error });
  }
};

export const deleteTeacher = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const teacher = await prisma.teachers.findUnique({
      where: { id },
      include: { user: true }
    });
    
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    
    await prisma.teachers.update({
      where: { id },
      data: { is_deleted: true, is_active: false }
    });
    
    await prisma.users.update({
      where: { id: teacher.user_id },
      data: { is_active: false }
    });
    
    await logAction(req.user?.userId, 'DELETE', 'TEACHER', `O'qituvchi arxivlandi: ${teacher.user.fullname}`);
    res.status(200).json({ message: 'Teacher deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting teacher', error });
  }
};
