import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Modal, Pressable,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function AppMenu({ visible, onClose, onGoHome }) {
  const { theme, setTheme, colors } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={[styles.backdrop, { backgroundColor: colors.overlay }]} onPress={onClose}>
        <Pressable style={[styles.menu, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={e => e.stopPropagation()}>
          <Text style={[styles.title, { color: colors.accent }]}>Settings</Text>

          <Text style={[styles.section, { color: colors.textMuted }]}>Appearance</Text>
          <View style={styles.row}>
            <ThemeOption
              label="Light"
              active={theme === 'light'}
              onPress={() => setTheme('light')}
              colors={colors}
            />
            <ThemeOption
              label="Dark"
              active={theme === 'dark'}
              onPress={() => setTheme('dark')}
              colors={colors}
            />
          </View>

          {onGoHome && (
            <>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <TouchableOpacity style={[styles.item, { borderColor: colors.border }]} onPress={() => { onGoHome(); onClose(); }}>
                <Text style={[styles.itemText, { color: colors.text }]}>Home</Text>
              </TouchableOpacity>
            </>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function ThemeOption({ label, active, onPress, colors }) {
  return (
    <TouchableOpacity
      style={[
        styles.option,
        { borderColor: colors.border, backgroundColor: colors.card },
        active && { backgroundColor: colors.accent, borderColor: colors.accent },
      ]}
      onPress={onPress}
    >
      <Text style={[styles.optionText, { color: active ? colors.bg : colors.text }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 56,
    paddingRight: 12,
  },
  menu: {
    width: 200,
    borderRadius: 12,
    borderWidth: 0.5,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  title: { fontSize: 15, fontWeight: '700', marginBottom: 12 },
  section: { fontSize: 10, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 },
  row: { flexDirection: 'row', gap: 8 },
  option: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 0.5,
    alignItems: 'center',
  },
  optionText: { fontSize: 13, fontWeight: '600' },
  divider: { height: 0.5, marginVertical: 12 },
  item: {
    paddingVertical: 10,
    borderTopWidth: 0.5,
    alignItems: 'center',
  },
  itemText: { fontSize: 14, fontWeight: '500' },
});
