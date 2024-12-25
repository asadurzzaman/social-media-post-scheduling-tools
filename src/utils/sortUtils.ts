export const reorderIdeas = (ideas: any[], sourceIndex: number, destinationIndex: number) => {
  const result = Array.from(ideas);
  const [removed] = result.splice(sourceIndex, 1);
  result.splice(destinationIndex, 0, removed);
  return result;
};