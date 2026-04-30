// Model Card Component - Display model information and metrics
class ModelCard {
    constructor(container, modelData) {
        this.container = container;
        this.modelData = modelData || this.getDefaultModelData();
        this.radarChart = null;
    }

    getDefaultModelData() {
        return {
            name: 'TextGuard AI Model v2.5',
            type: 'Hybrid Transformer-LSTM',
            accuracy: 99.2,
            precision: 98.7,
            recall: 99.5,
            f1Score: 99.1,
            trainingData: '1.2M samples',
            lastUpdated: '2024-12-01',
            features: [
                'Semantic Analysis',
                'Pattern Recognition',
                'Context Understanding',
                'Multi-language Support'
            ],
            performance: {
                avgProcessingTime: '1.8s',
                throughput: '500 requests/min',
                uptime: '99.9%'
            }
        };
    }

    render() {
        if (typeof this.container === 'string') {
            this.container = document.getElementById(this.container);
        }

        if (!this.container) return;

        this.container.innerHTML = `
            <div class="model-card glass-card">
                <div class="model-header">
                    <div class="model-icon">
                        <i class="fas fa-brain"></i>
                    </div>
                    <div class="model-info">
                        <h3 class="model-name">${this.modelData.name}</h3>
                        <p class="model-type">${this.modelData.type}</p>
                    </div>
                    <div class="model-badge">
                        <span class="badge-active">Active</span>
                    </div>
                </div>

                <div class="model-metrics">
                    <div class="metric-row">
                        ${this.renderMetric('Accuracy', this.modelData.accuracy, '%')}
                        ${this.renderMetric('Precision', this.modelData.precision, '%')}
                    </div>
                    <div class="metric-row">
                        ${this.renderMetric('Recall', this.modelData.recall, '%')}
                        ${this.renderMetric('F1 Score', this.modelData.f1Score, '%')}
                    </div>
                </div>

                <div class="model-details">
                    <div class="detail-item">
                        <i class="fas fa-database"></i>
                        <span>Training Data: ${this.modelData.trainingData}</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-clock"></i>
                        <span>Last Updated: ${this.modelData.lastUpdated}</span>
                    </div>
                </div>

                <div class="model-features">
                    <h4><i class="fas fa-star"></i> Key Features</h4>
                    <div class="features-grid">
                        ${this.modelData.features.map(feature => `
                            <div class="feature-chip">
                                <i class="fas fa-check"></i>
                                ${feature}
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="model-performance">
                    <h4><i class="fas fa-chart-line"></i> Performance Metrics</h4>
                    <div class="performance-grid">
                        <div class="perf-item">
                            <div class="perf-label">Avg Processing Time</div>
                            <div class="perf-value">${this.modelData.performance.avgProcessingTime}</div>
                        </div>
                        <div class="perf-item">
                            <div class="perf-label">Throughput</div>
                            <div class="perf-value">${this.modelData.performance.throughput}</div>
                        </div>
                        <div class="perf-item">
                            <div class="perf-label">Uptime</div>
                            <div class="perf-value">${this.modelData.performance.uptime}</div>
                        </div>
                    </div>
                </div>

                <!-- Radar Chart Container -->
                <div class="radar-chart-container">
                    <canvas id="model-radar-chart"></canvas>
                </div>

                <div class="model-actions">
                    <button class="btn btn-primary" onclick="viewModelDetails()">
                        <i class="fas fa-eye"></i>
                        View Details
                    </button>
                    <button class="btn btn-secondary" onclick="downloadModelReport()">
                        <i class="fas fa-download"></i>
                        Report
                    </button>
                </div>
            </div>
        `;

        this.animateCard();
        this.renderMetricCharts();
    }

    renderMetric(label, value, suffix = '') {
        return `
            <div class="metric-item">
                <div class="metric-label">${label}</div>
                <div class="metric-bar">
                    <div class="metric-fill" data-value="${value}" style="width: 0%"></div>
                </div>
                <div class="metric-value">${value}${suffix}</div>
            </div>
        `;
    }

    animateCard() {
        // Animate card entrance
        if (typeof gsap !== 'undefined') {
            gsap.from('.model-card', {
                opacity: 0,
                y: 30,
                duration: 0.8,
                ease: 'power2.out'
            });

            // Animate metrics
            gsap.utils.toArray('.metric-fill').forEach((bar, index) => {
                const value = bar.dataset.value;
                gsap.to(bar, {
                    width: `${value}%`,
                    duration: 1.5,
                    delay: 0.5 + index * 0.1,
                    ease: 'power2.out'
                });
            });

            // Animate features
            gsap.from('.feature-chip', {
                opacity: 0,
                scale: 0.8,
                duration: 0.5,
                stagger: 0.1,
                delay: 1,
                ease: 'back.out(1.7)'
            });
        }
    }

    renderMetricCharts() {
        // Add visual representation of metrics
        const metricsData = [
            { label: 'Accuracy', value: this.modelData.accuracy },
            { label: 'Precision', value: this.modelData.precision },
            { label: 'Recall', value: this.modelData.recall },
            { label: 'F1 Score', value: this.modelData.f1Score }
        ];

        this.createRadarChart(metricsData);
    }

    createRadarChart(data) {
        const ctx = document.getElementById('model-radar-chart');
        if (!ctx) return;

        // Destroy previous chart if exists
        if (this.radarChart) {
            this.radarChart.destroy();
        }

        this.radarChart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: data.map(d => d.label),
                datasets: [{
                    label: 'Model Performance',
                    data: data.map(d => d.value),
                    backgroundColor: 'rgba(99, 102, 241, 0.2)',
                    borderColor: '#6366f1',
                    pointBackgroundColor: '#6366f1',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: '#6366f1',
                    borderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        angleLines: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        pointLabels: {
                            color: 'rgba(255, 255, 255, 0.8)',
                            font: {
                                family: "'Inter', sans-serif",
                                size: 12
                            }
                        },
                        ticks: {
                            backdropColor: 'transparent',
                            color: 'rgba(255, 255, 255, 0.5)',
                            font: {
                                size: 10
                            },
                            stepSize: 20
                        },
                        suggestedMin: 80,
                        suggestedMax: 100
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15, 15, 30, 0.9)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: '#6366f1',
                        borderWidth: 1,
                        callbacks: {
                            label: function(context) {
                                return `${context.label}: ${context.raw}%`;
                            }
                        }
                    }
                }
            }
        });
    }
}

// Model Card Styles
const modelCardStyles = `
<style>
.model-card {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
}

.model-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 2rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid var(--glass-border);
}

.model-icon {
    width: 60px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, var(--primary), var(--secondary));
    border-radius: 15px;
    font-size: 2rem;
    color: white;
}

