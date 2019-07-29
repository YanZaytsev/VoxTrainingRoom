export const getDaysInMonth = (month: number): number => {
  const date: Date = new Date();

  return new Date(date.getFullYear(), month + 1, 0).getDate();
};
export const getPrevMonthDaysToDisplay = (weekday: number): number => {
  switch (weekday) {
    case 0:
      return 6;
    case 1:
      return 7;
    default:
      return weekday - 1;
  }
};
export const getNextMonthDaysToDisplay = (weekday: number): number => {
  if (weekday === 0) {
    return 7;
  }

  return 7 - weekday;
};
