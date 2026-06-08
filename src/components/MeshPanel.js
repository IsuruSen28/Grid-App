import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { SliderRow } from './UI';
import { MESH_UNITS, meshColorRgba, formatCellSize } from '../utils/mesh';
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
      {/* <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Line width</Text>
      <SliderRow
        label="Width"
        value={mesh.lineWidth}
        min={0}
        max={4}
        step={0.1}
        decimals={1}
        unit="px"
        onChange={v => update({ lineWidth: Math.max(0, v) })}
      /> */}

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
          >
            <Text style={[styles.unitText, { color: colors.text }]}>{unitLabel}</Text>
            <Text style={[styles.unitCaret, { color: colors.textMuted }]}>▴</Text>
          </TouchableOpacity>
          <DropUpMenu open={unitOpen} onClose={() => setUnitOpen(false)} align="left" width={204}>
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
        >
          <Text
            style={[
              styles.diagIcon,
              { color: colors.textMuted },
              mesh.diagonalEnabled && { color: colors.bg },
            ]}
          >
            ⤬
          </Text>
        </TouchableOpacity>

        <View style={styles.colorAnchor}>
          <TouchableOpacity
            style={[styles.colorBox, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={openColorMenu}
          >
            <View style={[styles.colorSwatch, { backgroundColor: swatchColor, borderColor: colors.border }]} />
            <Text style={[styles.colorLabel, { color: colors.text }]}>Color</Text>
          </TouchableOpacity>
          <DropUpMenu open={colorOpen} onClose={() => setColorOpen(false)} align="right" width={212} maxHeight={320}>
            <MeshColorDropUp mesh={mesh} onChange={update} />
          </DropUpMenu>
        </View>
      </View>

      {/* <Text style={[styles.summary, { color: colors.textDim }]}>{formatCellSize(mesh)} per cell</Text> */}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'relative',
    // flex: 1,
    height: 10,
    paddingHorizontal: 12,
    paddingTop: 6,
    paddingBottom: 8,
    overflow: 'visible',
    zIndex: 1,
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  cellRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    marginTop: 2,
    gap: 6,
  },
  cellBox: {
    width: 52,
    height: 44,
    borderRadius: 8,
    borderWidth: 0.5,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  cellInput: {
    fontSize: 15,
    fontWeight: '600',
    padding: 0,
    minHeight: 22,
    textAlign: 'center',
  },
  times: {
    fontSize: 16,
    marginHorizontal: 4,
    fontWeight: '300',
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
    borderWidth: 0.5,
    width: 56,
    height: 44,
  },
  unitText: {
    fontSize: 13,
    fontWeight: '600',
  },
  unitCaret: {
    fontSize: 10,
    marginLeft: 2,
  },
  unitGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  unitCell: {
    width: '47%',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 6,
    borderWidth: 0.5,
  },
  unitCellText: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  iconBox: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 0.5,
    width: 44,
    height: 44,
    marginLeft: 4,
    flexShrink: 0,
  },
  diagIcon: {
    fontSize: 16,
  },
  colorAnchor: {
    position: 'relative',
    zIndex: 20,
    marginLeft: 'auto',
  },
  colorBox: {
    width: 75,
    height: 44,
    marginLeft: 4,
    borderRadius: 8,
    borderWidth: 0.5,
    overflow: 'hidden',
    flexShrink: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    gap: 6,
  },
  colorSwatch: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 0.5,
  },
  colorLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  summary: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: 8,
  },
});
