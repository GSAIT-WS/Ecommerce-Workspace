import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { LucideIcon } from "lucide-react";

interface ProfileMenuItemProps {
  icon: LucideIcon;
  label: string;
  subtitle?: string;
  href?: string;
  onClick?: () => void;
  rightElement?: React.ReactNode;
  variant?: "default" | "danger";
}

const ProfileMenuItem = ({
  icon: Icon,
  label,
  subtitle,
  href,
  onClick,
  rightElement,
  variant = "default",
}: ProfileMenuItemProps) => {
  const content = (
    <div
      className={`flex items-center gap-4 px-4 py-3.5 transition-colors ${
        variant === "danger"
          ? "text-destructive hover:bg-destructive/5"
          : "hover:bg-muted/50"
      } ${onClick || href ? "cursor-pointer" : ""}`}
      onClick={onClick}
    >
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-full ${
          variant === "danger" ? "bg-destructive/10" : "bg-primary/10"
        }`}
      >
        <Icon
          className={`h-5 w-5 ${
            variant === "danger" ? "text-destructive" : "text-primary"
          }`}
        />
      </div>
      <div className="flex-1">
        <p
          className={`font-medium ${
            variant === "danger" ? "text-destructive" : "text-foreground"
          }`}
        >
          {label}
        </p>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {rightElement || (href && <ChevronRight className="h-5 w-5 text-muted-foreground" />)}
    </div>
  );

  if (href) {
    return <Link to={href}>{content}</Link>;
  }

  return content;
};

export default ProfileMenuItem;
