import React, { useRef, useMemo, useCallback } from 'react';
import { View, PanResponder, StyleSheet, Platform } from 'react-native';
import { clampPanOffset, clampScale } from '../utils/canvas';

function touchDistance(touches) {
  if (touches.length < 2) return 0;
  const [a, b] = touches;
  return Math.hypot(a.pageX - b.pageX, a.pageY - b.pageY);
}

export default function SizeTransformLayer({
  width,
  height,
  enabled,
  transform,
  onTransformChange,
}) {
  const transformRef = useRef(transform);
  transformRef.current = transform;

  const panStart = useRef({ offsetX: 0, offsetY: 0 });
  const pinchStart = useRef(null);

  const emit = useCallback((patch) => {
    onTransformChange(patch);
  }, [onTransformChange]);

  const photoPan = useMemo(
    () => PanResponder.create({
      onStartShouldSetPanResponder: () => enabled,
      onMoveShouldSetPanResponder: (_, g) => enabled && Math.abs(g.dx) + Math.abs(g.dy) > 2,
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
          panStart.current.offsetX + dx * -1.2,
          panStart.current.offsetY + dy * -1.2,
        );
        emit(next);
      },
    }),
    [enabled, width, height, emit],
  );

  const handleTouchStart = useCallback((e) => {
    const touches = e.nativeEvent.touches;
    if (touches?.length >= 2) {
      pinchStart.current = {
        dist: touchDistance(touches),
        scale: transformRef.current.scale ?? 1,
      };
    }
  }, []);

  const handleTouchMove = useCallback((e) => {
    const touches = e.nativeEvent.touches;
    if (!pinchStart.current || touches?.length < 2) return;
    const dist = touchDistance(touches);
    if (dist < 1 || pinchStart.current.dist < 1) return;
    const nextScale = clampScale(pinchStart.current.scale * (dist / pinchStart.current.dist));
    emit({ scale: nextScale });
  }, [emit]);

  const handleTouchEnd = useCallback(() => {
    pinchStart.current = null;
  }, []);

  const handleWheel = useCallback((e) => {
    if (!enabled) return;
    e.preventDefault?.();
    const delta = e.nativeEvent?.deltaY ?? e.deltaY ?? 0;
    const next = clampScale((transformRef.current.scale ?? 1) - delta * 0.002);
    emit({ scale: next });
  }, [enabled, emit]);

  if (!enabled) return null;

  return (
    <View
      style={[StyleSheet.absoluteFill, { width, height }]}
      {...photoPan.panHandlers}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      {...(Platform.OS === 'web' ? { onWheel: handleWheel } : {})}
    />
  );
}
