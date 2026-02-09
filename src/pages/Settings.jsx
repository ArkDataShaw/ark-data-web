import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, Save, AlertCircle } from 'lucide-react';

export default function Settings() {
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const fetchData = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      // Check if user is admin
      if (currentUser.role !== 'admin') {
        setLoading(false);
        return;
      }

      // Fetch or create notification settings
      const existingSettings = await base44.entities.NotificationSettings.filter({
        user_email: currentUser.email,
      });

      if (existingSettings.length > 0) {
        setSettings(existingSettings[0]);
      } else {
        // Create default settings
        const newSettings = await base44.entities.NotificationSettings.create({
          user_email: currentUser.email,
          new_leads_enabled: true,
          conversion_updates_enabled: true,
          low_score_alerts_enabled: true,
          digest_frequency: 'daily',
          low_score_threshold: 30,
        });
        setSettings(newSettings);
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  const updateMutation = useMutation({
    mutationFn: (data) =>
      base44.entities.NotificationSettings.update(settings.id, data),
    onSuccess: () => {
      setSuccess(true);
      queryClient.invalidateQueries({ queryKey: ['notificationSettings'] });
      setTimeout(() => setSuccess(false), 3000);
    },
  });

  const handleToggle = (field) => {
    const updated = { ...settings, [field]: !settings[field] };
    setSettings(updated);
  };

  const handleSave = () => {
    updateMutation.mutate({
      new_leads_enabled: settings.new_leads_enabled,
      conversion_updates_enabled: settings.conversion_updates_enabled,
      low_score_alerts_enabled: settings.low_score_alerts_enabled,
      low_score_threshold: settings.low_score_threshold,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Only admins can manage notification settings.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black py-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Notification Settings
        </h1>

        {success && (
          <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
            <p className="text-green-800 dark:text-green-200 flex items-center gap-2">
              <span>✓</span>
              Settings saved successfully
            </p>
          </div>
        )}

        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-8 space-y-6">
          {/* Info Box */}
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex gap-3">
            <AlertCircle className="text-blue-600 flex-shrink-0" size={20} />
            <div>
              <p className="text-sm text-blue-900 dark:text-blue-200">
                <strong>Daily Digest:</strong> You'll receive daily emails at 9 AM with a summary of new leads, conversion updates, and low-score alerts (below 30).
              </p>
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Bell size={20} />
              Email Notification Preferences
            </h2>

            {/* New Leads */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    New Lead Creation
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Get notified when new leads are created
                  </p>
                </div>
                <button
                  onClick={() => handleToggle('new_leads_enabled')}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    settings.new_leads_enabled
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-gray-300'
                  }`}
                >
                  {settings.new_leads_enabled ? 'Enabled' : 'Disabled'}
                </button>
              </div>
            </div>

            {/* Conversion Updates */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Conversion Status Updates
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Get notified when lead status changes to converted
                  </p>
                </div>
                <button
                  onClick={() => handleToggle('conversion_updates_enabled')}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    settings.conversion_updates_enabled
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-gray-300'
                  }`}
                >
                  {settings.conversion_updates_enabled ? 'Enabled' : 'Disabled'}
                </button>
              </div>
            </div>

            {/* Low Score Alerts */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Low Conversion Score Alerts
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Alert when conversion score drops below {settings.low_score_threshold}
                  </p>
                </div>
                <button
                  onClick={() => handleToggle('low_score_alerts_enabled')}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    settings.low_score_alerts_enabled
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-gray-300'
                  }`}
                >
                  {settings.low_score_alerts_enabled ? 'Enabled' : 'Disabled'}
                </button>
              </div>
            </div>

            {/* Threshold Setting */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <label className="block">
                <span className="font-semibold text-gray-900 dark:text-white">
                  Low Score Alert Threshold
                </span>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 mb-3">
                  Alerts triggered when conversion score is below this value
                </p>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={settings.low_score_threshold}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      low_score_threshold: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </label>
            </div>
          </div>

          {/* Save Button */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <button
              onClick={handleSave}
              disabled={updateMutation.isPending}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
            >
              <Save size={18} />
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}