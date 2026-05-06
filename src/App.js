import React, { useState, useEffect, useMemo } from "react";

const SUPABASE_URL = "https://syccwhfehaxhnsztcewl.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5Y2N3aGZlaGF4aG5zenRjZXdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwMDQ1ODgsImV4cCI6MjA5MzU4MDU4OH0.9TLORaaqMoch_TJZxowdu6C9qu-ALOHPU0v9B325Fpg";
const STAFF_PIN = "pane2026";
const WHATSAPP_NUMBER = "393357051893";

async function sbFetch(table, params = "") {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${params}`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function sbInsert(table, body) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: "POST",
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json", Prefer: "return=representation" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function sbUpdate(table, id, body) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json", Prefer: "return=representation" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

const CATEGORIES = ["Pane", "Schiacciate", "Panini", "Pizza", "Pasticceria", "Farine"];
const CAT_EMOJI = { Pane: "🍞", Schiacciate: "🫓", Panini: "🥖", Pizza: "🍕", Pasticceria: "🧁", Farine: "🌾" };
const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
const money = (v) => new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(v);

const STATUS_CFG = {
  "Da approvare": { bg: "#FEF3C7", color: "#92400E", dot: "#F59E0B" },
  Approvato: { bg: "#D1FAE5", color: "#065F46", dot: "#10B981" },
  "In produzione": { bg: "#DBEAFE", color: "#1E40AF", dot: "#3B82F6" },
  Pronto: { bg: "#EDE9FE", color: "#5B21B6", dot: "#8B5CF6" },
  Consegnato: { bg: "#F1F5F9", color: "#475569", dot: "#94A3B8" },
  Ritirato: { bg: "#F1F5F9", color: "#475569", dot: "#94A3B8" },
};

function Pill({ status }) {
  const s = STATUS_CFG[status] || STATUS_CFG["Da approvare"];
  return (
    <span style={{ background: s.bg, color: s.color, border: `1px solid ${s.dot}40`, display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700 }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot }} />{status}
    </span>
  );
}

function Spinner() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 0", gap: 16 }}>
      <div style={{ width: 40, height: 40, border: "3px solid #E7E5E4", borderTopColor: "#1C1917", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <div style={{ color: "#A8A29E", fontSize: 14 }}>Caricamento dati...</div>
    </div>
  );
}

// ── Pagina: nessun link cliente, non è staff
function PageNoAccess() {
  const msg = encodeURIComponent("Ciao! Vorrei ricevere il link per ordinare online.");
  return (
    <div style={{ minHeight: "100vh", background: "#F9F8F6", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "'DM Sans','Helvetica Neue',sans-serif" }}>
      <div style={{ maxWidth: 420, width: "100%", textAlign: "center" }}>
        <div style={{ fontSize: 56, marginBottom: 20 }}>🍞</div>
        <h1 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 28, fontWeight: 400, color: "#1C1917", marginBottom: 12 }}>Ordini Panificio</h1>
        <p style={{ color: "#78716C", fontSize: 15, lineHeight: 1.6, marginBottom: 32 }}>
          Per ordinare hai bisogno del tuo link personale.<br />Contattaci su WhatsApp per riceverlo!
        </p>
        <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`} target="_blank" rel="noreferrer"
          style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "#25D366", color: "#fff", padding: "14px 28px", borderRadius: 14, fontWeight: 700, fontSize: 16, textDecoration: "none" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          Scrivici su WhatsApp
        </a>
        <div style={{ marginTop: 40, borderTop: "1px solid #E7E5E4", paddingTop: 20 }}>
          <button onClick={() => { const pin = prompt("PIN staff:"); if (pin === STAFF_PIN) window.location.href = window.location.href + "?pin=" + STAFF_PIN; }}
            style={{ background: "none", border: "none", color: "#A8A29E", fontSize: 12, cursor: "pointer", textDecoration: "underline" }}>
            Accesso staff
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Pagina: PIN staff
function PagePinLogin({ onSuccess }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  function tryPin() {
    if (pin === STAFF_PIN) { onSuccess(); }
    else { setError(true); setTimeout(() => setError(false), 1500); }
  }
  return (
    <div style={{ minHeight: "100vh", background: "#F9F8F6", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "'DM Sans','Helvetica Neue',sans-serif" }}>
      <div style={{ maxWidth: 360, width: "100%", background: "#fff", borderRadius: 24, border: "1px solid #E7E5E4", padding: 32, textAlign: "center", boxShadow: "0 4px 24px rgba(0,0,0,.06)" }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>🔐</div>
        <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 24, fontWeight: 400, marginBottom: 8, color: "#1C1917" }}>Accesso Staff</h2>
        <p style={{ color: "#78716C", fontSize: 14, marginBottom: 24 }}>Inserisci il PIN per accedere al pannello interno</p>
        <input
          type="password"
          placeholder="PIN"
          value={pin}
          onChange={e => setPin(e.target.value)}
          onKeyDown={e => e.key === "Enter" && tryPin()}
          style={{ width: "100%", padding: "12px 16px", border: `2px solid ${error ? "#EF4444" : "#E7E5E4"}`, borderRadius: 12, fontSize: 18, textAlign: "center", outline: "none", letterSpacing: "0.3em", marginBottom: 12, transition: "border-color .2s", fontFamily: "inherit" }}
        />
        {error && <div style={{ color: "#EF4444", fontSize: 13, marginBottom: 12 }}>PIN non corretto</div>}
        <button onClick={tryPin}
          style={{ width: "100%", background: "#1C1917", color: "#fff", border: "none", borderRadius: 12, padding: "12px 0", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
          Entra
        </button>
      </div>
    </div>
  );
}

export default function PanificioApp() {
  const [mode, setMode] = useState(null); // "customer" | "staff" | "noaccess" | "pinlogin"
  const [customerId, setCustomerId] = useState(null);
  const [tab, setTab] = useState("cliente");
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deliveryDate, setDeliveryDate] = useState(tomorrow);
  const [orderMode, setOrderMode] = useState("Consegna");
  const [notes, setNotes] = useState("");
  const [cart, setCart] = useState({});
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState("Pane");
  const [flash, setFlash] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);

  // Determina modalità da URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const customerParam = params.get("customer");
    const pinParam = params.get("pin");
    if (customerParam) {
      setCustomerId(`C${customerParam}`);
      setMode("customer");
    } else if (pinParam === STAFF_PIN) {
      setMode("staff");
    } else {
      setMode("noaccess");
    }
  }, []);

  // Carica dati
  useEffect(() => {
    if (!mode || mode === "noaccess") { setLoading(false); return; }
    async function load() {
      try {
        const [c, p, o] = await Promise.all([
          sbFetch("customers", "order=name.asc"),
          sbFetch("products", "order=category.asc,name.asc"),
          sbFetch("orders", "order=created_at.desc"),
        ]);
        setCustomers(c); setProducts(p); setOrders(o);

        // Trova ultimo ordine del cliente
        if (mode === "customer") {
          const cId = `C${new URLSearchParams(window.location.search).get("customer")}`;
          const myOrders = o.filter(x => x.customer_id === cId).sort((a, b) => b.id.localeCompare(a.id));
          if (myOrders.length > 0) setLastOrder(myOrders[0]);
        }
      } catch (e) { setError(e.message); }
      finally { setLoading(false); }
    }
    load();
  }, [mode]);

  const customer = customers.find(c => c.id === customerId);
  const myOrders = customerId ? orders.filter(o => o.customer_id === customerId) : [];

  function getLines(o) { return Array.isArray(o.lines) ? o.lines : JSON.parse(o.lines || "[]"); }
  function orderTotal(o) { return getLines(o).reduce((s, l) => s + (products.find(p => p.id === l.productId)?.price || 0) * l.qty, 0); }

  const visibleProducts = useMemo(() => {
    if (search) return products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    return products.filter(p => p.category === activeCat);
  }, [products, activeCat, search]);

  const cartLines = useMemo(() =>
    Object.entries(cart).filter(([, q]) => q > 0).map(([id, qty]) => ({ productId: id, qty })), [cart]);
  const cartTotal = cartLines.reduce((s, l) => s + (products.find(p => p.id === l.productId)?.price || 0) * l.qty, 0);
  const cartCount = cartLines.reduce((s, l) => s + l.qty, 0);

  const productionRows = useMemo(() => {
    const approved = orders.filter(o => o.delivery_date === deliveryDate && ["Approvato", "In produzione", "Pronto"].includes(o.status));
    const map = {};
    for (const o of approved) {
      const cust = customers.find(x => x.id === o.customer_id);
      for (const l of getLines(o)) {
        const prod = products.find(x => x.id === l.productId);
        if (!prod) continue;
        if (!map[l.productId]) map[l.productId] = { prod, total: 0, customers: [] };
        map[l.productId].total += l.qty;
        map[l.productId].customers.push({ name: cust?.name || "—", qty: l.qty });
      }
    }
    return Object.values(map).sort((a, b) => a.prod.name.localeCompare(b.prod.name));
  }, [orders, deliveryDate, customers, products]);

  const pendingCount = orders.filter(o => o.status === "Da approvare").length;

  function setQty(id, delta) { setCart(p => ({ ...p, [id]: Math.max(0, (p[id] || 0) + delta) })); }

  function repeatLastOrder() {
    if (!lastOrder) return;
    const lines = getLines(lastOrder);
    const n = {};
    lines.forEach(l => (n[l.productId] = l.qty));
    setCart(n);
    setOrderMode(lastOrder.mode);
    setNotes("");
  }

  async function submitOrder() {
    if (!customerId || cartLines.length === 0) return;
    setSaving(true);
    try {
      const newOrder = { id: `O-${Date.now()}`, customer_id: customerId, delivery_date: deliveryDate, mode: orderMode, status: "Da approvare", source: "App", notes, lines: JSON.stringify(cartLines) };
      const result = await sbInsert("orders", newOrder);
      const saved = Array.isArray(result) ? result[0] : result;
      setOrders(prev => [{ ...saved, lines: cartLines }, ...prev]);
      setLastOrder({ ...saved, lines: cartLines });
      setCart({}); setNotes("");
      setFlash(true);
      setTimeout(() => setFlash(false), 3000);
    } catch (e) { alert("Errore: " + e.message); }
    finally { setSaving(false); }
  }

  async function advance(orderId) {
    const o = orders.find(x => x.id === orderId);
    if (!o) return;
    const next = { "Da approvare": "Approvato", Approvato: "In produzione", "In produzione": "Pronto", Pronto: o.mode === "Consegna" ? "Consegnato" : "Ritirato" };
    const newStatus = next[o.status];
    if (!newStatus) return;
    try {
      await sbUpdate("orders", orderId, { status: newStatus });
      setOrders(prev => prev.map(x => x.id === orderId ? { ...x, status: newStatus } : x));
    } catch (e) { alert("Errore: " + e.message); }
  }

  const C = "#1C1917";
  const card = { background: "#fff", borderRadius: 20, border: "1px solid #E7E5E4", boxShadow: "0 1px 4px rgba(0,0,0,.05)" };
  const btn = { border: "none", borderRadius: 12, padding: "9px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 7, transition: "all .15s", fontFamily: "inherit" };

  // ── Routing
  if (mode === "noaccess") return <PageNoAccess />;
  if (mode === "pinlogin") return <PagePinLogin onSuccess={() => setMode("staff")} />;

  if (error) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", fontFamily: "sans-serif" }}>
      <div style={{ ...card, padding: 32, maxWidth: 400, textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Errore di connessione</div>
        <div style={{ color: "#78716C", fontSize: 13, marginBottom: 16 }}>{error}</div>
        <button onClick={() => window.location.reload()} style={{ ...btn, background: C, color: "#fff" }}>Riprova</button>
      </div>
    </div>
  );

  return (
    <div style={{ fontFamily: "'DM Sans','Helvetica Neue',sans-serif", background: "#F9F8F6", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Serif+Display&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input, textarea, button { font-family: inherit; }
        .fade { animation: fadeUp .22s ease; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .hov:hover { background: #F0EFED !important; }
        @media (max-width:700px) { .two-col { grid-template-columns: 1fr !important; } }
        @media print { .noprint { display: none !important; } }
      `}</style>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "18px 14px 60px" }}>

        {/* HEADER */}
        <div className="noprint" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 22 }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "#A8A29E", fontWeight: 700, marginBottom: 3 }}>
              {mode === "customer" ? `${customer?.name || ""}` : "Panificio · Staff"}
            </div>
            <h1 style={{ fontFamily: "'DM Serif Display',serif", fontSize: "clamp(22px,3.5vw,34px)", color: C, fontWeight: 400, lineHeight: 1.1 }}>
              {mode === "customer" ? "I tuoi ordini" : "Gestione Ordini"}
            </h1>
            {!loading && mode === "staff" && (
              <div style={{ fontSize: 12, color: "#10B981", marginTop: 4, display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981", display: "inline-block" }} />
                {customers.length} clienti · {products.length} prodotti · Supabase ✓
              </div>
            )}
          </div>
          <div style={{ ...card, display: "flex", alignItems: "center", gap: 10, padding: "10px 16px" }}>
            <span>📅</span>
            <div>
              <div style={{ fontSize: 10, color: "#A8A29E", fontWeight: 700, textTransform: "uppercase" }}>Data consegna</div>
              <input type="date" value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)}
                style={{ border: "none", background: "transparent", fontSize: 14, fontWeight: 700, color: C, outline: "none", cursor: "pointer" }} />
            </div>
          </div>
        </div>

        {/* TABS — solo staff vede Back office e Produzione */}
        <div className="noprint" style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          {[
            { id: "cliente", label: mode === "customer" ? "Nuovo ordine" : "Ordine cliente", icon: "🛒", show: true },
            { id: "ordini", label: "Back office", icon: "📋", badge: pendingCount, show: mode === "staff" },
            { id: "produzione", label: "Produzione", icon: "🏭", show: mode === "staff" },
          ].filter(t => t.show).map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className={tab !== t.id ? "hov" : ""}
              style={{ ...btn, background: tab === t.id ? C : "#F0EFED", color: tab === t.id ? "#fff" : "#57534E", border: tab === t.id ? "none" : "1px solid #E7E5E4", borderRadius: 99, padding: "10px 20px" }}>
              {t.icon} {t.label}
              {t.badge > 0 && <span style={{ background: "#F59E0B", color: "#fff", borderRadius: 99, fontSize: 10, fontWeight: 800, padding: "1px 7px" }}>{t.badge}</span>}
            </button>
          ))}
        </div>

        {loading ? <Spinner /> : <>

          {/* ══ TAB CLIENTE / ORDINE ══ */}
          {tab === "cliente" && (
            <div className="fade">

              {/* Flash conferma ordine */}
              {flash && (
                <div style={{ background: "#D1FAE5", border: "1px solid #6EE7B7", borderRadius: 14, padding: "16px 20px", marginBottom: 16, color: "#065F46", fontWeight: 700, display: "flex", alignItems: "center", gap: 10, fontSize: 15 }}>
                  ✓ Ordine inviato! Ti contatteremo per conferma.
                </div>
              )}

              {/* Banner ripeti ultimo ordine */}
              {lastOrder && !flash && cartLines.length === 0 && (
                <div style={{ background: "#FFF7ED", border: "1px solid #FED7AA", borderRadius: 16, padding: "16px 20px", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                  <div>
                    <div style={{ fontWeight: 700, color: "#92400E", fontSize: 14 }}>🔄 Ripeti l'ultimo ordine?</div>
                    <div style={{ color: "#B45309", fontSize: 13, marginTop: 3 }}>
                      {getLines(lastOrder).length} prodotti · {money(orderTotal(lastOrder))} · {lastOrder.delivery_date}
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 6 }}>
                      {getLines(lastOrder).slice(0, 4).map(l => {
                        const p = products.find(x => x.id === l.productId);
                        return <span key={l.productId} style={{ fontSize: 11, background: "#FEF3C7", color: "#92400E", padding: "2px 8px", borderRadius: 99 }}>{p?.name} x{l.qty}</span>;
                      })}
                      {getLines(lastOrder).length > 4 && <span style={{ fontSize: 11, color: "#B45309" }}>+{getLines(lastOrder).length - 4} altri</span>}
                    </div>
                  </div>
                  <button onClick={repeatLastOrder}
                    style={{ ...btn, background: "#F59E0B", color: "#fff", border: "none", padding: "10px 20px", fontSize: 14, borderRadius: 12, flexShrink: 0 }}>
                    Riordina
                  </button>
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 14, alignItems: "start" }} className="two-col">

                {/* Sidebar */}
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

                  {/* Info cliente */}
                  {mode === "customer" && customer && (
                    <div style={{ ...card, padding: 18 }}>
                      <div style={{ fontSize: 10, color: "#A8A29E", fontWeight: 700, textTransform: "uppercase", marginBottom: 3 }}>#{customer.code}</div>
                      <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 2 }}>{customer.name}</div>
                      <div style={{ color: "#78716C", fontSize: 12, marginBottom: 2 }}>{customer.city} {customer.cap}</div>
                      <div style={{ color: "#A8A29E", fontSize: 12 }}>{customer.address}</div>
                    </div>
                  )}

                  {/* Selezione cliente per staff */}
                  {mode === "staff" && (
                    <div style={{ ...card, padding: 18 }}>
                      <div style={{ fontSize: 11, color: "#A8A29E", fontWeight: 700, textTransform: "uppercase", marginBottom: 10 }}>Cliente</div>
                      <input
                        placeholder="Cerca cliente..."
                        onChange={e => {
                          const val = e.target.value.toLowerCase();
                          const found = customers.find(c => c.name.toLowerCase().includes(val) || c.code === val);
                          if (found) setCustomerId(found.id);
                        }}
                        style={{ width: "100%", padding: "9px 12px", border: "1px solid #E7E5E4", borderRadius: 10, outline: "none", fontSize: 13 }}
                      />
                      {customer && (
                        <div style={{ marginTop: 10, padding: "8px 12px", background: "#F5F4F2", borderRadius: 10 }}>
                          <div style={{ fontWeight: 700, fontSize: 13 }}>{customer.name}</div>
                          <div style={{ fontSize: 12, color: "#78716C" }}>{customer.city}</div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Modalità */}
                  <div style={{ ...card, padding: 16 }}>
                    <div style={{ fontSize: 11, color: "#A8A29E", fontWeight: 700, textTransform: "uppercase", marginBottom: 10 }}>Modalità</div>
                    <div style={{ display: "flex", gap: 8 }}>
                      {["Consegna", "Ritiro"].map(m => (
                        <button key={m} onClick={() => setOrderMode(m)}
                          style={{ ...btn, flex: 1, justifyContent: "center", background: orderMode === m ? C : "#F5F4F2", color: orderMode === m ? "#fff" : "#57534E", border: "none" }}>
                          {m === "Consegna" ? "🚚" : "🏪"} {m}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Carrello */}
                  {cartLines.length > 0 && (
                    <div style={{ background: C, borderRadius: 20, padding: 18, color: "#fff" }}>
                      <div style={{ fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "#A8A29E", marginBottom: 10, fontWeight: 700 }}>Il tuo ordine</div>
                      {cartLines.map(l => {
                        const p = products.find(x => x.id === l.productId);
                        return (
                          <div key={l.productId} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 5 }}>
                            <span style={{ color: "#D6D3D1", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p?.name}</span>
                            <span style={{ fontWeight: 800 }}>x{l.qty}</span>
                          </div>
                        );
                      })}
                      <div style={{ borderTop: "1px solid #3B3937", marginTop: 10, paddingTop: 10, display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 12, color: "#A8A29E" }}>{cartCount} pezzi</span>
                        <span style={{ fontFamily: "'DM Serif Display',serif", fontSize: 22 }}>{money(cartTotal)}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Catalogo */}
                <div style={{ ...card, padding: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
                    <div>
                      <h2 style={{ fontSize: 18, fontWeight: 800 }}>Catalogo prodotti</h2>
                      <p style={{ color: "#78716C", fontSize: 13, marginTop: 2 }}>Quantità in pezzi</p>
                    </div>
                    <div style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }}>🔍</span>
                      <input value={search} onChange={e => setSearch(e.target.value)}
                        style={{ paddingLeft: 30, paddingRight: 12, paddingTop: 8, paddingBottom: 8, border: "1px solid #E7E5E4", borderRadius: 12, outline: "none", fontSize: 13, width: 190 }}
                        placeholder="Cerca prodotto..." />
                    </div>
                  </div>

                  {!search && (
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
                      {CATEGORIES.map(cat => (
                        <button key={cat} onClick={() => setActiveCat(cat)}
                          style={{ ...btn, padding: "6px 14px", fontSize: 12, background: activeCat === cat ? C : "#F5F4F2", color: activeCat === cat ? "#fff" : "#57534E", border: "none", borderRadius: 99 }}>
                          {CAT_EMOJI[cat]} {cat} <span style={{ fontSize: 10, opacity: .7 }}>({products.filter(p => p.category === cat).length})</span>
                        </button>
                      ))}
                    </div>
                  )}

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px,1fr))", gap: 9, maxHeight: 480, overflowY: "auto", paddingRight: 4 }}>
                    {visibleProducts.map(p => {
                      const qty = cart[p.id] || 0;
                      return (
                        <div key={p.id} style={{ border: qty > 0 ? `2px solid ${C}` : "1px solid #E7E5E4", borderRadius: 14, padding: 12, background: qty > 0 ? "#FAFAF8" : "#fff", transition: "all .15s" }}>
                          <div style={{ fontSize: 10, color: "#A8A29E", fontWeight: 700, textTransform: "uppercase", marginBottom: 3 }}>{p.id}</div>
                          <div style={{ fontWeight: 700, fontSize: 13, lineHeight: 1.3, marginBottom: 2 }}>{p.name}</div>
                          <div style={{ color: "#78716C", fontSize: 12, marginBottom: 12 }}>{money(p.price)} / pz</div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <button onClick={() => setQty(p.id, -1)} style={{ width: 28, height: 28, borderRadius: 8, background: "#F5F4F2", border: "none", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>-</button>
                            <span style={{ fontWeight: 900, fontSize: 17, minWidth: 26, textAlign: "center" }}>{qty}</span>
                            <button onClick={() => setQty(p.id, 1)} style={{ width: 28, height: 28, borderRadius: 8, background: qty > 0 ? C : "#F5F4F2", border: "none", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", color: qty > 0 ? "#fff" : "#1C1917", transition: "all .15s" }}>+</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <textarea value={notes} onChange={e => setNotes(e.target.value)}
                    style={{ width: "100%", minHeight: 72, border: "1px solid #E7E5E4", borderRadius: 12, padding: 12, fontSize: 13, outline: "none", resize: "vertical", marginTop: 14 }}
                    placeholder="Note ordine (es. consegna entro le 9:00)..." />

                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
                    <button onClick={submitOrder} disabled={cartLines.length === 0 || saving || !customerId}
                      style={{ ...btn, padding: "12px 28px", fontSize: 15, borderRadius: 14, background: (cartLines.length === 0 || !customerId) ? "#E7E5E4" : C, color: (cartLines.length === 0 || !customerId) ? "#A8A29E" : "#fff", cursor: (cartLines.length === 0 || !customerId) ? "not-allowed" : "pointer" }}>
                      {saving ? "Salvataggio..." : `Invia ordine${cartCount > 0 ? ` - ${cartCount} pz - ${money(cartTotal)}` : ""}`}
                    </button>
                  </div>
                </div>
              </div>

              {/* Storico ordini cliente */}
              {mode === "customer" && myOrders.length > 0 && (
                <div style={{ ...card, padding: 22, marginTop: 16 }}>
                  <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16 }}>I tuoi ordini precedenti</h2>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {myOrders.slice(0, 5).map(o => {
                      const lines = getLines(o);
                      return (
                        <div key={o.id} style={{ border: "1px solid #E7E5E4", borderRadius: 16, padding: 14, background: "#fff" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                              <span style={{ fontSize: 13, color: "#78716C" }}>📅 {o.delivery_date}</span>
                              <Pill status={o.status} />
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <span style={{ fontWeight: 700, fontSize: 14 }}>{money(orderTotal(o))}</span>
                              <button onClick={() => {
                                const n = {};
                                lines.forEach(l => (n[l.productId] = l.qty));
                                setCart(n); setOrderMode(o.mode);
                                window.scrollTo({ top: 0, behavior: "smooth" });
                              }}
                                style={{ ...btn, padding: "5px 12px", fontSize: 12, background: "#F5F4F2", color: "#57534E", border: "none" }}>
                                🔄 Riordina
                              </button>
                            </div>
                          </div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                            {lines.map(l => {
                              const p = products.find(x => x.id === l.productId);
                              return <span key={l.productId} style={{ fontSize: 12, background: "#F5F4F2", borderRadius: 8, padding: "3px 9px" }}>{p?.name} x{l.qty}</span>;
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══ TAB BACK OFFICE (solo staff) ══ */}
          {tab === "ordini" && mode === "staff" && (
            <div className="fade" style={{ ...card, padding: 22 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>Dashboard ordini</h2>
              <p style={{ color: "#78716C", fontSize: 14, marginBottom: 20 }}>Approva prima che entrino in produzione.</p>
              {orders.length === 0 ? (
                <div style={{ textAlign: "center", color: "#A8A29E", padding: "40px 0" }}>Nessun ordine ancora.</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {orders.map(o => {
                    const c = customers.find(x => x.id === o.customer_id);
                    const lines = getLines(o);
                    const canAdv = !["Consegnato", "Ritirato", "Annullato"].includes(o.status);
                    const nextLabel = { "Da approvare": "Approva", Approvato: "In produzione", "In produzione": "Pronto", Pronto: "Chiudi" }[o.status];
                    return (
                      <div key={o.id} style={{ border: "1px solid #E7E5E4", borderRadius: 18, padding: 16, background: "#fff", display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "start" }}>
                        <div>
                          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginBottom: 8 }}>
                            <span style={{ fontWeight: 800, fontSize: 15 }}>{c?.name || o.customer_id}</span>
                            <Pill status={o.status} />
                            <span style={{ fontSize: 11, background: "#F5F4F2", color: "#78716C", padding: "2px 8px", borderRadius: 99, fontWeight: 600 }}>{o.mode === "Consegna" ? "🚚" : "🏪"} {o.mode}</span>
                          </div>
                          <div style={{ fontSize: 13, color: "#78716C", marginBottom: 10 }}>📅 {o.delivery_date} · <b style={{ color: C }}>{money(orderTotal(o))}</b></div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                            {lines.map(l => { const p = products.find(x => x.id === l.productId); return <span key={l.productId} style={{ fontSize: 12, background: "#F5F4F2", borderRadius: 8, padding: "4px 10px" }}>{p?.name || l.productId} x{l.qty}</span>; })}
                          </div>
                          {o.notes && <div style={{ fontSize: 12, color: "#A8A29E", marginTop: 8 }}>📝 {o.notes}</div>}
                        </div>
                        {canAdv && <button onClick={() => advance(o.id)} style={{ ...btn, background: o.status === "Da approvare" ? C : "#F5F4F2", color: o.status === "Da approvare" ? "#fff" : "#57534E", whiteSpace: "nowrap", border: "none" }}>{nextLabel}</button>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ══ TAB PRODUZIONE (solo staff) ══ */}
          {tab === "produzione" && mode === "staff" && (
            <div className="fade" style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 14 }} className="two-col">
              <div style={{ ...card, padding: 22 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <div><h2 style={{ fontSize: 20, fontWeight: 800 }}>Lista produzione</h2><p style={{ color: "#78716C", fontSize: 13 }}>Ordini approvati · {deliveryDate}</p></div>
                  <button onClick={() => window.print()} className="noprint" style={{ ...btn, background: "#F5F4F2", color: "#57534E", border: "1px solid #E7E5E4" }}>🖨 Stampa</button>
                </div>
                {productionRows.length === 0 ? (
                  <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 14, padding: 16, color: "#92400E" }}>⚠️ Nessun ordine approvato per questa data.</div>
                ) : (
                  <>
                    {productionRows.map(row => (
                      <div key={row.prod.id} style={{ border: "1px solid #E7E5E4", borderRadius: 16, padding: 14, background: "#fff", marginBottom: 9 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                          <div><div style={{ fontWeight: 800, fontSize: 16 }}>{row.prod.name}</div><div style={{ fontSize: 11, color: "#A8A29E" }}>{row.prod.category}</div></div>
                          <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 44, color: C, lineHeight: 1 }}>{row.total}</div>
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {row.customers.map((c, i) => <span key={i} style={{ fontSize: 12, background: "#F5F4F2", borderRadius: 8, padding: "4px 10px" }}>{c.name} x{c.qty}</span>)}
                        </div>
                      </div>
                    ))}
                    <div style={{ background: C, borderRadius: 18, padding: "14px 18px", marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center", color: "#fff" }}>
                      <span style={{ fontSize: 13, color: "#A8A29E" }}>Totale pezzi</span>
                      <span style={{ fontFamily: "'DM Serif Display',serif", fontSize: 40 }}>{productionRows.reduce((s, r) => s + r.total, 0)}</span>
                    </div>
                  </>
                )}
              </div>
              <div style={{ ...card, padding: 20 }}>
                <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16 }}>Per cliente</h2>
                {orders.filter(o => o.delivery_date === deliveryDate && ["Approvato", "In produzione", "Pronto"].includes(o.status)).length === 0
                  ? <div style={{ color: "#A8A29E", textAlign: "center", padding: "24px 0" }}>Nessun ordine approvato.</div>
                  : orders.filter(o => o.delivery_date === deliveryDate && ["Approvato", "In produzione", "Pronto"].includes(o.status)).map(o => {
                    const c = customers.find(x => x.id === o.customer_id);
                    const lines = getLines(o);
                    return (
                      <div key={o.id} style={{ border: "1px solid #E7E5E4", borderRadius: 16, padding: 14, background: "#fff", marginBottom: 10 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><span style={{ fontWeight: 800, fontSize: 14 }}>{c?.name}</span><Pill status={o.status} /></div>
                        <div style={{ fontSize: 11, color: "#A8A29E", marginBottom: 10 }}>{o.mode === "Consegna" ? "🚚" : "🏪"} {o.mode} · {c?.address}</div>
                        {lines.map(l => { const p = products.find(x => x.id === l.productId); return <div key={l.productId} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 3 }}><span style={{ color: "#57534E" }}>{p?.name}</span><b>{l.qty}</b></div>; })}
                        <div style={{ borderTop: "1px solid #F5F4F2", marginTop: 8, paddingTop: 8, textAlign: "right", fontSize: 13, fontWeight: 800, color: C }}>{money(orderTotal(o))}</div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </>}
      </div>
    </div>
  );
}
