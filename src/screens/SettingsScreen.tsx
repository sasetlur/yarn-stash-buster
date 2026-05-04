import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
  ScrollView,
  Linking,
} from 'react-native';
import { useSettingsStore } from '../store/settingsStore';
import { THEME } from '../constants/colors';

export default function SettingsScreen() {
  const {
    ravelryUsername,
    ravelryPassword,
    freeOnly,
    isLoaded,
    loadSettings,
    setRavelryCredentials,
    setFreeOnly,
    hasRavelryCredentials,
  } = useSettingsStore();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    if (isLoaded) {
      setUsername(ravelryUsername);
      setPassword(ravelryPassword);
    }
  }, [isLoaded, ravelryUsername, ravelryPassword]);

  const handleSave = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Missing info', 'Please enter both your Ravelry username and personal key.');
      return;
    }
    await setRavelryCredentials(username.trim(), password.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ravelry API</Text>
        <Text style={styles.sectionDescription}>
          Enter your Ravelry API credentials to get pattern suggestions. You can get these from your{' '}
          <Text
            style={styles.link}
            onPress={() => Linking.openURL('https://www.ravelry.com/pro/developer')}
          >
            Ravelry Pro/Developer page
          </Text>
          .
        </Text>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Your Ravelry username"
            placeholderTextColor={THEME.textSecondary}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Personal Key</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Your read-only personal key"
            placeholderTextColor={THEME.textSecondary}
            value={password}
            onChangeText={setPassword}
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          style={[styles.saveButton, saved && styles.savedButton]}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>
            {saved ? 'Saved!' : 'Save Credentials'}
          </Text>
        </TouchableOpacity>

        {hasRavelryCredentials() && (
          <View style={styles.statusRow}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Ravelry API connected</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>

        <View style={styles.toggleRow}>
          <View style={styles.toggleInfo}>
            <Text style={styles.toggleLabel}>Free patterns only</Text>
            <Text style={styles.toggleDescription}>
              Only suggest patterns that are available for free
            </Text>
          </View>
          <Switch
            value={freeOnly}
            onValueChange={setFreeOnly}
            trackColor={{ true: THEME.primaryLight, false: THEME.border }}
            thumbColor={freeOnly ? THEME.primary : '#f4f4f4'}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.aboutText}>
          Yarn Stash Buster helps you use up your yarn stash by suggesting
          knitting patterns from Ravelry that match the yarn you already own.
        </Text>
        <Text style={styles.version}>Version 1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    backgroundColor: THEME.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.text,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: THEME.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  link: {
    color: THEME.primary,
    textDecorationLine: 'underline',
  },
  fieldGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.text,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: THEME.background,
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: THEME.text,
  },
  saveButton: {
    backgroundColor: THEME.primary,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  savedButton: {
    backgroundColor: THEME.success,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: THEME.success,
  },
  statusText: {
    fontSize: 13,
    color: THEME.success,
    fontWeight: '500',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleInfo: {
    flex: 1,
    marginRight: 16,
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: THEME.text,
    marginBottom: 2,
  },
  toggleDescription: {
    fontSize: 13,
    color: THEME.textSecondary,
  },
  aboutText: {
    fontSize: 14,
    color: THEME.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  version: {
    fontSize: 13,
    color: THEME.textSecondary,
  },
});
