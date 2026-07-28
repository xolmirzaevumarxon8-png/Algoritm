import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth.middleware';
import prisma from '../config/db';

const router = Router();

// Dynamic contacts endpoint
router.get('/contacts', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.userId;
    const role = req.user?.role;
    const contacts: any[] = [];

    if (role === 'STUDENT') {
      const studentProfile = await prisma.students.findFirst({
        where: { id: userId }
      });
      const studentId = studentProfile?.id || userId;

      // 1. Get student's active groups
      const studentGroups = await prisma.student_groups.findMany({
        where: { student_id: studentId, status: 'ACTIVE' },
        include: {
          group: {
            include: {
              teacher: { include: { user: true } },
              course: true
            }
          }
        }
      });

      // Add Teachers
      const addedTeacherIds = new Set<string>();
      for (const sg of studentGroups) {
        const teacher = sg.group?.teacher;
        if (teacher && teacher.user && !addedTeacherIds.has(teacher.user.id)) {
          addedTeacherIds.add(teacher.user.id);

          // Get latest message between student and teacher
          const lastMsgObj = await prisma.direct_messages.findFirst({
            where: {
              OR: [
                { sender_id: studentId, receiver_id: teacher.user.id },
                { sender_id: teacher.user.id, receiver_id: studentId }
              ]
            },
            orderBy: { created_at: 'desc' }
          });

          contacts.push({
            id: teacher.user.id,
            name: `${teacher.user.fullname} (O'qituvchi)`,
            role: 'TEACHER',
            lastMsg: lastMsgObj ? lastMsgObj.text : `Dars bo'yicha savollaringiz bo'lsa yozishingiz mumkin.`,
            time: lastMsgObj ? new Date(lastMsgObj.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Bugun',
            unread: 0,
            online: true
          });
        }
      }

      // Add Group Announcement Chats
      for (const sg of studentGroups) {
        if (sg.group) {
          const groupIdStr = `group-${sg.group.id}`;
          const lastGroupMsg = await prisma.direct_messages.findFirst({
            where: { receiver_id: groupIdStr },
            orderBy: { created_at: 'desc' }
          });

          contacts.push({
            id: groupIdStr,
            name: `${sg.group.name} (${sg.group.course?.name || 'Guruh'})`,
            role: 'SYSTEM',
            lastMsg: lastGroupMsg ? lastGroupMsg.text : `Dars jadvali va e'lonlar kanali.`,
            time: lastGroupMsg ? new Date(lastGroupMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Bugun',
            unread: 0,
            online: true
          });
        }
      }

      // Add Admin contacts
      const admins = await prisma.users.findMany({
        where: {
          role: { name: { in: ['ADMIN', 'SUPER_ADMIN', 'DIRECTOR'] } },
          is_active: true
        },
        take: 3
      });

      for (const admin of admins) {
        const lastMsgObj = await prisma.direct_messages.findFirst({
          where: {
            OR: [
              { sender_id: studentId, receiver_id: admin.id },
              { sender_id: admin.id, receiver_id: studentId }
            ]
          },
          orderBy: { created_at: 'desc' }
        });

        contacts.push({
          id: admin.id,
          name: `${admin.fullname} (Ma'muriyat)`,
          role: 'ADMIN',
          lastMsg: lastMsgObj ? lastMsgObj.text : `Assalomu alaykum! Savol va takliflaringiz bo'lsa yozishingiz mumkin.`,
          time: lastMsgObj ? new Date(lastMsgObj.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Kecha',
          unread: 0,
          online: true
        });
      }

    } else if (role === 'TEACHER') {
      const teacherProfile = await prisma.teachers.findFirst({
        where: { user_id: userId }
      });

      if (teacherProfile) {
        const groups = await prisma.groups.findMany({
          where: { teacher_id: teacherProfile.id, is_deleted: false },
          include: {
            student_groups: {
              include: { student: true }
            }
          }
        });

        const addedStudents = new Set<string>();
        for (const g of groups) {
          for (const sg of g.student_groups) {
            if (sg.student && !addedStudents.has(sg.student.id)) {
              addedStudents.add(sg.student.id);

              const lastMsgObj = await prisma.direct_messages.findFirst({
                where: {
                  OR: [
                    { sender_id: userId, receiver_id: sg.student.id },
                    { sender_id: sg.student.id, receiver_id: userId }
                  ]
                },
                orderBy: { created_at: 'desc' }
              });

              contacts.push({
                id: sg.student.id,
                name: `${sg.student.fullname} (O'quvchi)`,
                role: 'STUDENT',
                lastMsg: lastMsgObj ? lastMsgObj.text : `Salom ustoz! Dars bo'yicha savolim bor edi.`,
                time: lastMsgObj ? new Date(lastMsgObj.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Bugun',
                unread: 0,
                online: true
              });
            }
          }

          const groupIdStr = `group-${g.id}`;
          const lastGroupMsg = await prisma.direct_messages.findFirst({
            where: { receiver_id: groupIdStr },
            orderBy: { created_at: 'desc' }
          });

          contacts.push({
            id: groupIdStr,
            name: `${g.name} (Guruh)`,
            role: 'SYSTEM',
            lastMsg: lastGroupMsg ? lastGroupMsg.text : `Guruh e'lonlari kanali.`,
            time: lastGroupMsg ? new Date(lastGroupMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Bugun',
            unread: 0,
            online: true
          });
        }
      }
    } else {
      // ADMIN / DIRECTOR / CASHIER
      const teachers = await prisma.teachers.findMany({
        include: { user: true },
        take: 5
      });
      teachers.forEach(t => {
        if (t.user) {
          contacts.push({
            id: t.user.id,
            name: `${t.user.fullname} (O'qituvchi)`,
            role: 'TEACHER',
            lastMsg: `Ish tartibi va jadval bo'yicha.`,
            time: 'Bugun',
            unread: 0,
            online: true
          });
        }
      });
    }

    res.status(200).json(contacts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching contacts', error });
  }
});

// Dynamic messages endpoint
router.get('/messages/:contactId', authenticateToken, async (req, res) => {
  try {
    const { contactId } = req.params;
    const userId = req.user?.userId;

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    let messagesInDb = [];

    if (contactId.startsWith('group-')) {
      messagesInDb = await prisma.direct_messages.findMany({
        where: { receiver_id: contactId },
        orderBy: { created_at: 'asc' }
      });
    } else {
      messagesInDb = await prisma.direct_messages.findMany({
        where: {
          OR: [
            { sender_id: userId, receiver_id: contactId },
            { sender_id: contactId, receiver_id: userId }
          ]
        },
        orderBy: { created_at: 'asc' }
      });
    }

    if (messagesInDb.length === 0) {
      const defaultMessage = [
        {
          id: 'default-welcome',
          senderId: contactId,
          text: contactId.startsWith('group-') ? "Assalomu alaykum! Guruh e'lonlar kanaliga xush kelibsiz." : "Assalomu alaykum! Muloqot xizmatiga xush kelibsiz. Savollaringiz bo'lsa yozib qoldiring.",
          time: '10:00',
          isMine: false
        }
      ];
      return res.status(200).json(defaultMessage);
    }

    const formatted = messagesInDb.map(m => ({
      id: m.id,
      senderId: m.sender_id,
      text: m.text,
      time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMine: m.sender_id === userId
    }));

    res.status(200).json(formatted);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching messages', error });
  }
});

// Save new message to DB
router.post('/messages/:contactId', authenticateToken, async (req, res) => {
  try {
    const { contactId } = req.params;
    const userId = req.user?.userId;
    const { text } = req.body;

    if (!userId || !text) {
      return res.status(400).json({ message: 'Text and authentication required' });
    }

    const newMsg = await prisma.direct_messages.create({
      data: {
        sender_id: userId,
        receiver_id: contactId,
        text
      }
    });

    res.status(201).json({
      id: newMsg.id,
      senderId: newMsg.sender_id,
      text: newMsg.text,
      time: new Date(newMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMine: true
    });
  } catch (error) {
    res.status(500).json({ message: 'Error saving message', error });
  }
});

export default router;
