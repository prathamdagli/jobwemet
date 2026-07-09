import { createBrowserRouter } from 'react-router-dom'
import LandingPage from '../pages/Landing/LandingPage'
import DashboardPage from '../pages/Dashboard/DashboardPage'
import ResumePage from '../pages/Resume/ResumePage'
import JobsPage from '../pages/Jobs/JobsPage'
import SkillsPage from '../pages/Skills/SkillsPage'
import CoursesPage from '../pages/Courses/CoursesPage'
import RoadmapPage from '../pages/Roadmap/RoadmapPage'
import ProfilePage from '../pages/Profile/ProfilePage'
import SettingsPage from '../pages/Settings/SettingsPage'
import NotFoundPage from '../pages/NotFound/NotFoundPage'
import LoginPage from '../pages/Auth/LoginPage'
import RegisterPage from '../pages/Auth/RegisterPage'
import ForgotPasswordPage from '../pages/Auth/ForgotPasswordPage'
import AuthLayout from '../layouts/AuthLayout'
import DashboardLayout from '../layouts/DashboardLayout'
import ProtectedRoute from '../router/ProtectedRoute'
import GuestRoute from '../components/GuestRoute'

export const router = createBrowserRouter([
  { path: '/', element: <LandingPage /> },
  {
    element: <AuthLayout />,
    children: [
      {
        element: <GuestRoute />,
        children: [
          { path: '/login', element: <LoginPage /> },
          { path: '/register', element: <RegisterPage /> },
          { path: '/forgot-password', element: <ForgotPasswordPage /> },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { path: '/dashboard', element: <DashboardPage /> },
          { path: '/resume', element: <ResumePage /> },
          { path: '/jobs', element: <JobsPage /> },
          { path: '/skills', element: <SkillsPage /> },
          { path: '/courses', element: <CoursesPage /> },
          { path: '/roadmap', element: <RoadmapPage /> },
          { path: '/profile', element: <ProfilePage /> },
          { path: '/settings', element: <SettingsPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])
