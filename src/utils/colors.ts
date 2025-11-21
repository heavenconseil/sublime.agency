
// Fonction utilitaire pour calculer la luminance
export function getLuminance(hex: string) {
  const c = hex.substring(1);      // strip #
  const rgb = parseInt(c, 16);   // convert rrggbb to decimal
  const r = (rgb >> 16) & 0xff;  // extract red
  const g = (rgb >>  8) & 0xff;  // extract green
  const b = (rgb >>  0) & 0xff;  // extract blue

  // Formule standard de luminance relative (perçue)
  // 0.2126 R + 0.7152 G + 0.0722 B
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// Fonction pour déterminer si le texte doit être noir ou blanc
export function getTextColor(colors: string[]) {
  if (!colors || colors.length === 0) return "text-white";
  
  // Moyenne des luminances
  let totalLuminance = 0;
  colors.forEach(c => totalLuminance += getLuminance(c));
  const avgLuminance = totalLuminance / colors.length;
  
  // Seuil (128 est la moitié de 255, on ajuste souvent autour de 140-150 pour le confort)
  return avgLuminance > 140 ? "text-black" : "text-white";
}

