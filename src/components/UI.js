import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { useTheme } from '../context/ThemeContext';

export function SectionLabel({ children, style }) {
  const { colors } = useTheme();
  return (
    <Text style={[{ fontSize: 10, fontWeight: '600', letterSpacing: 1.2, textTransform: 'uppercase', color: colors.textMuted, marginBottom: 10, marginTop: 4 }, style]}>
      {children}
    </Text>
  );
}

/** Slider mapped 0…range so the thumb sits in the middle when value is 0 (or range midpoint). */
export function CenteredSlider({
  value,
  min,
  max,
  step = 1,
  onChange,
  style,
  colors: colorsProp,
}) {
  const { colors: themeColors } = useTheme();
  const colors = colorsProp || themeColors;
  const range = max - min;
  const normalized = Math.max(0, Math.min(range, value - min));

  return (
    <Slider
      style={[centeredStyles.slider, style]}
      minimumValue={0}
      maximumValue={range}
      step={step}
      value={normalized}
      onValueChange={v => onChange(v + min)}
      minimumTrackTintColor={colors.accent}
      maximumTrackTintColor={colors.border}
      thumbTintColor={colors.accent}
    />
  );
}

export function SliderRow({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange,
  decimals = 0,
  centered = false,
}) {
  const { colors } = useTheme();
  const display = decimals > 0 ? value.toFixed(decimals) : Math.round(value);
  const isBipolar = centered || (min < 0 && max > 0);

  return (
    <View style={sliderRowStyles.row}>
      <Text style={[sliderRowStyles.label, { color: colors.textMuted }]}>{label}</Text>
      {isBipolar ? (
        <CenteredSlider
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={onChange}
          colors={colors}
        />
      ) : (
        <Slider
          style={sliderRowStyles.slider}
          minimumValue={min}
          maximumValue={max}
          step={step}
          value={value}
          onValueChange={onChange}
          minimumTrackTintColor={colors.accent}
          maximumTrackTintColor={colors.border}
          thumbTintColor={colors.accent}
        />
      )}
      <Text style={[sliderRowStyles.value, { color: colors.text }]}>{display}{unit}</Text>
    </View>
  );
}

export function PillButton({ label, active, onPress, style }) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      style={[
        {
          paddingHorizontal: 12,
          paddingVertical: 7,
          borderRadius: 8,
          borderWidth: 0.5,
          borderColor: active ? colors.accent : colors.border,
          backgroundColor: active ? colors.accent : colors.card,
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={{ fontSize: 12, fontWeight: '500', color: active ? colors.bg : colors.textMuted }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export function ActionButton({ label, onPress, variant = 'default', style }) {
  const { colors } = useTheme();
  const isAccent = variant === 'accent';
  const isDanger = variant === 'danger';
  return (
    <TouchableOpacity
      style={[
        {
          paddingVertical: 12,
          paddingHorizontal: 16,
          borderRadius: 10,
          borderWidth: 0.5,
          borderColor: isDanger ? colors.danger : isAccent ? colors.accent : colors.border,
          backgroundColor: isAccent ? colors.accent : colors.card,
          alignItems: 'center',
        },
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Text style={{ fontSize: 14, fontWeight: '500', color: isAccent ? colors.bg : colors.text }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export function Divider() {
  const { colors } = useTheme();
  return <View style={{ height: 0.5, backgroundColor: colors.border, marginVertical: 12 }} />;
}

const centeredStyles = StyleSheet.create({
  slider: { flex: 1, height: 32 },
});

const sliderRowStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  label: { width: 88, fontSize: 13 },
  slider: { flex: 1, height: 32 },
  value: { width: 42, textAlign: 'right', fontSize: 13, fontVariant: ['tabular-nums'] },
});
