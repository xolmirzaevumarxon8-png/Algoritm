import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../config/db';

export const getUsers = async (req: Request, res: Response) => {
  try {
    const { roleId } = req.query;
    const filter = roleId ? { role_id: roleId as string } : {};
    const users = await prisma.users.findMany({
      where: filter,
      select: {
        id: true,
        fullname: true,
        phone: true,
        email: true,
        role: { select: { name: true } },
        is_active: true,
        created_at: true,
      }
    });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { fullname, phone, email, password, roleId, isActive } = req.body;
    
    // Agar parol berilmagan bo'lsa va telefon raqami kiritilgan bo'lsa, telefonning oxirgi 4 ta raqamini parol qilamiz
    let finalPassword = password;
    if (!finalPassword) {
      if (phone && phone.length >= 4) {
        finalPassword = phone.slice(-4);
      } else {
        finalPassword = 'password123'; // fallback
      }
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(finalPassword, 10);
    
    const newUser = await prisma.users.create({
      data: {
        fullname,
        phone,
        email,
        password_hash: hashedPassword,
        role_id: roleId || null,
        is_active: isActive !== undefined ? isActive : true,
      }
    });
    
    res.status(201).json({ message: 'User created successfully', userId: newUser.id });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const user = await prisma.users.findUnique({
      where: { id: id as string },
      select: {
        id: true,
        fullname: true,
        phone: true,
        email: true,
        role_id: true,
        role: { select: { name: true } },
        is_active: true
      }
    });
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { fullname, phone, email, roleId, isActive } = req.body;
    
    const updatedUser = await prisma.users.update({
      where: { id: id as string },
      data: { fullname, phone, email, role_id: roleId, is_active: isActive },
    });
    
    res.status(200).json({ message: 'User updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.users.delete({ where: { id: id as string } });
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const role = req.user?.role;
    const { currentPassword, newPassword } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Avtorizatsiyadan o\'tilmagan.' });
    }

    if (role === 'STUDENT' || role === 'PARENT') {
      return res.status(400).json({ 
        message: 'Talabalar va ota-onalar paroli ularning telefon raqami oxirgi 4 ta raqamidir. Uni o\'zgartirib bo\'lmaydi.' 
      });
    }

    const user = await prisma.users.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ message: 'Foydalanuvchi topilmadi.' });
    }

    // If they have a password hash, verify it
    if (user.password_hash) {
      const isMatch = await bcrypt.compare(currentPassword, user.password_hash).catch(() => currentPassword === user.password_hash);
      if (!isMatch && currentPassword !== user.password_hash) {
        return res.status(400).json({ message: 'Joriy parol noto\'g\'ri kiritildi.' });
      }
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.users.update({
      where: { id: userId },
      data: { password_hash: hashedPassword }
    });

    res.status(200).json({ message: 'Parol muvaffaqiyatli o\'zgartirildi.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Parolni o\'zgartirishda xatolik yuz berdi.', error });
  }
};
