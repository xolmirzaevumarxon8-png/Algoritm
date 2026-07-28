import { Request, Response } from 'express';
import prisma from '../config/db';

export const getSchedules = async (req: Request, res: Response) => {
  try {
    const schedules = await prisma.schedules.findMany({
      include: {
        group: {
          select: { 
            name: true, 
            teacher: { 
              include: { user: { select: { fullname: true } } } 
            } 
          }
        }
      }
    });
    res.status(200).json(schedules);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching schedules', error });
  }
};

export const createSchedule = async (req: Request, res: Response) => {
  try {
    const { groupId, weekday, startTime, endTime } = req.body;
    
    // Parse time strings or assume they are valid ISO Date objects
    // If they are strings like "10:00", you'll need to parse them, but assuming they are valid for Date or handled here
    
    const schedule = await prisma.schedules.create({
      data: { 
        group_id: groupId, 
        weekday: Number(weekday), 
        start_time: startTime ? new Date(`1970-01-01T${startTime}:00Z`) : null, 
        end_time: endTime ? new Date(`1970-01-01T${endTime}:00Z`) : null
      }
    });
    res.status(201).json(schedule);
  } catch (error) {
    res.status(500).json({ message: 'Error creating schedule', error });
  }
};

export const updateSchedule = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { weekday, startTime, endTime } = req.body;
    const schedule = await prisma.schedules.update({
      where: { id: id as string },
      data: { 
        weekday: weekday ? Number(weekday) : undefined, 
        start_time: startTime ? new Date(`1970-01-01T${startTime}:00Z`) : undefined, 
        end_time: endTime ? new Date(`1970-01-01T${endTime}:00Z`) : undefined
      }
    });
    res.status(200).json(schedule);
  } catch (error) {
    res.status(500).json({ message: 'Error updating schedule', error });
  }
};

export const deleteSchedule = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.schedules.delete({ where: { id: id as string } });
    res.status(200).json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting schedule', error });
  }
};
