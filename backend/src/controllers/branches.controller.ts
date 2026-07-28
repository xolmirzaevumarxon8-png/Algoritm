import { Request, Response } from 'express';
import prisma from '../config/db';
import bcrypt from 'bcrypt';

export const getBranches = async (req: Request, res: Response) => {
  try {
    const branches = await prisma.branches.findMany({
      include: {
        _count: {
          select: { rooms: true, teachers: true }
        },
        manager: true
      },
      orderBy: { created_at: 'desc' }
    });
    
    const formatted = await Promise.all(branches.map(async b => {
      const studentsCount = await prisma.students.count({ where: { branch_id: b.id } });
      const payments = await prisma.payments.aggregate({
        _sum: { amount: true },
        where: { finance_account: { student: { branch_id: b.id } } }
      });
      const branchIncome = Number(payments._sum.amount || 0);

      return {
        id: b.id,
        name: b.name,
        address: b.address || 'Kiritilmagan',
        phone: '+998 90 000 00 00', 
        email: 'info@algoritm.uz',
        hours: '09:00 - 18:00',
        manager: b.manager ? b.manager.fullname : 'Kiritilmagan',
        students: studentsCount, 
        income: branchIncome,
        status: 'ACTIVE'
      };
    }));

    res.status(200).json(formatted);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching branches', error });
  }
};

export const createBranch = async (req: Request, res: Response) => {
  try {
    const { name, address, managerName, managerPhone } = req.body;
    let manager_id = null;

    if (managerName && managerPhone) {
      // Find or create ADMIN role
      let adminRole = await prisma.roles.findFirst({ where: { name: 'ADMIN' } });
      if (!adminRole) {
        adminRole = await prisma.roles.create({ data: { name: 'ADMIN', level: 2 } });
      }

      const cleanPhone = managerPhone.replace(/\D/g, '');
      const defaultPassword = cleanPhone.length >= 4 ? cleanPhone.slice(-4) : '1234';
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);

      const newAdmin = await prisma.users.create({
        data: {
          fullname: managerName,
          phone: managerPhone,
          password_hash: hashedPassword,
          role_id: adminRole.id,
        }
      });
      manager_id = newAdmin.id;
    }

    const branch = await prisma.branches.create({
      data: { name, address, manager_id }
    });
    res.status(201).json(branch);
  } catch (error) {
    console.error('Error creating branch:', error);
    res.status(500).json({ message: 'Error creating branch', error });
  }
};

export const updateBranch = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, address } = req.body;
    const branch = await prisma.branches.update({
      where: { id },
      data: { name, address }
    });
    res.status(200).json(branch);
  } catch (error) {
    res.status(500).json({ message: 'Error updating branch', error });
  }
};

export const deleteBranch = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.branches.delete({ where: { id } });
    res.status(200).json({ message: 'Branch deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting branch', error });
  }
};
