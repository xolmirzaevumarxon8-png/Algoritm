import { Request, Response } from 'express';
import prisma from '../config/db';

export const getAdminDashboardStats = async (req: Request, res: Response) => {
  try {
    let branchId = req.query.branchId as string;
    
    // If user is ADMIN, force branch filter to their managed branch
    if (req.user?.role === 'ADMIN') {
      const userBranch = await prisma.branches.findFirst({ where: { manager_id: req.user.userId } });
      if (userBranch) {
        branchId = userBranch.id;
      }
    }

    const filter: any = { is_deleted: false };
    if (branchId && branchId !== 'all') {
      filter.branch_id = branchId;
    }

    // 1. Total Students
    const totalStudents = await prisma.students.count({
      where: filter
    });

    // 2. Total Teachers
    const totalTeachers = await prisma.teachers.count({
      where: filter
    });

    // 3. Active Groups
    const activeGroups = await prisma.groups.count({
      where: { ...filter, status: 'ACTIVE' }
    });

    // 4. Active Courses
    const activeCourses = await prisma.courses.count({
      where: { is_deleted: false }
    });

        // 5. Total Rooms
    const totalRooms = await prisma.rooms.count({
      where: {
        is_deleted: false,
        branch_id: branchId && branchId !== 'all' ? branchId : undefined
      }
    });

    // 6. Growth data - Students registered in last 7 days
    const today = new Date();
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recentStudents = await prisma.students.findMany({
      where: {
        ...filter,
        created_at: { gte: sevenDaysAgo }
      },
      select: { created_at: true }
    });

    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const growthChart = weekdays.map(day => ({ name: day, students: 0 }));

    recentStudents.forEach(s => {
      const dayName = weekdays[new Date(s.created_at).getDay()];
      const dayObj = growthChart.find(d => d.name === dayName);
      if (dayObj) dayObj.students++;
    });

    // 7. Global Attendance Rate
    const attendanceLogs = await prisma.attendance.findMany({
      where: {
        lesson: branchId && branchId !== 'all' ? {
          group: { branch_id: branchId }
        } : undefined
      },
      select: { status: true }
    });
    const totalAttendance = attendanceLogs.length;
    const presentAttendance = attendanceLogs.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length;
    const globalAttendance = totalAttendance > 0 
      ? Math.round((presentAttendance / totalAttendance) * 100) 
      : 0;

    // 8. Pending payments / Debtors
    // Let's find students whose finance accounts have balance < 0
    const debtors = await prisma.finance_accounts.findMany({
      where: {
        balance: { lt: 0 },
        student: filter
      }
    });
    const studentsInDebt = debtors.length;
    const pendingPaymentsAmount = debtors.reduce((acc, curr) => acc + Math.abs(Number(curr.balance)), 0);

    res.status(200).json({
      totalStudents,
      totalTeachers,
      totalRooms,
      activeCourses,
      activeGroups,
      globalAttendance,
      studentsInDebt,
      pendingPaymentsAmount,
      growthChart
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ message: 'Error fetching dashboard statistics', error });
  }
};
