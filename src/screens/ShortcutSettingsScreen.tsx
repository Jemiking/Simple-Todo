import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useShortcut } from '../contexts/ShortcutContext';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface ShortcutItemProps {
  label: string;
  icon: string;
  description: string;
  keys: string[];
  onPress: () => void;
}

const ShortcutItem: React.FC<ShortcutItemProps> = ({
  label,
  icon,
  description,
  keys,
  onPress,
}) => {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.shortcutItem, { borderBottomColor: theme.colors.border }]}
      onPress={onPress}
    >
      <View style={styles.shortcutHeader}>
        <Icon name={icon} size={24} color={theme.colors.primary} />
        <View style={styles.shortcutInfo}>
          <Text style={[styles.shortcutLabel, { color: theme.colors.text }]}>
            {label}
          </Text>
          <Text style={[styles.shortcutDescription, { color: theme.colors.text + '80' }]}>
            {description}
          </Text>
        </View>
      </View>
      <View style={styles.shortcutKeys}>
        {keys.map((key, index) => (
          <React.Fragment key={key}>
            <View
              style={[
                styles.keyBadge,
                { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
              ]}
            >
              <Text style={[styles.keyText, { color: theme.colors.text }]}>
                {key}
              </Text>
            </View>
            {index < keys.length - 1 && (
              <Text style={[styles.plusSign, { color: theme.colors.text }]}>+</Text>
            )}
          </React.Fragment>
        ))}
      </View>
    </TouchableOpacity>
  );
};

