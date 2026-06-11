import { buildFilter, imageDrawParams } from './canvas';
import { drawMesh } from './mesh';

function drawFrame(ctx, W, H, {
  adj,
  mesh,
  paperW,
  paperH,
  crop,
  photoTransform,
  canvasBg,
  img,
}) {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = canvasBg;
  ctx.fillRect(0, 0, W, H);

  const renderMesh = () => drawMesh(ctx, W, H, mesh, paperW, paperH);

  if (!img) {
    renderMesh();
    return;
  }

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
}

export function renderToCanvas(canvas, {
  imageUri,
  image: cachedImage,
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
  const frame = { adj, mesh, paperW, paperH, crop, photoTransform, canvasBg };

  if (cachedImage?.complete && cachedImage.naturalWidth > 0) {
    drawFrame(ctx, W, H, { ...frame, img: cachedImage });
    return Promise.resolve();
  }

  if (!imageUri) {
    drawFrame(ctx, W, H, { ...frame, img: null });
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      drawFrame(ctx, W, H, { ...frame, img });
      resolve();
    };
    img.onerror = () => {
      drawFrame(ctx, W, H, { ...frame, img: null });
      resolve();
    };
    img.src = imageUri;
  });
}

export function mmToScreenPx(mm) {
  return mm * (96 / 25.4);
}
