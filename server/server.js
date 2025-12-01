const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cron = require('node-cron');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json());

// 数据存储路径
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR);
}
const DATA_FILE = path.join(DATA_DIR, 'accounts.json');

// 初始化数据文件
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ lastUpdated: null, accounts: [] }, null, 2));
}

// API路由
app.get('/api/accounts', (req, res) => {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        const jsonData = JSON.parse(data);
        res.json(jsonData);
    } catch (error) {
        console.error('读取数据文件错误:', error);
        res.status(500).json({ error: '无法获取数据' });
    }
});

// 刷新数据接口
app.post('/api/refresh', async (req, res) => {
    try {
        const data = await collectMt4Data();
        saveData(data);
        res.json({ success: true, message: '数据刷新成功', data });
    } catch (error) {
        console.error('刷新数据错误:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// 从MT4收集数据
async function collectMt4Data() {
    console.log('开始从MT4收集数据...');
    
    try {
        // 这里实现与MT4交互的逻辑
        // 示例使用模拟数据，实际使用时需要替换为真实的MT4 API调用
        
        // 模拟MT4 API响应
        const mockMt4Data = [
            {
                id: '12345678',
                balance: 12500.75,
                equity: 12850.30,
                margin: 245.50,
                freeMargin: 12604.80,
                profit: 350.25,
                trades: 3,
                lastUpdate: new Date().toISOString()
            },
            {
                id: '87654321',
                balance: 8750.40,
                equity: 9050.60,
                margin: 180.20,
                freeMargin: 8870.40,
                profit: 301.20,
                trades: 2,
                lastUpdate: new Date().toISOString()
            }
        ];
        
        console.log('MT4数据收集完成:', mockMt4Data);
        return {
            lastUpdated: new Date().toISOString(),
            accounts: mockMt4Data
        };
        
    } catch (error) {
        console.error('MT4数据收集错误:', error);
        throw new Error(`MT4数据收集失败: ${error.message}`);
    }
}

// 保存数据到文件
function saveData(data) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
        console.log('数据已保存到文件');
    } catch (error) {
        console.error('保存数据错误:', error);
        throw error;
    }
}

// 设置定时任务 - 每5分钟刷新一次数据
cron.schedule('*/5 * * * *', () => {
    console.log('执行定时任务，刷新MT4数据...');
    collectMt4Data()
        .then(data => saveData(data))
        .catch(error => console.error('定时任务执行错误:', error));
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
    
    // 首次启动时立即刷新一次数据
    setTimeout(() => {
        console.log('首次数据刷新...');
        collectMt4Data()
            .then(data => saveData(data))
            .catch(error => console.error('首次数据刷新错误:', error));
    }, 3000); // 延迟3秒，确保服务器完全启动
});
