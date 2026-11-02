import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import {
  ArrowRight, Camera, Check, ChevronRight, CircleUserRound, KeyRound, LogOut,
  Mail, Phone, ShieldCheck, Trash2, UserRound,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export interface AdminProfile {
  name: string;
  phone: string;
  avatar: string | null;
}

interface AdminProfilePageProps {
  profile: AdminProfile;
  onLogout: () => void;
}

interface AdminLogoutProps {
  onLogout: () => void;
}

interface AdminProfileSettingsPageProps extends AdminProfilePageProps {
  onSave: (profile: AdminProfile) => void;
}

const ADMIN_EMAIL = "admin@gmail.com";
const ADMIN_ROLE = "Administrator";

function AdminAvatar({ profile, className = "h-20 w-20" }: {
  profile: AdminProfile;
  className?: string;
}) {
  return (
    <div className={`grid shrink-0 place-items-center overflow-hidden rounded-full bg-primary/10 font-bold text-primary ${className}`}>
      {profile.avatar
        ? <img src={profile.avatar} alt={`${profile.name} profile`} className="h-full w-full object-cover" />
        : <span aria-hidden="true">{profile.name.trim().charAt(0).toUpperCase() || "A"}</span>}
    </div>
  );
}

function ProfileAction({ icon: Icon, label, description, onClick, destructive = false }: {
  icon: typeof UserRound;
  label: string;
  description: string;
  onClick: () => void;
  destructive?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition hover:bg-muted/60 ${
        destructive ? "border-destructive/25 hover:border-destructive/40" : "border-border/80"
      }`}
    >
      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${
        destructive ? "bg-destructive/10 text-destructive" : "bg-surface-purple text-primary"
      }`}><Icon className="h-4 w-4" /></span>
      <span className="min-w-0 flex-1">
        <span className={`block text-sm font-semibold ${destructive ? "text-destructive" : ""}`}>{label}</span>
        <span className="block text-xs text-muted-foreground">{description}</span>
      </span>
      <ChevronRight className={`h-4 w-4 shrink-0 ${destructive ? "text-destructive" : "text-muted-foreground"}`} />
    </button>
  );
}

