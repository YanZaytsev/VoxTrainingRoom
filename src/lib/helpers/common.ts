export const range = (start: number, end: number): number[] => {
  return [...Array(end + 1).keys()].slice(start);
};
export const idGenerator = (): Function => {
  const ids: string[] = [];

  return function generate(): string {
    const newId: string = Math.random().toString(10).substring(2, 5) + Math.random().toString(10).substring(2, 5);

    if (!ids.includes((newId))) {
      ids.push(newId);
      return newId;
    }

    return generate();
  }
};
