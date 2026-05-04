import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useYarnStore } from '../store/yarnStore';
import { THEME, COLOR_SWATCH_MAP } from '../constants/colors';
import { StashStackParamList } from '../navigation/AppNavigator';
import { YarnEntry, ColorFamily } from '../types/yarn';

type Props = {
  navigation: NativeStackNavigationProp<StashStackParamList, 'StashList'>;
};

function ColorSwatch({ color }: { color: ColorFamily }) {
  if (color === 'multicolor') {
    return (
      <View style={[styles.swatch, styles.multicolor]}>
        <View style={[styles.multiStripe, { backgroundColor: '#DC2626' }]} />
        <View style={[styles.multiStripe, { backgroundColor: '#EAB308' }]} />
        <View style={[styles.multiStripe, { backgroundColor: '#2563EB' }]} />
        <View style={[styles.multiStripe, { backgroundColor: '#16A34A' }]} />
      </View>
    );
  }
  return (
    <View
      style={[
        styles.swatch,
        { backgroundColor: COLOR_SWATCH_MAP[color] },
        color === 'white' && styles.whiteSwatch,
      ]}
    />
  );
}

function YarnCard({ yarn, onPress }: { yarn: YarnEntry; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      {yarn.photoUri ? (
        <Image source={{ uri: yarn.photoUri }} style={styles.cardImage} />
      ) : (
        <View style={styles.cardImagePlaceholder}>
          <ColorSwatch color={yarn.colorFamily} />
        </View>
      )}
      <View style={styles.cardContent}>
        <Text style={styles.cardName} numberOfLines={1}>
          {yarn.name}
        </Text>
        <Text style={styles.cardMeta}>
          {yarn.weight} &middot; {yarn.fiberType}
        </Text>
        <Text style={styles.cardYardage}>~{yarn.yardageEstimate} yards</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function StashListScreen({ navigation }: Props) {
  const { yarns, isLoaded, loadYarns } = useYarnStore();

  useEffect(() => {
    loadYarns();
  }, []);

  if (!isLoaded) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>Loading your stash...</Text>
      </View>
    );
  }

  if (yarns.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyIcon}>🧶</Text>
        <Text style={styles.emptyTitle}>Your stash is empty!</Text>
        <Text style={styles.emptySubtitle}>
          Add some yarn to get pattern suggestions
        </Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddYarn')}
        >
          <Text style={styles.addButtonText}>+ Add Yarn</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={yarns}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.list}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => (
          <YarnCard
            yarn={item}
            onPress={() => navigation.navigate('YarnDetail', { yarnId: item.id })}
          />
        )}
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddYarn')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
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
    backgroundColor: THEME.background,
    padding: 24,
  },
  loadingText: {
    fontSize: 16,
    color: THEME.textSecondary,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: THEME.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: THEME.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  addButton: {
    backgroundColor: THEME.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  list: {
    padding: 12,
  },
  row: {
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: THEME.surface,
    borderRadius: 12,
    marginBottom: 12,
    width: '48%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardImage: {
    width: '100%',
    height: 100,
  },
  cardImagePlaceholder: {
    width: '100%',
    height: 100,
    backgroundColor: THEME.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  swatch: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  whiteSwatch: {
    borderWidth: 1,
    borderColor: THEME.border,
  },
  multicolor: {
    flexDirection: 'row',
  },
  multiStripe: {
    flex: 1,
    height: '100%',
  },
  cardContent: {
    padding: 10,
  },
  cardName: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.text,
    marginBottom: 4,
  },
  cardMeta: {
    fontSize: 12,
    color: THEME.textSecondary,
    marginBottom: 2,
  },
  cardYardage: {
    fontSize: 12,
    color: THEME.primary,
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: THEME.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  fabText: {
    fontSize: 28,
    color: '#fff',
    lineHeight: 30,
  },
});
