import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card } from '../ui/card';
import { useApp } from '../../context/AppContext';

export function CommonLogin() {
  const navigate = useNavigate();
  const { login } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    setError('');
    const user = login(username, password);
    
    if (user) {
      // Redirect based on user role
      navigate('/redirect');
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 space-y-6">
        <div className="text-center space-y-3">
          <div className="w-20 h-20 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-4xl tracking-tight">SmartServe</h1>
          <p className="text-gray-600">Restaurant POS System</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username / Phone</Label>
            <Input
              id="username"
              type="text"
              placeholder="Enter username or phone"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              className="h-12"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <Button
            onClick={handleLogin}
            className="w-full h-12"
            size="lg"
          >
            Login
          </Button>
        </div>

        <div className="pt-4 border-t space-y-2">
          <p className="text-xs text-gray-500 text-center">Demo Credentials:</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="text-gray-600">
              <p className="font-medium">Admin:</p>
              <p>admin / admin123</p>
            </div>
            <div className="text-gray-600">
              <p className="font-medium">Cashier:</p>
              <p>cashier1 / cash123</p>
            </div>
            <div className="text-gray-600">
              <p className="font-medium">Waiter:</p>
              <p>waiter1 / wait123</p>
            </div>
            <div className="text-gray-600">
              <p className="font-medium">Kitchen:</p>
              <p>kitchen1 / kitchen123</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}