# SimpleTodo

一个简洁而功能强大的待办事项管理应用，基于React Native和TypeScript开发。

## 功能特性

### 核心功能 (P1)
- ✅ Todo数据结构设计
- ✅ 本地存储服务
- ✅ 上下文管理
- ✅ 基础UI组件

### 基础功能 (P2)
- ✅ 主页面和详情页面
- ✅ 过滤和排序
- ✅ 批量操作
- ✅ 主题切换
- ✅ 云同步
- ✅ 自动备份

### 扩展功能 (P3)
- ✅ 自定义主题
- ✅ 手势操作
- ✅ 键盘快捷键
- ✅ 多语言支持
- ✅ 多设备同步
- ✅ 版本历史
- ⏳ 社交功能

## 技术栈

- React Native
- TypeScript
- Expo
- AsyncStorage
- React Navigation
- Jest (测试框架)
- WebDAV (云同步)

## 安装说明

1. 确保已安装Node.js和npm
```bash
node -v
npm -v
```

2. 克隆项目
```bash
git clone [repository-url]
cd SimpleTodo
```

3. 安装依赖
```bash
npm install
```

4. 启动开发服务器
```bash
npm start
```

## 使用说明

### 基本操作
- 添加待办：点击右下角的"+"按钮
- 编辑待办：点击待办项进入编辑模式
- 完成待办：点击待办项左侧的复��框
- 删除待办：左滑待办项，点击删除按钮

### 高级功能
- 批量操作：长按待办项进入多选模式
- 过滤排序：使用顶部的过滤器和排序选项
- 主题切换：在设置中选择明暗主题
- 云同步：配置WebDAV服务器后自动同步
- 数据备份：在设置中手动备份或设置自动备份

## 开发进度

详细的开发进度请查看 [progress.md](docs/progress.md)

## 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情 