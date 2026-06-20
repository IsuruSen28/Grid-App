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
          paddingHorizontal: 14,
          paddingVertical: 8,
          borderRadius: 20, // Capsule styled pill buttons
          borderWidth: 0.8,
          borderColor: active ? colors.accent : colors.border,
          backgroundColor: active ? colors.accent : colors.card,
          alignItems: 'center',
          justifyContent: 'center',
          ...colors.shadow,
          shadowOpacity: active ? 0.15 : 0.05,
        },
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={{ fontSize: 12, fontWeight: active ? '700' : '500', color: active ? colors.bg : colors.textMuted }}>
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
          paddingHorizontal: 20,
          borderRadius: 10,
          borderWidth: 0.8,
          borderColor: isDanger ? colors.danger : isAccent ? colors.accent : colors.border,
          backgroundColor: isAccent ? colors.accent : isDanger ? 'transparent' : colors.card,
          alignItems: 'center',
          justifyContent: 'center',
          ...colors.shadow,
          shadowOpacity: isAccent ? 0.25 : 0.05,
        },
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Text style={{ fontSize: 13, fontWeight: '700', letterSpacing: 0.5, color: isAccent ? colors.bg : isDanger ? colors.danger : colors.text }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export function Divider() {
  const { colors } = useTheme();
  return <View style={{ height: 0.8, backgroundColor: colors.border, marginVertical: 14, opacity: 0.6 }} />;
}

export function Icon({ name, size = 18, color, style }) {
  const { colors } = useTheme();
  const iconColor = color || colors.text;

  switch (name) {
    case 'chevron-left':
      return (
        <View style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }, style]}>
          <View style={{
            width: size * 0.4,
            height: size * 0.4,
            borderLeftWidth: 2,
            borderTopWidth: 2,
            borderColor: iconColor,
            transform: [{ rotate: '-45deg' }],
            marginLeft: size * 0.15,
          }} />
        </View>
      );
    case 'menu':
      return (
        <View style={[{ width: size, height: size, justifyContent: 'space-between', paddingVertical: size * 0.2 }, style]}>
          <View style={{ height: 2, backgroundColor: iconColor, borderRadius: 1 }} />
          <View style={{ height: 2, backgroundColor: iconColor, borderRadius: 1, width: '80%', alignSelf: 'flex-start' }} />
          <View style={{ height: 2, backgroundColor: iconColor, borderRadius: 1 }} />
        </View>
      );
    case 'close':
      return (
        <View style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }, style]}>
          <View style={{ position: 'absolute', width: size * 0.8, height: 2, backgroundColor: iconColor, transform: [{ rotate: '45deg' }], borderRadius: 1 }} />
          <View style={{ position: 'absolute', width: size * 0.8, height: 2, backgroundColor: iconColor, transform: [{ rotate: '-45deg' }], borderRadius: 1 }} />
        </View>
      );
    case 'plus':
      return (
        <View style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }, style]}>
          <View style={{ position: 'absolute', width: size * 0.7, height: 2, backgroundColor: iconColor, borderRadius: 1 }} />
          <View style={{ position: 'absolute', height: size * 0.7, width: 2, backgroundColor: iconColor, borderRadius: 1 }} />
        </View>
      );
    case 'minus':
      return (
        <View style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }, style]}>
          <View style={{ width: size * 0.7, height: 2, backgroundColor: iconColor, borderRadius: 1 }} />
        </View>
      );
    case 'grid':
      return (
        <View style={[{ width: size, height: size, justifyContent: 'space-between', padding: 2 }, style]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', flex: 1, marginBottom: 2 }}>
            <View style={{ width: '45%', backgroundColor: 'transparent', borderWidth: 1.5, borderColor: iconColor, borderRadius: 1.5 }} />
            <View style={{ width: '45%', backgroundColor: 'transparent', borderWidth: 1.5, borderColor: iconColor, borderRadius: 1.5 }} />
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', flex: 1 }}>
            <View style={{ width: '45%', backgroundColor: 'transparent', borderWidth: 1.5, borderColor: iconColor, borderRadius: 1.5 }} />
            <View style={{ width: '45%', backgroundColor: 'transparent', borderWidth: 1.5, borderColor: iconColor, borderRadius: 1.5 }} />
          </View>
        </View>
      );
    case 'crop':
      return (
        <View style={[{ width: size, height: size, padding: 2, position: 'relative' }, style]}>
          <View style={{ position: 'absolute', top: 5, left: 5, right: 1, bottom: 1, borderWidth: 1.5, borderColor: iconColor, borderTopWidth: 0, borderLeftWidth: 0, borderBottomRightRadius: 1 }} />
          <View style={{ position: 'absolute', top: 1, left: 1, right: 5, bottom: 5, borderWidth: 1.5, borderColor: iconColor, borderBottomWidth: 0, borderRightWidth: 0, borderTopLeftRadius: 1 }} />
        </View>
      );
    case 'sliders':
      return (
        <View style={[{ width: size, height: size, justifyContent: 'space-between', paddingVertical: 1, paddingHorizontal: 2 }, style]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', height: '25%', position: 'relative' }}>
            <View style={{ flex: 1, height: 1.5, backgroundColor: iconColor, opacity: 0.4 }} />
            <View style={{ position: 'absolute', left: '20%', width: 5, height: 5, borderRadius: 2.5, backgroundColor: iconColor }} />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', height: '25%', position: 'relative' }}>
            <View style={{ flex: 1, height: 1.5, backgroundColor: iconColor, opacity: 0.4 }} />
            <View style={{ position: 'absolute', left: '70%', width: 5, height: 5, borderRadius: 2.5, backgroundColor: iconColor }} />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', height: '25%', position: 'relative' }}>
            <View style={{ flex: 1, height: 1.5, backgroundColor: iconColor, opacity: 0.4 }} />
            <View style={{ position: 'absolute', left: '45%', width: 5, height: 5, borderRadius: 2.5, backgroundColor: iconColor }} />
          </View>
        </View>
      );
    case 'download':
      return (
        <View style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 1 }, style]}>
          <View style={{ position: 'absolute', top: 1, width: 2, height: size * 0.55, backgroundColor: iconColor, borderRadius: 1 }} />
          <View style={{ position: 'absolute', top: size * 0.28, width: size * 0.3, height: size * 0.3, borderRightWidth: 2, borderBottomWidth: 2, borderColor: iconColor, transform: [{ rotate: '45deg' }] }} />
          <View style={{ width: size * 0.85, height: size * 0.25, borderWidth: 1.5, borderTopWidth: 0, borderColor: iconColor, borderBottomLeftRadius: 1.5, borderBottomRightRadius: 1.5 }} />
        </View>
      );
    case 'trash':
      return (
        <View style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }, style]}>
          <View style={{ width: size * 0.7, height: 2, backgroundColor: iconColor, borderRadius: 1, marginBottom: 1 }} />
          <View style={{ width: size * 0.3, height: 1.5, backgroundColor: iconColor, borderTopLeftRadius: 1, borderTopRightRadius: 1, position: 'absolute', top: 1 }} />
          <View style={{ width: size * 0.5, height: size * 0.55, borderWidth: 1.5, borderColor: iconColor, borderTopWidth: 0, borderBottomLeftRadius: 1.5, borderBottomRightRadius: 1.5, justifyContent: 'space-around', flexDirection: 'row', paddingHorizontal: 1 }}>
            <View style={{ width: 1, height: '70%', backgroundColor: iconColor, opacity: 0.6, marginTop: '15%' }} />
            <View style={{ width: 1, height: '70%', backgroundColor: iconColor, opacity: 0.6, marginTop: '15%' }} />
          </View>
        </View>
      );
    default:
      return null;
  }
}

const centeredStyles = StyleSheet.create({
  slider: { flex: 1, height: 32 },
});

const sliderRowStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 }, // slightly larger margins for editor layout
  label: { width: 88, fontSize: 12, fontWeight: '500' },
  slider: { flex: 1, height: 32 },
  value: { width: 42, textAlign: 'right', fontSize: 12, fontWeight: '600', fontVariant: ['tabular-nums'] },
});

