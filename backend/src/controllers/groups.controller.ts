import { Request, Response } from 'express';
import prisma from '../config/db';
import { logAction } from '../utils/logger';

export const getGroups = async (req: Request, res: Response) => {
  try {
    const { teacherId } = req.query;
    let filter: any = { is_deleted: false };
    if (teacherId) filter.teacher_id = teacherId as string;
    
    // Agar so'rov yuborayotgan foydalanuvchi TEACHER bo'lsa, faqat o'zining guruhlarini ko'rishi shart
    if (req.user?.role === 'TEACHER' || req.user?.role?.toLowerCase() === 'teacher') {
      const teacherProfile = await prisma.teachers.findFirst({
        where: { user_id: req.user.userId }
      });
      if (teacherProfile) {
        filter = { teacher_id: teacherProfile.id };
      }
    } else if (req.user?.role === 'ADMIN') {
      let userBranch = await prisma.branches.findFirst({ where: { manager_id: req.user.userId } });
      if (!userBranch) {
        userBranch = await prisma.branches.findFirst();
      }
      if (userBranch) {
        filter.branch_id = userBranch.id;
      } else {
        return res.status(200).json([]);
      }
    }
    
    const groups = await prisma.groups.findMany({
      where: filter,
      include: {
        course: { select: { name: true } },
        teacher: { include: { user: { select: { fullname: true } } } },
        schedules: true,
        _count: { select: { student_groups: true } }
      },
      orderBy: { name: 'asc' }
    });
    
    const formatted = groups.map(g => ({
      ...g,
      studentCount: g._count.student_groups,
      teacherName: g.teacher ? g.teacher.user.fullname : 'Unassigned',
      courseName: g.course?.name || 'Unassigned',
      scheduleSummary: g.schedules.length > 0 ? `${g.schedules.length} classes/week` : 'No schedule'
    }));

    res.status(200).json(formatted);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching groups', error });
  }
};

export const getGroupById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const group = await prisma.groups.findFirst({
      where: { id: id as string, is_deleted: false },
      include: {
        course: true,
        teacher: { include: { user: { select: { fullname: true, phone: true } } } },
        schedules: true,
        student_groups: {
          include: { student: { select: { id: true, fullname: true, phone: true } } }
        },
      }
    });

    if (!group) return res.status(404).json({ message: 'Group not found' });
    res.status(200).json(group);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching group details', error });
  }
};

export const createGroup = async (req: Request, res: Response) => {
  try {
    const { name, courseId, teacherId, roomId, startDate, endDate, lessonDuration, monthlyLessons, status, days, startTime, endTime } = req.body;
    
    if (!courseId) {
      return res.status(400).json({ message: 'Course is required' });
    }

    let realCourseId = courseId;
    // Auto-create course if it's a raw string (not a uuid)
    if (courseId && courseId.length < 32 && !courseId.includes('-')) {
      let course = await prisma.courses.findFirst({ where: { name: courseId } });
      if (!course) {
        course = await prisma.courses.create({ data: { name: courseId } });
      }
      realCourseId = course.id;
    }

    let adminBranchId = null;
    if (req.user?.role === 'ADMIN') {
      let userBranch = await prisma.branches.findFirst({ where: { manager_id: req.user.userId } });
      if (!userBranch) {
        userBranch = await prisma.branches.findFirst();
      }
      adminBranchId = userBranch?.id || null;
    }

    const group = await prisma.groups.create({
      data: {
        name,
        course_id: realCourseId,
        teacher_id: teacherId || null,
        room_id: roomId || null,
        branch_id: adminBranchId,
        start_date: startDate ? new Date(startDate) : null,
        end_date: endDate ? new Date(endDate) : null,
        lesson_duration: lessonDuration ? Number(lessonDuration) : null,
        monthly_lessons: monthlyLessons ? Number(monthlyLessons) : null,
        status
      }
    });

    if (days && startTime && endTime) {
      const dayMap: Record<string, number> = {
        'Dushanba': 1, 'Chorshanba': 3, 'Juma': 5,
        'Seshanba': 2, 'Payshanba': 4, 'Shanba': 6
      };
      
      const dayList = days.split(',').map((d: string) => d.trim());
      
      for (const d of dayList) {
        if (dayMap[d]) {
          // Kun boshiga sanani olamiz (vaqtini to'g'rilash uchun)
          const start = new Date(`1970-01-01T${startTime}:00Z`);
          const end = new Date(`1970-01-01T${endTime}:00Z`);

          await prisma.schedules.create({
            data: {
              group_id: group.id,
              weekday: dayMap[d],
              start_time: start,
              end_time: end
            }
          });
        }
      }
    }

    await logAction(req.user?.userId, 'CREATE', 'GROUP', `Yangi guruh ochildi: ${name}`);
    res.status(201).json(group);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ message: "Bu ma'lumot allaqachon tizimda mavjud." });
    }
    res.status(500).json({ message: 'Error creating group', error });
  }
};

