import React, { useState, useRef, useCallback } from 'react';
import { View, Text, PanResponder, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants';

const HANDLE_SIZE = 22;
const MIN_SIZE = 40;

export default function CropOverlay({ width, height, crop, onCropChange, onDone, onReset }) {
  // crop is in pixel coords relative to this view
  const [box, setBox] = useState({
    x: crop.x * width,
    y: crop.y * height,
    w: crop.width * width,
    h: crop.height * height,
  });
  const boxRef = useRef(box);
  boxRef.current = box;

  const clampBox = (b) => {
    const x = Math.max(0, Math.min(b.x, width - MIN_SIZE));
    const y = Math.max(0, Math.min(b.y, height - MIN_SIZE));
    const w = Math.max(MIN_SIZE, Math.min(b.w, width - x));
    const h = Math.max(MIN_SIZE, Math.min(b.h, height - y));
    return { x, y, w, h };
  };

  const emit = (b) => {
    onCropChange({
      x: b.x / width,
      y: b.y / height,
      width: b.w / width,
      height: b.h / height,
    });
  };

  const makePan = (onMove) => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (_, g) => {
      const next = clampBox(onMove(boxRef.current, g.dx, g.dy));
      setBox(next);
      emit(next);
    },
  });

  // Body drag
  const bodyPan = useRef(makePan((b, dx, dy) => ({
    x: b.x + dx, y: b.y + dy, w: b.w, h: b.h,
  }))).current;

  // Corner handles
  const tlPan = useRef(makePan((b, dx, dy) => ({
    x: b.x + dx, y: b.y + dy, w: b.w - dx, h: b.h - dy,
  }))).current;
  const trPan = useRef(makePan((b, dx, dy) => ({
    x: b.x, y: b.y + dy, w: b.w + dx, h: b.h - dy,
  }))).current;
  const blPan = useRef(makePan((b, dx, dy) => ({
    x: b.x + dx, y: b.y, w: b.w - dx, h: b.h + dy,
  }))).current;
  const brPan = useRef(makePan((b, dx, dy) => ({
    x: b.x, y: b.y, w: b.w + dx, h: b.h + dy,
  }))).current;

  const { x, y, w, h } = box;
  const hs = HANDLE_SIZE;
  const hh = hs / 2;

  return (
    <View style={[StyleSheet.absoluteFill, { width, height }]} pointerEvents="box-none">
      {/* Dark overlay outside crop */}
      <View style={[styles.shade, { top: 0, left: 0, right: 0, height: y }]} />
      <View style={[styles.shade, { top: y + h, left: 0, right: 0, bottom: 0 }]} />
      <View style={[styles.shade, { top: y, left: 0, width: x, height: h }]} />
      <View style={[styles.shade, { top: y, left: x + w, right: 0, height: h }]} />

      {/* Crop box border */}
      <View
        style={[styles.cropBox, { left: x, top: y, width: w, height: h }]}
        {...bodyPan.panHandlers}
      >
        {/* Rule of thirds lines */}
        <View style={[styles.thirdLine, { left: w / 3, top: 0, width: 0.5, height: '100%' }]} />
        <View style={[styles.thirdLine, { left: (w / 3) * 2, top: 0, width: 0.5, height: '100%' }]} />
        <View style={[styles.thirdLine, { top: h / 3, left: 0, height: 0.5, width: '100%' }]} />
        <View style={[styles.thirdLine, { top: (h / 3) * 2, left: 0, height: 0.5, width: '100%' }]} />
      </View>

      {/* Corner handles */}
      <View style={[styles.handle, styles.handleCorner, { left: x - hh, top: y - hh }]} {...tlPan.panHandlers} />
      <View style={[styles.handle, styles.handleCorner, { left: x + w - hh, top: y - hh }]} {...trPan.panHandlers} />
      <View style={[styles.handle, styles.handleCorner, { left: x - hh, top: y + h - hh }]} {...blPan.panHandlers} />
      <View style={[styles.handle, styles.handleCorner, { left: x + w - hh, top: y + h - hh }]} {...brPan.panHandlers} />

      {/* Dimension label */}
      <View style={[styles.dimLabel, { left: x + w / 2 - 36, top: y + h + 6 }]}>
        <Text style={styles.dimText}>
          {Math.round((w / width) * 100)}% × {Math.round((h / height) * 100)}%
        </Text>
      </View>

      {/* Action buttons */}
      <View style={[styles.actions, { top: y - 44, left: x }]}>
        <TouchableOpacity style={styles.cropBtn} onPress={onReset}>
          <Text style={styles.cropBtnText}>Reset</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.cropBtn, styles.cropBtnDone]} onPress={onDone}>
          <Text style={[styles.cropBtnText, { color: COLORS.bg }]}>Done</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shade: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  cropBox: {
    position: 'absolute',
    borderWidth: 1.5,
    borderColor: COLORS.accent,
  },
  thirdLine: {
    position: 'absolute',
    backgroundColor: 'rgba(232,213,163,0.3)',
  },
  handle: {
    position: 'absolute',
    width: HANDLE_SIZE,
    height: HANDLE_SIZE,
    backgroundColor: COLORS.accent,
    borderRadius: 3,
  },
  handleCorner: {},
  dimLabel: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    width: 72,
  },
  dimText: {
    color: COLORS.accent,
    fontSize: 10,
    fontVariant: ['tabular-nums'],
    textAlign: 'center',
  },
  actions: {
    position: 'absolute',
    flexDirection: 'row',
    gap: 8,
  },
  cropBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: COLORS.accent,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  cropBtnDone: {
    backgroundColor: COLORS.accent,
  },
  cropBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.accent,
  },
});
