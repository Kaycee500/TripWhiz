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
          className="hidden sm:flex"
        >
          <User className="w-4 h-4 mr-2" />
          Profile
        </Button>
        <Button
          onClick={logout}
          variant="outline"
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
      >
        <LogIn className="w-4 h-4 mr-2" />
        Sign In
      </Button>
      <Button
        onClick={() => setLocation('/signup')}
        className="bg-gradient-to-r from-blue-500 to-orange-500 hover:from-blue-600 hover:to-orange-600"
      >
        Sign Up
      </Button>
    </div>
  );
}