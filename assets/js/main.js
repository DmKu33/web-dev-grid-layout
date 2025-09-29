// Had Claude help debug and come up with some extra charts

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

    searchBtn.addEventListener('click', searchCompanyNews);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchCompanyNews();
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

function generateCompanyFinancialData(companyName) {
    const symbol = companyName.toUpperCase();
    
    // base values for different companies
    const companyData = {
        'APPLE': { basePrice: 175, marketCap: 2800, baseVolume: 50000000 },
        'MICROSOFT': { basePrice: 380, marketCap: 2500, baseVolume: 25000000 },
        'TESLA': { basePrice: 250, marketCap: 800, baseVolume: 80000000 },
        'GOOGLE': { basePrice: 140, marketCap: 1700, baseVolume: 30000000 },
        'AMAZON': { basePrice: 145, marketCap: 1500, baseVolume: 35000000 },
        'META': { basePrice: 320, marketCap: 800, baseVolume: 20000000 },
        'NVIDIA': { basePrice: 450, marketCap: 1100, baseVolume: 45000000 }
    };
    
    // default values for unknown companies
    const data = companyData[symbol] || { 
        basePrice: 100 + Math.random() * 200, 
        marketCap: 500 + Math.random() * 1000, 
        baseVolume: 10000000 + Math.random() * 40000000 
    };

    const dates = [];
    const prices = [];
    const volumes = [];
    const marketCaps = [];
    const revenues = [];
    const now = new Date();

    for (let i = 29; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        dates.push(date.toLocaleDateString());
        
        // Stock Price (with trend and volatility)
        const priceVolatility = (Math.random() - 0.5) * 0.08;
        const priceTrend = Math.sin(i * 0.1) * 0.03;
        const price = data.basePrice * (1 + priceVolatility + priceTrend);
        prices.push(parseFloat(price.toFixed(2)));
        
        // Trading Volume (inverse correlation with price sometimes)
        const volumeVariation = (Math.random() - 0.5) * 0.4;
        const volume = data.baseVolume * (1 + volumeVariation);
        volumes.push(Math.floor(volume));
        
        // Market Cap (generally follows stock price)
        const marketCapVariation = (Math.random() - 0.5) * 0.06;
        const marketCap = data.marketCap * (1 + marketCapVariation + priceTrend * 0.5);
        marketCaps.push(parseFloat(marketCap.toFixed(1)));
        
        // Revenue Growth (quarterly-like pattern)
        const revenueBase = 50 + Math.random() * 100;
        const seasonality = Math.sin((i / 30) * 2 * Math.PI) * 10;
        const growth = revenueBase + seasonality + (Math.random() - 0.5) * 15;
        revenues.push(parseFloat(Math.max(growth, 5).toFixed(1)));
    }

    const currentPrice = prices[prices.length - 1];
    const previousPrice = prices[prices.length - 2];
    const priceChange = currentPrice - previousPrice;
    const priceChangePercent = (priceChange / previousPrice) * 100;

    return {
        symbol,
        dates,
        prices,
        volumes,
        marketCaps,
        revenues,
        currentPrice,
        previousPrice,
        priceChange,
        priceChangePercent
    };
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

    currentCompany = query.toUpperCase();
    
    // updating news
    newsContainer.innerHTML = '<div class="loading">searching for news...</div>';
    const mockNews = generateMockNews(query);
    displayNews(mockNews);
    
    // generating financial data for the company
    const financialData = generateCompanyFinancialData(query);
    
    // updating all charts with different data types
    updateAllChartsForCompany(financialData);
}

// updating all 4 charts with different financial data for the searched company
function updateAllChartsForCompany(data) {
    chartConfigs.forEach((config, index) => {
        const chartIndex = index + 1;
        const chartKey = `chart-${chartIndex}`;
        const chart = charts[chartKey];
        
        if (!chart) return;
        
        const chartQuarter = document.querySelector(`#chart-${chartIndex}`).closest('.chart-quarter');
        const header = chartQuarter.querySelector('h3');
        const priceElement = chartQuarter.querySelector('.stock-price');
        
        header.textContent = `${data.symbol} - ${config.title}`;
        
        let chartData, priceDisplay, priceClass = 'stock-price';
        
        switch (config.dataType) {
            case 'price':
                chartData = data.prices;
                const changeText = data.priceChange >= 0 ? `+${data.priceChange.toFixed(2)}` : data.priceChange.toFixed(2);
                const changePercent = data.priceChangePercent >= 0 ? `+${data.priceChangePercent.toFixed(1)}%` : `${data.priceChangePercent.toFixed(1)}%`;
                priceDisplay = `$${data.currentPrice.toFixed(2)} <small>(${changeText} | ${changePercent})</small>`;
                priceClass = `stock-price ${data.priceChange >= 0 ? '' : 'negative'}`;
                break;
                
            case 'volume':
                chartData = data.volumes;
                const avgVolume = data.volumes.reduce((a, b) => a + b, 0) / data.volumes.length;
                const latestVolume = data.volumes[data.volumes.length - 1];
                priceDisplay = `${(latestVolume / 1000000).toFixed(1)}M <small>Avg: ${(avgVolume / 1000000).toFixed(1)}M</small>`;
                break;
                
            case 'marketCap':
                chartData = data.marketCaps;
                const currentMarketCap = data.marketCaps[data.marketCaps.length - 1];
                const prevMarketCap = data.marketCaps[data.marketCaps.length - 2];
                const marketCapChange = currentMarketCap - prevMarketCap;
                const marketCapChangeText = marketCapChange >= 0 ? `+${marketCapChange.toFixed(1)}B` : `${marketCapChange.toFixed(1)}B`;
                priceDisplay = `${currentMarketCap.toFixed(1)}B <small>(${marketCapChangeText})</small>`;
                priceClass = `stock-price ${marketCapChange >= 0 ? '' : 'negative'}`;
                break;
                
            case 'revenue':
                chartData = data.revenues;
                const currentRevenue = data.revenues[data.revenues.length - 1];
                const avgRevenue = data.revenues.reduce((a, b) => a + b, 0) / data.revenues.length;
                const revenueGrowth = ((currentRevenue - avgRevenue) / avgRevenue * 100);
                const growthText = revenueGrowth >= 0 ? `+${revenueGrowth.toFixed(1)}%` : `${revenueGrowth.toFixed(1)}%`;
                priceDisplay = `${currentRevenue.toFixed(1)}B <small>(${growthText})</small>`;
                priceClass = `stock-price ${revenueGrowth >= 0 ? '' : 'negative'}`;
                break;
                
            default:
                chartData = data.prices;
                priceDisplay = 'Loading...';
        }
        
        priceElement.innerHTML = priceDisplay;
        priceElement.className = priceClass;
        
        chart.data.labels = data.dates;
        chart.data.datasets[0].data = chartData;
        chart.data.datasets[0].label = `${data.symbol} ${config.title}`;
        
        chart.data.datasets[0].borderColor = config.color;
        chart.data.datasets[0].backgroundColor = config.backgroundColor;
        
        chart.update();
    });
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
            <h4><a href="${article.url}" target="_blank" rel="noopener noreferrer">${article.title}</a></h4>
            <p>${article.description}</p>
            <div class="news-date">
                ${new Date(article.publishedAt || article.date).toLocaleDateString()} 
                ${article.source ? `• ${article.source}` : ''}
            </div>
        </div>
    `).join('');

    newsContainer.innerHTML = newsHTML;
}

// auto-refresh stock data every 5 minutes
setInterval(loadStockData, 5 * 60 * 1000);

console.log('financial dashboard started');
