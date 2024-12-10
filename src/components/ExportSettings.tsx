import React, { memo, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Switch,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ExportFormat } from '../services/exportDataService';
import AnimatedView from './AnimatedView';

interface ExportSettingsProps {
  visible: boolean;
  onClose: () => void;
  onExport: (format: ExportFormat) => void;
}

const ExportSettings: React.FC<ExportSettingsProps> = ({
  visible,
  onClose,
  onExport,
}) => {
  const [type, setType] = useState<'json' | 'csv' | 'pdf'>('json');
  const [includeStatistics, setIncludeStatistics] = useState(true);
  const [includeSubTasks, setIncludeSubTasks] = useState(true);
  const [includeCategories, setIncludeCategories] = useState(true);
  const [includeTags, setIncludeTags] = useState(true);

  // 处理导出
  const handleExport = useCallback(() => {
    onExport({
      type,
      includeStatistics,
      includeSubTasks,
      includeCategories,
      includeTags,
    });
    onClose();
  }, [
    type,
    includeStatistics,
    includeSubTasks,
    includeCategories,
    includeTags,
    onExport,
    onClose,
  ]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>导出设置</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
            >
              <MaterialIcons name="close" size={24} color="#757575" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.settingsList}>
            {/* 导出格式 */}
            <AnimatedView
              animation="fade"
              delay={0}
              style={styles.section}
            >
              <Text style={styles.sectionTitle}>导出格式</Text>
              <View style={styles.formatOptions}>
                <TouchableOpacity
                  style={[
                    styles.formatOption,
                    type === 'json' && styles.selectedFormatOption,
                  ]}
                  onPress={() => setType('json')}
                >
                  <MaterialIcons
                    name="code"
                    size={24}
                    color={type === 'json' ? '#2196F3' : '#757575'}
                  />
                  <Text
                    style={[
                      styles.formatText,
                      type === 'json' && styles.selectedFormatText,
                    ]}
                  >
                    JSON
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.formatOption,
                    type === 'csv' && styles.selectedFormatOption,
                  ]}
                  onPress={() => setType('csv')}
                >
                  <MaterialIcons
                    name="grid-on"
                    size={24}
                    color={type === 'csv' ? '#2196F3' : '#757575'}
                  />
                  <Text
                    style={[
                      styles.formatText,
                      type === 'csv' && styles.selectedFormatText,
                    ]}
                  >
                    CSV
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.formatOption,
                    type === 'pdf' && styles.selectedFormatOption,
                  ]}
                  onPress={() => setType('pdf')}
                >
                  <MaterialIcons
                    name="picture-as-pdf"
                    size={24}
                    color={type === 'pdf' ? '#2196F3' : '#757575'}
                  />
                  <Text
                    style={[
                      styles.formatText,
                      type === 'pdf' && styles.selectedFormatText,
                    ]}
                  >
                    PDF
                  </Text>
                </TouchableOpacity>
              </View>
            </AnimatedView>

            {/* 导出选项 */}
            <AnimatedView
              animation="fade"
              delay={100}
              style={styles.section}
            >
              <Text style={styles.sectionTitle}>导出选项</Text>
              <View style={styles.optionsList}>
                <View style={styles.optionItem}>
                  <Text style={styles.optionLabel}>包含统计信息</Text>
                  <Switch
                    value={includeStatistics}
                    onValueChange={setIncludeStatistics}
                  />
                </View>
                <View style={styles.optionItem}>
                  <Text style={styles.optionLabel}>包含子任务</Text>
                  <Switch
                    value={includeSubTasks}
                    onValueChange={setIncludeSubTasks}
                  />
                </View>
                <View style={styles.optionItem}>
                  <Text style={styles.optionLabel}>包含分类</Text>
                  <Switch
                    value={includeCategories}
                    onValueChange={setIncludeCategories}
                  />
                </View>
                <View style={styles.optionItem}>
                  <Text style={styles.optionLabel}>包含标签</Text>
                  <Switch
                    value={includeTags}
                    onValueChange={setIncludeTags}
                  />
                </View>
              </View>
            </AnimatedView>
          </ScrollView>

          <TouchableOpacity
            style={styles.exportButton}
            onPress={handleExport}
          >
            <MaterialIcons name="file-download" size={24} color="white" />
            <Text style={styles.exportButtonText}>导出</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
  settingsList: {
    maxHeight: 400,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212121',
    marginBottom: 16,
  },
  formatOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  formatOption: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    width: 100,
  },
  selectedFormatOption: {
    backgroundColor: '#E3F2FD',
  },
  formatText: {
    marginTop: 8,
    fontSize: 14,
    color: '#757575',
  },
  selectedFormatText: {
    color: '#2196F3',
    fontWeight: '500',
  },
  optionsList: {
    gap: 16,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionLabel: {
    fontSize: 16,
    color: '#212121',
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3',
    margin: 16,
    padding: 16,
    borderRadius: 8,
  },
  exportButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
  },
});

export default memo(ExportSettings); 