import { base44 } from "@/api/base44Client";

export async function generateLeadPredictions() {
  try {
    // Fetch all leads
    const leads = await base44.entities.Lead.list();
    const predictions = [];

    for (const lead of leads) {
      // Calculate conversion likelihood based on signals
      const conversionScore = calculateConversionLikelihood(lead);
      const upsellScore = calculateUpsellScore(lead);
      const riskFactors = identifyRiskFactors(lead);
      const opportunityFactors = identifyOpportunityFactors(lead);

      // Determine confidence level
      let confidence = "medium";
      if (conversionScore > 75) confidence = "high";
      if (conversionScore < 40) confidence = "low";

      // Create prediction
      const prediction = {
        lead_id: lead.id,
        conversion_likelihood: conversionScore,
        conversion_confidence: confidence,
        upsell_opportunity: upsellScore > 50,
        upsell_score: upsellScore,
        recommended_product:
          upsellScore > 60 ? "Growth" : upsellScore > 40 ? "Starter" : null,
        conversion_days_estimate: estimateConversionDays(lead, conversionScore),
        risk_factors: riskFactors,
        opportunity_factors: opportunityFactors,
        prediction_date: new Date().toISOString().split("T")[0],
      };

      // Update or create prediction
      const existing = await base44.entities.LeadPrediction.filter({
        lead_id: lead.id,
      }).catch(() => []);

      if (existing && existing.length > 0) {
        await base44.entities.LeadPrediction.update(existing[0].id, prediction);
      } else {
        predictions.push(prediction);
      }
    }

    // Bulk create new predictions
    if (predictions.length > 0) {
      await base44.entities.LeadPrediction.bulkCreate(predictions);
    }

    return {
      success: true,
      predictions_generated: predictions.length,
      total_analyzed: leads.length,
    };
  } catch (error) {
    console.error("Error generating predictions:", error);
    throw error;
  }
}

function calculateConversionLikelihood(lead) {
  let score = 50; // Base score

  // Company factors (+20)
  if (lead.company && lead.company.length > 0) score += 10;
  if (lead.website && lead.website.length > 0) score += 10;

  // Role factors (+15)
  const highValueRoles = ["Sales", "Marketing", "RevOps", "C-Suite"];
  if (lead.role && highValueRoles.includes(lead.role)) score += 15;

  // Message/Intent factors (+20)
  if (lead.message && lead.message.length > 50) score += 20;
  if (
    lead.message &&
    (lead.message.toLowerCase().includes("demo") ||
      lead.message.toLowerCase().includes("urgent") ||
      lead.message.toLowerCase().includes("asap"))
  )
    score += 10;

  // Status factors
  if (lead.status === "qualified") score += 15;
  if (lead.status === "contacted") score += 5;
  if (lead.status === "lost") score -= 30;

  // UTM/Source quality (+10)
  if (lead.utm_source && lead.utm_source !== "direct") score += 10;

  return Math.min(Math.max(score, 0), 100);
}

function calculateUpsellScore(lead) {
  let score = 40; // Base score

  // Company size signals
  if (lead.company && lead.company.length > 20) score += 20; // Larger company

  // High-value role
  const executiveRoles = ["C-Suite", "VP", "Director"];
  if (lead.role && executiveRoles.some((r) => lead.role.includes(r)))
    score += 20;

  // Interest in multiple features
  if (lead.message && lead.message.length > 100) score += 15;

  // Return customer signal
  if (lead.status === "converted") score += 25;

  return Math.min(Math.max(score, 0), 100);
}

function identifyRiskFactors(lead) {
  const risks = [];

  if (lead.status === "lost") risks.push("Previously marked as lost");
  if (
    lead.created_date &&
    new Date(lead.created_date).getTime() <
      Date.now() - 30 * 24 * 60 * 60 * 1000
  )
    risks.push("No recent activity");
  if (!lead.company) risks.push("No company information");
  if (!lead.message || lead.message.length < 10)
    risks.push("Minimal engagement");

  return risks;
}

function identifyOpportunityFactors(lead) {
  const opportunities = [];

  if (lead.role && (lead.role.includes("Sales") || lead.role.includes("VP")))
    opportunities.push("Decision maker");
  if (lead.website) opportunities.push("Verified company");
  if (lead.message && lead.message.length > 100)
    opportunities.push("High engagement");
  if (lead.status === "qualified") opportunities.push("Pre-qualified");

  return opportunities;
}

function estimateConversionDays(lead, score) {
  // Score-based estimation
  if (score > 80) return 3;
  if (score > 60) return 7;
  if (score > 40) return 14;
  return 30;
}