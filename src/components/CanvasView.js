import React, { useRef, useEffect, useCallback } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { COLORS } from '../constants';

// Web-compatible canvas renderer (works in Expo Web + can be adapted for native with expo-gl)
export default function CanvasView({ imageUri, mesh, adj, paperW, paperH, crop, containerStyle, onCanvasReady }) {
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const frameRef = useRef(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // Background
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, W, H);

    // Draw image
    const img = imageRef.current;
    if (img && img.complete && img.naturalWidth) {
      const filters = buildFilter(adj);
      ctx.filter = filters;
      const { sx, sy, sw, sh } = coverParams(img.naturalWidth, img.naturalHeight, W, H, crop);
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, W, H);
      ctx.filter = 'none';
    } else {
      // Placeholder
      ctx.fillStyle = '#2a2a2a';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = COLORS.textDim;
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Tap "Load Photo" to begin', W / 2, H / 2);
    }

    // Draw mesh
    drawMesh(ctx, W, H, mesh, paperW, paperH);

    if (onCanvasReady) onCanvasReady(canvas);
  }, [imageUri, mesh, adj, paperW, paperH, crop]);

  useEffect(() => {
    if (imageUri && canvasRef.current) {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => { imageRef.current = img; draw(); };
      img.src = imageUri;
    } else {
      imageRef.current = null;
      draw();
    }
  }, [imageUri]);

  useEffect(() => {
    cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(draw);
  }, [draw]);

  return (
    <View style={[styles.container, containerStyle]}>
      <canvas
        ref={canvasRef}
        width={canvasRef.current?.parentElement?.clientWidth || 340}
        height={canvasRef.current?.parentElement?.clientHeight || 420}
        style={{ display: 'block', width: '100%', height: '100%' }}
      />
    </View>
  );
}

function buildFilter(adj) {
  const f = [];
  if (adj.blur > 0) f.push(`blur(${adj.blur}px)`);
  if (adj.brightness !== 0) f.push(`brightness(${1 + adj.brightness / 100})`);
  if (adj.contrast !== 0) f.push(`contrast(${1 + adj.contrast / 100})`);
  if (adj.saturation !== 0) f.push(`saturate(${Math.max(0, 1 + adj.saturation / 100)})`);
  if (adj.grayscale > 0) f.push(`grayscale(${adj.grayscale / 100})`);
  if (adj.sepia > 0) f.push(`sepia(${adj.sepia / 100})`);
  return f.length ? f.join(' ') : 'none';
}

function coverParams(imgW, imgH, canW, canH, crop) {
  const imgRatio = imgW / imgH;
  const canRatio = canW / canH;
  let sx, sy, sw, sh;
  if (imgRatio > canRatio) {
    sh = imgH; sw = imgH * canRatio;
    sx = (imgW - sw) / 2; sy = 0;
  } else {
    sw = imgW; sh = imgW / canRatio;
    sx = 0; sy = (imgH - sh) / 2;
  }
  if (crop) {
    const ox = crop.x * sw, oy = crop.y * sh;
    sw = crop.width * sw; sh = crop.height * sh;
    sx += ox; sy += oy;
  }
  return { sx, sy, sw, sh };
}

function drawMesh(ctx, W, H, mesh, paperW, paperH) {
  const { cols, rows, opacity, lineWidth, color, diagonal, showNumbers, showCenter } = mesh;
  const alpha = opacity / 100;
  const cw = W / cols;
  const ch = H / rows;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;

  // Vertical lines
  for (let i = 0; i <= cols; i++) {
    const x = Math.round(i * cw);
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  // Horizontal lines
  for (let j = 0; j <= rows; j++) {
    const y = Math.round(j * ch);
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }

  // Diagonals
  if (diagonal === 'single' || diagonal === 'cross') {
    ctx.globalAlpha = alpha * 0.6;
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const x = i * cw, y = j * ch;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + cw, y + ch); ctx.stroke();
      }
    }
  }
  if (diagonal === 'cross') {
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const x = i * cw, y = j * ch;
        ctx.beginPath(); ctx.moveTo(x + cw, y); ctx.lineTo(x, y + ch); ctx.stroke();
      }
    }
  }

  // Center lines (highlighted)
  if (showCenter) {
    ctx.globalAlpha = Math.min(1, alpha * 1.6);
    ctx.lineWidth = lineWidth + 1;
    ctx.setLineDash([6, 4]);
    const cx = W / 2, cy = H / 2;
    ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, H); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(W, cy); ctx.stroke();
    ctx.setLineDash([]);
    ctx.lineWidth = lineWidth;
  }

  // Grid numbers
  if (showNumbers) {
    ctx.globalAlpha = Math.min(1, alpha * 1.4);
    const fontSize = Math.max(9, Math.min(13, cw * 0.3));
    ctx.font = `${fontSize}px monospace`;
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    // Column letters
    for (let i = 0; i < cols; i++) {
      const label = String.fromCharCode(65 + (i % 26));
      ctx.fillText(label, i * cw + cw / 2, 2);
    }
    // Row numbers
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    for (let j = 0; j < rows; j++) {
      ctx.fillText(j + 1, 3, j * ch + ch / 2);
    }
    // Cell size label bottom
    const mmW = (paperW / cols).toFixed(1);
    const mmH = (paperH / rows).toFixed(1);
    ctx.globalAlpha = alpha * 0.7;
    ctx.font = '10px monospace';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillText(`${mmW}×${mmH}mm/cell`, W - 4, H - 4);
  }

  ctx.restore();
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
    overflow: 'hidden',
  },
});
