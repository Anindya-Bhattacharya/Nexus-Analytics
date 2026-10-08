// Active Power BI Live Embed URL
export const LIVE_POWERBI_EMBED_URL = 'https://app.powerbi.com/view?r=eyJrIjoiYmUxZjBkYWMtZjA5Yi00OTI1LTkzM2EtNjA1MmExNDlhY2NlIiwidCI6IjYzMmZjMmE0LTg5NWUtNGQ2OS1iOWZkLTM1ZWMxZjBhYjU4NiJ9'

export const regions = ['All Regions', 'North', 'South', 'East', 'West']

export const revenueByMonth = {
  'All Regions': [42, 48, 45, 61, 58, 73, 69, 81, 77, 92, 88, 101],
  North: [12, 14, 13, 18, 17, 22, 20, 24, 23, 27, 26, 30],
  South: [10, 11, 12, 15, 14, 18, 17, 20, 19, 23, 22, 25],
  East: [9, 11, 10, 14, 13, 17, 16, 19, 18, 21, 20, 23],
  West: [11, 12, 10, 14, 14, 16, 16, 18, 17, 21, 20, 23],
}

export const months = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

export const kpis = {
  'All Regions': { revenue: '$8.35M', growth: '+18.2%', deals: '412', avgDeal: '$20.3K' },
  North: { revenue: '$2.46M', growth: '+21.4%', deals: '128', avgDeal: '$19.2K' },
  South: { revenue: '$2.06M', growth: '+16.8%', deals: '104', avgDeal: '$19.8K' },
  East: { revenue: '$1.91M', growth: '+14.1%', deals: '96', avgDeal: '$19.9K' },
  West: { revenue: '$1.92M', growth: '+17.3%', deals: '84', avgDeal: '$22.9K' },
}

export const categorySplit = [
  { label: 'Retail Analytics', value: 34, color: 'var(--accent)' },
  { label: 'Ops Dashboards', value: 27, color: 'var(--signal)' },
  { label: 'Finance Reporting', value: 22, color: '#8B6FE8' },
  { label: 'Custom Builds', value: 17, color: '#E88F4A' },
]

export const dashboardCatalog = [
  {
    id: 'sales-pulse',
    node: '01',
    title: 'Sales Pulse',
    summary: 'Real-time revenue, pipeline, and deal velocity across every region.',
    tags: ['Revenue', 'Pipeline', 'Regional'],
  },
  {
    id: 'ops-control',
    node: '02',
    title: 'Ops Control Tower',
    summary: 'Fulfillment, inventory turnover, and SLA tracking in one live view.',
    tags: ['Inventory', 'SLA', 'Logistics'],
  },
  {
    id: 'finance-close',
    node: '03',
    title: 'Finance Close Tracker',
    summary: 'Month-end close status, variance flags, and budget-vs-actual, side by side.',
    tags: ['Budget', 'Variance', 'Close'],
  },
  {
    id: 'customer-health',
    node: '04',
    title: 'Customer Health Score',
    summary: 'Churn risk, NPS trend, and account activity rolled into one score per client.',
    tags: ['Retention', 'NPS', 'Accounts'],
  },
]
