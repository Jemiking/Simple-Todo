import React, { memo, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { TrendData, TrendOptions } from '../services/trendService';
import AnimatedView from './AnimatedView';

interface TrendChartProps {
  data: TrendData;
  title: string;
  options?: TrendOptions;
  onOptionsChange?: (options: TrendOptions) => void;
}

const TrendChart: React.FC<TrendChartProps> = ({
  data,
  title,
  options,
  onOptionsChange,
}) => {
  const [showLegend, setShowLegend] = useState(true);

  // 处理图例点击
  const handleLegendPress = useCallback((index: number) => {
    // 切换数据集可见性
  }, []);

  // 图表配置
  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: '#ffffff',
    },
  };

  // 图表数据
  const chartData = {
    labels: data.labels,
    datasets: data.datasets.map(dataset => ({
      data: dataset.data,
      color: (opacity = 1) => dataset.color,
      strokeWidth: 2,
    })),
    legend: data.datasets.map(dataset => dataset.label),
  };

  return (
    <AnimatedView
      animation="fade"
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <TouchableOpacity
          style={styles.legendButton}
          onPress={() => setShowLegend(!showLegend)}
        >
          <MaterialIcons
            name={showLegend ? 'visibility' : 'visibility-off'}
            size={24}
            color="#757575"
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chartContainer}
      >
        <LineChart
          data={chartData}
          width={Math.max(Dimensions.get('window').width - 32, data.labels.length * 60)}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
          withInnerLines={false}
          withOuterLines={true}
          withVerticalLines={false}
          withHorizontalLines={true}
          withVerticalLabels={true}
          withHorizontalLabels={true}
          withDots={true}
          segments={5}
        />
      </ScrollView>

      {showLegend && (
        <View style={styles.legend}>
          {data.datasets.map((dataset, index) => (
            <TouchableOpacity
              key={dataset.label}
              style={styles.legendItem}
              onPress={() => handleLegendPress(index)}
            >
              <View
                style={[
                  styles.legendColor,
                  { backgroundColor: dataset.color },
                ]}
              />
              <Text style={styles.legendText}>{dataset.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {options && onOptionsChange && (
        <View style={styles.options}>
          <TouchableOpacity
            style={[
              styles.optionButton,
              options.days === 7 && styles.selectedOptionButton,
            ]}
            onPress={() => onOptionsChange({ ...options, days: 7 })}
          >
            <Text
              style={[
                styles.optionText,
                options.days === 7 && styles.selectedOptionText,
              ]}
            >
              7天
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.optionButton,
              options.days === 30 && styles.selectedOptionButton,
            ]}
            onPress={() => onOptionsChange({ ...options, days: 30 })}
          >
            <Text
              style={[
                styles.optionText,
                options.days === 30 && styles.selectedOptionText,
              ]}
            >
              30天
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.optionButton,
              options.days === 90 && styles.selectedOptionButton,
            ]}
            onPress={() => onOptionsChange({ ...options, days: 90 })}
          >
            <Text
              style={[
                styles.optionText,
                options.days === 90 && styles.selectedOptionText,
              ]}
            >
              90天
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </AnimatedView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '500',
    color: '#212121',
  },
  legendButton: {
    padding: 4,
  },
  chartContainer: {
    marginHorizontal: -16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#757575',
  },
  options: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    gap: 8,
  },
  optionButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
  },
  selectedOptionButton: {
    backgroundColor: '#E3F2FD',
  },
  optionText: {
    fontSize: 14,
    color: '#757575',
  },
  selectedOptionText: {
    color: '#2196F3',
    fontWeight: '500',
  },
});

export default memo(TrendChart); 