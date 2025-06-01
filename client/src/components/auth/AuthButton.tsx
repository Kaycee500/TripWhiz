import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { User, LogIn } from 'lucide-react';

export default function AuthButton() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();

  if (user) {
    return (
      <div className="flex items-center space-x-4">
        <Button
          onClick={() => setLocation('/profile')}
          variant="outline"
          className="hidden sm:flex bg-slate-700 text-white border-slate-600 hover:bg-slate-600"
        >
          <User className="w-4 h-4 mr-2" />
          Profile
        </Button>
        <Button
          onClick={logout}
          variant="outline"
          className="text-slate-50 bg-slate-700 border-slate-600 hover:text-red-700 hover:bg-red-50"
        >
          Sign Out
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <Button
        onClick={() => setLocation('/signin')}
        variant="outline"
        className="bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
      >
        <LogIn className="w-4 h-4 mr-2" />
        Sign In
      </Button>
      <Button
        onClick={() => setLocation('/signup')}
        className="bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900"
      >
        Sign Up
      </Button>
    </div>
  );
}