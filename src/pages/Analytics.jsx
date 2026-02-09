import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Users, Target, Zap } from "lucide-react";
import PredictionCard from "../components/PredictionCard";

export default function Analytics() {
  const [selectedFilter, setSelectedFilter] = useState("all");

  const { data: predictions = [] } = useQuery({
    queryKey: ["predictions"],
    queryFn: () => base44.entities.LeadPrediction.list(),
  });

  const { data: leads = [] } = useQuery({
    queryKey: ["leads"],
    queryFn: () => base44.entities.Lead.list(),
  });

  // Calculate stats
  const stats = {
    totalLeads: predictions.length,
    highConversion: predictions.filter((p) => p.conversion_likelihood > 70).length,
    upsellOpportunities: predictions.filter((p) => p.upsell_opportunity).length,
    averageConversionLikelihood:
      predictions.length > 0
        ? Math.round(
            predictions.reduce((sum, p) => sum + p.conversion_likelihood, 0) /
              predictions.length
          )
        : 0,
  };

  // Prepare data for confidence distribution
  const confidenceData = [
    {
      name: "High",
      value: predictions.filter((p) => p.conversion_confidence === "high").length,
      color: "#10b981",
    },
    {
      name: "Medium",
      value: predictions.filter((p) => p.conversion_confidence === "medium").length,
      color: "#f59e0b",
    },
    {
      name: "Low",
      value: predictions.filter((p) => p.conversion_confidence === "low").length,
      color: "#ef4444",
    },
  ];

  // Prepare conversion likelihood histogram
  const likelihoodRanges = [
    { range: "0-20%", count: predictions.filter((p) => p.conversion_likelihood < 20).length },
    { range: "20-40%", count: predictions.filter((p) => p.conversion_likelihood >= 20 && p.conversion_likelihood < 40).length },
    { range: "40-60%", count: predictions.filter((p) => p.conversion_likelihood >= 40 && p.conversion_likelihood < 60).length },
    { range: "60-80%", count: predictions.filter((p) => p.conversion_likelihood >= 60 && p.conversion_likelihood < 80).length },
    { range: "80-100%", count: predictions.filter((p) => p.conversion_likelihood >= 80).length },
  ];

  // Filter predictions
  const filteredPredictions = () => {
    switch (selectedFilter) {
      case "high-conversion":
        return predictions.filter((p) => p.conversion_likelihood > 70);
      case "upsell":
        return predictions.filter((p) => p.upsell_opportunity);
      case "at-risk":
        return predictions.filter((p) => p.risk_factors && p.risk_factors.length > 0);
      default:
        return predictions;
    }
  };

  const getLeadData = (leadId) => {
    return leads.find((l) => l.id === leadId);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 dark:from-blue-950 to-purple-50 dark:to-purple-950 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Predictive Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            AI-powered insights on lead conversion probability and upsell opportunities
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Total Analyzed</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.totalLeads}
                </p>
              </div>
              <Users className="text-blue-600 dark:text-blue-400" size={32} />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  High Conversion Potential
                </p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {stats.highConversion}
                </p>
              </div>
              <TrendingUp className="text-green-600 dark:text-green-400" size={32} />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Upsell Opportunities
                </p>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {stats.upsellOpportunities}
                </p>
              </div>
              <Target className="text-purple-600 dark:text-purple-400" size={32} />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Avg Conversion Score
                </p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.averageConversionLikelihood}%
                </p>
              </div>
              <Zap className="text-yellow-500" size={32} />
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6 mb-12">
          {/* Confidence Distribution */}
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-6">
              Prediction Confidence Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={confidenceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {confidenceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Conversion Likelihood Distribution */}
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-6">
              Conversion Likelihood Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={likelihoodRanges}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="range" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "none",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
                <Bar dataKey="count" fill="#0066ff" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3">
            {[
              { id: "all", label: "All Predictions" },
              { id: "high-conversion", label: "High Conversion (>70%)" },
              { id: "upsell", label: "Upsell Opportunities" },
              { id: "at-risk", label: "At Risk" },
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => setSelectedFilter(filter.id)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  selectedFilter === filter.id
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Predictions List */}
        <div className="grid gap-6">
          {filteredPredictions().length > 0 ? (
            filteredPredictions().map((prediction) => (
              <PredictionCard
                key={prediction.id}
                prediction={prediction}
                lead={getLeadData(prediction.lead_id)}
              />
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">
                No predictions found for this filter.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}