const axios = require('axios');

// MT4配置
const MT4_CONFIG = {
    // 从环境变量或config.json中获取
    apiBaseUrl: process.env.MT4_API_URL || 'http://localhost:3000',
    accounts: [
        { id: '12345678', name: '主账户' },
        { id: '87654321', name: '交易账户' }
    ],
    // 在实际使用中，这里应该使用真实的MT4 API调用
    // 例如: https://www.mql5.com/en/docs/integration/metatrader
};

// 收集单个账户的数据
async function collectAccountData(account) {
    console.log(`正在收集账户 ${account.id} 的数据...`);
    
    // 这里实现与MT4 API的实际交互
    // 示例使用模拟数据
    const mockData = {
        id: account.id,
        name: account.name,
        balance: 12500.75,
        equity: 12850.30,
        margin: 245.50,
        freeMargin: 12604.80,
        profit: 350.25,
        trades: 3,
        lastUpdate: new Date().toISOString()
    };
    
    return mockData;
}

// 收集所有账户的数据
async function collectAllData() {
    console.log('开始收集所有MT4账户数据...');
    
    try {
        const results = [];
        
        // 并行收集所有账户数据
        const promises = MT4_CONFIG.accounts.map(account => 
            collectAccountData(account)
                .then(data => {
                    results.push(data);
                    console.log(`账户 ${account.id} 数据收集完成`);
                })
                .catch(error => {
                    console.error(`收集账户 ${account.id} 数据失败:`, error);
                })
        );
        
        await Promise.all(promises);
        
        const allData = {
            lastUpdated: new Date().toISOString(),
            accounts: results
        };
        
        console.log('所有账户数据收集完成');
        return allData;
        
    } catch (error) {
        console.error('收集数据过程中出错:', error);
        throw error;
    }
}

// 将数据保存到本地或发送到API
async function saveData(data) {
    try {
        console.log('保存数据...');
        
        // 保存到文件
        const fs = require('fs');
        const path = require('path');
        const DATA_DIR = path.join(__dirname, '../server/data');
        
        if (!fs.existsSync(DATA_DIR)) {
            fs.mkdirSync(DATA_DIR);
        }
        
        const DATA_FILE = path.join(DATA_DIR, 'accounts.json');
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
        
        // 也可以发送到API
        // await axios.post(`${MT4_CONFIG.apiBaseUrl}/api/accounts`, data);
        
        console.log('数据已保存');
        return true;
        
    } catch (error) {
        console.error('保存数据失败:', error);
        return false;
    }
}

// 主函数
async function main() {
    try {
        const data = await collectAllData();
        const success = await saveData(data);
        
        if (success) {
            console.log('数据收集和保存成功完成');
            process.exit(0);
        } else {
            console.error('数据保存失败');
            process.exit(1);
        }
        
    } catch (error) {
        console.error('执行失败:', error);
        process.exit(1);
    }
}

// 如果直接运行此文件，则执行主函数
if (require.main === module) {
    main();
}

// 导出函数以便在其他模块中使用
module.exports = {
    collectAllData,
    collectAccountData,
    saveData
};
