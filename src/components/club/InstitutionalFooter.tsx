import { Link } from "@tanstack/react-router";

export function InstitutionalFooter() {
  return (
    <footer className="mt-8 border-t border-border/60 py-5 text-center">
      <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
        <Link to="/termos" className="transition-colors hover:text-primary-glow">
          Termos de Uso
        </Link>
        <Link to="/diretrizes" className="transition-colors hover:text-primary-glow">
          Diretrizes da Comunidade
        </Link>
        <Link to="/privacidade" className="transition-colors hover:text-primary-glow">
          Política de Privacidade
        </Link>
      </nav>
      <p className="mt-3 text-xs text-muted-foreground/70">
        © {new Date().getFullYear()} Dante Clube · Universo Querido Dante
      </p>
    </footer>
  );
}
