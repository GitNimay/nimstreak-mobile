import React, { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { parseISO } from 'date-fns';
import { useTheme } from '../../lib/theme';
import { useAuthStore } from '../../stores/authStore';
import { useStreakStore } from '../../stores/streakStore';
import {
  fetchStreaks,
  fetchStreakLogs,
  getWeekStatus,
  Streak,
} from '../../lib/streaks';
import StreakCard from '../../components/streak/StreakCard';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuthStore();
  const { streaks, setStreaks, isLoading, setLoading, setError, lastUpdate } =
    useStreakStore();
  const [refreshing, setRefreshing] = useState(false);
  const [streakWeekData, setStreakWeekData] = useState<
    Record<string, { weekStatus: any[]; weekCompletions: number }>
  >({});

  const loadStreaks = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await fetchStreaks(user.id);
      setStreaks(data);

      // Load week data for each streak
      const weekData: Record<
        string,
        { weekStatus: any[]; weekCompletions: number }
      > = {};
      for (const streak of data) {
        try {
          const logs = await fetchStreakLogs(streak.id);
          const logDates = logs.map((l) => parseISO(l.completed_date));
          const weekStatus = getWeekStatus(logDates);
          const weekCompletions = weekStatus.filter(
            (d) => d.status === 'completed'
          ).length;
          weekData[streak.id] = { weekStatus, weekCompletions };
        } catch {
          weekData[streak.id] = { weekStatus: [], weekCompletions: 0 };
        }
      }
      setStreakWeekData(weekData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadStreaks();
  }, [loadStreaks, lastUpdate]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStreaks();
    setRefreshing(false);
  };

  // Find longest streak across all streaks
  const longestOverall = streaks.reduce(
    (max, s) => Math.max(max, s.longest_streak),
    0
  );

  const renderStreakCard = ({
    item,
    index,
  }: {
    item: Streak;
    index: number;
  }) => {
    const weekInfo = streakWeekData[item.id] || {
      weekStatus: [],
      weekCompletions: 0,
    };

    return (
      <StreakCard
        name={item.name}
        description={item.description}
        currentStreak={item.current_streak}
        deadlineType={item.deadline_type as 'specific' | 'forever'}
        deadlineDate={item.deadline_date}
        weekStatus={weekInfo.weekStatus}
        weekCompletions={weekInfo.weekCompletions}
        onPress={() => router.push(`/(app)/streak/${item.id}`)}
        index={index}
      />
    );
  };

  const renderEmpty = () => (
    <Animated.View
      entering={FadeInDown.duration(500)}
      style={styles.emptyContainer}
    >
      <Text style={styles.emptyEmoji}>🔥</Text>
      <Text style={[styles.emptyTitle, { color: theme.foreground }]}>
        NO STREAKS YET
      </Text>
      <Text
        style={[styles.emptySubtitle, { color: theme.mutedForeground }]}
      >
        Start building your first habit streak
      </Text>
      <View style={{ marginTop: 20, width: '100%' }}>
        <Button
          title="CREATE STREAK 🔥"
          onPress={() => router.push('/(app)/streak/create')}
          variant="primary"
        />
      </View>
    </Animated.View>
  );

  const renderHeader = () => (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, { color: theme.foreground }]}>
        YOUR STREAKS
      </Text>
      <TouchableOpacity
        onPress={() => router.push('/(app)/streak/create')}
        style={[
          styles.newButton,
          {
            backgroundColor: theme.primary,
            borderColor: theme.border,
            shadowColor: theme.shadow,
            shadowOffset: { width: 4, height: 4 },
            shadowOpacity: 1,
            shadowRadius: 0,
            elevation: 8,
          },
        ]}
      >
        <Text style={[styles.newButtonText, { color: theme.onPrimary }]}>
          + NEW
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderFooter = () => {
    if (streaks.length === 0) return null;

    return (
      <View style={styles.footerContainer}>
        {/* Milestone Card */}
        {longestOverall > 0 && (
          <Animated.View entering={FadeInDown.delay(300).duration(400)}>
            <Card
              style={{ backgroundColor: theme.tertiaryFixed, marginTop: 16 }}
            >
              <View style={styles.milestoneRow}>
                <Text style={styles.milestoneEmoji}>🔥</Text>
                <Text
                  style={[styles.milestoneText, { color: theme.foreground }]}
                >
                  YOUR LONGEST STREAK: {longestOverall} DAYS
                </Text>
              </View>
            </Card>
          </Animated.View>
        )}

        {/* Motivational Quote */}
        <View
          style={[
            styles.quoteContainer,
            { borderTopColor: theme.border },
          ]}
        >
          <Text
            style={[
              styles.quoteLabel,
              { color: theme.mutedForeground },
            ]}
          >
            TODAY'S MANIFESTO
          </Text>
          <Text
            style={[styles.quoteText, { color: theme.foreground }]}
          >
            "DISCIPLINE IS THE BRIDGE BETWEEN GOALS AND ACCOMPLISHMENT."
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: theme.background }]}
    >
      {/* Content */}
      <FlatList
        data={streaks}
        renderItem={renderStreakCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 32,
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 22,
    textTransform: 'uppercase',
    letterSpacing: -1.5,
  },
  newButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 2,
    borderRadius: 0,
  },
  newButtonText: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 24,
    textTransform: 'uppercase',
    letterSpacing: -1,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontFamily: 'DMSans-Regular',
    fontSize: 15,
    textAlign: 'center',
  },
  footerContainer: {
    marginTop: 8,
    paddingBottom: 20,
  },
  milestoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  milestoneEmoji: {
    fontSize: 28,
  },
  milestoneText: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 14,
    textTransform: 'uppercase',
    flex: 1,
    lineHeight: 20,
  },
  quoteContainer: {
    marginTop: 32,
    paddingTop: 24,
    paddingBottom: 40,
  },
  quoteLabel: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 3,
    marginBottom: 16,
  },
  quoteText: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 24,
    lineHeight: 30,
    textTransform: 'uppercase',
    letterSpacing: -1.5,
    fontStyle: 'italic',
  },
});