export function AdminProfilePage({ profile, onLogout }: AdminProfilePageProps) {
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteNotice, setDeleteNotice] = useState("");

  const confirmDeletePrototype = () => {
    setDeleteDialogOpen(false);
    setDeleteNotice("Account deletion is not available in this prototype. No account data was changed.");
  };

  return (
    <>
      <div className="mb-6">
        <p className="mb-1 text-xs font-bold uppercase tracking-[.18em] text-primary">Your account</p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">My Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">View your administrator profile and account information.</p>
      </div>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(280px,.85fr)]">
        <section className="rounded-2xl border border-border/80 bg-card p-5 shadow-card sm:p-7">
          <div className="flex flex-col gap-5 border-b border-border/70 pb-6 sm:flex-row sm:items-center">
            <AdminAvatar profile={profile} className="h-24 w-24 text-3xl" />
            <div className="min-w-0 flex-1">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-green px-2.5 py-1 text-[11px] font-semibold text-brand-green-deep"><ShieldCheck className="h-3.5 w-3.5" />{ADMIN_ROLE}</span>
              <h2 className="mt-2 truncate text-xl font-bold">{profile.name || "Admin"}</h2>
              <p className="break-all text-sm text-muted-foreground">{ADMIN_EMAIL}</p>
            </div>
            <Button className="w-full shrink-0 rounded-xl sm:w-auto" onClick={() => navigate("/admin-dashboard/profile/settings")}>
              <UserRound className="mr-2 h-4 w-4" />Edit Profile
            </Button>
          </div>
          <div className="grid gap-4 pt-5 sm:grid-cols-2">
            <div className="flex min-w-0 items-start gap-3 rounded-xl bg-muted/40 p-4">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div className="min-w-0"><p className="text-xs text-muted-foreground">Email address</p><p className="break-all text-sm font-semibold">{ADMIN_EMAIL}</p></div>
            </div>
            <div className="flex min-w-0 items-start gap-3 rounded-xl bg-muted/40 p-4">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div className="min-w-0"><p className="text-xs text-muted-foreground">Phone number</p><p className="break-words text-sm font-semibold">{profile.phone || "Not added"}</p></div>
            </div>
            <div className="flex min-w-0 items-start gap-3 rounded-xl bg-muted/40 p-4">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div><p className="text-xs text-muted-foreground">Account role</p><p className="text-sm font-semibold">{ADMIN_ROLE}</p></div>
            </div>
            <div className="flex min-w-0 items-start gap-3 rounded-xl bg-muted/40 p-4">
              <CircleUserRound className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div><p className="text-xs text-muted-foreground">Account information</p><p className="text-sm font-semibold">PURVITA Admin · Prototype account</p></div>
            </div>
          </div>
          <p className="mt-5 text-xs leading-relaxed text-muted-foreground">Profile details are a frontend-only preview and are not permanently saved.</p>
        </section>

        <section className="rounded-2xl border border-border/80 bg-card p-5 shadow-card sm:p-6">
          <h2 className="mb-1 text-lg font-bold">Account actions</h2>
          <p className="mb-4 text-sm text-muted-foreground">Manage your profile and account access.</p>
          <div className="space-y-3">
            <ProfileAction icon={UserRound} label="Profile Settings" description="Edit your name, phone, and avatar" onClick={() => navigate("/admin-dashboard/profile/settings")} />
            <ProfileAction icon={KeyRound} label="Change Password" description="Review the password form prototype" onClick={() => navigate("/admin-dashboard/profile/change-password")} />
            <ProfileAction icon={LogOut} label="Logout" description="End this admin dashboard session" onClick={onLogout} />
          </div>
          <div className="mt-5 border-t border-border/70 pt-5">
            <ProfileAction icon={Trash2} label="Delete Account" description="Account deletion is unavailable in this prototype" destructive onClick={() => { setDeleteNotice(""); setDeleteDialogOpen(true); }} />
            {deleteNotice && <p role="status" className="mt-3 text-xs leading-relaxed text-muted-foreground">{deleteNotice}</p>}
          </div>
        </section>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="admin-dialog rounded-2xl border-border/80 bg-card shadow-card-elevated sm:rounded-2xl" overlayClassName="bg-[#352036]/35 backdrop-blur-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete admin account?</AlertDialogTitle>
            <AlertDialogDescription>
              This prototype cannot delete accounts. Confirming will only dismiss this dialog; your admin session and account data will not be changed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeletePrototype} className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90">Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function AdminProfileSettingsPage({ profile, onSave, onLogout }: AdminProfileSettingsPageProps) {
  const navigate = useNavigate();
  const fileInput = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState(profile);
  const [notice, setNotice] = useState("");
  const [avatarError, setAvatarError] = useState("");

  const updateAvatar = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setAvatarError("Choose an image file to use as your avatar.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setAvatarError("Choose an image smaller than 2 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const avatar = reader.result;
      if (typeof avatar === "string") {
        setDraft((current) => ({ ...current, avatar }));
        setAvatarError("");
        setNotice("");
      }
    };
    reader.onerror = () => setAvatarError("The selected image could not be read. Please try another file.");
    reader.readAsDataURL(file);
  };

  const save = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSave({ ...draft, name: draft.name.trim(), phone: draft.phone.trim() });
    setNotice("Changes applied to this prototype session only; nothing was saved to an account or server.");
  };

  const cancel = () => {
    setDraft(profile);
    setNotice("");
    setAvatarError("");
    navigate("/admin-dashboard/profile");
  };

  return (
    <>
      <div className="mb-6">
        <p className="mb-1 text-xs font-bold uppercase tracking-[.18em] text-primary">Your account · local preview</p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Profile Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Update the details shown in your admin profile.</p>
      </div>
      <form onSubmit={save} className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(260px,.75fr)]">
        <section className="rounded-2xl border border-border/80 bg-card p-5 shadow-card sm:p-7">
          <h2 className="text-lg font-bold">Personal information</h2>
          <p className="mb-6 text-sm text-muted-foreground">Email and role are read-only account details.</p>
          <div className="mb-6 flex flex-col gap-4 rounded-xl border border-border/70 bg-surface-purple/40 p-4 sm:flex-row sm:items-center">
            <AdminAvatar profile={draft} className="h-16 w-16 text-xl" />
            <div className="min-w-0 flex-1"><p className="font-semibold">{draft.name || "Admin"}</p><p className="break-all text-sm text-muted-foreground">{ADMIN_EMAIL}</p></div>
            <Button type="button" variant="outline" className="w-full rounded-xl sm:w-auto" onClick={() => fileInput.current?.click()}><Camera className="mr-2 h-4 w-4" />Change picture</Button>
            <input ref={fileInput} type="file" accept="image/*" className="sr-only" aria-label="Choose profile picture" onChange={updateAvatar} />
          </div>
          {avatarError && <p role="alert" className="mb-4 text-sm text-destructive">{avatarError}</p>}
          <div className="space-y-5">
            <div className="space-y-2"><Label htmlFor="admin-profile-name">Full name</Label><Input id="admin-profile-name" autoComplete="name" required minLength={2} maxLength={80} pattern=".*\S.*" title="Enter a name that contains at least one non-space character." value={draft.name} onChange={(event) => { setDraft({ ...draft, name: event.target.value }); setNotice(""); }} className="h-11 rounded-xl" /></div>
            <div className="space-y-2"><Label htmlFor="admin-profile-phone">Phone number</Label><Input id="admin-profile-phone" type="tel" autoComplete="tel" inputMode="tel" pattern="^(?=.*\d)\+?[0-9\s()-]{7,20}$" title="Enter a valid phone number (7–20 characters with at least one digit)." value={draft.phone} onChange={(event) => { setDraft({ ...draft, phone: event.target.value }); setNotice(""); }} placeholder="Add a phone number" className="h-11 rounded-xl" /><p className="text-xs text-muted-foreground">Use 7–20 characters, including at least one digit; spaces and + ( ) - are allowed.</p></div>
            <div className="space-y-2"><Label htmlFor="admin-profile-email">Email address</Label><Input id="admin-profile-email" type="email" value={ADMIN_EMAIL} readOnly aria-readonly="true" className="h-11 rounded-xl bg-muted/40" /></div>
            <div className="space-y-2"><Label htmlFor="admin-profile-role">Administrator role</Label><Input id="admin-profile-role" value={ADMIN_ROLE} readOnly aria-readonly="true" className="h-11 rounded-xl bg-muted/40" /></div>
          </div>
        </section>
        <section className="flex flex-col rounded-2xl border border-border/80 bg-card p-5 shadow-card sm:p-6">
          <div><h2 className="text-lg font-bold">Review changes</h2><p className="mt-1 text-sm text-muted-foreground">This is a local UI preview only.</p></div>
          <div className="mt-5 rounded-xl bg-muted/40 p-4 text-sm"><p className="font-semibold">{draft.name || "Admin"}</p><p className="break-all text-xs text-muted-foreground">{ADMIN_EMAIL}</p><p className="mt-2 inline-flex items-center gap-1 text-xs text-brand-green-deep"><Check className="h-3.5 w-3.5" />{ADMIN_ROLE}</p></div>
          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">Save Changes updates this dashboard preview only. Nothing is sent to an API or saved permanently.</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row xl:mt-auto xl:pt-8">
            <Button type="submit" className="w-full rounded-xl sm:w-auto">Save Changes <ArrowRight className="ml-2 h-4 w-4" /></Button>
            <Button type="button" variant="outline" className="w-full rounded-xl sm:w-auto" onClick={cancel}>Cancel</Button>
          </div>
          {notice && <p role="status" className="mt-4 text-xs leading-relaxed text-muted-foreground">{notice}</p>}
          <button type="button" onClick={onLogout} className="mt-6 inline-flex min-h-10 items-center gap-2 self-start text-sm font-semibold text-muted-foreground transition hover:text-primary"><LogOut className="h-4 w-4" />Logout</button>
        </section>
      </form>
    </>
  );
}

