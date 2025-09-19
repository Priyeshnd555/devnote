
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const CommandPalette = ({ open, onOpenChange, onSelectAction }) => {
  const [search, setSearch] = useState("");

  const actions = [
    { id: "signin", label: "Sign In" },
    { id: "signup", label: "Sign Up" },
    { id: "signout", label: "Sign Out" },
  ];

  const filteredActions = actions.filter((action) =>
    action.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Command Palette</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <Input
            type="text"
            placeholder="Search actions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="mt-4">
          <ul>
            {filteredActions.map((action) => (
              <li
                key={action.id}
                className="p-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => onSelectAction(action.id)}
              >
                {action.label}
              </li>
            ))}
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CommandPalette;
