import React, { memo, useMemo, useCallback, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Text,
} from 'react-native';
import { useTodo } from '../contexts/TodoContext';
import { StatisticsService } from '../services/statisticsService';
import StatisticsChart from '../components/StatisticsChart';
import { ExportDataService } from '../services/exportDataService';
import { ExportFormat } from '../types/exportFormat';
import ExportSettings from '../components/ExportSettings';
import { useCategory } from '../contexts/CategoryContext';
import { useTag } from '../contexts/TagContext';
import { MaterialIcons } from '@react-native-material/core';
import TrendChart from '../components/TrendChart';
import { TrendService } from '../services/trendService';
import { Icon } from '@react-native-material/core';
import { useTheme } from '@react-navigation/native';

const StatisticsScreen: React.FC = () => {
  const { todos, isLoading, refreshTodos } = useTodo();
  const { categories } = useCategory();
  const { tags } = useTag();
  const [showExportSettings, setShowExportSettings] = useState(false);
  const [trendOptions, setTrendOptions] = useState<TrendOptions>({
    days: 30,
    includeCompleted: true,
    includeOverdue: true,
    includeCreated: true,
    includeUpdated: true,
  });
  const { theme } = useTheme();

  // 计算统计数据
  const statistics = useMemo(() => {
    return StatisticsService.calculateStatistics(todos);
  }, [todos]);

  // 计算趋势数据
  const trendData = useMemo(() => {
    return TrendService.getTrendData(todos, trendOptions);
  }, [todos, trendOptions]);

  // 计算完成率趋势
  const completionRateTrend = useMemo(() => {
    return TrendService.getCompletionRateTrend(todos, trendOptions);
  }, [todos, trendOptions]);

  // 计算效率趋势
  const efficiencyTrend = useMemo(() => {
    return TrendService.getEfficiencyTrend(todos, trendOptions);
  }, [todos, trendOptions]);

  // 计算分类趋势
  const categoryTrend = useMemo(() => {
    return TrendService.getCategoryTrend(todos, trendOptions);
  }, [todos, trendOptions]);

  // 计算标签趋势
  const tagTrend = useMemo(() => {
    return TrendService.getTagTrend(todos, trendOptions);
  }, [todos, trendOptions]);

  // 处理导出
  const handleExport = useCallback(async (format: ExportFormat) => {
    try {
      await ExportDataService.exportData(todos, format, categories, tags);
    } catch (error) {
      console.error('Error exporting data:', error);
      Alert.alert('错误', '导出数据失败');
    }
  }, [todos, categories, tags]);

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refreshTodos}
            colors={['#2196F3']}
            tintColor="#2196F3"
          />
        }
      >
        <StatisticsChart statistics={statistics} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>趋势分析</Text>

          <TrendChart
            data={trendData}
            title="待办事项趋势"
            options={trendOptions}
            onOptionsChange={setTrendOptions}
          />

          <TrendChart
            data={completionRateTrend}
            title="完成率趋势"
            options={trendOptions}
            onOptionsChange={setTrendOptions}
          />

          <TrendChart
            data={efficiencyTrend}
            title="效率趋势"
            options={trendOptions}
            onOptionsChange={setTrendOptions}
          />

          <TrendChart
            data={categoryTrend}
            title="分类趋势"
            options={trendOptions}
            onOptionsChange={setTrendOptions}
          />

          <TrendChart
            data={tagTrend}
            title="标签趋势"
            options={trendOptions}
            onOptionsChange={setTrendOptions}
          />
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.exportButton}
        onPress={() => setShowExportSettings(true)}
      >
        <MaterialIcons name="file-download" size={24} color="white" />
        <Text style={styles.exportButtonText}>导出报告</Text>
      </TouchableOpacity>

      <ExportSettings
        visible={showExportSettings}
        onClose={() => setShowExportSettings(false)}
        onExport={handleExport}
      />

      <TouchableOpacity
        style={[styles.card, { backgroundColor: theme.colors.card }]}
        onPress={() => navigation.navigate('CategoryStatistics')}
      >
        <Icon name="category" size={24} color={theme.colors.primary} />
        <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
          分类统计
        </Text>
        <Text style={[styles.cardDescription, { color: theme.colors.text + '80' }]}>
          查看每个分类的详细统计信息
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.card, { backgroundColor: theme.colors.card }]}
        onPress={() => navigation.navigate('CustomStatistics')}
      >
        <Icon name="analytics" size={24} color={theme.colors.primary} />
        <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
          自定义统计
        </Text>
        <Text style={[styles.cardDescription, { color: theme.colors.text + '80' }]}>
          自定义时间范围和过滤条件的统计分析
        </Text>
      </TouchableOpacity>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  content: {
    flexGrow: 1,
    padding: 16,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: '#212121',
    marginBottom: 16,
  },
  exportButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  exportButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
  },
  card: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
  },
});

export default memo(StatisticsScreen); 