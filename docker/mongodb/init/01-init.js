// MongoDB 初始化脚本示例
// 此脚本会在容器首次启动时自动执行

// 切换到应用数据库
db = db.getSiblingDB('nest_db');

// 创建集合和索引（如果需要）
// db.createCollection('example_collection');
// db.example_collection.createIndex({ name: 1 }, { unique: true });

// 插入初始数据（如果需要）
// db.example_collection.insertMany([
//   { name: 'Example 1', createdAt: new Date() },
//   { name: 'Example 2', createdAt: new Date() }
// ]);

print('MongoDB initialization completed');
