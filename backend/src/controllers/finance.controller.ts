import { Request, Response } from 'express';
import prisma from '../config/db';
import { t } from '../utils/i18n';

export const createPayment = async (req: Request, res: Response) => {
  try {
    const { studentId, amount, method } = req.body;
    const numericAmount = Number(amount);

    if (!studentId || !numericAmount || numericAmount <= 0) {
      return res.status(400).json({ message: 'Student ID and valid amount are required' });
    }

    const student = await prisma.students.findUnique({
      where: { id: studentId }
    });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    let finAccount = await prisma.finance_accounts.findFirst({
      where: { student_id: studentId }
    });

    if (!finAccount) {
      finAccount = await prisma.finance_accounts.create({
        data: {
          student_id: studentId,
          balance: 0,
          debt: 0
        }
      });
    }

    const cashierId = req.user?.userId || null;

    const payment = await prisma.payments.create({
      data: {
        finance_account_id: finAccount.id,
        amount: numericAmount,
        payment_type: method || 'Cash',
        paid_at: new Date(),
        cashier: cashierId
      }
    });

    // Update balance and debt
    const currentBalance = Number(finAccount.balance || 0);
    const currentDebt = Number(finAccount.debt || 0);
    const newDebt = Math.max(0, currentDebt - numericAmount);

    await prisma.finance_accounts.update({
      where: { id: finAccount.id },
      data: {
        balance: currentBalance + numericAmount,
        debt: newDebt
      }
    });

    res.status(201).json(payment);
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ message: 'Error creating payment', error });
  }
};

export const acceptPayment = async (req: Request, res: Response) => {
  try {
    const { studentName, amount, cashierId } = req.body;

    let numericAmount = amount;
    if (typeof amount === 'string') {
      numericAmount = Number(amount.replace(/[^0-9]/g, ''));
    }

    const student = await prisma.students.findFirst({
      where: { 
        fullname: {
          equals: studentName
        }
      }
    });

    if (!student) {
      return res.status(404).json({ message: t('student_not_found', req) });
    }

    let financeAccount = await prisma.finance_accounts.findFirst({
      where: { student_id: student.id }
    });

    if (!financeAccount) {
      financeAccount = await prisma.finance_accounts.create({
        data: {
          student_id: student.id,
          balance: 0,
          debt: 0
        }
      });
    }

    const payment = await prisma.payments.create({
      data: {
        finance_account_id: financeAccount.id,
        amount: numericAmount,
        payment_type: 'Card',
        paid_at: new Date(),
        cashier: cashierId
      }
    });

    await prisma.finance_accounts.update({
      where: { id: financeAccount.id },
      data: {
        balance: Number(financeAccount.balance || 0) + numericAmount
      }
    });

    res.status(200).json({ message: t('payment_accepted', req), payment });
  } catch (error) {
    console.error('Error recording payment:', error);
    res.status(500).json({ message: t('server_error', req), error });
  }
};

export const getAllPayments = async (req: Request, res: Response) => {
  try {
    const rawPayments = await prisma.payments.findMany({
      include: {
        finance_account: {
          include: {
            student: {
              include: {
                student_groups: {
                  include: { group: { include: { course: true } } }
                }
              }
            }
          }
        },
        cashier_user: {
          select: { fullname: true }
        }
      },
      orderBy: { paid_at: 'desc' }
    });

    const formatted = rawPayments.map(p => {
      const student = p.finance_account?.student;
      const groupObj = student?.student_groups?.[0]?.group;

      return {
        id: p.id,
        studentId: student?.id,
        student: student?.fullname || 'Noma\'lum o\'quvchi',
        course: groupObj?.course?.name || 'Kurs',
        group: groupObj?.name || 'Guruh biriktirilmagan',
        amount: Number(p.amount || 0),
        date: p.paid_at ? new Date(p.paid_at).toLocaleDateString('uz-UZ') : 'Noma\'lum',
        method: p.payment_type === 'Cash' ? 'Naqd' : p.payment_type === 'Card' ? 'Karta' : 'O\'tkazma',
        status: 'PAID',
        cashierName: p.cashier_user?.fullname || 'Kassir'
      };
    });

    res.status(200).json(formatted);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching payments', error });
  }
};

