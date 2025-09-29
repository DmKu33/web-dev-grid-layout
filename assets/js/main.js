
// financial dashboard

const stockSymbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA'];
const charts = {};

let currentCompany = null;

// new chart configs for different financial data types
const chartConfigs = [
    {
        type: 'line',
        title: 'Stock Price',
        dataType: 'price',
        color: '#00d4aa',
        backgroundColor: 'rgba(0, 212, 170, 0.1)'
    },
    {
        type: 'bar',
        title: 'Trading Volume',
        dataType: 'volume',
        color: '#e74c3c',
        backgroundColor: 'rgba(231, 76, 60, 0.6)'
    },
    {
        type: 'line',
        title: 'Market Cap',
        dataType: 'marketCap',
        color: '#f39c12',
        backgroundColor: 'rgba(243, 156, 18, 0.1)'
    },
    {
        type: 'bar',
        title: 'Revenue Growth',
        dataType: 'revenue',
        color: '#9b59b6',
        backgroundColor: 'rgba(155, 89, 182, 0.6)'
    }
];

document.addEventListener('DOMContentLoaded', function() {
    initializeCharts();
    loadStockData();
    setupEventListeners();
});

function setupEventListeners() {
    const searchBtn = document.getElementById('search-btn');
    const searchInput = document.getElementById('company-search');

    searchBtn.addEventListener('click', searchCompanyData);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchCompanyData();
        }
    });
}

// initialize empty charts
function initializeCharts() {
    chartConfigs.forEach((config, index) => {
        const ctx = document.getElementById(`chart-${index + 1}`).getContext('2d');
        
        charts[`chart-${index + 1}`] = new Chart(ctx, {
            type: config.type,
            data: {
                labels: [],
                datasets: [{
                    label: config.title,
                    data: [],
                    borderColor: config.color,
                    backgroundColor: config.backgroundColor,
                    borderWidth: 2,
                    fill: config.type === 'line',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                aspectRatio: 1.5,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        display: true,
                        grid: {
                            color: '#4a4a4a'
                        },
                        ticks: {
                            color: '#b3b3b3',
                            maxTicksLimit: 5
                        }
                    },
                    y: {
                        display: true,
                        grid: {
                            color: '#4a4a4a'
                        },
                        ticks: {
                            color: '#b3b3b3'
                        }
                    }
                },
                elements: {
                    point: {
                        radius: config.type === 'line' ? 0 : undefined,
                        hoverRadius: 4
                    }
                }
            }
        });
    });
}

async function loadStockData() {
    // preset companies
    stockSymbols.forEach(async (symbol, index) => {
        try {
            const financialData = generateCompanyFinancialData(symbol);
            const chartIndex = index + 1;
            const config = chartConfigs[index];
            
            if (config && charts[`chart-${chartIndex}`]) {
                // updating chart title
                const chartQuarter = document.querySelector(`#chart-${chartIndex}`).closest('.chart-quarter');
                const header = chartQuarter.querySelector('h3');
                header.textContent = `${symbol} - ${config.title}`;
                
                // updating chart with appropriate data
                let chartData;
                switch (config.dataType) {
                    case 'price': chartData = financialData.prices; break;
                    case 'volume': chartData = financialData.volumes; break;
                    case 'marketCap': chartData = financialData.marketCaps; break;
                    case 'revenue': chartData = financialData.revenues; break;
                    default: chartData = financialData.prices;
                }
                
                const chart = charts[`chart-${chartIndex}`];
                chart.data.labels = financialData.dates;
                chart.data.datasets[0].data = chartData;
                chart.update();
                
                updateStockPrice(chartIndex, financialData.currentPrice, financialData.priceChange);
            }
        } catch (error) {
            console.error(`Error loading data for ${symbol}:`, error);
            updateStockPrice(index + 1, 'Error', 0);
        }
    });
}

function generateMockStockData(symbol) {
    const basePrice = {
        'AAPL': 150,
        'GOOGL': 2800,
        'MSFT': 300,
        'TSLA': 800
    }[symbol] || 100;

    const dates = [];
    const prices = [];
    const now = new Date();

    for (let i = 29; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        dates.push(date.toLocaleDateString());
        
        const randomChange = (Math.random() - 0.5) * 0.1;
        const price = basePrice * (1 + randomChange + Math.sin(i * 0.2) * 0.05);
        prices.push(price.toFixed(2));
    }

    const currentPrice = parseFloat(prices[prices.length - 1]);
    const previousPrice = parseFloat(prices[prices.length - 2]);
    const change = currentPrice - previousPrice;

    return {
        dates,
        prices,
        currentPrice,
        change
    };
}

function updateChart(symbol, data) {
    if (charts[symbol]) {
        charts[symbol].data.labels = data.dates;
        charts[symbol].data.datasets[0].data = data.prices;
        charts[symbol].update();
    }
}

function updateStockPrice(chartNumber, price, change) {
    const priceElement = document.getElementById(`price-${chartNumber}`);
    if (priceElement) {
        if (typeof price === 'number') {
            const changeText = change >= 0 ? `+${change.toFixed(2)}` : change.toFixed(2);
            priceElement.innerHTML = `$${price.toFixed(2)} <small>(${changeText})</small>`;
            priceElement.className = `stock-price ${change >= 0 ? '' : 'negative'}`;
        } else {
            priceElement.textContent = price;
        }
    }
}

async function searchCompanyNews() {
    const searchInput = document.getElementById('company-search');
    const newsContainer = document.getElementById('news-container');
    const query = searchInput.value.trim();

    if (!query) return;

    newsContainer.innerHTML = '<div class="loading">searching for news...</div>';
    
    const mockNews = generateMockNews(query);
    displayNews(mockNews);
}

// generated mock news data with Claude
function generateMockNews(company) {
    const newsTemplates = [
        {
            title: `${company} Reports Strong Q4 Earnings`,
            description: `${company} has reported better-than-expected quarterly earnings, beating analyst estimates by 5%. Revenue growth continues to be strong across all segments.`,
            date: '2025-09-24'
        },
        {
            title: `${company} Announces New Strategic Partnership`,
            description: `The company has entered into a strategic partnership that is expected to drive innovation and expand market reach in the coming quarters.`,
            date: '2025-09-23'
        },
        {
            title: `${company} Launches New Product Line`,
            description: `${company} has unveiled its latest product offering, targeting emerging markets and demonstrating continued commitment to innovation.`,
            date: '2025-09-22'
        },
        {
            title: `Analysts Upgrade ${company} Stock Rating`,
            description: `Multiple analysts have upgraded their rating for ${company} stock, citing strong fundamentals and positive market outlook.`,
            date: '2025-09-21'
        },
        {
            title: `${company} CEO Discusses Future Growth Strategy`,
            description: `In a recent interview, the CEO outlined ambitious growth plans and strategic initiatives for the next fiscal year.`,
            date: '2025-09-20'
        }
    ];

    return newsTemplates;
}

// display news articles
function displayNews(articles) {
    const newsContainer = document.getElementById('news-container');
    
    const newsHTML = articles.map(article => `
        <div class="news-item">
            <h4>${article.title}</h4>
            <p>${article.description}</p>
            <div class="news-date">${new Date(article.date).toLocaleDateString()}</div>
        </div>
    `).join('');

    newsContainer.innerHTML = newsHTML;
}

// auto-refresh stock data every 5 minutes
setInterval(loadStockData, 5 * 60 * 1000);

console.log('financial dashboard started');