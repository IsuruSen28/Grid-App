import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { TABS } from '../constants';
import { useTheme } from '../context/ThemeContext';
import { Icon } from './UI';

export default function BottomTabBar({ activeTab, onTabChange }) {
  const { colors } = useTheme();

  return (
    <View style={[styles.bar, { borderTopColor: colors.border, backgroundColor: colors.surface }]}>
      {TABS.map(tab => {
        const isActive = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.item}
            onPress={() => onTabChange(tab.key)}
            activeOpacity={0.8}
          >
            {/* Active top line indicator */}
            <View style={[
              styles.indicator,
              { backgroundColor: isActive ? colors.accent : 'transparent' }
            ]} />
            
            <Icon
              name={tab.icon}
              size={18}
              color={isActive ? colors.accent : colors.textDim}
              style={styles.icon}
            />
            
            <Text style={[
              styles.label,
              { color: colors.textDim },
              isActive && { color: colors.accent, fontWeight: '700' },
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    borderTopWidth: 0.8,
    paddingBottom: Platform.OS === 'ios' ? 18 : 6,
    height: Platform.OS === 'ios' ? 76 : 64,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingTop: 6,
  },
  indicator: {
    position: 'absolute',
    top: 0,
    left: '25%',
    right: '25%',
    height: 3,
    borderBottomLeftRadius: 1.5,
    borderBottomRightRadius: 1.5,
  },
  icon: {
    marginBottom: 4,
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
});

