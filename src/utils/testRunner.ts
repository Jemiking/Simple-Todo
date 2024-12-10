import { TestUtils } from './testUtils';

export class TestRunner {
  // 运行所有测试
  static async runAllTests(): Promise<void> {
    console.log('开始运行测试...\n');

    try {
      // 清理数据
      console.log('清理测试数据...');
      await TestUtils.cleanupData();
      console.log('数据清理完成\n');

      // 功能测试
      console.log('开始功能测试...');
      await this.runFunctionalTests();
      console.log('功能测试完成\n');

      // 性能测试
      console.log('开始性能测试...');
      await this.runPerformanceTests();
      console.log('性能测试完成\n');

      console.log('所有测试完成！');
    } catch (error) {
      console.error('测试过程中发生错误:', error);
      throw error;
    }
  }

  // 运行功能测试
  private static async runFunctionalTests(): Promise<void> {
    try {
      // 测试数据生成和验证
      console.log('测试数据生成和验证...');
      const { todos, categories, tags } = TestUtils.generateTestData(100, 10, 20);
      const validationResults = TestUtils.validateData(todos, categories, tags);

      // 输出验证结果
      const {
        todoErrors,
        categoryErrors,
        tagErrors,
      } = validationResults;

      const todoErrorCount = Object.keys(todoErrors).length;
      const categoryErrorCount = Object.keys(categoryErrors).length;
      const tagErrorCount = Object.keys(tagErrors).length;

      console.log(`数据验证结果：
- Todo项错误：${todoErrorCount}个
- 分类错误：${categoryErrorCount}个
- 标签错误：${tagErrorCount}个
`);

      if (todoErrorCount > 0) {
        console.log('Todo项错误详情：');
        Object.entries(todoErrors).forEach(([id, errors]) => {
          console.log(`- ID: ${id}`);
          errors.forEach(error => console.log(`  - ${error}`));
        });
      }

      if (categoryErrorCount > 0) {
        console.log('分类错误详情：');
        Object.entries(categoryErrors).forEach(([id, errors]) => {
          console.log(`- ID: ${id}`);
          errors.forEach(error => console.log(`  - ${error}`));
        });
      }

      if (tagErrorCount > 0) {
        console.log('标签错误详情：');
        Object.entries(tagErrors).forEach(([id, errors]) => {
          console.log(`- ID: ${id}`);
          errors.forEach(error => console.log(`  - ${error}`));
        });
      }

      // 测试数据加载和保存
      console.log('\n测试数据加载和保存...');
      await TestUtils.loadTestData(100, 10, 20);
      console.log('数据加载和保存测试完成');

    } catch (error) {
      console.error('功能测试失败:', error);
      throw error;
    }
  }

  // 运行性能测试
  private static async runPerformanceTests(): Promise<void> {
    try {
      const testCases = [100, 500, 1000, 5000];

      for (const count of testCases) {
        console.log(`\n测试 ${count} 条数据的性能：`);

        // 测试数据加载性能
        console.log('\n数据加载性能：');
        const loadingResults = await TestUtils.testDataLoadingPerformance(count);
        console.log(`- 加载时间：${loadingResults.loadTime.toFixed(2)}ms`);
        console.log(`- 解析时间：${loadingResults.parseTime.toFixed(2)}ms`);
        console.log(`- 总时间：${loadingResults.totalTime.toFixed(2)}ms`);

        // 测试数据保存性能
        console.log('\n数据保存性能：');
        const savingResults = await TestUtils.testDataSavingPerformance(count);
        console.log(`- 生成时间：${savingResults.generateTime.toFixed(2)}ms`);
        console.log(`- 保存时间：${savingResults.saveTime.toFixed(2)}ms`);
        console.log(`- 总时间：${savingResults.totalTime.toFixed(2)}ms`);

        // ��试搜索性能
        console.log('\n搜索性能：');
        const searchResults = await TestUtils.testSearchPerformance('测试', count);
        console.log(`- 搜索时间：${searchResults.searchTime.toFixed(2)}ms`);
        console.log(`- 结果数量：${searchResults.resultCount}个`);

        // 测试筛选性能
        console.log('\n筛选性能：');
        const filterResults = await TestUtils.testFilterPerformance(count);
        console.log(`- 筛选时间：${filterResults.filterTime.toFixed(2)}ms`);
        console.log(`- 结果数量：${filterResults.resultCount}个`);
      }
    } catch (error) {
      console.error('性能测试失败:', error);
      throw error;
    }
  }

  // 生成测试报告
  static generateTestReport(results: any): string {
    const now = new Date();
    const report = `
# SimpleTodo 测试报告

生成时间：${now.toLocaleString()}

## 1. 功能测试结果

### 1.1 数据验证
- Todo项错误数：${results.todoErrorCount}
- 分类错误数：${results.categoryErrorCount}
- 标签错误数：${results.tagErrorCount}

### 1.2 数据操作
- 数据加载：${results.dataLoadingSuccess ? '✅ 成功' : '❌ 失败'}
- 数据保存：${results.dataSavingSuccess ? '✅ 成功' : '❌ 失败'}
- 数据验证：${results.dataValidationSuccess ? '✅ 成功' : '�� 失败'}

## 2. 性能测试结果

### 2.1 数据加载性能
${Object.entries(results.loadingPerformance).map(([count, data]) => `
#### ${count}条数据
- 加载时间：${data.loadTime.toFixed(2)}ms
- 解析时间：${data.parseTime.toFixed(2)}ms
- 总时间：${data.totalTime.toFixed(2)}ms
`).join('\n')}

### 2.2 数据保存性能
${Object.entries(results.savingPerformance).map(([count, data]) => `
#### ${count}条数据
- 生成时间：${data.generateTime.toFixed(2)}ms
- 保存时间：${data.saveTime.toFixed(2)}ms
- 总时间：${data.totalTime.toFixed(2)}ms
`).join('\n')}

### 2.3 搜索性能
${Object.entries(results.searchPerformance).map(([count, data]) => `
#### ${count}条数据
- 搜索时间：${data.searchTime.toFixed(2)}ms
- 结果数量：${data.resultCount}个
`).join('\n')}

### 2.4 筛选性能
${Object.entries(results.filterPerformance).map(([count, data]) => `
#### ${count}条数据
- 筛选时间：${data.filterTime.toFixed(2)}ms
- 结果数量：${data.resultCount}个
`).join('\n')}

## 3. 性能分析

### 3.1 数据加载
- 平均加载时间：${results.averageLoadTime.toFixed(2)}ms
- 最大加载时间：${results.maxLoadTime.toFixed(2)}ms
- 最小加载时间：${results.minLoadTime.toFixed(2)}ms

### 3.2 数据保存
- 平均保存时间：${results.averageSaveTime.toFixed(2)}ms
- 最大保存时间：${results.maxSaveTime.toFixed(2)}ms
- 最小保存时间：${results.minSaveTime.toFixed(2)}ms

### 3.3 搜索和筛选
- 平均搜索时间：${results.averageSearchTime.toFixed(2)}ms
- 平均筛选时间：${results.averageFilterTime.toFixed(2)}ms

## 4. 建议

1. ${results.loadTimeHigh ? '需要优化数据加载性能' : '数据加载性能良好'}
2. ${results.saveTimeHigh ? '需要优化数据保存性能' : '数据保存性能良好'}
3. ${results.searchTimeHigh ? '需要优化搜索性能' : '搜索性能良好'}
4. ${results.filterTimeHigh ? '需要优化筛选性能' : '筛选性能良好'}

## 5. 结论

${results.conclusion}
`;

    return report;
  }
} 