import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

const prizePatterns = [
  { value: 'early_five', label: 'Early Five' },
  { value: 'top_line', label: 'Top Line' },
  { value: 'middle_line', label: 'Middle Line' },
  { value: 'bottom_line', label: 'Bottom Line' },
  { value: 'corners', label: 'Corners' },
  { value: 'full_house', label: 'Full House' },
];

interface PrizeFormItem {
  id: string;
  pattern: string;
  amount: string;
}

export function AdminEditGame() {
  const { id: _id } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock existing game data
  const [formData, setFormData] = useState({
    name: 'Evening Fun Tambola',
    description: 'Join us for an exciting evening game!',
    ticketPrice: '50',
    maxPlayers: '100',
    scheduledAt: '',
  });

  const [prizes, setPrizes] = useState<PrizeFormItem[]>([
    { id: '1', pattern: 'early_five', amount: '500' },
    { id: '2', pattern: 'top_line', amount: '1000' },
    { id: '3', pattern: 'middle_line', amount: '1000' },
    { id: '4', pattern: 'bottom_line', amount: '1000' },
    { id: '5', pattern: 'full_house', amount: '2500' },
  ]);

  const addPrize = () => {
    const newId = Date.now().toString();
    setPrizes([...prizes, { id: newId, pattern: '', amount: '' }]);
  };

  const removePrize = (prizeId: string) => {
    setPrizes(prizes.filter(p => p.id !== prizeId));
  };

  const updatePrize = (prizeId: string, field: 'pattern' | 'amount', value: string) => {
    setPrizes(prizes.map(p => p.id === prizeId ? { ...p, [field]: value } : p));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    await new Promise(resolve => setTimeout(resolve, 1500));

    toast.success('Game updated successfully!');
    setIsSubmitting(false);
    navigate('/admin/games');
  };

  const totalPrize = prizes.reduce((sum, p) => sum + (parseInt(p.amount) || 0), 0);

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/admin/games">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Edit Game</h1>
          <p className="text-muted-foreground">Update game settings</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Game Details</CardTitle>
            <CardDescription>Update game information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Game Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ticketPrice">Ticket Price (XP) *</Label>
                <Input
                  id="ticketPrice"
                  type="number"
                  value={formData.ticketPrice}
                  onChange={(e) => setFormData({ ...formData, ticketPrice: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxPlayers">Max Players *</Label>
                <Input
                  id="maxPlayers"
                  type="number"
                  value={formData.maxPlayers}
                  onChange={(e) => setFormData({ ...formData, maxPlayers: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="scheduledAt">Scheduled Start Time</Label>
              <Input
                id="scheduledAt"
                type="datetime-local"
                value={formData.scheduledAt}
                onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Prizes */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Prizes</CardTitle>
                <CardDescription>Configure winning patterns and amounts</CardDescription>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addPrize}>
                <Plus className="h-4 w-4 mr-1" />
                Add Prize
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {prizes.map((prize) => (
              <div key={prize.id} className="flex items-end gap-4">
                <div className="flex-1 space-y-2">
                  <Label>Pattern</Label>
                  <Select
                    value={prize.pattern}
                    onValueChange={(value) => updatePrize(prize.id, 'pattern', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select pattern" />
                    </SelectTrigger>
                    <SelectContent>
                      {prizePatterns.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1 space-y-2">
                  <Label>Amount (XP)</Label>
                  <Input
                    type="number"
                    value={prize.amount}
                    onChange={(e) => updatePrize(prize.id, 'amount', e.target.value)}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removePrize(prize.id)}
                  disabled={prizes.length === 1}
                  className="text-red-500 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}

            <Separator />

            <div className="flex justify-between items-center p-4 rounded-lg bg-muted">
              <span className="font-medium">Total Prize Pool</span>
              <span className="text-lg font-bold text-green-600">{totalPrize.toLocaleString()} XP</span>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button type="submit" className="gap-2" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
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

export default AdminEditGame;