.model-info {
    flex: 1;
}

.model-name {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 0.25rem;
}

.model-type {
    color: var(--text-secondary);
    font-size: 0.875rem;
}

.model-badge .badge-active {
    padding: 0.5rem 1rem;
    background: rgba(16, 185, 129, 0.2);
    border: 1px solid var(--success);
    border-radius: 20px;
    color: var(--success);
    font-size: 0.875rem;
    font-weight: 600;
}

.model-metrics {
    margin-bottom: 2rem;
}

.metric-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
    margin-bottom: 1.5rem;
}

@media (max-width: 768px) {
    .metric-row {
        grid-template-columns: 1fr;
    }
}

.metric-item {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.metric-label {
    color: var(--text-secondary);
    font-size: 0.875rem;
    font-weight: 600;
}

.metric-bar {
    height: 8px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    overflow: hidden;
}

.metric-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--primary), var(--secondary));
    border-radius: 4px;
    transition: width 1.5s ease;
}

.metric-value {
    font-size: 1.5rem;
    font-weight: 700;
    background: linear-gradient(135deg, var(--primary), var(--secondary));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.model-details {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 2rem;
    padding: 1rem;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid var(--glass-border);
    border-radius: 12px;
}

.detail-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    color: var(--text-secondary);
}

.detail-item i {
    color: var(--primary);
}

.model-features,
.model-performance {
    margin-bottom: 2rem;
}

.model-features h4,
.model-performance h4 {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
    font-size: 1.125rem;
}

.features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 0.75rem;
}

.feature-chip {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    background: rgba(99, 102, 241, 0.1);
    border: 1px solid var(--primary);
    border-radius: 8px;
    font-size: 0.875rem;
    color: var(--primary);
    transition: all 0.3s;
}

.feature-chip:hover {
    background: rgba(99, 102, 241, 0.2);
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(99, 102, 241, 0.2);
}

.feature-chip i {
    font-size: 0.75rem;
}

.performance-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
}

.perf-item {
    padding: 1rem;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid var(--glass-border);
    border-radius: 12px;
    text-align: center;
}

.perf-label {
    color: var(--text-secondary);
    font-size: 0.875rem;
    margin-bottom: 0.5rem;
}

.perf-value {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--primary);
}

.radar-chart-container {
    margin: 2rem 0;
    height: 300px;
    position: relative;
}

.radar-chart-container canvas {
    max-width: 100%;
    height: 100% !important;
}

.model-actions {
    display: flex;
    gap: 1rem;
    padding-top: 1.5rem;
    border-top: 1px solid var(--glass-border);
}

.model-actions .btn {
    flex: 1;
}

@media (max-width: 768px) {
    .model-actions {
        flex-direction: column;
    }
}
</style>
`;

// Add styles to document
document.head.insertAdjacentHTML('beforeend', modelCardStyles);

// Helper functions
function viewModelDetails() {
    showNotification('Opening model details...', 'info');
    // Add logic to show detailed model information
}

function downloadModelReport() {
    showNotification('Preparing model report...', 'info');
    // Add logic to generate and download report
}