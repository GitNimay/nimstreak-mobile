import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  FadeInDown,
} from 'react-native-reanimated';
import { useTheme } from '../../lib/theme';
import Badge from '../ui/Badge';
import WeekStrip from './WeekStrip';
import { DayStatus } from '../../lib/streaks';

interface StreakCardProps {
  name: string;
  description: string | null;
  currentStreak: number;
  deadlineType: 'specific' | 'forever';
  deadlineDate: string | null;
  weekStatus: DayStatus[];
  weekCompletions: number;
  onPress: () => void;
  index?: number;
}

export default function StreakCard({
  name,
  description,
  currentStreak,
  deadlineType,
  deadlineDate,
  weekStatus,
  weekCompletions,
  onPress,
  index = 0,
}: StreakCardProps) {
  const theme = useTheme();

  const formattedStreak = currentStreak.toString().padStart(2, '0');

  return (
    <Animated.View entering={FadeInDown.delay(index * 100).duration(400)}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.95}
        style={[
          styles.card,
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
        <View style={styles.content}>
          {/* Left: Streak Count */}
          <View style={styles.streakCountContainer}>
            <Text
              style={[
                styles.streakCount,
                { color: theme.foreground },
              ]}
            >
              {formattedStreak}
            </Text>
            <Text
              style={[
                styles.streakLabel,
                { color: theme.foreground },
              ]}
            >
              DAYS
            </Text>
          </View>

          {/* Center: Info */}
          <View style={styles.infoContainer}>
            <Text
              style={[styles.name, { color: theme.foreground }]}
              numberOfLines={1}
            >
              {name}
            </Text>
            {description && (
              <Text
                style={[
                  styles.description,
                  { color: theme.mutedForeground },
                ]}
                numberOfLines={1}
              >
                {description}
              </Text>
            )}
            <Badge
              text={
                deadlineType === 'forever'
                  ? '∞ FOREVER'
                  : deadlineDate || 'N/A'
              }
              variant="warning"
              style={{ marginTop: 6 }}
            />
          </View>

          {/* Right: Mini Week Dots */}
          <View style={styles.dotsContainer}>
            <View style={styles.dotsRow}>
              {weekStatus.slice(0, 4).map((day, i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    {
                      backgroundColor:
                        day.status === 'completed'
                          ? theme.primary
                          : 'transparent',
                      borderColor:
                        day.status === 'today'
                          ? theme.secondary
                          : day.status === 'completed'
                          ? theme.primary
                          : theme.surfaceContainerHigh,
                      borderWidth: day.status === 'today' ? 2 : 1,
                    },
                  ]}
                />
              ))}
            </View>
            <View style={styles.dotsRow}>
              {weekStatus.slice(4, 7).map((day, i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    {
                      backgroundColor:
                        day.status === 'completed'
                          ? theme.primary
                          : 'transparent',
                      borderColor:
                        day.status === 'today'
                          ? theme.secondary
                          : day.status === 'completed'
                          ? theme.primary
                          : theme.surfaceContainerHigh,
                      borderWidth: day.status === 'today' ? 2 : 1,
                    },
                  ]}
                />
              ))}
            </View>
          </View>
        </View>

        {/* Bottom Progress Bar */}
        <View
          style={[
            styles.progressTrack,
            { backgroundColor: theme.muted },
          ]}
        >
          <View
            style={[
              styles.progressFill,
              {
                backgroundColor: theme.primary,
                width: `${(weekCompletions / 7) * 100}%`,
              },
            ]}
          />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 2,
    borderRadius: 0,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 20,
  },
  streakCountContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 70,
  },
  streakCount: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 36,
    lineHeight: 36,
  },
  streakLabel: {
    fontFamily: 'DMSans-Regular',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 3,
    marginTop: 2,
  },
  infoContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  name: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 16,
    textTransform: 'uppercase',
    lineHeight: 20,
  },
  description: {
    fontFamily: 'DMSans-Regular',
    fontSize: 13,
    marginTop: 2,
  },
  dotsContainer: {
    gap: 4,
    paddingTop: 4,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 3,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  progressTrack: {
    height: 5,
    width: '100%',
  },
  progressFill: {
    height: '100%',
  },
});
