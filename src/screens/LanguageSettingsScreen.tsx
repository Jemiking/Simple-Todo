import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useI18n } from '../contexts/I18nContext';
import Icon from 'react-native-vector-icons/MaterialIcons';

const LanguageSettingsScreen: React.FC = () => {
  const { theme } = useTheme();
  const { language, supportedLanguages, setLanguage, t } = useI18n();

  const handleLanguageSelect = async (code: string) => {
    try {
      await setLanguage(code as any);
      Alert.alert(
        t('common.success'),
        t('settings.language.change_success'),
        [{ text: t('common.ok') }]
      );
    } catch (error) {
      console.error('切换语言失败:', error);
      Alert.alert(
        t('common.error'),
        t('settings.language.change_failed'),
        [{ text: t('common.ok') }]
      );
    }
  };

  const renderLanguageItem = (
    code: string,
    name: string,
    icon: string,
    isSystem = false
  ) => {
    const isSelected = language === code;

    return (
      <TouchableOpacity
        key={code}
        style={[
          styles.languageItem,
          {
            backgroundColor: theme.colors.card,
            borderColor: isSelected ? theme.colors.primary : theme.colors.border,
            borderWidth: isSelected ? 2 : 1,
          },
        ]}
        onPress={() => handleLanguageSelect(code)}
      >
        <View style={styles.languageInfo}>
          <Text style={[styles.languageIcon, { fontSize: 24 }]}>{icon}</Text>
          <View style={styles.languageText}>
            <Text style={[styles.languageName, { color: theme.colors.text }]}>
              {name}
            </Text>
            {isSystem && (
              <Text
                style={[styles.systemLabel, { color: theme.colors.text + '80' }]}
              >
                {t('language.system_description')}
              </Text>
            )}
          </View>
        </View>
        {isSelected && (
          <Icon name="check" size={24} color={theme.colors.primary} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView>
        <View style={styles.section}>
          {renderLanguageItem(
            'system',
            t('language.system'),
            '🌐',
            true
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {t('settings.language.available')}
          </Text>
          {supportedLanguages.map(lang =>
            renderLanguageItem(lang.code, lang.name, lang.icon)
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 16,
    marginBottom: 8,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
  },
  languageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  languageIcon: {
    marginRight: 16,
  },
  languageText: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '500',
  },
  systemLabel: {
    fontSize: 14,
    marginTop: 4,
  },
});

export default LanguageSettingsScreen; 