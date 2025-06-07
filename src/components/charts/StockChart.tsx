"use client";

import { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TooltipItem,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import {
  calculateRemainingDays,
  calculateShortfallBags,
} from "@/lib/stock-utils";
import type { Stock } from "@/types/supabase";

// Chart.js設定
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface StockChartProps {
  stocks: Stock[];
  type: "remaining_days" | "shortfall_bags" | "both";
}

export function StockChart({ stocks, type = "both" }: StockChartProps) {
  const chartData = useMemo(() => {
    const labels = stocks.map((stock) => stock.name);

    const remainingDaysData = stocks.map(
      (stock) =>
        calculateRemainingDays(
          stock.total_weight_g,
          stock.daily_usage_g,
          stock.stock_count_bag
        ) || 0
    );

    const shortfallData = stocks.map((stock) =>
      calculateShortfallBags(
        stock.total_weight_g,
        stock.daily_usage_g,
        stock.stock_count_bag
      )
    );

    const datasets = [];

    if (type === "remaining_days" || type === "both") {
      datasets.push({
        label: "残日数",
        data: remainingDaysData,
        backgroundColor: "rgba(0, 245, 255, 0.6)", // neon-primary
        borderColor: "rgba(0, 245, 255, 1)",
        borderWidth: 2,
        yAxisID: "y",
      });
    }

    if (type === "shortfall_bags" || type === "both") {
      datasets.push({
        label: "不足袋数",
        data: shortfallData,
        backgroundColor: "rgba(255, 0, 224, 0.6)", // neon-accent
        borderColor: "rgba(255, 0, 224, 1)",
        borderWidth: 2,
        yAxisID: type === "both" ? "y1" : "y",
      });
    }

    return {
      labels,
      datasets,
    };
  }, [stocks, type]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: "#ffffff",
          font: {
            family: "Inter",
            size: 12,
          },
        },
      },
      title: {
        display: true,
        text:
          type === "remaining_days"
            ? "在庫残日数"
            : type === "shortfall_bags"
            ? "不足袋数"
            : "在庫状況一覧",
        color: "#00f5ff",
        font: {
          family: "Orbitron",
          size: 16,
          weight: "bold" as const,
        },
      },
      tooltip: {
        backgroundColor: "rgba(24, 24, 36, 0.95)",
        titleColor: "#00f5ff",
        bodyColor: "#ffffff",
        borderColor: "#2a2a3e",
        borderWidth: 1,
        callbacks: {
          label: function (context: TooltipItem<"bar">) {
            const datasetLabel = context.dataset.label || "";
            const value = context.parsed.y;

            if (datasetLabel === "残日数") {
              return `${datasetLabel}: ${value}日`;
            } else if (datasetLabel === "不足袋数") {
              return `${datasetLabel}: ${value}袋`;
            }
            return `${datasetLabel}: ${value}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: "rgba(42, 42, 62, 0.3)",
        },
        ticks: {
          color: "#a0a0a0",
          font: {
            family: "Inter",
            size: 11,
          },
          maxRotation: 45,
        },
      },
      y: {
        type: "linear" as const,
        display: true,
        position: "left" as const,
        grid: {
          color: "rgba(42, 42, 62, 0.3)",
        },
        ticks: {
          color: "#a0a0a0",
          font: {
            family: "Inter",
            size: 11,
          },
          callback: function (value: number | string) {
            if (type === "remaining_days") {
              return `${value}日`;
            } else if (type === "shortfall_bags") {
              return `${value}袋`;
            }
            return `${value}日`;
          },
        },
      },
      ...(type === "both" && {
        y1: {
          type: "linear" as const,
          display: true,
          position: "right" as const,
          grid: {
            drawOnChartArea: false,
          },
          ticks: {
            color: "#a0a0a0",
            font: {
              family: "Inter",
              size: 11,
            },
            callback: function (value: number | string) {
              return `${value}袋`;
            },
          },
        },
      }),
    },
  };

  if (stocks.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-400">
        <div className="text-center">
          <p>表示する在庫データがありません</p>
          <p className="text-sm mt-2">在庫を追加するとグラフが表示されます</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-64 md:h-80">
      <Bar data={chartData} options={options} />
    </div>
  );
}
