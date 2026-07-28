import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export const getAdmins = async (req: Request, res: Response) => {
  try {
    const adminRole = await prisma.roles.findFirst({
      where: { name: 'ADMIN' }
    });

    if (!adminRole) {
      return res.status(404).json({ message: 'ADMIN role not found in database' });
    }

    const admins = await prisma.users.findMany({
      where: { role_id: adminRole.id, is_active: true },
      select: {
        id: true,
        fullname: true,
        phone: true,
        email: true,
        created_at: true,
        branches_managed: {
          select: { name: true }
        }
      }
    });

    res.status(200).json(admins);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching admins', error });
  }
};

export const createAdmin = async (req: Request, res: Response) => {
  try {
    const { fullname, phone } = req.body;

    if (!fullname || !phone) {
      return res.status(400).json({ message: 'Fullname and phone are required' });
    }

    let adminRole = await prisma.roles.findFirst({
      where: { name: 'ADMIN' }
    });

    if (!adminRole) {
      adminRole = await prisma.roles.create({
        data: { name: 'ADMIN', level: 2 }
      });
    }

    // Since they will login via last 4 digits of phone, we don't strictly need a strong password hash here,
    // but to be safe and compatible with standard login, we'll set the last 4 digits as password_hash too
    const cleanPhone = phone.replace(/\D/g, '');
    const defaultPassword = cleanPhone.length >= 4 ? cleanPhone.slice(-4) : '1234';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const newAdmin = await prisma.users.create({
      data: {
        fullname,
        phone,
        password_hash: hashedPassword,
        role_id: adminRole.id,
      }
    });

    res.status(201).json({ message: 'Admin created successfully', admin: newAdmin });
  } catch (error) {
    console.error('Error creating admin:', error);
    res.status(500).json({ message: 'Error creating admin', error });
  }
};
