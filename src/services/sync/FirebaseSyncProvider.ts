import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, setDoc, doc } from 'firebase/firestore';
import { Todo } from '../../types/todo';
import { BaseSyncProvider, SyncConfig } from './SyncService';

const firebaseConfig = {
  // 这里需要填入Firebase配置信息
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

export class FirebaseSyncProvider extends BaseSyncProvider {
  private db: any;

  constructor(config: SyncConfig) {
    super(config);
  }

  async initialize(): Promise<void> {
    try {
      const app = initializeApp(firebaseConfig);
      this.db = getFirestore(app);
    } catch (error) {
      console.error('初始化Firebase失败:', error);
      throw error;
    }
  }

  async uploadTodos(todos: Todo[]): Promise<void> {
    try {
      const batch = todos.map(async (todo) => {
        const docRef = doc(this.db, 'todos', todo.id);
        await setDoc(docRef, {
          ...todo,
          dueDate: todo.dueDate?.toISOString(),
          reminderTime: todo.reminderTime?.toISOString(),
          createdAt: todo.createdAt.toISOString(),
          updatedAt: todo.updatedAt.toISOString(),
        });
      });

      await Promise.all(batch);
    } catch (error) {
      console.error('上传到Firebase失败:', error);
      throw error;
    }
  }

  async downloadTodos(): Promise<Todo[]> {
    try {
      const todosCol = collection(this.db, 'todos');
      const todoSnapshot = await getDocs(todosCol);
      const todos: Todo[] = [];

      todoSnapshot.forEach((doc) => {
        const data = doc.data();
        todos.push({
          ...data,
          dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
          reminderTime: data.reminderTime ? new Date(data.reminderTime) : undefined,
          createdAt: new Date(data.createdAt),
          updatedAt: new Date(data.updatedAt),
        } as Todo);
      });

      return todos;
    } catch (error) {
      console.error('从Firebase下载失败:', error);
      throw error;
    }
  }
} 