import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export const getCashiers = async (req: Request, res: Response) => {
  try {
    const cashierRole = await prisma.roles.findFirst({
      where: { name: 'CASHIER' }
    });

    if (!cashierRole) {
      return res.status(200).json([]);
    }

    const cashiers = await prisma.users.findMany({
      where: { role_id: cashierRole.id, is_active: true },
      include: {
        branches_managed: {
          select: { id: true, name: true }
        }
      }
    });

    res.status(200).json(cashiers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching cashiers', error });
  }
};

export const createCashier = async (req: Request, res: Response) => {
  try {
    const { fullname, phone, branchId } = req.body;

    if (!fullname || !phone || !branchId) {
      return res.status(400).json({ message: 'Fullname, phone, and branchId are required' });
    }

    let cashierRole = await prisma.roles.findFirst({
      where: { name: 'CASHIER' }
    });

    if (!cashierRole) {
      cashierRole = await prisma.roles.create({
        data: { name: 'CASHIER', level: 3 }
      });
    }

    const cleanPhone = phone.replace(/\D/g, '');
    const defaultPassword = cleanPhone.length >= 4 ? cleanPhone.slice(-4) : '1234';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const newCashier = await prisma.users.create({
      data: {
        fullname,
        phone,
        password_hash: hashedPassword,
        role_id: cashierRole.id,
        branches_managed: {
          connect: { id: branchId }
        }
      },
      include: {
        branches_managed: true
      }
    });

    res.status(201).json({ message: 'Cashier created successfully', cashier: newCashier });
  } catch (error) {
    console.error('Error creating cashier:', error);
    res.status(500).json({ message: 'Error creating cashier', error });
  }
};

export const deleteCashier = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.users.update({
      where: { id },
      data: { is_active: false }
    });
    res.status(200).json({ message: 'Cashier deactivated' });
  } catch (error) {
    res.status(500).json({ message: 'Error deactivating cashier', error });
  }
};
