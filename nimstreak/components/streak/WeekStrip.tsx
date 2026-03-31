import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  FadeIn,
} from 'react-native-reanimated';
import { format } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../lib/theme';
import { DayStatus } from '../../lib/streaks';

interface WeekStripProps {
  weekStatus: DayStatus[];
}

export default function WeekStrip({ weekStatus }: WeekStripProps) {
  const theme = useTheme();

  const getSquareStyle = (day: DayStatus) => {
    switch (day.status) {
      case 'completed':
        return {
          backgroundColor: theme.primary,
          borderColor: theme.border,
        };
      case 'today':
        return {
          backgroundColor: theme.card,
          borderColor: theme.secondary,
        };
      case 'missed':
        return {
          backgroundColor: theme.card,
          borderColor: theme.border,
        };
      case 'future':
        return {
          backgroundColor: theme.card,
          borderColor: theme.surfaceContainerHigh,
          opacity: 0.4,
        };
      default:
        return {
          backgroundColor: theme.card,
          borderColor: theme.border,
        };
    }
  };

  const getContent = (day: DayStatus) => {
    switch (day.status) {
      case 'completed':
        return (
          <Ionicons name="checkmark" size={18} color={theme.onPrimary} />
        );
      case 'today':
        return (
          <View style={styles.todayInner}>
            <Text style={[styles.dayLabel, { color: theme.foreground }]}>
              {format(day.date, 'EEE').toUpperCase().slice(0, 3)}
            </Text>
            <View
              style={[styles.todayDot, { backgroundColor: theme.secondary }]}
            />
          </View>
        );
      case 'missed':
        return <Ionicons name="close" size={18} color={theme.foreground} />;
      case 'future':
        return (
          <Text
            style={[
              styles.dayLabel,
              { color: theme.mutedForeground },
            ]}
          >
            {format(day.date, 'EEE').toUpperCase().slice(0, 3)}
          </Text>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {weekStatus.map((day, index) => (
        <Animated.View
          key={index}
          entering={FadeIn.delay(index * 60).duration(300)}
          style={[styles.square, { borderWidth: 2 }, getSquareStyle(day)]}
        >
          {getContent(day)}
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  square: {
    flex: 1,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 0,
  },
  dayLabel: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 9,
    textAlign: 'center',
  },
  todayInner: {
    alignItems: 'center',
    gap: 2,
  },
  todayDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
});
