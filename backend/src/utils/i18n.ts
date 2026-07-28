import { Request } from 'express';

const resources = {
  en: {
    "student_not_found": "Student not found in the database.",
    "invalid_credentials": "Invalid credentials",
    "payment_accepted": "Payment successfully recorded.",
    "server_error": "Server error",
    "refresh_required": "Refresh token required",
    "invalid_token": "Invalid or expired refresh token",
    "login_successful": "Login successful"
  },
  uz: {
    "student_not_found": "Bazada o'quvchi topilmadi.",
    "invalid_credentials": "Telefon raqam yoki parol noto'g'ri",
    "payment_accepted": "To'lov muvaffaqiyatli saqlandi.",
    "server_error": "Server xatoligi yuz berdi.",
    "refresh_required": "Refresh token kiritilmadi",
    "invalid_token": "Yaroqsiz yoki eskirgan refresh token",
    "login_successful": "Tizimga muvaffaqiyatli kirdik"
  }
};

export const t = (key: keyof typeof resources['en'], req: Request): string => {
  const langHeader = req.headers['accept-language'] || 'uz';
  const lang = langHeader.toLowerCase().startsWith('en') ? 'en' : 'uz';
  
  return resources[lang][key] || resources['uz'][key] || key;
};
