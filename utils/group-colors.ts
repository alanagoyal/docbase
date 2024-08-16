export const getColorForGroup = (groupName: string, groups: { value: string, label: string, color?: string }[]): string => {
    const existingGroup = groups.find(g => g.label === groupName);
    if (existingGroup?.color) {
        return existingGroup.color;
    }

    const startColor = { r: 116, g: 235, b: 213 }; 
    const endColor = { r: 159, g: 172, b: 230 };  
    const totalGroups = groups.length;
    
    const r = Math.round(startColor.r + (endColor.r - startColor.r) * (totalGroups / (totalGroups + 1)));
    const g = Math.round(startColor.g + (endColor.g - startColor.g) * (totalGroups / (totalGroups + 1)));
    const b = Math.round(startColor.b + (endColor.b - startColor.b) * (totalGroups / (totalGroups + 1)));
    
    return `rgb(${r}, ${g}, ${b})`;
};