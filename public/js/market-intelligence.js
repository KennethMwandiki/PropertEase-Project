/**
 * PropertEase Market Intelligence
 * Vertex AI + BigQuery forecasting for property demand, rental yield, and seasonal occupancy.
 */

class MarketIntelligence {
    constructor() {
        this.cache = new Map();
    }

    async getMarketForecast(location) {
        console.log(`[Market Intelligence] Fetching forecast for: ${location}`);

        if (!location) location = "Generic Region";
        if (this.cache.has(location)) return this.cache.get(location);

        // Simulate Vertex AI Forecasting Model Output
        // In a real app, this would be a call to a Cloud Function wrapping Vertex AI
        const forecast = {
            location,
            demandScore: 8.5, // out of 10
            projectedYield: '5.2%',
            seasonalOccupancy: [0.85, 0.92, 0.78, 0.88], // Q1-Q4
            marketSentiment: 'High Growth',
            lastUpdated: new Date().toLocaleDateString(),
            insights: [
                "New tech hub development nearby increasing rental demand.",
                "Limited supply in the local residential market.",
                "High seasonal influx during holiday months."
            ]
        };

        this.cache.set(location, forecast);
        return forecast;
    }

    generateForecastChart(canvasId, data) {
        // Simple SVG-based demand chart simulation
        const container = document.getElementById(canvasId);
        if (!container) return;

        const width = container.clientWidth || 300;
        const height = 150;
        const padding = 20;

        const maxVal = Math.max(...data, 1);
        const points = data.map((val, i) => {
            const x = padding + (i * (width - 2 * padding) / (data.length - 1));
            const y = height - padding - ((val / maxVal) * (height - 2 * padding));
            return `${x},${y}`;
        }).join(' ');

        container.innerHTML = `
            <svg width="100%" height="${height}" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" style="background: hsla(var(--primary), 0.05); border-radius: 8px;">
                <polyline points="${points}" fill="none" stroke="hsl(var(--primary))" stroke-width="3" />
                ${data.map((val, i) => {
            const x = padding + (i * (width - 2 * padding) / (data.length - 1));
            const y = height - padding - ((val / maxVal) * (height - 2 * padding));
            return `<circle cx="${x}" cy="${y}" r="4" fill="hsl(var(--primary))" />`;
        }).join('')}
                <text x="${padding}" y="${height - 5}" font-size="10" fill="hsl(var(--muted))">Q1</text>
                <text x="${width / 2}" y="${height - 5}" font-size="10" fill="hsl(var(--muted))" text-anchor="middle">Demand Trend</text>
                <text x="${width - padding}" y="${height - 5}" font-size="10" fill="hsl(var(--muted))" text-anchor="end">Q4</text>
            </svg>
        `;
    }
}

window.marketIntelligence = new MarketIntelligence();
