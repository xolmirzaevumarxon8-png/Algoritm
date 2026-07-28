import { Request, Response } from 'express';
import prisma from '../config/db';

export const saveAttendance = async (req: Request, res: Response) => {
  try {
    const { groupId, date, attendanceRecords } = req.body;
    // attendanceRecords: { studentId: { status: 'Keldi'|'Kelmadi', grade: number|null } }

    const lessonDate = date ? new Date(date) : new Date();

    // 1. Find or create a lesson for this group and date
    // We assume one lesson per day for simplicity, or we can just create a new one if it doesn't exist today.
    const startOfDay = new Date(lessonDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(lessonDate);
    endOfDay.setHours(23, 59, 59, 999);

    let lesson = await prisma.lessons.findFirst({
      where: {
        group_id: groupId,
        lesson_date: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    });

    if (!lesson) {
      lesson = await prisma.lessons.create({
        data: {
          group_id: groupId,
          lesson_date: lessonDate,
          status: 'COMPLETED'
        }
      });
    }

    // 2. Save attendance and ratings
    const teacherProfile = await prisma.teachers.findFirst({
      where: { user_id: req.user?.userId }
    });
    const teacherId = teacherProfile?.id;

    for (const [studentId, data] of Object.entries(attendanceRecords)) {
      const record = data as { status: string, grade: string | number };
      
      // Update or create attendance
      const existingAtt = await prisma.attendance.findFirst({
        where: { lesson_id: lesson.id, student_id: studentId }
      });

      if (existingAtt) {
        await prisma.attendance.update({
          where: { id: existingAtt.id },
          data: { status: record.status }
        });
      } else {
        await prisma.attendance.create({
          data: {
            lesson_id: lesson.id,
            student_id: studentId,
            status: record.status
          }
        });
      }

      // Save grade if valid
      if (record.grade && teacherId) {
        const gradeValue = Number(record.grade);
        const existingRating = await prisma.ratings.findFirst({
          where: { lesson_id: lesson.id, student_id: studentId }
        });

        if (existingRating) {
          await prisma.ratings.update({
            where: { id: existingRating.id },
            data: { score: gradeValue }
          });
        } else {
          await prisma.ratings.create({
            data: {
              lesson_id: lesson.id,
              student_id: studentId,
              teacher_id: teacherId,
              score: gradeValue
            }
          });
        }
      }
    }

    res.status(200).json({ message: 'Attendance and grades saved successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error saving attendance', error });
  }
};

export const assignHomework = async (req: Request, res: Response) => {
  try {
    const { groupId, title, description, dueDate } = req.body;
    
    const teacherProfile = await prisma.teachers.findFirst({
      where: { user_id: req.user?.userId }
    });

    if (!teacherProfile) {
      return res.status(403).json({ message: 'Teacher profile not found' });
    }

    const homework = await prisma.homeworks.create({
      data: {
        group_id: groupId,
        teacher_id: teacherProfile.id,
        title,
        description: description || null,
        due_date: dueDate ? new Date(dueDate) : null
      }
    });

    res.status(201).json(homework);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error assigning homework', error });
  }
};
