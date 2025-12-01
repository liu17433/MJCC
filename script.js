document.addEventListener('DOMContentLoaded', function() {
    const apiUrl = 'https://your-server-api-url.com/api/accounts'; // 替换为您的实际API URL
    let profitLossChart = null;
    
    // 初始化页面
    fetchData();
    setupEventListeners();
    
    // 每30秒自动刷新一次数据
    setInterval(fetchData, 30000);
    
    // 设置事件监听器
    function setupEventListeners() {
        const refreshBtn = document.getElementById('refreshBtn');
        refreshBtn.addEventListener('click', function() {
            fetchData();
        });
    }
    
    // 获取数据
    async function fetchData() {
        try {
            showLoading(true);
            const response = await fetch(apiUrl);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            updateUI(data);
            showSuccess('数据更新成功');
            
        } catch (error) {
            console.error('获取数据失败:', error);
            showError('获取数据失败: ' + error.message);
        } finally {
            showLoading(false);
        }
    }
    
    // 更新UI
    function updateUI(data) {
        // 更新最后更新时间
        const lastUpdated = data.lastUpdated ? new Date(data.lastUpdated).toLocaleString() : '未知';
        document.getElementById('lastUpdate').textContent = `更新时间: ${lastUpdated}`;
        
        // 计算汇总数据
        let totalBalance = 0;
        let totalEquity = 0;
        let totalPositions = 0;
        
        // 更新账户表格
        const tableBody = document.getElementById('accountTableBody');
        tableBody.innerHTML = '';
        
        data.accounts.forEach(account => {
            totalBalance += parseFloat(account.balance) || 0;
            totalEquity += parseFloat(account.equity) || 0;
            totalPositions += parseInt(account.trades) || 0;
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${account.id}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${formatCurrency(account.balance)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${formatCurrency(account.equity)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${formatCurrency(account.margin)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${formatCurrency(account.freeMargin)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm ${account.profit >= 0 ? 'text-green-600' : 'text-red-600'}">
                    ${formatCurrency(account.profit)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${account.trades}</td>
            `;
            tableBody.appendChild(row);
        });
        
        // 更新汇总数据
        document.getElementById('totalBalance').textContent = formatCurrency(totalBalance);
        document.getElementById('totalEquity').textContent = formatCurrency(totalEquity);
        document.getElementById('totalPositions').textContent = totalPositions;
        
        // 更新图表
        updateChart(data);
    }
    
    // 更新图表
    function updateChart(data) {
        const ctx = document.getElementById('profitLossChart').getContext('2d');
        
        // 准备图表数据
        const labels = data.accounts.map(account => account.id);
        const profits = data.accounts.map(account => parseFloat(account.profit) || 0);
        
        // 销毁旧图表
        if (profitLossChart) {
            profitLossChart.destroy();
        }
        
        // 创建新图表
        profitLossChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: '账户盈亏',
                    data: profits,
                    backgroundColor: profits.map(p => p >= 0 ? 'rgba(16, 185, 129, 0.7)' : 'rgba(239, 68, 68, 0.7)'),
                    borderColor: profits.map(p => p >= 0 ? 'rgb(16, 185, 129)' : 'rgb(239, 68, 68)'),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `盈亏: ${formatCurrency(context.raw)}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return formatCurrency(value);
                            }
                        }
                    }
                }
            }
        });
    }
    
    // 显示加载状态
    function showLoading(show) {
        const refreshBtn = document.getElementById('refreshBtn');
        const spinner = refreshBtn.querySelector('.animate-spin');
        
        if (show) {
            refreshBtn.disabled = true;
            refreshBtn.querySelector('span').textContent = '刷新中...';
            spinner.classList.remove('hidden');
        } else {
            refreshBtn.disabled = false;
            refreshBtn.querySelector('span').textContent = '刷新数据';
            spinner.classList.add('hidden');
        }
    }
    
    // 显示成功消息
    function showSuccess(message) {
        showAlert(message, 'success');
    }
    
    // 显示错误消息
    function showError(message) {
        showAlert(message, 'error');
    }
    
    // 显示提示消息
    function showAlert(message, type) {
        const alertContainer = document.getElementById('alertContainer');
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type}`;
        alertDiv.textContent = message;
        
        alertContainer.appendChild(alertDiv);
        
        // 3秒后自动消失
        setTimeout(() => {
            alertDiv.style.opacity = '0';
            setTimeout(() => {
                alertContainer.removeChild(alertDiv);
            }, 300);
        }, 3000);
    }
    
    // 格式化货币
    function formatCurrency(value) {
        return new Intl.NumberFormat('zh-CN', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(value);
    }
});
