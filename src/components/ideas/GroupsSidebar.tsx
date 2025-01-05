import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GroupsSidebarProps {
  groups: any[];
  selectedGroup: string | null;
  onGroupSelect: (groupId: string) => void;
  onCreateGroup: () => void;
}

export const GroupsSidebar: React.FC<GroupsSidebarProps> = ({
  groups,
  selectedGroup,
  onGroupSelect,
  onCreateGroup,
}) => {
  return (
    <div className="col-span-1 bg-background rounded-lg p-4 space-y-4 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Groups</h3>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={onCreateGroup}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-2">
        {groups.map((group) => (
          <Button
            key={group.id}
            variant={selectedGroup === group.id ? "secondary" : "ghost"}
            className="w-full justify-start text-left"
            onClick={() => onGroupSelect(group.id)}
          >
            <span className="truncate">{group.name}</span>
          </Button>
        ))}
        {groups.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No groups created yet
          </p>
        )}
      </div>
    </div>
  );
};