import { useFinanceStore, type Role } from '@/store/useFinanceStore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Eye } from 'lucide-react';

const RoleSwitcher = () => {
  const { role, setRole } = useFinanceStore();

  return (
    <div className="flex items-center gap-2">
      {role === 'admin' ? <Shield className="h-4 w-4 text-primary" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
      <Select value={role} onValueChange={(v) => setRole(v as Role)}>
        <SelectTrigger className="w-28 h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="admin">Admin</SelectItem>
          <SelectItem value="viewer">Viewer</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default RoleSwitcher;
