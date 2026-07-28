import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getDirectorDashboard = async (req: Request, res: Response) => {
  try {
    const branchId = req.query.branchId as string;

    // Optional branch filter
    const branchFilter = branchId && branchId !== 'all' ? { branch_id: branchId } : {};
    
    // Aggregating Payments
    const payments = await prisma.payments.aggregate({
      _sum: { amount: true },
    });
    
    // Aggregating Expenses
    const expenses = await prisma.expenses.aggregate({
      _sum: { amount: true },
      where: branchFilter
    });

    const totalIncome = Number(payments._sum.amount || 0);
    const totalExpenses = Number(expenses._sum.amount || 0);
    const netProfit = totalIncome - totalExpenses;

    // Audit logs (Latest 10)
    const auditLogs = await prisma.audit_logs.findMany({
      take: 10,
      orderBy: { created_at: 'desc' },
      include: {
        user: {
          select: { fullname: true, role: { select: { name: true } } }
        }
      }
    });

    // Mock KPI & Churn data
    const adminKPIs = [
      { id: 1, name: 'Anvar S.', role: 'Admin', studentsRegistered: 45, paymentsConfirmed: 120, conversionRate: '85%' },
      { id: 2, name: 'Aziz R.', role: 'Admin', studentsRegistered: 32, paymentsConfirmed: 90, conversionRate: '78%' },
      { id: 3, name: 'Dilnoza T.', role: 'Call Center', studentsRegistered: 60, paymentsConfirmed: 0, conversionRate: '92%' }
    ];

    const churnData = [
      { month: 'Yan', churn: 2.1, newLeads: 120 },
      { month: 'Fev', churn: 1.8, newLeads: 150 },
      { month: 'Mar', churn: 2.5, newLeads: 140 },
      { month: 'Apr', churn: 1.2, newLeads: 210 },
      { month: 'May', churn: 1.5, newLeads: 190 },
      { month: 'Iyun', churn: 0.9, newLeads: 250 },
    ];

    res.status(200).json({
      financials: {
        totalIncome,
        totalExpenses,
        netProfit,
        currency: 'UZS'
      },
      auditLogs,
      adminKPIs,
      churnData
    });
  } catch (error) {
    console.error('Error in getDirectorDashboard:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};
