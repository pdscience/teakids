import {
  dbSaveRoutineProgress,
  dbLoadRoutineProgress,
  dbLoadAllRoutineProgress,
  dbClearRoutineProgress,
} from '../services/database';

export function useStorage() {
  const saveRoutineProgress = async (
    date: string,
    period: string,
    index: number,
    completed: boolean
  ): Promise<void> => {
    await dbSaveRoutineProgress(date, period, index, completed);
  };

  const loadRoutineProgress = async (
    date: string,
    period: string,
    index: number
  ): Promise<boolean> => {
    return await dbLoadRoutineProgress(date, period, index);
  };

  const loadAllRoutineProgress = async (
    date: string,
    period: string
  ): Promise<boolean[]> => {
    return await dbLoadAllRoutineProgress(date, period);
  };

  const clearRoutineProgress = async (date: string, period: string): Promise<void> => {
    await dbClearRoutineProgress(date, period);
  };

  const clearAllRoutineProgress = async (date: string): Promise<void> => {
    const periods = ['morning', 'afternoon', 'night'];
    for (const period of periods) {
      await dbClearRoutineProgress(date, period);
    }
  };

  return {
    saveRoutineProgress,
    loadRoutineProgress,
    loadAllRoutineProgress,
    clearRoutineProgress,
    clearAllRoutineProgress,
  };
}
