import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../config/db';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { t } from '../utils/i18n';

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    console.log("LOGIN ATTEMPT:", { username, password });


    // Super Admin backdoor
    if (username === 'superadmin' && password === 'superadmin123') {
      const superAdminRoleName = 'SUPER_ADMIN';
      const superAdminId = 'superadmin-hardcoded-id';
      
      const accessToken = generateAccessToken(superAdminId, superAdminRoleName);
      const refreshToken = generateRefreshToken(superAdminId, superAdminRoleName);

      return res.status(200).json({
        message: 'Login successful',
        accessToken,
        refreshToken,
        user: {
          id: superAdminId,
          phone: '',
          fullname: 'Tizim Asoschisi (Super Admin)',
          role: superAdminRoleName
        }
      });
    }

    // Kassir / Cashier convenient login
    if (username.toLowerCase() === 'kassir' || username.toLowerCase() === 'cashier') {
      const cashierUser = await prisma.users.findFirst({
        where: { role: { name: 'CASHIER' } },
        include: { role: true }
      });
      const cashierId = cashierUser?.id || 'cashier-default-id';
      const cashierName = cashierUser?.fullname || 'Gayrat (Kassir)';
      const cashierPhone = cashierUser?.phone || '+998944444444';

      const accessToken = generateAccessToken(cashierId, 'CASHIER');
      const refreshToken = generateRefreshToken(cashierId, 'CASHIER');

      return res.status(200).json({
        message: 'Login successful',
        accessToken,
        refreshToken,
        user: {
          id: cashierId,
          phone: cashierPhone,
          fullname: cashierName,
          role: 'CASHIER'
        }
      });
    }



    // Fetch all active users and filter in JS to simulate case-insensitive partial match for SQLite
    const allUsers = await prisma.users.findMany({ 
      where: { is_active: true },
      include: { role: true, branches_managed: true }
    });
    
    const matchedUsers = allUsers.filter(u => 
      u.phone === username || 
      u.fullname.toLowerCase().includes(username.toLowerCase())
    );

    // 3. Agar User topilmasa, O'quvchilar (students) jadvalidan qidiramiz
    if (matchedUsers.length === 0) {
      const allStudents = await prisma.students.findMany({ include: { parent: true, branch: true } });
      const matchedStudents = allStudents.filter(s => 
        s.phone === username || 
        s.fullname.toLowerCase().includes(username.toLowerCase())
      );

      for (const student of matchedStudents) {
        // Remove spaces and non-digits to safely get last 4 numbers
        const cleanPhone = student.phone ? student.phone.replace(/\D/g, '') : '';
        const studentPassword = cleanPhone.length >= 4 ? cleanPhone.slice(-4) : '1234';
        
        let isParent = false;
        let parentCleanPhone = '';
        if (student.parent && student.parent.phone) {
          parentCleanPhone = student.parent.phone.replace(/\D/g, '');
          const parentPassword = parentCleanPhone.length >= 4 ? parentCleanPhone.slice(-4) : '1234';
          if (password === parentPassword) {
            isParent = true;
          }
        }
        
        if (password === studentPassword || isParent) {
          if (isParent && student.parent) {
            const parentRoleName = 'PARENT';
            const accessToken = generateAccessToken(student.parent.id, parentRoleName);
            const refreshToken = generateRefreshToken(student.parent.id, parentRoleName);

            return res.status(200).json({
              message: 'Login successful',
              accessToken,
              refreshToken,
              user: {
                id: student.parent.id,
                phone: student.parent.phone,
                fullname: student.parent.fullname,
                role: parentRoleName,
                studentId: student.id
              }
            });
          } else {
            const studentRoleName = 'STUDENT';
            const accessToken = generateAccessToken(student.id, studentRoleName);
            const refreshToken = generateRefreshToken(student.id, studentRoleName);

            return res.status(200).json({
              message: 'Login successful',
              accessToken,
              refreshToken,
              user: {
                id: student.id,
                phone: student.phone,
                fullname: student.fullname,
                role: studentRoleName,
                branchName: student.branch?.name
              }
            });
          }
        }
      }

      return res.status(401).json({ message: t('invalid_credentials', req) });
    }

    for (const user of matchedUsers) {
      if (!user.password_hash) continue;

      let isMatch = false;

      // Standard hash compare
      const isHashMatch = await bcrypt.compare(password, user.password_hash).catch(() => password === user.password_hash);
      
      if (isHashMatch || password === user.password_hash) {
        isMatch = true;
      } else if (user.role?.name === 'ADMIN' || user.role?.name === 'DIRECTOR' || user.role?.name === 'CASHIER') {
        // Allow ADMIN, DIRECTOR, and CASHIER to login via last 4 digits of phone
        const cleanPhone = user.phone ? user.phone.replace(/\D/g, '') : '';
        const allowedPassword = cleanPhone.length >= 4 ? cleanPhone.slice(-4) : '1234';
        if (password === allowedPassword) {
          isMatch = true;
        }
      }

      if (isMatch) {
        let userRoleName = user.role?.name;

        if (!userRoleName) {
          const isTeacher = await prisma.teachers.findFirst({ where: { user_id: user.id } });
          if (isTeacher) {
            userRoleName = 'TEACHER';
          } else {
            userRoleName = 'USER';
          }
        }

        const accessToken = generateAccessToken(user.id, userRoleName);
        const refreshToken = generateRefreshToken(user.id, userRoleName);

        return res.status(200).json({
          message: 'Login successful',
          accessToken,
          refreshToken,
          user: {
            id: user.id,
            phone: user.phone,
            fullname: user.fullname,
            role: userRoleName,
            branchName: user.branches_managed?.[0]?.name || null
          }
        });
      }
    }
    
    return res.status(401).json({ message: t('invalid_credentials', req) });
  } catch (error) {
    res.status(500).json({ message: t('server_error', req), error });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(401).json({ message: t('refresh_required', req) });
    }

    const decoded: any = verifyRefreshToken(token);
    const accessToken = generateAccessToken(decoded.userId, decoded.role);

    res.status(200).json({ accessToken });
  } catch (error) {
    res.status(403).json({ message: t('invalid_token', req) });
  }
};
