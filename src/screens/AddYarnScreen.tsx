import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Image,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useYarnStore } from '../store/yarnStore';
import { useSettingsStore } from '../store/settingsStore';
import { searchYarns, RavelryYarn } from '../api/ravelry';
import { analyzeYarnPhoto, YarnAnalysis } from '../api/claude';
import { CLAUDE_API_KEY } from '../config/local';
import { THEME, COLOR_SWATCH_MAP } from '../constants/colors';
import { StashStackParamList } from '../navigation/AppNavigator';
import {
  COLOR_FAMILIES,
  YARN_WEIGHTS,
  FIBER_TYPES,
  ColorFamily,
  YarnWeight,
  FiberType,
} from '../types/yarn';

type Props = {
  navigation: NativeStackNavigationProp<StashStackParamList, 'AddYarn' | 'EditYarn'>;
  route: RouteProp<StashStackParamList, 'AddYarn' | 'EditYarn'>;
};

function SelectorGrid<T extends string>({
  label,
  options,
  selected,
  onSelect,
  renderOption,
}: {
  label: string;
  options: readonly T[];
  selected: T | null;
  onSelect: (value: T) => void;
  renderOption?: (value: T, isSelected: boolean) => React.ReactNode;
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.optionGrid}>
        {options.map((option) => {
          const isSelected = selected === option;
          return (
            <TouchableOpacity
              key={option}
              style={[styles.optionChip, isSelected && styles.optionChipSelected]}
              onPress={() => onSelect(option)}
            >
              {renderOption ? (
                renderOption(option, isSelected)
              ) : (
                <Text
                  style={[
                    styles.optionText,
                    isSelected && styles.optionTextSelected,
                  ]}
                >
                  {option}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// Map Ravelry weight names to our weight enum
function mapRavelryWeight(ravelryWeight?: string): YarnWeight | null {
  if (!ravelryWeight) return null;
  const lower = ravelryWeight.toLowerCase();
  if (lower.includes('lace')) return 'lace';
  if (lower.includes('fingering')) return 'fingering';
  if (lower.includes('sport')) return 'sport';
  if (lower.includes('dk')) return 'DK';
  if (lower.includes('worsted')) return 'worsted';
  if (lower.includes('aran')) return 'aran';
  if (lower.includes('bulky') && !lower.includes('super')) return 'bulky';
  if (lower.includes('super bulky') || lower.includes('super-bulky')) return 'super-bulky';
  return null;
}

export default function AddYarnScreen({ navigation, route }: Props) {
  const { addYarn, updateYarn, yarns } = useYarnStore();
  const { ravelryUsername, ravelryPassword, hasRavelryCredentials } = useSettingsStore();
  const editId = route.params && 'yarnId' in route.params ? route.params.yarnId : null;
  const existingYarn = editId ? yarns.find((y) => y.id === editId) : null;

  const [name, setName] = useState(existingYarn?.name ?? '');
  const [colorFamily, setColorFamily] = useState<ColorFamily | null>(
    existingYarn?.colorFamily ?? null
  );
  const [weight, setWeight] = useState<YarnWeight | null>(
    existingYarn?.weight ?? null
  );
  const [fiberType, setFiberType] = useState<FiberType | null>(
    existingYarn?.fiberType ?? null
  );
  const [yardage, setYardage] = useState(
    existingYarn?.yardageEstimate?.toString() ?? ''
  );
  const [photoUri, setPhotoUri] = useState<string | undefined>(
    existingYarn?.photoUri
  );
  const [numberOfBalls, setNumberOfBalls] = useState('1');

  // Yarn search state
  const [yarnSearchQuery, setYarnSearchQuery] = useState('');
  const [yarnSearchResults, setYarnSearchResults] = useState<RavelryYarn[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedRavelryYarn, setSelectedRavelryYarn] = useState<RavelryYarn | null>(null);
  const [yardagePerBall, setYardagePerBall] = useState<number | null>(null);

  // AI analysis state
  const [analyzing, setAnalyzing] = useState(false);
  const [aiNotes, setAiNotes] = useState<string | null>(null);
  const hasClaudeKey = CLAUDE_API_KEY.trim().length > 0;

  const handleYarnSearch = useCallback(async () => {
    if (!yarnSearchQuery.trim() || !hasRavelryCredentials()) return;
    setSearching(true);
    try {
      const result = await searchYarns({
        username: ravelryUsername,
        password: ravelryPassword,
        query: yarnSearchQuery.trim(),
      });
      setYarnSearchResults(result.yarns);
    } catch (err: any) {
      Alert.alert('Search failed', err.message);
    } finally {
      setSearching(false);
    }
  }, [yarnSearchQuery, ravelryUsername, ravelryPassword]);

  const selectRavelryYarn = (yarn: RavelryYarn) => {
    setSelectedRavelryYarn(yarn);
    setYarnSearchResults([]);
    setYarnSearchQuery('');

    // Auto-fill fields from Ravelry data
    if (!name) {
      setName(`${yarn.yarn_company_name} ${yarn.name}`);
    }

    if (yarn.yardage) {
      setYardagePerBall(yarn.yardage);
      const balls = parseInt(numberOfBalls, 10) || 1;
      setYardage(String(yarn.yardage * balls));
    }

    const mappedWeight = mapRavelryWeight(yarn.yarn_weight?.name);
    if (mappedWeight) {
      setWeight(mappedWeight);
    }
  };

  // Recalculate yardage when number of balls changes
  const handleBallsChange = (value: string) => {
    setNumberOfBalls(value);
    if (yardagePerBall) {
      const balls = parseInt(value, 10) || 0;
      setYardage(String(yardagePerBall * balls));
    }
  };

  const handleAnalyzePhoto = async (uri: string) => {
    if (!hasClaudeKey) return;
    setAnalyzing(true);
    setAiNotes(null);
    try {
      const analysis = await analyzeYarnPhoto({
        apiKey: CLAUDE_API_KEY,
        photoUri: uri,
      });
      setColorFamily(analysis.colorFamily);
      setWeight(analysis.weight);
      setFiberType(analysis.fiberType);
      setAiNotes(analysis.notes);
    } catch (err: any) {
      Alert.alert('AI Analysis Failed', err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Missing info', 'Please give your yarn a name.');
      return;
    }
    if (!colorFamily) {
      Alert.alert('Missing info', 'Please select a color.');
      return;
    }
    if (!weight) {
      Alert.alert('Missing info', 'Please select a yarn weight.');
      return;
    }
    if (!fiberType) {
      Alert.alert('Missing info', 'Please select a fiber type.');
      return;
    }
    const yardageNum = parseInt(yardage, 10);
    if (!yardage || isNaN(yardageNum) || yardageNum <= 0) {
      Alert.alert('Missing info', 'Please enter estimated yardage.');
      return;
    }

    if (editId) {
      await updateYarn(editId, {
        name: name.trim(),
        colorFamily,
        weight,
        fiberType,
        yardageEstimate: yardageNum,
        photoUri,
      });
    } else {
      await addYarn({
        name: name.trim(),
        colorFamily,
        weight,
        fiberType,
        yardageEstimate: yardageNum,
        photoUri,
      });
    }
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      {/* Yarn Lookup Section */}
      {hasRavelryCredentials() && (
        <View style={styles.lookupSection}>
          <Text style={styles.label}>Look up yarn (optional)</Text>
          <Text style={styles.helperText}>
            Search by brand and yarn name to auto-fill weight and yardage
          </Text>
          <View style={styles.searchRow}>
            <TextInput
              style={[styles.textInput, styles.searchInput]}
              placeholder='e.g. "Malabrigo Rios"'
              placeholderTextColor={THEME.textSecondary}
              value={yarnSearchQuery}
              onChangeText={setYarnSearchQuery}
              onSubmitEditing={handleYarnSearch}
              returnKeyType="search"
            />
            <TouchableOpacity
              style={styles.searchButton}
              onPress={handleYarnSearch}
              disabled={searching}
            >
              {searching ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.searchButtonText}>Search</Text>
              )}
            </TouchableOpacity>
          </View>

          {yarnSearchResults.length > 0 && (
            <View style={styles.searchResults}>
              {yarnSearchResults.map((yarn) => (
                <TouchableOpacity
                  key={yarn.id}
                  style={styles.searchResultItem}
                  onPress={() => selectRavelryYarn(yarn)}
                >
                  {yarn.first_photo?.small_url && (
                    <Image
                      source={{ uri: yarn.first_photo.small_url }}
                      style={styles.searchResultImage}
                    />
                  )}
                  <View style={styles.searchResultInfo}>
                    <Text style={styles.searchResultName} numberOfLines={1}>
                      {yarn.name}
                    </Text>
                    <Text style={styles.searchResultMeta} numberOfLines={1}>
                      {yarn.yarn_company_name}
                      {yarn.yardage ? ` · ${yarn.yardage} yds/skein` : ''}
                      {yarn.yarn_weight?.name ? ` · ${yarn.yarn_weight.name}` : ''}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {selectedRavelryYarn && (
            <View style={styles.selectedYarnBadge}>
              <Text style={styles.selectedYarnText}>
                Using: {selectedRavelryYarn.yarn_company_name} {selectedRavelryYarn.name}
                {yardagePerBall ? ` (${yardagePerBall} yds/skein)` : ''}
              </Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.textInput}
          placeholder='e.g. "Blue merino from grandma"'
          placeholderTextColor={THEME.textSecondary}
          value={name}
          onChangeText={setName}
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Photo</Text>
        <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.photoPreview} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={styles.photoPlaceholderText}>Tap to add photo</Text>
              {hasClaudeKey && (
                <Text style={styles.photoPlaceholderHint}>
                  AI will detect color, weight, and fiber
                </Text>
              )}
            </View>
          )}
        </TouchableOpacity>
        {photoUri && hasClaudeKey && (
          <TouchableOpacity
            style={[styles.analyzeButton, analyzing && styles.analyzeButtonDisabled]}
            onPress={() => handleAnalyzePhoto(photoUri)}
            disabled={analyzing}
          >
            {analyzing ? (
              <View style={styles.analyzeRow}>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.analyzeButtonText}>Analyzing yarn...</Text>
              </View>
            ) : (
              <Text style={styles.analyzeButtonText}>Analyze with AI</Text>
            )}
          </TouchableOpacity>
        )}
        {aiNotes && (
          <View style={styles.aiResultBadge}>
            <Text style={styles.aiResultLabel}>AI detected:</Text>
            <Text style={styles.aiResultText}>{aiNotes}</Text>
            <Text style={styles.aiResultHint}>Fields below have been pre-filled. Adjust if needed.</Text>
          </View>
        )}
      </View>

      <SelectorGrid
        label="Color"
        options={COLOR_FAMILIES}
        selected={colorFamily}
        onSelect={setColorFamily}
        renderOption={(color, isSelected) => (
          <View style={styles.colorOption}>
            <View
              style={[
                styles.colorDot,
                { backgroundColor: COLOR_SWATCH_MAP[color] },
                color === 'white' && { borderWidth: 1, borderColor: THEME.border },
              ]}
            />
            <Text
              style={[
                styles.colorLabel,
                isSelected && styles.optionTextSelected,
              ]}
            >
              {color}
            </Text>
          </View>
        )}
      />

      <SelectorGrid
        label="Weight"
        options={YARN_WEIGHTS}
        selected={weight}
        onSelect={setWeight}
      />

      <SelectorGrid
        label="Fiber"
        options={FIBER_TYPES}
        selected={fiberType}
        onSelect={setFiberType}
      />

      {/* Yardage section */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Yardage</Text>
        {yardagePerBall ? (
          <View>
            <Text style={styles.helperText}>
              {yardagePerBall} yards per skein — how many skeins do you have?
            </Text>
            <View style={styles.ballsRow}>
              <TextInput
                style={[styles.textInput, styles.ballsInput]}
                value={numberOfBalls}
                onChangeText={handleBallsChange}
                keyboardType="numeric"
                placeholder="1"
              />
              <Text style={styles.ballsLabel}>
                skeins = {yardage} yards total
              </Text>
            </View>
          </View>
        ) : (
          <View>
            <Text style={styles.helperText}>
              Enter total estimated yardage, or search for your yarn above to auto-calculate
            </Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. 220"
              placeholderTextColor={THEME.textSecondary}
              value={yardage}
              onChangeText={setYardage}
              keyboardType="numeric"
            />
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>
          {editId ? 'Save Changes' : 'Add to Stash'}
        </Text>
      </TouchableOpacity>
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
  fieldGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: THEME.text,
    marginBottom: 8,
  },
  helperText: {
    fontSize: 13,
    color: THEME.textSecondary,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: THEME.surface,
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: THEME.text,
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  optionChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: THEME.surface,
    borderWidth: 1,
    borderColor: THEME.border,
    marginRight: 8,
    marginBottom: 8,
  },
  optionChipSelected: {
    backgroundColor: THEME.primary,
    borderColor: THEME.primary,
  },
  optionText: {
    fontSize: 13,
    color: THEME.text,
  },
  optionTextSelected: {
    color: '#fff',
  },
  colorOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  colorLabel: {
    fontSize: 13,
    color: THEME.text,
  },
  photoButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  photoPreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  photoPlaceholder: {
    width: '100%',
    height: 120,
    backgroundColor: THEME.surface,
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPlaceholderText: {
    fontSize: 14,
    color: THEME.textSecondary,
  },
  photoPlaceholderHint: {
    fontSize: 12,
    color: THEME.primaryLight,
    marginTop: 4,
  },
  analyzeButton: {
    backgroundColor: '#2563EB',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  analyzeButtonDisabled: {
    opacity: 0.7,
  },
  analyzeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  analyzeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  aiResultBadge: {
    marginTop: 10,
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  aiResultLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1D4ED8',
    marginBottom: 4,
  },
  aiResultText: {
    fontSize: 13,
    color: THEME.text,
    lineHeight: 18,
  },
  aiResultHint: {
    fontSize: 12,
    color: THEME.textSecondary,
    marginTop: 6,
    fontStyle: 'italic',
  },
  saveButton: {
    backgroundColor: THEME.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Yarn lookup styles
  lookupSection: {
    backgroundColor: THEME.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  searchRow: {
    flexDirection: 'row',
  },
  searchInput: {
    flex: 1,
    marginRight: 8,
  },
  searchButton: {
    backgroundColor: THEME.primary,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  searchResults: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: THEME.border,
    paddingTop: 8,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  searchResultImage: {
    width: 40,
    height: 40,
    borderRadius: 4,
    marginRight: 10,
  },
  searchResultInfo: {
    flex: 1,
  },
  searchResultName: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.text,
  },
  searchResultMeta: {
    fontSize: 12,
    color: THEME.textSecondary,
    marginTop: 2,
  },
  selectedYarnBadge: {
    marginTop: 10,
    backgroundColor: '#F3E8FF',
    padding: 10,
    borderRadius: 6,
  },
  selectedYarnText: {
    fontSize: 13,
    color: THEME.primary,
    fontWeight: '500',
  },
  ballsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ballsInput: {
    width: 60,
    textAlign: 'center',
    marginRight: 10,
  },
  ballsLabel: {
    fontSize: 15,
    color: THEME.text,
  },
});
