import { Request, Response } from 'express';
import prisma from '../config/db';
import { logAction } from '../utils/logger';

export const getRooms = async (req: Request, res: Response) => {
  try {
    const rooms = await prisma.rooms.findMany({
      where: { is_deleted: false },
      include: {
        branch: true,
        _count: {
          select: { groups: true }
        }
      },
      orderBy: { name: 'asc' }
    });
    res.status(200).json(rooms);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ message: 'Error fetching rooms', error });
  }
};

export const getRoomById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const room = await prisma.rooms.findFirst({
      where: { id, is_deleted: false },
      include: {
        branch: true
      }
    });
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.status(200).json(room);
  } catch (error) {
    console.error('Error fetching room:', error);
    res.status(500).json({ message: 'Error fetching room', error });
  }
};

export const getRoomSchedule = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const groups = await prisma.groups.findMany({
      where: { room_id: id, is_deleted: false },
      include: {
        course: true,
        teacher: { include: { user: true } },
        schedules: true
      }
    });
    res.status(200).json(groups);
  } catch (error) {
    console.error('Error fetching room schedule:', error);
    res.status(500).json({ message: 'Error fetching room schedule', error });
  }
};

export const createRoom = async (req: Request, res: Response) => {
  try {
    let { name, branch_id, capacity } = req.body;
    
    // Automatically assign branch if user is ADMIN
    if (req.user?.role === 'ADMIN') {
      const user = await prisma.users.findUnique({
        where: { id: req.user.userId },
        include: { branches_managed: true }
      });
      if (user && user.branches_managed.length > 0) {
        branch_id = user.branches_managed[0].id;
      }
    }

    if (!branch_id) {
       return res.status(400).json({ message: 'Branch ID is required' });
    }
    
    const room = await prisma.rooms.create({
      data: { 
        name, 
        branch_id, 
        capacity: capacity ? parseInt(capacity) : null 
      }
    });
    
    await logAction(req.user?.userId, 'CREATE', 'ROOM', `Yangi xona qo'shildi: ${name}`);
    res.status(201).json(room);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ message: "Bu ma'lumot allaqachon tizimda mavjud." });
    }
    console.error('Error creating room:', error);
    res.status(500).json({ message: 'Error creating room', error });
  }
};

export const updateRoom = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let { name, branch_id, capacity } = req.body;

    if (req.user?.role === 'ADMIN') {
      const user = await prisma.users.findUnique({
        where: { id: req.user.userId },
        include: { branches_managed: true }
      });
      if (user && user.branches_managed.length > 0) {
        branch_id = user.branches_managed[0].id;
      }
    }

    const room = await prisma.rooms.update({
      where: { id },
      data: { 
        name, 
        branch_id, 
        capacity: capacity ? parseInt(capacity) : null 
      }
    });
    
    await logAction(req.user?.userId, 'UPDATE', 'ROOM', `Xona ma'lumotlari tahrirlandi: ${name}`);
    res.status(200).json(room);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ message: "Bu ma'lumot allaqachon tizimda mavjud." });
    }
    console.error('Error updating room:', error);
    res.status(500).json({ message: 'Error updating room', error });
  }
};

export const deleteRoom = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const room = await prisma.rooms.update({ 
      where: { id },
      data: { is_deleted: true }
    });
    
    await logAction(req.user?.userId, 'DELETE', 'ROOM', `Xona arxivlandi: ${room.name}`);
    res.status(200).json({ message: 'Room deleted' });
  } catch (error) {
    console.error('Error deleting room:', error);
    res.status(500).json({ message: 'Error deleting room', error });
  }
};
