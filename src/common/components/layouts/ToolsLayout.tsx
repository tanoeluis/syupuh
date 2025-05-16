import { Outlet } from "react-router-dom";
import {Breadcrumb} from "../elements/Breadcrumb";

export default function ToolsLayout() {
  return (
    <div className="h-screen w-full">
      <div className="container mx-auto px-4 py-8">
        <main>
          <Breadcrumb />
          <Outlet />
        </main>
      </div>
    </div>
  );
}
