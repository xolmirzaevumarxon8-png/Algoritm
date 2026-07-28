import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export const getDirectors = async (req: Request, res: Response) => {
  try {
    const directorRole = await prisma.roles.findFirst({
      where: { name: 'DIRECTOR' }
    });

    if (!directorRole) {
      return res.status(404).json({ message: 'DIRECTOR role not found in database' });
    }

    const directors = await prisma.users.findMany({
      where: { role_id: directorRole.id, is_active: true },
      select: {
        id: true,
        fullname: true,
        phone: true,
        email: true,
        created_at: true,
      }
    });

    res.status(200).json(directors);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching directors', error });
  }
};

export const createDirector = async (req: Request, res: Response) => {
  try {
    const { fullname, phone } = req.body;

    if (!fullname || !phone) {
      return res.status(400).json({ message: 'Fullname and phone are required' });
    }

    let directorRole = await prisma.roles.findFirst({
      where: { name: 'DIRECTOR' }
    });

    if (!directorRole) {
      directorRole = await prisma.roles.create({
        data: { name: 'DIRECTOR', level: 1 }
      });
    }

    const cleanPhone = phone.replace(/\D/g, '');
    const defaultPassword = cleanPhone.length >= 4 ? cleanPhone.slice(-4) : '1234';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const newDirector = await prisma.users.create({
      data: {
        fullname,
        phone,
        password_hash: hashedPassword,
        role_id: directorRole.id,
      }
    });

    res.status(201).json({ message: 'Director created successfully', director: newDirector });
  } catch (error) {
    console.error('Error creating director:', error);
    res.status(500).json({ message: 'Error creating director', error });
  }
};

export const updateDirector = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ message: 'Phone is required for password reset' });
    }

    const cleanPhone = phone.replace(/\D/g, '');
    const defaultPassword = cleanPhone.length >= 4 ? cleanPhone.slice(-4) : '1234';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const updatedDirector = await prisma.users.update({
      where: { id },
      data: {
        phone,
        password_hash: hashedPassword
      }
    });

    res.status(200).json({ message: 'Director updated successfully', director: updatedDirector });
  } catch (error) {
    console.error('Error updating director:', error);
    res.status(500).json({ message: 'Error updating director', error });
  }
};

export const deleteDirector = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    await prisma.users.delete({
      where: { id }
    });

    res.status(200).json({ message: 'Director deleted successfully' });
  } catch (error) {
    console.error('Error deleting director:', error);
    res.status(500).json({ message: 'Error deleting director', error });
  }
};
