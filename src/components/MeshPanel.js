import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { SliderRow } from './UI';
import { MESH_UNITS, meshColorRgba } from '../utils/mesh';
import DropUpMenu from './DropUpMenu';
import MeshColorDropUp from './MeshColorDropUp';

export default function MeshPanel({ mesh, setMesh }) {
  const { colors } = useTheme();
  const [unitOpen, setUnitOpen] = useState(false);
  const [colorOpen, setColorOpen] = useState(false);
  const [localW, setLocalW] = useState(String(mesh.cellW));
  const [localH, setLocalH] = useState(String(mesh.cellH));

  useEffect(() => {
    setLocalW(String(mesh.cellW));
    setLocalH(String(mesh.cellH));
  }, [mesh.cellW, mesh.cellH]);

  const update = (patch) => setMesh(prev => ({ ...prev, ...patch }));
  const unitLabel = MESH_UNITS.find(u => u.key === mesh.unit)?.label || mesh.unit;
  const swatchColor = meshColorRgba(mesh);

  const commitCellW = () => {
    const v = parseFloat(localW);
    if (!Number.isNaN(v) && v > 0) update({ cellW: v });
    else setLocalW(String(mesh.cellW));
  };
  const commitCellH = () => {
    const v = parseFloat(localH);
    if (!Number.isNaN(v) && v > 0) update({ cellH: v });
    else setLocalH(String(mesh.cellH));
  };

  const openUnitMenu = () => {
    setColorOpen(false);
    setUnitOpen(o => !o);
  };

  const openColorMenu = () => {
    setUnitOpen(false);
    setColorOpen(o => !o);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.surface }]}>
      <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Line width</Text>
      <SliderRow
        label="Width"
        value={mesh.lineWidth}
        min={0}
        max={4}
        step={0.1}
        decimals={1}
        unit="px"
        onChange={v => update({ lineWidth: Math.max(0, v) })}
      />

      <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Cell size</Text>
      <View style={styles.cellRow}>
        <View style={[styles.cellBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TextInput
            style={[styles.cellInput, { color: colors.text }]}
            value={localW}
            onChangeText={setLocalW}
            keyboardType="decimal-pad"
            returnKeyType="done"
            onSubmitEditing={commitCellW}
            onBlur={commitCellW}
            placeholderTextColor={colors.textDim}
          />
        </View>

        <Text style={[styles.times, { color: colors.textMuted }]}>×</Text>

        <View style={[styles.cellBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TextInput
            style={[styles.cellInput, { color: colors.text }]}
            value={localH}
            onChangeText={setLocalH}
            keyboardType="decimal-pad"
            returnKeyType="done"
            onSubmitEditing={commitCellH}
            onBlur={commitCellH}
            placeholderTextColor={colors.textDim}
          />
        </View>

        <View style={styles.unitAnchor}>
          <TouchableOpacity
            style={[styles.unitBox, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={openUnitMenu}
            activeOpacity={0.8}
          >
            <Text style={[styles.unitText, { color: colors.text }]}>{unitLabel}</Text>
            <Text style={[styles.unitCaret, { color: colors.accent }]}>▴</Text>
          </TouchableOpacity>
          <DropUpMenu open={unitOpen} onClose={() => setUnitOpen(false)} align="unitBox" width={100}>
            <View style={styles.unitGrid}>
              {MESH_UNITS.map(unit => (
                <TouchableOpacity
                  key={unit.key}
                  style={[
                    styles.unitCell,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                    mesh.unit === unit.key && { borderColor: colors.accent, backgroundColor: colors.card },
                  ]}
                  onPress={() => {
                    update({ unit: unit.key });
                    setUnitOpen(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.unitCellText,
                      { color: colors.text },
                      mesh.unit === unit.key && { color: colors.accent, fontWeight: '700' },
                    ]}
                  >
                    {unit.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </DropUpMenu>
        </View>

        <TouchableOpacity
          style={[
            styles.iconBox,
            { backgroundColor: colors.card, borderColor: colors.border },
            mesh.diagonalEnabled && { backgroundColor: colors.accent, borderColor: colors.accent },
          ]}
          onPress={() => update({ diagonalEnabled: !mesh.diagonalEnabled })}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.diagIcon,
              { color: colors.textMuted },
              mesh.diagonalEnabled && { color: colors.bg, fontWeight: '700' },
            ]}
          >
            ⤬
          </Text>
        </TouchableOpacity>

        <View style={styles.colorAnchor}>
          <TouchableOpacity
            style={[styles.colorBox, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={openColorMenu}
            activeOpacity={0.8}
          >
            <View style={[styles.colorSwatch, { backgroundColor: swatchColor, borderColor: colors.border }]} />
            <Text style={[styles.colorLabel, { color: colors.text }]}>Color</Text>
          </TouchableOpacity>
          <DropUpMenu open={colorOpen} onClose={() => setColorOpen(false)} align="colorBox" width={212} maxHeight={340}>
            <MeshColorDropUp mesh={mesh} onChange={update} />
          </DropUpMenu>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'relative',
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    overflow: 'visible',
    zIndex: 1,
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  cellRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 40,
    marginTop: 2,
    gap: 6,
  },
  cellBox: {
    width: 52,
    height: 40,
    borderRadius: 8,
    borderWidth: 0.8,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  cellInput: {
    fontSize: 14,
    fontWeight: '600',
    padding: 0,
    minHeight: 20,
    textAlign: 'center',
  },
  times: {
    fontSize: 14,
    marginHorizontal: 2,
    fontWeight: '600',
  },
  unitAnchor: {
    position: 'relative',
    zIndex: 10,
  },
  unitBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 0.8,
    width: 56,
    height: 40,
    gap: 2,
  },
  unitText: {
    fontSize: 12,
    fontWeight: '600',
  },
  unitCaret: {
    fontSize: 9,
    fontWeight: '600',
  },
  unitGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  unitCell: {
    width: '96%',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 6,
    borderWidth: 0.8,
  },
  unitCellText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  iconBox: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 0.8,
    width: 40,
    height: 40,
    marginLeft: 2,
    flexShrink: 0,
  },
  diagIcon: {
    fontSize: 14,
  },
  colorAnchor: {
    position: 'relative',
    zIndex: 20,
    marginLeft: 'auto',
  },
  colorBox: {
    width: 78,
    height: 40,
    borderRadius: 8,
    borderWidth: 0.8,
    overflow: 'hidden',
    flexShrink: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    gap: 6,
  },
  colorSwatch: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 0.8,
  },
  colorLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
});

