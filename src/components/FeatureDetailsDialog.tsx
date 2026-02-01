import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight, ExternalLink } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export type FeatureDetails = {
  icon: LucideIcon;
  title: string;
  short: string;
  highlight?: string;
  bullets: string[];
  result: string;
};

type FeatureDetailsDialogProps = {
  feature: FeatureDetails;
};

export default function FeatureDetailsDialog({ feature }: FeatureDetailsDialogProps) {
  const Icon = feature.icon;
  const location = useLocation();
  const from = `${location.pathname}${location.hash || "#funcionalidades"}`;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="mt-5 inline-flex items-center justify-center gap-2 text-sm font-medium text-primary hover:underline underline-offset-4"
          aria-label={`Ver detalhes de ${feature.title}`}
        >
          Ver Detalhes <ArrowRight className="h-4 w-4" />
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-[720px]">
        <DialogHeader className="space-y-3">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-xl md:text-2xl">{feature.title}</DialogTitle>
              {feature.highlight ? (
                <DialogDescription className="text-primary">{feature.highlight}</DialogDescription>
              ) : null}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5">
          <ul className="space-y-3">
            {feature.bullets.map((item) => (
              <li key={item} className="flex gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none text-primary" />
                <span className="text-sm text-muted-foreground">{item}</span>
              </li>
            ))}
          </ul>

          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
            <p className="text-sm text-foreground">
              <span className="font-semibold text-primary">Resultado:</span> {feature.result}
            </p>
          </div>

          <div className="flex items-center justify-end gap-2">
            <DialogClose asChild>
              <Button type="button" variant="outline" size="sm">
                Fechar
              </Button>
            </DialogClose>

            <DialogClose asChild>
              <Button asChild type="button" size="sm">
                <Link to="/funcionalidades" state={{ from }} aria-label="Ver todas as funcionalidades">
                  Ver Todas <ExternalLink className="h-4 w-4" />
                </Link>
              </Button>
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
