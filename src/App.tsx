import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ChatBot } from "@/components/chat/ChatBot";

/* ── Public pages ─────────────────────── */
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import About from "./pages/About";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

/* ── Protected pages (tools) ──────────── */
import Editor from "./pages/Editor";
import Merge from "./pages/Merge";
import AlternateMix from "./pages/AlternateMix";
import Organize from "./pages/Organize";
import Compress from "./pages/Compress";
import ExtractPages from "./pages/ExtractPages";
import DeletePages from "./pages/DeletePages";
import FillSign from "./pages/FillSign";
import CreateForms from "./pages/CreateForms";
import Watermark from "./pages/Watermark";
import Protect from "./pages/Protect";
import Unlock from "./pages/Unlock";
import Ocr from "./pages/Ocr";
import Tools from "./pages/Tools";
import SplitPdf from "./pages/SplitPdf";
import RotatePages from "./pages/RotatePages";
import AddPageNumbers from "./pages/AddPageNumbers";
import FlattenPdf from "./pages/FlattenPdf";

const queryClient = new QueryClient();

/* Helper – wraps a page in ProtectedRoute */
const P = ({ element }: { element: React.ReactNode }) => (
  <ProtectedRoute>{element}</ProtectedRoute>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* ── Public ── */}
            <Route path="/"               element={<Index />} />
            <Route path="/home"           element={<Index />} />
            <Route path="/login"          element={<Login />} />
            <Route path="/register"       element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/about"          element={<About />} />
            <Route path="/contact"        element={<Contact />} />

            {/* ── Protected (require login) ── */}
            <Route path="/tools"          element={<P element={<Tools />} />} />
            <Route path="/editor"         element={<P element={<Editor />} />} />
            <Route path="/merge"          element={<P element={<Merge />} />} />
            <Route path="/alternate-mix"  element={<P element={<AlternateMix />} />} />
            <Route path="/organize"       element={<P element={<Organize />} />} />
            <Route path="/compress"       element={<P element={<Compress />} />} />
            <Route path="/extract"        element={<P element={<ExtractPages />} />} />
            <Route path="/delete-pages"   element={<P element={<DeletePages />} />} />
            <Route path="/fill-sign"      element={<P element={<FillSign />} />} />
            <Route path="/create-forms"   element={<P element={<CreateForms />} />} />
            <Route path="/watermark"      element={<P element={<Watermark />} />} />
            <Route path="/protect"        element={<P element={<Protect />} />} />
            <Route path="/unlock"         element={<P element={<Unlock />} />} />
            <Route path="/ocr"            element={<P element={<Ocr />} />} />
            <Route path="/split"          element={<P element={<SplitPdf />} />} />
            <Route path="/rotate"         element={<P element={<RotatePages />} />} />
            <Route path="/page-numbers"   element={<P element={<AddPageNumbers />} />} />
            <Route path="/flatten"        element={<P element={<FlattenPdf />} />} />

            {/* ── Fallback ── */}
            <Route path="*"               element={<NotFound />} />
          </Routes>

          {/* AI assistant – rendered only when user is logged in (ChatBot handles this internally) */}
          <ChatBot />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
