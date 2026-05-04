import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { useYarnStore } from '../store/yarnStore';
import { THEME, COLOR_SWATCH_MAP } from '../constants/colors';
import { StashStackParamList } from '../navigation/AppNavigator';

type Props = {
  navigation: NativeStackNavigationProp<StashStackParamList, 'YarnDetail'>;
  route: RouteProp<StashStackParamList, 'YarnDetail'>;
};

export default function YarnDetailScreen({ navigation, route }: Props) {
  const { yarnId } = route.params;
  const { yarns, deleteYarn } = useYarnStore();
  const yarn = yarns.find((y) => y.id === yarnId);

  if (!yarn) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Yarn not found</Text>
      </View>
    );
  }

  const handleDelete = () => {
    Alert.alert('Delete Yarn', `Remove "${yarn.name}" from your stash?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteYarn(yarnId);
          navigation.goBack();
        },
      },
    ]);
  };

  const swatchColor = COLOR_SWATCH_MAP[yarn.colorFamily];

  return (
    <ScrollView style={styles.container}>
      {yarn.photoUri ? (
        <Image source={{ uri: yarn.photoUri }} style={styles.photo} />
      ) : (
        <View style={styles.photoPlaceholder}>
          <View
            style={[
              styles.largeSwatch,
              { backgroundColor: swatchColor },
              yarn.colorFamily === 'white' && styles.whiteSwatchBorder,
            ]}
          />
        </View>
      )}

      <View style={styles.content}>
        <Text style={styles.name}>{yarn.name}</Text>

        <View style={styles.detailRow}>
          <DetailItem label="Color" value={yarn.colorFamily} />
          <DetailItem label="Weight" value={yarn.weight} />
        </View>
        <View style={styles.detailRow}>
          <DetailItem label="Fiber" value={yarn.fiberType} />
          <DetailItem label="Yardage" value={`~${yarn.yardageEstimate} yards`} />
        </View>

        <Text style={styles.dateText}>
          Added {new Date(yarn.addedAt).toLocaleDateString()}
        </Text>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate('EditYarn', { yarnId })}
          >
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailItem}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
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
  },
  errorText: {
    fontSize: 16,
    color: THEME.error,
  },
  photo: {
    width: '100%',
    height: 250,
  },
  photoPlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: THEME.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  largeSwatch: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  whiteSwatchBorder: {
    borderWidth: 1,
    borderColor: THEME.border,
  },
  content: {
    padding: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: THEME.text,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 13,
    color: THEME.textSecondary,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
    color: THEME.text,
    textTransform: 'capitalize',
  },
  dateText: {
    fontSize: 13,
    color: THEME.textSecondary,
    marginBottom: 24,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  editButton: {
    flex: 1,
    backgroundColor: THEME.primary,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: THEME.surface,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.error,
  },
  deleteButtonText: {
    color: THEME.error,
    fontSize: 16,
    fontWeight: '600',
  },
});
