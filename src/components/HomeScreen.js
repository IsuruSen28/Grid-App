import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar,
  Alert, ScrollView, Image, Dimensions, Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { Icon } from './UI';
import AppMenu from './AppMenu';
import { loadRecentWorks, removeRecentWork, addRecentWork } from '../utils/storage';

const { width: SW } = Dimensions.get('window');

function BackgroundGrid() {
  const { colors } = useTheme();
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {Array.from({ length: 10 }).map((_, i) => (
        <View
          key={`v-${i}`}
          style={{
            position: 'absolute',
            left: `${(i + 1) * 10}%`,
            top: 0,
            bottom: 0,
            width: 0.8,
            backgroundColor: colors.gridLine,
          }}
        />
      ))}
      {Array.from({ length: 16 }).map((_, i) => (
        <View
          key={`h-${i}`}
          style={{
            position: 'absolute',
            top: `${(i + 1) * 6.25}%`,
            left: 0,
            right: 0,
            height: 0.8,
            backgroundColor: colors.gridLine,
          }}
        />
      ))}
    </View>
  );
}

export default function HomeScreen({ onOpenWorkspace }) {
  const { colors, theme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [recentWorks, setRecentWorks] = useState([]);

  const loadRecent = async () => {
    try {
      const list = await loadRecentWorks();
      setRecentWorks(list || []);
    } catch (e) {
      console.warn('Failed to load recent works:', e);
    }
  };

  useEffect(() => {
    loadRecent();
  }, []);

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

      const entry = await addRecentWork(uri);
      onOpenWorkspace(entry.uri);
    } catch (e) {
      Alert.alert('Error', e.message || 'Could not open photo.');
    }
  };

  const handleDelete = (id) => {
    Alert.alert(
      'Remove recent',
      'Remove this reference photo from your recent list?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await removeRecentWork(id);
            loadRecent();
          },
        },
      ]
    );
  };

  return (
    <LinearGradient
      colors={colors.gradient}
      style={styles.safe}
    >
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle={theme === 'light' ? 'dark-content' : 'light-content'} />
        <BackgroundGrid />

        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.accent }]}>PortraitMesh</Text>
          <TouchableOpacity
            style={[styles.menuBtn, { borderColor: colors.border, backgroundColor: colors.card }]}
            onPress={() => setMenuOpen(true)}
            activeOpacity={0.8}
          >
            <Icon name="menu" size={18} color={colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={[styles.heroCard, { backgroundColor: colors.cardOverlay, borderColor: colors.border, ...colors.shadow }]}>
            <View style={[styles.iconCircle, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Icon name="crop" size={28} color={colors.accent} />
            </View>
            <Text style={[styles.heroTitle, { color: colors.text }]}>Portrait grid studio</Text>
            <Text style={[styles.heroSub, { color: colors.textMuted }]}>
              Overlay a customizable reference mesh on your photo to align proportions and capture details accurately.
            </Text>
            <TouchableOpacity
              style={[styles.uploadBtn, { backgroundColor: colors.accent, ...colors.shadow }]}
              onPress={pickAndOpen}
              activeOpacity={0.85}
            >
              <Icon name="plus" size={16} color={colors.bg} style={{ marginRight: 6 }} />
              <Text style={[styles.uploadBtnText, { color: colors.bg }]}>New Drawing Reference</Text>
            </TouchableOpacity>
          </View>

          {/* Recent Works Shelf */}
          <View style={styles.recentSection}>
            <Text style={[styles.recentHeading, { color: colors.text }]}>Recent Works</Text>
            {recentWorks.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.recentList}
              >
                {recentWorks.map((work) => (
                  <TouchableOpacity
                    key={work.id}
                    style={[styles.workCard, { backgroundColor: colors.cardOverlay, borderColor: colors.border }]}
                    onPress={() => onOpenWorkspace(work.uri)}
                    activeOpacity={0.9}
                  >
                    <Image source={{ uri: work.uri }} style={styles.thumbnail} />
                    
                    {/* Delete button absolutely positioned */}
                    <TouchableOpacity
                      style={[styles.deleteBtn, { backgroundColor: colors.overlay, borderColor: colors.border }]}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleDelete(work.id);
                      }}
                      activeOpacity={0.7}
                    >
                      <Icon name="trash" size={12} color={colors.danger} />
                    </TouchableOpacity>

                    <View style={styles.cardMeta}>
                      <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>
                        {work.label || 'Portrait'}
                      </Text>
                      <Text style={[styles.cardDate, { color: colors.textMuted }]}>
                        {new Date(work.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <View style={[styles.emptyCard, { backgroundColor: colors.cardOverlay, borderColor: colors.border }]}>
                <Icon name="grid" size={24} color={colors.textDim} style={{ marginBottom: 6 }} />
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                  Your recent drawing meshes will appear here.
                </Text>
              </View>
            )}
          </View>
        </ScrollView>

        <AppMenu visible={menuOpen} onClose={() => setMenuOpen(false)} />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 0.8,
  },
  title: { fontSize: 19, fontWeight: '800', letterSpacing: 0.8 },
  menuBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 0.8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 32,
    justifyContent: 'space-between',
  },
  heroCard: {
    borderRadius: 18,
    borderWidth: 0.8,
    padding: 28,
    alignItems: 'center',
    marginVertical: 12,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 0.8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heroTitle: { fontSize: 21, fontWeight: '800', marginBottom: 10, textAlign: 'center' },
  heroSub: { fontSize: 13, lineHeight: 18, textAlign: 'center', marginBottom: 28, paddingHorizontal: 6 },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 24,
  },
  uploadBtnText: { fontSize: 14, fontWeight: '700' },
  
  recentSection: {
    marginTop: 24,
  },
  recentHeading: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 14,
    paddingLeft: 4,
  },
  recentList: {
    paddingLeft: 4,
    paddingRight: 16,
    gap: 12,
  },
  workCard: {
    width: 120,
    borderRadius: 12,
    borderWidth: 0.8,
    overflow: 'hidden',
    position: 'relative',
    marginRight: 4,
  },
  thumbnail: {
    width: '100%',
    height: 110,
    resizeMode: 'cover',
  },
  deleteBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 0.8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardMeta: {
    padding: 8,
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 2,
  },
  cardDate: {
    fontSize: 9,
  },
  emptyCard: {
    borderRadius: 12,
    borderWidth: 0.8,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 12,
    textAlign: 'center',
  },
});

