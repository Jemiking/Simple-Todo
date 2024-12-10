import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useTodo } from '../contexts/TodoContext';
import { CategoryStatisticsService, CategoryStatistics } from '../services/categoryStatisticsService';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const screenWidth = Dimensions.get('window').width;

const CategoryStatisticsScreen: React.FC = () => {
  const { theme } = useTheme();
  const { todos, categories } = useTodo();
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [statistics, setStatistics] = useState<CategoryStatistics[]>([]);
  const [comparisonData, setComparisonData] = useState<any>(null);
  const [trendData, setTrendData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
  }, [todos, categories, selectedCategory]);

  const loadStatistics = async () => {
    try {
      setIsLoading(true);
      const statisticsService = CategoryStatisticsService.getInstance();
      const stats = statisticsService.calculateStatistics(todos, categories);
      setStatistics(stats);

      if (stats.length > 0) {
        setComparisonData(statisticsService.getComparisonData(stats));
        setTrendData(statisticsService.getTrendData(todos, selectedCategory, 7));
      }
    } catch (error) {
      console.error('加载统计数据失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderCategorySelector = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.categorySelector}
    >
      {categories.map(category => (
        <TouchableOpacity
          key={category.id}
          style={[
            styles.categoryButton,
            {
              backgroundColor: selectedCategory?.id === category.id
                ? theme.colors.primary
                : theme.colors.card,
            },
          ]}
          onPress={() => setSelectedCategory(category)}
        >
          <Text
            style={[
              styles.categoryButtonText,
              {
                color: selectedCategory?.id === category.id
                  ? '#FFFFFF'
                  : theme.colors.text,
              },
            ]}
          >
            {category.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderStatisticsCard = (title: string, value: string | number, icon: string) => (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
      ]}
    >
      <Icon name={icon} size={24} color={theme.colors.primary} />
      <Text style={[styles.cardTitle, { color: theme.colors.text }]}>{title}</Text>
      <Text style={[styles.cardValue, { color: theme.colors.primary }]}>{value}</Text>
    </View>
  );

  const renderTrendChart = () => {
    if (!trendData) return null;

    return (
      <View style={styles.chartContainer}>
        <Text style={[styles.chartTitle, { color: theme.colors.text }]}>
          趋势图
        </Text>
        <LineChart
          data={{
            labels: trendData.dates.map((date: string) => date.slice(5)),
            datasets: [
              {
                data: trendData.completed,
                color: () => theme.colors.primary,
                strokeWidth: 2,
              },
              {
                data: trendData.created,
                color: () => theme.colors.success,
                strokeWidth: 2,
              },
            ],
          }}
          width={screenWidth - 32}
          height={220}
          chartConfig={{
            backgroundColor: theme.colors.card,
            backgroundGradientFrom: theme.colors.card,
            backgroundGradientTo: theme.colors.card,
            decimalPlaces: 0,
            color: (opacity = 1) => theme.colors.text + opacity.toString(16).padStart(2, '0'),
            labelColor: (opacity = 1) => theme.colors.text + opacity.toString(16).padStart(2, '0'),
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: '6',
              strokeWidth: '2',
              stroke: theme.colors.card,
            },
          }}
          bezier
          style={{
            marginVertical: 8,
            borderRadius: 16,
          }}
        />
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: theme.colors.primary }]} />
            <Text style={[styles.legendText, { color: theme.colors.text }]}>已完成</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: theme.colors.success }]} />
            <Text style={[styles.legendText, { color: theme.colors.text }]}>新建</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderPriorityChart = () => {
    const selectedStats = statistics.find(s => s.categoryId === selectedCategory?.id);
    if (!selectedStats) return null;

    const data = [
      {
        name: '高',
        population: selectedStats.todosByPriority.high,
        color: theme.colors.error,
        legendFontColor: theme.colors.text,
      },
      {
        name: '中',
        population: selectedStats.todosByPriority.medium,
        color: theme.colors.warning,
        legendFontColor: theme.colors.text,
      },
      {
        name: '低',
        population: selectedStats.todosByPriority.low,
        color: theme.colors.success,
        legendFontColor: theme.colors.text,
      },
      {
        name: '无',
        population: selectedStats.todosByPriority.none,
        color: theme.colors.border,
        legendFontColor: theme.colors.text,
      },
    ];

    return (
      <View style={styles.chartContainer}>
        <Text style={[styles.chartTitle, { color: theme.colors.text }]}>
          优先级分布
        </Text>
        <PieChart
          data={data}
          width={screenWidth - 32}
          height={220}
          chartConfig={{
            color: (opacity = 1) => theme.colors.text + opacity.toString(16).padStart(2, '0'),
          }}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const selectedStats = statistics.find(s => s.categoryId === selectedCategory?.id);
  if (!selectedStats) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          无法加载统计数据
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      {renderCategorySelector()}

      <View style={styles.statsGrid}>
        {renderStatisticsCard(
          '总任务数',
          selectedStats.totalTodos,
          'assignment'
        )}
        {renderStatisticsCard(
          '完成率',
          `${selectedStats.completionRate.toFixed(1)}%`,
          'done'
        )}
        {renderStatisticsCard(
          '逾期率',
          `${selectedStats.overdueRate.toFixed(1)}%`,
          'warning'
        )}
        {renderStatisticsCard(
          '平均完成时间',
          `${selectedStats.averageCompletionTime.toFixed(1)}小时`,
          'schedule'
        )}
      </View>

      {renderTrendChart()}
      {renderPriorityChart()}

      {comparisonData && (
        <View style={styles.comparisonSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            分类对比
          </Text>
          <View style={styles.comparisonList}>
            <Text style={[styles.comparisonItem, { color: theme.colors.text }]}>
              任务最多：{comparisonData.mostTodos.categoryName} ({comparisonData.mostTodos.totalTodos}个)
            </Text>
            <Text style={[styles.comparisonItem, { color: theme.colors.text }]}>
              完成率最高：{comparisonData.highestCompletionRate.categoryName} ({comparisonData.highestCompletionRate.completionRate.toFixed(1)}%)
            </Text>
            <Text style={[styles.comparisonItem, { color: theme.colors.text }]}>
              逾期率最低：{comparisonData.lowestOverdueRate.categoryName} ({comparisonData.lowestOverdueRate.overdueRate.toFixed(1)}%)
            </Text>
            <Text style={[styles.comparisonItem, { color: theme.colors.text }]}>
              完成最快：{comparisonData.fastestCompletion.categoryName} ({comparisonData.fastestCompletion.averageCompletionTime.toFixed(1)}小时)
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  categorySelector: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  card: {
    width: '50%',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    margin: 8,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 14,
    marginTop: 8,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },
  chartContainer: {
    marginTop: 24,
    padding: 16,
    borderRadius: 8,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 16,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4,
  },
  legendText: {
    fontSize: 12,
  },
  comparisonSection: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 16,
  },
  comparisonList: {
    backgroundColor: 'transparent',
  },
  comparisonItem: {
    fontSize: 14,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 24,
  },
}); 