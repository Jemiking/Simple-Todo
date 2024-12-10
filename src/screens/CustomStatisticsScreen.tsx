import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../contexts/ThemeContext';
import { useTodo } from '../contexts/TodoContext';
import {
  CustomStatisticsService,
  StatisticsFilter,
  StatisticsResult,
} from '../services/customStatisticsService';
import { TodoPriority } from '../types/todo';
import { format } from 'date-fns';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const screenWidth = Dimensions.get('window').width;

const CustomStatisticsScreen: React.FC = () => {
  const { theme } = useTheme();
  const { todos, categories } = useTodo();
  const [filter, setFilter] = useState<StatisticsFilter>({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
    endDate: new Date(),
    includeCompleted: true,
    includeIncomplete: true,
    includeOverdue: true,
  });
  const [statistics, setStatistics] = useState<StatisticsResult | null>(null);
  const [previousStatistics, setPreviousStatistics] = useState<StatisticsResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadStatistics();
  }, [todos, filter]);

  const loadStatistics = async () => {
    try {
      setIsLoading(true);
      const statisticsService = CustomStatisticsService.getInstance();

      // 计算当前时期的统计
      const currentStats = statisticsService.calculateStatistics(todos, filter);
      setStatistics(currentStats);

      // 计算上一时期的统计
      const previousFilter = {
        ...filter,
        startDate: new Date(filter.startDate!.getTime() - (filter.endDate!.getTime() - filter.startDate!.getTime())),
        endDate: new Date(filter.startDate!.getTime() - 1),
      };
      const previousStats = statisticsService.calculateStatistics(todos, previousFilter);
      setPreviousStatistics(previousStats);
    } catch (error) {
      console.error('加载统计数据失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderDatePicker = (
    label: string,
    value: Date,
    onChange: (date: Date) => void,
    onPress: () => void
  ) => (
    <TouchableOpacity
      style={[styles.dateButton, { backgroundColor: theme.colors.card }]}
      onPress={onPress}
    >
      <Text style={[styles.dateButtonLabel, { color: theme.colors.text }]}>
        {label}
      </Text>
      <Text style={[styles.dateButtonText, { color: theme.colors.text }]}>
        {format(value, 'yyyy-MM-dd')}
      </Text>
    </TouchableOpacity>
  );

  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      <View style={styles.filterRow}>
        <Text style={[styles.filterLabel, { color: theme.colors.text }]}>
          包含已完成
        </Text>
        <Switch
          value={filter.includeCompleted}
          onValueChange={value => setFilter(prev => ({ ...prev, includeCompleted: value }))}
          trackColor={{ false: theme.colors.border, true: theme.colors.primary + '80' }}
          thumbColor={filter.includeCompleted ? theme.colors.primary : '#f4f3f4'}
        />
      </View>
      <View style={styles.filterRow}>
        <Text style={[styles.filterLabel, { color: theme.colors.text }]}>
          包含未完成
        </Text>
        <Switch
          value={filter.includeIncomplete}
          onValueChange={value => setFilter(prev => ({ ...prev, includeIncomplete: value }))}
          trackColor={{ false: theme.colors.border, true: theme.colors.primary + '80' }}
          thumbColor={filter.includeIncomplete ? theme.colors.primary : '#f4f3f4'}
        />
      </View>
      <View style={styles.filterRow}>
        <Text style={[styles.filterLabel, { color: theme.colors.text }]}>
          包含逾期
        </Text>
        <Switch
          value={filter.includeOverdue}
          onValueChange={value => setFilter(prev => ({ ...prev, includeOverdue: value }))}
          trackColor={{ false: theme.colors.border, true: theme.colors.primary + '80' }}
          thumbColor={filter.includeOverdue ? theme.colors.primary : '#f4f3f4'}
        />
      </View>
    </View>
  );

  const renderStatisticsCard = (title: string, value: string | number, icon: string, change?: number) => (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
      ]}
    >
      <Icon name={icon} size={24} color={theme.colors.primary} />
      <Text style={[styles.cardTitle, { color: theme.colors.text }]}>{title}</Text>
      <Text style={[styles.cardValue, { color: theme.colors.primary }]}>{value}</Text>
      {change !== undefined && (
        <Text
          style={[
            styles.changeText,
            {
              color:
                change > 0
                  ? theme.colors.success
                  : change < 0
                  ? theme.colors.error
                  : theme.colors.text,
            },
          ]}
        >
          {change > 0 ? '+' : ''}
          {change.toFixed(1)}%
        </Text>
      )}
    </View>
  );

  const renderTrendChart = () => {
    if (!statistics) return null;

    const dates = Object.keys(statistics.todosByDate).slice(-7);
    const created = dates.map(date => statistics.todosByDate[date].created);
    const completed = dates.map(date => statistics.todosByDate[date].completed);

    return (
      <View style={styles.chartContainer}>
        <Text style={[styles.chartTitle, { color: theme.colors.text }]}>
          趋势图（最近7天）
        </Text>
        <LineChart
          data={{
            labels: dates.map(date => date.slice(5)),
            datasets: [
              {
                data: created,
                color: () => theme.colors.primary,
                strokeWidth: 2,
              },
              {
                data: completed,
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
            <Text style={[styles.legendText, { color: theme.colors.text }]}>新建</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: theme.colors.success }]} />
            <Text style={[styles.legendText, { color: theme.colors.text }]}>完成</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderPriorityChart = () => {
    if (!statistics) return null;

    const data = [
      {
        name: '高',
        population: statistics.todosByPriority.high,
        color: theme.colors.error,
        legendFontColor: theme.colors.text,
      },
      {
        name: '中',
        population: statistics.todosByPriority.medium,
        color: theme.colors.warning,
        legendFontColor: theme.colors.text,
      },
      {
        name: '低',
        population: statistics.todosByPriority.low,
        color: theme.colors.success,
        legendFontColor: theme.colors.text,
      },
      {
        name: '无',
        population: statistics.todosByPriority.none,
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

  const renderCompletionTimeDistribution = () => {
    if (!statistics) return null;

    const distribution = statistics.completionTimeDistribution;
    const total = Object.values(distribution).reduce((sum, value) => sum + value, 0);

    return (
      <View style={styles.distributionContainer}>
        <Text style={[styles.chartTitle, { color: theme.colors.text }]}>
          完成时间分布
        </Text>
        {Object.entries(distribution).map(([key, value]) => {
          const percentage = total > 0 ? (value / total) * 100 : 0;
          const label = {
            lessThanHour: '1小时内',
            oneToThreeHours: '1-3小时',
            threeToSixHours: '3-6小时',
            sixToTwelveHours: '6-12小时',
            twelveToTwentyFourHours: '12-24小时',
            moreThanDay: '超过24小时',
          }[key as keyof typeof distribution];

          return (
            <View key={key} style={styles.distributionItem}>
              <View style={styles.distributionLabelContainer}>
                <Text style={[styles.distributionLabel, { color: theme.colors.text }]}>
                  {label}
                </Text>
                <Text style={[styles.distributionValue, { color: theme.colors.text }]}>
                  {value}个 ({percentage.toFixed(1)}%)
                </Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View
                  style={[
                    styles.progressBar,
                    {
                      backgroundColor: theme.colors.primary,
                      width: `${percentage}%`,
                    },
                  ]}
                />
              </View>
            </View>
          );
        })}
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

  if (!statistics || !previousStatistics) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          无法加载统计数据
        </Text>
      </View>
    );
  }

  const comparison = CustomStatisticsService.getInstance().getComparisonWithPreviousPeriod(
    statistics,
    previousStatistics
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <View style={styles.dateRange}>
          {renderDatePicker(
            '开始日期',
            filter.startDate!,
            date => setFilter(prev => ({ ...prev, startDate: date })),
            () => setShowStartDatePicker(true)
          )}
          {renderDatePicker(
            '结束日期',
            filter.endDate!,
            date => setFilter(prev => ({ ...prev, endDate: date })),
            () => setShowEndDatePicker(true)
          )}
        </View>
        <TouchableOpacity
          style={[styles.filterButton, { borderColor: theme.colors.border }]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Icon name="filter-list" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {showFilters && renderFilters()}

      <View style={styles.statsGrid}>
        {renderStatisticsCard(
          '总任务数',
          statistics.totalTodos,
          'assignment',
          comparison.totalTodosChange
        )}
        {renderStatisticsCard(
          '完成率',
          `${statistics.completionRate.toFixed(1)}%`,
          'done',
          comparison.completionRateChange
        )}
        {renderStatisticsCard(
          '逾期率',
          `${statistics.overdueRate.toFixed(1)}%`,
          'warning',
          comparison.overdueRateChange
        )}
        {renderStatisticsCard(
          '平均完成时间',
          `${statistics.averageCompletionTime.toFixed(1)}小时`,
          'schedule',
          comparison.averageCompletionTimeChange
        )}
      </View>

      {renderTrendChart()}
      {renderPriorityChart()}
      {renderCompletionTimeDistribution()}

      {showStartDatePicker && (
        <DateTimePicker
          value={filter.startDate!}
          mode="date"
          display="default"
          onChange={(event, date) => {
            setShowStartDatePicker(false);
            if (date) {
              setFilter(prev => ({ ...prev, startDate: date }));
            }
          }}
        />
      )}

      {showEndDatePicker && (
        <DateTimePicker
          value={filter.endDate!}
          mode="date"
          display="default"
          onChange={(event, date) => {
            setShowEndDatePicker(false);
            if (date) {
              setFilter(prev => ({ ...prev, endDate: date }));
            }
          }}
        />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dateRange: {
    flex: 1,
    flexDirection: 'row',
    marginRight: 8,
  },
  dateButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  dateButtonLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  dateButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filtersContainer: {
    marginBottom: 16,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  filterLabel: {
    fontSize: 14,
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
  changeText: {
    fontSize: 12,
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
  distributionContainer: {
    marginTop: 24,
  },
  distributionItem: {
    marginBottom: 12,
  },
  distributionLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  distributionLabel: {
    fontSize: 14,
  },
  distributionValue: {
    fontSize: 14,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 24,
  },
}); 