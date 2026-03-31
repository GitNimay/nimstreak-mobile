import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { format, getDay, startOfMonth } from 'date-fns';
import { useTheme } from '../../lib/theme';
import { HeatmapDay } from '../../lib/streaks';

interface HeatmapGridProps {
  heatmapData: HeatmapDay[];
  month: Date;
}

export default function HeatmapGrid({ heatmapData, month }: HeatmapGridProps) {
  const theme = useTheme();

  // Get the day of week the month starts on (0=Sun, 1=Mon...)
  const firstDayOfMonth = startOfMonth(month);
  const startDayOffset = (getDay(firstDayOfMonth) + 6) % 7; // Convert to Mon=0

  // Create padding for the start
  const paddedData: (HeatmapDay | null)[] = [
    ...Array(startDayOffset).fill(null),
    ...heatmapData,
  ];

  // Fill remaining cells to complete the grid
  const remainingCells = (7 - (paddedData.length % 7)) % 7;
  for (let i = 0; i < remainingCells; i++) {
    paddedData.push(null);
  }

  const dayLabels = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.surfaceContainerLow,
          borderColor: theme.border,
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.monthLabel, { color: theme.foreground }]}>
          {format(month, 'MMMM').toUpperCase()}
        </Text>
        <Text style={[styles.levelLabel, { color: theme.mutedForeground }]}>
          ACTIVITY LEVEL
        </Text>
      </View>

      {/* Day Labels Row */}
      <View style={styles.dayLabelsRow}>
        {dayLabels.map((label) => (
          <View key={label} style={styles.dayLabelCell}>
            <Text style={[styles.dayLabelText, { color: theme.mutedForeground }]}>
              {label}
            </Text>
          </View>
        ))}
      </View>

      {/* Grid */}
      <View style={styles.grid}>
        {paddedData.map((day, index) => (
          <View
            key={index}
            style={[
              styles.cell,
              {
                backgroundColor: day
                  ? day.completed
                    ? theme.primary
                    : theme.card
                  : 'transparent',
                borderColor: day ? theme.border + '20' : 'transparent',
                borderWidth: day ? 1 : 0,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 2,
    borderRadius: 0,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  monthLabel: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  levelLabel: {
    fontFamily: 'SpaceMono-Regular',
    fontSize: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  dayLabelsRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  dayLabelCell: {
    flex: 1,
    alignItems: 'center',
  },
  dayLabelText: {
    fontFamily: 'SpaceMono-Regular',
    fontSize: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 3,
  },
  cell: {
    width: '13%',
    aspectRatio: 1,
    borderRadius: 0,
  },
});
