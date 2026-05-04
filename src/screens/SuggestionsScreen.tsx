import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Linking,
  RefreshControl,
} from 'react-native';
import { useYarnStore } from '../store/yarnStore';
import { useSettingsStore } from '../store/settingsStore';
import { searchPatterns } from '../api/ravelry';
import { THEME } from '../constants/colors';
import { PatternSuggestion, RavelryPattern } from '../types/pattern';
import { YarnEntry } from '../types/yarn';

function PatternCard({ suggestion }: { suggestion: PatternSuggestion }) {
  const { pattern, matchedYarn } = suggestion;
  const imageUrl = pattern.first_photo?.medium_url ?? pattern.first_photo?.small_url;

  const openPattern = () => {
    const url = `https://www.ravelry.com/patterns/library/${pattern.permalink}`;
    Linking.openURL(url);
  };

  return (
    <TouchableOpacity style={styles.card} onPress={openPattern} activeOpacity={0.7}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.cardImage} />
      ) : (
        <View style={[styles.cardImage, styles.noImage]}>
          <Text style={styles.noImageText}>No photo</Text>
        </View>
      )}
      <View style={styles.cardContent}>
        <Text style={styles.patternName} numberOfLines={2}>
          {pattern.name}
        </Text>
        {pattern.designer?.name && (
          <Text style={styles.designer}>by {pattern.designer.name}</Text>
        )}
        <View style={styles.metaRow}>
          {pattern.rating_average != null && (
            <Text style={styles.rating}>
              {'★'.repeat(Math.round(pattern.rating_average))}
              {' '}
              {pattern.rating_average.toFixed(1)}
            </Text>
          )}
          {pattern.free && <Text style={styles.freeBadge}>FREE</Text>}
        </View>
        {(pattern.yardage_max || pattern.yardage) && (
          <Text style={styles.yardage}>
            {pattern.yardage_max ?? pattern.yardage} yards needed
          </Text>
        )}
        <View style={styles.matchBadge}>
          <Text style={styles.matchText}>
            Matches: {matchedYarn.name}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function SuggestionsScreen() {
  const { yarns, isLoaded, loadYarns } = useYarnStore();
  const { ravelryUsername, ravelryPassword, freeOnly, isLoaded: settingsLoaded, loadSettings, hasRavelryCredentials } = useSettingsStore();

  const [suggestions, setSuggestions] = useState<PatternSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadYarns();
    loadSettings();
  }, []);

  const fetchSuggestions = useCallback(async (isRefresh = false) => {
    if (!hasRavelryCredentials()) return;
    if (yarns.length === 0) return;

    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const allSuggestions: PatternSuggestion[] = [];

      for (const yarn of yarns) {
        const result = await searchPatterns({
          username: ravelryUsername,
          password: ravelryPassword,
          weight: yarn.weight,
          maxYardage: yarn.yardageEstimate,
          freeOnly,
          pageSize: 10,
        });

        for (const pattern of result.patterns) {
          allSuggestions.push({
            pattern,
            matchedYarn: {
              id: yarn.id,
              name: yarn.name,
              colorFamily: yarn.colorFamily,
            },
          });
        }
      }

      // Deduplicate by pattern id (keep first match)
      const seen = new Set<number>();
      const unique = allSuggestions.filter((s) => {
        if (seen.has(s.pattern.id)) return false;
        seen.add(s.pattern.id);
        return true;
      });

      // Sort by rating
      unique.sort((a, b) => (b.pattern.rating_average ?? 0) - (a.pattern.rating_average ?? 0));

      setSuggestions(unique);
    } catch (err: any) {
      setError(err.message ?? 'Failed to fetch suggestions');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [yarns, ravelryUsername, ravelryPassword, freeOnly]);

  useEffect(() => {
    if (isLoaded && settingsLoaded && hasRavelryCredentials() && yarns.length > 0) {
      fetchSuggestions();
    }
  }, [isLoaded, settingsLoaded, yarns.length]);

  if (!isLoaded || !settingsLoaded) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={THEME.primary} />
      </View>
    );
  }

  if (!hasRavelryCredentials()) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyIcon}>🔑</Text>
        <Text style={styles.emptyTitle}>Ravelry API not configured</Text>
        <Text style={styles.emptySubtitle}>
          Go to Settings and enter your Ravelry username and personal key to get pattern suggestions.
        </Text>
      </View>
    );
  }

  if (yarns.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyIcon}>🧶</Text>
        <Text style={styles.emptyTitle}>No yarn in your stash</Text>
        <Text style={styles.emptySubtitle}>
          Add some yarn to your stash first, then we'll find patterns that match!
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={THEME.primary} />
        <Text style={styles.loadingText}>Finding patterns for your stash...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyIcon}>⚠️</Text>
        <Text style={styles.emptyTitle}>Something went wrong</Text>
        <Text style={styles.emptySubtitle}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => fetchSuggestions()}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={suggestions}
        keyExtractor={(item) => `${item.pattern.id}-${item.matchedYarn.id}`}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => <PatternCard suggestion={item} />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchSuggestions(true)}
            tintColor={THEME.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyTitle}>No patterns found</Text>
            <Text style={styles.emptySubtitle}>
              Try adjusting your stash entries or filters.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: THEME.background,
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: THEME.surface,
    borderRadius: 12,
    marginBottom: 16,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardImage: {
    width: 110,
    height: 140,
  },
  noImage: {
    backgroundColor: THEME.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    color: THEME.textSecondary,
    fontSize: 12,
  },
  cardContent: {
    flex: 1,
    padding: 12,
  },
  patternName: {
    fontSize: 15,
    fontWeight: '600',
    color: THEME.text,
    marginBottom: 4,
  },
  designer: {
    fontSize: 13,
    color: THEME.textSecondary,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  rating: {
    fontSize: 12,
    color: THEME.warning,
  },
  freeBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.success,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  yardage: {
    fontSize: 12,
    color: THEME.textSecondary,
    marginBottom: 6,
  },
  matchBadge: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  matchText: {
    fontSize: 11,
    color: THEME.primary,
    fontWeight: '500',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: THEME.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    color: THEME.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: THEME.textSecondary,
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: THEME.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
