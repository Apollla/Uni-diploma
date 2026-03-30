import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

type Props = {
  isOpenMenu: boolean;
  onToggleMenu: () => void;
};

export const HeaderView = ({ isOpenMenu, onToggleMenu }: Props) => {
  return (
    <header className="w-full bg-white border-b">
      <div className="max-w-[1920px] w-full mx-auto px-6 py-3 flex justify-between items-center">

        <div className="text-xl font-semibold">MyApp</div>

        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="hover:text-blue-500">Home</Link>
          <Link to="/hardware" className="hover:text-blue-500">Hardware</Link>
          <Link to="/software" className="hover:text-blue-500">Software</Link>
          <Link to="/users" className="hover:text-blue-500">Users</Link>
          <Link to="/analytics" className="hover:text-blue-500">Analytics</Link>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-lg font-semibold">U</div>
            <span className="text-sm">User</span>
          </div>
        </div>

        <button className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition" onClick={onToggleMenu}>
          <Menu size={28} />
        </button>

      </div>

      {isOpenMenu && (
        <div className="fixed inset-0 bg-black/50 md:hidden z-50">
          <div className="absolute right-0 top-0 bottom-0 w-[280px] bg-white p-6 flex flex-col">

            <button className="self-end mb-6 p-2 rounded-lg hover:bg-gray-100 transition" onClick={onToggleMenu}>
              <X size={28} />
            </button>

            <nav className="flex flex-col gap-4 text-lg">
              <Link to="/" onClick={onToggleMenu}>Home</Link>
              <Link to="/hardware" onClick={onToggleMenu}>Hardware</Link>
              <Link to="/software" onClick={onToggleMenu}>Software</Link>
              <Link to="/users" onClick={onToggleMenu}>Users</Link>
              <Link to="/analytics" onClick={onToggleMenu}>Analytics</Link>
            </nav>

            <div className="mt-auto flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-lg font-semibold">U</div>
              <span className="text-sm mt-1">User</span>
            </div>

          </div>
        </div>
      )}
    </header>
  );
};
