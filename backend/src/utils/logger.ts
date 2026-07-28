import prisma from '../config/db';

export const logAction = async (userId: string | undefined, action: string, target: string, details?: string) => {
  if (!userId) return; // If action is taken by system or unauthenticated
  try {
    await prisma.audit_logs.create({
      data: {
        user_id: userId,
        action,
        target,
        details
      }
    });
  } catch (error) {
    console.error('Failed to log action:', error);
  }
};
