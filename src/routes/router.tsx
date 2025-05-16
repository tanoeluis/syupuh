import { createBrowserRouter } from "react-router-dom";
import { lazy } from "react";
import { QueryClient } from "@tanstack/react-query";

// Layouts
import MainLayout from "@components/layouts/MainLayout";
import AdminLayout from "@components/layouts/AdminLayout";
import AuthLayout from "@components/layouts/AuthLayout"; 
import GamesLayout from "@components/layouts/GamesLayout"; 
import ToolsLayout from "@components/layouts/ToolsLayout"

// Pages
import Index from "@pages/Index";
import Home from "@pages/home";
import NotFound from "@pages/_404";

// Blog
import BlogPage from "@pages/blog/BlogPage";
import BlogPostPage from "@pages/blog/BlogPostPage";
import BlogEditorPage from "@pages/blog/BlogEditorPage";

// Templates
import TemplatesPage from "@pages/templates/TemplatesPage";
import TemplateDetailPage from "@pages/templates/TemplateDetailPage";

// Tools
import ToolsPage from "@pages/tools/ToolsPage";
import AIChatPage from "@pages/tools/AIChatPage";
import ImageOptimizerPage from "@pages/tools/ImageOptimizerPage";
import TypingSpeedPage from "@pages/tools/TypingSpeedPage";
import CalculatorPage from "@pages/tools/CalculatorPage";
import WeatherPage from "@pages/tools/WeatherPage";
import TextToSpeechPage from "@pages/tools/TextToSpeechPage";
import VideoDownloaderPage from "@pages/tools/VideoDownloaderPage";
import CSSGeneratorsPage from "@pages/tools/CSSGeneratorsPage";

// Games
import GamesPage from "@pages/games";
import SnakeGame from "@pages/games/components/SnakeGame";
import SlotMachine from "@pages/games/components/SlotMachine";
import BlockBlast from "@pages/games/components/BlockBlast";
import PuzzleGame from "@pages/games/components/PuzzleGame";
import MemoryMatch from "@pages/games/components/MemoryMatch";
import MathGame from "@pages/games/components/MathGame";


// Auth
import LoginPage from "@pages/auth/LoginPage";
import RegisterPage from "@pages/auth/RegisterPage";

// Dashboard
import DashboardPage from "@pages/dashboard/DashboardPage";

// Dashboard User Management

// Dashboard Blog Management
import BlogManagementPage from "@pages/dashboard/pages/BlogManagementPage";
import BlogEditPage from "@pages/dashboard/pages/BlogEditPage";

// Dashboard Template Management
import TemplateManagementPage from "@pages/dashboard/pages/TemplateManagementPage";
import TemplateEditPage from "@pages/dashboard/pages/TemplateEditPage";

// Dashboard Chat Admin
import ChatAdminPage from "@pages/dashboard/pages/ChatAdminPage";

// Dashboard Settings
import Settings from "@pages/settings/components/ThemeCustomizer.tsx";

// Membuat instansi QueryClient dengan konfigurasi yang benar
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60000, // 1 menit
      refetchOnWindowFocus: false
    }
  }
});

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Index />
  },
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        path: "home",
        element: <Home />
      },
      // Blog Routes
      {
        path: "blog",
        element: <BlogPage />
      },
      {
        path: "blog/:slug",
        element: <BlogPostPage />
      },
      {
        path: "blog/category/:categorySlug",
        element: <BlogPage />
      },
      {
        path: "blog/editor/:slug?",
        element: <BlogEditorPage />
      },
      {
        path: "blog/new",
        element: <BlogEditorPage />
      },
      // Templates Routes
      {
        path: "templates",
        element: <TemplatesPage />
      },
      {
        path: "templates/:id",
        element: <TemplateDetailPage />
      },
      {
        path: "templates/category/:category",
        element: <TemplatesPage />
      },
    ]
  },
  // Tools Routes
  {
    path: "/tools",
    element: <ToolsLayout />,
    children: [
      {
        index: true,
        element: <ToolsPage /> 
      },
      {
        path: "ai-chat",
        element: <AIChatPage />
      },
      {
        path: "image-optimizer",
        element: <ImageOptimizerPage />
      },
      {
        path: "typing-speed",
        element: <TypingSpeedPage />
      },
      {
        path: "calculator",
        element: <CalculatorPage />
      },
      {
        path: "weather",
        element: <WeatherPage />
      },
      {
        path: "text-to-speech",
        element: <TextToSpeechPage />
      },
      {
        path: "video-downloader",
        element: <VideoDownloaderPage />
      },
      {
        path: "css-generators",
        element: <CSSGeneratorsPage />
      }
    ]
  },
  // Games Routes
  {
    path: "/games",
    element: <GamesLayout />,
    children: [
      {
        index: true,
        element: <GamesPage /> 
      },
      {
        path: "snake",
        element: <SnakeGame />
      },
      {
        path: "slots",
        element: <SlotMachine />
      },
      {
        path: "blocks",
        element: <BlockBlast />
      },
      {
        path: "puzzle",
        element: <PuzzleGame />
      },
      {
        path: "memory",
        element: <MemoryMatch />
      },
      {
        path: "math",
        element: <MathGame />
      },
    ]
  },
  // Auth Routes
  {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      {
        path: "login",
        element: <LoginPage />
      },
      {
        path: "register",
        element: <RegisterPage />
      }
    ]
  },
  // Dashboard Routes
  {
    path: "/dashboard",
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <DashboardPage />
      },
      // Blog Management Routes
      {
        path: "blog",
        element: <BlogManagementPage />
      },
      {
        path: "blog/edit/:slug",
        element: <BlogEditPage />
      },
      {
        path: "blog/new",
        element: <BlogEditPage />
      },
      // Template Management Routes
      {
        path: "templates",
        element: <TemplateManagementPage />
      },
      {
        path: "templates/edit/:id",
        element: <TemplateEditPage />
      },
      {
        path: "templates/new",
        element: <TemplateEditPage />
      },
      // Chat Admin Route
      {
        path: "chat",
        element: <ChatAdminPage />
      },
      // settings
      {
        path: "settings",
        element: <Settings />
      }
    ]
  },
  // Not Found Route
  {
    path: "*",
    element: <NotFound />
  }
]);
