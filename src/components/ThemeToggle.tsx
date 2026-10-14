import { useTheme, type ThemePreference } from "../context/ThemeContext";

const META: Record<ThemePreference, { icon: string; label: string }> = {
  system: { icon: "contrast", label: "Theme: system" },
  light: { icon: "light_mode", label: "Theme: light" },
  dark: { icon: "dark_mode", label: "Theme: dark" },
};

export function ThemeToggle() {
  const { preference, cyclePreference } = useTheme();
  const { icon, label } = META[preference];

  return (
    <button
      type="button"
      onClick={cyclePreference}
      title={`${label} (click to change)`}
      aria-label={label}
      className="flex items-center justify-center w-9 h-9 border-2 border-primary text-primary hover:bg-primary-container hover:text-on-primary-container transition-colors cursor-pointer"
    >
      <span className="material-symbols-outlined text-base">{icon}</span>
    </button>
  );
}
