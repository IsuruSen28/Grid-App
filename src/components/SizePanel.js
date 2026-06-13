import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { PAPER_SIZES, COLORS } from '../constants';
import { useTheme } from '../context/ThemeContext';
import { CenteredSlider } from './UI';
import DropUpMenu from './DropUpMenu';
import { clampScale } from '../utils/canvas';

const PAPER_ENTRIES = Object.entries(PAPER_SIZES);

function activeChipBg(colors) {
  return colors.bg === '#0f0f0f' ? 'rgba(232,213,163,0.12)' : 'rgba(138,115,64,0.14)';
}

export default function SizePanel({
  paperKey,
  setPaperKey,
  paperW,
  paperH,
  setPaper,
  orientation,
  setOrientation,
  customW,
  customH,
  setCustomW,
  setCustomH,
  photoTransform,
  setPhotoTransform,
  registerMenu,
}) {
  const { colors } = useTheme();
  const [paperOpen, setPaperOpen] = useState(false);
  const [localW, setLocalW] = useState(String(customW));
  const [localH, setLocalH] = useState(String(customH));

  const paperLabel = PAPER_SIZES[paperKey]?.label ?? paperKey;
  const updateTransform = (key, val) => setPhotoTransform(prev => ({ ...prev, [key]: val }));

  const selectPaper = (key, val) => {
    setPaperKey(key);
    if (key !== 'Custom') {
      setPaper(val.width, val.height);
      setPaperOpen(false);
    }
  };

  React.useEffect(() => {
    if (typeof registerMenu === 'function') registerMenu(paperOpen, () => setPaperOpen(false));
    return () => { if (typeof registerMenu === 'function') registerMenu(false, null); };
  }, [paperOpen]);

  const applyCustom = () => {
    const w = parseInt(localW, 10) || 200;
    const h = parseInt(localH, 10) || 200;
    setCustomW(w);
    setCustomH(h);
    setPaper(w, h);
    setPaperOpen(false);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.surface }]}>
      <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Transform</Text>
      <View style={styles.row}>
        <View style={styles.sliderGroup}>
          <Text style={[styles.miniLabel, { color: colors.textMuted }]}>Rotate</Text>
          <CenteredSlider
            style={styles.slider}
            value={photoTransform.rotation ?? 0}
            min={-45}
            max={45}
            step={1}
            onChange={v => updateTransform('rotation', v)}
            colors={colors}
          />
          <Text style={[styles.miniVal, { color: colors.accent }]}>{Math.round(photoTransform.rotation ?? 0)}°</Text>
        </View>
        <View style={styles.sliderGroup}>
          <Text style={[styles.miniLabel, { color: colors.textMuted }]}>Scale</Text>
          <Slider
            style={styles.slider}
            minimumValue={0.5}
            maximumValue={3}
            step={0.05}
            value={photoTransform.scale ?? 1}
            onValueChange={v => updateTransform('scale', clampScale(v))}
            minimumTrackTintColor={colors.accent}
            maximumTrackTintColor={colors.border}
            thumbTintColor={colors.accent}
          />
          <Text style={[styles.miniVal, { color: colors.accent }]}>{(photoTransform.scale ?? 1).toFixed(1)}×</Text>
        </View>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Page & orientation</Text>
      <View style={[styles.row, styles.rowLast]}>
        <View style={styles.paperAnchor}>
          <TouchableOpacity style={[styles.paperBtn, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => setPaperOpen(o => !o)}>
            <Text style={[styles.paperBtnLabel, { color: colors.textMuted }]}>Page</Text>
            <Text style={[styles.paperBtnValue, { color: colors.text }]}>{paperLabel}  ▴</Text>
          </TouchableOpacity>
          <DropUpMenu open={paperOpen} onClose={() => setPaperOpen(false)} align="pageSize" width={160}>
            <View style={styles.paperGrid}>
              {PAPER_ENTRIES.map(([key, val]) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.paperCell,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                    paperKey === key && { borderColor: colors.accent, backgroundColor: activeChipBg(colors) },
                  ]}
                  onPress={() => selectPaper(key, val)}
                >
                  <Text style={[styles.paperCellText, { color: colors.text }, paperKey === key && { color: colors.accent, fontWeight: '700' }]}>
                    {val.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {paperKey === 'Custom' && (
              <View style={styles.customRow}>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                  value={localW}
                  onChangeText={setLocalW}
                  keyboardType="number-pad"
                  placeholder="W"
                  placeholderTextColor={colors.textDim}
                />
                <Text style={[styles.customX, { color: colors.textMuted }]}>×</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                  value={localH}
                  onChangeText={setLocalH}
                  keyboardType="number-pad"
                  placeholder="H"
                  placeholderTextColor={colors.textDim}
                />
                <TouchableOpacity style={[styles.applyBtn, { backgroundColor: colors.accent }]} onPress={applyCustom}>
                  <Text style={[styles.applyText, { color: colors.bg }]}>OK</Text>
                </TouchableOpacity>
              </View>
            )}
          </DropUpMenu>
        </View>

        <TouchableOpacity
          style={[
            styles.orientBtn,
            { backgroundColor: colors.card, borderColor: colors.border },
            orientation === 'portrait' && { backgroundColor: colors.accent, borderColor: colors.accent },
          ]}
          onPress={() => setOrientation('portrait')}
        >
          <Text style={[styles.orientText, { color: colors.textMuted }, orientation === 'portrait' && { color: colors.bg }]}>Portrait</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.orientBtn,
            { backgroundColor: colors.card, borderColor: colors.border },
            orientation === 'landscape' && { backgroundColor: colors.accent, borderColor: colors.accent },
          ]}
          onPress={() => setOrientation('landscape')}
        >
          <Text style={[styles.orientText, { color: colors.textMuted }, orientation === 'landscape' && { color: colors.bg }]}>Landscape</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 6,
    paddingBottom: 8,
    backgroundColor: COLORS.surface,
    overflow: 'visible',
    zIndex: 1,
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    marginBottom: 6,
    gap: 6,
  },
  rowLast: {
    marginBottom: 0,
  },
  sliderGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 6,
    minHeight: 36,
  },
  miniLabel: {
    width: 38,
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  slider: {
    flex: 1,
    height: 36,
    minWidth: 60,
  },
  miniVal: {
    width: 32,
    fontSize: 10,
    color: COLORS.accent,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
  paperAnchor: {
    width: 160,
    position: 'relative',
    zIndex: 10,
  },
  paperBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.card,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: COLORS.border,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  paperBtnLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  paperBtnValue: {
    flex: 1,
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '500',
  },
  paperGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  paperCell: {
    width: '47%',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 6,
    backgroundColor: COLORS.surface,
    borderWidth: 0.5,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  paperCellActive: {
    borderColor: COLORS.accent,
    backgroundColor: 'rgba(232,213,163,0.12)',
  },
  paperCellText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.text,
  },
  paperCellTextActive: {
    color: COLORS.accent,
    fontWeight: '700',
  },
  customRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: COLORS.border,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderWidth: 0.5,
    borderColor: COLORS.border,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    color: COLORS.text,
    fontSize: 13,
    minWidth: 40,
  },
  customX: { color: COLORS.textMuted, fontSize: 12 },
  applyBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  applyText: {
    color: COLORS.bg,
    fontWeight: '600',
    fontSize: 12,
  },
  orientBtn: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  orientBtnActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  orientText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  orientTextActive: {
    color: COLORS.bg,
  },
});
