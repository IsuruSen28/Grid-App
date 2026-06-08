import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../context/ThemeContext';
import AppMenu from './AppMenu';

export default function HomeScreen({ onOpenWorkspace }) {
  const { colors, theme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  const pickAndOpen = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Allow access to your photo library.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 1,
        allowsEditing: false,
      });

      if (result.canceled) return;

      const uri = result.assets?.[0]?.uri;
      if (!uri) {
        Alert.alert('Error', 'No image was selected.');
        return;
      }

      onOpenWorkspace(uri);
    } catch (e) {
      Alert.alert('Error', e.message || 'Could not open photo.');
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={theme === 'light' ? 'dark-content' : 'light-content'} />

      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.accent }]}>PortraitMesh</Text>
        <TouchableOpacity style={[styles.menuBtn, { borderColor: colors.border }]} onPress={() => setMenuOpen(true)}>
          <Text style={[styles.menuIcon, { color: colors.text }]}>☰</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.hero}>
        <Text style={[styles.heroTitle, { color: colors.text }]}>Portrait grid studio</Text>
        <Text style={[styles.heroSub, { color: colors.textMuted }]}>
          Upload a photo to overlay a drawing mesh and prepare your reference.
        </Text>
        <TouchableOpacity
          style={[styles.uploadBtn, { backgroundColor: colors.accent }]}
          onPress={pickAndOpen}
        >
          <Text style={[styles.uploadBtnText, { color: colors.bg }]}>Upload Photo</Text>
        </TouchableOpacity>
      </View>


      <AppMenu visible={menuOpen} onClose={() => setMenuOpen(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
  },
  title: { fontSize: 18, fontWeight: '700', letterSpacing: 0.5 },
  menuBtn: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIcon: { fontSize: 20 },
  hero: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  heroTitle: { fontSize: 22, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  heroSub: { fontSize: 14, lineHeight: 20, textAlign: 'center', marginBottom: 28 },
  uploadBtn: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  uploadBtnText: { fontSize: 16, fontWeight: '700' },
});
