import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { useTheme } from '../context/ThemeContext';
import { meshColorRgba } from '../utils/mesh';
import HsvColorPicker from './HsvColorPicker';

export default function MeshColorDropUp({ mesh, onChange }) {
  const { colors } = useTheme();
  const preview = meshColorRgba(mesh);

  return (
    <View style={styles.root}>
      <View style={[styles.preview, { backgroundColor: preview, borderColor: colors.border }]} />
      <HsvColorPicker
        colorHex={mesh.colorHex || '#ffffff'}
        onChange={(hex) => onChange({ colorHex: hex })}
      />
      <View style={styles.sliderBlock}>
        <Text style={[styles.label, { color: colors.textMuted }]}>Opacity</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={100}
          step={1}
          value={mesh.colorAlpha}
          onValueChange={v => onChange({ colorAlpha: Math.round(v) })}
          minimumTrackTintColor={colors.accent}
          maximumTrackTintColor={colors.border}
          thumbTintColor={colors.accent}
        />
      </View>
      <View style={styles.sliderBlock}>
        <Text style={[styles.label, { color: colors.textMuted }]}>Line fade</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={100}
          step={1}
          value={mesh.opacity}
          onValueChange={v => onChange({ opacity: Math.round(v) })}
          minimumTrackTintColor={colors.accent}
          maximumTrackTintColor={colors.border}
          thumbTintColor={colors.accent}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: 188,
  },
  preview: {
    height: 28,
    borderRadius: 6,
    borderWidth: 0.5,
    marginBottom: 8,
  },
  sliderBlock: {
    marginBottom: 4,
  },
  label: {
    fontSize: 9,
    fontWeight: '600',
    marginBottom: 0,
  },
  slider: {
    width: '100%',
    height: 28,
  },
});
