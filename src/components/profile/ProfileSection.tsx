interface ProfileSectionProps {
  title?: string;
  children: React.ReactNode;
}

const ProfileSection = ({ title, children }: ProfileSectionProps) => {
  return (
    <div className="mb-4">
      {title && (
        <h3 className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </h3>
      )}
      <div className="overflow-hidden rounded-xl bg-card shadow-sm">
        {children}
      </div>
    </div>
  );
};

export default ProfileSection;
