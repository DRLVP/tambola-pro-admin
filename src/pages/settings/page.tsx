import { useState } from 'react';
import { toast } from 'sonner';
import { Save, Globe, Bell, Shield, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function AdminSettings() {
  const [settings, setSettings] = useState({
    siteName: 'Tambola Pro',
    supportEmail: 'support@tambolapro.com',
    maxTicketsPerGame: '5',
    defaultTicketPrice: '50',
    autoPlayInterval: '3',
    enableNotifications: true,
    enableSounds: true,
    enableAutoPlay: true,
    requireEmailVerification: false,
    maintenanceMode: false,
  });

  const handleSave = () => {
    toast.success('Settings saved successfully!');
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Configure your application settings</p>
      </div>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            <CardTitle>General Settings</CardTitle>
          </div>
          <CardDescription>Basic application configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="siteName">Site Name</Label>
            <Input
              id="siteName"
              value={settings.siteName}
              onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="supportEmail">Support Email</Label>
            <Input
              id="supportEmail"
              type="email"
              value={settings.supportEmail}
              onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Game Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            <CardTitle>Game Settings</CardTitle>
          </div>
          <CardDescription>Configure game defaults</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maxTickets">Max Tickets Per Game</Label>
              <Select
                value={settings.maxTicketsPerGame}
                onValueChange={(value) => setSettings({ ...settings, maxTicketsPerGame: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 Tickets</SelectItem>
                  <SelectItem value="5">5 Tickets</SelectItem>
                  <SelectItem value="10">10 Tickets</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="defaultPrice">Default Ticket Price (?)</Label>
              <Input
                id="defaultPrice"
                type="number"
                value={settings.defaultTicketPrice}
                onChange={(e) => setSettings({ ...settings, defaultTicketPrice: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="autoPlayInterval">Auto-Play Interval (seconds)</Label>
            <Select
              value={settings.autoPlayInterval}
              onValueChange={(value) => setSettings({ ...settings, autoPlayInterval: value })}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2 seconds</SelectItem>
                <SelectItem value="3">3 seconds</SelectItem>
                <SelectItem value="5">5 seconds</SelectItem>
                <SelectItem value="10">10 seconds</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <CardTitle>Notifications</CardTitle>
          </div>
          <CardDescription>Manage notification preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Notifications</Label>
              <p className="text-sm text-muted-foreground">Send notifications to users</p>
            </div>
            <Switch
              checked={settings.enableNotifications}
              onCheckedChange={(checked) => setSettings({ ...settings, enableNotifications: checked })}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Sounds</Label>
              <p className="text-sm text-muted-foreground">Play sounds during games</p>
            </div>
            <Switch
              checked={settings.enableSounds}
              onCheckedChange={(checked) => setSettings({ ...settings, enableSounds: checked })}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Auto-Play</Label>
              <p className="text-sm text-muted-foreground">Allow automatic number calling</p>
            </div>
            <Switch
              checked={settings.enableAutoPlay}
              onCheckedChange={(checked) => setSettings({ ...settings, enableAutoPlay: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <CardTitle>Security</CardTitle>
          </div>
          <CardDescription>Security and access settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Require Email Verification</Label>
              <p className="text-sm text-muted-foreground">Users must verify email before playing</p>
            </div>
            <Switch
              checked={settings.requireEmailVerification}
              onCheckedChange={(checked) => setSettings({ ...settings, requireEmailVerification: checked })}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-amber-600">Maintenance Mode</Label>
              <p className="text-sm text-muted-foreground">Put the site in maintenance mode</p>
            </div>
            <Switch
              checked={settings.maintenanceMode}
              onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Button onClick={handleSave} className="gap-2">
        <Save className="h-4 w-4" />
        Save All Settings
      </Button>
    </div>
  );
}

export default AdminSettings;
