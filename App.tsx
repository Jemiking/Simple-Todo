import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { TodoProvider } from './src/contexts/TodoContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { TagProvider } from './src/contexts/TagContext';
import { AttachmentProvider } from './src/contexts/AttachmentContext';
import { GestureProvider } from './src/contexts/GestureContext';
import { ShortcutProvider } from './src/contexts/ShortcutContext';
import { I18nProvider } from './src/contexts/I18nContext';
import { DeviceProvider } from './src/contexts/DeviceContext';
import { VersionProvider } from './src/contexts/VersionContext';
import { BackupService } from './src/services/backup/BackupService';
import AppNavigator from './src/navigation/AppNavigator';
import { useTheme } from './src/contexts/ThemeContext';

const ThemedApp: React.FC = () => {
  const { theme } = useTheme();

  useEffect(() => {
    const initializeBackup = async () => {
      try {
        const backupService = BackupService.getInstance();
        await backupService.initialize();
      } catch (error) {
        console.error('初始化备份服务失败:', error);
      }
    };

    initializeBackup();
  }, []);

  return (
    <NavigationContainer theme={theme}>
      <AppNavigator />
    </NavigationContainer>
  );
};

const App: React.FC = () => {
  return (
    <I18nProvider>
      <ThemeProvider>
        <TodoProvider>
          <TagProvider>
            <AttachmentProvider>
              <GestureProvider>
                <ShortcutProvider>
                  <DeviceProvider>
                    <VersionProvider>
                      <ThemedApp />
                    </VersionProvider>
                  </DeviceProvider>
                </ShortcutProvider>
              </GestureProvider>
            </AttachmentProvider>
          </TagProvider>
        </TodoProvider>
      </ThemeProvider>
    </I18nProvider>
  );
};

export default App; 