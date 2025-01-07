import { Button } from "@/components/ui/button";
import { Pencil, X, Check } from "lucide-react";
import { Input } from "@/components/ui/input";

interface AccountHeaderProps {
  icon: React.ReactNode;
  title: string;
  accountName?: string;
  isEditing: boolean;
  newName: string;
  onEditClick: () => void;
  onNameChange: (value: string) => void;
  onSaveName: () => void;
  onCancelEdit: () => void;
}

export const AccountHeader = ({
  icon,
  title,
  accountName,
  isEditing,
  newName,
  onEditClick,
  onNameChange,
  onSaveName,
  onCancelEdit
}: AccountHeaderProps) => {
  return (
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 flex items-center justify-center bg-blue-100 rounded-lg">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold">{title}</h3>
        {accountName && (
          <div className="flex items-center gap-2">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <Input
                  value={newName}
                  onChange={(e) => onNameChange(e.target.value)}
                  className="h-8 w-48"
                  placeholder="Enter new name"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={onSaveName}
                  className="h-8 w-8"
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={onCancelEdit}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">{accountName}</p>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={onEditClick}
                  className="h-6 w-6"
                >
                  <Pencil className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};