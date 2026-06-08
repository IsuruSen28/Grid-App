# PortraitMesh 🎨

A mobile app for portrait artists to overlay reference grids on photos for accurate proportion transfer.

---

## Features

- **Photo loading** — pick any portrait from your camera roll
- **Paper sizes** — A3, A4, A5, Letter, Legal, Square, or fully custom mm dimensions
- **Orientation** — portrait / landscape toggle
- **Crop tool** — interactive drag-to-crop with rule-of-thirds guide lines
- **Mesh overlay** — adjustable columns, rows, opacity, line width, color
- **Diagonal lines** — none / single / cross diagonals per cell
- **Grid numbers** — A1-style cell labels (A, B, C... + 1, 2, 3...)
- **Center line** — dashed midpoint guides (crucial for symmetry)
- **Photo adjustments** — brightness, contrast, saturation, blur, grayscale, sepia
- **Presets** — Grayscale, High Contrast, Sketch, Warm, Soft
- **Export** — share/save photo only OR photo with mesh overlay

---

## Project Structure

```
PortraitMesh/
├── App.js                          # Root component, canvas drawing, state
├── app.json                        # Expo config, permissions
├── src/
│   ├── constants/
│   │   └── index.js                # Paper sizes, colors, tab config
│   ├── utils/
│   │   └── canvas.js               # Drawing helpers, filter builder
│   └── components/
│       ├── UI.js                   # Shared: SliderRow, PillButton, ActionButton
│       ├── CanvasView.js           # Canvas renderer (web/native)
│       ├── CropOverlay.js          # Drag-handle crop UI
│       ├── SizePanel.js            # Tab 1: size + crop controls
│       ├── MeshPanel.js            # Tab 2: mesh controls
│       ├── AdjustPanel.js          # Tab 3: photo adjustment sliders
│       └── ExportPanel.js          # Tab 4: export + summary
```

---

## Setup & Run

### Prerequisites
- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- For iOS: Xcode + iOS Simulator (macOS only)
- For Android: Android Studio + emulator, or a real device with Expo Go

### Install & Start

```bash
# Install dependencies
npm install

# Start Expo development server
npx expo start

# Then press:
# i  → open iOS Simulator
# a  → open Android emulator
# w  → open in web browser (Chrome recommended)
# Scan QR code with Expo Go app on your phone
```

---

## Building for Production

### Android APK (for direct install)
```bash
npx expo build:android -t apk
```

### Android AAB (for Play Store)
```bash
npx expo build:android -t app-bundle
```

### iOS IPA (requires Apple Developer account)
```bash
npx expo build:ios
```

### Using EAS Build (recommended for production)
```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform android   # or ios / all
```

---

## How It Works — The Mesh Grid Method

1. Load your portrait reference photo
2. Choose your drawing paper size (e.g. A4)
3. Set grid size — **8×10 is great for beginners**, 16×20 for detail work
4. Export the photo with mesh overlay
5. Print it out at the same size as your drawing paper
6. Lightly draw the same grid on your paper with a pencil
7. Copy one cell at a time — break the face into small, manageable shapes
8. Erase the pencil grid when your drawing is complete

---

## Customization Tips

### Grid sizes for different skill levels
| Level | Grid | Cell size (A4) |
|-------|------|----------------|
| Beginner | 6×8 | 35×37 mm |
| Intermediate | 8×10 | 26×30 mm |
| Advanced | 12×15 | 18×20 mm |
| Detail work | 16×20 | 13×15 mm |

### Adding more paper sizes
Edit `src/constants/index.js` → `PAPER_SIZES` object:
```js
MySize: { label: 'My Size', width: 300, height: 400 }
```

### Changing the color theme
Edit `src/constants/index.js` → `COLORS` object. The app uses a warm dark theme (dark charcoal + gold accent). You can change `accent` to any hex color.

---

## Next Steps / Roadmap

- [ ] Pinch-to-zoom on the canvas
- [ ] Camera capture (take photo in-app)
- [ ] Save presets / favorite grid configurations
- [ ] Grid opacity per-cell (highlight specific areas)
- [ ] Split-screen: reference + blank drawing side by side
- [ ] Ruler overlay showing mm measurements on edges
- [ ] Share to print service directly

---

## Dependencies

| Package | Purpose |
|---------|---------|
| `expo` | Core runtime |
| `expo-image-picker` | Access camera roll |
| `expo-media-library` | Save to photo library |
| `expo-file-system` | Write temp files for export |
| `expo-sharing` | Native share sheet |
| `@react-native-community/slider` | Slider controls |
| `react-native-gesture-handler` | Crop drag handles |

---

## License
MIT — free to use, modify, and publish.
