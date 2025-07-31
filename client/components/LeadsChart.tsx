import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

/*
 * Note: Os warnings sobre defaultProps que aparecem no console são da biblioteca Recharts,
 * não do nosso código. Estes warnings não afetam a funcionalidade e serão resolvidos
 * quando a biblioteca Recharts for atualizada para usar parâmetros padrão JavaScript
 * ao invés de defaultProps.
 */

interface ChartData {
  day: number;
  date: string;
  total_leads: number;
  lojistas: number;
  consumidores: number;
}

export default function LeadsChart() {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchChartData();
  }, []);

  const fetchChartData = async () => {
    try {
      const response = await fetch("/api/leads/chart");
      if (response.ok) {
        const data = await response.json();
        setChartData(data);
      } else {
        setError("Erro ao carregar dados do gráfico");
      }
    } catch (err) {
      console.error("Error fetching chart data:", err);
      setError("Erro ao conectar com o servidor");
    } finally {
      setLoading(false);
    }
  };

  const getCurrentMonthName = () => {
    const monthNames = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];
    return monthNames[new Date().getMonth()];
  };

  const getCurrentYear = () => {
    return new Date().getFullYear();
  };

  const getTotalLeadsThisMonth = () => {
    return chartData.reduce((total, day) => total + day.total_leads, 0);
  };

  const getAverageLeadsPerDay = () => {
    const total = getTotalLeadsThisMonth();
    const daysWithLeads = chartData.filter(day => day.total_leads > 0).length;
    return daysWithLeads > 0 ? (total / daysWithLeads).toFixed(1) : "0";
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4 w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center text-red-600">
          <p>{error}</p>
          <button
            onClick={fetchChartData}
            className="mt-2 text-sm text-red-500 hover:text-red-700 underline"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Leads por Dia - {getCurrentMonthName()} {getCurrentYear()}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Evolução diária dos leads capturados no mês atual
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">
            {getTotalLeadsThisMonth()}
          </div>
          <div className="text-sm text-gray-600">
            Total no mês
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Média: {getAverageLeadsPerDay()}/dia
          </div>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 12 }}
              axisLine={{ stroke: "#e5e7eb" }}
              tickLine={{ stroke: "#e5e7eb" }}
              type="number"
              domain={[1, 31]}
              allowDecimals={false}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              axisLine={{ stroke: "#e5e7eb" }}
              tickLine={{ stroke: "#e5e7eb" }}
              type="number"
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
              labelFormatter={(value) => `Dia ${value}`}
              formatter={(value, name) => {
                const displayName = name === "total_leads" ? "Total" :
                                 name === "lojistas" ? "Lojistas" : "Consumidores";
                return [value, displayName];
              }}
            />
            <Legend 
              wrapperStyle={{ paddingTop: "20px" }}
              formatter={(value) => {
                const displayName = value === "total_leads" ? "Total de Leads" :
                                 value === "lojistas" ? "Lojistas" : "Consumidores";
                return displayName;
              }}
            />
            <Line
              type="monotone"
              dataKey="total_leads"
              stroke="#dc2626"
              strokeWidth={3}
              dot={{ fill: "#dc2626", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: "#dc2626", strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="lojistas"
              stroke="#2563eb"
              strokeWidth={2}
              dot={{ fill: "#2563eb", strokeWidth: 2, r: 3 }}
              activeDot={{ r: 5, stroke: "#2563eb", strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="consumidores"
              stroke="#16a34a"
              strokeWidth={2}
              dot={{ fill: "#16a34a", strokeWidth: 2, r: 3 }}
              activeDot={{ r: 5, stroke: "#16a34a", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        <div className="bg-red-50 rounded-lg p-3">
          <div className="text-lg font-bold text-red-600">
            {chartData.reduce((sum, day) => sum + day.total_leads, 0)}
          </div>
          <div className="text-xs text-red-700">Total</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="text-lg font-bold text-blue-600">
            {chartData.reduce((sum, day) => sum + day.lojistas, 0)}
          </div>
          <div className="text-xs text-blue-700">Lojistas</div>
        </div>
        <div className="bg-green-50 rounded-lg p-3">
          <div className="text-lg font-bold text-green-600">
            {chartData.reduce((sum, day) => sum + day.consumidores, 0)}
          </div>
          <div className="text-xs text-green-700">Consumidores</div>
        </div>
      </div>
    </div>
  );
}
