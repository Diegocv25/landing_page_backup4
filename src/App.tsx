import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Cadastro from "./pages/Cadastro";
import Planos from "./pages/Planos";
import PagamentoRetorno from "./pages/PagamentoRetorno";
import AllFeatures from "./pages/AllFeatures";
import NotFound from "./pages/NotFound";
import VerificarEmail from "./pages/VerificarEmail";
import CriarSenha from "./pages/CriarSenha";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/planos" element={<Planos />} />
          <Route path="/pagamento/retorno" element={<PagamentoRetorno />} />
          <Route path="/funcionalidades" element={<AllFeatures />} />
          <Route path="/verificar-email" element={<VerificarEmail />} />
          <Route path="/criar-senha" element={<CriarSenha />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
