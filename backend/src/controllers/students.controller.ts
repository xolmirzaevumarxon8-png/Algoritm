import { Request, Response } from 'express';
import prisma from '../config/db';
import { logAction } from '../utils/logger';

export const getStudents = async (req: Request, res: Response) => {
  try {
    let whereClause: any = { is_deleted: false };
    if (req.user?.role === 'ADMIN') {
      let userBranch = await prisma.branches.findFirst({ where: { manager_id: req.user.userId } });
      if (!userBranch) {
        userBranch = await prisma.branches.findFirst();
      }
      if (userBranch) {
        whereClause.branch_id = userBranch.id;
      } else {
        return res.status(200).json([]); // No branch assigned to admin
      }
    }

    const students = await prisma.students.findMany({
      where: whereClause,
      include: {
        student_groups: {
          include: { group: { include: { course: true } } }
        }
      },
      orderBy: { created_at: 'desc' }
    });
    
    // Flatten response for frontend table
    const formatted = students.map(s => {
      const activeGroup = s.student_groups.find(sg => sg.status === 'ACTIVE')?.group;
      return {
        id: s.id,
        fullname: s.fullname,
        phone: s.phone,
        course: activeGroup?.course?.name || 'Unassigned',
        group: activeGroup?.name || 'Unassigned',
        paymentStatus: 'PAID', // In a real app, calculate from recent Payment records
        registrationDate: s.created_at,
        courseId: activeGroup?.course_id,
        groupId: activeGroup?.id
      };
    });

    res.status(200).json(formatted);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching students', error });
  }
};

export const getStudentById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const student = await prisma.students.findFirst({
      where: { id: id as string, is_deleted: false },
      include: {
        parent: true,
        student_groups: {
          include: { group: { include: { course: true } } }
        },
        attendance: { take: 10 },
        finance_accounts: { include: { payments: { take: 10 } } },
        ratings: { take: 10 }
      }
    });

    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching student', error });
  }
};

export const createStudent = async (req: Request, res: Response) => {
  try {
    const { fullname, phone, birthday, gender, parentId, groupId, parentPhone } = req.body;
    
    const result = await prisma.$transaction(async (tx) => {
      let finalParentId = parentId;
      
      if (!finalParentId && parentPhone) {
        let parent = await tx.parents.findFirst({ where: { phone: parentPhone } });
        if (!parent) {
          parent = await tx.parents.create({
            data: {
              fullname: `${fullname} ota-onasi`,
              phone: parentPhone
            }
          });
        }
        finalParentId = parent.id;
      }

      let branchId = null;
      if (req.user?.role === 'ADMIN') {
        let userBranch = await tx.branches.findFirst({ where: { manager_id: req.user.userId } });
        if (!userBranch) {
          userBranch = await tx.branches.findFirst();
        }
        branchId = userBranch?.id || null;
      }

      const student = await tx.students.create({
        data: {
          fullname,
          phone,
          birthday: birthday ? new Date(birthday) : null,
          gender,
          parent_id: finalParentId || null,
          branch_id: branchId
        }
      });
      
      if (groupId) {
        await tx.student_groups.create({
          data: {
            student_id: student.id,
            group_id: groupId,
            status: 'ACTIVE',
            joined_at: new Date()
          }
        });
      }

      return student;
    });

    res.status(201).json(result);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ message: "Bu ma'lumot (telefon yoki ism) allaqachon tizimda mavjud." });
    }
    res.status(500).json({ message: 'Error creating student', error });
  }
};

export const updateStudent = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { fullname, phone, birthday, gender, parentId } = req.body;

    const student = await prisma.students.update({
      where: { id: id as string },
      data: { 
        fullname, 
        phone, 
        birthday: birthday ? new Date(birthday) : undefined, 
        gender, 
        parent_id: parentId || null
      }
    });

    await logAction(req.user?.userId, 'UPDATE', 'STUDENT', `O'quvchi ma'lumotlari tahrirlandi: ${fullname}`);
    res.status(200).json({ message: 'Student updated successfully', student });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ message: "Bu ma'lumot allaqachon tizimda mavjud." });
    }
    res.status(500).json({ message: 'Error updating student', error });
  }
};

