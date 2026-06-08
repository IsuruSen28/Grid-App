// Given paper dimensions and screen constraints, compute canvas display size
export function computeCanvasSize(paperW, paperH, maxW, maxH) {
  const ratio = paperW / paperH;
  let cw = maxW;
  let ch = cw / ratio;
  if (ch > maxH) { ch = maxH; cw = ch * ratio; }
  return { width: Math.floor(cw), height: Math.floor(ch) };
}

// Build CSS filter string from adjustment values
export function buildFilter(adj) {
  const filters = [];
  if (adj.blur > 0) filters.push(`blur(${adj.blur}px)`);
  if (adj.brightness !== 0) filters.push(`brightness(${1 + adj.brightness / 100})`);
  if (adj.contrast !== 0) filters.push(`contrast(${1 + adj.contrast / 100})`);
  if (adj.saturation !== 0) filters.push(`saturate(${Math.max(0, 1 + adj.saturation / 100)})`);
  if (adj.grayscale > 0) filters.push(`grayscale(${adj.grayscale / 100})`);
  if (adj.sepia > 0) filters.push(`sepia(${adj.sepia / 100})`);
  return filters.length ? filters.join(' ') : 'none';
}

export const DEFAULT_ADJ = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  blur: 0,
  grayscale: 0,
  sepia: 0,
};

export const DEFAULT_MESH = {
  lineWidth: 1,
  opacity: 50,
  colorHex: '#ffffff',
  colorAlpha: 100,
  cellW: 2.6,
  cellH: 3.7,
  unit: 'cm',
  diagonalEnabled: false,
  showNumbers: false,

};

export const DEFAULT_CROP = {
  x: 0,
  y: 0,
  width: 1,
  height: 1,
};

export const DEFAULT_PHOTO_TRANSFORM = {
  scale: 1,
  rotation: 0,
  offsetX: 0,
  offsetY: 0,
};

// Compute image draw params to cover canvas (object-fit: cover)
export function coverParams(imgW, imgH, canW, canH, crop) {
  const imgRatio = imgW / imgH;
  const canRatio = canW / canH;
  let sx, sy, sw, sh;
  if (imgRatio > canRatio) {
    sh = imgH;
    sw = imgH * canRatio;
    sx = (imgW - sw) / 2;
    sy = 0;
  } else {
    sw = imgW;
    sh = imgW / canRatio;
    sx = 0;
    sy = (imgH - sh) / 2;
  }
  if (crop) {
    sx += crop.x * sw;
    sy += crop.y * sh;
    sw = crop.width * sw;
    sh = crop.height * sh;
  }
  return { sx, sy, sw, sh };
}

export function imageDrawParams(imgW, imgH, canW, canH, crop, transform) {
  let { sx, sy, sw, sh } = coverParams(imgW, imgH, canW, canH, crop);
  const scale = Math.max(0.5, Math.min(3, transform?.scale ?? 1));
  const offsetX = transform?.offsetX ?? 0;
  const offsetY = transform?.offsetY ?? 0;

  const cx = sx + sw / 2;
  const cy = sy + sh / 2;
  sw = sw / scale;
  sh = sh / scale;
  sx = cx - sw / 2;
  sy = cy - sh / 2;

  const maxPanX = Math.max(0, imgW - sw);
  const maxPanY = Math.max(0, imgH - sh);
  sx += offsetX * maxPanX;
  sy += offsetY * maxPanY;

  sx = Math.max(0, Math.min(imgW - sw, sx));
  sy = Math.max(0, Math.min(imgH - sh, sy));

  return {
    sx, sy, sw, sh,
    rotation: transform?.rotation ?? 0,
  };
}

export function clampPanOffset(offsetX, offsetY) {
  return {
    offsetX: Math.max(-1, Math.min(1, offsetX)),
    offsetY: Math.max(-1, Math.min(1, offsetY)),
  };
}
