import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User, LogIn, Menu } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSidebar } from '@/contexts/SidebarContext';
import { Button } from '@/components/ui/button';
import ThemeToggle from '@/components/dashboard/ThemeToggle';

export default function Navbar() {
  const { currentUser, userData, logout } = useAuth();
  const { toggle } = useSidebar();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  return (
    <header className="border-b border-border/50 gradient-header backdrop-blur-xl sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-3">
        {/* Left: hamburger + brand */}
        <div className="flex items-center gap-3">
          {currentUser && (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggle}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-200"
              aria-label="Toggle sidebar"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <Link to="/" className="flex flex-col leading-none group">
            <span className="text-lg font-display font-bold tracking-widest text-foreground group-hover:text-primary transition-colors duration-200">
              PayNest
            </span>
            <span className="text-[9px] font-medium tracking-[0.2em] text-muted-foreground uppercase leading-none mt-px">
              Financial Services
            </span>
          </Link>
        </div>

        {/* Right: theme + user */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <div className="h-6 w-px bg-border mx-1 hidden sm:block" />

          {currentUser ? (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground hidden sm:block mr-1">
                {userData?.displayName || currentUser.email}
              </span>
              <Button variant="outline" size="sm" className="rounded-xl gap-2" asChild>
                <Link to="/profile">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">Profile</span>
                </Link>
              </Button>
              <Button
                variant="ghost" size="sm"
                className="rounded-xl px-2 text-muted-foreground hover:text-expense"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button size="sm" className="rounded-xl gap-2 px-4 shadow-md" asChild>
              <Link to="/login">
                <LogIn className="h-4 w-4" />
                <span>Login</span>
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
