import { useState, useEffect, useCallback, useMemo } from "react";

/* ═══════════════════════════════════════════════════════════
   FELISE ATELIER — Order & Fulfillment Management System
   Aesthetic: Luxury editorial / haute couture dashboard
   ═══════════════════════════════════════════════════════════ */

const STORAGE_KEY = "felise_orders_v2";
const AUTH_KEY = "felise_auth_v2";

const USERS = [
  { username: "felise", password: "felise2026", role: "owner", displayName: "Felise Atelier" },
  { username: "warehouse", password: "ship2026", role: "fulfiller", displayName: "Fulfillment Team" },
];

const generateDemoOrders = () => [
  { id: "FA-2026-0001", product: "Rose Gold Diamond Pendant", productImage: "https://images.unsplash.com/photo-1515562141589-67f0d569b6c2?w=300&h=300&fit=crop", customerName: "Emily Richardson", email: "emily.r@gmail.com", phone: "+1 (212) 555-0147", address: "142 West 57th Street, Apt 8B, New York, NY 10019", country: "US", status: "pending", trackingNumber: "", carrier: "", createdAt: "2026-03-10T14:30:00Z" },
  { id: "FA-2026-0002", product: "Sterling Silver Sapphire Ring", productImage: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=300&h=300&fit=crop", customerName: "James Whitfield", email: "j.whitfield@outlook.com", phone: "+44 7700 900123", address: "27 Baker Street, Marylebone, London W1U 8EQ", country: "GB", status: "pending", trackingNumber: "", carrier: "", createdAt: "2026-03-10T09:15:00Z" },
  { id: "FA-2026-0003", product: "Gold Pearl Drop Earrings", productImage: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=300&h=300&fit=crop", customerName: "Sophie Laurent", email: "sophie.l@yahoo.ca", phone: "+1 (416) 555-0198", address: "350 Queen Street West, Unit 12, Toronto, ON M5V 2A2", country: "CA", status: "shipped", trackingNumber: "YT2098765432101", carrier: "YunExpress", createdAt: "2026-03-08T11:45:00Z", shippedAt: "2026-03-09T16:20:00Z" },
  { id: "FA-2026-0004", product: "Platinum Tennis Bracelet", productImage: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=300&h=300&fit=crop", customerName: "Olivia Chen", email: "olivia.chen@gmail.com", phone: "+61 4 1234 5678", address: "88 George Street, Level 3, Sydney NSW 2000", country: "AU", status: "shipped", trackingNumber: "4PX3456789012", carrier: "4PX", createdAt: "2026-03-07T08:00:00Z", shippedAt: "2026-03-08T10:30:00Z" },
  { id: "FA-2026-0005", product: "Emerald Cut Engagement Ring", productImage: "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=300&h=300&fit=crop", customerName: "Michael Brooks", email: "m.brooks@hotmail.com", phone: "+1 (310) 555-0234", address: "8840 Wilshire Blvd, Suite 200, Beverly Hills, CA 90211", country: "US", status: "pending", trackingNumber: "", carrier: "", createdAt: "2026-03-11T07:20:00Z" },
  { id: "FA-2026-0006", product: "18K White Gold Hoop Earrings", productImage: "https://images.unsplash.com/photo-1630019852942-f89202989a59?w=300&h=300&fit=crop", customerName: "Charlotte Davies", email: "c.davies@gmail.com", phone: "+44 7911 123456", address: "15 Sloane Street, Knightsbridge, London SW1X 9NB", country: "GB", status: "pending", trackingNumber: "", carrier: "", createdAt: "2026-03-11T08:45:00Z" },
];

const FLAGS = { US: "🇺🇸", CA: "🇨🇦", GB: "🇬🇧", AU: "🇦🇺" };
const COUNTRIES = { US: "United States", CA: "Canada", GB: "United Kingdom", AU: "Australia" };
const STATUS = {
  pending: { label: "Pending", color: "#C8A97E", bg: "rgba(200,169,126,0.12)", border: "rgba(200,169,126,0.3)" },
  shipped: { label: "Shipped", color: "#5B8C6A", bg: "rgba(91,140,106,0.10)", border: "rgba(91,140,106,0.3)" },
};

const CARRIERS_CHINA = [
  "YunExpress", "Yanwen", "CNE Express", "4PX", "SunYou",
  "SF Express (顺丰)", "ZTO Express (中通)", "YTO Express (圆通)",
  "STO Express (申通)", "Best Express (百世)", "China Post",
  "China EMS", "Cainiao", "AliExpress Shipping", "ePacket"
];
const CARRIERS_INTL = [
  "DHL", "DHL eCommerce", "FedEx", "UPS", "TNT",
  "Aramex", "DPD", "EMS", "PostNL"
];

// ─── CSS INJECTION ─────────────────────────────────────────
const injectStyles = () => {
  if (document.getElementById("felise-styles")) return;
  const style = document.createElement("style");
  style.id = "felise-styles";
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&family=DM+Sans:wght@300;400;500;600;700&display=swap');

    * { margin: 0; padding: 0; box-sizing: border-box; }

    :root {
      --ivory: #FAF8F5;
      --cream: #F3EDE4;
      --sand: #E8DFD3;
      --warm-gray: #B8AFA5;
      --taupe: #8C8279;
      --charcoal: #3D3733;
      --deep: #1E1B18;
      --gold: #C8A97E;
      --gold-light: #D4BA94;
      --gold-dark: #A68B5B;
      --sage: #5B8C6A;
      --rose: #C4837A;
      --font-display: 'Cormorant Garamond', Georgia, serif;
      --font-body: 'DM Sans', -apple-system, sans-serif;
    }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes shimmer {
      0% { background-position: -200% center; }
      100% { background-position: 200% center; }
    }
    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-12px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.6; }
    }

    .felise-app { font-family: var(--font-body); background: var(--ivory); color: var(--charcoal); min-height: 100vh; }

    /* LOGIN */
    .login-wrap {
      min-height: 100vh; display: flex; align-items: center; justify-content: center;
      background: var(--deep);
      position: relative; overflow: hidden;
    }
    .login-wrap::before {
      content: ''; position: absolute; inset: 0;
      background: radial-gradient(ellipse at 30% 20%, rgba(200,169,126,0.08) 0%, transparent 50%),
                  radial-gradient(ellipse at 70% 80%, rgba(196,131,122,0.06) 0%, transparent 50%);
    }
    .login-wrap::after {
      content: ''; position: absolute; inset: 0;
      background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23C8A97E' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    }
    .login-card {
      position: relative; z-index: 1;
      width: 420px; max-width: 92vw;
      background: rgba(30,27,24,0.92);
      backdrop-filter: blur(40px);
      border: 1px solid rgba(200,169,126,0.15);
      border-radius: 2px;
      padding: 56px 44px;
      animation: fadeUp 0.8s ease;
    }
    .login-brand {
      text-align: center; margin-bottom: 44px;
    }
    .login-brand h1 {
      font-family: var(--font-display); font-weight: 300; font-size: 36px;
      color: var(--gold-light); letter-spacing: 6px; text-transform: uppercase;
      margin-bottom: 6px;
    }
    .login-brand p {
      font-family: var(--font-display); font-size: 13px; color: var(--warm-gray);
      letter-spacing: 4px; text-transform: uppercase; font-style: italic;
    }
    .login-divider {
      width: 40px; height: 1px; background: var(--gold); margin: 0 auto 36px; opacity: 0.4;
    }
    .login-field { margin-bottom: 20px; }
    .login-field label {
      display: block; font-size: 11px; font-weight: 500;
      letter-spacing: 2px; text-transform: uppercase;
      color: var(--warm-gray); margin-bottom: 8px;
    }
    .login-field input {
      width: 100%; padding: 14px 16px;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(200,169,126,0.2);
      border-radius: 2px;
      color: #F3EDE4; font-family: var(--font-body); font-size: 14px;
      outline: none; transition: all 0.3s;
    }
    .login-field input:focus {
      border-color: var(--gold);
      background: rgba(200,169,126,0.06);
    }
    .login-field input::placeholder { color: rgba(184,175,165,0.4); }
    .login-btn {
      width: 100%; padding: 16px; margin-top: 8px;
      background: transparent;
      border: 1px solid var(--gold);
      color: var(--gold-light);
      font-family: var(--font-body); font-size: 12px; font-weight: 600;
      letter-spacing: 3px; text-transform: uppercase;
      cursor: pointer; transition: all 0.4s;
      border-radius: 2px;
    }
    .login-btn:hover {
      background: var(--gold); color: var(--deep);
    }
    .login-error {
      text-align: center; color: var(--rose); font-size: 13px;
      margin-top: 16px; animation: fadeIn 0.3s;
    }
    .login-hint {
      margin-top: 32px; padding-top: 24px;
      border-top: 1px solid rgba(200,169,126,0.1);
      text-align: center;
    }
    .login-hint p { font-size: 11px; color: rgba(184,175,165,0.5); line-height: 1.8; letter-spacing: 0.5px; }

    /* LAYOUT */
    .app-layout { display: flex; height: 100vh; overflow: hidden; }

    /* SIDEBAR */
    .sidebar {
      width: 260px; min-width: 260px;
      background: var(--deep);
      border-right: 1px solid rgba(200,169,126,0.08);
      display: flex; flex-direction: column;
      transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .sidebar.collapsed { width: 72px; min-width: 72px; }
    .sidebar-brand {
      padding: 28px 24px;
      border-bottom: 1px solid rgba(200,169,126,0.08);
    }
    .sidebar-brand h2 {
      font-family: var(--font-display); font-weight: 300;
      font-size: 20px; color: var(--gold-light);
      letter-spacing: 4px; text-transform: uppercase;
      white-space: nowrap; overflow: hidden;
    }
    .sidebar-brand span {
      font-family: var(--font-display); font-size: 10px;
      color: var(--taupe); letter-spacing: 3px;
      text-transform: uppercase; font-style: italic;
      display: block; margin-top: 4px;
    }
    .sidebar-role {
      padding: 16px 24px;
      border-bottom: 1px solid rgba(200,169,126,0.06);
      font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase;
      color: var(--taupe); display: flex; align-items: center; gap: 10px;
    }
    .sidebar-role .dot {
      width: 6px; height: 6px; border-radius: 50%;
      background: var(--sage); flex-shrink: 0;
    }
    .sidebar-nav { flex: 1; padding: 16px 12px; }
    .nav-btn {
      width: 100%; display: flex; align-items: center; gap: 14px;
      padding: 13px 16px; border: none; border-radius: 3px;
      background: transparent; color: var(--warm-gray);
      font-family: var(--font-body); font-size: 13px; font-weight: 500;
      letter-spacing: 0.5px; cursor: pointer; transition: all 0.25s;
      margin-bottom: 4px; white-space: nowrap; overflow: hidden;
    }
    .nav-btn:hover { color: var(--gold-light); background: rgba(200,169,126,0.06); }
    .nav-btn.active {
      color: var(--gold-light); background: rgba(200,169,126,0.1);
      border-left: 2px solid var(--gold);
    }
    .nav-btn .icon { font-size: 17px; width: 20px; text-align: center; flex-shrink: 0; }
    .sidebar-logout {
      padding: 16px 24px;
      border-top: 1px solid rgba(200,169,126,0.06);
    }
    .sidebar-logout button {
      width: 100%; display: flex; align-items: center; gap: 10px;
      padding: 10px 0; border: none; background: none;
      color: var(--rose); font-family: var(--font-body);
      font-size: 12px; font-weight: 500; letter-spacing: 1px;
      text-transform: uppercase; cursor: pointer;
      opacity: 0.7; transition: opacity 0.2s;
    }
    .sidebar-logout button:hover { opacity: 1; }

    /* MAIN */
    .main-content { flex: 1; display: flex; flex-direction: column; overflow: hidden; background: var(--ivory); }
    .top-bar {
      padding: 24px 36px;
      background: white;
      border-bottom: 1px solid var(--sand);
      display: flex; align-items: center; justify-content: space-between;
    }
    .top-bar h1 {
      font-family: var(--font-display); font-weight: 400; font-size: 26px;
      color: var(--charcoal); letter-spacing: 1px;
    }
    .top-bar p {
      font-size: 13px; color: var(--taupe); margin-top: 2px; letter-spacing: 0.3px;
    }
    .content-area { flex: 1; overflow: auto; padding: 32px 36px; }

    /* STATS */
    .stats-row { display: grid; grid-template-columns: repeat(4,1fr); gap: 20px; margin-bottom: 36px; }
    .stat-card {
      background: white; border: 1px solid var(--sand);
      border-radius: 3px; padding: 24px 20px;
      transition: all 0.3s; position: relative; overflow: hidden;
    }
    .stat-card::after {
      content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
      background: linear-gradient(90deg, var(--gold), var(--gold-light));
      opacity: 0; transition: opacity 0.3s;
    }
    .stat-card:hover::after { opacity: 1; }
    .stat-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.04); }
    .stat-card .label {
      font-size: 11px; font-weight: 600; letter-spacing: 2px;
      text-transform: uppercase; color: var(--taupe); margin-bottom: 10px;
    }
    .stat-card .value {
      font-family: var(--font-display); font-size: 36px; font-weight: 400;
      color: var(--charcoal); letter-spacing: -1px;
    }
    .stat-card .icon-bg {
      position: absolute; right: 16px; top: 50%; transform: translateY(-50%);
      font-size: 36px; opacity: 0.12;
    }

    /* SECTION */
    .section-title {
      font-family: var(--font-display); font-weight: 400; font-size: 20px;
      color: var(--charcoal); margin-bottom: 18px; letter-spacing: 0.5px;
    }
    .section-title::after {
      content: ''; display: block; width: 24px; height: 1px;
      background: var(--gold); margin-top: 8px;
    }

    /* PENDING CARDS */
    .pending-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px,1fr)); gap: 16px; margin-bottom: 40px; }
    .pending-card {
      background: white; border: 1px solid var(--sand);
      border-radius: 3px; padding: 20px; cursor: pointer;
      transition: all 0.3s; position: relative;
    }
    .pending-card:hover {
      border-color: var(--gold); box-shadow: 0 6px 24px rgba(200,169,126,0.1);
      transform: translateY(-2px);
    }
    .pending-card .pc-top { display: flex; align-items: center; gap: 14px; margin-bottom: 14px; }
    .pending-card .pc-img {
      width: 50px; height: 50px; border-radius: 2px; object-fit: cover;
      border: 1px solid var(--sand);
    }
    .pending-card .pc-id { font-size: 12px; font-weight: 600; color: var(--gold-dark); letter-spacing: 0.5px; }
    .pending-card .pc-product { font-size: 14px; font-weight: 500; color: var(--charcoal); margin-top: 2px; }
    .pending-card .pc-bottom {
      display: flex; justify-content: space-between; align-items: center;
      padding-top: 12px; border-top: 1px solid var(--cream);
      font-size: 13px; color: var(--taupe);
    }
    .pending-card .pc-badge {
      font-size: 11px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase;
      color: var(--gold); background: rgba(200,169,126,0.1);
      padding: 3px 10px; border-radius: 2px;
    }

    /* COUNTRY */
    .country-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; margin-bottom: 40px; }
    .country-card {
      background: white; border: 1px solid var(--sand);
      border-radius: 3px; padding: 24px; text-align: center;
      transition: all 0.3s;
    }
    .country-card:hover { border-color: var(--gold-light); }
    .country-card .flag { font-size: 28px; margin-bottom: 8px; }
    .country-card .cname { font-size: 13px; font-weight: 600; color: var(--charcoal); letter-spacing: 0.3px; }
    .country-card .ccount { font-family: var(--font-display); font-size: 30px; color: var(--charcoal); margin: 6px 0 2px; }
    .country-card .cpend { font-size: 11px; color: var(--gold); font-weight: 500; letter-spacing: 0.5px; }

    /* ORDERS VIEW */
    .orders-layout { flex: 1; display: flex; overflow: hidden; }
    .orders-panel {
      width: 46%; min-width: 400px;
      border-right: 1px solid var(--sand);
      display: flex; flex-direction: column;
      background: white;
    }
    .filters-bar {
      padding: 16px 20px; display: flex; gap: 10px; flex-wrap: wrap;
      border-bottom: 1px solid var(--sand); background: white;
    }
    .filter-input {
      flex: 1; min-width: 160px; padding: 10px 14px;
      border: 1px solid var(--sand); border-radius: 2px;
      font-family: var(--font-body); font-size: 13px;
      background: var(--ivory); outline: none; color: var(--charcoal);
      transition: border 0.3s;
    }
    .filter-input:focus { border-color: var(--gold); }
    .filter-input::placeholder { color: var(--warm-gray); }
    .filter-select {
      padding: 10px 12px; border: 1px solid var(--sand);
      border-radius: 2px; font-family: var(--font-body);
      font-size: 13px; background: white; cursor: pointer;
      outline: none; color: var(--charcoal);
    }
    .orders-scroll { flex: 1; overflow: auto; padding: 12px; }

    /* ORDER ROW */
    .order-row {
      display: flex; align-items: center; gap: 14px;
      padding: 16px; margin-bottom: 6px;
      border: 1px solid transparent;
      border-left: 3px solid transparent;
      border-radius: 2px; cursor: pointer;
      transition: all 0.2s;
    }
    .order-row:hover { background: var(--cream); border-left-color: var(--gold-light); }
    .order-row.active {
      background: rgba(200,169,126,0.08);
      border: 1px solid rgba(200,169,126,0.2);
      border-left: 3px solid var(--gold);
    }
    .order-row .or-img {
      width: 48px; height: 48px; border-radius: 2px;
      object-fit: cover; border: 1px solid var(--sand); flex-shrink: 0;
    }
    .order-row .or-info { flex: 1; min-width: 0; }
    .order-row .or-id { font-size: 12px; font-weight: 600; color: var(--gold-dark); letter-spacing: 0.5px; }
    .order-row .or-product {
      font-size: 14px; font-weight: 500; color: var(--charcoal);
      margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .order-row .or-customer { font-size: 12px; color: var(--taupe); margin-top: 3px; }
    .order-row .or-right { text-align: right; flex-shrink: 0; }

    /* STATUS BADGE */
    .badge {
      display: inline-block; font-size: 10px; font-weight: 600;
      letter-spacing: 1.5px; text-transform: uppercase;
      padding: 4px 10px; border-radius: 2px;
    }
    .badge-pending { color: var(--gold); background: rgba(200,169,126,0.12); }
    .badge-shipped { color: var(--sage); background: rgba(91,140,106,0.10); }

    /* DETAIL */
    .detail-panel { flex: 1; overflow: auto; background: var(--ivory); }
    .detail-empty {
      height: 100%; display: flex; flex-direction: column;
      align-items: center; justify-content: center; gap: 12px;
    }
    .detail-empty .de-icon { font-size: 48px; opacity: 0.15; }
    .detail-empty p { font-size: 14px; color: var(--warm-gray); font-style: italic; }

    .detail-content { padding: 32px; animation: fadeUp 0.35s ease; }
    .detail-header {
      display: flex; justify-content: space-between; align-items: flex-start;
      margin-bottom: 32px; padding-bottom: 24px;
      border-bottom: 1px solid var(--sand);
    }
    .detail-header .dh-id {
      font-family: var(--font-display); font-size: 24px;
      font-weight: 400; color: var(--charcoal); letter-spacing: 1px;
      margin-bottom: 8px;
    }
    .detail-close {
      width: 36px; height: 36px; border: 1px solid var(--sand);
      background: white; cursor: pointer; font-size: 18px;
      color: var(--taupe); display: flex; align-items: center;
      justify-content: center; border-radius: 2px; transition: all 0.2s;
    }
    .detail-close:hover { border-color: var(--gold); color: var(--charcoal); }

    .detail-section { margin-bottom: 28px; }
    .ds-title {
      font-size: 11px; font-weight: 600; letter-spacing: 2px;
      text-transform: uppercase; color: var(--taupe);
      margin-bottom: 14px; display: flex; align-items: center; gap: 8px;
    }
    .ds-product-row { display: flex; align-items: center; gap: 18px; }
    .ds-product-img {
      width: 80px; height: 80px; border-radius: 2px;
      object-fit: cover; border: 1px solid var(--sand);
    }
    .ds-product-name { font-size: 17px; font-weight: 600; color: var(--charcoal); }
    .ds-info-row {
      display: flex; justify-content: space-between;
      padding: 10px 0; border-bottom: 1px solid var(--cream);
    }
    .ds-info-row .label { font-size: 13px; color: var(--taupe); }
    .ds-info-row .value { font-size: 13px; font-weight: 600; color: var(--charcoal); }
    .ds-address {
      display: flex; align-items: flex-start; gap: 12px;
      background: white; padding: 16px; border: 1px solid var(--sand);
      border-radius: 2px;
    }
    .ds-address .flag { font-size: 22px; }
    .ds-address .country { font-weight: 600; margin-bottom: 3px; font-size: 14px; color: var(--charcoal); }
    .ds-address .addr { color: var(--taupe); font-size: 13px; line-height: 1.6; }

    .tracking-box {
      background: white; border: 1px solid rgba(91,140,106,0.2);
      border-radius: 2px; padding: 18px; border-left: 3px solid var(--sage);
    }
    .tracking-box .tb-row { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
    .tracking-box .tb-row:last-child { margin-bottom: 0; }
    .tracking-box .tb-label { font-size: 12px; color: var(--taupe); min-width: 90px; }
    .tracking-box .tb-value { font-size: 14px; font-weight: 600; color: var(--charcoal); }
    .tracking-box .tb-number { font-family: 'DM Mono', monospace; font-size: 15px; font-weight: 600; color: var(--sage); letter-spacing: 1px; }

    .ship-btn {
      width: 100%; padding: 16px; margin-top: 12px;
      background: var(--charcoal); border: none;
      color: var(--gold-light); font-family: var(--font-body);
      font-size: 12px; font-weight: 600; letter-spacing: 2.5px;
      text-transform: uppercase; cursor: pointer;
      border-radius: 2px; transition: all 0.35s;
    }
    .ship-btn:hover { background: var(--deep); }

    /* MODAL */
    .modal-overlay {
      position: fixed; inset: 0; z-index: 100;
      background: rgba(30,27,24,0.6); backdrop-filter: blur(6px);
      display: flex; align-items: center; justify-content: center;
      animation: fadeIn 0.2s;
    }
    .modal-card {
      width: 460px; max-width: 92vw;
      background: white; border: 1px solid var(--sand);
      border-radius: 3px; padding: 36px;
      box-shadow: 0 30px 60px rgba(0,0,0,0.12);
      animation: slideDown 0.3s ease;
    }
    .modal-card h3 {
      font-family: var(--font-display); font-weight: 400;
      font-size: 22px; color: var(--charcoal);
      margin-bottom: 6px; letter-spacing: 0.5px;
    }
    .modal-card .mc-sub { font-size: 13px; color: var(--taupe); margin-bottom: 4px; }
    .modal-card .mc-customer {
      font-size: 13px; color: var(--taupe); margin-bottom: 24px;
      padding-bottom: 20px; border-bottom: 1px solid var(--cream);
    }
    .modal-field { margin-bottom: 18px; }
    .modal-field label {
      display: block; font-size: 11px; font-weight: 600;
      letter-spacing: 1.5px; text-transform: uppercase;
      color: var(--taupe); margin-bottom: 8px;
    }
    .modal-field input, .modal-field select {
      width: 100%; padding: 13px 14px;
      border: 1px solid var(--sand); border-radius: 2px;
      font-family: var(--font-body); font-size: 14px;
      color: var(--charcoal); background: white;
      outline: none; transition: border 0.3s;
    }
    .modal-field input:focus, .modal-field select:focus { border-color: var(--gold); }
    .modal-field input::placeholder { color: var(--warm-gray); }
    .modal-actions {
      display: flex; gap: 12px; margin-top: 28px;
    }
    .modal-actions .btn-cancel {
      flex: 1; padding: 14px; border: 1px solid var(--sand);
      background: white; color: var(--taupe);
      font-family: var(--font-body); font-size: 12px; font-weight: 600;
      letter-spacing: 1.5px; text-transform: uppercase;
      cursor: pointer; border-radius: 2px; transition: all 0.2s;
    }
    .modal-actions .btn-cancel:hover { border-color: var(--charcoal); color: var(--charcoal); }
    .modal-actions .btn-confirm {
      flex: 1; padding: 14px; border: none;
      background: var(--charcoal); color: var(--gold-light);
      font-family: var(--font-body); font-size: 12px; font-weight: 600;
      letter-spacing: 1.5px; text-transform: uppercase;
      cursor: pointer; border-radius: 2px; transition: all 0.2s;
    }
    .modal-actions .btn-confirm:hover { background: var(--deep); }
    .custom-row { display: flex; gap: 8px; }
    .custom-row input { flex: 1; }
    .custom-row .back-btn {
      padding: 0 14px; border: 1px solid var(--sand);
      background: white; cursor: pointer; font-size: 12px;
      color: var(--taupe); border-radius: 2px; white-space: nowrap;
      font-family: var(--font-body); transition: all 0.2s;
    }
    .custom-row .back-btn:hover { border-color: var(--gold); color: var(--charcoal); }

    /* NOTIFICATION */
    .notif {
      position: fixed; top: 24px; right: 24px; z-index: 200;
      padding: 16px 24px; border-radius: 2px;
      font-size: 13px; font-weight: 500; letter-spacing: 0.3px;
      box-shadow: 0 8px 30px rgba(0,0,0,0.1);
      animation: slideDown 0.3s ease;
      border-left: 3px solid;
    }
    .notif-success { background: white; color: var(--sage); border-color: var(--sage); }
    .notif-error { background: white; color: var(--rose); border-color: var(--rose); }

    .empty-orders {
      text-align: center; padding: 60px 20px;
    }
    .empty-orders p { color: var(--warm-gray); font-style: italic; }
  `;
  document.head.appendChild(style);
};

export default function App() {
  const [auth, setAuth] = useState(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [trackingInput, setTrackingInput] = useState("");
  const [carrierInput, setCarrierInput] = useState("");
  const [customCarrier, setCustomCarrier] = useState(false);
  const [filterCountry, setFilterCountry] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showShipModal, setShowShipModal] = useState(false);
  const [notification, setNotification] = useState(null);
  const [view, setView] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => { injectStyles(); }, []);

  useEffect(() => {
    (async () => {
      try {
        const r = await window.storage.get(STORAGE_KEY);
        if (r?.value) setOrders(JSON.parse(r.value));
        else { const d = generateDemoOrders(); setOrders(d); await window.storage.set(STORAGE_KEY, JSON.stringify(d)); }
      } catch { setOrders(generateDemoOrders()); }
    })();
  }, []);

  const saveOrders = useCallback(async (o) => {
    setOrders(o);
    try { await window.storage.set(STORAGE_KEY, JSON.stringify(o)); } catch {}
  }, []);

  const notify = (msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const handleLogin = () => {
    const user = USERS.find(u => u.username === username.trim().toLowerCase() && u.password === password);
    if (user) { setAuth(user); setLoginError(""); setUsername(""); setPassword(""); }
    else setLoginError("Invalid credentials. Please try again.");
  };

  const handleShip = async () => {
    if (!carrierInput.trim()) { notify("Please select a shipping carrier.", "error"); return; }
    if (!trackingInput.trim()) { notify("Please enter a tracking number.", "error"); return; }
    const upd = orders.map(o => o.id === selectedOrder.id
      ? { ...o, status: "shipped", trackingNumber: trackingInput.trim(), carrier: carrierInput.trim(), shippedAt: new Date().toISOString() } : o);
    await saveOrders(upd);
    setSelectedOrder({ ...selectedOrder, status: "shipped", trackingNumber: trackingInput.trim(), carrier: carrierInput.trim(), shippedAt: new Date().toISOString() });
    setTrackingInput(""); setCarrierInput(""); setCustomCarrier(false); setShowShipModal(false);
    notify(`${selectedOrder.id} has been shipped successfully.`);
  };

  const filtered = useMemo(() => orders.filter(o => {
    if (filterCountry !== "all" && o.country !== filterCountry) return false;
    if (filterStatus !== "all" && o.status !== filterStatus) return false;
    if (searchQuery) { const q = searchQuery.toLowerCase(); return o.id.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q) || o.product.toLowerCase().includes(q); }
    return true;
  }), [orders, filterCountry, filterStatus, searchQuery]);

  const stats = useMemo(() => ({
    total: orders.length,
    pending: orders.filter(o => o.status === "pending").length,
    shipped: orders.filter(o => o.status === "shipped").length,
    countries: [...new Set(orders.map(o => o.country))].length,
  }), [orders]);

  const fmtDate = d => d ? new Date(d).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

  // ─── LOGIN ────────────────────────────────────────────
  if (!auth) {
    return (
      <div className="felise-app">
        <div className="login-wrap">
          <div className="login-card">
            <div className="login-brand">
              <h1>Felise Atelier</h1>
              <p>Order Management</p>
            </div>
            <div className="login-divider" />
            <div className="login-field">
              <label>Username</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Enter your username" onKeyDown={e => e.key === "Enter" && handleLogin()} />
            </div>
            <div className="login-field">
              <label>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" onKeyDown={e => e.key === "Enter" && handleLogin()} />
            </div>
            <button className="login-btn" onClick={handleLogin}>Sign In</button>
            {loginError && <div className="login-error">{loginError}</div>}
            <div className="login-hint">
              <p>Owner: felise / felise2026</p>
              <p>Fulfillment: warehouse / ship2026</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isOwner = auth.role === "owner";

  // ─── RENDER ───────────────────────────────────────────
  return (
    <div className="felise-app">
      {notification && (
        <div className={`notif notif-${notification.type}`}>{notification.msg}</div>
      )}

      <div className="app-layout">
        {/* SIDEBAR */}
        <aside className={`sidebar${sidebarCollapsed ? " collapsed" : ""}`}>
          <div className="sidebar-brand">
            {!sidebarCollapsed && <><h2>Felise</h2><span>Atelier</span></>}
            {sidebarCollapsed && <h2 style={{ fontSize: 16, letterSpacing: 0, textAlign: "center" }}>FA</h2>}
          </div>
          <div className="sidebar-role">
            <span className="dot" />
            {!sidebarCollapsed && <span>{auth.displayName}</span>}
          </div>
          <nav className="sidebar-nav">
            {[
              { key: "dashboard", icon: "◈", label: "Dashboard" },
              { key: "orders", icon: "◇", label: "Orders" },
            ].map(n => (
              <button key={n.key} className={`nav-btn${view === n.key ? " active" : ""}`}
                onClick={() => { setView(n.key); setSelectedOrder(null); }}>
                <span className="icon">{n.icon}</span>
                {!sidebarCollapsed && n.label}
              </button>
            ))}
          </nav>
          <div className="sidebar-logout">
            <button onClick={() => { setAuth(null); setSelectedOrder(null); setView("dashboard"); }}>
              {!sidebarCollapsed ? "Sign Out" : "→"}
            </button>
          </div>
        </aside>

        {/* MAIN */}
        <main className="main-content">
          <header className="top-bar">
            <div>
              <h1>{view === "dashboard" ? "Dashboard" : "Orders"}</h1>
              <p>{view === "dashboard" ? "Overview & analytics" : `${filtered.length} orders listed`}</p>
            </div>
            <button style={{ background: "none", border: `1px solid ${sidebarCollapsed ? "var(--gold)" : "var(--sand)"}`, padding: "8px 12px", borderRadius: 2, cursor: "pointer", fontSize: 12, color: "var(--taupe)", fontFamily: "var(--font-body)", letterSpacing: 1, transition: "all 0.2s" }}
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
              {sidebarCollapsed ? "Expand" : "Collapse"} Menu
            </button>
          </header>

          {/* DASHBOARD */}
          {view === "dashboard" && (
            <div className="content-area">
              <div className="stats-row">
                {[
                  { label: "Total Orders", value: stats.total, icon: "◈" },
                  { label: "Pending", value: stats.pending, icon: "◇" },
                  { label: "Shipped", value: stats.shipped, icon: "✓" },
                  { label: "Countries", value: stats.countries, icon: "◉" },
                ].map(s => (
                  <div className="stat-card" key={s.label}>
                    <div className="label">{s.label}</div>
                    <div className="value">{s.value}</div>
                    <div className="icon-bg">{s.icon}</div>
                  </div>
                ))}
              </div>

              <h3 className="section-title">Recent Pending Orders</h3>
              <div className="pending-grid">
                {orders.filter(o => o.status === "pending").slice(0, 4).map(o => (
                  <div className="pending-card" key={o.id} onClick={() => { setSelectedOrder(o); setView("orders"); }}>
                    <div className="pc-top">
                      <img className="pc-img" src={o.productImage} alt="" onError={e => { e.target.style.display = "none"; }} />
                      <div>
                        <div className="pc-id">{o.id}</div>
                        <div className="pc-product">{o.product}</div>
                      </div>
                    </div>
                    <div className="pc-bottom">
                      <span>{FLAGS[o.country]} {o.customerName}</span>
                      <span className="pc-badge">Pending</span>
                    </div>
                  </div>
                ))}
              </div>

              <h3 className="section-title">Distribution by Country</h3>
              <div className="country-grid">
                {Object.entries(COUNTRIES).map(([code, name]) => {
                  const cnt = orders.filter(o => o.country === code).length;
                  const pend = orders.filter(o => o.country === code && o.status === "pending").length;
                  return (
                    <div className="country-card" key={code}>
                      <div className="flag">{FLAGS[code]}</div>
                      <div className="cname">{name}</div>
                      <div className="ccount">{cnt}</div>
                      <div className="cpend">{pend} pending</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ORDERS */}
          {view === "orders" && (
            <div className="orders-layout">
              <div className="orders-panel">
                <div className="filters-bar">
                  <input className="filter-input" type="text" placeholder="Search orders…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                  <select className="filter-select" value={filterCountry} onChange={e => setFilterCountry(e.target.value)}>
                    <option value="all">All Countries</option>
                    {Object.entries(COUNTRIES).map(([c, n]) => <option key={c} value={c}>{FLAGS[c]} {n}</option>)}
                  </select>
                  <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="shipped">Shipped</option>
                  </select>
                </div>
                <div className="orders-scroll">
                  {filtered.length === 0 && <div className="empty-orders"><p>No orders found</p></div>}
                  {filtered.map(o => (
                    <div key={o.id} className={`order-row${selectedOrder?.id === o.id ? " active" : ""}`} onClick={() => setSelectedOrder(o)}>
                      <img className="or-img" src={o.productImage} alt="" onError={e => { e.target.style.display = "none"; }} />
                      <div className="or-info">
                        <div className="or-id">{o.id}</div>
                        <div className="or-product">{o.product}</div>
                        <div className="or-customer">{FLAGS[o.country]} {o.customerName}</div>
                      </div>
                      <div className="or-right">
                        <span className={`badge badge-${o.status}`}>{STATUS[o.status].label}</span>

                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="detail-panel">
                {!selectedOrder ? (
                  <div className="detail-empty">
                    <div className="de-icon">◈</div>
                    <p>Select an order to view details</p>
                  </div>
                ) : (() => {
                  const o = selectedOrder;
                  return (
                    <div className="detail-content">
                      <div className="detail-header">
                        <div>
                          <div className="dh-id">{o.id}</div>
                          <span className={`badge badge-${o.status}`}>{STATUS[o.status].label}</span>
                        </div>
                        <button className="detail-close" onClick={() => setSelectedOrder(null)}>✕</button>
                      </div>

                      <div className="detail-section">
                        <div className="ds-title">Product</div>
                        <div className="ds-product-row">
                          <img className="ds-product-img" src={o.productImage} alt="" onError={e => { e.target.style.display = "none"; }} />
                          <div>
                            <div className="ds-product-name">{o.product}</div>
                          </div>
                        </div>
                      </div>

                      <div className="detail-section">
                        <div className="ds-title">Customer</div>
                        <div className="ds-info-row"><span className="label">Name</span><span className="value">{o.customerName}</span></div>
                        <div className="ds-info-row"><span className="label">Email</span><span className="value">{o.email}</span></div>
                        <div className="ds-info-row"><span className="label">Phone</span><span className="value">{o.phone}</span></div>
                      </div>

                      <div className="detail-section">
                        <div className="ds-title">Delivery Address</div>
                        <div className="ds-address">
                          <span className="flag">{FLAGS[o.country]}</span>
                          <div>
                            <div className="country">{COUNTRIES[o.country]}</div>
                            <div className="addr">{o.address}</div>
                          </div>
                        </div>
                      </div>

                      <div className="detail-section">
                        <div className="ds-title">Timeline</div>
                        <div className="ds-info-row"><span className="label">Ordered</span><span className="value">{fmtDate(o.createdAt)}</span></div>
                        {o.shippedAt && <div className="ds-info-row"><span className="label">Shipped</span><span className="value">{fmtDate(o.shippedAt)}</span></div>}
                      </div>

                      {o.status === "shipped" && (
                        <div className="detail-section">
                          <div className="ds-title">Shipment Tracking</div>
                          <div className="tracking-box">
                            <div className="tb-row"><span className="tb-label">Carrier</span><span className="tb-value">{o.carrier}</span></div>
                            <div className="tb-row"><span className="tb-label">Tracking No</span><span className="tb-number">{o.trackingNumber}</span></div>
                          </div>
                        </div>
                      )}

                      {o.status === "pending" && auth.role === "fulfiller" && (
                        <button className="ship-btn" onClick={() => { setShowShipModal(true); setTrackingInput(""); setCarrierInput(""); setCustomCarrier(false); }}>
                          Mark as Shipped
                        </button>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* SHIP MODAL */}
      {showShipModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowShipModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <h3>Enter Shipping Details</h3>
            <div className="mc-sub"><strong>{selectedOrder.id}</strong> — {selectedOrder.product}</div>
            <div className="mc-customer">{FLAGS[selectedOrder.country]} {selectedOrder.customerName}</div>

            <div className="modal-field">
              <label>Shipping Carrier</label>
              {!customCarrier ? (
                <select value={carrierInput} onChange={e => {
                  if (e.target.value === "__custom__") { setCustomCarrier(true); setCarrierInput(""); }
                  else setCarrierInput(e.target.value);
                }}>
                  <option value="">— Select a carrier —</option>
                  <optgroup label="China-Based Carriers">
                    {CARRIERS_CHINA.map(c => <option key={c} value={c}>{c}</option>)}
                  </optgroup>
                  <optgroup label="International Carriers">
                    {CARRIERS_INTL.map(c => <option key={c} value={c}>{c}</option>)}
                  </optgroup>
                  <option value="__custom__">Other (Enter Manually)</option>
                </select>
              ) : (
                <div className="custom-row">
                  <input type="text" value={carrierInput} onChange={e => setCarrierInput(e.target.value)} placeholder="Enter carrier name…" autoFocus />
                  <button className="back-btn" onClick={() => { setCustomCarrier(false); setCarrierInput(""); }}>← List</button>
                </div>
              )}
            </div>

            <div className="modal-field">
              <label>Tracking Number</label>
              <input type="text" value={trackingInput} onChange={e => setTrackingInput(e.target.value)} placeholder="e.g. YT2012345678901234" />
            </div>

            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowShipModal(false)}>Cancel</button>
              <button className="btn-confirm" onClick={handleShip}>Confirm Shipped</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
