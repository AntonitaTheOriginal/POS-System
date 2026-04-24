import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Textarea } from '../ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../ui/select';
import { useApp } from '../../context/AppContext';
import { AdminLayout } from './AdminLayout';
import { toast } from 'sonner';
import { businessTypeConfigs } from '../../data/appData';

export function AdminSettings() {
  const { settings, updateSettings, resetToDefaultMenu } = useApp();
  const [localSettings, setLocalSettings] = useState(settings);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    updateSettings(localSettings);
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Settings saved successfully');
    }, 500);
  };

  const togglePaymentMode = (mode: 'cash' | 'upi') => {
    const updated = localSettings.enabledPaymentModes.includes(mode)
      ? localSettings.enabledPaymentModes.filter(m => m !== mode)
      : [...localSettings.enabledPaymentModes, mode];
    
    setLocalSettings({ ...localSettings, enabledPaymentModes: updated });
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h2 className="text-3xl mb-2">Settings</h2>
          <p className="text-gray-600">Configure {businessTypeConfigs[localSettings.businessType].name.toLowerCase()} branding and system behavior</p>
        </div>

        {/* Business Branding */}
        <Card className="p-6 space-y-6">
          <h3 className="font-medium text-lg border-b pb-2">Business Branding</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="restaurantName">{businessTypeConfigs[localSettings.businessType].name} Name</Label>
              <Input
                id="restaurantName"
                value={localSettings.restaurantName}
                onChange={(e) => setLocalSettings({ ...localSettings, restaurantName: e.target.value })}
                placeholder={`Enter ${businessTypeConfigs[localSettings.businessType].name.toLowerCase()} name`}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Business Email</Label>
              <Input
                id="email"
                type="email"
                value={localSettings.email}
                onChange={(e) => setLocalSettings({ ...localSettings, email: e.target.value })}
                placeholder="contact@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Contact Phone</Label>
              <Input
                id="phone"
                value={localSettings.phone}
                onChange={(e) => setLocalSettings({ ...localSettings, phone: e.target.value })}
                placeholder="+91 00000 00000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency Symbol</Label>
              <Select 
                value={localSettings.currency} 
                onValueChange={(val) => setLocalSettings({ ...localSettings, currency: val })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="₹">₹ (INR)</SelectItem>
                  <SelectItem value="$">$ (USD)</SelectItem>
                  <SelectItem value="£">£ (GBP)</SelectItem>
                  <SelectItem value="€">€ (EUR)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Full Address</Label>
            <Textarea
              id="address"
              value={localSettings.address}
              onChange={(e) => setLocalSettings({ ...localSettings, address: e.target.value })}
              placeholder="Enter complete business address"
              rows={3}
            />
          </div>
        </Card>

        {/* Business Configuration */}
        <Card className="p-6 space-y-6">
          <h3 className="font-medium text-lg border-b pb-2">Business Configuration</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="businessType">Business Type</Label>
              <Select 
                value={localSettings.businessType} 
                onValueChange={(val: any) => setLocalSettings({ ...localSettings, businessType: val })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(businessTypeConfigs).map((config) => (
                    <SelectItem key={config.type} value={config.type}>
                      {config.icon} {config.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">This changes available roles and features.</p>
            </div>

            <div className="pt-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  if (confirm(`This will delete your current menu and categories and replace them with the standard ${businessTypeConfigs[localSettings.businessType].name} template. Continue?`)) {
                    resetToDefaultMenu();
                    alert('Menu updated to template!');
                  }
                }}
                className="w-full sm:w-auto"
              >
                Apply {businessTypeConfigs[localSettings.businessType].name} Menu Template
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gst">{businessTypeConfigs[localSettings.businessType].taxLabel} Percentage (%)</Label>
              <Input
                id="gst"
                type="number"
                value={localSettings.gstPercentage}
                onChange={(e) => setLocalSettings({ ...localSettings, gstPercentage: Number(e.target.value) })}
                placeholder="5"
                min="0"
                max="100"
              />
              <p className="text-xs text-gray-500">Applied automatically on all bills.</p>
            </div>
          </div>
        </Card>

        {/* Receipt Settings */}
        <Card className="p-6 space-y-4">
          <h3 className="font-medium text-lg border-b pb-2">Receipt Customization</h3>
          <div className="space-y-2">
            <Label htmlFor="receiptFooter">Footer Message</Label>
            <Textarea
              id="receiptFooter"
              value={localSettings.receiptFooter}
              onChange={(e) => setLocalSettings({ ...localSettings, receiptFooter: e.target.value })}
              placeholder="e.g., Thank you for dining with us!"
              rows={2}
            />
            <p className="text-xs text-gray-500">Appears at the bottom of printed receipts.</p>
          </div>
        </Card>

        {/* Payment Methods */}
        <Card className="p-6 space-y-4">
          <h3 className="font-medium text-lg border-b pb-2">Payment Methods</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50/50">
              <div>
                <p className="font-medium">Cash Payments</p>
                <p className="text-sm text-gray-600">Accept physical cash</p>
              </div>
              <Switch
                checked={localSettings.enabledPaymentModes.includes('cash')}
                onCheckedChange={() => togglePaymentMode('cash')}
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50/50">
              <div>
                <p className="font-medium">UPI Payments</p>
                <p className="text-sm text-gray-600">QR codes & Mobile apps</p>
              </div>
              <Switch
                checked={localSettings.enabledPaymentModes.includes('upi')}
                onCheckedChange={() => togglePaymentMode('upi')}
              />
            </div>
          </div>

          {localSettings.enabledPaymentModes.length === 0 && (
            <p className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-100 flex items-center gap-2">
              <span>⚠️</span> At least one payment method must be enabled for the system to work.
            </p>
          )}
        </Card>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <Button 
            onClick={handleSave} 
            disabled={localSettings.enabledPaymentModes.length === 0 || isSaving}
            size="lg"
            className="w-full md:w-auto min-w-[200px]"
          >
            {isSaving ? 'Saving...' : 'Save All Settings'}
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
