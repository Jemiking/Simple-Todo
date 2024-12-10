import { Todo, TodoPriority } from '../types/todo';
import { StorageService } from '../services/storage';
import { FilterService } from '../services/filterService';
import { SearchService } from '../services/searchService';

describe('Todo 基础功能测试', () => {
  let testTodo: Todo;

  beforeEach(() => {
    testTodo = {
      id: '1',
      title: '测试待办事项',
      description: '这是一个测试用的待办事项',
      completed: false,
      subTasks: [],
      tagIds: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
  });

  test('创建新的Todo', () => {
    expect(testTodo).toBeDefined();
    expect(testTodo.id).toBe('1');
    expect(testTodo.title).toBe('测试待办事项');
    expect(testTodo.completed).toBe(false);
  });

  test('更新Todo状态', () => {
    testTodo.completed = true;
    expect(testTodo.completed).toBe(true);
  });

  test('添加子任务', () => {
    const subTask = {
      id: 'sub1',
      title: '子任务1',
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    testTodo.subTasks.push(subTask);
    expect(testTodo.subTasks.length).toBe(1);
    expect(testTodo.subTasks[0].title).toBe('子任务1');
  });
});

describe('Todo 存储服务测试', () => {
  beforeEach(async () => {
    await StorageService.clearAll();
  });

  test('保存和读取Todo', async () => {
    const todo = {
      id: '1',
      title: '测试存储',
      description: '测试存储功能',
      completed: false,
      subTasks: [],
      tagIds: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await StorageService.addTodo(todo);
    const todos = await StorageService.getTodos();
    expect(todos.length).toBe(1);
    expect(todos[0].title).toBe('测试存储');
  });
});

describe('Todo 过滤服务测试', () => {
  let todos: Todo[];

  beforeEach(() => {
    todos = [
      {
        id: '1',
        title: '高优先级待办',
        completed: false,
        priority: TodoPriority.High,
        subTasks: [],
        tagIds: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        title: '已完成待办',
        completed: true,
        priority: TodoPriority.Medium,
        subTasks: [],
        tagIds: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  });

  test('按完成状态过滤', () => {
    const filtered = FilterService.filterTodos(todos, { completed: true });
    expect(filtered.length).toBe(1);
    expect(filtered[0].id).toBe('2');
  });

  test('按优先级过滤', () => {
    const filtered = FilterService.filterTodos(todos, { priority: TodoPriority.High });
    expect(filtered.length).toBe(1);
    expect(filtered[0].id).toBe('1');
  });
});

describe('Todo 搜索服务测试', () => {
  let todos: Todo[];

  beforeEach(() => {
    todos = [
      {
        id: '1',
        title: '购买牛奶',
        description: '超市购物',
        completed: false,
        subTasks: [],
        tagIds: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        title: '写报告',
        description: '工作任务',
        completed: false,
        subTasks: [],
        tagIds: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  });

  test('按标题搜索', () => {
    const results = SearchService.searchTodos(todos, { query: '牛奶' });
    expect(results.length).toBe(1);
    expect(results[0].id).toBe('1');
  });

  test('按描述搜索', () => {
    const results = SearchService.searchTodos(todos, { query: '工作' });
    expect(results.length).toBe(1);
    expect(results[0].id).toBe('2');
  });
}); 