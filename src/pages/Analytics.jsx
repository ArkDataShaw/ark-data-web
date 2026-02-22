import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Users, Target, Zap, Calendar, Filter } from "lucide-react";

export default function Analytics() {
  const [dateRange, setDateRange] = useState("30");
  const [selectedSource, setSelectedSource] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const { data: leads = [] } = useQuery({
    queryKey: ["leads"],
    queryFn: () => base44.entities.Lead.list(),
  });

  // Calculate date filter
  const getDateThreshold = () => {
    const days = parseInt(dateRange);
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date;
  };

  const filteredLeads = leads.filter((lead) => {
    const leadDate = new Date(lead.created_date);
    const threshold = getDateThreshold();
    return leadDate >= threshold;
  });

  // Apply status and source filters
  const appliedFilters = filteredLeads.filter((lead) => {
    const statusMatch = selectedStatus === "all" || lead.status === selectedStatus;
    const sourceMatch = selectedSource === "all" || lead.utm_source === selectedSource;
    return statusMatch && sourceMatch;
  });

  // Get unique sources for filter
  const uniqueSources = [...new Set(leads.map((l) => l.utm_source).filter(Boolean))];

  // Calculate stats
  const stats = {
    totalLeads: appliedFilters.length,
    convertedLeads: appliedFilters.filter((l) => l.status === "converted").length,
    newLeads: appliedFilters.filter((l) => l.status === "new").length,
    conversionRate: appliedFilters.length > 0 ? Math.round((appliedFilters.filter((l) => l.status === "converted").length / appliedFilters.length) * 100) : 0,
  };

  // Prepare trend data by day
  const trendData = (() => {
    const dayMap = {};
    appliedFilters.forEach((lead) => {
      const date = new Date(lead.created_date).toLocaleDateString();
      dayMap[date] = (dayMap[date] || 0) + 1;
    });
    return Object.entries(dayMap)
      .sort((a, b) => new Date(a[0]) - new Date(b[0]))
      .map(([date, count]) => ({ date, leads: count }));
  })();

  // Prepare data for source distribution
  const sourceData = (() => {
    const sourceMap = {};
    appliedFilters.forEach((lead) => {
      const source = lead.utm_source || "Direct";
      sourceMap[source] = (sourceMap[source] || 0) + 1;
    });
    return Object.entries(sourceMap).map(([name, value]) => ({ name, value }));
  })();

  // Prepare data for status distribution
  const statusData = [
    { name: "New", value: appliedFilters.filter((l) => l.status === "new").length, color: "#3b82f6" },
    { name: "Contacted", value: appliedFilters.filter((l) => l.status === "contacted").length, color: "#8b5cf6" },
    { name: "Qualified", value: appliedFilters.filter((l) => l.status === "qualified").length, color: "#ec4899" },
    { name: "Converted", value: appliedFilters.filter((l) => l.status === "converted").length, color: "#10b981" },
    { name: "Lost", value: appliedFilters.filter((l) => l.status === "lost").length, color: "#ef4444" },
  ].filter((s) => s.value > 0);

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 dark:from-blue-950 to-purple-50 dark:to-purple-950 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Comprehensive insights into visitor identification, lead generation, and conversion performance
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-b border-gray-200 dark:border-gray-800">
        <div className="flex flex-wrap gap-6">
          {/* Date Range */}
          <div className="flex items-center gap-3">
            <Calendar size={20} className="text-gray-600 dark:text-gray-400" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
          </div>

          {/* Source Filter */}
          <div className="flex items-center gap-3">
            <Filter size={20} className="text-gray-600 dark:text-gray-400" />
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            >
              <option value="all">All Sources</option>
              {uniqueSources.map((source) => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-3">
            <Filter size={20} className="text-gray-600 dark:text-gray-400" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="converted">Converted</option>
              <option value="lost">Lost</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Total Leads</p>
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
                  Converted
                </p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {stats.convertedLeads}
                </p>
              </div>
              <TrendingUp className="text-green-600 dark:text-green-400" size={32} />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Conversion Rate
                </p>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {stats.conversionRate}%
                </p>
              </div>
              <Target className="text-purple-600 dark:text-purple-400" size={32} />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  New Leads
                </p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.newLeads}
                </p>
              </div>
              <Zap className="text-yellow-500" size={32} />
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6 mb-12">
          {/* Lead Trend */}
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-6">
              Lead Generation Trend
            </h3>
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "none",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                  />
                  <Line type="monotone" dataKey="leads" stroke="#0066ff" strokeWidth={2} dot={{ fill: "#0066ff" }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-300 flex items-center justify-center text-gray-400">No data available</div>
            )}
          </div>

          {/* Status Distribution */}
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-6">
              Lead Status Distribution
            </h3>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-300 flex items-center justify-center text-gray-400">No data available</div>
            )}
          </div>
        </div>

        {/* Source & Campaign Performance */}
        <div className="grid lg:grid-cols-2 gap-6 mb-12">
          {/* Source Distribution */}
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-6">
              Leads by Source
            </h3>
            {sourceData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={sourceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "none",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                  />
                  <Bar dataKey="value" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-300 flex items-center justify-center text-gray-400">No source data available</div>
            )}
          </div>

          {/* Conversion by Status */}
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-6">
              Key Performance Metrics
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                <span className="text-gray-700 dark:text-gray-300">Avg Conversion Rate</span>
                <span className="font-bold text-gray-900 dark:text-white">{stats.conversionRate}%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                <span className="text-gray-700 dark:text-gray-300">Total Qualified</span>
                <span className="font-bold text-gray-900 dark:text-white">{appliedFilters.filter((l) => l.status === "qualified").length}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                <span className="text-gray-700 dark:text-gray-300">Active Sources</span>
                <span className="font-bold text-gray-900 dark:text-white">{uniqueSources.length}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                <span className="text-gray-700 dark:text-gray-300">Lost Rate</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {appliedFilters.length > 0 ? Math.round((appliedFilters.filter((l) => l.status === "lost").length / appliedFilters.length) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Lead Insights Table */}
        <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-6">
            Recent Leads
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Company</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Source</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Date</th>
                </tr>
              </thead>
              <tbody>
                {appliedFilters.slice(0, 10).map((lead) => (
                  <tr key={lead.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                    <td className="py-3 px-4 text-gray-900 dark:text-white">{lead.name}</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{lead.company || "—"}</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400 text-sm">{lead.utm_source || "Direct"}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        lead.status === "converted" ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200" :
                        lead.status === "new" ? "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200" :
                        lead.status === "qualified" ? "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200" :
                        lead.status === "lost" ? "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200" :
                        "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                      }`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400 text-sm">{new Date(lead.created_date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {appliedFilters.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400">
                  No leads found for the selected filters.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}