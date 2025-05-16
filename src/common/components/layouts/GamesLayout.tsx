// @components/layouts/GamesLayout.tsx
import { Outlet, Link } from "react-router-dom";
import { Button } from "@components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Breadcrumb } from "../elements/Breadcrumb";

export default function GamesLayout() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Tombol back hanya muncul di halaman game 
        {location.pathname !== '/games' && (
          <Button asChild variant="ghost" className="mb-4">
            <Link to="/games">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Games
            </Link>
          </Button>
        )}
        */}
        <main>
          <Breadcrumb />
          <Outlet />
        </main>
      </div>
    </div>
  );
}
