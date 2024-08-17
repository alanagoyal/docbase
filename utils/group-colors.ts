const generateColorPalette = (count: number): string[] => {
  const palette: string[] = [];
  for (let i = 0; i < count; i++) {
    const hue = (i * 360) / count;
    const saturation = 70 + Math.random() * 10; 
    const lightness = 65 + Math.random() * 10; 
    palette.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
  }
  return palette;
};

const colorPalette = generateColorPalette(24);

export const getColorForGroup = (index: number): string => {
  return colorPalette[index % colorPalette.length];
};