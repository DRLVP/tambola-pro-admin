import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  GripVertical,
  Settings,
  Trophy,
  Ticket,
  Clock,
  Copy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { gameService } from '@/services/game.service';
import { getDefaultRules, getDefaultSettings, PATTERN_DEFINITIONS } from '@/lib/game-rules';
import type { PrizePattern, GameSettings } from '@/types';

// Prize patterns with their descriptions
const prizePatterns: { value: PrizePattern; label: string; description: string }[] = [
  { value: 'early_five', label: 'Early Five', description: 'First 5 numbers marked' },
  { value: 'top_line', label: 'Top Line', description: 'Complete first row' },
  { value: 'middle_line', label: 'Middle Line', description: 'Complete second row' },
  { value: 'bottom_line', label: 'Bottom Line', description: 'Complete third row' },
  { value: 'corners', label: 'Corners', description: 'All 4 corner numbers' },
  { value: 'full_house', label: 'Full House', description: 'All 15 numbers' },
];

interface RuleFormItem {
  id: string;
  pattern: PrizePattern | '';
  name: string;
  order: number;
  prizeAmount: string;
}

export function AdminCreateGame() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Basic game details
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    ticketPrice: '50',
  });

  // Game settings for ticket allocation
  const defaultSettings = getDefaultSettings();
  const [settings, setSettings] = useState<GameSettings>({
    minTickets: 5,
    maxTickets: 999, // Internal default since UI option removed
    maxTicketsPerUser: 100, // Internal default
    autoPlay: defaultSettings.autoPlay,
    autoPlayInterval: defaultSettings.autoPlayInterval,
  });

  // Game rules (winning patterns with prizes)
  const defaultRules = getDefaultRules();
  const [rules, setRules] = useState<RuleFormItem[]>(
    defaultRules.map((rule, index) => ({
      id: Date.now().toString() + index,
      pattern: rule.pattern,
      name: rule.name,
      order: rule.order,
      prizeAmount: rule.prizeAmount.toString(),
    }))
  );

  // Add new rule
  const addRule = () => {
    const newOrder = rules.length + 1;
    const newId = Date.now().toString();
    setRules([
      ...rules,
      {
        id: newId,
        pattern: '',
        name: '',
        order: newOrder,
        prizeAmount: ''
      },
    ]);
  };

  // Remove rule
  const removeRule = (id: string) => {
    const updatedRules = rules
      .filter(r => r.id !== id)
      .map((r, index) => ({ ...r, order: index + 1 }));
    setRules(updatedRules);
  };

  // Update rule field
  const updateRule = (id: string, field: keyof RuleFormItem, value: string | number) => {
    setRules(rules.map(r => {
      if (r.id !== id) return r;

      // If pattern is changed, auto-fill the name
      if (field === 'pattern') {
        const patternDef = PATTERN_DEFINITIONS[value as PrizePattern];
        return {
          ...r,
          pattern: value as PrizePattern,
          name: patternDef?.name || ''
        };
      }

      return { ...r, [field]: value };
    }));
  };

  // Move rule up/down (for ordering)
  const moveRule = (id: string, direction: 'up' | 'down') => {
    const index = rules.findIndex(r => r.id === id);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= rules.length) return;

    const newRules = [...rules];
    [newRules[index], newRules[newIndex]] = [newRules[newIndex], newRules[index]];

    // Update order numbers
    setRules(newRules.map((r, i) => ({ ...r, order: i + 1 })));
  };

  // Duplicate rule
  const duplicateRule = (id: string) => {
    const index = rules.findIndex(r => r.id === id);
    if (index === -1) return;

    const ruleToCopy = rules[index];
    const newRule = {
      ...ruleToCopy,
      id: Date.now().toString(),
      name: `${ruleToCopy.name} (Copy)`,
    };

    const newRules = [
      ...rules.slice(0, index + 1),
      newRule,
      ...rules.slice(index + 1)
    ];

    setRules(newRules.map((r, i) => ({ ...r, order: i + 1 })));
  };

  // Validate form
  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      toast.error('Game name is required');
      return false;
    }

    if (!formData.ticketPrice || parseInt(formData.ticketPrice) <= 0) {
      toast.error('Valid ticket price is required');
      return false;
    }

    if (settings.minTickets < 5) {
      toast.error('Minimum tickets must be at least 5');
      return false;
    }

    if (rules.length === 0) {
      toast.error('At least one game rule is required');
      return false;
    }

    for (const rule of rules) {
      if (!rule.pattern) {
        toast.error('All rules must have a pattern selected');
        return false;
      }
      if (!rule.prizeAmount || parseInt(rule.prizeAmount) <= 0) {
        toast.error('All rules must have a valid prize amount');
        return false;
      }
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const gameData = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        ticketPrice: parseInt(formData.ticketPrice),
        maxPlayers: 1000000,
        rules: rules.map(r => ({
          pattern: r.pattern as PrizePattern,
          name: r.name,
          order: r.order,
          prizeAmount: parseInt(r.prizeAmount),
        })),
        settings,
      };

      await gameService.createGame(gameData);

      toast.success('Game created successfully!');
      navigate('/admin/games');
    } catch (error) {
      console.error('Failed to create game:', error);
      toast.error('Failed to create game. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate total prize pool
  const totalPrize = rules.reduce((sum, r) => sum + (parseInt(r.prizeAmount) || 0), 0);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/admin/games">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Create New Game</h1>
          <p className="text-muted-foreground">Configure game rules, ticket allocation, and prizes</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-violet-500" />
              Game Details
            </CardTitle>
            <CardDescription>Basic information about the game</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Game Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Evening Fun Tambola"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of the game..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ticketPrice">Ticket Price (XP) *</Label>
                <Input
                  id="ticketPrice"
                  type="number"
                  min="1"
                  placeholder="50"
                  value={formData.ticketPrice}
                  onChange={(e) => setFormData({ ...formData, ticketPrice: e.target.value })}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ticket Allocation Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ticket className="h-5 w-5 text-green-500" />
              Ticket Allocation
            </CardTitle>
            <CardDescription>Configure ticket limits and distribution</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minTickets">Minimum Tickets (Min: 5) *</Label>
                <Input
                  id="minTickets"
                  type="number"
                  min="5"
                  value={settings.minTickets}
                  onChange={(e) => setSettings({
                    ...settings,
                    minTickets: Math.max(5, parseInt(e.target.value) || 5)
                  })}
                  required
                />
                <p className="text-xs text-muted-foreground">Minimum number of tickets required to start game</p>
              </div>
            </div>

            <Separator />

            {/* Auto-play Settings */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="autoPlay" className="text-base">Auto-play Numbers</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically call numbers at regular intervals
                  </p>
                </div>
                <Switch
                  id="autoPlay"
                  checked={settings.autoPlay}
                  onCheckedChange={(checked) => setSettings({ ...settings, autoPlay: checked })}
                />
              </div>

              {settings.autoPlay && (
                <div className="space-y-3 pl-1">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Call Interval
                    </Label>
                    <Badge variant="secondary">
                      {Math.round(settings.autoPlayInterval / 1000)}s
                    </Badge>
                  </div>
                  <Slider
                    value={[settings.autoPlayInterval]}
                    onValueChange={([value]) => setSettings({
                      ...settings,
                      autoPlayInterval: value
                    })}
                    min={3000}
                    max={10000}
                    step={500}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>3 seconds</span>
                    <span>10 seconds</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Game Rules / Winning Patterns */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-amber-500" />
                  Game Rules
                </CardTitle>
                <CardDescription>
                  Configure winning patterns and prize amounts. Rules are checked in order.
                </CardDescription>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addRule}>
                <Plus className="h-4 w-4 mr-1" />
                Add Rule
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {rules.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No rules configured. Add at least one rule.</p>
              </div>
            ) : (
              rules.map((rule, index) => (
                <div
                  key={rule.id}
                  className="flex items-start gap-3 p-4 border rounded-lg bg-card hover:bg-muted/30 transition-colors"
                >
                  {/* Order indicator */}
                  <div className="flex flex-col items-center gap-1 pt-2">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 font-bold text-sm">
                      {rule.order}
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => moveRule(rule.id, 'up')}
                        disabled={index === 0}
                      >
                        <GripVertical className="h-3 w-3 rotate-90" />
                      </Button>
                    </div>
                  </div>

                  {/* Rule configuration */}
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Pattern *</Label>
                      <Select
                        value={rule.pattern}
                        onValueChange={(value) => updateRule(rule.id, 'pattern', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select pattern" />
                        </SelectTrigger>
                        <SelectContent>
                          {prizePatterns.map((p) => (
                            <SelectItem key={p.value} value={p.value}>
                              <div className="flex flex-col">
                                <span>{p.label}</span>
                                <span className="text-xs text-muted-foreground">
                                  {p.description}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Prize Name</Label>
                      <Input
                        placeholder="e.g., 1st Prize"
                        value={rule.name}
                        onChange={(e) => updateRule(rule.id, 'name', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Prize Amount (XP) *</Label>
                      <Input
                        type="number"
                        min="1"
                        placeholder="1000"
                        value={rule.prizeAmount}
                        onChange={(e) => updateRule(rule.id, 'prizeAmount', e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1 mt-6">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => duplicateRule(rule.id)}
                      title="Duplicate Rule"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeRule(rule.id)}
                      disabled={rules.length === 1}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}

            <Separator />

            {/* Prize Summary */}
            <div className="flex justify-between items-center p-4 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-200 dark:border-green-800">
              <div>
                <span className="font-medium text-green-800 dark:text-green-200">
                  Total Prize Pool
                </span>
                <p className="text-xs text-green-600 dark:text-green-400">
                  {rules.length} prize{rules.length !== 1 ? 's' : ''} configured
                </p>
              </div>
              <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                {totalPrize.toLocaleString()} XP
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4 sticky bottom-4 bg-background/80 backdrop-blur-sm p-4 -mx-4 rounded-lg border shadow-lg">
          <Button type="submit" className="gap-2 flex-1 md:flex-none" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Create Game
              </>
            )}
          </Button>
          <Link to="/admin/games">
            <Button type="button" variant="outline">Cancel</Button>
          </Link>
        </div>
      </form>
    </div>
  );
}

export default AdminCreateGame;