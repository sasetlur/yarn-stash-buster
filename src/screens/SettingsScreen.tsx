import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
} from 'react-native';
import { useSettingsStore } from '../store/settingsStore';
import { THEME } from '../constants/colors';

export default function SettingsScreen() {
  const { freeOnly, setFreeOnly, hasRavelryCredentials } = useSettingsStore();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ravelry API</Text>
        {hasRavelryCredentials() ? (
          <View style={styles.statusRow}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Connected</Text>
          </View>
        ) : (
          <Text style={styles.warningText}>
            Not configured. Add your credentials to src/config/local.ts
          </Text>
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
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    marginRight: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: THEME.success,
  },
  statusText: {
    fontSize: 14,
    color: THEME.success,
    fontWeight: '500',
  },
  warningText: {
    fontSize: 14,
    color: THEME.warning,
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
