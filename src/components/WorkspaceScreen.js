import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  StatusBar, Platform, Dimensions, Alert,
} from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

import {
  DEFAULT_ADJ, DEFAULT_MESH, DEFAULT_CROP, DEFAULT_PHOTO_TRANSFORM,
  computeCanvasSize, clampPanOffset,
} from '../utils/canvas';
import { renderToCanvas } from '../utils/exportCanvas';
import { useTheme } from '../context/ThemeContext';
import SizePanel from './SizePanel';
import MeshPanel from './MeshPanel';
import AdjustPanel from './AdjustPanel';
import ExportPanel from './ExportPanel';
import BottomTabBar from './BottomTabBar';
import PhotoPanLayer from './PhotoPanLayer';
import AppMenu from './AppMenu';

const { width: SW } = Dimensions.get('window');
const SIZE_PANEL_HEIGHT = 120;
const MESH_PANEL_HEIGHT = 120;
const ADJUST_PANEL_HEIGHT = 200;
const COMPACT_TABS = ['size', 'mesh', 'adjust']

export default function WorkspaceScreen({ imageUri, onGoHome, onImageChange }) {
  const { colors, theme } = useTheme();
  const [activeTab, setActiveTab] = useState('size');
  const [menuOpen, setMenuOpen] = useState(false);
  const [paperKey, setPaperKey] = useState('A4');
  const [paperW, setPaperW] = useState(210);
  const [paperH, setPaperH] = useState(297);
  const [orientation, setOrientation] = useState('portrait');
  const [customW, setCustomW] = useState(200);
  const [customH, setCustomH] = useState(200);
  const [mesh, setMesh] = useState(DEFAULT_MESH);
  const [adj, setAdj] = useState(DEFAULT_ADJ);
  const [crop, setCrop] = useState(DEFAULT_CROP);
  const [photoTransform, setPhotoTransform] = useState(DEFAULT_PHOTO_TRANSFORM);
  const [canvasBox, setCanvasBox] = useState({ width: SW, height: 300 });
  const [previewUri, setPreviewUri] = useState(null);
  const canvasRef = useRef(null);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [activeCloseHandler, setActiveCloseHandler] = useState(null);

  const { width: cW, height: cH } = computeCanvasSize(
    paperW,
    paperH,
    canvasBox.width,
    Math.max(120, canvasBox.height),
  );

  const setPaper = (w, h) => {
    if (orientation === 'landscape') { setPaperW(h); setPaperH(w); }
    else { setPaperW(w); setPaperH(h); }
  };

  const handleOrientation = (o) => {
    setOrientation(o);
    if ((o === 'portrait' && paperW > paperH) || (o === 'landscape' && paperH > paperW)) {
      const tmp = paperW; setPaperW(paperH); setPaperH(tmp);
    }
  };

  const handlePanChange = useCallback((next) => {
    setPhotoTransform(prev => ({ ...prev, ...clampPanOffset(next.offsetX, next.offsetY) }));
  }, []);

  const redraw = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = cW;
    canvas.height = cH;
    await renderToCanvas(canvas, {
      imageUri,
      adj,
      mesh,
      paperW,
      paperH,
      crop,
      photoTransform,
      canvasBg: theme === 'light' ? '#e8e4dc' : '#1a1a1a',
    });
  }, [imageUri, adj, mesh, paperW, paperH, crop, photoTransform, cW, cH, theme]);

  useEffect(() => { redraw(); }, [redraw]);

  const capturePreview = useCallback(async () => {
    await redraw();
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.toDataURL('image/png');
  }, [redraw]);

  useEffect(() => {
    if (activeTab === 'export') {
      capturePreview().then(uri => { if (uri) setPreviewUri(uri); });
    }
  }, [activeTab, imageUri, adj, mesh, paperW, paperH, crop, photoTransform, capturePreview]);

  const handleExport = async () => {
    const dataUrl = await capturePreview();
    if (!dataUrl) return;
    try {
      const base64 = dataUrl.split(',')[1];
      const fileUri = FileSystem.cacheDirectory + `portrait_${Date.now()}.png`;
      await FileSystem.writeAsStringAsync(fileUri, base64, { encoding: FileSystem.EncodingType.Base64 });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, { mimeType: 'image/png' });
      } else if (Platform.OS !== 'web') {
        const MediaLibrary = await import('expo-media-library');
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status === 'granted') {
          await MediaLibrary.saveToLibraryAsync(fileUri);
          Alert.alert('Saved!', 'Saved to photo library.');
        } else {
          Alert.alert('Permission needed', 'Allow access to your photo library.');
        }
      } else {
        Alert.alert('Saved', 'Use Share or right-click the preview to save on web.');
      }
    } catch (e) { Alert.alert('Export error', e.message); }
  };

  const onCanvasAreaLayout = (e) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) setCanvasBox({ width, height });
  };

  const panelHeight = activeTab === 'size'
    ? SIZE_PANEL_HEIGHT
    : activeTab === 'mesh'
      ? MESH_PANEL_HEIGHT
      : ADJUST_PANEL_HEIGHT;

  const renderPanel = () => {
    switch (activeTab) {
      case 'size':
        return (
          <SizePanel
            paperKey={paperKey}
            setPaperKey={setPaperKey}
            paperW={paperW}
            paperH={paperH}
            setPaper={setPaper}
            orientation={orientation}
            setOrientation={handleOrientation}
            customW={customW}
            customH={customH}
            setCustomW={setCustomW}
            setCustomH={setCustomH}
            photoTransform={photoTransform}
            setPhotoTransform={setPhotoTransform}
            registerMenu={(open, closeFn) => {
              setOverlayVisible(!!open);
              setActiveCloseHandler(() => (closeFn || null));
            }}
          />
        );
      case 'mesh':
        return <MeshPanel mesh={mesh} setMesh={setMesh} />;
      case 'adjust':
        return <AdjustPanel adj={adj} setAdj={setAdj} registerMenu={(open, closeFn) => {
          setOverlayVisible(!!open);
          setActiveCloseHandler(() => (closeFn || null));
        }} />;
      case 'export':
        return (
          <ExportPanel
            paperW={paperW}
            paperH={paperH}
            mesh={mesh}
            adj={adj}
            orientation={orientation}
            imageLoaded={!!imageUri}
            previewUri={previewUri}
            onRefreshPreview={capturePreview}
            onExport={handleExport}
            registerMenu={(open, closeFn) => {
              setOverlayVisible(!!open);
              setActiveCloseHandler(() => (closeFn || null));
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      {overlayVisible && (
        <TouchableOpacity
          style={[StyleSheet.absoluteFill, { zIndex: 5 }]}
          activeOpacity={1}
          onPress={() => {
            if (activeCloseHandler) activeCloseHandler();
            setOverlayVisible(false);
          }}
        />
      )}
      <StatusBar barStyle={theme === 'light' ? 'dark-content' : 'light-content'} />

      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={onGoHome} style={[styles.backBtn, { borderColor: colors.border }]}>
          <Text style={{ color: colors.text, fontSize: 18 }}>‹</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.accent }]}>Workspace</Text>
        <TouchableOpacity style={[styles.menuBtn, { borderColor: colors.border }]} onPress={() => setMenuOpen(true)}>
          <Text style={[styles.menuIcon, { color: colors.text }]}>☰</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.canvasArea, { backgroundColor: colors.canvasBg }]} onLayout={onCanvasAreaLayout}>
        <View style={[styles.canvasInner, { width: cW, height: cH }]}>
          <canvas
            ref={canvasRef}
            width={cW}
            height={cH}
            style={{ display: 'block', width: cW, height: cH }}
          />
          {imageUri && (
            <PhotoPanLayer
              width={cW}
              height={cH}
              enabled={activeTab === 'size'}
              transform={photoTransform}
              onPanChange={handlePanChange}
            />
          )}
        </View>
      </View>

      {activeTab === 'export' && (
        <View style={[styles.expandedPanel, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
          {renderPanel()}
        </View>
      )}

      <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        {COMPACT_TABS.includes(activeTab) && (
          <View style={[styles.compactPanelSlot, { height: panelHeight }]}>
            {renderPanel()}
          </View>
        )}
        <BottomTabBar activeTab={activeTab} onTabChange={setActiveTab} />
      </View>

      <AppMenu visible={menuOpen} onClose={() => setMenuOpen(false)} onGoHome={onGoHome} />
      {/* moved overlay earlier in tree to avoid covering drop-up menus */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 17, fontWeight: '700', letterSpacing: 0.5 },
  menuBtn: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIcon: { fontSize: 20 },
  canvasArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  canvasInner: { position: 'relative', overflow: 'hidden' },
  expandedPanel: {
    flexShrink: 1,
    flexGrow: 0,
    maxHeight: '42%',
    minHeight: 200,
    borderTopWidth: 0.5,
  },
  footer: { flexShrink: 0, borderTopWidth: 0.5 },
  compactPanelSlot: { minHeight: 120, overflow: 'visible' },
});
