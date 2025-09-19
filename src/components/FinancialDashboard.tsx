import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TrendingUp, TrendingDown, Users, DollarSign, Target, Calendar } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

interface FinancialData {
  currentRunway: number;
  currentBudget: number;
  monthlyBurn: number;
  revenue: number;
  employees: number;
  marketingSpend: number;
  productPrice: number;
}

interface ScenarioResult {
  runway: number;
  budget: number;
  profitLoss: number;
  impact: string;
  budgetLeft: number;
}

const FinancialDashboard = () => {
  const [baseData] = useState<FinancialData>({
    currentRunway: 12,
    currentBudget: 500000,
    monthlyBurn: 42000,
    revenue: 25000,
    employees: 8,
    marketingSpend: 15000,
    productPrice: 99
  });

  const [scenario, setScenario] = useState({
    additionalEmployees: 0,
    marketingAdjustment: 0,
    priceAdjustment: 0
  });

  const [result, setResult] = useState<ScenarioResult>({
    runway: 12,
    budget: 500000,
    profitLoss: 0,
    impact: "Current state - maintaining runway",
    budgetLeft: 485000
  });

  const calculateScenario = () => {
    const employeeCost = 8000; // Average cost per employee per month
    const newEmployeeCost = scenario.additionalEmployees * employeeCost;
    const newMarketingSpend = baseData.marketingSpend + scenario.marketingAdjustment;
    
    // Price adjustment affects revenue
    const priceMultiplier = 1 + (scenario.priceAdjustment / 100);
    const newRevenue = baseData.revenue * priceMultiplier;
    
    const newMonthlyBurn = baseData.monthlyBurn + newEmployeeCost + scenario.marketingAdjustment;
    const netMonthlyFlow = newRevenue - newMonthlyBurn;
    const newRunway = baseData.currentBudget / newMonthlyBurn;
    const profitLoss = netMonthlyFlow;
    
    // Calculate budget left for other expenses
    const budgetLeft = baseData.currentBudget - (newMarketingSpend + (scenario.additionalEmployees * employeeCost * 6)); // 6 months ahead
    
    let impact = "";
    if (scenario.additionalEmployees > 0) {
      impact += `With ${scenario.additionalEmployees} more engineers, runway ${newRunway < baseData.currentRunway ? 'reduces' : 'increases'} to ${Math.round(newRunway)} months. `;
    }
    if (scenario.marketingAdjustment !== 0) {
      const sign = scenario.marketingAdjustment > 0 ? '+' : '';
      impact += `With ${sign}₹${scenario.marketingAdjustment.toLocaleString()} marketing, you have ₹${budgetLeft.toLocaleString()} left for other expenses. `;
    }
    if (scenario.priceAdjustment !== 0) {
      const sign = scenario.priceAdjustment > 0 ? '+' : '';
      impact += `${sign}${scenario.priceAdjustment}% price change affects monthly revenue by ₹${(newRevenue - baseData.revenue).toLocaleString()}.`;
    }
    
    if (!impact) {
      impact = "Current state - maintaining runway and budget allocation";
    }

    setResult({
      runway: newRunway,
      budget: baseData.currentBudget,
      profitLoss,
      impact,
      budgetLeft
    });
  };

  useEffect(() => {
    calculateScenario();
  }, [scenario]);

  const chartData = [
    {
      name: 'Current',
      runway: baseData.currentRunway,
      budget: baseData.currentBudget / 1000,
      employees: baseData.employees
    },
    {
      name: 'Scenario',
      runway: result.runway,
      budget: result.budgetLeft / 1000,
      employees: baseData.employees + scenario.additionalEmployees
    }
  ];

  const pieData = [
    { name: 'Available Budget', value: result.budgetLeft, color: 'hsl(var(--success))' },
    { name: 'Marketing Spend', value: baseData.marketingSpend + scenario.marketingAdjustment, color: 'hsl(var(--primary))' },
    { name: 'Employee Costs', value: (baseData.employees + scenario.additionalEmployees) * 8000 * 6, color: 'hsl(var(--warning))' }
  ];

  return (
    <div className="min-h-screen bg-gradient-hero p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            CFO Helper
          </h1>
          <p className="text-muted-foreground text-lg">
            Financial scenario planning with real-time impact analysis
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-card border-border shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Runway</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{Math.round(result.runway)} months</div>
              <p className="text-xs text-muted-foreground">
                {result.runway > baseData.currentRunway ? '+' : ''}{(result.runway - baseData.currentRunway).toFixed(1)} from baseline
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Budget</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">₹{(result.budgetLeft / 1000).toFixed(0)}K</div>
              <p className="text-xs text-muted-foreground">
                {result.budgetLeft < baseData.currentBudget ? 'Allocated' : 'Available'} for growth
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly P&L</CardTitle>
              {result.profitLoss >= 0 ? 
                <TrendingUp className="h-4 w-4 text-success" /> : 
                <TrendingDown className="h-4 w-4 text-destructive" />
              }
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${result.profitLoss >= 0 ? 'text-success' : 'text-destructive'}`}>
                {result.profitLoss >= 0 ? '+' : ''}₹{result.profitLoss.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {result.profitLoss >= 0 ? 'Profitable' : 'Burning'} monthly
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Size</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {baseData.employees + scenario.additionalEmployees}
              </div>
              <p className="text-xs text-muted-foreground">
                {scenario.additionalEmployees > 0 ? `+${scenario.additionalEmployees} new hires` : 'Current team'}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Controls */}
          <Card className="bg-gradient-card border-border shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Scenario Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="employees">Additional Engineers</Label>
                <div className="flex items-center space-x-4">
                  <Slider
                    id="employees"
                    min={0}
                    max={10}
                    step={1}
                    value={[scenario.additionalEmployees]}
                    onValueChange={(value) => setScenario(prev => ({ ...prev, additionalEmployees: value[0] }))}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    value={scenario.additionalEmployees}
                    onChange={(e) => setScenario(prev => ({ ...prev, additionalEmployees: parseInt(e.target.value) || 0 }))}
                    className="w-16 bg-muted border-border"
                    min="0"
                    max="10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="marketing">Marketing Spend Adjustment (₹)</Label>
                <div className="flex items-center space-x-4">
                  <Slider
                    id="marketing"
                    min={-15000}
                    max={50000}
                    step={1000}
                    value={[scenario.marketingAdjustment]}
                    onValueChange={(value) => setScenario(prev => ({ ...prev, marketingAdjustment: value[0] }))}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    value={scenario.marketingAdjustment}
                    onChange={(e) => setScenario(prev => ({ ...prev, marketingAdjustment: parseInt(e.target.value) || 0 }))}
                    className="w-24 bg-muted border-border"
                    step="1000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Product Price Adjustment (%)</Label>
                <div className="flex items-center space-x-4">
                  <Slider
                    id="price"
                    min={-50}
                    max={100}
                    step={5}
                    value={[scenario.priceAdjustment]}
                    onValueChange={(value) => setScenario(prev => ({ ...prev, priceAdjustment: value[0] }))}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    value={scenario.priceAdjustment}
                    onChange={(e) => setScenario(prev => ({ ...prev, priceAdjustment: parseInt(e.target.value) || 0 }))}
                    className="w-16 bg-muted border-border"
                    step="5"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Budget Allocation Chart */}
          <Card className="bg-gradient-card border-border shadow-card">
            <CardHeader>
              <CardTitle>Budget Allocation</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Impact Summary */}
        <Card className="bg-gradient-card border-border shadow-card">
          <CardHeader>
            <CardTitle>Scenario Impact</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-foreground financial-transition">
              {result.impact}
            </p>
          </CardContent>
        </Card>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-gradient-card border-border shadow-card">
            <CardHeader>
              <CardTitle>Runway Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Bar dataKey="runway" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border shadow-card">
            <CardHeader>
              <CardTitle>Financial Projection</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Line type="monotone" dataKey="budget" stroke="hsl(var(--success))" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FinancialDashboard;