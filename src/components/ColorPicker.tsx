import React, { memo, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import tinycolor from 'tinycolor2';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  visible: boolean;
  onClose: () => void;
  error?: string;
}

const ColorPicker: React.FC<ColorPickerProps> = ({
  value,
  onChange,
  visible,
  onClose,
  error,
}) => {
  const [customColor, setCustomColor] = useState(value);
  const [isCustom, setIsCustom] = useState(false);

  // 预定义的颜色选项
  const colorOptions = [
    // 主色调
    '#2196F3', // 蓝色
    '#4CAF50', // 绿色
    '#FFC107', // 黄色
    '#F44336', // 红色
    '#9C27B0', // 紫色
    '#FF9800', // 橙色
    '#795548', // 棕色
    '#607D8B', // 蓝灰色

    // 浅色调
    '#90CAF9', // 浅蓝色
    '#A5D6A7', // 浅绿色
    '#FFE082', // 浅黄色
    '#EF9A9A', // 浅红色
    '#CE93D8', // 浅紫色
    '#FFCC80', // 浅橙色
    '#BCAAA4', // 浅棕色
    '#B0BEC5', // 浅蓝灰色

    // 深色调
    '#1976D2', // 深蓝色
    '#388E3C', // 深绿色
    '#FFA000', // 深黄色
    '#D32F2F', // 深红色
    '#7B1FA2', // 深紫色
    '#F57C00', // 深橙色
    '#5D4037', // 深棕色
    '#455A64', // 深蓝灰色
  ];

  // 处理颜色选择
  const handleColorSelect = useCallback((color: string) => {
    onChange(color);
    onClose();
  }, [onChange, onClose]);

  // 处理自定义颜色
  const handleCustomColor = useCallback(() => {
    if (!customColor) return;

    const color = tinycolor(customColor);
    if (color.isValid()) {
      onChange(color.toHexString());
      onClose();
    }
  }, [customColor, onChange, onClose]);

  return (
    <View>
      <TouchableOpacity
        style={[styles.container, error && styles.errorContainer]}
        onPress={() => onClose()}
      >
        <View style={[styles.colorPreview, { backgroundColor: value }]} />
        <Text style={styles.text}>{value}</Text>
      </TouchableOpacity>

      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={onClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.header}>
              <Text style={styles.title}>选择颜色</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
              >
                <MaterialIcons name="close" size={24} color="#757575" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.colorGrid}>
              {colorOptions.map(color => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    value === color && styles.selectedColorOption,
                  ]}
                  onPress={() => handleColorSelect(color)}
                />
              ))}
            </ScrollView>

            <View style={styles.customColorContainer}>
              <TouchableOpacity
                style={styles.customColorToggle}
                onPress={() => setIsCustom(!isCustom)}
              >
                <MaterialIcons
                  name={isCustom ? 'expand-less' : 'expand-more'}
                  size={24}
                  color="#757575"
                />
                <Text style={styles.customColorText}>自定义颜色</Text>
              </TouchableOpacity>

              {isCustom && (
                <View style={styles.customColorInput}>
                  <TextInput
                    style={styles.input}
                    value={customColor}
                    onChangeText={setCustomColor}
                    placeholder="#RRGGBB"
                    placeholderTextColor="#9e9e9e"
                    autoCapitalize="characters"
                    maxLength={7}
                  />
                  <TouchableOpacity
                    style={[
                      styles.customColorPreview,
                      { backgroundColor: tinycolor(customColor).isValid() ? customColor : '#f5f5f5' },
                    ]}
                    onPress={handleCustomColor}
                  >
                    <MaterialIcons name="check" size={20} color="white" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  errorContainer: {
    borderColor: '#f44336',
  },
  colorPreview: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  text: {
    flex: 1,
    fontSize: 16,
    color: '#212121',
  },
  errorText: {
    marginTop: 4,
    marginLeft: 4,
    fontSize: 12,
    color: '#f44336',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 18,
    fontWeight: '500',
    color: '#212121',
  },
  closeButton: {
    padding: 4,
  },
  colorGrid: {
    padding: 16,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    margin: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  selectedColorOption: {
    borderWidth: 2,
    borderColor: 'white',
    elevation: 4,
  },
  customColorContainer: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    padding: 16,
  },
  customColorToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customColorText: {
    fontSize: 16,
    color: '#212121',
    marginLeft: 8,
  },
  customColorInput: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#212121',
    marginRight: 8,
  },
  customColorPreview: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});

export default memo(ColorPicker); 