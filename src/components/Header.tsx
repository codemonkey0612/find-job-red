import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.jpg";

export const Header = () => {
  return (
    <header className="bg-background border-b border-border">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <img src={logo} alt="Bizresearch" className="w-10 h-10 rounded" />
          <h1 className="text-2xl font-bold text-foreground">Bizresearch</h1>
        </div>
        <nav className="hidden md:flex items-center space-x-6">
          <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
            求人を探す
          </a>
          <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
            企業情報
          </a>
          <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
            お役立ち情報
          </a>
          <Button variant="outline" size="sm">
            ログイン
          </Button>
        </nav>
      </div>
    </header>
  );
};