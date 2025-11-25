// Fonction utilitaire pour calculer la luminance relative (WCAG 2.1)
// https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
export function getRelativeLuminance(hex: string): number {
  const c = hex.substring(1);
  const rgb = parseInt(c, 16);
  
  // Extraire et normaliser RGB (0-1)
  let r = ((rgb >> 16) & 0xff) / 255;
  let g = ((rgb >> 8) & 0xff) / 255;
  let b = (rgb & 0xff) / 255;
  
  // Appliquer la correction gamma (sRGB)
  r = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  g = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  b = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);
  
  // Luminance relative (perception humaine)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// Calculer le ratio de contraste WCAG
function getContrastRatio(lum1: number, lum2: number): number {
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Fonction pour déterminer si le texte doit être noir ou blanc
// Basé sur le ratio de contraste WCAG (minimum 4.5:1 pour AA)
export function getTextColor(colors: string[]): string {
  if (!colors || colors.length === 0) return "text-white";
  
  // Pondération : les premières couleurs sont plus visibles
  const weights = [0.30, 0.25, 0.20, 0.15, 0.10];
  let weightedLuminance = 0;
  let totalWeight = 0;
  
  colors.forEach((c, i) => {
    const weight = weights[i] || 0.05;
    weightedLuminance += getRelativeLuminance(c) * weight;
    totalWeight += weight;
  });
  
  const avgLuminance = weightedLuminance / totalWeight;
  
  // Luminance du blanc (1) et du noir (0)
  const whiteContrast = getContrastRatio(1, avgLuminance);
  const blackContrast = getContrastRatio(0, avgLuminance);
  
  // Choisir la couleur avec le meilleur contraste
  // Préférer le blanc si les contrastes sont similaires (plus lisible sur écran)
  return blackContrast > whiteContrast * 1.1 ? "text-black" : "text-white";
}

// Export pour compatibilité
export const getLuminance = getRelativeLuminance;

