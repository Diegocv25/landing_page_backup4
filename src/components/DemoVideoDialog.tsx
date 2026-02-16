import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DemoVideoDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="lg" variant="outline" className="text-base px-8">
          <Play className="mr-2 w-4 h-4" />
          Ver Demonstração
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-[720px]">
        <DialogHeader>
          <DialogTitle>Demonstração do Sistema de Gestão</DialogTitle>
          <DialogDescription>
            Visão rápida das principais funcionalidades para atendimento, operação e controle financeiro.
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-hidden rounded-xl border border-primary/20 bg-black">
          <video
            src="/demo-nexus.mp4?v=20260216-1825"
            controls
            autoPlay
            muted
            playsInline
            preload="metadata"
            className="w-full aspect-video"
          >
            Seu navegador não suporta vídeo HTML5.
          </video>
        </div>
      </DialogContent>
    </Dialog>
  );
}