export function AdminChangePasswordPage({ onLogout }: AdminLogoutProps) {
  const navigate = useNavigate();
  const [showPasswords, setShowPasswords] = useState(false);
  const [notice, setNotice] = useState("");

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const newPassword = String(form.get("new-password") ?? "");
    const confirmPassword = String(form.get("confirm-password") ?? "");
    if (newPassword !== confirmPassword) {
      setNotice("The new password and confirmation do not match.");
      return;
    }
    setNotice("Password form validated. Your password was not changed; this prototype is not connected to authentication.");
    event.currentTarget.reset();
  };

  return (
    <>
      <div className="mb-6">
        <p className="mb-1 text-xs font-bold uppercase tracking-[.18em] text-primary">Your account · local preview</p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Change Password</h1>
        <p className="mt-1 text-sm text-muted-foreground">Review password requirements in this frontend-only form.</p>
      </div>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(260px,.65fr)]">
        <form onSubmit={submit} className="rounded-2xl border border-border/80 bg-card p-5 shadow-card sm:p-7">
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-border/70 bg-surface-purple/40 p-4">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><KeyRound className="h-4 w-4" /></span>
            <div><p className="text-sm font-semibold">Password prototype</p><p className="text-xs leading-relaxed text-muted-foreground">Submitting validates the form only. No password or authentication data is changed.</p></div>
          </div>
          <div className="space-y-5">
            {[
              { id: "current-password", name: "current-password", label: "Current password", autocomplete: "current-password" },
              { id: "new-password", name: "new-password", label: "New password", autocomplete: "new-password" },
              { id: "confirm-password", name: "confirm-password", label: "Confirm new password", autocomplete: "new-password" },
            ].map((field) => (
              <div key={field.id} className="space-y-2">
                <Label htmlFor={field.id}>{field.label}</Label>
                <Input id={field.id} name={field.name} type={showPasswords ? "text" : "password"} autoComplete={field.autocomplete} required minLength={field.name === "current-password" ? undefined : 8} maxLength={128} pattern={field.name === "current-password" ? undefined : "(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}"} title={field.name === "current-password" ? undefined : "Use at least 8 characters with an uppercase letter, a lowercase letter, and a number."} onChange={() => setNotice("")} className="h-11 rounded-xl" />
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">New password: at least 8 characters, including uppercase, lowercase, and a number.</p>
          <label className="mt-4 inline-flex min-h-10 cursor-pointer items-center gap-2 text-sm text-muted-foreground"><input type="checkbox" checked={showPasswords} onChange={(event) => setShowPasswords(event.target.checked)} className="h-4 w-4 accent-primary" />Show passwords</label>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row"><Button type="submit" className="w-full rounded-xl sm:w-auto">Validate Password Form</Button><Button type="button" variant="outline" className="w-full rounded-xl sm:w-auto" onClick={() => { setNotice(""); navigate("/admin-dashboard/profile"); }}>Cancel</Button></div>
          {notice && <p role={notice.startsWith("The new password") ? "alert" : "status"} className={`mt-4 text-sm leading-relaxed ${notice.startsWith("The new password") ? "text-destructive" : "text-muted-foreground"}`}>{notice}</p>}
        </form>
        <aside className="rounded-2xl border border-border/80 bg-card p-5 shadow-card sm:p-6">
          <h2 className="text-lg font-bold">Password tips</h2>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-green-deep" />At least 8 characters</li>
            <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-green-deep" />A mix of uppercase and lowercase letters</li>
            <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-green-deep" />At least one number</li>
          </ul>
          <p className="mt-5 border-t border-border/70 pt-4 text-xs leading-relaxed text-muted-foreground">This page does not store, send, or update your password.</p>
          <button type="button" onClick={onLogout} className="mt-5 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-muted-foreground transition hover:text-primary"><LogOut className="h-4 w-4" />Logout</button>
        </aside>
      </div>
    </>
  );
}
