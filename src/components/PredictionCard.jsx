import React from "react";
import { TrendingUp, AlertCircle, Star, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function PredictionCard({ prediction, lead }) {
  const getConfidenceColor = (confidence) => {
    switch (confidence) {
      case "high":
        return "bg-green-100 dark:bg-green-950 text-green-800 dark:text-green-300";
      case "medium":
        return "bg-yellow-100 dark:bg-yellow-950 text-yellow-800 dark:text-yellow-300";
      case "low":
        return "bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300";
      default:
        return "bg-gray-100 dark:bg-gray-800";
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 hover:shadow-lg transition">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {lead?.name || "Unknown Lead"}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {lead?.company || "No company"}
          </p>
        </div>
        <Badge className={getConfidenceColor(prediction.conversion_confidence)}>
          {prediction.conversion_confidence}
        </Badge>
      </div>

      {/* Conversion Score */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Conversion Likelihood
            </span>
          </div>
          <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {prediction.conversion_likelihood}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${prediction.conversion_likelihood}%` }}
          />
        </div>
      </div>

      {/* Upsell Opportunity */}
      {prediction.upsell_opportunity && (
        <div className="mb-6 p-4 bg-purple-50 dark:bg-purple-950 rounded-lg border border-purple-200 dark:border-purple-900">
          <div className="flex items-start gap-3">
            <Star className="text-purple-600 dark:text-purple-400 flex-shrink-0 mt-1" size={18} />
            <div className="flex-1">
              <h4 className="font-semibold text-purple-900 dark:text-purple-100 text-sm mb-1">
                Upsell Opportunity
              </h4>
              <p className="text-sm text-purple-700 dark:text-purple-300 mb-2">
                {prediction.upsell_score}% potential
              </p>
              {prediction.recommended_product && (
                <Badge className="bg-purple-200 dark:bg-purple-800 text-purple-900 dark:text-purple-100">
                  Recommend: {prediction.recommended_product}
                </Badge>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Estimate */}
      <div className="mb-6 text-sm text-gray-600 dark:text-gray-400">
        <Zap size={16} className="inline mr-2 text-yellow-500" />
        Estimated conversion in{" "}
        <span className="font-semibold text-gray-900 dark:text-white">
          {prediction.conversion_days_estimate} days
        </span>
      </div>

      {/* Risk Factors */}
      {prediction.risk_factors && prediction.risk_factors.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle size={16} className="text-red-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Risk Factors
            </span>
          </div>
          <div className="space-y-1">
            {prediction.risk_factors.map((factor, idx) => (
              <p key={idx} className="text-xs text-red-600 dark:text-red-400">
                • {factor}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Opportunity Factors */}
      {prediction.opportunity_factors &&
        prediction.opportunity_factors.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={16} className="text-green-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Positive Signals
              </span>
            </div>
            <div className="space-y-1">
              {prediction.opportunity_factors.map((factor, idx) => (
                <p key={idx} className="text-xs text-green-600 dark:text-green-400">
                  ✓ {factor}
                </p>
              ))}
            </div>
          </div>
        )}
    </div>
  );
}