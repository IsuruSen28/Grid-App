import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { SectionLabel, SliderRow, ActionButton } from './UI';

const PRESETS = [
  { label: 'Original', adj: { brightness: 0, contrast: 0, saturation: 0, blur: 0, grayscale: 0, sepia: 0 } },
  { label: 'Grayscale', adj: { brightness: 0, contrast: 10, saturation: -100, blur: 0, grayscale: 100, sepia: 0 } },
  { label: 'Contrast', adj: { brightness: -5, contrast: 60, saturation: -20, blur: 0, grayscale: 0, sepia: 0 } },
  { label: 'Sketch', adj: { brightness: 10, contrast: 40, saturation: -100, blur: 0, grayscale: 100, sepia: 0 } },
  { label: 'Warm', adj: { brightness: 5, contrast: 10, saturation: 20, blur: 0, grayscale: 0, sepia: 30 } },
  { label: 'Soft', adj: { brightness: 15, contrast: -20, saturation: -10, blur: 0.5, grayscale: 0, sepia: 0 } },
];

export default function AdjustPanel({ adj, setAdj }) {
  const { colors } = useTheme();
  const update = (key, val) => setAdj(prev => ({ ...prev, [key]: val }));
  const reset = () => setAdj({ brightness: 0, contrast: 0, saturation: 0, blur: 0, grayscale: 0, sepia: 0 });

  return (
    <ScrollView style={[styles.root, { backgroundColor: colors.surface }]} showsVerticalScrollIndicator={false}>
      <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Presets</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetScroll} contentContainerStyle={styles.presetRow}>
        {PRESETS.map(p => (
          <TouchableOpacity
            key={p.label}
            style={[styles.preset, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => setAdj(p.adj)}
          >
            <Text style={[styles.presetText, { color: colors.text }]}>{p.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Light & tone</Text>
      <SliderRow label="Brightness" value={adj.brightness} min={-100} max={100} centered onChange={v => update('brightness', v)} />
      <SliderRow label="Contrast" value={adj.contrast} min={-100} max={100} centered onChange={v => update('contrast', v)} />

      <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Color</Text>
      <SliderRow label="Saturation" value={adj.saturation} min={-100} max={100} centered onChange={v => update('saturation', v)} />
      <SliderRow label="Grayscale" value={adj.grayscale} min={0} max={100} unit="%" onChange={v => update('grayscale', v)} />

      <View style={styles.resetRow}>
        <ActionButton label="Reset" onPress={reset} style={{ flex: 1 }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 6,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
    marginTop: 4,
  },
  presetScroll: { marginBottom: 6, flexGrow: 0 },
  presetRow: { gap: 8, paddingRight: 8 },
  preset: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 0.5,
  },
  presetText: { fontSize: 12, fontWeight: '500' },
  resetRow: { marginTop: 4 },
});
