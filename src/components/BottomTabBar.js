import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { TABS } from '../constants';
import { useTheme } from '../context/ThemeContext';

export default function BottomTabBar({ activeTab, onTabChange }) {
  const { colors } = useTheme();

  return (
    <View style={[styles.bar, { borderTopColor: colors.border, backgroundColor: colors.surface }]}>
      {TABS.map(tab => (
        <TouchableOpacity
          key={tab.key}
          style={[styles.item, activeTab === tab.key && { borderTopColor: colors.accent }]}
          onPress={() => onTabChange(tab.key)}
        >
          <Text style={[
            styles.label,
            { color: colors.textDim },
            activeTab === tab.key && { color: colors.accent, fontWeight: '600' },
          ]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    borderTopWidth: 0.5,
    paddingBottom: Platform.OS === 'ios' ? 4 : 0,
  },
  item: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderTopWidth: 2,
    borderTopColor: 'transparent',
  },
  label: { fontSize: 11, fontWeight: '500' },
});
