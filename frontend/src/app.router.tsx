import { createBrowserRouter } from 'react-router';
import { AuthGuardian } from './features/auth/components/AuthGuardian';
import { LoginPage } from './features/auth/pages/login/LoginPage';
import { AppLayout } from './layouts/AppLayout';
import { MainLayout } from './layouts/MainLayout';

export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        element: <AuthGuardian />,
        children: [
          {
            path: '/',
            element: <AppLayout />,
            children: [],
          },
        ],
      },
    ],
  },
]);
