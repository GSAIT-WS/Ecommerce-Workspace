import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  Activity, AlertTriangle, ArrowRight, ArrowUpRight, Bell, Boxes, Check, ChevronDown,
  CircleDollarSign, CreditCard, LayoutDashboard, Leaf, LogOut, Menu, Package, Pencil,
  Plus, Search, Settings, ShoppingBag, ShoppingCart, Users, X,
} from "lucide-react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip,
  XAxis, YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { usePageTitle } from "@/hooks/usePageTitle";
import {
  adminCustomers, adminNotifications, adminOrders, adminPayments, adminProducts,
  salesByRange, type AdminNotification, type AdminOrder, type AdminProduct,
} from "@/data/adminMockData";
import {
  demoAdminOrderDataSource,
  formatAdminOrderStatus,
  formatAdminPaymentStatus,
  loadAdminOrderPage,
  normalizeAdminOrderPageParams,
  type AdminOrderDataSource,
  type AdminOrderDetail,
  type AdminOrderSummary,
  type AdminOrderStatus,
} from "@/services/adminOrderData";

const ADMIN_AUTH_KEY = "purvita_admin_authenticated";
const currency = (amount: number) => `₹${amount.toLocaleString("en-IN")}`;
const navItems = [
  { title: "Overview", path: "/admin-dashboard", icon: LayoutDashboard },
  { title: "Orders & Tracking", path: "/admin-dashboard/orders", icon: ShoppingBag },
  { title: "Products", path: "/admin-dashboard/products", icon: Package },
  { title: "Inventory", path: "/admin-dashboard/inventory", icon: Boxes },
  { title: "Sales & Analytics", path: "/admin-dashboard/analytics", icon: Activity },
  { title: "Customers", path: "/admin-dashboard/customers", icon: Users },
  { title: "Payments", path: "/admin-dashboard/payments", icon: CreditCard },
  { title: "Notifications", path: "/admin-dashboard/notifications", icon: Bell },
  { title: "Settings", path: "/admin-dashboard/settings", icon: Settings },
];
const orderStatuses: AdminOrderStatus[] = [
  "pending", "confirmed", "packed", "shipped", "delivered", "cancelled",
];

function StatusPill({ value }: { value: string }) {
  const theme = value === "Paid" || value === "Delivered" || value === "In stock"
    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
    : value === "Pending" || value === "Processing" || value === "Low stock"
      ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
      : value === "Refunded"
        ? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
        : "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300";
  return <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${theme}`}>{value}</span>;
}

function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-2xl border border-border/80 bg-card p-5 shadow-sm sm:p-6 ${className}`}>{children}</section>;
}

function PageHeading({ eyebrow, title, description, actions }: {
  eyebrow: string; title: string; description: string; actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <p className="mb-1 text-xs font-bold uppercase tracking-[.18em] text-primary">{eyebrow}</p>
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      {actions}
    </div>
  );
}

function EmptyState({ title }: { title: string }) {
  return <div className="py-12 text-center text-sm text-muted-foreground">{title}</div>;
}

function TableFrame({ children }: { children: ReactNode }) {
  return <div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm">{children}</table></div>;
}

function TableHead({ children }: { children: ReactNode }) {
  return <thead><tr className="border-b border-border text-xs font-semibold uppercase tracking-wide text-muted-foreground">{children}</tr></thead>;
}