const ShortcutSettingsScreen: React.FC = () => {
  const { theme } = useTheme();
  const { config, isEnabled, updateConfig } = useShortcut();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingAction, setRecordingAction] = useState<keyof typeof config.shortcuts | null>(
    null
  );
  const [pressedKeys, setPressedKeys] = useState<string[]>([]);

  const handleToggle = async (value: boolean) => {
    try {
      await updateConfig({ enabled: value });
    } catch (error) {
      console.error('更新快捷键设置失败:', error);
    }
  };

  const startRecording = (action: keyof typeof config.shortcuts) => {
    if (Platform.OS !== 'web') {
      Alert.alert('提示', '快捷键功能仅在Web版本可用');
      return;
    }
    setIsRecording(true);
    setRecordingAction(action);
    setPressedKeys([]);
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (!isRecording) return;

    event.preventDefault();
    const key = event.key;
    if (!pressedKeys.includes(key)) {
      setPressedKeys(prev => [...prev, key]);
    }
  };

  const handleKeyUp = async (event: KeyboardEvent) => {
    if (!isRecording || !recordingAction) return;

    event.preventDefault();
    setIsRecording(false);
    setRecordingAction(null);

    if (pressedKeys.length > 0) {
      try {
        await updateConfig({
          shortcuts: {
            ...config.shortcuts,
            [recordingAction]: pressedKeys,
          },
        });
      } catch (error) {
        console.error('更新快捷键失败:', error);
      }
    }

    setPressedKeys([]);
  };

  React.useEffect(() => {
    if (Platform.OS !== 'web') return;

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isRecording, recordingAction, pressedKeys]);

  const shortcutGroups = [
    {
      title: '导航',
      items: [
        {
          action: 'toggleTabs' as const,
          label: '切换标签页',
          icon: 'tab',
          description: '在不同标签页之间切换',
        },
        {
          action: 'goBack' as const,
          label: '返回',
          icon: 'arrow-back',
          description: '返回上一页',
        },
      ],
    },
    {
      title: '列表操作',
      items: [
        {
          action: 'moveUp' as const,
          label: '向上选择',
          icon: 'arrow-upward',
          description: '选择上一个待办事项',
        },
        {
          action: 'moveDown' as const,
          label: '向下选择',
          icon: 'arrow-downward',
          description: '选择下一个待办事项',
        },
        {
          action: 'toggleComplete' as const,
          label: '切换完成状态',
          icon: 'check',
          description: '标记选中的待办事项为完成/未完成',
        },
        {
          action: 'delete' as const,
          label: '删除',
          icon: 'delete',
          description: '删除选中的待办事项',
        },
      ],
    },
    {
      title: '功能快捷键',
      items: [
        {
          action: 'search' as const,
          label: '搜索',
          icon: 'search',
          description: '快速打开搜索',
        },
        {
          action: 'newTodo' as const,
          label: '新建待办',
          icon: 'add',
          description: '创建新的待办事项',
        },
        {
          action: 'save' as const,
          label: '保存',
          icon: 'save',
          description: '保存当前编辑的待办事项',
        },
      ],
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView>
        <View style={styles.section}>
          <View
            style={[
              styles.enableItem,
              { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
            ]}
          >
            <View style={styles.enableInfo}>
              <Text style={[styles.enableLabel, { color: theme.colors.text }]}>
                启用快捷键
              </Text>
              <Text
                style={[styles.enableDescription, { color: theme.colors.text + '80' }]}
              >
                {Platform.OS === 'web'
                  ? '开启或关闭键盘快捷键功能'
                  : '快捷键功能仅在Web版本可用'}
              </Text>
            </View>
            <Switch
              value={isEnabled}
              onValueChange={handleToggle}
              disabled={Platform.OS !== 'web'}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary + '80' }}
              thumbColor={isEnabled ? theme.colors.primary : '#f4f3f4'}
            />
          </View>
        </View>

        {shortcutGroups.map(group => (
          <View key={group.title} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              {group.title}
            </Text>
            {group.items.map(item => (
              <ShortcutItem
                key={item.action}
                label={item.label}
                icon={item.icon}
                description={item.description}
                keys={
                  recordingAction === item.action
                    ? pressedKeys
                    : config.shortcuts[item.action]
                }
                onPress={() => startRecording(item.action)}
              />
            ))}
          </View>
        ))}

        {isRecording && (
          <View
            style={[
              styles.recordingOverlay,
              { backgroundColor: theme.colors.background + 'E6' },
            ]}
          >
            <View
              style={[styles.recordingCard, { backgroundColor: theme.colors.card }]}
            >
              <Text style={[styles.recordingTitle, { color: theme.colors.text }]}>
                请按下快捷键组合
              </Text>
              <View style={styles.recordingKeys}>
                {pressedKeys.map((key, index) => (
                  <React.Fragment key={key}>
                    <View
                      style={[
                        styles.keyBadge,
                        {
                          backgroundColor: theme.colors.background,
                          borderColor: theme.colors.border,
                        },
                      ]}
                    >
                      <Text style={[styles.keyText, { color: theme.colors.text }]}>
                        {key}
                      </Text>
                    </View>
                    {index < pressedKeys.length - 1 && (
                      <Text style={[styles.plusSign, { color: theme.colors.text }]}>
                        +
                      </Text>
                    )}
                  </React.Fragment>
                ))}
              </View>
              <Text
                style={[styles.recordingHint, { color: theme.colors.text + '80' }]}
              >
                松开按键以保存快捷键
              </Text>
            </View>
          </View>
        )}
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
  enableItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderWidth: 1,
    borderRadius: 8,
    marginHorizontal: 16,
  },
  enableInfo: {
    flex: 1,
    marginRight: 16,
  },
  enableLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  enableDescription: {
    fontSize: 14,
    marginTop: 4,
  },
  shortcutItem: {
    padding: 16,
    borderBottomWidth: 1,
  },
  shortcutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  shortcutInfo: {
    flex: 1,
    marginLeft: 16,
  },
  shortcutLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  shortcutDescription: {
    fontSize: 14,
    marginTop: 4,
  },
  shortcutKeys: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 40,
  },
  keyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
  },
  keyText: {
    fontSize: 12,
    fontWeight: '500',
  },
  plusSign: {
    marginHorizontal: 8,
    fontSize: 14,
  },
  recordingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingCard: {
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  recordingTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  recordingKeys: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  recordingHint: {
    fontSize: 14,
  },
});

export default ShortcutSettingsScreen; 