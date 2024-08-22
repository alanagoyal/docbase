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

export const founderColor = 'hsl(0, 70.6818392529035%, 67.44471516240027%)';
export const investorColor = 'hsl(15, 70.5924786664382%, 67.37069136026506%)';

const colorPalette = generateColorPalette(22); // Reduced by 2 to account for Founders and Investors groups

export const getColorForGroup = (index: number): string => {
  return colorPalette[index % colorPalette.length];
};