function Cell({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <td className={`px-3 py-3.5 ${className}`}>{children}</td>;
}

function SearchBox({ value, onChange, placeholder = "Search..." }: {
  value: string; onChange: (value: string) => void; placeholder?: string;
}) {
  return (
    <div className="relative w-full sm:w-64">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="h-10 rounded-xl pl-9" />
    </div>
  );
}

function FilterSelect({ value, onChange, options, label }: {
  value: string; onChange: (value: string) => void; options: string[]; label: string;
}) {
  return (
    <label className="relative block min-w-36">
      <span className="sr-only">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="h-10 w-full appearance-none rounded-xl border border-input bg-background px-3 pr-9 text-sm outline-none focus:ring-2 focus:ring-ring">
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
    </label>
  );
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return <div className="rounded-xl border border-border bg-card px-3 py-2 text-xs shadow-lg"><p className="font-semibold">{label}</p>{payload.map((item) => <p key={item.name} className="mt-1 text-muted-foreground">{item.name === "revenue" ? "Revenue" : "Orders"}: {item.name === "revenue" ? currency(item.value) : item.value}</p>)}</div>;
}

function Overview({ orders, products, onNavigate }: {
  orders: AdminOrder[]; products: AdminProduct[]; onNavigate: (path: string) => void;
}) {
  const [range, setRange] = useState<keyof typeof salesByRange>("7 days");
  const chartData = salesByRange[range];
  const revenue = orders.reduce((total, order) => total + order.total, 0);
  const pending = orders.filter((order) => order.status !== "Delivered").length;
  const completed = orders.filter((order) => order.status === "Delivered").length;
  const lowStock = products.filter((product) => product.stock <= 8);
  const metrics = [
    { title: "Demo revenue", value: currency(revenue), change: "+12.8%", icon: CircleDollarSign, tone: "bg-amber-100 text-amber-800" },
    { title: "Total orders", value: orders.length.toLocaleString(), change: "+8.2%", icon: ShoppingCart, tone: "bg-sky-100 text-sky-800" },
    { title: "Pending orders", value: String(pending), change: "Needs attention", icon: Package, tone: "bg-orange-100 text-orange-800" },
    { title: "Completed orders", value: String(completed), change: "This sample", icon: Check, tone: "bg-emerald-100 text-emerald-800" },
    { title: "Low stock items", value: String(lowStock.length), change: "Review inventory", icon: AlertTriangle, tone: "bg-rose-100 text-rose-800" },
  ];
  return (
    <>
      <PageHeading eyebrow="Store pulse · demo data" title="Good morning, Admin" description="Here’s what’s happening across your PURVITA store." actions={<span className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">DEMO DATA · NOT LIVE</span>} />
      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {metrics.map((metric) => <Panel key={metric.title} className="p-4"><div className="flex items-start justify-between"><div><p className="text-xs font-medium text-muted-foreground">{metric.title}</p><p className="mt-2 text-2xl font-extrabold">{metric.value}</p><p className="mt-1 text-xs text-muted-foreground">{metric.change}</p></div><span className={`rounded-xl p-2 ${metric.tone}`}><metric.icon className="h-4 w-4" /></span></div></Panel>)}
      </div>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(280px,1fr)]">
        <Panel>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-bold">Sales overview</h2><p className="text-xs text-muted-foreground">Illustrative revenue trend · sample values</p></div><FilterSelect label="Chart time range" value={range} onChange={(value) => setRange(value as keyof typeof salesByRange)} options={["7 days", "30 days", "12 months"]} /></div>
          <div className="h-64 w-full"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}><defs><linearGradient id="adminRevenueFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="hsl(39 56% 51%)" stopOpacity={0.28} /><stop offset="95%" stopColor="hsl(39 56% 51%)" stopOpacity={0.01} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" /><XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} /><YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} tickFormatter={(value: number) => `${Math.round(value / 1000)}k`} /><Tooltip content={<ChartTooltip />} /><Area type="monotone" dataKey="revenue" stroke="hsl(39 56% 45%)" strokeWidth={3} fill="url(#adminRevenueFill)" /></AreaChart></ResponsiveContainer></div>
        </Panel>
        <Panel>
          <div className="mb-4 flex items-center justify-between"><div><h2 className="text-lg font-bold">Low-stock alerts</h2><p className="text-xs text-muted-foreground">Sample inventory needing review</p></div><AlertTriangle className="h-5 w-5 text-amber-600" /></div>
          <div className="space-y-3">{lowStock.slice(0, 4).map((product) => <div key={product.id} className="flex items-center gap-3 rounded-xl bg-muted/50 p-3"><img src={product.image} alt="" className="h-10 w-10 rounded-lg object-cover" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{product.name}</p><p className="text-xs text-muted-foreground">{product.stock} units remaining</p></div><StatusPill value="Low stock" /></div>)}</div>
          <Button variant="outline" className="mt-4 w-full rounded-xl" onClick={() => onNavigate("/admin-dashboard/inventory")}>Review inventory <ArrowRight className="ml-1 h-4 w-4" /></Button>
        </Panel>
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(280px,1fr)]">
        <Panel>
          <div className="mb-4 flex items-center justify-between"><div><h2 className="text-lg font-bold">Recent orders</h2><p className="text-xs text-muted-foreground">Latest sample orders</p></div><Button variant="ghost" size="sm" onClick={() => onNavigate("/admin-dashboard/orders")}>All orders <ArrowRight className="ml-1 h-4 w-4" /></Button></div>
          <TableFrame><TableHead><th className="px-3 py-3">Order</th><th className="px-3 py-3">Customer</th><th className="px-3 py-3">Total</th><th className="px-3 py-3">Status</th></TableHead><tbody>{orders.slice(0, 4).map((order) => <tr key={order.id} className="border-b border-border/70 last:border-0"><Cell className="font-semibold">{order.id}</Cell><Cell>{order.customer}</Cell><Cell>{currency(order.total)}</Cell><Cell><StatusPill value={order.status} /></Cell></tr>)}</tbody></TableFrame>
        </Panel>
        <Panel>
          <div className="mb-4"><h2 className="text-lg font-bold">Best sellers</h2><p className="text-xs text-muted-foreground">Demo units sold this month</p></div>
          <div className="space-y-4">{products.slice(0, 4).sort((a, b) => b.price - a.price).map((product, index) => <div key={product.id} className="flex items-center gap-3"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">{index + 1}</span><img src={product.image} alt="" className="h-10 w-10 rounded-lg object-cover" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{product.name}</p><p className="text-xs text-muted-foreground">{(76 - index * 13).toString()} sold · {currency(product.price)}</p></div><ArrowUpRight className="h-4 w-4 text-emerald-600" /></div>)}</div>
        </Panel>
      </div>
      <Panel className="mt-5"><h2 className="mb-3 text-lg font-bold">Quick actions</h2><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{navItems.slice(1, 5).map((item) => <button key={item.path} onClick={() => onNavigate(item.path)} className="flex items-center gap-3 rounded-xl border border-border p-3 text-left transition hover:border-primary/40 hover:bg-primary/5"><item.icon className="h-5 w-5 text-primary" /><span className="text-sm font-semibold">{item.title}</span><ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" /></button>)}</div></Panel>
    </>
  );
}

function OrdersPage({ dataSource }: { dataSource: AdminOrderDataSource }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All statuses");
  const [pageIndex, setPageIndex] = useState(0);
  const [reloadVersion, setReloadVersion] = useState(0);
  const [page, setPage] = useState<Awaited<ReturnType<AdminOrderDataSource["listOrders"]>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<AdminOrderSummary | null>(null);
  const [details, setDetails] = useState<AdminOrderDetail | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const pageSize = normalizeAdminOrderPageParams().limit;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    void loadAdminOrderPage(dataSource, { limit: pageSize, offset: pageIndex * pageSize }).then((result) => {
      if (cancelled) return;
      setLoading(false);
      if (result.ok === false) {
        setError(result.error);
        setPage(null);
        return;
      }
      setPage(result.page);
    });
    return () => { cancelled = true; };
  }, [dataSource, pageIndex, pageSize, reloadVersion]);

  const openDetails = async (order: AdminOrderSummary) => {
    setSelected(order);
    setDetails(null);
    setDetailsError(null);
    setDetailsLoading(true);
    try {
      const result = await dataSource.getOrderDetails(order.id);
      if (!result) {
        setDetailsError("Order details were not found.");
        return;
      }
      setDetails(result);
    } catch (cause) {
      setDetailsError(cause instanceof Error ? cause.message : "Unable to load order details.");
    } finally {
      setDetailsLoading(false);
    }
  };

  const visible = (page?.items ?? []).filter((order) =>
    (status === "All statuses" || order.status === status) &&
    `${order.order_number} ${order.customer.full_name} ${order.customer.email ?? ""}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  const updateStatus = (next: AdminOrderStatus) => {
    if (!selected || !page) return;
    const updated = { ...selected, status: next };
    setPage({ ...page, items: page.items.map((order) => order.id === selected.id ? updated : order) });
    setSelected(updated);
    setDetails((current) => current ? { ...current, status: next } : current);
  };

  const closeDetails = () => {
    setSelected(null);
    setDetails(null);
    setDetailsError(null);
  };
  return (
    <>
      <PageHeading eyebrow="Fulfillment · demo data" title="Orders & Tracking" description="Preview orders through the admin order data interface. Records are demo data, not live customer orders." />
      <Panel>
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><SearchBox value={search} onChange={setSearch} placeholder="Search order or customer" /><FilterSelect label="Filter orders by status" value={status} onChange={setStatus} options={["All statuses", ...orderStatuses]} /></div>
        {loading ? <EmptyState title="Loading demo orders…" /> : error ? <div role="alert" className="py-8 text-center text-sm text-destructive"><p>{error}</p><Button variant="outline" className="mt-3 rounded-xl" onClick={() => setReloadVersion((value) => value + 1)}>Retry</Button></div> : visible.length ? <TableFrame><TableHead><th className="px-3 py-3">Order ID / Date</th><th className="px-3 py-3">Customer</th><th className="px-3 py-3">Items</th><th className="px-3 py-3">Total</th><th className="px-3 py-3">Payment</th><th className="px-3 py-3">Order status</th><th className="px-3 py-3">Details</th></TableHead><tbody>{visible.map((order) => <tr key={order.id} className="border-b border-border/70 last:border-0"><Cell><p className="font-semibold">{order.order_number}</p><p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</p></Cell><Cell><p>{order.customer.full_name}</p><p className="text-xs text-muted-foreground">{order.customer.email ?? "Email not available"}</p></Cell><Cell className="max-w-48 truncate">{order.items_summary || "No item details"}</Cell><Cell className="font-semibold">{currency(order.total_amount)}</Cell><Cell><StatusPill value={formatAdminPaymentStatus(order.payment_status)} /></Cell><Cell><StatusPill value={formatAdminOrderStatus(order.status)} /></Cell><Cell><Button variant="outline" size="sm" className="rounded-lg" onClick={() => void openDetails(order)}>View</Button></Cell></tr>)}</tbody></TableFrame> : <EmptyState title={page?.total ? "No orders on this page match your search." : "No orders are available."} />}
        {!loading && !error && page && page.total > 0 && <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground"><span>Showing {page.offset + 1}–{page.offset + page.items.length} of {page.total}</span><div className="flex gap-2"><Button variant="outline" size="sm" className="rounded-lg" disabled={pageIndex === 0} onClick={() => setPageIndex((index) => Math.max(0, index - 1))}>Previous</Button><Button variant="outline" size="sm" className="rounded-lg" disabled={page.offset + page.items.length >= page.total} onClick={() => setPageIndex((index) => index + 1)}>Next</Button></div></div>}
      </Panel>
      <Dialog open={!!selected} onOpenChange={(open) => !open && closeDetails()}><DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl"><DialogHeader><DialogTitle>Order {selected?.order_number}</DialogTitle><DialogDescription>Demo order detail · status changes are local to this preview.</DialogDescription></DialogHeader>{selected && <div className="space-y-4 text-sm"><div className="grid grid-cols-2 gap-3 rounded-xl bg-muted/50 p-4"><div><p className="text-xs text-muted-foreground">Customer</p><p className="font-semibold">{selected.customer.full_name}</p><p>{selected.customer.email ?? "Email not available"}</p></div><div><p className="text-xs text-muted-foreground">Order total</p><p className="font-semibold">{currency(selected.total_amount)}</p><p>{new Date(selected.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</p></div></div>{detailsLoading ? <p className="text-muted-foreground">Loading order details…</p> : detailsError ? <p role="alert" className="text-destructive">{detailsError}</p> : <div><p className="text-xs text-muted-foreground">Items</p>{details?.items.length ? <ul className="mt-1 space-y-1">{details.items.map((item) => <li key={item.id} className="font-medium">{item.name_snapshot} × {item.quantity} · {currency(item.line_total)}</li>)}</ul> : <p className="mt-1 font-medium">{selected.items_summary || "No item details available."}</p>}</div>}<div><Label htmlFor="order-status">Update order status (demo)</Label><select id="order-status" value={selected.status} onChange={(event) => updateStatus(event.target.value as AdminOrderStatus)} className="mt-1 h-10 w-full rounded-xl border border-input bg-background px-3">{orderStatuses.map((item) => <option key={item} value={item}>{formatAdminOrderStatus(item)}</option>)}</select></div><div className="rounded-xl border border-dashed border-border p-4"><p className="mb-1 font-semibold">Tracking information · demo placeholder</p><p className="text-muted-foreground">Tracking information is not included in this order data preview.</p></div><p>Payment: <StatusPill value={formatAdminPaymentStatus(selected.payment_status)} /></p></div>}<DialogFooter><Button variant="outline" className="rounded-xl" onClick={closeDetails}>Close</Button></DialogFooter></DialogContent></Dialog>
    </>
  );
}

function ProductsPage({ products, setProducts }: { products: AdminProduct[]; setProducts: (products: AdminProduct[]) => void }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All categories");
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [preview, setPreview] = useState<AdminProduct | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [draft, setDraft] = useState({ name: "", category: "Healthy Foods", price: "", stock: "" });
  const categories = ["All categories", ...Array.from(new Set(products.map((product) => product.category)))];
  const visible = products.filter((product) => (category === "All categories" || product.category === category) && `${product.name} ${product.category}`.toLowerCase().includes(search.toLowerCase()));
  const startAdd = () => { setEditing(null); setDraft({ name: "", category: "Healthy Foods", price: "", stock: "" }); setFormOpen(true); };
  const startEdit = (product: AdminProduct) => { setEditing(product); setDraft({ name: product.name, category: product.category, price: String(product.price), stock: String(product.stock) }); setFormOpen(true); };
  const saveProduct = (event: FormEvent) => {
    event.preventDefault();
    const product: AdminProduct = { id: editing?.id ?? `PRD-${Date.now().toString().slice(-5)}`, name: draft.name.trim(), category: draft.category.trim(), price: Number(draft.price), stock: Number(draft.stock), image: editing?.image ?? adminProducts[0].image };
    if (editing) setProducts(products.map((item) => item.id === editing.id ? product : item));
    else setProducts([product, ...products]);
    setFormOpen(false);
  };
  const remove = (product: AdminProduct) => {
    if (window.confirm(`Delete "${product.name}" from this local demo list?`)) setProducts(products.filter((item) => item.id !== product.id));
  };
  return (
    <>
      <PageHeading eyebrow="Catalog · demo data" title="Products" description="Manage the sample catalog. Changes are not saved to a database." actions={<Button className="rounded-xl" onClick={startAdd}><Plus className="mr-1 h-4 w-4" /> Add product</Button>} />
      <Panel>
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><SearchBox value={search} onChange={setSearch} placeholder="Search products" /><FilterSelect label="Filter products by category" value={category} onChange={setCategory} options={categories} /></div>
        {visible.length ? <TableFrame><TableHead><th className="px-3 py-3">Product</th><th className="px-3 py-3">Category</th><th className="px-3 py-3">Price</th><th className="px-3 py-3">Availability</th><th className="px-3 py-3">Actions</th></TableHead><tbody>{visible.map((product) => <tr key={product.id} className="border-b border-border/70 last:border-0"><Cell><button className="flex items-center gap-3 text-left" onClick={() => setPreview(product)}><img src={product.image} alt="" className="h-11 w-11 rounded-xl object-cover" /><span><span className="block font-semibold">{product.name}</span><span className="text-xs text-muted-foreground">{product.id}</span></span></button></Cell><Cell>{product.category}</Cell><Cell className="font-semibold">{currency(product.price)}</Cell><Cell><StatusPill value={product.stock <= 8 ? "Low stock" : "In stock"} /><p className="mt-1 text-xs text-muted-foreground">{product.stock} units</p></Cell><Cell><div className="flex gap-2"><Button variant="outline" size="sm" className="rounded-lg" onClick={() => startEdit(product)} aria-label={`Edit ${product.name}`}><Pencil className="h-4 w-4" /></Button><Button variant="ghost" size="sm" className="rounded-lg text-destructive hover:text-destructive" onClick={() => remove(product)} aria-label={`Delete ${product.name}`}><X className="h-4 w-4" /></Button></div></Cell></tr>)}</tbody></TableFrame> : <EmptyState title="No products match your filters." />}
      </Panel>
      <Dialog open={formOpen} onOpenChange={setFormOpen}><DialogContent><DialogHeader><DialogTitle>{editing ? "Edit product" : "Add a product"}</DialogTitle><DialogDescription>Prototype-only catalog changes; no database is connected.</DialogDescription></DialogHeader><form id="product-form" onSubmit={saveProduct} className="space-y-4"><div><Label htmlFor="product-name">Product name</Label><Input id="product-name" required value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} className="mt-1 rounded-xl" /></div><div><Label htmlFor="product-category">Category</Label><Input id="product-category" required value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })} className="mt-1 rounded-xl" /></div><div className="grid grid-cols-2 gap-3"><div><Label htmlFor="product-price">Price (₹)</Label><Input id="product-price" type="number" min="0" required value={draft.price} onChange={(event) => setDraft({ ...draft, price: event.target.value })} className="mt-1 rounded-xl" /></div><div><Label htmlFor="product-stock">Stock</Label><Input id="product-stock" type="number" min="0" required value={draft.stock} onChange={(event) => setDraft({ ...draft, stock: event.target.value })} className="mt-1 rounded-xl" /></div></div><div className="rounded-xl bg-muted/50 p-3 text-xs text-muted-foreground">Preview image uses a PURVITA sample product photo.</div></form><DialogFooter><Button variant="outline" className="rounded-xl" onClick={() => setFormOpen(false)}>Cancel</Button><Button form="product-form" type="submit" className="rounded-xl">{editing ? "Save changes" : "Add product"}</Button></DialogFooter></DialogContent></Dialog>
      <Dialog open={!!preview} onOpenChange={(open) => !open && setPreview(null)}><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>Product preview</DialogTitle><DialogDescription>Sample catalog item</DialogDescription></DialogHeader>{preview && <div className="space-y-3"><img src={preview.image} alt={preview.name} className="h-48 w-full rounded-xl object-cover" /><h3 className="font-bold">{preview.name}</h3><p className="text-sm text-muted-foreground">{preview.category} · {preview.id}</p><p className="text-lg font-bold text-primary">{currency(preview.price)}</p><StatusPill value={preview.stock <= 8 ? "Low stock" : "In stock"} /></div>}<DialogFooter><Button variant="outline" onClick={() => setPreview(null)} className="rounded-xl">Close</Button></DialogFooter></DialogContent></Dialog>
    </>
  );
}

function InventoryPage({ products, setProducts }: { products: AdminProduct[]; setProducts: (products: AdminProduct[]) => void }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All stock");
  const visible = products.filter((item) => (filter === "All stock" || (filter === "Low stock" ? item.stock <= 8 : item.stock > 8)) && item.name.toLowerCase().includes(search.toLowerCase()));
  const adjust = (id: string, delta: number) => setProducts(products.map((product) => product.id === id ? { ...product, stock: Math.max(0, product.stock + delta) } : product));
  return <><PageHeading eyebrow="Stock control · demo data" title="Inventory" description="Review sample stock levels and make local adjustments." /><Panel><div className="mb-5 flex flex-col gap-3 sm:flex-row sm:justify-between"><SearchBox value={search} onChange={setSearch} placeholder="Search inventory" /><FilterSelect label="Filter stock level" value={filter} onChange={setFilter} options={["All stock", "Low stock", "In stock"]} /></div>{visible.length ? <TableFrame><TableHead><th className="px-3 py-3">Product</th><th className="px-3 py-3">SKU</th><th className="px-3 py-3">Current stock</th><th className="px-3 py-3">Stock status</th><th className="px-3 py-3">Adjust (demo)</th></TableHead><tbody>{visible.map((product) => <tr key={product.id} className="border-b border-border/70 last:border-0"><Cell><div className="flex items-center gap-3"><img src={product.image} alt="" className="h-10 w-10 rounded-lg object-cover" /><span className="font-semibold">{product.name}</span></div></Cell><Cell>{product.id}</Cell><Cell className="font-bold">{product.stock} units</Cell><Cell><StatusPill value={product.stock <= 8 ? "Low stock" : "In stock"} />{product.stock <= 8 && <p className="mt-1 text-xs text-muted-foreground">Restock suggested</p>}</Cell><Cell><div className="flex items-center gap-2"><Button variant="outline" size="sm" className="h-8 w-8 rounded-lg p-0" onClick={() => adjust(product.id, -1)} aria-label={`Remove one ${product.name} from stock`}>−</Button><Button variant="outline" size="sm" className="h-8 w-8 rounded-lg p-0" onClick={() => adjust(product.id, 1)} aria-label={`Add one ${product.name} to stock`}><Plus className="h-4 w-4" /></Button></div></Cell></tr>)}</tbody></TableFrame> : <EmptyState title="No inventory items match your filters." />}</Panel></>;
}

function AnalyticsPage() {
  const [range, setRange] = useState<keyof typeof salesByRange>("30 days");
  const data = salesByRange[range];
  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
  const totalOrders = data.reduce((sum, item) => sum + item.orders, 0);
  const bestSellers = adminProducts.slice(0, 5).map((product, index) => ({ ...product, units: 156 - index * 22 }));
  return <><PageHeading eyebrow="Performance · demo data" title="Sales & Analytics" description="Illustrative store performance based entirely on sample values." actions={<FilterSelect label="Analytics date range" value={range} onChange={(value) => setRange(value as keyof typeof salesByRange)} options={["7 days", "30 days", "12 months"]} />} /><div className="mb-5 grid gap-4 sm:grid-cols-3"><Panel><p className="text-xs text-muted-foreground">Sample revenue</p><p className="mt-2 text-2xl font-extrabold">{currency(totalRevenue)}</p><p className="mt-1 text-xs text-emerald-700">+12.8% vs previous period</p></Panel><Panel><p className="text-xs text-muted-foreground">Sample orders</p><p className="mt-2 text-2xl font-extrabold">{totalOrders}</p><p className="mt-1 text-xs text-emerald-700">+8.2% vs previous period</p></Panel><Panel><p className="text-xs text-muted-foreground">Average order value</p><p className="mt-2 text-2xl font-extrabold">{currency(totalOrders ? Math.round(totalRevenue / totalOrders) : 0)}</p><p className="mt-1 text-xs text-muted-foreground">Calculated from demo chart values</p></Panel></div><div className="grid gap-5 xl:grid-cols-2"><Panel><h2 className="mb-1 text-lg font-bold">Revenue trend</h2><p className="mb-4 text-xs text-muted-foreground">Sample revenue · INR</p><div className="h-72"><ResponsiveContainer width="100%" height="100%"><AreaChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" /><XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} /><YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} tickFormatter={(value: number) => `${Math.round(value / 1000)}k`} /><Tooltip content={<ChartTooltip />} /><Area type="monotone" dataKey="revenue" stroke="hsl(39 56% 45%)" strokeWidth={3} fill="hsl(39 56% 51% / 0.2)" /></AreaChart></ResponsiveContainer></div></Panel><Panel><h2 className="mb-1 text-lg font-bold">Orders trend</h2><p className="mb-4 text-xs text-muted-foreground">Sample orders by selected range</p><div className="h-72"><ResponsiveContainer width="100%" height="100%"><BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" /><XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} /><YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} /><Tooltip content={<ChartTooltip />} /><Bar dataKey="orders" name="orders" fill="hsl(72 49% 32%)" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div></Panel></div><Panel className="mt-5"><h2 className="mb-1 text-lg font-bold">Best-selling products</h2><p className="mb-4 text-xs text-muted-foreground">Demo units sold · illustrative sample</p><TableFrame><TableHead><th className="px-3 py-3">Product</th><th className="px-3 py-3">Category</th><th className="px-3 py-3">Units sold</th><th className="px-3 py-3">Revenue sample</th></TableHead><tbody>{bestSellers.map((product) => <tr key={product.id} className="border-b border-border/70 last:border-0"><Cell><div className="flex items-center gap-3"><img src={product.image} alt="" className="h-9 w-9 rounded-lg object-cover" /><span className="font-semibold">{product.name}</span></div></Cell><Cell>{product.category}</Cell><Cell>{product.units}</Cell><Cell>{currency(product.units * product.price)}</Cell></tr>)}</tbody></TableFrame></Panel></>;
}

function CustomersPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All customers");
  const [selected, setSelected] = useState<(typeof adminCustomers)[number] | null>(null);
  const visible = adminCustomers.filter((person) => (filter === "All customers" || (filter === "Repeat customers" ? person.orders >= 6 : person.orders < 6)) && `${person.name} ${person.email} ${person.city}`.toLowerCase().includes(search.toLowerCase()));
  const history = selected ? adminOrders.filter((order) => order.customer === selected.name) : [];
  return <><PageHeading eyebrow="People · mock data" title="Customers" description="Sample customer records only. No real customer data is connected." /><Panel><div className="mb-5 flex flex-col gap-3 sm:flex-row sm:justify-between"><SearchBox value={search} onChange={setSearch} placeholder="Search customers" /><FilterSelect label="Filter customers" value={filter} onChange={setFilter} options={["All customers", "Repeat customers", "New customers"]} /></div>{visible.length ? <TableFrame><TableHead><th className="px-3 py-3">Customer</th><th className="px-3 py-3">Location</th><th className="px-3 py-3">Total orders</th><th className="px-3 py-3">Total spending</th><th className="px-3 py-3">Details</th></TableHead><tbody>{visible.map((person) => <tr key={person.id} className="border-b border-border/70 last:border-0"><Cell><p className="font-semibold">{person.name}</p><p className="text-xs text-muted-foreground">{person.email}</p></Cell><Cell>{person.city}</Cell><Cell>{person.orders}</Cell><Cell className="font-semibold">{currency(person.spent)}</Cell><Cell><Button variant="outline" size="sm" className="rounded-lg" onClick={() => setSelected(person)}>View profile</Button></Cell></tr>)}</tbody></TableFrame> : <EmptyState title="No sample customers match your filters." />}</Panel><Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}><DialogContent><DialogHeader><DialogTitle>{selected?.name}</DialogTitle><DialogDescription>Demo customer profile · {selected?.id}</DialogDescription></DialogHeader>{selected && <div className="space-y-4"><div className="rounded-xl bg-muted/50 p-4 text-sm"><p>{selected.email}</p><p className="text-muted-foreground">{selected.city} · {selected.orders} orders · {currency(selected.spent)} total spending</p></div><div><h3 className="mb-2 font-semibold">Sample order history</h3>{history.length ? <div className="space-y-2">{history.map((order) => <div key={order.id} className="flex items-center justify-between rounded-lg border border-border p-3 text-sm"><span>{order.id}<span className="ml-2 text-xs text-muted-foreground">{order.date}</span></span><span className="font-semibold">{currency(order.total)}</span></div>)}</div> : <p className="text-sm text-muted-foreground">No sample orders in the visible demo history.</p>}</div></div>}<DialogFooter><Button variant="outline" className="rounded-xl" onClick={() => setSelected(null)}>Close</Button></DialogFooter></DialogContent></Dialog></>;
}

function PaymentsPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All statuses");
  const [selected, setSelected] = useState<(typeof adminPayments)[number] | null>(null);
  const visible = adminPayments.filter((payment) => (filter === "All statuses" || payment.status === filter) && `${payment.id} ${payment.orderId}`.toLowerCase().includes(search.toLowerCase()));
  return <><PageHeading eyebrow="Transactions · demo data" title="Payments" description="Mock transaction records for prototype review. No payment gateway is connected." /><Panel><div className="mb-5 flex flex-col gap-3 sm:flex-row sm:justify-between"><SearchBox value={search} onChange={setSearch} placeholder="Search transaction or order" /><FilterSelect label="Filter payment status" value={filter} onChange={setFilter} options={["All statuses", "Paid", "Pending", "Refunded"]} /></div>{visible.length ? <TableFrame><TableHead><th className="px-3 py-3">Transaction ID</th><th className="px-3 py-3">Order ID</th><th className="px-3 py-3">Amount</th><th className="px-3 py-3">Date</th><th className="px-3 py-3">Status</th><th className="px-3 py-3">Details</th></TableHead><tbody>{visible.map((payment) => <tr key={payment.id} className="border-b border-border/70 last:border-0"><Cell className="font-semibold">{payment.id}</Cell><Cell>{payment.orderId}</Cell><Cell>{currency(payment.amount)}</Cell><Cell>{payment.date}</Cell><Cell><StatusPill value={payment.status} /></Cell><Cell><Button variant="outline" size="sm" className="rounded-lg" onClick={() => setSelected(payment)}>View</Button></Cell></tr>)}</tbody></TableFrame> : <EmptyState title="No sample transactions match your filters." />}</Panel><Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}><DialogContent><DialogHeader><DialogTitle>Transaction detail</DialogTitle><DialogDescription>Mock payment record · not a live gateway transaction.</DialogDescription></DialogHeader>{selected && <div className="space-y-3 rounded-xl bg-muted/50 p-4 text-sm"><p><span className="text-muted-foreground">Transaction:</span> {selected.id}</p><p><span className="text-muted-foreground">Order:</span> {selected.orderId}</p><p><span className="text-muted-foreground">Amount:</span> {currency(selected.amount)}</p><p><span className="text-muted-foreground">Date:</span> {selected.date}</p><p><span className="text-muted-foreground">Method:</span> {selected.method}</p><p><span className="text-muted-foreground">Status:</span> <StatusPill value={selected.status} /></p></div>}<DialogFooter><Button variant="outline" className="rounded-xl" onClick={() => setSelected(null)}>Close</Button></DialogFooter></DialogContent></Dialog></>;
}

function NotificationsPage({ notifications, setNotifications }: {
  notifications: AdminNotification[];
  setNotifications: (notifications: AdminNotification[]) => void;
}) {
  const unread = notifications.filter((item) => !item.read).length;
  const toggleRead = (id: string) => setNotifications(notifications.map((item) => item.id === id ? { ...item, read: !item.read } : item));
  return <><PageHeading eyebrow="Updates · sample alerts" title="Notifications" description="Local demo alerts for order and inventory events." actions={<Button variant="outline" className="rounded-xl" disabled={!unread} onClick={() => setNotifications(notifications.map((item) => ({ ...item, read: true })))}>Mark all as read <Check className="ml-1 h-4 w-4" /></Button>} /><Panel><div className="mb-4 flex items-center justify-between"><p className="text-sm text-muted-foreground">{unread} unread sample notifications</p><Bell className="h-5 w-5 text-primary" /></div>{notifications.length ? <div className="divide-y divide-border">{notifications.map((item) => <div key={item.id} className={`flex gap-3 py-4 ${item.read ? "opacity-70" : ""}`}><span className={`mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-xl ${item.type === "stock" ? "bg-amber-100 text-amber-800" : "bg-sky-100 text-sky-800"}`}>{item.type === "stock" ? <AlertTriangle className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}</span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="font-semibold">{item.title}</p>{!item.read && <span className="h-2 w-2 rounded-full bg-primary" />}</div><p className="text-sm text-muted-foreground">{item.message}</p><p className="mt-1 text-xs text-muted-foreground">{item.time}</p></div><Button variant="ghost" size="sm" className="shrink-0 rounded-lg" onClick={() => toggleRead(item.id)}>{item.read ? "Mark unread" : "Mark read"}</Button></div>)}</div> : <EmptyState title="You're all caught up." />}</Panel></>;
}

function SettingsPage() {
  const initial = { storeName: "PURVITA Healthy Snacks", supportEmail: "hello@purvita.example", storeCity: "Pune, India", newOrderAlerts: true, stockAlerts: true };
  const [saved, setSaved] = useState(initial);
  const [draft, setDraft] = useState(initial);
  const [notice, setNotice] = useState("");
  const save = (event: FormEvent) => { event.preventDefault(); setSaved(draft); setNotice("Settings saved to local prototype state."); };
  const cancel = () => { setDraft(saved); setNotice("Unsaved changes were discarded."); };
  return <><PageHeading eyebrow="Workspace · local preferences" title="Settings" description="Placeholder store and admin preferences. No server settings are changed." /><form onSubmit={save} className="grid gap-5 xl:grid-cols-2"><Panel><h2 className="mb-1 text-lg font-bold">Admin profile</h2><p className="mb-5 text-sm text-muted-foreground">Placeholder profile details for this prototype.</p><div className="flex items-center gap-4 rounded-xl bg-muted/50 p-4"><div className="grid h-12 w-12 place-items-center rounded-full bg-primary text-lg font-bold text-primary-foreground">A</div><div><p className="font-semibold">PURVITA Administrator</p><p className="text-sm text-muted-foreground">admin@gmail.com</p><span className="mt-1 inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">Prototype admin</span></div></div><p className="mt-4 text-xs text-muted-foreground">Profile identity is placeholder UI. Admin access is a frontend-only prototype and must be enforced by the backend for production.</p></Panel><Panel><h2 className="mb-1 text-lg font-bold">Store information</h2><p className="mb-5 text-sm text-muted-foreground">Saved locally for this page session only.</p><div className="space-y-4"><div><Label htmlFor="store-name">Store name</Label><Input id="store-name" value={draft.storeName} onChange={(event) => setDraft({ ...draft, storeName: event.target.value })} className="mt-1 rounded-xl" /></div><div><Label htmlFor="support-email">Support email</Label><Input id="support-email" type="email" value={draft.supportEmail} onChange={(event) => setDraft({ ...draft, supportEmail: event.target.value })} className="mt-1 rounded-xl" /></div><div><Label htmlFor="store-city">Store location</Label><Input id="store-city" value={draft.storeCity} onChange={(event) => setDraft({ ...draft, storeCity: event.target.value })} className="mt-1 rounded-xl" /></div></div></Panel><Panel className="xl:col-span-2"><h2 className="mb-1 text-lg font-bold">Notification preferences</h2><p className="mb-5 text-sm text-muted-foreground">Local UI preferences, not connected to notification services.</p><div className="space-y-4"><label className="flex cursor-pointer items-center justify-between gap-4"><span><span className="block text-sm font-semibold">New order alerts</span><span className="text-xs text-muted-foreground">Show a demo notification when sample orders arrive.</span></span><input type="checkbox" checked={draft.newOrderAlerts} onChange={(event) => setDraft({ ...draft, newOrderAlerts: event.target.checked })} className="h-4 w-4 accent-primary" /></label><label className="flex cursor-pointer items-center justify-between gap-4"><span><span className="block text-sm font-semibold">Low stock alerts</span><span className="text-xs text-muted-foreground">Highlight sample products at or below 8 units.</span></span><input type="checkbox" checked={draft.stockAlerts} onChange={(event) => setDraft({ ...draft, stockAlerts: event.target.checked })} className="h-4 w-4 accent-primary" /></label></div><div className="mt-6 flex flex-wrap items-center gap-3"><Button type="submit" className="rounded-xl">Save settings</Button><Button type="button" variant="outline" className="rounded-xl" onClick={cancel}>Cancel changes</Button>{notice && <p role="status" className="text-sm text-muted-foreground">{notice}</p>}</div><div className="sr-only" aria-live="polite">{JSON.stringify(saved)}</div></Panel></form></>;
}

const AdminDashboardPage = () => {
  usePageTitle("PURVITA Admin");
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [products, setProducts] = useState(() => adminProducts.map((item) => ({ ...item })));
  const [orders, setOrders] = useState(() => adminOrders.map((item) => ({ ...item })));
  const [notifications, setNotifications] = useState(() => adminNotifications.map((item) => ({ ...item })));
  const unreadNotifications = notifications.filter((item) => !item.read).length;
  const isAuthenticated = sessionStorage.getItem(ADMIN_AUTH_KEY) === "1";
  const currentPath = location.pathname.replace(/\/+$/, "") || "/admin-dashboard";
  const activeItem = navItems.find((item) => item.path === currentPath) ?? navItems[0];
  const page = useMemo(() => {
    switch (currentPath) {
      case "/admin-dashboard/orders": return <OrdersPage dataSource={demoAdminOrderDataSource} />;
      case "/admin-dashboard/products": return <ProductsPage products={products} setProducts={setProducts} />;
      case "/admin-dashboard/inventory": return <InventoryPage products={products} setProducts={setProducts} />;
      case "/admin-dashboard/analytics": return <AnalyticsPage />;
      case "/admin-dashboard/customers": return <CustomersPage />;
      case "/admin-dashboard/payments": return <PaymentsPage />;
      case "/admin-dashboard/notifications": return <NotificationsPage notifications={notifications} setNotifications={setNotifications} />;
      case "/admin-dashboard/settings": return <SettingsPage />;
      case "/admin-dashboard": return <Overview orders={orders} products={products} onNavigate={navigate} />;
      default: return <Navigate to="/admin-dashboard" replace />;
    }
  }, [currentPath, navigate, orders, products, notifications]);
  if (!isAuthenticated) return <Navigate to="/admin-login" replace />;

  const logout = () => {
    sessionStorage.removeItem(ADMIN_AUTH_KEY);
    navigate("/admin-login", { replace: true });
  };
  const sidebar = (
    <div className="flex h-full flex-col">
      <Link to="/admin-dashboard" onClick={() => setMobileNavOpen(false)} className="flex items-center gap-3 border-b border-white/10 px-5 py-6">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground"><Leaf className="h-5 w-5" /></span>
        <span><span className="block font-display text-lg font-extrabold tracking-tight">PURVITA</span><span className="block text-[10px] font-bold uppercase tracking-[.18em] text-white/55">Admin workspace</span></span>
      </Link>
      <div className="px-4 pt-6"><p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[.2em] text-white/40">Workspace</p><nav className="space-y-1">{navItems.map((item) => {
        const isActive = activeItem.path === item.path;
        return <Link key={item.path} to={item.path} onClick={() => setMobileNavOpen(false)} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${isActive ? "bg-primary text-primary-foreground shadow-sm" : "text-white/70 hover:bg-white/10 hover:text-white"}`}><item.icon className="h-4 w-4 shrink-0" /><span className="truncate">{item.title}</span>{item.title === "Notifications" && unreadNotifications > 0 && <span className={`ml-auto rounded-full px-1.5 py-0.5 text-[10px] ${isActive ? "bg-white/20" : "bg-white/10"}`}>{unreadNotifications}</span>}</Link>;
      })}</nav></div>
      <div className="mt-auto p-4"><div className="mb-3 rounded-xl border border-white/10 bg-white/5 p-3"><p className="text-xs font-semibold">Demo mode</p><p className="mt-1 text-[11px] leading-relaxed text-white/50">All dashboard records are sample data held in this browser session.</p></div><button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-white/70 transition hover:bg-white/10 hover:text-white"><LogOut className="h-4 w-4" />Logout</button></div>
    </div>
  );
  return (
    <div className="min-h-screen bg-muted/30 text-foreground">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-[#44301f] text-white lg:flex">{sidebar}</aside>
      {mobileNavOpen && <div className="fixed inset-0 z-50 lg:hidden"><button aria-label="Close navigation" className="absolute inset-0 bg-black/50" onClick={() => setMobileNavOpen(false)} /><aside className="absolute inset-y-0 left-0 w-[min(19rem,85vw)] bg-[#44301f] text-white shadow-2xl">{sidebar}</aside></div>}
      <div className="min-h-screen lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-border/80 bg-background/95 backdrop-blur">
          <div className="flex h-16 items-center justify-between px-4 sm:px-7">
            <div className="flex items-center gap-3"><Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileNavOpen(true)} aria-label="Open navigation"><Menu className="h-5 w-5" /></Button><div><p className="text-sm font-bold">{activeItem.title}</p><p className="hidden text-[11px] text-muted-foreground sm:block">PURVITA · Admin workspace / {activeItem.title}</p></div></div>
            <div className="flex items-center gap-3"><span className="hidden rounded-full bg-primary/10 px-3 py-1.5 text-[11px] font-bold text-primary sm:inline-flex">SAMPLE DATA</span><Link to="/admin-dashboard/notifications" aria-label={`${unreadNotifications} unread sample notifications`} className="relative rounded-full p-2 text-muted-foreground transition hover:bg-muted"><Bell className="h-5 w-5" />{unreadNotifications > 0 && <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-destructive" />}</Link><div className="grid h-9 w-9 place-items-center rounded-full bg-primary/15 text-sm font-bold text-primary">A</div><div className="hidden sm:block"><p className="text-xs font-semibold">Admin</p><p className="text-[10px] text-muted-foreground">Prototype account</p></div></div>
          </div>
        </header>
        <main className="mx-auto max-w-[1500px] p-4 sm:p-7">{page}<p className="mt-7 border-t border-border/70 pt-4 text-center text-[11px] text-muted-foreground">PURVITA admin prototype · sample values only · frontend route guard is not production authorization.</p></main>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
