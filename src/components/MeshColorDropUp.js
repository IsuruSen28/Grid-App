import React, { useMemo, useRef, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { meshColorRgba } from '../utils/mesh';
import { hexToRgb } from '../utils/color';
import HsvColorPicker from './HsvColorPicker';

const BAR_WIDTH = 188;
const PREVIEW_HEIGHT = 20;
const OPACITY_CURSOR_HEIGHT = 32;

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function useDragResponder(getPick) {
  const pickRef = useRef(getPick);
  pickRef.current = getPick;

  return useMemo(() => ({
    onStartShouldSetResponder: () => true,
    onMoveShouldSetResponder: () => true,
    onResponderTerminationRequest: () => false,
    onResponderGrant: (e) => pickRef.current(e),
    onResponderMove: (e) => pickRef.current(e),
  }), []);
}

function Checkerboard({ light, dark }) {
  const tiles = [];
  const cols = Math.ceil(BAR_WIDTH / 8);
  const rows = Math.ceil(PREVIEW_HEIGHT / 8);
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      tiles.push(
        <View
          key={`${row}-${col}`}
          style={{
            width: 8,
            height: 8,
            backgroundColor: (row + col) % 2 === 0 ? light : dark,
          }}
        />,
      );
    }
  }
  return <View style={styles.checkerboard}>{tiles}</View>;
}

export default function MeshColorDropUp({ mesh, onChange }) {
  const { colors } = useTheme();
  const hex = mesh.colorHex || '#ffffff';
  const opacity = mesh.opacity ?? 50;
  const preview = meshColorRgba(mesh);
  const { r, g, b } = hexToRgb(hex);

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const opacityRef = useRef(opacity);
  opacityRef.current = opacity;

  const pickOpacity = useCallback((e) => {
    const { locationX } = e.nativeEvent;
    const next = Math.round(clamp(locationX / BAR_WIDTH, 0, 1) * 100);
    onChangeRef.current({ opacity: next });
  }, []);

  const opacityHandlers = useDragResponder(pickOpacity);
  const opacityX = (opacity / 100) * BAR_WIDTH;

  return (
    <View style={styles.root}>
      <View style={[styles.previewBox, { borderColor: colors.border }]}>
        <Checkerboard light={colors.card} dark={colors.border} />
        <View pointerEvents="none" style={[styles.previewFill, { backgroundColor: preview }]} />
        <View
          style={[styles.opacityBar, { borderColor: colors.border }]}
          {...opacityHandlers}
        >
          <LinearGradient
            pointerEvents="none"
            colors={[`rgba(${r},${g},${b},0)`, hex]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={StyleSheet.absoluteFill}
          />
          <View
            pointerEvents="none"
            style={[
              styles.opacityCursor,
              {
                left: clamp(opacityX - 3, 0, BAR_WIDTH - 6),
                borderColor: colors.bg,
              },
            ]}
          />
        </View>
        <Text pointerEvents="none" style={[styles.opacityLabel, { color: colors.text }]}>
          {opacity}%
        </Text>
      </View>

      <HsvColorPicker
        colorHex={hex}
        onChange={(nextHex) => onChange({ colorHex: nextHex })}
      />

      <View style={styles.sliderBlock}>
        <Text style={[styles.label, { color: colors.textMuted }]}>Line width</Text>
        <Slider
          style={styles.slider}
          minimumValue={0.01}
          maximumValue={1}
          step={0.01}
          value={mesh.lineWidth}
          onValueChange={v => onChange({ lineWidth: Math.max(0, v) })}
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
    width: BAR_WIDTH,
  },
  previewBox: {
    width: BAR_WIDTH,
    height: PREVIEW_HEIGHT,
    borderRadius: 8,
    borderWidth: 0.5,
    overflow: 'hidden',
    marginBottom: 8,
  },
  checkerboard: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  previewFill: {
    ...StyleSheet.absoluteFillObject,
  },
  opacityBar: {
    position: 'absolute',
    width: BAR_WIDTH,
    height: PREVIEW_HEIGHT,
    borderRadius: 0,
    borderWidth: 0.5,
    overflow: 'hidden',
  },
  opacityCursor: {
    position: 'absolute',
    top: 0,
    bottom: 1,
    width: 6,
    height: OPACITY_CURSOR_HEIGHT,
    borderRadius: 0,
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  opacityLabel: {
    position: 'absolute',
    top: 4,
    right: 6,
    fontSize: 10,
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
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
