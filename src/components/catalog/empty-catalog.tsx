import { Camera, PackagePlus } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export function EmptyCatalog() {
  return (
    <div className="border-y border-border bg-card px-6 py-14 text-center">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-secondary text-primary">
        <Camera />
      </div>
      <h3 className="mt-5 font-display text-2xl">O cardápio está sendo preparado</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        Os produtos e fotografias reais aparecerão aqui assim que forem cadastrados pela
        proprietária.
      </p>
      <Button variant="outline" asChild className="mt-5">
        <Link to="/admin">
          <PackagePlus /> Acessar painel
        </Link>
      </Button>
    </div>
  );
}
