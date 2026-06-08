import React from 'react';
import { View, Pressable, StyleSheet, Modal } from 'react-native';
import { useTheme } from '../context/ThemeContext';

/**
 * Drop-up menu rendered in a Modal so it sits above the workspace footer.
 * Taps on the backdrop close the menu; the panel itself receives touches normally.
 */
export default function DropUpMenu({
  open,
  onClose,
  children,
  align = 'stretch',
  width,
  maxHeight = 220,
}) {
  const { colors } = useTheme();
  if (!open) return null;

  const menuAlignStyle =
    align === 'right'
      ? { right: 12, left: undefined, bottom: 70, width: width ?? 200 }
      : align === 'left'
        ? { left: 112, right: undefined, bottom: 70, width: width ?? 200 }
        : align === 'pageSize'
          ? { left: 12, right: undefined, bottom: 35, width: width ?? 160 }
          : { left: 12, right: 12, bottom: 70, width: width ?? 200 };

  return (
    <Modal visible transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.modalRoot}>
        <Pressable style={styles.modalBackdrop} onPress={onClose} />
        <View
          style={[
            styles.menu,
            menuAlignStyle,
            { maxHeight, backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          {children}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    zIndex: 1,
  },
  menu: {
    position: 'absolute',
    zIndex: 10,
    elevation: 10,
    borderRadius: 10,
    borderWidth: 0.5,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
});
