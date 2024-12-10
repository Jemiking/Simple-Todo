import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { ColorMode } from '../types/theme';
import { Text } from 'react-native';

const ThemeSettingsScreen: React.FC = () => {
  const { theme, colorMode, setColorMode } = useTheme();

  const themeOptions: { label: string; value: ColorMode }[] = [
    { label: '浅色模式', value: 'light' },
    { label: '深色模式', value: 'dark' },
    { label: '跟随系统', value: 'system' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>主题设置</Text>
      {themeOptions.map((option) => (
        <TouchableOpacity
          key={option.value}
          style={[
            styles.option,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
              borderWidth: colorMode === option.value ? 2 : 1,
            },
          ]}
          onPress={() => setColorMode(option.value)}
        >
          <Text
            style={[
              styles.optionText,
              {
                color: theme.colors.text,
                fontWeight: colorMode === option.value ? 'bold' : 'normal',
              },
            ]}
          >
            {option.label}
          </Text>
          {colorMode === option.value && (
            <Text style={[styles.checkmark, { color: theme.colors.primary }]}>✓</Text>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  optionText: {
    fontSize: 16,
  },
  checkmark: {
    fontSize: 20,
  },
});

export default ThemeSettingsScreen; 