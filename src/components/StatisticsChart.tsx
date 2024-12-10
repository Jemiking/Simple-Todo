import React, { memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { ProgressCircle } from 'react-native-svg-charts';
import { TodoStatistics } from '../services/statisticsService';
import { useCategory } from '../contexts/CategoryContext';
import { useTag } from '../contexts/TagContext';

interface StatisticsChartProps {
  statistics: TodoStatistics;
}

const StatisticsChart: React.FC<StatisticsChartProps> = ({
  statistics,
}) => {
  const { categories } = useCategory();
  const { tags } = useTag();

  // 获取分类名称
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || '未分类';
  };

  // 获取标签名称
  const getTagName = (tagId: string) => {
    const tag = tags.find(t => t.id === tagId);
    return tag?.name || '未知标签';
  };

  return (
    <View style={styles.container}>
      {/* 总体统计 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>总体统计</Text>
        <View style={styles.overallStats}>
          <View style={styles.progressCircle}>
            <ProgressCircle
              style={styles.progressChart}
              progress={statistics.completionRate / 100}
              progressColor="#2196F3"
              backgroundColor="#E3F2FD"
              strokeWidth={10}
            />
            <View style={styles.progressLabel}>
              <Text style={styles.progressValue}>
                {Math.round(statistics.completionRate)}%
              </Text>
              <Text style={styles.progressText}>完成率</Text>
            </View>
          </View>
          <View style={styles.statsGrid}>
            <View style={styles.statsItem}>
              <Text style={styles.statsValue}>{statistics.total}</Text>
              <Text style={styles.statsLabel}>总计</Text>
            </View>
            <View style={styles.statsItem}>
              <Text style={styles.statsValue}>{statistics.completed}</Text>
              <Text style={styles.statsLabel}>已完成</Text>
            </View>
            <View style={styles.statsItem}>
              <Text style={styles.statsValue}>{statistics.incomplete}</Text>
              <Text style={styles.statsLabel}>未完成</Text>
            </View>
            <View style={styles.statsItem}>
              <Text style={styles.statsValue}>{statistics.overdue}</Text>
              <Text style={styles.statsLabel}>已逾期</Text>
            </View>
          </View>
        </View>
      </View>

      {/* 优先级统计 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>优先级统计</Text>
        <View style={styles.priorityStats}>
          {Object.entries(statistics.byPriority).map(([priority, stats]) => (
            <View key={priority} style={styles.priorityItem}>
              <Text style={styles.priorityLabel}>
                {priority === '1' ? '高' :
                  priority === '2' ? '中' : '低'}
              </Text>
              <View style={styles.priorityBar}>
                <View
                  style={[
                    styles.priorityProgress,
                    { width: `${stats.completionRate}%` },
                    priority === '1' ? styles.highPriority :
                      priority === '2' ? styles.mediumPriority :
                        styles.lowPriority,
                  ]}
                />
              </View>
              <Text style={styles.priorityValue}>
                {Math.round(stats.completionRate)}%
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* 分类统计 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>分类统计</Text>
        <View style={styles.categoryStats}>
          {Object.entries(statistics.byCategory).map(([categoryId, stats]) => (
            <View key={categoryId} style={styles.categoryItem}>
              <Text style={styles.categoryLabel}>
                {getCategoryName(categoryId)}
              </Text>
              <View style={styles.categoryBar}>
                <View
                  style={[
                    styles.categoryProgress,
                    { width: `${stats.completionRate}%` },
                  ]}
                />
              </View>
              <Text style={styles.categoryValue}>
                {Math.round(stats.completionRate)}%
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* 标签统计 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>标签统计</Text>
        <View style={styles.tagStats}>
          {Object.entries(statistics.byTag).map(([tagId, stats]) => (
            <View key={tagId} style={styles.tagItem}>
              <Text style={styles.tagLabel}>
                {getTagName(tagId)}
              </Text>
              <View style={styles.tagBar}>
                <View
                  style={[
                    styles.tagProgress,
                    { width: `${stats.completionRate}%` },
                  ]}
                />
              </View>
              <Text style={styles.tagValue}>
                {Math.round(stats.completionRate)}%
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  overallStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressCircle: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressChart: {
    height: 120,
  },
  progressLabel: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressValue: {
    fontSize: 24,
    fontWeight: '500',
    color: '#2196F3',
  },
  progressText: {
    fontSize: 14,
    color: '#757575',
  },
  statsGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginLeft: 16,
  },
  statsItem: {
    width: '50%',
    padding: 8,
    alignItems: 'center',
  },
  statsValue: {
    fontSize: 20,
    fontWeight: '500',
    color: '#212121',
  },
  statsLabel: {
    fontSize: 14,
    color: '#757575',
    marginTop: 4,
  },
  priorityStats: {
    gap: 12,
  },
  priorityItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityLabel: {
    width: 32,
    fontSize: 14,
    color: '#212121',
  },
  priorityBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  priorityProgress: {
    height: '100%',
    borderRadius: 4,
  },
  highPriority: {
    backgroundColor: '#F44336',
  },
  mediumPriority: {
    backgroundColor: '#FFC107',
  },
  lowPriority: {
    backgroundColor: '#4CAF50',
  },
  priorityValue: {
    width: 48,
    fontSize: 14,
    color: '#757575',
    textAlign: 'right',
  },
  categoryStats: {
    gap: 12,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryLabel: {
    width: 80,
    fontSize: 14,
    color: '#212121',
  },
  categoryBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  categoryProgress: {
    height: '100%',
    backgroundColor: '#2196F3',
    borderRadius: 4,
  },
  categoryValue: {
    width: 48,
    fontSize: 14,
    color: '#757575',
    textAlign: 'right',
  },
  tagStats: {
    gap: 12,
  },
  tagItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagLabel: {
    width: 80,
    fontSize: 14,
    color: '#212121',
  },
  tagBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  tagProgress: {
    height: '100%',
    backgroundColor: '#2196F3',
    borderRadius: 4,
  },
  tagValue: {
    width: 48,
    fontSize: 14,
    color: '#757575',
    textAlign: 'right',
  },
});

export default memo(StatisticsChart); 