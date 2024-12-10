import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Share,
  Clipboard,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { ThemeService } from '../services/themeService';
import { CustomTheme, ThemeColors } from '../types/theme';
import ColorPicker from '../components/ColorPicker';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface ColorPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onColorSelect: (color: string) => void;
  selectedColor: string;
}

const CustomThemeScreen: React.FC = () => {
  const { theme, customThemes, selectedCustomThemeId, createTheme, updateTheme, deleteTheme, setColorMode } = useTheme();
  const [editingTheme, setEditingTheme] = useState<CustomTheme | null>(null);
  const [themeName, setThemeName] = useState('');
  const [colors, setColors] = useState<ThemeColors>(theme.colors);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [editingColor, setEditingColor] = useState<keyof ThemeColors | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    if (selectedCustomThemeId) {
      const theme = customThemes.find(t => t.id === selectedCustomThemeId);
      if (theme) {
        setEditingTheme(theme);
        setThemeName(theme.name);
        setColors(theme.colors);
      }
    }
  }, [selectedCustomThemeId, customThemes]);

  const handleSave = async () => {
    if (!themeName.trim()) {
      Alert.alert('错误', '请输入主题名称');
      return;
    }

    try {
      const themeData: Partial<CustomTheme> = {
        name: themeName,
        dark: theme.dark,
        colors,
      };

      if (editingTheme) {
        await updateTheme(editingTheme.id, themeData);
        Alert.alert('成功', '主题已更新');
      } else {
        const newTheme = await createTheme(themeData);
        setEditingTheme(newTheme);
        Alert.alert('成功', '主题已创建');
      }
    } catch (error) {
      console.error('保存主题失败:', error);
      Alert.alert('错误', '保存主题失败');
    }
  };

  const handleDelete = async () => {
    if (!editingTheme) return;

    Alert.alert(
      '确认删除',
      '确定要删除这个主题吗？此操作不可撤销。',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTheme(editingTheme.id);
              setEditingTheme(null);
              setThemeName('');
              setColors(theme.colors);
              Alert.alert('成功', '主题已删除');
            } catch (error) {
              console.error('删除主题失败:', error);
              Alert.alert('错误', '删除主题失败');
            }
          },
        },
      ]
    );
  };

  const handleExport = async () => {
    if (!editingTheme) return;

    const themeData = JSON.stringify({
      name: editingTheme.name,
      dark: editingTheme.dark,
      colors: editingTheme.colors,
    });

    try {
      await Share.share({
        message: themeData,
        title: `${editingTheme.name} 主题配置`,
      });
    } catch (error) {
      console.error('导出主题失败:', error);
      Alert.alert('错误', '导出主题失败');
    }
  };

  const handleImport = async () => {
    try {
      const clipboardContent = await Clipboard.getString();
      const themeData = JSON.parse(clipboardContent);

      if (!themeData.name || !themeData.colors) {
        throw new Error('无效的主题数据');
      }

      const newTheme = await createTheme(themeData);
      setEditingTheme(newTheme);
      setThemeName(newTheme.name);
      setColors(newTheme.colors);
      Alert.alert('成功', '主题已导入');
    } catch (error) {
      console.error('导入主题失败:', error);
      Alert.alert('错误', '请确保剪贴板中包含有效的主题配置数据');
    }
  };

  const handleCopy = async () => {
    if (!editingTheme) return;

    try {
      const newTheme = await createTheme({
        name: `${editingTheme.name} 副本`,
        dark: editingTheme.dark,
        colors: editingTheme.colors,
      });
      setEditingTheme(newTheme);
      setThemeName(newTheme.name);
      Alert.alert('成功', '主题已复制');
    } catch (error) {
      console.error('复制主题失败:', error);
      Alert.alert('错误', '复制主题失败');
    }
  };

  const handleReset = () => {
    Alert.alert(
      '确认重置',
      '确定要重置所有颜色设置吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '重置',
          style: 'destructive',
          onPress: () => {
            setColors(theme.colors);
          },
        },
      ]
    );
  };

  const handlePreview = () => {
    if (!editingTheme) return;
    
    setPreviewMode(!previewMode);
    if (!previewMode) {
      setColorMode('custom');
    } else {
      setColorMode('system');
    }
  };

  const renderColorPicker = () => (
    <ColorPicker
      visible={showColorPicker}
      selectedColor={editingColor ? colors[editingColor] : ''}
      onClose={() => {
        setShowColorPicker(false);
        setEditingColor(null);
      }}
      onColorSelect={(color) => {
        if (editingColor) {
          setColors(prev => ({ ...prev, [editingColor]: color }));
        }
        setShowColorPicker(false);
        setEditingColor(null);
      }}
    />
  );

  const renderColorButton = (colorKey: keyof ThemeColors, label: string) => (
    <TouchableOpacity
      style={[styles.colorButton, { borderColor: theme.colors.border }]}
      onPress={() => {
        setEditingColor(colorKey);
        setShowColorPicker(true);
      }}
    >
      <Text style={[styles.colorLabel, { color: theme.colors.text }]}>{label}</Text>
      <View style={[styles.colorPreview, { backgroundColor: colors[colorKey] }]} />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <TextInput
            style={[styles.nameInput, { color: theme.colors.text, borderColor: theme.colors.border }]}
            placeholder="主题名称"
            placeholderTextColor={theme.colors.text + '80'}
            value={themeName}
            onChangeText={setThemeName}
          />
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.colors.primary }]}
              onPress={handleSave}
            >
              <Text style={[styles.buttonText, { color: '#fff' }]}>保存</Text>
            </TouchableOpacity>
            {editingTheme && (
              <TouchableOpacity
                style={[styles.button, { backgroundColor: theme.colors.error }]}
                onPress={handleDelete}
              >
                <Text style={[styles.buttonText, { color: '#fff' }]}>删除</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>颜色设置</Text>
          <View style={styles.colorGrid}>
            {renderColorButton('primary', '主色调')}
            {renderColorButton('background', '背景色')}
            {renderColorButton('card', '卡片背景')}
            {renderColorButton('text', '文本颜色')}
            {renderColorButton('border', '边框颜色')}
            {renderColorButton('notification', '通知颜色')}
            {renderColorButton('error', '错误颜色')}
            {renderColorButton('success', '成功颜色')}
            {renderColorButton('warning', '警告颜色')}
            {renderColorButton('info', '信息颜色')}
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.card }]}
            onPress={handlePreview}
          >
            <Icon name="visibility" size={24} color={theme.colors.primary} />
            <Text style={[styles.actionButtonText, { color: theme.colors.text }]}>
              {previewMode ? '结束预览' : '预览主题'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.card }]}
            onPress={handleCopy}
          >
            <Icon name="content-copy" size={24} color={theme.colors.primary} />
            <Text style={[styles.actionButtonText, { color: theme.colors.text }]}>复制主题</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.card }]}
            onPress={handleExport}
          >
            <Icon name="share" size={24} color={theme.colors.primary} />
            <Text style={[styles.actionButtonText, { color: theme.colors.text }]}>导出主题</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.card }]}
            onPress={handleImport}
          >
            <Icon name="download" size={24} color={theme.colors.primary} />
            <Text style={[styles.actionButtonText, { color: theme.colors.text }]}>导入主题</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.card }]}
            onPress={handleReset}
          >
            <Icon name="refresh" size={24} color={theme.colors.primary} />
            <Text style={[styles.actionButtonText, { color: theme.colors.text }]}>重置颜色</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {renderColorPicker()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 16,
    gap: 16,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  nameInput: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  colorButton: {
    width: '45%',
    height: 80,
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    justifyContent: 'space-between',
  },
  colorLabel: {
    fontSize: 14,
  },
  colorPreview: {
    height: 32,
    borderRadius: 4,
  },
  actionButtons: {
    padding: 16,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    gap: 12,
  },
  actionButtonText: {
    fontSize: 16,
  },
});

export default CustomThemeScreen; 