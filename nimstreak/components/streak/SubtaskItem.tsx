import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Checkbox from '../ui/Checkbox';
import { useTheme } from '../../lib/theme';

interface SubtaskItemProps {
  title: string;
  completed: boolean;
  onToggle: () => void;
}

export default function SubtaskItem({
  title,
  completed,
  onToggle,
}: SubtaskItemProps) {
  const theme = useTheme();

  return (
    <TouchableOpacity
      onPress={onToggle}
      activeOpacity={0.8}
      style={styles.container}
    >
      <Checkbox checked={completed} onToggle={onToggle} size={24} />
      <Text
        style={[
          styles.title,
          {
            color: completed ? theme.mutedForeground : theme.foreground,
            textDecorationLine: completed ? 'line-through' : 'none',
            textDecorationColor: theme.primary,
          },
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  title: {
    fontFamily: 'DMSans-Medium',
    fontSize: 14,
    flex: 1,
  },
});
