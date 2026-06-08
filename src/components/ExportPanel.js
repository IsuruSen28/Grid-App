import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal, Pressable,
  Image, Platform,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { SectionLabel, ActionButton, Divider } from './UI';
import { meshGridFromPaper, formatCellSize } from '../utils/mesh';
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
  const { cols, rows, cellWmm, cellHmm } = meshGridFromPaper(paperW, paperH, mesh);
  const hasAdj = Object.values(adj).some(v => v !== 0);
  const realW = Math.round(mmToScreenPx(paperW));
  const realH = Math.round(mmToScreenPx(paperH));

  const previewSource = previewUri ? { uri: previewUri } : null;

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: colors.surface }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <SectionLabel>Final outcome</SectionLabel>
      <View style={[styles.previewWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {previewSource ? (
          Platform.OS === 'web' ? (
            <img
              src={previewUri}
              alt="Export preview"
              style={{ width: '100%', height: 160, objectFit: 'contain', display: 'block' }}
            />
          ) : (
            <Image source={previewSource} style={styles.previewImg} resizeMode="contain" />
          )
        ) : (
          <Text style={[styles.previewEmpty, { color: colors.textDim }]}>Generating preview…</Text>
        )}
      </View>

      <View style={styles.viewBtns}>
        <TouchableOpacity
          style={[styles.viewBtn, { borderColor: colors.border, backgroundColor: colors.card }]}
          onPress={async () => {
            await onRefreshPreview?.();
            setViewMode('fullscreen');
          }}
          disabled={!previewUri}
        >
          <Text style={[styles.viewBtnText, { color: colors.text }]}>Full screen</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.viewBtn, { borderColor: colors.accent, backgroundColor: colors.card }]}
          onPress={async () => {
            await onRefreshPreview?.();
            setViewMode('realsize');
          }}
          disabled={!previewUri}
        >
          <Text style={[styles.viewBtnText, { color: colors.accent }]}>Real size</Text>
        </TouchableOpacity>
      </View>
      <Text style={[styles.realHint, { color: colors.textDim }]}>
        Real size: {paperW} × {paperH} mm on screen (~{realW} × {realH} px)
      </Text>

      <Divider />
      <SectionLabel>Save</SectionLabel>
      <ActionButton label="Share / Save PNG" variant="accent" onPress={onExport} />
      {!imageLoaded && (
        <Text style={[styles.warn, { color: colors.danger }]}>Load a photo first</Text>
      )}

      <Divider />
      <SectionLabel>Summary</SectionLabel>
      <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <InfoRow colors={colors} label="Paper" value={`${paperW} × ${paperH} mm`} />
        <InfoRow colors={colors} label="Orientation" value={orientation} />
        <InfoRow colors={colors} label="Grid" value={`${cols} × ${rows}`} />
        <InfoRow colors={colors} label="Cell" value={formatCellSize(mesh)} />
        <InfoRow colors={colors} label="Cell (mm)" value={`${cellWmm.toFixed(1)} × ${cellHmm.toFixed(1)}`} />
        <InfoRow colors={colors} label="Adjustments" value={hasAdj ? 'Yes' : 'None'} highlight={hasAdj} />
      </View>

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
        <Pressable style={styles.modalInner} onPress={e => e.stopPropagation()}>
          {mode === 'realsize' && (
            <Text style={[styles.modalLabel, { color: colors.accent }]}>
              Real size — {paperW} × {paperH} mm
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
                    : { maxWidth: '95vw', maxHeight: '85vh', objectFit: 'contain', display: 'block' }
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
          <TouchableOpacity style={[styles.closeBtn, { backgroundColor: colors.accent }]} onPress={onClose}>
            <Text style={{ color: colors.bg, fontWeight: '600' }}>Close</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function InfoRow({ label, value, highlight, colors }) {
  return (
    <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
      <Text style={[styles.infoLabel, { color: colors.textMuted }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: highlight ? colors.accent : colors.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: 14, paddingBottom: 24 },
  previewWrap: {
    borderRadius: 10,
    borderWidth: 0.5,
    minHeight: 160,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewImg: { width: '100%', height: 160 },
  previewEmpty: { padding: 40, fontSize: 13 },
  viewBtns: { flexDirection: 'row', gap: 8, marginTop: 10 },
  viewBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 0.5,
    alignItems: 'center',
  },
  viewBtnText: { fontSize: 13, fontWeight: '600' },
  realHint: { fontSize: 10, textAlign: 'center', marginTop: 6 },
  warn: { fontSize: 12, marginTop: 8, textAlign: 'center' },
  infoCard: { borderRadius: 12, borderWidth: 0.5, overflow: 'hidden' },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
  },
  infoLabel: { fontSize: 13 },
  infoValue: { fontSize: 13, fontWeight: '500' },
  modalBg: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  modalInner: { maxWidth: '96%', maxHeight: '92%', alignItems: 'center' },
  modalLabel: { fontSize: 13, fontWeight: '600', marginBottom: 10 },
  modalScroll: { maxHeight: '80%' },
  modalScrollContent: { alignItems: 'center', justifyContent: 'center' },
  closeBtn: { marginTop: 16, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8 },
});
