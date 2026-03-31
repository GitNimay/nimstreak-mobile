import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  Alert,
  KeyboardAvoidingView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { useTheme } from '../../../lib/theme';
import { useAuthStore } from '../../../stores/authStore';
import { useStreakStore } from '../../../stores/streakStore';
import { updateStreak, fetchStreak, fetchSubtasks } from '../../../lib/streaks';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

export default function EditStreakScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuthStore();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { triggerUpdate } = useStreakStore();
  const [initialLoading, setInitialLoading] = useState(true);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [deadlineType, setDeadlineType] = useState<'forever' | 'specific'>(
    'forever'
  );
  const [deadlineDate, setDeadlineDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [subtaskInput, setSubtaskInput] = useState('');
  const [subtasks, setSubtasks] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    async function load() {
      if (!id) return;
      try {
        const [streak, tasks] = await Promise.all([
          fetchStreak(id),
          fetchSubtasks(id)
        ]);
        if (streak) {
          setName(streak.name);
          setDescription(streak.description || '');
          setDeadlineType(streak.deadline_type);
          if (streak.deadline_date) setDeadlineDate(new Date(streak.deadline_date));
          setSubtasks(tasks.map((t: any) => t.title));
        }
      } catch(e) {
        console.error(e);
      } finally {
        setInitialLoading(false);
      }
    }
    load();
  }, [id]);

  const addSubtask = () => {
    if (!subtaskInput.trim()) return;
    if (subtasks.length >= 10) {
      Alert.alert('Limit Reached', 'Maximum 10 subtasks allowed');
      return;
    }
    setSubtasks([...subtasks, subtaskInput.trim()]);
    setSubtaskInput('');
  };

  const removeSubtask = (index: number) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Streak name is required');
      return;
    }
    if (!user || !id) return;

    setError(null);
    setLoading(true);
    try {
      await updateStreak(
        id,
        name.trim(),
        description.trim() || null,
        deadlineType,
        deadlineType === 'specific'
          ? format(deadlineDate, 'yyyy-MM-dd')
          : null,
        subtasks
      );
      triggerUpdate();
      router.back();
    } catch (err: any) {
      setError(err.message || 'Failed to update streak');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) return null;

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: theme.background }]}
    >
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Top Nav */}
      <View
        style={[
          styles.topNav,
          { backgroundColor: theme.background },
        ]}
      >
        <View style={styles.topNavLeft}>
          <Ionicons name="flame" size={20} color={theme.primary} />
          <Text style={[styles.topNavTitle, { color: theme.foreground }]}>
            NIMSTREAK
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[
            styles.closeButton,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
              shadowColor: theme.shadow,
              shadowOffset: { width: 4, height: 4 },
              shadowOpacity: 1,
              shadowRadius: 0,
              elevation: 8,
            },
          ]}
        >
          <Ionicons name="close" size={20} color={theme.foreground} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Title */}
        <View style={styles.header}>
          <Text style={[styles.pageTitle, { color: theme.foreground }]}>
            EDIT STREAK
          </Text>
          <View
            style={[styles.titleBar, { backgroundColor: theme.primary }]}
          />
        </View>

        {/* Streak Name */}
        <Input
          label="Streak Name"
          placeholder="e.g. Morning Run"
          value={name}
          onChangeText={setName}
        />

        {/* Description */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: theme.foreground }]}>
            WHAT IS THIS STREAK?
          </Text>
          <TextInput
            placeholder="Description (optional)"
            placeholderTextColor={theme.mutedForeground + '60'}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            style={[
              styles.textarea,
              {
                color: theme.foreground,
                borderColor: theme.border,
                backgroundColor: theme.card,
                shadowColor: theme.shadow,
                shadowOffset: { width: 4, height: 4 },
                shadowOpacity: 1,
                shadowRadius: 0,
                elevation: 8,
              },
            ]}
          />
        </View>

        {/* Deadline Toggle */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: theme.foreground }]}>
            DEADLINE
          </Text>
          <View
            style={[
              styles.toggleContainer,
              {
                borderColor: theme.border,
                shadowColor: theme.shadow,
                shadowOffset: { width: 4, height: 4 },
                shadowOpacity: 1,
                shadowRadius: 0,
                elevation: 8,
              },
            ]}
          >
            <TouchableOpacity
              onPress={() => {
                setDeadlineType('specific');
                setShowDatePicker(true);
              }}
              style={[
                styles.toggleButton,
                {
                  backgroundColor:
                    deadlineType === 'specific'
                      ? theme.primary
                      : theme.card,
                  borderRightWidth: 2,
                  borderRightColor: theme.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.toggleText,
                  {
                    color:
                      deadlineType === 'specific'
                        ? theme.onPrimary
                        : theme.foreground,
                  },
                ]}
              >
                SPECIFIC DATE
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setDeadlineType('forever');
                setShowDatePicker(false);
              }}
              style={[
                styles.toggleButton,
                {
                  backgroundColor:
                    deadlineType === 'forever'
                      ? theme.primary
                      : theme.card,
                },
              ]}
            >
              <Text
                style={[
                  styles.toggleText,
                  {
                    color:
                      deadlineType === 'forever'
                        ? theme.onPrimary
                        : theme.foreground,
                  },
                ]}
              >
                ∞ FOREVER
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Date Picker UI Button */}
        {deadlineType === 'specific' && (
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            style={[
              styles.datePickerContainer,
              {
                backgroundColor: theme.card,
                borderColor: theme.border,
                shadowColor: theme.shadow,
                shadowOffset: { width: 4, height: 4 },
                shadowOpacity: 1,
                shadowRadius: 0,
                elevation: 8,
              },
            ]}
          >
            <Text style={{ fontFamily: 'SpaceMono-Bold', color: theme.foreground, textAlign: 'center', fontSize: 16 }}>
              {format(deadlineDate, 'MMM dd, yyyy')}
            </Text>
            <Text style={{ fontFamily: 'DMSans-Regular', color: theme.mutedForeground, textAlign: 'center', fontSize: 11, marginTop: 4 }}>
              TAP TO CHANGE
            </Text>
          </TouchableOpacity>
        )}

        {/* Date Picker Modal */}
        {showDatePicker && (
          <DateTimePicker
            value={deadlineDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            minimumDate={new Date()}
            onChange={(event, date) => {
              if (Platform.OS === 'android') setShowDatePicker(false);
              if (event.type === 'set' && date) setDeadlineDate(date);
            }}
          />
        )}

        {/* Subtasks */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: theme.foreground }]}>
            ADD SUBTASKS
          </Text>

          {/* Existing subtasks */}
          {subtasks.length > 0 && (
            <View style={styles.subtasksList}>
              {subtasks.map((task, index) => (
                <View
                  key={index}
                  style={[
                    styles.subtaskChip,
                    {
                      backgroundColor: theme.card,
                      borderColor: theme.border,
                      shadowColor: theme.shadow,
                      shadowOffset: { width: 2, height: 2 },
                      shadowOpacity: 1,
                      shadowRadius: 0,
                      elevation: 4,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.subtaskChipText,
                      { color: theme.foreground },
                    ]}
                  >
                    {task}
                  </Text>
                  <TouchableOpacity onPress={() => removeSubtask(index)}>
                    <Ionicons
                      name="close"
                      size={14}
                      color={theme.foreground}
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Add subtask input */}
          <View style={styles.addSubtaskRow}>
            <TextInput
              placeholder="Enter subtask..."
              placeholderTextColor={theme.mutedForeground + '60'}
              value={subtaskInput}
              onChangeText={setSubtaskInput}
              onSubmitEditing={addSubtask}
              style={[
                styles.subtaskInput,
                {
                  color: theme.foreground,
                  borderColor: theme.border,
                  backgroundColor: theme.card,
                },
              ]}
            />
            <TouchableOpacity
              onPress={addSubtask}
              style={[
                styles.addButton,
                {
                  backgroundColor: theme.foreground,
                  borderColor: theme.border,
                },
              ]}
            >
              <Text
                style={[styles.addButtonText, { color: theme.background }]}
              >
                ADD
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {error && (
          <Text style={[styles.errorText, { color: theme.error }]}>
            {error}
          </Text>
        )}

        {/* Inline Bottom Button */}
        <View style={{ marginTop: 40, paddingBottom: 24 }}>
          <Button
            title="SAVE CHANGES 🔥"
            onPress={handleSave}
            loading={loading}
            variant="primary"
          />
        </View>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  topNavLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  topNavTitle: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 24,
    letterSpacing: -2,
    textTransform: 'uppercase',
    fontStyle: 'italic',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 120,
  },
  header: {
    marginBottom: 32,
  },
  pageTitle: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 40,
    textTransform: 'uppercase',
    letterSpacing: -3,
    lineHeight: 42,
  },
  titleBar: {
    height: 6,
    width: 80,
    marginTop: 12,
  },
  fieldGroup: {
    marginTop: 24,
  },
  fieldLabel: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 8,
  },
  textarea: {
    borderWidth: 2,
    borderRadius: 0,
    padding: 16,
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  toggleContainer: {
    flexDirection: 'row',
    borderWidth: 2,
    borderRadius: 0,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  toggleText: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  datePickerContainer: {
    borderWidth: 2,
    borderRadius: 0,
    padding: 16,
    marginTop: 12,
  },
  subtasksList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  subtaskChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 2,
  },
  subtaskChipText: {
    fontFamily: 'SpaceMono-Regular',
    fontSize: 12,
  },
  addSubtaskRow: {
    flexDirection: 'row',
    gap: 8,
  },
  subtaskInput: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 0,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: 'SpaceMono-Regular',
    fontSize: 13,
  },
  addButton: {
    paddingHorizontal: 20,
    justifyContent: 'center',
    borderWidth: 2,
  },
  addButtonText: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  errorText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 13,
    marginTop: 12,
  },
});
