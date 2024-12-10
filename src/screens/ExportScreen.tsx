import React, { memo, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ExportService } from '../services/exportService';
import AnimatedView from '../components/AnimatedView';

const ExportScreen: React.FC = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // 导出为JSON
  const handleExportJson = useCallback(async () => {
    try {
      setIsExporting(true);
      await ExportService.exportToJson();
      Alert.alert('成功', '导出JSON文件成功');
    } catch (error) {
      console.error('Error exporting JSON:', error);
      Alert.alert('错误', '导出JSON文件失败');
    } finally {
      setIsExporting(false);
    }
  }, []);

  // 导出为CSV
  const handleExportCsv = useCallback(async () => {
    try {
      setIsExporting(true);
      await ExportService.exportToCsv();
      Alert.alert('成功', '导出CSV文件成功');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      Alert.alert('错误', '导出CSV文件失败');
    } finally {
      setIsExporting(false);
    }
  }, []);

  // 导入JSON
  const handleImportJson = useCallback(async () => {
    Alert.alert(
      '确认导入',
      '导入数据将覆盖当前所有数据，确定要继续吗？',
      [
        {
          text: '取消',
          style: 'cancel',
        },
        {
          text: '导入',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsImporting(true);
              await ExportService.importFromJson();
              Alert.alert('成功', '导入JSON文件成功');
            } catch (error) {
              console.error('Error importing JSON:', error);
              Alert.alert('错误', '导入JSON文件失败');
            } finally {
              setIsImporting(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  }, []);

  // 导入CSV
  const handleImportCsv = useCallback(async () => {
    Alert.alert(
      '确认导入',
      '导入数据将覆盖当前所有数据，确定要继续吗？',
      [
        {
          text: '取消',
          style: 'cancel',
        },
        {
          text: '导入',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsImporting(true);
              await ExportService.importFromCsv();
              Alert.alert('成功', '导入CSV文件成功');
            } catch (error) {
              console.error('Error importing CSV:', error);
              Alert.alert('错误', '导入CSV文件失败');
            } finally {
              setIsImporting(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>导出数据</Text>
        <View style={styles.buttonGroup}>
          <AnimatedView
            animation="fade"
            delay={0}
            style={styles.buttonContainer}
          >
            <TouchableOpacity
              style={[styles.button, isExporting && styles.buttonDisabled]}
              onPress={handleExportJson}
              disabled={isExporting}
            >
              {isExporting ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <MaterialIcons name="code" size={24} color="white" />
                  <Text style={styles.buttonText}>导出为JSON</Text>
                </>
              )}
            </TouchableOpacity>
          </AnimatedView>

          <AnimatedView
            animation="fade"
            delay={100}
            style={styles.buttonContainer}
          >
            <TouchableOpacity
              style={[styles.button, isExporting && styles.buttonDisabled]}
              onPress={handleExportCsv}
              disabled={isExporting}
            >
              {isExporting ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <MaterialIcons name="grid-on" size={24} color="white" />
                  <Text style={styles.buttonText}>导出为CSV</Text>
                </>
              )}
            </TouchableOpacity>
          </AnimatedView>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>导入数据</Text>
        <View style={styles.buttonGroup}>
          <AnimatedView
            animation="fade"
            delay={200}
            style={styles.buttonContainer}
          >
            <TouchableOpacity
              style={[styles.button, isImporting && styles.buttonDisabled]}
              onPress={handleImportJson}
              disabled={isImporting}
            >
              {isImporting ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <MaterialIcons name="upload-file" size={24} color="white" />
                  <Text style={styles.buttonText}>导入JSON</Text>
                </>
              )}
            </TouchableOpacity>
          </AnimatedView>

          <AnimatedView
            animation="fade"
            delay={300}
            style={styles.buttonContainer}
          >
            <TouchableOpacity
              style={[styles.button, isImporting && styles.buttonDisabled]}
              onPress={handleImportCsv}
              disabled={isImporting}
            >
              {isImporting ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <MaterialIcons name="table-chart" size={24} color="white" />
                  <Text style={styles.buttonText}>导入CSV</Text>
                </>
              )}
            </TouchableOpacity>
          </AnimatedView>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>说明</Text>
        <AnimatedView
          animation="fade"
          delay={400}
          style={styles.helpContainer}
        >
          <Text style={styles.helpText}>
            • JSON格式包含所有数据，适合完整备份和恢复{'\n'}
            • CSV格式仅包含基本数据，适合与其他应用交换数据{'\n'}
            • 导入数据会覆盖当前所有数据，请谨慎操作{'\n'}
            • 建议在导入前先导出备份当前数据
          </Text>
        </AnimatedView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#212121',
    marginBottom: 16,
  },
  buttonGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    margin: -8,
  },
  buttonContainer: {
    width: '50%',
    padding: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  buttonDisabled: {
    backgroundColor: '#bdbdbd',
  },
  buttonText: {
    marginLeft: 8,
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
  },
  helpContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
  },
  helpText: {
    fontSize: 14,
    color: '#757575',
    lineHeight: 20,
  },
});

export default memo(ExportScreen); 