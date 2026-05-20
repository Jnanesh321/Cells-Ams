import { useState, useEffect, useCallback } from 'react';
import { AcademicDayInfo } from '../types';
import { getAcademicDayInfo } from '../utils/academicDayUtils';

export function useAcademicDay(): {
  academicDay: AcademicDayInfo | null;
  refresh: () => void;
} {
  const [academicDay, setAcademicDay] = useState<AcademicDayInfo | null>(() =>
    getAcademicDayInfo(new Date())
  );

  const refresh = useCallback(() => {
    setAcademicDay(getAcademicDayInfo(new Date()));
  }, []);

  useEffect(() => {
    const now = new Date();
    const msUntilMidnight =
      new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0).getTime() -
      now.getTime();

    const timer = setTimeout(refresh, msUntilMidnight);

    return () => clearTimeout(timer);
  }, [refresh]);

  return { academicDay, refresh };
}