export const updateGroup = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { name, courseId, teacherId, roomId, startDate, endDate, lessonDuration, monthlyLessons, status } = req.body;

    let realCourseId = courseId;
    if (courseId && courseId.length < 32 && !courseId.includes('-')) {
      let course = await prisma.courses.findFirst({ where: { name: courseId } });
      if (!course) {
        course = await prisma.courses.create({ data: { name: courseId } });
      }
      realCourseId = course.id;
    }

    const group = await prisma.groups.update({
      where: { id: id as string },
      data: {
        name,
        course_id: realCourseId,
        teacher_id: teacherId || null,
        room_id: roomId || null,
        start_date: startDate ? new Date(startDate) : undefined,
        end_date: endDate ? new Date(endDate) : undefined,
        lesson_duration: lessonDuration ? Number(lessonDuration) : undefined,
        monthly_lessons: monthlyLessons ? Number(monthlyLessons) : undefined,
        status
      }
    });

    await logAction(req.user?.userId, 'UPDATE', 'GROUP', `Guruh ma'lumotlari tahrirlandi: ${name}`);
    res.status(200).json(group);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ message: "Bu ma'lumot allaqachon tizimda mavjud." });
    }
    res.status(500).json({ message: 'Error updating group', error });
  }
};

export const updateGroupStage = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { stage } = req.body;

    // Check permissions: TEACHER or ADMIN
    if (req.user?.role === 'TEACHER') {
      const teacherProfile = await prisma.teachers.findFirst({ where: { user_id: req.user.userId } });
      const group = await prisma.groups.findUnique({ where: { id } });
      
      if (group?.teacher_id !== teacherProfile?.id) {
        return res.status(403).json({ message: 'Not authorized to update this group' });
      }
    }

    const group = await prisma.groups.update({
      where: { id },
      data: { stage }
    });

    res.status(200).json(group);
  } catch (error) {
    res.status(500).json({ message: 'Error updating group stage', error });
  }
};

export const deleteGroup = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const group = await prisma.groups.update({ 
      where: { id: id as string },
      data: { is_deleted: true }
    });
    await logAction(req.user?.userId, 'DELETE', 'GROUP', `Guruh arxivlandi: ${group.name}`);
    res.status(200).json({ message: 'Group deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting group', error });
  }
};

export const assignStudent = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string; // groupId
    const { studentId } = req.body;

    await prisma.student_groups.create({
      data: { student_id: studentId, group_id: id, status: 'ACTIVE', joined_at: new Date() }
    });

    res.status(200).json({ message: 'Student assigned to group' });
  } catch (error) {
    res.status(500).json({ message: 'Error assigning student', error });
  }
};

export const removeStudentFromGroup = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const studentId = req.params.studentId as string;

    await prisma.student_groups.deleteMany({
      where: { student_id: studentId, group_id: id }
    });

    res.status(200).json({ message: 'Student removed from group' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing student', error });
  }
};
