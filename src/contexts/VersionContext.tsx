import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  VersionHistoryService,
  Version,
  VersionConfig,
  VersionChange,
  VersionDiff,
  defaultVersionConfig,
} from '../services/versionHistoryService';
import { Todo } from '../types/todo';

interface VersionContextType {
  versions: Version[];
  config: VersionConfig;
  createVersion: (description: string, changes: VersionChange[], todos: Todo[]) => Promise<void>;
  deleteVersion: (versionId: string) => Promise<void>;
  updateConfig: (config: Partial<VersionConfig>) => Promise<void>;
  compareVersions: (versionId1: string, versionId2: string) => VersionDiff[];
  rollbackToVersion: (versionId: string) => Promise<Todo[]>;
}

const VersionContext = createContext<VersionContextType | undefined>(undefined);

export const useVersion = () => {
  const context = useContext(VersionContext);
  if (!context) {
    throw new Error('useVersion must be used within a VersionProvider');
  }
  return context;
};

export const VersionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [versions, setVersions] = useState<Version[]>([]);
  const [config, setConfig] = useState<VersionConfig>(defaultVersionConfig);
  const versionService = VersionHistoryService.getInstance();

  useEffect(() => {
    const initializeVersion = async () => {
      try {
        await versionService.initialize();
        setVersions(versionService.getVersions());
        setConfig(versionService.getConfig());
      } catch (error) {
        console.error('初始化版本历史失败:', error);
      }
    };

    initializeVersion();
  }, []);

  const createVersion = async (
    description: string,
    changes: VersionChange[],
    todos: Todo[]
  ) => {
    try {
      await versionService.createVersion(description, changes, todos);
      setVersions(versionService.getVersions());
    } catch (error) {
      console.error('创建版本失败:', error);
      throw error;
    }
  };

  const deleteVersion = async (versionId: string) => {
    try {
      await versionService.deleteVersion(versionId);
      setVersions(versionService.getVersions());
    } catch (error) {
      console.error('删除版本失败:', error);
      throw error;
    }
  };

  const updateConfig = async (newConfig: Partial<VersionConfig>) => {
    try {
      await versionService.updateConfig(newConfig);
      setConfig(versionService.getConfig());
    } catch (error) {
      console.error('更新版本配置失败:', error);
      throw error;
    }
  };

  const compareVersions = (versionId1: string, versionId2: string) => {
    return versionService.compareVersions(versionId1, versionId2);
  };

  const rollbackToVersion = async (versionId: string) => {
    try {
      return await versionService.rollbackToVersion(versionId);
    } catch (error) {
      console.error('回滚版本失败:', error);
      throw error;
    }
  };

  const value: VersionContextType = {
    versions,
    config,
    createVersion,
    deleteVersion,
    updateConfig,
    compareVersions,
    rollbackToVersion,
  };

  return <VersionContext.Provider value={value}>{children}</VersionContext.Provider>;
}; 