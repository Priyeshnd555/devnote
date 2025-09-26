
interface SearchBarProps {
    searchQuery: string;
    onSearchQueryChange: (query: string) => void;
    onSearchSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  }
  
  export const SearchBar = ({ searchQuery, onSearchQueryChange, onSearchSubmit }: SearchBarProps) => {
    return (
      <div className="mb-8">
        <form onSubmit={onSearchSubmit} className="relative">
          <input
            type="text"
            placeholder="Search tasks or add a new one..."
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            className="w-full bg-gray-800 border-2 border-gray-700 rounded-lg py-3 px-4 pl-10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
          />
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500 cursor-pointer"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            onClick={(e) => e.currentTarget.closest('form')?.requestSubmit()}
          >
            <path
              fillRule="evenodd"
              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
              clipRule="evenodd"
            />
          </svg>
        </form>
      </div>
    );
  };
