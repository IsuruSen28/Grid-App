import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal, Pressable,
  Image, Platform,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { SectionLabel, ActionButton, Divider } from './UI';
import { meshGridFromPaper } from '../utils/mesh';
import { mmToScreenPx } from '../utils/exportCanvas';

export default function ExportPanel({
  paperW,
  paperH,
  mesh,
  adj,
  orientation,
  imageLoaded,
  previewUri,
  onRefreshPreview,
  onExport,
}) {
  const { colors } = useTheme();
  const [viewMode, setViewMode] = useState(null);
  const { cols, rows } = meshGridFromPaper(paperW, paperH, mesh);
  const realW = Math.round(mmToScreenPx(paperW));
  const realH = Math.round(mmToScreenPx(paperH));

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: colors.surface }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Preview reference</Text>
      <View style={styles.viewBtns}>
        <TouchableOpacity
          style={[styles.viewBtn, { borderColor: colors.border, backgroundColor: colors.card }]}
          onPress={async () => {
            await onRefreshPreview?.();
            setViewMode('fullscreen');
          }}
          disabled={!previewUri}
          activeOpacity={0.8}
        >
          <Text style={[styles.viewBtnText, { color: colors.text }]}>Full Screen</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.viewBtn, { borderColor: colors.accent, backgroundColor: colors.card }]}
          onPress={async () => {
            await onRefreshPreview?.();
            setViewMode('realsize');
          }}
          disabled={!previewUri}
          activeOpacity={0.8}
        >
          <Text style={[styles.viewBtnText, { color: colors.accent }]}>Real Size</Text>
        </TouchableOpacity>
      </View>
      <Text style={[styles.realHint, { color: colors.textDim }]}>
        Real size mapping: {paperW} × {paperH} mm on screen (~{realW} × {realH} px)
      </Text>

      <Divider />
      
      <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Export reference</Text>
      <ActionButton label="Share / Save PNG" variant="accent" onPress={onExport} style={styles.exportBtn} />
      {!imageLoaded && (
        <Text style={[styles.warn, { color: colors.danger }]}>Load a photo to export reference.</Text>
      )}

      <PreviewModal
        visible={viewMode === 'fullscreen'}
        onClose={() => setViewMode(null)}
        previewUri={previewUri}
        mode="fullscreen"
        colors={colors}
      />
      <PreviewModal
        visible={viewMode === 'realsize'}
        onClose={() => setViewMode(null)}
        previewUri={previewUri}
        mode="realsize"
        realW={realW}
        realH={realH}
        paperW={paperW}
        paperH={paperH}
        colors={colors}
      />
    </ScrollView>
  );
}

function PreviewModal({ visible, onClose, previewUri, mode, realW, realH, paperW, paperH, colors }) {
  if (!visible || !previewUri) return null;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={[styles.modalBg, { backgroundColor: colors.overlay }]} onPress={onClose}>
        <Pressable style={[styles.modalInner, { backgroundColor: colors.card, borderColor: colors.border, ...colors.shadow }]} onPress={e => e.stopPropagation()}>
          {mode === 'realsize' && (
            <Text style={[styles.modalLabel, { color: colors.accent }]}>
              Real Size — {paperW} × {paperH} mm
            </Text>
          )}
          <ScrollView
            style={styles.modalScroll}
            contentContainerStyle={styles.modalScrollContent}
            maximumZoomScale={3}
            minimumZoomScale={1}
          >
            {Platform.OS === 'web' ? (
              <img
                src={previewUri}
                alt="Preview"
                style={
                  mode === 'realsize'
                    ? { width: realW, height: realH, objectFit: 'fill', display: 'block' }
                    : { maxWidth: '90vw', maxHeight: '75vh', objectFit: 'contain', display: 'block' }
                }
              />
            ) : (
              <Image
                source={{ uri: previewUri }}
                style={
                  mode === 'realsize'
                    ? { width: realW, height: realH }
                    : { width: '100%', height: undefined, aspectRatio: 1, maxHeight: 500 }
                }
                resizeMode={mode === 'realsize' ? 'stretch' : 'contain'}
              />
            )}
          </ScrollView>
          <TouchableOpacity
            style={[styles.closeBtn, { backgroundColor: colors.accent, ...colors.shadow }]}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={{ color: colors.bg, fontWeight: '700', fontSize: 13 }}>Close Preview</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24 },
  sectionTitle: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  viewBtns: { flexDirection: 'row', gap: 8, marginTop: 4 },
  viewBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 0.8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewBtnText: { fontSize: 12, fontWeight: '700' },
  realHint: { fontSize: 9, textAlign: 'center', marginTop: 6, fontWeight: '500' },
  warn: { fontSize: 11, marginTop: 8, textAlign: 'center', fontWeight: '600' },
  exportBtn: { marginTop: 4 },
  modalBg: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  modalInner: {
    width: '94%',
    maxHeight: '90%',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 0.8,
    padding: 16,
  },
  modalLabel: { fontSize: 13, fontWeight: '700', marginBottom: 12 },
  modalScroll: { maxHeight: '80%', width: '100%' },
  modalScrollContent: { alignItems: 'center', justifyContent: 'center' },
  closeBtn: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    width: '60%',
    alignItems: 'center',
  },
});