export const transferStudent = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { groupId } = req.body;

    if (!groupId) {
      return res.status(400).json({ message: 'New Group ID is required' });
    }

    const result = await prisma.$transaction(async (tx) => {
      // Find current active group
      const currentActive = await tx.student_groups.findFirst({
        where: { student_id: id, status: 'ACTIVE' },
        include: { group: true }
      });

      if (currentActive && currentActive.group_id !== groupId) {
        // Mark old as DROPPED
        await tx.student_groups.update({
          where: { id: currentActive.id },
          data: { status: 'DROPPED', left_at: new Date() }
        });

        // Optional: record in student_transfer if needed
        const newGroup = await tx.groups.findUnique({ where: { id: groupId } });
        if (newGroup) {
          await tx.student_transfer.create({
            data: {
              student_id: id,
              old_teacher: currentActive.group?.teacher_id || null,
              new_teacher: newGroup.teacher_id || null,
              reason: 'Admin transfer'
            }
          });
        }
      }

      // If not already in the new group actively, add them
      if (!currentActive || currentActive.group_id !== groupId) {
        await tx.student_groups.create({
          data: {
            student_id: id,
            group_id: groupId,
            status: 'ACTIVE',
            joined_at: new Date()
          }
        });
      }

      return { success: true };
    });

    await logAction(req.user?.userId, 'UPDATE', 'STUDENT_TRANSFER', `O'quvchi guruhga ko'chirildi. StudentId: ${id}`);
    res.status(200).json({ message: 'Student transferred successfully', result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error transferring student', error });
  }
};

export const deleteStudent = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const deleted = await prisma.students.update({
      where: { id: id as string },
      data: { is_deleted: true }
    });

    await logAction(req.user?.userId, 'DELETE', 'STUDENT', `O'quvchi arxivlandi: ${deleted.fullname}`);
    res.status(200).json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting student', error });
  }
};

