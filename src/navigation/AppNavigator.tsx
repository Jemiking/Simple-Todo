import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { CustomTransition } from './transitions';
import { linking } from './linking';
import { useTheme } from '../contexts/ThemeContext';

// 导入页面组件（这些组件稍后会创建）
import HomeScreen from '../screens/HomeScreen';
import AddTodoScreen from '../screens/AddTodoScreen';
import EditTodoScreen from '../screens/EditTodoScreen';
import SettingsScreen from '../screens/SettingsScreen';
import SearchScreen from '../screens/SearchScreen';
import StatisticsScreen from '../screens/StatisticsScreen';
import BackupScreen from '../screens/BackupScreen';
import ExportScreen from '../screens/ExportScreen';
import TodoListScreen from '../screens/TodoListScreen';
import TodoDetailScreen from '../screens/TodoDetailScreen';
import TodoEditScreen from '../screens/TodoEditScreen';
import ThemeSettingsScreen from '../screens/ThemeSettingsScreen';
import SyncSettingsScreen from '../screens/SyncSettingsScreen';
import BackupSettingsScreen from '../screens/BackupSettingsScreen';
import TagManagementScreen from '../screens/TagManagementScreen';
import CategoryStatisticsScreen from '../screens/CategoryStatisticsScreen';
import CustomStatisticsScreen from '../screens/CustomStatisticsScreen';
import GestureSettingsScreen from '../screens/GestureSettingsScreen';
import ShortcutSettingsScreen from '../screens/ShortcutSettingsScreen';
import LanguageSettingsScreen from '../screens/LanguageSettingsScreen';
import DeviceSyncScreen from '../screens/DeviceSyncScreen';
import VersionHistoryScreen from '../screens/VersionHistoryScreen';

// 定义导航参数类型
export type RootStackParamList = {
  MainTabs: undefined;
  AddTodo: undefined;
  EditTodo: { todoId: string };
  Search: undefined;
  Statistics: undefined;
  Backup: undefined;
  Export: undefined;
  GestureSettings: undefined;
  ShortcutSettings: undefined;
  LanguageSettings: undefined;
  DeviceSync: undefined;
  VersionHistory: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator<MainTabParamList>();

// 主标签导航
const MainTabs = () => {
  const { theme } = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof MaterialIcons.glyphMap;
          
          if (route.name === 'Home') {
            iconName = focused ? 'format-list-bulleted' : 'format-list-bulleted';
          } else {
            iconName = focused ? 'settings' : 'settings';
          }

          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.text,
        headerShown: false,
        // 添加标签切换动画
        tabBarStyle: {
          animation: 'timing',
          config: {
            duration: 200,
          },
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: '待办事项' }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: '设置' }}
      />
    </Tab.Navigator>
  );
};

// 根导航
const AppNavigator: React.FC = () => {
  const { theme } = useTheme();

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.card,
          },
          headerTintColor: theme.colors.text,
          headerTitleStyle: {
            fontWeight: '500',
          },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={({ navigation }) => ({
            title: '待办事项',
            headerRight: () => (
              <View style={styles.headerButtons}>
                <TouchableOpacity
                  style={styles.headerButton}
                  onPress={() => navigation.navigate('Export')}
                >
                  <MaterialIcons name="import-export" size={24} color="white" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.headerButton}
                  onPress={() => navigation.navigate('Backup')}
                >
                  <MaterialIcons name="backup" size={24} color="white" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.headerButton}
                  onPress={() => navigation.navigate('Statistics')}
                >
                  <MaterialIcons name="bar-chart" size={24} color="white" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.headerButton}
                  onPress={() => navigation.navigate('Search')}
                >
                  <MaterialIcons name="search" size={24} color="white" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.headerButton}
                  onPress={() => navigation.navigate('AddTodo')}
                >
                  <MaterialIcons name="add" size={24} color="white" />
                </TouchableOpacity>
              </View>
            ),
          })}
        />
        <Stack.Screen
          name="AddTodo"
          component={AddTodoScreen}
          options={{
            title: '新建待办',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="EditTodo"
          component={EditTodoScreen}
          options={{
            title: '编辑待办',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="Search"
          component={SearchScreen}
          options={{
            title: '搜索待办',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="Statistics"
          component={StatisticsScreen}
          options={{
            title: '统计分析',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="Backup"
          component={BackupScreen}
          options={{
            title: '备份管理',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="Export"
          component={ExportScreen}
          options={{
            title: '导入导出',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="ThemeSettings"
          component={ThemeSettingsScreen}
          options={{ title: '主题设置' }}
        />
        <Stack.Screen
          name="SyncSettings"
          component={SyncSettingsScreen}
          options={{ title: '同步设置' }}
        />
        <Stack.Screen
          name="BackupSettings"
          component={BackupSettingsScreen}
          options={{ title: '备份设置' }}
        />
        <Stack.Screen
          name="TagManagement"
          component={TagManagementScreen}
          options={{ title: '标签管理' }}
        />
        <Stack.Screen
          name="CategoryStatistics"
          component={CategoryStatisticsScreen}
          options={{ title: '分类统计' }}
        />
        <Stack.Screen
          name="CustomStatistics"
          component={CustomStatisticsScreen}
          options={{ title: '自定义统计' }}
        />
        <Stack.Screen
          name="GestureSettings"
          component={GestureSettingsScreen}
          options={{
            title: '手势设置',
            headerTitleAlign: 'center',
          }}
        />
        <Stack.Screen
          name="ShortcutSettings"
          component={ShortcutSettingsScreen}
          options={{
            title: '快捷键设置',
            headerTitleAlign: 'center',
          }}
        />
        <Stack.Screen
          name="LanguageSettings"
          component={LanguageSettingsScreen}
          options={{
            title: '语言设置',
            headerTitleAlign: 'center',
          }}
        />
        <Stack.Screen
          name="DeviceSync"
          component={DeviceSyncScreen}
          options={{
            title: '设备同步',
            headerTitleAlign: 'center',
          }}
        />
        <Stack.Screen
          name="VersionHistory"
          component={VersionHistoryScreen}
          options={{
            title: '版本历史',
            headerTitleAlign: 'center',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  headerButtons: {
    flexDirection: 'row',
  },
  headerButton: {
    marginLeft: 16,
  },
});

export default AppNavigator; 