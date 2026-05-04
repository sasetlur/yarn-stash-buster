import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Image,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useYarnStore } from '../store/yarnStore';
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

export default function AddYarnScreen({ navigation, route }: Props) {
  const { addYarn, updateYarn, yarns } = useYarnStore();
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
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
        <Text style={styles.label}>Photo (optional)</Text>
        <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.photoPreview} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={styles.photoPlaceholderText}>Tap to add photo</Text>
            </View>
          )}
        </TouchableOpacity>
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

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Estimated Yardage</Text>
        <TextInput
          style={styles.textInput}
          placeholder="e.g. 220"
          placeholderTextColor={THEME.textSecondary}
          value={yardage}
          onChangeText={setYardage}
          keyboardType="numeric"
        />
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
    gap: 8,
  },
  optionChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: THEME.surface,
    borderWidth: 1,
    borderColor: THEME.border,
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
    gap: 6,
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
    borderStyle: 'dashed',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPlaceholderText: {
    fontSize: 14,
    color: THEME.textSecondary,
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
});
