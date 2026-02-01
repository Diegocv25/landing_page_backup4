import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";

export default function ThemeToggleButton() {
  const { theme, setTheme } = useTheme();

  const handleToggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
  };

  return (
    <Button type="button" variant="outline" size="sm" onClick={handleToggle} aria-label="Alternar tema">
      Alternar tema
    </Button>
  );
}
