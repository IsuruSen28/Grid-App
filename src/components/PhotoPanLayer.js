import React, { useRef, useMemo } from 'react';
import { View, Text, PanResponder, StyleSheet } from 'react-native';
import { COLORS } from '../constants';
import { clampPanOffset } from '../utils/canvas';

export default function PhotoPanLayer({ width, height, enabled, transform, onPanChange }) {
  const transformRef = useRef(transform);
  transformRef.current = transform;
  const panStart = useRef({ offsetX: 0, offsetY: 0 });

  const panResponder = useMemo(
    () => PanResponder.create({
      onStartShouldSetPanResponder: () => enabled,
      onMoveShouldSetPanResponder: () => enabled,
      onPanResponderGrant: () => {
        panStart.current = {
          offsetX: transformRef.current.offsetX,
          offsetY: transformRef.current.offsetY,
        };
      },
      onPanResponderMove: (_, g) => {
        const dx = g.dx / Math.max(width, 1);
        const dy = g.dy / Math.max(height, 1);
        const next = clampPanOffset(
          panStart.current.offsetX - dx * 1.2,
          panStart.current.offsetY - dy * 1.2,
        );
        onPanChange(next);
      },
    }),
    [enabled, width, height, onPanChange],
  );

  if (!enabled) return null;

  return (
    <View style={[StyleSheet.absoluteFill, { width, height }]} {...panResponder.panHandlers}>
      <View style={styles.hint} pointerEvents="none">
        {/* <Text style={styles.hintText}>Drag to move photo</Text> */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hint: {
    position: 'absolute',
    bottom: 8,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  hintText: {
    fontSize: 10,
    color: COLORS.textDim,
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    overflow: 'hidden',
  },
});
