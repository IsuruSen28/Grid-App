export const PAPER_SIZES = {
  A3: { label: 'A3', width: 297, height: 420 },
  A4: { label: 'A4', width: 210, height: 297 },
  A5: { label: 'A5', width: 148, height: 210 },
  Letter: { label: 'Letter', width: 216, height: 279 },
  Legal: { label: 'Legal', width: 216, height: 356 },
  Square: { label: 'Square', width: 200, height: 200 },
  Custom: { label: 'Custom', width: 200, height: 200 },
};

export const MESH_COLORS = [
  { label: 'White', value: 'rgba(255,255,255,1)' },
  { label: 'Black', value: 'rgba(0,0,0,1)' },
  { label: 'Red', value: 'rgba(255,60,60,1)' },
  { label: 'Blue', value: 'rgba(60,120,255,1)' },
  { label: 'Yellow', value: 'rgba(255,220,0,1)' },
];

export const TABS = [
  { key: 'size', icon: 'crop', label: 'Size & Crop' },
  { key: 'mesh', icon: 'grid', label: 'Mesh' },
  { key: 'adjust', icon: 'sliders', label: 'Adjust' },
  { key: 'export', icon: 'download', label: 'Export' },
];

export const COLORS = {
  bg: '#0f0f0f',
  surface: '#1a1a1a',
  card: '#ffffff',
  border: '#333333',
  accent: '#e8d5a3',
  accentDim: '#b8a57a',
  text: '#222222',
  textMuted: '#888880',
  textDim: '#555550',
  danger: '#e05a52',
  success: '#5aaa78',
};
