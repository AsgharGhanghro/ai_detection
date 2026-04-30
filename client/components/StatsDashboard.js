class StatsDashboard {
    constructor(container, data) {
        this.container = container;
        this.data = data;
    }

    render() {
        this.container.innerHTML = `
            <div class="dashboard-grid">
                ${this.renderStatCards()}
                ${this.renderRecentAnalyses()}
                ${this.renderChart()}
                ${this.renderTrendChart()}
            </div>
        `;

        this.animateDashboard();
    }

    renderStatCards() {
        const total = this.data.total_analyses || 0;
        const ai = this.data.ai_detected || 0;
        const plag = this.data.plagiarism_detected || 0;
        const users = this.data.active_users || 0;

        const stats = [
            {
                icon: 'fa-chart-line',
                label: 'Total Analyses',
                value: total.toLocaleString(),
                change: total > 0 ? 'Active' : 'Start',
                positive: true
            },
            {
                icon: 'fa-robot',
                label: 'AI Detected',
                value: ai.toLocaleString(),
                change: total > 0 ? `${((ai / total) * 100).toFixed(1)}%` : '0%',
                positive: true
            },
            {
                icon: 'fa-copy',
                label: 'Plagiarism Found',
                value: plag.toLocaleString(),
                change: total > 0 ? `${((plag / total) * 100).toFixed(1)}%` : '0%',
                positive: false
            },
            {
                icon: 'fa-users',
                label: 'Active Users',
                value: users.toLocaleString(),
                change: 'Live',
                positive: true
            }
        ];

        return stats.map(stat => `
            <div class="stat-card glass-card">
                <div class="stat-card-header">
                    <div class="stat-icon">
                        <i class="fas ${stat.icon}"></i>
                    </div>
                    <div class="stat-change ${stat.positive ? 'positive' : 'negative'}">
                        <i class="fas fa-${stat.positive ? 'check' : 'info'}-circle"></i>
                        ${stat.change}
                    </div>
                </div>
                <div class="stat-card-body">
                    <div class="stat-value">${stat.value}</div>
                    <div class="stat-label">${stat.label}</div>
                </div>
            </div>
        `).join('');
    }

    renderRecentAnalyses() {
        const recent = this.data.recent_analyses || [];
        
        if (recent.length === 0) {
            return `
                <div class="recent-card glass-card">
                    <div class="recent-header">
                        <h3><i class="fas fa-history"></i> Recent Analyses</h3>
                    </div>
                    <div class="empty-state">
                        <i class="fas fa-inbox"></i>
                        <p>No analyses yet</p>
                        <span>Start by analyzing some text above</span>
                    </div>
                </div>
            `;
        }
        
        return `
            <div class="recent-card glass-card">
                <div class="recent-header">
                    <h3><i class="fas fa-history"></i> Recent Analyses</h3>
                    <span class="badge-live">
                        <i class="fas fa-circle"></i> Live
                    </span>
                </div>
                <div class="recent-list">
                    ${recent.slice(0, 5).map(analysis => `
                        <div class="recent-item">
                            <div class="recent-info">
                                <div class="recent-id">${analysis.id}</div>
                                <div class="recent-mode">${analysis.mode}</div>
                            </div>
                            <div class="recent-score">
                                <div class="score-badge">${analysis.score}%</div>
                            </div>
                            <div class="recent-time">${analysis.time}</div>
                            <div class="recent-status status-${analysis.status}">
                                ${analysis.status}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderChart() {
        const total = this.data.total_analyses || 0;
        const ai = this.data.ai_detected || 0;
        const human = total - ai;
        
        return `
            <div class="chart-card glass-card">
                <div class="chart-header">
                    <h3><i class="fas fa-chart-bar"></i> Content Distribution</h3>
                    <span class="badge-live">
                        <i class="fas fa-circle"></i> Real-time
                    </span>
                </div>
                <div class="chart-container">
                    <canvas id="weekly-chart"></canvas>
                </div>
                <div class="chart-legend">
                    <div class="legend-item">
                        <span class="legend-dot" style="background: linear-gradient(135deg, #6366f1, #8b5cf6);"></span>
                        <span>AI Content: ${ai}</span>
                    </div>
                    <div class="legend-item">
                        <span class="legend-dot" style="background: linear-gradient(135deg, #10b981, #059669);"></span>
                        <span>Human Content: ${human}</span>
                    </div>
                </div>
            </div>
        `;
    }

    renderTrendChart() {
        const total = this.data.total_analyses || 0;
        const ai = this.data.ai_detected || 0;
        const plag = this.data.plagiarism_detected || 0;
        
        const aiRate = total > 0 ? ((ai / total) * 100).toFixed(1) : 0;
        const plagRate = total > 0 ? ((plag / total) * 100).toFixed(1) : 0;
        const cleanRate = total > 0 ? (100 - parseFloat(plagRate)).toFixed(1) : 100;
        
        return `
            <div class="trend-card glass-card">
                <div class="trend-header">
                    <h3><i class="fas fa-chart-area"></i> Analysis Insights</h3>
                    <span class="badge-live">
                        <i class="fas fa-circle"></i> Live
                    </span>
                </div>
                <div class="trend-stats">
                    <div class="trend-stat">
                        <div class="trend-value">${aiRate}%</div>
                        <div class="trend-label">AI Content Rate</div>
                    </div>
                    <div class="trend-stat">
                        <div class="trend-value">${plagRate}%</div>
                        <div class="trend-label">Plagiarism Rate</div>
                    </div>
                    <div class="trend-stat">
                        <div class="trend-value">${cleanRate}%</div>
                        <div class="trend-label">Original Content</div>
                    </div>
                </div>
                <div class="trend-info">
                    ${total === 0 
                        ? '<p class="info-text">Start analyzing text to see trends</p>'
                        : `<p class="info-text">Based on ${total} analysis${total !== 1 ? 'es' : ''}</p>`
                    }
                </div>
            </div>
        `;
    }

    animateDashboard() {
        if (typeof gsap === 'undefined') return;

        gsap.from('.stat-card', {
            opacity: 0,
            y: 30,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power2.out'
        });

        gsap.from('.chart-card, .recent-card, .trend-card', {
            opacity: 0,
            scale: 0.95,
            duration: 0.8,
            delay: 0.4,
            stagger: 0.15,
            ease: 'back.out(1.7)'
        });

        setTimeout(() => {
            this.initializeCharts();
        }, 500);
    }

    initializeCharts() {
        const weeklyCtx = document.getElementById('weekly-chart');
        if (weeklyCtx) {
            this.createBarChart(weeklyCtx);
        }
    }

    createBarChart(canvas) {
        const ctx = canvas.getContext('2d');
        const width = canvas.parentElement.clientWidth;
        const height = 250;
        canvas.width = width;
        canvas.height = height;

        const total = this.data.total_analyses || 0;
        const ai = this.data.ai_detected || 0;
        const human = total - ai;
        
        const maxValue = Math.max(ai, human, 1);
        
        const barWidth = 100;
        const spacing = 80;
        const startX = (width - (barWidth * 2 + spacing)) / 2;

        // AI bar
        const aiHeight = (ai / maxValue) * (height - 100);
        const aiGradient = ctx.createLinearGradient(0, height - aiHeight, 0, height);
        aiGradient.addColorStop(0, '#6366f1');
        aiGradient.addColorStop(1, '#8b5cf6');
        
        ctx.fillStyle = aiGradient;
        ctx.fillRect(startX, height - aiHeight - 60, barWidth, aiHeight);
        
        // Human bar
        const humanHeight = (human / maxValue) * (height - 100);
        const humanGradient = ctx.createLinearGradient(0, height - humanHeight, 0, height);
        humanGradient.addColorStop(0, '#10b981');
        humanGradient.addColorStop(1, '#059669');
        
        ctx.fillStyle = humanGradient;
        ctx.fillRect(startX + barWidth + spacing, height - humanHeight - 60, barWidth, humanHeight);
        
        // Labels
        ctx.fillStyle = '#a0a0b8';
        ctx.font = 'bold 14px Inter';
        ctx.textAlign = 'center';
        
        ctx.fillText('AI Content', startX + barWidth/2, height - 30);
        ctx.fillText('Human Content', startX + barWidth + spacing + barWidth/2, height - 30);
        
        // Values
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px Inter';
        if (aiHeight > 20) {
            ctx.fillText(ai, startX + barWidth/2, height - aiHeight - 70);
        }
        if (humanHeight > 20) {
            ctx.fillText(human, startX + barWidth + spacing + barWidth/2, height - humanHeight - 70);
        }
    }
}

const dashboardStyles = `
<style>
.dashboard-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2rem;
    margin-top: 2rem;
}

.stat-card {
    padding: 1.5rem;
}

.stat-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.stat-icon {
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, var(--primary), var(--secondary));
    border-radius: 12px;
    font-size: 1.5rem;
    box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
}

.stat-change {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.875rem;
    font-weight: 600;
}

.stat-change.positive {
    color: var(--success);
}

.stat-change.negative {
    color: var(--warning);
}

.stat-value {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 0.25rem;
    background: linear-gradient(135deg, var(--primary), var(--secondary));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.stat-label {
    color: var(--text-secondary);
    font-size: 0.875rem;
    font-weight: 500;
}

.chart-card,
.recent-card,
.trend-card {
    grid-column: span 2;
    padding: 1.5rem;
}

.chart-header,
.recent-header,
.trend-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
}

.chart-header h3,
.recent-header h3,
.trend-header h3 {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.25rem;
    font-weight: 700;
}

.badge-live {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: rgba(16, 185, 129, 0.1);
    border: 1px solid var(--success);
    border-radius: 20px;
    color: var(--success);
    font-size: 0.75rem;
    font-weight: 600;
}

.badge-live i {
    animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
}

.empty-state {
    text-align: center;
    padding: 3rem 2rem;
    color: var(--text-secondary);
}

.empty-state i {
    font-size: 4rem;
    opacity: 0.2;
    margin-bottom: 1rem;
}

.empty-state p {
    font-size: 1.125rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: var(--text-primary);
}

.empty-state span {
    font-size: 0.875rem;
}

.chart-container {
    position: relative;
    min-height: 250px;
    margin-top: 1rem;
}

.chart-legend {
    display: flex;
    gap: 2rem;
    margin-top: 1.5rem;
    padding-top: 1rem;
    border-top: 1px solid var(--glass-border);
    justify-content: center;
}

.legend-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: var(--text-secondary);
}

.legend-dot {
    width: 14px;
    height: 14px;
    border-radius: 3px;
}

.trend-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
    margin-bottom: 1.5rem;
}

.trend-stat {
    text-align: center;
    padding: 1.25rem;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid var(--glass-border);
    border-radius: 12px;
}

.trend-value {
    font-size: 2rem;
    font-weight: 700;
    color: var(--primary);
    margin-bottom: 0.5rem;
}

.trend-label {
    font-size: 0.875rem;
    color: var(--text-secondary);
    font-weight: 500;
}

.trend-info {
    text-align: center;
    padding: 1rem;
    background: rgba(99, 102, 241, 0.05);
    border-radius: 8px;
}

.info-text {
    color: var(--text-secondary);
    font-size: 0.875rem;
    margin: 0;
}

.recent-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.recent-item {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid var(--glass-border);
    border-radius: 8px;
    transition: all 0.3s;
}

.recent-item:hover {
    background: rgba(255, 255, 255, 0.05);
    transform: translateX(5px);
}

.recent-id {
    font-weight: 600;
    color: var(--primary);
}

.recent-mode {
    font-size: 0.875rem;
    color: var(--text-secondary);
}

.score-badge {
    display: inline-block;
    padding: 0.35rem 0.85rem;
    background: linear-gradient(135deg, var(--primary), var(--secondary));
    border-radius: 20px;
    font-size: 0.875rem;
    font-weight: 600;
}

.recent-time {
    color: var(--text-secondary);
    font-size: 0.875rem;
}

.recent-status {
    padding: 0.35rem 0.85rem;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
    text-align: center;
}

.status-completed {
    background: rgba(16, 185, 129, 0.2);
    color: var(--success);
}

.status-processing {
    background: rgba(245, 158, 11, 0.2);
    color: var(--warning);
}

@media (max-width: 1024px) {
    .chart-card,
    .recent-card,
    .trend-card {
        grid-column: span 1;
    }
    
    .recent-item {
        grid-template-columns: 1fr;
        text-align: center;
        gap: 0.5rem;
    }
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', dashboardStyles);