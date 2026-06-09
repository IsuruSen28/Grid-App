import React, { useMemo, useRef, useCallback } from 'react';
import {
  View, StyleSheet, Text,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { hexToHsv, hsvToHex, hueToHex } from '../utils/color';

const SV_WIDTH = 188;
const SV_HEIGHT = 112;
const HUE_HEIGHT = 14;
const CURSOR = 14;

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

export default function HsvColorPicker({ colorHex, onChange }) {
  const { colors } = useTheme();
  const hsv = useMemo(() => hexToHsv(colorHex), [colorHex]);
  const hueColor = useMemo(() => hueToHex(hsv.h), [hsv.h]);

  const hsvRef = useRef(hsv);
  hsvRef.current = hsv;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const pickSvEvent = useCallback((e) => {
    const { locationX, locationY } = e.nativeEvent;
    const s = clamp(locationX / SV_WIDTH, 0, 1);
    const v = clamp(1 - locationY / SV_HEIGHT, 0, 1);
    onChangeRef.current(hsvToHex(hsvRef.current.h, s, v));
  }, []);

  const pickHueEvent = useCallback((e) => {
    const { locationX } = e.nativeEvent;
    const h = clamp(locationX / SV_WIDTH, 0, 1) * 360;
    onChangeRef.current(hsvToHex(h, hsvRef.current.s, hsvRef.current.v));
  }, []);

  const svHandlers = useDragResponder(pickSvEvent);
  const hueHandlers = useDragResponder(pickHueEvent);

  const svX = hsv.s * SV_WIDTH;
  const svY = (1 - hsv.v) * SV_HEIGHT;
  const hueX = (hsv.h / 360) * SV_WIDTH;

  return (
    <View style={styles.root}>
      <View
        style={[styles.svBox, { borderColor: colors.border }]}
        {...svHandlers}
      >
        <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: hueColor }]} />
        <LinearGradient
          pointerEvents="none"
          colors={['#ffffff', 'rgba(255,255,255,0)']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
        <LinearGradient
          pointerEvents="none"
          colors={['rgba(0,0,0,0)', '#000000']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View
          pointerEvents="none"
          style={[
            styles.cursor,
            {
              left: clamp(svX - CURSOR / 2, 0, SV_WIDTH - CURSOR),
              top: clamp(svY - CURSOR / 2, 0, SV_HEIGHT - CURSOR),
              borderColor: colors.bg,
            },
          ]}
        />
      </View>

      <View
        style={[styles.hueBox, { borderColor: colors.border }]}
        {...hueHandlers}
      >
        <LinearGradient
          pointerEvents="none"
          colors={['#ff0000', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#ff00ff', '#ff0000']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
        <View
          pointerEvents="none"
          style={[
            styles.hueCursor,
            {
              left: clamp(hueX - 3, 0, SV_WIDTH - 6),
              borderColor: colors.bg,
            },
          ]}
        />
      </View>

      <Text style={[styles.hexLabel, { color: colors.textMuted }]}>{colorHex.toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: SV_WIDTH,
  },
  svBox: {
    width: SV_WIDTH,
    height: SV_HEIGHT,
    borderRadius: 8,
    borderWidth: 0.5,
    overflow: 'hidden',
    marginBottom: 8,
  },
  hueBox: {
    width: SV_WIDTH,
    height: HUE_HEIGHT,
    borderRadius: 0,
    borderWidth: 0.5,
    overflow: 'hidden',
    marginBottom: 6,
  },
  cursor: {
    position: 'absolute',
    width: CURSOR,
    height: CURSOR,
    borderRadius: CURSOR / 2,
    borderWidth: 2,
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.35,
    shadowRadius: 2,
  },
  hueCursor: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 6,
    borderRadius: 0,
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  hexLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
    textAlign: 'center',
    marginBottom: 4,
  },
});
