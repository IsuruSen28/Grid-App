import { buildFilter, imageDrawParams } from './canvas';
import { drawMesh } from './mesh';

export function renderToCanvas(canvas, {
  imageUri,
  adj,
  mesh,
  paperW,
  paperH,
  crop,
  photoTransform,
  canvasBg = '#1a1a1a',
}) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = canvasBg;
  ctx.fillRect(0, 0, W, H);

  const renderMesh = () => drawMesh(ctx, W, H, mesh, paperW, paperH);

  const drawImage = (img) => {
    ctx.filter = buildFilter(adj);
    const { sx, sy, sw, sh, rotation } = imageDrawParams(
      img.naturalWidth,
      img.naturalHeight,
      W,
      H,
      crop,
      photoTransform,
    );
    ctx.save();
    if (rotation) {
      ctx.translate(W / 2, H / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.translate(-W / 2, -H / 2);
    }
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, W, H);
    ctx.restore();
    ctx.filter = 'none';
    renderMesh();
  };

  return new Promise((resolve) => {
    if (!imageUri) {
      renderMesh();
      resolve();
      return;
    }
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => { drawImage(img); resolve(); };
    img.onerror = () => { renderMesh(); resolve(); };
    img.src = imageUri;
  });
}

export function mmToScreenPx(mm) {
  return mm * (96 / 25.4);
}
