-- MySQL 初始化脚本示例
-- 此脚本会在容器首次启动时自动执行

-- 创建示例表（如果需要）
-- CREATE TABLE IF NOT EXISTS example_table (
--   id INT AUTO_INCREMENT PRIMARY KEY,
--   name VARCHAR(255) NOT NULL,
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- 插入初始数据（如果需要）
-- INSERT INTO example_table (name) VALUES ('Example 1'), ('Example 2');

-- 设置时区
SET time_zone = '+08:00';

-- 显示初始化完成信息
SELECT 'MySQL initialization completed' AS message;
