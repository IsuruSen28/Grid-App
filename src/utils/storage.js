import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';

const docDir = FileSystem.documentDirectory;
const RECENT_FILE = docDir ? `${docDir}recent_works.json` : null;
const SETTINGS_FILE = docDir ? `${docDir}settings.json` : null;
const PORTRAITS_DIR = docDir ? `${docDir}portraits/` : null;
const MAX_RECENT = 12;

const webRecentKey = 'portraitmesh_recent_works';
const webSettingsKey = 'portraitmesh_settings';

function webGet(key) {
  if (typeof localStorage === 'undefined') return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function webSet(key, value) {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(key, value);
  } catch {
    /* quota */
  }
}

export async function loadSettings() {
  try {
    if (Platform.OS === 'web' || !SETTINGS_FILE) {
      const raw = webGet(webSettingsKey);
      return raw ? JSON.parse(raw) : { theme: 'dark' };
    }
    const info = await FileSystem.getInfoAsync(SETTINGS_FILE);
    if (!info.exists) return { theme: 'dark' };
    const raw = await FileSystem.readAsStringAsync(SETTINGS_FILE);
    return JSON.parse(raw);
  } catch {
    return { theme: 'dark' };
  }
}

export async function saveSettings(settings) {
  const current = await loadSettings();
  const merged = { ...current, ...settings };
  if (Platform.OS === 'web' || !SETTINGS_FILE) {
    webSet(webSettingsKey, JSON.stringify(merged));
    return;
  }
  await FileSystem.writeAsStringAsync(SETTINGS_FILE, JSON.stringify(merged));
}

export async function loadRecentWorks() {
  try {
    if (Platform.OS === 'web' || !RECENT_FILE) {
      const raw = webGet(webRecentKey);
      return raw ? JSON.parse(raw).works || [] : [];
    }
    const info = await FileSystem.getInfoAsync(RECENT_FILE);
    if (!info.exists) return [];
    const raw = await FileSystem.readAsStringAsync(RECENT_FILE);
    const data = JSON.parse(raw);
    const works = data.works || [];
    const valid = [];
    for (const w of works) {
      const fi = await FileSystem.getInfoAsync(w.uri);
      if (fi.exists) valid.push(w);
    }
    return valid;
  } catch {
    return [];
  }
}

async function saveRecentList(works) {
  if (Platform.OS === 'web' || !RECENT_FILE) {
    webSet(webRecentKey, JSON.stringify({ works }));
    return;
  }
  await FileSystem.writeAsStringAsync(RECENT_FILE, JSON.stringify({ works }));
}

export async function persistImage(uri) {
  if (!PORTRAITS_DIR) {
    return uri;
  }

  const id = `${Date.now()}`;
  const dest = `${PORTRAITS_DIR}${id}.jpg`;
  await FileSystem.makeDirectoryAsync(PORTRAITS_DIR, { intermediates: true }).catch(() => {});

  if (Platform.OS === 'web') {
    const response = await fetch(uri);
    const blob = await response.blob();
    const base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result;
        resolve(typeof result === 'string' ? result.split(',')[1] : '');
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    await FileSystem.writeAsStringAsync(dest, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return dest;
  }

  await FileSystem.copyAsync({ from: uri, to: dest });
  return dest;
}

export async function addRecentWork(sourceUri) {
  let uri = sourceUri;
  try {
    uri = await persistImage(sourceUri);
  } catch {
    uri = sourceUri;
  }

  const works = await loadRecentWorks();
  const entry = {
    id: `${Date.now()}`,
    uri,
    createdAt: new Date().toISOString(),
    label: `Portrait ${new Date().toLocaleDateString()}`,
  };
  const next = [entry, ...works.filter(w => w.uri !== uri && w.uri !== sourceUri)].slice(0, MAX_RECENT);
  await saveRecentList(next);
  return entry;
}

export async function removeRecentWork(id) {
  const works = await loadRecentWorks();
  const target = works.find(w => w.id === id);
  if (target && PORTRAITS_DIR && target.uri.startsWith(PORTRAITS_DIR)) {
    await FileSystem.deleteAsync(target.uri, { idempotent: true }).catch(() => {});
  }
  await saveRecentList(works.filter(w => w.id !== id));
}
