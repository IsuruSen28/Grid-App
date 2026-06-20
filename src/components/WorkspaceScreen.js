import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  StatusBar, Platform, Dimensions, Alert, ScrollView,
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
import { Icon } from './UI';

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
  const [orientation, setOrientation] = useState('Portrait');
  const [customW, setCustomW] = useState(200);
  const [customH, setCustomH] = useState(200);
  const [mesh, setMesh] = useState(DEFAULT_MESH);
  const [adj, setAdj] = useState(DEFAULT_ADJ);
  const [crop, setCrop] = useState(DEFAULT_CROP);
  const [photoTransform, setPhotoTransform] = useState(DEFAULT_PHOTO_TRANSFORM);
  const [canvasBox, setCanvasBox] = useState({ width: SW, height: 300 });
  const [previewUri, setPreviewUri] = useState(null);
  const [workspaceZoom, setWorkspaceZoom] = useState(1);
  const canvasRef = useRef(null);
  const imageCacheRef = useRef({ uri: null, img: null });
  const photoTransformRef = useRef(photoTransform);
  const redrawRafRef = useRef(null);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [activeCloseHandler, setActiveCloseHandler] = useState(null);

  const scrollRef = useRef(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const scrollLeft = useRef(0);
  const scrollTop = useRef(0);

  const handleZoomIn = () => {
    setWorkspaceZoom(prev => Math.min(4, prev + 0.25));
  };
  const handleZoomOut = () => {
    setWorkspaceZoom(prev => Math.max(1, prev - 0.25));
  };
  const handleZoomReset = () => {
    setWorkspaceZoom(1);
  };

  const handleMouseDown = (e) => {
    if (activeTab === 'size' || workspaceZoom <= 1) return;
    isDown.current = true;
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;
    startX.current = e.pageX - scrollContainer.offsetLeft;
    startY.current = e.pageY - scrollContainer.offsetTop;
    scrollLeft.current = scrollContainer.scrollLeft;
    scrollTop.current = scrollContainer.scrollTop;
  };

  const handleMouseLeave = () => {
    isDown.current = false;
  };

  const handleMouseUp = () => {
    isDown.current = false;
  };

  const handleMouseMove = (e) => {
    if (!isDown.current || activeTab === 'size' || workspaceZoom <= 1) return;
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;
    e.preventDefault();
    const x = e.pageX - scrollContainer.offsetLeft;
    const y = e.pageY - scrollContainer.offsetTop;
    const walkX = (x - startX.current) * 1.5;
    const walkY = (y - startY.current) * 1.5;
    scrollContainer.scrollLeft = scrollLeft.current - walkX;
    scrollContainer.scrollTop = scrollTop.current - walkY;
  };

  useEffect(() => {
    photoTransformRef.current = photoTransform;
  }, [photoTransform]);

  const { width: cW, height: cH } = computeCanvasSize(
    paperW,
    paperH,
    canvasBox.width,
    Math.max(120, canvasBox.height),
  );

  const setPaper = (w, h) => {
    if (orientation === 'Landscape') { setPaperW(h); setPaperH(w); }
    else { setPaperW(w); setPaperH(h); }
  };

  const handleOrientation = (o) => {
    setOrientation(o);
    if ((o === 'Portrait' && paperW > paperH) || (o === 'Landscape' && paperH > paperW)) {
      const tmp = paperW; setPaperW(paperH); setPaperH(tmp);
    }
  };

  const handlePanChange = useCallback((next) => {
    const updated = {
      ...photoTransformRef.current,
      ...clampPanOffset(next.offsetX, next.offsetY),
    };
    photoTransformRef.current = updated;
    setPhotoTransform(updated);
    if (redrawRafRef.current) return;
    redrawRafRef.current = requestAnimationFrame(() => {
      redrawRafRef.current = null;
      redrawRef.current?.();
    });
  }, []);

  const redraw = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const targetW = Math.round(cW * workspaceZoom);
    const targetH = Math.round(cH * workspaceZoom);
    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }
    await renderToCanvas(canvas, {
      imageUri,
      image: imageCacheRef.current.img,
      adj,
      mesh,
      paperW,
      paperH,
      crop,
      photoTransform: photoTransformRef.current,
      canvasBg: theme === 'light' ? '#e8e4dc' : '#1a1a1a',
    });
  }, [imageUri, adj, mesh, paperW, paperH, crop, cW, cH, theme, workspaceZoom]);

  const redrawRef = useRef(redraw);
  redrawRef.current = redraw;

  useEffect(() => {
    if (!imageUri) {
      imageCacheRef.current = { uri: null, img: null };
      redraw();
      return;
    }
    if (imageCacheRef.current.uri === imageUri && imageCacheRef.current.img?.complete) {
      redraw();
      return;
    }
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    const uri = imageUri;
    img.onload = () => {
      if (uri !== imageUri) return;
      imageCacheRef.current = { uri, img };
      redrawRef.current?.();
    };
    img.onerror = () => {
      if (uri !== imageUri) return;
      imageCacheRef.current = { uri, img: null };
      redrawRef.current?.();
    };
    img.src = imageUri;
    imageCacheRef.current = { uri: imageUri, img: null };
  }, [imageUri, redraw]);

  useEffect(() => { redraw(); }, [redraw, photoTransform]);

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
        <TouchableOpacity onPress={onGoHome} style={[styles.backBtn, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <Icon name="chevron-left" size={16} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.accent }]}>Workspace</Text>
        <TouchableOpacity style={[styles.menuBtn, { borderColor: colors.border, backgroundColor: colors.card }]} onPress={() => setMenuOpen(true)}>
          <Icon name="menu" size={16} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={[styles.canvasArea, { backgroundColor: colors.canvasBg }]} onLayout={onCanvasAreaLayout}>
        {Platform.OS === 'web' ? (
          <div
            ref={scrollRef}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            style={{
              width: '100%',
              height: '100%',
              overflow: 'auto',
              display: 'flex',
              alignItems: workspaceZoom > 1 ? 'flex-start' : 'center',
              justifyContent: workspaceZoom > 1 ? 'flex-start' : 'center',
              cursor: activeTab !== 'size' && workspaceZoom > 1 ? 'grab' : 'default',
            }}
          >
            <View style={[
              styles.canvasInner,
              {
                width: Math.round(cW * workspaceZoom),
                height: Math.round(cH * workspaceZoom),
                margin: workspaceZoom > 1 ? 16 : 'auto'
              }
            ]}>
              <canvas
                ref={canvasRef}
                width={Math.round(cW * workspaceZoom)}
                height={Math.round(cH * workspaceZoom)}
                style={{
                  display: 'block',
                  width: Math.round(cW * workspaceZoom),
                  height: Math.round(cH * workspaceZoom)
                }}
              />
              {imageUri && (
                <PhotoPanLayer
                  width={Math.round(cW * workspaceZoom)}
                  height={Math.round(cH * workspaceZoom)}
                  enabled={activeTab === 'size'}
                  transform={photoTransform}
                  onPanChange={handlePanChange}
                />
              )}
            </View>
          </div>
        ) : (
          <ScrollView
            style={{ width: '100%', height: '100%' }}
            contentContainerStyle={{ alignItems: 'center', justifyContent: 'center', minWidth: '100%', minHeight: '100%' }}
          >
            <ScrollView
              horizontal
              style={{ width: '100%', height: '100%' }}
              contentContainerStyle={{ alignItems: 'center', justifyContent: 'center', minWidth: '100%' }}
            >
              <View style={[styles.canvasInner, { width: Math.round(cW * workspaceZoom), height: Math.round(cH * workspaceZoom) }]}>
                <canvas
                  ref={canvasRef}
                  width={Math.round(cW * workspaceZoom)}
                  height={Math.round(cH * workspaceZoom)}
                  style={{
                    display: 'block',
                    width: Math.round(cW * workspaceZoom),
                    height: Math.round(cH * workspaceZoom)
                  }}
                />
                {imageUri && (
                  <PhotoPanLayer
                    width={Math.round(cW * workspaceZoom)}
                    height={Math.round(cH * workspaceZoom)}
                    enabled={activeTab === 'size'}
                    transform={photoTransform}
                    onPanChange={handlePanChange}
                  />
                )}
              </View>
            </ScrollView>
          </ScrollView>
        )}

        {/* Floating Zoom Controls */}
        <View style={styles.zoomControls}>
          <TouchableOpacity
            style={[styles.zoomBtn, { backgroundColor: colors.cardOverlay, borderColor: colors.border, ...colors.shadow }]}
            onPress={handleZoomOut}
            disabled={workspaceZoom <= 1}
            activeOpacity={0.8}
          >
            <Icon name="minus" size={14} color={workspaceZoom <= 1 ? colors.textDim : colors.text} />
          </TouchableOpacity>
          <View style={[styles.zoomLabelBg, { backgroundColor: colors.cardOverlay, borderColor: colors.border, ...colors.shadow }]}>
            <Text style={[styles.zoomLabel, { color: colors.text }]}>{Math.round(workspaceZoom * 100)}%</Text>
          </View>
          <TouchableOpacity
            style={[styles.zoomBtn, { backgroundColor: colors.cardOverlay, borderColor: colors.border, ...colors.shadow }]}
            onPress={handleZoomIn}
            disabled={workspaceZoom >= 4}
            activeOpacity={0.8}
          >
            <Icon name="plus" size={14} color={workspaceZoom >= 4 ? colors.textDim : colors.text} />
          </TouchableOpacity>
          {workspaceZoom > 1 && (
            <TouchableOpacity
              style={[styles.zoomBtn, { backgroundColor: colors.cardOverlay, borderColor: colors.accent, ...colors.shadow }]}
              onPress={handleZoomReset}
              activeOpacity={0.8}
            >
              <Text style={[styles.zoomResetText, { color: colors.accent }]}>1x</Text>
            </TouchableOpacity>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.8,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 0.8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '800', letterSpacing: 0.5 },
  menuBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 0.8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  canvasArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  canvasInner: {
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.15)',
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  zoomControls: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    zIndex: 50,
  },
  zoomBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 0.8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomResetText: {
    fontSize: 12,
    fontWeight: '700',
  },
  zoomLabelBg: {
    height: 34,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 0.8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomLabel: {
    fontSize: 11,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  expandedPanel: {
    flexShrink: 1,
    flexGrow: 0,
    maxHeight: '42%',
    minHeight: 200,
    borderTopWidth: 0.8,
  },
  footer: { flexShrink: 0, borderTopWidth: 0.8 },
  compactPanelSlot: { minHeight: 120, overflow: 'visible' },
});
