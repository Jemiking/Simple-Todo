// 定义深层链接配置
export const linking = {
  prefixes: ['simpletodo://', 'https://simpletodo.app'],
  
  config: {
    screens: {
      MainTabs: {
        screens: {
          Home: {
            path: 'home',
          },
          Settings: {
            path: 'settings',
          },
        },
      },
      AddTodo: 'add',
      EditTodo: {
        path: 'edit/:todoId',
        parse: {
          todoId: (todoId: string) => todoId,
        },
      },
    },
  },

  // 自定义处理函数
  getInitialURL: async () => {
    // 在这里可以添加自定义的初始URL处理逻辑
    return null;
  },

  subscribe: (listener: (url: string) => void) => {
    // 在这里可以添加自定义的URL监听逻辑
    return () => {
      // 清理函数
    };
  },
}; 