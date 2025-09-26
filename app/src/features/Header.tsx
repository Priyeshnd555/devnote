
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu";
  
  interface HeaderProps {
    email: string;
    onSignOut: () => void;
  }
  
  export const Header = ({ email, onSignOut }: HeaderProps) => {
    return (
      <header className="text-center mb-10">
        <p className="mt-2 text-lg text-gray-400">
          Become a better engineer. &nbsp;
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="text-lg text-gray-400 hover:text-white">
                :::
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={onSignOut}>
                Sign Out {email}{" "}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </p>
      </header>
    );
  };