export const getDebts = async (req: Request, res: Response) => {
  try {
    const debts = await prisma.finance_accounts.findMany({
      where: {
        debt: {
          gt: 0
        }
      },
      include: {
        student: {
          include: {
            student_groups: {
              include: { group: true }
            }
          }
        }
      }
    });

    const formattedDebts = debts.map(d => {
      const studentName = d.student?.fullname || 'Unknown';
      const groupNames = d.student?.student_groups?.map(sg => sg.group?.name).join(', ') || 'No Group';
      return {
        id: d.id,
        studentId: d.student?.id,
        student: studentName,
        group: groupNames,
        totalFee: Number(d.debt) + Number(d.balance || 0), 
        paid: Number(d.balance || 0),
        debt: Number(d.debt),
        deadline: d.due_day ? `Har oyning ${d.due_day}-kuni` : 'Mavjud emas'
      };
    });

    res.status(200).json(formattedDebts);
  } catch (error) {
    res.status(500).json({ message: t('server_error', req), error });
  }
};

export const createExpense = async (req: Request, res: Response) => {
  try {
    const { category, amount, description } = req.body;
    const numericAmount = Number(amount);

    let branchId = (req.user as any)?.branchId;
    if (!branchId) {
      const firstBranch = await prisma.branches.findFirst();
      branchId = firstBranch?.id || '';
    }

    const expense = await prisma.expenses.create({
      data: {
        branch_id: branchId,
        category: category || 'Boshqa',
        amount: numericAmount,
        description: description || null,
        date: new Date()
      }
    });

    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: 'Error creating expense', error });
  }
};

export const getExpenses = async (req: Request, res: Response) => {
  try {
    const expenses = await prisma.expenses.findMany({
      orderBy: { date: 'desc' }
    });
    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching expenses', error });
  }
};

export const getCashierDashboardStats = async (req: Request, res: Response) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const todayPayments = await prisma.payments.findMany({
      where: {
        paid_at: {
          gte: todayStart,
          lte: todayEnd
        }
      },
      include: {
        finance_account: {
          include: { student: { select: { fullname: true } } }
        }
      },
      orderBy: { paid_at: 'desc' }
    });

    const todayExpensesList = await prisma.expenses.findMany({
      where: {
        date: {
          gte: todayStart,
          lte: todayEnd
        }
      }
    });

    const todayTotal = todayPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const todayCash = todayPayments.filter(p => p.payment_type === 'Cash').reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const todayCard = todayPayments.filter(p => p.payment_type === 'Card').reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const todayTransfer = todayPayments.filter(p => p.payment_type === 'Transfer').reduce((sum, p) => sum + Number(p.amount || 0), 0);

    const todayExpenses = todayExpensesList.reduce((sum, e) => sum + Number(e.amount || 0), 0);
    const netCashBalance = Math.max(0, todayCash - todayExpenses);

    const debts = await prisma.finance_accounts.aggregate({
      _sum: { debt: true }
    });
    const totalDebt = Number(debts._sum.debt || 0);

    const recentTransactions = todayPayments.map(p => ({
      id: p.id,
      studentName: p.finance_account?.student?.fullname || 'O\'quvchi',
      amount: Number(p.amount || 0),
      method: p.payment_type === 'Cash' ? 'Naqd' : p.payment_type === 'Card' ? 'Karta' : 'O\'tkazma',
      time: p.paid_at ? new Date(p.paid_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''
    }));

    res.status(200).json({
      todayTotal,
      todayCash,
      todayCard,
      todayTransfer,
      todayExpenses,
      netCashBalance,
      totalDebt,
      todayPaymentsCount: todayPayments.length,
      recentTransactions
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching cashier stats', error });
  }
};
