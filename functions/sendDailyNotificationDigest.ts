import { base44 } from "@/api/base44Client";

export default async function sendDailyNotificationDigest(req, res) {
  try {
    // Get all admin users
    const adminUsers = await base44.entities.User.filter({ role: "admin" });

    if (!adminUsers || adminUsers.length === 0) {
      return res.status(200).json({ message: "No admin users found" });
    }

    // For each admin, check their notification settings and build digest
    const emailsToSend = [];

    for (const admin of adminUsers) {
      const settings = await base44.entities.NotificationSettings.filter({
        user_email: admin.email,
      });

      const userSettings = settings.length > 0 ? settings[0] : null;

      // Skip if user doesn't have settings created yet
      if (!userSettings) continue;

      // Build digest content
      const digestItems = [];

      // Get leads from past 24 hours
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      // New leads
      if (userSettings.new_leads_enabled) {
        const newLeads = await base44.entities.Lead.filter({
          status: "new",
        });
        if (newLeads && newLeads.length > 0) {
          digestItems.push({
            type: "new_leads",
            count: newLeads.length,
            items: newLeads.slice(0, 5),
          });
        }
      }

      // Conversion updates
      if (userSettings.conversion_updates_enabled) {
        const convertedLeads = await base44.entities.Lead.filter({
          status: "converted",
        });
        if (convertedLeads && convertedLeads.length > 0) {
          digestItems.push({
            type: "conversions",
            count: convertedLeads.length,
            items: convertedLeads.slice(0, 5),
          });
        }
      }

      // Low score alerts
      if (userSettings.low_score_alerts_enabled) {
        const allLeads = await base44.entities.Lead.list();
        const predictions = await base44.entities.LeadPrediction.list();

        const lowScoreLeads = predictions
          .filter((p) => p.conversion_likelihood < userSettings.low_score_threshold)
          .map((p) => {
            const lead = allLeads.find((l) => l.id === p.lead_id);
            return { ...p, lead };
          })
          .filter((item) => item.lead);

        if (lowScoreLeads.length > 0) {
          digestItems.push({
            type: "low_scores",
            count: lowScoreLeads.length,
            items: lowScoreLeads.slice(0, 5),
          });
        }
      }

      // Only send if there's content
      if (digestItems.length > 0) {
        emailsToSend.push({
          email: admin.email,
          adminName: admin.full_name,
          digestItems,
        });
      }
    }

    // Send emails
    for (const email of emailsToSend) {
      let emailBody = `<h2>Daily Notification Digest</h2><p>Hi ${email.adminName},</p><p>Here's your daily summary:</p>`;

      email.digestItems.forEach((item) => {
        if (item.type === "new_leads") {
          emailBody += `<h3>🆕 ${item.count} New Leads</h3><ul>`;
          item.items.forEach((lead) => {
            emailBody += `<li>${lead.name} (${lead.email}) - ${lead.company}</li>`;
          });
          emailBody += "</ul>";
        } else if (item.type === "conversions") {
          emailBody += `<h3>✅ ${item.count} Conversions</h3><ul>`;
          item.items.forEach((lead) => {
            emailBody += `<li>${lead.name} (${lead.email}) - ${lead.company}</li>`;
          });
          emailBody += "</ul>";
        } else if (item.type === "low_scores") {
          emailBody += `<h3>⚠️ ${item.count} Low Conversion Score Alerts</h3><ul>`;
          item.items.forEach((item) => {
            emailBody += `<li>${item.lead.name} - Score: ${item.conversion_likelihood}/100</li>`;
          });
          emailBody += "</ul>";
        }
      });

      emailBody += `<p style="margin-top: 20px; color: #666;">Best regards,<br/>Ark Data Team</p>`;

      // Send the email
      await base44.integrations.Core.SendEmail({
        to: email.email,
        subject: "Your Daily Ark Data Digest",
        body: emailBody,
        from_name: "Ark Data",
      });

      // Log the digest sent
      await base44.entities.NotificationLog.create({
        event_type: "daily_digest",
        lead_id: "system",
        digest_sent_date: new Date().toISOString().split("T")[0],
        digest_sent_to: emailsToSend.map((e) => e.email),
      });
    }

    return res.status(200).json({
      message: "Daily digests sent successfully",
      emailsSent: emailsToSend.length,
    });
  } catch (error) {
    console.error("Error sending daily digest:", error);
    return res.status(500).json({ error: error.message });
  }
}