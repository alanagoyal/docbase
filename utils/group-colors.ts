export const getColorForGroup = (groupValue: string, groups: { value: string, label: string }[]): string => {
    const startColor = { r: 116, g: 235, b: 213 }; 
    const endColor = { r: 159, g: 172, b: 230 };  
    const totalGroups = groups.length;
    
    const index = groups.findIndex(g => g.value === groupValue);
    
    const r = Math.round(startColor.r + (endColor.r - startColor.r) * (index / totalGroups));
    const g = Math.round(startColor.g + (endColor.g - startColor.g) * (index / totalGroups));
    const b = Math.round(startColor.b + (endColor.b - startColor.b) * (index / totalGroups));
    
    return `rgb(${r}, ${g}, ${b})`;
  };