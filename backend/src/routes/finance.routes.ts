import { Router } from 'express';
import { acceptPayment, getAllPayments, getDebts, createPayment, getCashierDashboardStats, createExpense, getExpenses } from '../controllers/finance.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

// Dashboard stats for cashier
router.get('/dashboard-stats', authenticateToken, getCashierDashboardStats);

// Create and get expenses
router.get('/expenses', authenticateToken, getExpenses);
router.post('/expenses', authenticateToken, createExpense);

// Create new payment from cashier panel
router.post('/payments', authenticateToken, createPayment);

// Endpoint for cashiers to accept a payment receipt and record it in the DB
router.post('/payments/accept', authenticateToken, acceptPayment);

// Endpoint for admin to get all payments
router.get('/payments', authenticateToken, getAllPayments);

// Endpoint for admin to get all debts
router.get('/debts', authenticateToken, getDebts);

export default router;
