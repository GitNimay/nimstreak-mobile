import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeInDown,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { format, parseISO } from 'date-fns';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../../lib/theme';
import { useAuthStore } from '../../../stores/authStore';
import { useStreakStore } from '../../../stores/streakStore';
import {
  fetchStreak,
  fetchStreakLogs,
  fetchSubtasks,
  fetchSubtaskCompletions,
  markStreakComplete,
  toggleSubtaskCompletion,
  isCompletedToday,
  isStreakBroken,
  getWeekStatus,
  getMonthHeatmap,
  calculateCurrentStreak,
  deleteStreak,
} from '../../../lib/streaks';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import WeekStrip from '../../../components/streak/WeekStrip';
import HeatmapGrid from '../../../components/streak/HeatmapGrid';
import SubtaskItem from '../../../components/streak/SubtaskItem';

export default function StreakDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const {
    currentStreak,
    setCurrentStreak,
    streakLogs,
    setStreakLogs,
    subtasks,
    setSubtasks,
    subtaskCompletions,
    setSubtaskCompletions,
    updateStreak,
    lastUpdate,
  } = useStreakStore();

  const [loading, setLoading] = useState(true);
  const [markingComplete, setMarkingComplete] = useState(false);
  const [completedToday, setCompletedToday] = useState(false);
  const [broken, setBroken] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // Animation values
  const buttonScale = useSharedValue(1);
  const successFlash = useSharedValue(0);

  const loadData = useCallback(async () => {
    if (!id || !user) return;
    try {
      setLoading(true);
      const [streak, logs, tasks] = await Promise.all([
        fetchStreak(id),
        fetchStreakLogs(id),
        fetchSubtasks(id),
      ]);

      setCurrentStreak(streak);
      setStreakLogs(logs);
      setSubtasks(tasks);

      const logDates = logs.map((l) => parseISO(l.completed_date));
      setCompletedToday(isCompletedToday(logDates));
      setBroken(isStreakBroken(logDates));

      // Load today's subtask completions
      const today = format(new Date(), 'yyyy-MM-dd');
      const completions = await fetchSubtaskCompletions(id, today);
      setSubtaskCompletions(completions);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    loadData();
  }, [loadData, lastUpdate]);

  const handleMarkComplete = async () => {
    if (!id || !user || completedToday || markingComplete) return;

    setMarkingComplete(true);
    try {
      await Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success
      );

      // Button animation
      buttonScale.value = withSequence(
        withTiming(0.95, { duration: 100 }),
        withSpring(1.1, { damping: 4, stiffness: 300 }),
        withTiming(1, { duration: 200 })
      );

      // Success flash
      successFlash.value = withSequence(
        withTiming(1, { duration: 200 }),
        withTiming(0, { duration: 500 })
      );

      await markStreakComplete(id, user.id);
      await loadData();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to mark complete');
    } finally {
      setMarkingComplete(false);
    }
  };

  const handleToggleSubtask = async (
    subtaskId: string,
    isCompleted: boolean
  ) => {
    if (!id) return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const today = format(new Date(), 'yyyy-MM-dd');
      await toggleSubtaskCompletion(subtaskId, id, today, isCompleted);
      const completions = await fetchSubtaskCompletions(id, today);
      setSubtaskCompletions(completions);
    } catch (err) {
      console.error(err);
    }
  };

  const logDates = streakLogs.map((l) => parseISO(l.completed_date));
  const weekStatus = getWeekStatus(logDates);
  const heatmapData = getMonthHeatmap(logDates);
  const weekCompletions = weekStatus.filter(
    (d) => d.status === 'completed'
  ).length;

  const buttonAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const flashAnimStyle = useAnimatedStyle(() => ({
    opacity: successFlash.value,
  }));

  const getStatusBadge = () => {
    if (completedToday) {
      return { text: 'ON TRACK', variant: 'success' as const };
    }
    if (broken) {
      return { text: 'STREAK BROKEN', variant: 'danger' as const };
    }
    return { text: 'COMPLETE TODAY', variant: 'info' as const };
  };

  const status = getStatusBadge();
  const streakCount = currentStreak?.current_streak || 0;

  if (loading || !currentStreak) {
    return (
      <SafeAreaView
        style={[styles.safe, { backgroundColor: theme.background }]}
      >
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.mutedForeground }]}>
            Loading...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: theme.background }]}
    >
      {/* Top Navigation */}
      <View
        style={[
          styles.topBar,
          {
            backgroundColor: theme.background,
            borderBottomColor: theme.border,
          },
        ]}
      >
        <View style={styles.topBarLeft}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={theme.foreground}
            />
          </TouchableOpacity>
          <Text
            style={[styles.topBarTitle, { color: theme.foreground }]}
            numberOfLines={1}
          >
            {currentStreak.name}
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.moreButton,
            {
              borderColor: theme.border,
            },
          ]}
          onPress={() => setShowMenu(true)}
        >
          <Ionicons
            name="ellipsis-vertical"
            size={18}
            color={theme.foreground}
          />
        </TouchableOpacity>
      </View>

      <Modal visible={showMenu} transparent animationType="fade">
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setShowMenu(false)}
        >
          <View style={[styles.menuContainer, { backgroundColor: theme.card, borderColor: theme.border, shadowColor: theme.shadow }]}>
            <TouchableOpacity
              style={[styles.menuItem, { borderBottomColor: theme.border, borderBottomWidth: 2 }]}
              onPress={() => {
                setShowMenu(false);
                router.push(`/(app)/streak/edit?id=${id}`);
              }}
            >
              <Ionicons name="pencil" size={18} color={theme.foreground} />
              <Text style={[styles.menuText, { color: theme.foreground }]}>EDIT STREAK</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setShowMenu(false);
                Alert.alert('Delete Streak', 'Are you sure you want to delete this streak? This cannot be undone.', [
                  { text: 'Cancel', style: 'cancel' },
                  { 
                    text: 'Delete', 
                    style: 'destructive', 
                    onPress: async () => {
                      try {
                        await deleteStreak(id as string);
                        useStreakStore.getState().triggerUpdate();
                        router.back();
                      } catch (err: any) {
                        Alert.alert('Error', err.message);
                      }
                    }
                  }
                ]);
              }}
            >
              <Ionicons name="trash" size={18} color={theme.error} />
              <Text style={[styles.menuText, { color: theme.error }]}>DELETE STREAK</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <Animated.View
          entering={FadeIn.duration(600)}
          style={styles.heroSection}
        >
          <Badge text={status.text} variant={status.variant} />

          {/* Giant Streak Number with Shadow */}
          <View style={styles.streakNumberContainer}>
            {/* Shadow text behind */}
            <Text
              style={[
                styles.streakNumberShadow,
                { color: theme.primary },
              ]}
            >
              {streakCount.toString().padStart(2, '0')}
            </Text>
            {/* Main text */}
            <Text
              style={[
                styles.streakNumber,
                { color: theme.foreground },
              ]}
            >
              {streakCount.toString().padStart(2, '0')}
            </Text>
          </View>

          <Text style={[styles.dayStreakLabel, { color: theme.foreground }]}>
            DAY STREAK 🔥
          </Text>
        </Animated.View>

        {/* Success Flash Overlay */}
        <Animated.View
          style={[
            styles.flashOverlay,
            { backgroundColor: theme.success },
            flashAnimStyle,
          ]}
          pointerEvents="none"
        />

        {/* Week Strip */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <WeekStrip weekStatus={weekStatus} />
        </Animated.View>

        {/* Stats Row */}
        <Animated.View
          entering={FadeInDown.delay(300).duration(400)}
          style={styles.statsRow}
        >
          <Card style={styles.statCard}>
            <Text
              style={[
                styles.statLabel,
                { color: theme.mutedForeground },
              ]}
            >
              LONGEST
            </Text>
            <Text
              style={[styles.statValue, { color: theme.foreground }]}
            >
              {currentStreak.longest_streak}d
            </Text>
          </Card>
          <Card style={styles.statCard}>
            <Text
              style={[
                styles.statLabel,
                { color: theme.mutedForeground },
              ]}
            >
              TOTAL
            </Text>
            <Text
              style={[styles.statValue, { color: theme.foreground }]}
            >
              {currentStreak.total_completions}d
            </Text>
          </Card>
          <Card
            style={[
              styles.statCard,
              { backgroundColor: theme.tertiaryFixed },
            ]}
          >
            <Text
              style={[
                styles.statLabel,
                { color: theme.foreground },
              ]}
            >
              THIS WEEK
            </Text>
            <Text
              style={[styles.statValue, { color: theme.foreground }]}
            >
              {weekCompletions}/7
            </Text>
          </Card>
        </Animated.View>

        {/* Subtasks / Today's Checklist */}
        {subtasks.length > 0 && (
          <Animated.View entering={FadeInDown.delay(400).duration(400)}>
            <View style={styles.checklistHeader}>
              <View
                style={[
                  styles.checklistBar,
                  { backgroundColor: theme.primary },
                ]}
              />
              <Text
                style={[
                  styles.checklistTitle,
                  { color: theme.foreground },
                ]}
              >
                TODAY'S CHECKLIST
              </Text>
            </View>
            {subtasks.map((task) => {
              const isCompleted = subtaskCompletions.some(
                (c) => c.subtask_id === task.id
              );
              return (
                <SubtaskItem
                  key={task.id}
                  title={task.title}
                  completed={isCompleted}
                  onToggle={() =>
                    handleToggleSubtask(task.id, isCompleted)
                  }
                />
              );
            })}
          </Animated.View>
        )}

        {/* Monthly Heatmap */}
        <Animated.View
          entering={FadeInDown.delay(500).duration(400)}
          style={{ marginTop: 24 }}
        >
          <HeatmapGrid heatmapData={heatmapData} month={new Date()} />
        </Animated.View>
      </ScrollView>

      {/* Fixed Bottom Action */}
      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: theme.card,
            borderTopColor: theme.border,
          },
        ]}
      >
        <Animated.View style={buttonAnimStyle}>
          <TouchableOpacity
            onPress={handleMarkComplete}
            disabled={completedToday || markingComplete}
            activeOpacity={0.9}
            style={[
              styles.markButton,
              {
                backgroundColor: completedToday
                  ? theme.success
                  : theme.primary,
                borderColor: theme.border,
                shadowColor: theme.shadow,
                shadowOffset: { width: 4, height: 4 },
                shadowOpacity: 1,
                shadowRadius: 0,
                elevation: 8,
                opacity: completedToday ? 0.8 : 1,
              },
            ]}
          >
            {completedToday ? (
              <View style={styles.markButtonContent}>
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={theme.onPrimary}
                />
                <Text
                  style={[
                    styles.markButtonText,
                    { color: theme.onPrimary },
                  ]}
                >
                  COMPLETED TODAY ✓
                </Text>
              </View>
            ) : (
              <Text
                style={[
                  styles.markButtonText,
                  { color: theme.onPrimary },
                ]}
              >
                MARK TODAY COMPLETE 🔥
              </Text>
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontFamily: 'SpaceMono-Regular',
    fontSize: 14,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    height: 56,
    borderBottomWidth: 2,
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  backButton: {
    padding: 4,
  },
  topBarTitle: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 16,
    textTransform: 'uppercase',
    letterSpacing: -0.5,
    flex: 1,
  },
  moreButton: {
    width: 36,
    height: 36,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 140,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  streakNumberContainer: {
    position: 'relative',
    marginVertical: 8,
  },
  streakNumberShadow: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 120,
    lineHeight: 120,
    position: 'absolute',
    left: 6,
    top: 6,
    opacity: 0.3,
  },
  streakNumber: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 120,
    lineHeight: 120,
  },
  dayStreakLabel: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 18,
    textTransform: 'uppercase',
    letterSpacing: 4,
    marginTop: 4,
  },
  flashOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 0,
    zIndex: 10,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 24,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
  },
  statLabel: {
    fontFamily: 'SpaceMono-Regular',
    fontSize: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  statValue: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 18,
  },
  checklistHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    marginTop: 8,
  },
  checklistBar: {
    width: 4,
    height: 20,
  },
  checklistTitle: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    borderTopWidth: 2,
  },
  markButton: {
    width: '100%',
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderRadius: 0,
  },
  markButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  markButtonText: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 16,
    textTransform: 'uppercase',
    letterSpacing: -0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  menuContainer: {
    position: 'absolute',
    top: 60,
    right: 24,
    borderWidth: 2,
    borderRadius: 0,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
    minWidth: 180,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  menuText: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 14,
    textTransform: 'uppercase',
  },
});
