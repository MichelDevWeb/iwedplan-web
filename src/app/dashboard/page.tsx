'use client';

import { useEffect, useState } from 'react';
import { logoutUser } from '@/lib/firebase/authService';
import { getUserById } from '@/lib/firebase/userService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import AuthRedirect from '@/components/auth/AuthRedirect';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Heart, Calendar, Gift, Users, Settings, LogOut } from 'lucide-react';

export default function DashboardPage() {
  const [userName, setUserName] = useState<string | null>(null);
  const [weddingCount, setWeddingCount] = useState<number>(0);
  const [userTier, setUserTier] = useState<string>('free');
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchUserData = async () => {
      if (user?.uid) {
        try {
          const userData = await getUserById(user.uid);
          if (userData) {
            setUserName(userData.displayName || user.displayName || 'User');
            setWeddingCount(userData.weddingIds?.length || 0);
            setUserTier(userData.subscriptionTier || 'free');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };

    if (isAuthenticated) {
      fetchUserData();
    }
  }, [user, isAuthenticated]);

  const handleLogout = async () => {
    try {
      await logoutUser();
      router.push('/auth/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const dashboardCards = [
    {
      title: 'My Weddings',
      description: 'Manage your wedding websites',
      icon: <Heart className="h-8 w-8 text-pink-500" />,
      action: () => router.push('/dashboard/weddings'),
    },
    {
      title: 'Calendar',
      description: 'View upcoming events',
      icon: <Calendar className="h-8 w-8 text-blue-500" />,
      action: () => router.push('/dashboard/calendar'),
    },
    {
      title: 'Guest Management',
      description: 'Manage your guest lists',
      icon: <Users className="h-8 w-8 text-green-500" />,
      action: () => router.push('/dashboard/guests'),
    },
    {
      title: 'Registry',
      description: 'Manage your gift registry',
      icon: <Gift className="h-8 w-8 text-purple-500" />,
      action: () => router.push('/dashboard/registry'),
    },
  ];

  return (
    <AuthRedirect>
      <div className="container max-w-6xl mx-auto py-12 px-4">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Welcome, {userName}</h1>
            <p className="text-gray-500 mt-1">
              You have {weddingCount} {weddingCount === 1 ? 'wedding' : 'weddings'} | {userTier.charAt(0).toUpperCase() + userTier.slice(1)} tier
            </p>
          </div>
          <div className="flex space-x-4">
            <Button variant="outline" onClick={() => router.push('/dashboard/settings')}>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {dashboardCards.map((card, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow duration-300">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  {card.icon}
                </div>
                <CardTitle className="mt-4">{card.title}</CardTitle>
                <CardDescription>{card.description}</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button 
                  variant="default" 
                  className="w-full"
                  onClick={card.action}
                >
                  View
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </AuthRedirect>
  );
} 