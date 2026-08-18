export const getInitialImageIndex = (index: string | undefined, imageCount: number) => {
  const requestedIndex = Number(index) - 1;
  if (!Number.isInteger(requestedIndex)) return 0;
  return Math.min(Math.max(requestedIndex, 0), Math.max(imageCount - 1, 0));
};

export const matchesImageSchool = (imageSchool: string | undefined, selectedSchool: string) =>
  !selectedSchool || imageSchool === selectedSchool;
