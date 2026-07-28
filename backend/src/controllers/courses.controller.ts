import { Request, Response } from 'express';
import prisma from '../config/db';
import { logAction } from '../utils/logger';

export const getCourses = async (req: Request, res: Response) => {
  try {
    const courses = await prisma.courses.findMany({
      where: { is_deleted: false },
      include: {
        _count: {
          select: { groups: true }
        }
      },
      orderBy: { name: 'asc' }
    });
    
    // Flatten _count
    const formatted = courses.map(c => ({
      ...c,
      groupCount: c._count.groups
    }));

    res.status(200).json(formatted);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching courses', error });
  }
};

export const getCourseById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const course = await prisma.courses.findFirst({
      where: { id: id as string, is_deleted: false },
      include: {
        groups: true,
        _count: { select: { groups: true } }
      }
    });

    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.status(200).json(course);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching course', error });
  }
};

export const createCourse = async (req: Request, res: Response) => {
  try {
    const { name, duration_month } = req.body;
    
    const course = await prisma.courses.create({
      data: { name, duration_month: duration_month ? Number(duration_month) : null }
    });
 
    await logAction(req.user?.userId, 'CREATE', 'COURSE', `Yangi kurs qo'shildi: ${name}`);
    res.status(201).json(course);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ message: "Bu kurs allaqachon mavjud." });
    }
    res.status(500).json({ message: 'Error creating course', error });
  }
};

export const updateCourse = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { name, duration_month } = req.body;

    const course = await prisma.courses.update({
      where: { id: id as string },
      data: { name, duration_month: duration_month ? Number(duration_month) : null }
    });
 
    await logAction(req.user?.userId, 'UPDATE', 'COURSE', `Kurs ma'lumotlari tahrirlandi: ${name}`);
    res.status(200).json(course);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ message: "Bu nomli kurs allaqachon mavjud." });
    }
    res.status(500).json({ message: 'Error updating course', error });
  }
};

export const deleteCourse = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const course = await prisma.courses.update({
      where: { id: id as string },
      data: { is_deleted: true }
    });
    
    await logAction(req.user?.userId, 'DELETE', 'COURSE', `Kurs arxivlandi: ${course.name}`);
    res.status(200).json({ message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting course', error });
  }
};
