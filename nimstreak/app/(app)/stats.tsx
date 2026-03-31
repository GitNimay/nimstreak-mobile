import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { parseISO, format } from 'date-fns';
import { useTheme } from '../../lib/theme';
import { useAuthStore } from '../../stores/authStore';
import { useStreakStore } from '../../stores/streakStore';
import {
  fetchStreaks,
  fetchStreakLogs,
  getMonthHeatmap,
  Streak,
} from '../../lib/streaks';
import Card from '../../components/ui/Card';
import HeatmapGrid from '../../components/streak/HeatmapGrid';

export default function StatsScreen() {
  const theme = useTheme();
  const { user } = useAuthStore();
  const { lastUpdate } = useStreakStore();
  const [streaks, setStreaks] = useState<Streak[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalDays, setTotalDays] = useState(0);
  const [totalStreaks, setTotalStreaks] = useState(0);
  const [longestEver, setLongestEver] = useState(0);
  const [activeStreaks, setActiveStreaks] = useState(0);
  const [allLogDates, setAllLogDates] = useState<Date[]>([]);

  useEffect(() => {
    loadStats();
  }, [user, lastUpdate]);

  const loadStats = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await fetchStreaks(user.id);
      setStreaks(data);
      setTotalStreaks(data.length);
      setActiveStreaks(data.filter((s) => s.current_streak > 0).length);

      let maxLongest = 0;
      let totalComp = 0;
      const allDates: Date[] = [];

      for (const streak of data) {
        maxLongest = Math.max(maxLongest, streak.longest_streak);
        totalComp += streak.total_completions;

        const logs = await fetchStreakLogs(streak.id);
        logs.forEach((l) => allDates.push(parseISO(l.completed_date)));
      }

      setLongestEver(maxLongest);
      setTotalDays(totalComp);
      setAllLogDates(allDates);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const heatmapData = getMonthHeatmap(allLogDates);

  const statCards = [
    { label: 'TOTAL STREAKS', value: totalStreaks.toString(), delay: 0 },
    { label: 'ACTIVE', value: activeStreaks.toString(), delay: 100 },
    { label: 'LONGEST EVER', value: `${longestEver}d`, delay: 200 },
    { label: 'TOTAL DAYS', value: totalDays.toString(), delay: 300 },
  ];

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: theme.background }]}
    >
      {/* TopAppBar */}
      <View
        style={[
          styles.topBar,
          {
            backgroundColor: theme.card,
            borderBottomColor: theme.border,
          },
        ]}
      >
        <Text style={[styles.title, { color: theme.foreground }]}>
          STATISTICS
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {statCards.map((stat, index) => (
            <Animated.View
              key={stat.label}
              entering={FadeInDown.delay(stat.delay).duration(400)}
              style={styles.statCardWrapper}
            >
              <Card
                style={
                  index === 2
                    ? { backgroundColor: theme.tertiaryFixed }
                    : undefined
                }
              >
                <Text
                  style={[
                    styles.statLabel,
                    { color: theme.mutedForeground },
                  ]}
                >
                  {stat.label}
                </Text>
                <Text
                  style={[
                    styles.statValue,
                    { color: theme.foreground },
                  ]}
                >
                  {stat.value}
                </Text>
              </Card>
            </Animated.View>
          ))}
        </View>

        {/* Monthly Heatmap */}
        <Animated.View entering={FadeInDown.delay(400).duration(400)}>
          <Text
            style={[
              styles.sectionLabel,
              { color: theme.foreground },
            ]}
          >
            MONTHLY ACTIVITY
          </Text>
          <HeatmapGrid heatmapData={heatmapData} month={new Date()} />
        </Animated.View>

        {/* Streak Breakdown */}
        <Animated.View entering={FadeInDown.delay(500).duration(400)}>
          <Text
            style={[
              styles.sectionLabel,
              { color: theme.foreground, marginTop: 32 },
            ]}
          >
            STREAK BREAKDOWN
          </Text>
          {streaks.map((streak, index) => (
            <View
              key={streak.id}
              style={[
                styles.breakdownRow,
                {
                  borderBottomColor: theme.foreground + '10',
                },
              ]}
            >
              <View style={styles.breakdownLeft}>
                <Text
                  style={[
                    styles.breakdownName,
                    { color: theme.foreground },
                  ]}
                >
                  {streak.name}
                </Text>
                <Text
                  style={[
                    styles.breakdownSub,
                    { color: theme.mutedForeground },
                  ]}
                >
                  {streak.total_completions} total days
                </Text>
              </View>
              <View style={styles.breakdownRight}>
                <Text
                  style={[
                    styles.breakdownCount,
                    { color: theme.foreground },
                  ]}
                >
                  {streak.current_streak}
                </Text>
                <Text
                  style={[
                    styles.breakdownUnit,
                    { color: theme.mutedForeground },
                  ]}
                >
                  DAYS
                </Text>
              </View>
            </View>
          ))}
          {streaks.length === 0 && (
            <Text
              style={[
                styles.emptyText,
                { color: theme.mutedForeground },
              ]}
            >
              No streaks to show yet
            </Text>
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  topBar: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 2,
  },
  title: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 22,
    textTransform: 'uppercase',
    letterSpacing: -2,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 100,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  statCardWrapper: {
    width: '47%',
  },
  statLabel: {
    fontFamily: 'SpaceMono-Regular',
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  statValue: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 32,
    lineHeight: 36,
  },
  sectionLabel: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  breakdownLeft: {
    flex: 1,
  },
  breakdownName: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 14,
    textTransform: 'uppercase',
  },
  breakdownSub: {
    fontFamily: 'DMSans-Regular',
    fontSize: 12,
    marginTop: 2,
  },
  breakdownRight: {
    alignItems: 'center',
  },
  breakdownCount: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 28,
  },
  breakdownUnit: {
    fontFamily: 'SpaceMono-Regular',
    fontSize: 8,
    letterSpacing: 2,
  },
  emptyText: {
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 40,
  },
});
