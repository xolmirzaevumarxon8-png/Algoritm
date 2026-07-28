import { Router } from 'express';
import { authorizeRoles } from '../middlewares/auth.middleware';
import prisma from '../config/db';

const router = Router();

router.get('/', authorizeRoles('SUPER_ADMIN', 'DIRECTOR', 'ADMIN'), async (req, res) => {
  try {
    const logs = await prisma.audit_logs.findMany({
      include: {
        user: { select: { fullname: true, role: { select: { name: true } } } }
      },
      orderBy: { created_at: 'desc' },
      take: 100 // Last 100 logs
    });
    
    const formatted = logs.map(log => ({
      id: log.id,
      user: log.user?.fullname || 'System',
      role: log.user?.role?.name || '',
      action: log.action,
      target: log.target,
      details: log.details,
      date: log.created_at
    }));
    
    res.status(200).json(formatted);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching audit logs', error });
  }
});

export default router;
