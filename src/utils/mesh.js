export const MESH_UNITS = [
  { key: 'mm', label: 'mm', toMm: 1 },
  { key: 'cm', label: 'cm', toMm: 10 },
  { key: 'in', label: 'in', toMm: 25.4 },
];

export function meshGridFromPaper(paperW, paperH, mesh) {
  const unit = MESH_UNITS.find(u => u.key === mesh.unit) || MESH_UNITS[1];
  const cellW = Math.max(0.1, Number(mesh.cellW) || 1);
  const cellH = Math.max(0.1, Number(mesh.cellH) || 1);
  const cellWmm = cellW * unit.toMm;
  const cellHmm = cellH * unit.toMm;
  const cols = Math.max(1, Math.round(paperW / cellWmm));
  const rows = Math.max(1, Math.round(paperH / cellHmm));
  return { cols, rows, cellWmm, cellHmm, unit };
}

export function meshColorRgba(mesh) {
  const hex = mesh.colorHex || '#ffffff';
  const alpha = (mesh.colorAlpha ?? mesh.opacity ?? 100) / 100;
  const r = parseInt(hex.slice(1, 3), 16) || 255;
  const g = parseInt(hex.slice(3, 5), 16) || 255;
  const b = parseInt(hex.slice(5, 7), 16) || 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

export function meshStrokeOpacity(mesh) {
  return Math.max(0, Math.min(1, (mesh.opacity ?? 50) / 100));
}

export function formatCellSize(mesh) {
  const w = Number(mesh.cellW) || 1;
  const h = Number(mesh.cellH) || 1;
  const unit = MESH_UNITS.find(u => u.key === mesh.unit)?.label || mesh.unit;
  return `${w} × ${h} ${unit}`;
}

export function drawMesh(ctx, W, H, mesh, paperW, paperH) {
  const { cols, rows } = meshGridFromPaper(paperW, paperH, mesh);
  const alpha = meshStrokeOpacity(mesh);
  const color = meshColorRgba(mesh);
  const lineWidth = Math.max(0, mesh.lineWidth ?? 1);
  const cw = W / cols;
  const ch = H / rows;

  if (lineWidth <= 0 || alpha <= 0) {
    return { cols, rows };
  }

  const strokeLines = () => {
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    for (let i = 0; i <= cols; i++) {
      const x = Math.round(i * cw);
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let j = 0; j <= rows; j++) {
      const y = Math.round(j * ch);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }
  };

  const strokeDiagonals = () => {
    if (!mesh.diagonalEnabled) return;
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const x = i * cw;
        const y = j * ch;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + cw, y + ch);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + cw, y);
        ctx.lineTo(x, y + ch);
        ctx.stroke();
      }
    }
  };

  ctx.save();
  strokeLines();
  strokeDiagonals();

  if (mesh.showNumbers) {
    const { cellWmm, cellHmm } = meshGridFromPaper(paperW, paperH, mesh);
    ctx.globalAlpha = Math.min(1, alpha * 1.3);
    const fs = Math.max(9, Math.min(13, cw * 0.3));
    ctx.font = `${fs}px monospace`;
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    for (let i = 0; i < cols; i++) {
      ctx.fillText(String.fromCharCode(65 + (i % 26)), i * cw + cw / 2, 2);
    }
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    for (let j = 0; j < rows; j++) ctx.fillText(String(j + 1), 3, j * ch + ch / 2);
    ctx.globalAlpha = alpha * 0.7;
    ctx.font = '10px monospace';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillText(`${cellWmm.toFixed(1)}×${cellHmm.toFixed(1)}mm`, W - 4, H - 4);
  }

  ctx.restore();
  return { cols, rows };
}