export const getStudentHomework = async (req: Request, res: Response) => {
  try {
    const studentProfile = await prisma.students.findFirst({
      where: { id: req.user?.userId } // Assuming student logs in and user.userId = student.id
    });
    
    // Fallback: maybe they logged in and their profile is tied by some other way.
    // For now we assume req.user.userId is their student ID or we search by phone.
    // Actually, in the auth.controller, if they log in via their phone, userId is the student.id
    
    const studentId = studentProfile?.id || req.user?.userId;

    if (!studentId) {
      return res.status(403).json({ message: 'Student profile not found' });
    }

    // Find all groups the student is in
    const studentGroups = await prisma.student_groups.findMany({
      where: { student_id: studentId },
      select: { group_id: true }
    });

    const groupIds = studentGroups.map(sg => sg.group_id);

    // Get all homeworks for those groups
    const homeworks = await prisma.homeworks.findMany({
      where: { group_id: { in: groupIds } },
      include: {
        group: { select: { name: true, course: { select: { name: true } } } },
        teacher: { select: { user: { select: { fullname: true } } } },
        submissions: { where: { student_id: studentId } }
      },
      orderBy: { created_at: 'desc' }
    });

    res.status(200).json(homeworks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching homeworks', error });
  }
};

export const getParentChildren = async (req: Request, res: Response) => {
  try {
    const parentId = req.user?.userId;
    if (!parentId) return res.status(403).json({ message: 'Unauthorized' });

    const children = await prisma.students.findMany({
      where: { parent_id: parentId },
      include: {
        student_groups: {
          include: { group: { include: { course: true, teacher: { include: { user: true } } } } }
        },
        attendance: true,
        ratings: true,
      }
    });

    const formatted = children.map(c => {
      const activeGroup = c.student_groups.find(sg => sg.status === 'ACTIVE')?.group;
      
      const presentDays = c.attendance.filter(a => a.status === 'PRESENT').length;
      const totalDays = c.attendance.length;
      const attendancePercent = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

      const grades = c.ratings.map(r => r.score || 0);
      const avgGrade = grades.length > 0 ? Math.round(grades.reduce((a, b) => a + b, 0) / grades.length) : 0;

      return {
        id: c.id,
        name: c.fullname,
        course: activeGroup?.course?.name || 'Unassigned',
        group: activeGroup?.name || 'Unassigned',
        teacher: activeGroup?.teacher?.user?.fullname || 'N/A',
        attendance: attendancePercent,
        avgGrade: avgGrade,
        status: 'Paid',
        rank: 1,
        xp: grades.reduce((a, b) => a + b, 0) * 10,
        attendanceDetails: c.attendance.slice(-10).reverse(), // latest 10
        ratingsDetails: c.ratings.slice(-10).reverse() // latest 10
      };
    });

    res.status(200).json(formatted);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching children', error });
  }
};

export const getStudentAttendance = async (req: Request, res: Response) => {
  try {
    const studentProfile = await prisma.students.findFirst({
      where: { id: req.user?.userId }
    });
    
    const studentId = studentProfile?.id || req.user?.userId;

    if (!studentId) {
      return res.status(403).json({ message: 'Student profile not found' });
    }

    const attendance = await prisma.attendance.findMany({
      where: { student_id: studentId },
      include: {
        lesson: {
          include: {
            group: {
              include: {
                course: true
              }
            }
          }
        }
      }
    });

    // Sort by lesson date descending in memory since attendance table doesn't have created_at
    attendance.sort((a: any, b: any) => {
      const dateA = a.lesson?.lesson_date ? new Date(a.lesson.lesson_date).getTime() : 0;
      const dateB = b.lesson?.lesson_date ? new Date(b.lesson.lesson_date).getTime() : 0;
      return dateB - dateA;
    });

    res.status(200).json(attendance);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching attendance', error });
  }
};

export const getStudentDashboardStats = async (req: Request, res: Response) => {
  try {
    const studentProfile = await prisma.students.findFirst({
      where: { id: req.user?.userId }
    });
    const studentId = studentProfile?.id || req.user?.userId;
    if (!studentId) {
      return res.status(403).json({ message: 'Student profile not found' });
    }

    // 1. Get active student groups
    const activeGroups = await prisma.student_groups.findMany({
      where: { student_id: studentId, status: 'ACTIVE' },
      include: {
        group: {
          include: {
            course: true,
            teacher: { include: { user: true } }
          }
        }
      }
    });
    const groupIds = activeGroups.map(ag => ag.group_id);

    // 2. Average Grade (from 1-10 to 0-100%)
    const ratings = await prisma.ratings.findMany({
      where: { student_id: studentId }
    });
    const avgGrade = ratings.length > 0
      ? Math.round((ratings.reduce((acc, curr) => acc + (curr.score || 0), 0) / ratings.length) * 10)
      : 0;

    // 3. Attendance Rate
    const attendance = await prisma.attendance.findMany({
      where: { student_id: studentId }
    });
    const presentCount = attendance.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length;
    const attendanceRate = attendance.length > 0
      ? Math.round((presentCount / attendance.length) * 100)
      : 100;

    // 4. Homework count (pending/total)
    const totalHomeworks = await prisma.homeworks.count({
      where: { group_id: { in: groupIds } }
    });

    // 5. Active Exams & passed
    const passedExams = await prisma.exam_results.count({
      where: { student_id: studentId, is_passed: true }
    });

    // 6. Upcoming deadlines (homeworks)
    const upcomingHomeworks = await prisma.homeworks.findMany({
      where: { group_id: { in: groupIds } },
      orderBy: { created_at: 'desc' },
      take: 3
    });

    // 7. Today's schedules
    const currentDay = new Date().getDay();
    const todayWeekday = currentDay === 0 ? 7 : currentDay;

    const todaySchedules = await prisma.schedules.findMany({
      where: {
        group_id: { in: groupIds },
        weekday: todayWeekday
      },
      include: {
        group: {
          include: {
            course: true
          }
        }
      }
    });

    const formattedSchedules = todaySchedules.map(s => {
      const startTimeStr = s.start_time ? new Date(s.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC' }) : '';
      const endTimeStr = s.end_time ? new Date(s.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC' }) : '';
      return {
        id: s.id,
        courseName: s.group?.course?.name || 'Kurs',
        groupName: s.group?.name || 'Guruh',
        time: `${startTimeStr} - ${endTimeStr}`
      };
    });

    res.status(200).json({
      activeGroupsCount: activeGroups.length,
      primaryGroup: activeGroups[0]?.group?.name || 'Guruh biriktirilmagan',
      primaryCourse: activeGroups[0]?.group?.course?.name || 'Yo\'nalish yo\'q',
      avgGrade,
      attendanceRate,
      totalHomeworks,
      passedExams,
      upcomingHomeworks,
      todaySchedules: formattedSchedules
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching student dashboard stats', error });
  }
};

export const getStudentNotifications = async (req: Request, res: Response) => {
  try {
    const studentProfile = await prisma.students.findFirst({
      where: { id: req.user?.userId }
    });
    const studentId = studentProfile?.id || req.user?.userId;
    if (!studentId) {
      return res.status(403).json({ message: 'Student profile not found' });
    }

    const studentGroups = await prisma.student_groups.findMany({
      where: { student_id: studentId, status: 'ACTIVE' },
      select: { group_id: true }
    });
    const groupIds = studentGroups.map(sg => sg.group_id);

    // 1. Homeworks
    const homeworks = await prisma.homeworks.findMany({
      where: { group_id: { in: groupIds } },
      include: { group: { select: { name: true } } },
      orderBy: { created_at: 'desc' },
      take: 5
    });

    // 2. Exams
    const exams = await prisma.exams.findMany({
      where: { group_id: { in: groupIds } },
      include: { group: { select: { name: true } } },
      orderBy: { created_at: 'desc' },
      take: 5
    });

    // 3. Absences/Lates
    const attendance = await prisma.attendance.findMany({
      where: { student_id: studentId, status: { in: ['ABSENT', 'LATE'] } },
      include: { lesson: { include: { group: { select: { name: true } } } } },
      take: 5
    });

    const notifs: any[] = [];

    homeworks.forEach(hw => {
      notifs.push({
        id: `hw-${hw.id}`,
        title: "Yangi uy vazifasi berildi",
        message: `${hw.group?.name || 'Guruh'}: "${hw.title}" topshiriq berildi.`,
        date: hw.created_at,
        type: 'HOMEWORK',
        read: false
      });
    });

    exams.forEach(ex => {
      notifs.push({
        id: `ex-${ex.id}`,
        title: "Yangi imtihon e'lon qilindi",
        message: `${ex.group?.name || 'Guruh'}: "${ex.title}" (${ex.duration} daqiqa) imtihoni qo'shildi.`,
        date: ex.created_at,
        type: 'EXAM',
        read: false
      });
    });

    attendance.forEach(att => {
      const lessonDateStr = att.lesson?.lesson_date ? new Date(att.lesson.lesson_date).toLocaleDateString('uz-UZ') : '';
      const statusText = att.status === 'ABSENT' ? 'kelmadingiz' : 'kechikdingiz';
      notifs.push({
        id: `att-${att.id}`,
        title: att.status === 'ABSENT' ? "Darsda qatnashmadingiz" : "Darsga kechikdingiz",
        message: `${att.lesson?.group?.name || 'Guruh'} bo'yicha ${lessonDateStr} kungi darsda siz ${statusText}.`,
        date: att.lesson?.lesson_date || new Date(),
        type: 'ATTENDANCE',
        read: false
      });
    });

    res.status(200).json(notifs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching notifications', error });
  }
};

export const submitHomework = async (req: Request, res: Response) => {
  try {
    const homeworkId = req.params.id as string;
    const { solutionUrl, content } = req.body;
    const studentProfile = await prisma.students.findFirst({
      where: { id: req.user?.userId }
    });
    const studentId = studentProfile?.id || req.user?.userId;
    if (!studentId) return res.status(403).json({ message: 'Student profile not found' });

    const existing = await prisma.homework_submissions.findFirst({
      where: { homework_id: homeworkId, student_id: studentId }
    });

    let submission;
    if (existing) {
      submission = await prisma.homework_submissions.update({
        where: { id: existing.id },
        data: { solution_url: solutionUrl, content, status: 'SUBMITTED', submitted_at: new Date() }
      });
    } else {
      submission = await prisma.homework_submissions.create({
        data: {
          homework_id: homeworkId,
          student_id: studentId,
          solution_url: solutionUrl,
          content,
          status: 'SUBMITTED'
        }
      });
    }

    res.status(200).json(submission);
  } catch (error) {
    res.status(500).json({ message: 'Error submitting homework', error });
  }
};

export const getStudentPayments = async (req: Request, res: Response) => {
  try {
    const studentProfile = await prisma.students.findFirst({
      where: { id: req.user?.userId }
    });
    const studentId = studentProfile?.id || req.user?.userId;
    if (!studentId) return res.status(403).json({ message: 'Student profile not found' });

    const finAccount = await prisma.finance_accounts.findFirst({
      where: { student_id: studentId },
      include: {
        payments: {
          include: { cashier_user: { select: { fullname: true } } },
          orderBy: { paid_at: 'desc' }
        }
      }
    });

    res.status(200).json({
      balance: finAccount?.balance || 0,
      debt: finAccount?.debt || 0,
      dueDay: finAccount?.due_day || 5,
      status: finAccount?.status || 'PAID',
      payments: finAccount?.payments || []
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching student payments', error });
  }
};

export const getStudentLeaderboard = async (req: Request, res: Response) => {
  try {
    const studentProfile = await prisma.students.findFirst({
      where: { id: req.user?.userId }
    });
    const studentId = studentProfile?.id || req.user?.userId;
    if (!studentId) return res.status(403).json({ message: 'Student profile not found' });

    const activeGroup = await prisma.student_groups.findFirst({
      where: { student_id: studentId, status: 'ACTIVE' },
      include: { group: true }
    });

    if (!activeGroup) {
      return res.status(200).json({ groupName: 'Guruh biriktirilmagan', leaderboard: [] });
    }

    const peersInGroup = await prisma.student_groups.findMany({
      where: { group_id: activeGroup.group_id, status: 'ACTIVE' },
      include: {
        student: {
          include: {
            ratings: true,
            attendance: true
          }
        }
      }
    });

    const leaderboard = peersInGroup.map(sg => {
      const st = sg.student;
      const ratings = st.ratings || [];
      const avgRating = ratings.length > 0
        ? Math.round((ratings.reduce((acc, curr) => acc + (curr.score || 0), 0) / ratings.length) * 10)
        : 0;

      const att = st.attendance || [];
      const presentCount = att.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length;
      const attendanceRate = att.length > 0 ? Math.round((presentCount / att.length) * 100) : 100;
      
      const xp = (avgRating * 10) + (attendanceRate * 5);

      return {
        id: st.id,
        fullname: st.fullname,
        avgGrade: avgRating,
        attendanceRate,
        xp,
        isMe: st.id === studentId
      };
    });

    leaderboard.sort((a, b) => b.xp - a.xp);

    const rankedLeaderboard = leaderboard.map((item, index) => ({
      ...item,
      rank: index + 1
    }));

    res.status(200).json({
      groupName: activeGroup.group?.name || 'Guruh',
      leaderboard: rankedLeaderboard
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching leaderboard', error });
  }
};

export const getStudentWeeklySchedule = async (req: Request, res: Response) => {
  try {
    const studentProfile = await prisma.students.findFirst({
      where: { id: req.user?.userId }
    });
    const studentId = studentProfile?.id || req.user?.userId;
    if (!studentId) return res.status(403).json({ message: 'Student profile not found' });

    const studentGroups = await prisma.student_groups.findMany({
      where: { student_id: studentId, status: 'ACTIVE' },
      select: { group_id: true }
    });
    const groupIds = studentGroups.map(sg => sg.group_id);

    const schedules = await prisma.schedules.findMany({
      where: { group_id: { in: groupIds } },
      include: {
        group: {
          include: {
            course: true,
            room: true,
            teacher: { include: { user: true } }
          }
        }
      },
      orderBy: { weekday: 'asc' }
    });

    const weekdayNames: Record<number, string> = {
      1: 'Dushanba',
      2: 'Seshanba',
      3: 'Chorshanba',
      4: 'Payshanba',
      5: 'Juma',
      6: 'Shanba',
      7: 'Yakshanba'
    };

    const formatted = schedules.map(s => {
      const startTimeStr = s.start_time ? new Date(s.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC' }) : '';
      const endTimeStr = s.end_time ? new Date(s.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC' }) : '';

      const dayNum = s.weekday || 1;

      return {
        id: s.id,
        weekday: s.weekday,
        weekdayName: weekdayNames[dayNum] || 'Kun',
        time: `${startTimeStr} - ${endTimeStr}`,
        courseName: s.group?.course?.name || 'Kurs',
        groupName: s.group?.name || 'Guruh',
        roomName: s.group?.room?.name || 'Xona belgilanmagan',
        teacherName: s.group?.teacher?.user?.fullname || 'O\'qituvchi biriktirilmagan'
      };
    });

    res.status(200).json(formatted);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching student schedule', error });
  }
};
