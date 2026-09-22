/* =====================================================================
   Gaoteng Energy — 后台「实时预览」扩展（Decap CMS custom preview）
   作用：在 /admin 编辑内容时，编辑器右侧用 iframe 按真实网站样式实时渲染，
        左边改字、右边立刻变（无需发布、无需刷新）。
   依赖：admin/index.html 里先加载 React(UMD)，再加载本文件。
   ===================================================================== */
(function () {
  "use strict";

  var G = typeof window !== "undefined" ? window : globalThis;

  /* ------------------------------------------------------------------
     1) 与前台 render.js 一致的渲染工具（预览专用副本）
     ------------------------------------------------------------------ */
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function nl2br(s) { return esc(s).replace(/\n/g, "<br/>"); }
  function paras(t) {
    if (!t) return "";
    return String(t).split(/\n\s*\n/).map(function (p) {
      return "<p>" + nl2br(p.trim()) + "</p>";
    }).join("");
  }
  function themeClass(t) { return t === "dark" ? "dark" : (t === "soft" ? "soft" : ""); }
  function secHead(b) {
    if (!b || (!b.kicker && !b.title && !b.text)) return "";
    return '<div class="sec-head">' +
      (b.kicker ? '<div class="kick">' + esc(b.kicker) + "</div>" : "") +
      (b.title ? "<h2>" + esc(b.title) + "</h2>" : "") +
      (b.text ? "<p>" + esc(b.text) + "</p>" : "") +
      "</div>";
  }
  function centerBtn(text, link, cls) {
    if (!text) return "";
    return '<div style="text-align:center;margin-top:38px"><a href="' + esc(link || "#") + '" class="btn ' + (cls || "blue") + '">' + esc(text) + "</a></div>";
  }
  function darken(hex, f) {
    hex = String(hex).replace("#", "");
    if (hex.length === 3) hex = hex.split("").map(function (c) { return c + c; }).join("");
    if (hex.length !== 6) return hex;
    var r = parseInt(hex.substr(0, 2), 16), g = parseInt(hex.substr(2, 2), 16), b = parseInt(hex.substr(4, 2), 16);
    r = Math.max(0, Math.round(r * (1 - f)));
    g = Math.max(0, Math.round(g * (1 - f)));
    b = Math.max(0, Math.round(b * (1 - f)));
    return "#" + [r, g, b].map(function (x) { return ("0" + x.toString(16)).slice(-2); }).join("");
  }

  /* 内置插图（与前台一致，未上传图片时显示） */
  var ART_MACHINE =
    '<svg viewBox="0 0 400 430" width="100%" height="100%" role="img" aria-label="Energy storage products">' +
    '<defs><linearGradient id="cab" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#c9d5e6"/></linearGradient></defs>' +
    '<rect x="238" y="40" width="140" height="330" rx="12" fill="url(#cab)" stroke="#e3eaf4"/>' +
    '<rect x="256" y="70" width="104" height="70" rx="6" fill="#0d2a4d"/><rect x="268" y="86" width="80" height="6" rx="3" fill="#3aa0ff"/><rect x="268" y="102" width="60" height="6" rx="3" fill="#27c08a"/>' +
    '<circle cx="374" cy="60" r="6" fill="#27c08a"/><circle cx="256" cy="200" r="5" fill="#27c08a"/><circle cx="256" cy="230" r="5" fill="#ff6b6b"/>' +
    '<rect x="272" y="180" width="90" height="150" rx="6" fill="#eef3fa" stroke="#dbe4f0"/>' +
    '<rect x="286" y="196" width="62" height="4" rx="2" fill="#b9c9dd"/><rect x="286" y="210" width="50" height="4" rx="2" fill="#b9c9dd"/>' +
    '<rect x="30" y="230" width="150" height="140" rx="12" fill="url(#cab)" stroke="#e3eaf4"/>' +
    '<rect x="52" y="256" width="46" height="26" rx="4" fill="#0d2a4d"/><rect x="60" y="266" width="30" height="4" rx="2" fill="#3aa0ff"/>' +
    '<circle cx="150" cy="252" r="5" fill="#27c08a"/><rect x="52" y="308" width="106" height="4" rx="2" fill="#b9c9dd"/><rect x="52" y="322" width="80" height="4" rx="2" fill="#b9c9dd"/>' +
    '<rect x="120" y="120" width="100" height="90" rx="10" fill="url(#cab)" stroke="#e3eaf4"/>' +
    '<rect x="138" y="140" width="36" height="20" rx="3" fill="#0d2a4d"/><rect x="145" y="147" width="22" height="3" rx="1.5" fill="#3aa0ff"/>' +
    '<circle cx="204" cy="140" r="4" fill="#27c08a"/><rect x="138" y="176" width="66" height="3" rx="1.5" fill="#b9c9dd"/>' +
    "</svg>";

  var ART_SOLAR =
    '<svg viewBox="0 0 480 320" width="100%"><rect x="0" y="0" width="480" height="320" rx="16" fill="#0d2a4d"/>' +
    '<circle cx="360" cy="80" r="46" fill="#f6c445"/><g stroke="#f6c445" stroke-width="3"><line x1="360" y1="14" x2="360" y2="26"/><line x1="360" y1="134" x2="360" y2="146"/><line x1="294" y1="80" x2="306" y2="80"/><line x1="414" y1="80" x2="426" y2="80"/></g>' +
    '<path d="M40 250 L110 250 L130 210 L170 250 L300 250" fill="none" stroke="#5cc8ff" stroke-width="4"/>' +
    '<rect x="40" y="180" width="70" height="70" fill="#1b3f70" stroke="#2f6fb5"/><path d="M45 215h60M75 180v70" stroke="#2f6fb5" stroke-width="1.4"/>' +
    '<rect x="300" y="120" width="140" height="130" rx="8" fill="#ffffff"/><rect x="318" y="140" width="104" height="60" rx="5" fill="#0d2a4d"/>' +
    '<rect x="328" y="156" width="84" height="6" rx="3" fill="#3aa0ff"/><rect x="328" y="172" width="60" height="6" rx="3" fill="#27c08a"/>' +
    '<path d="M120 300 H460" stroke="#2f6fb5" stroke-width="2" stroke-dasharray="6 6"/></svg>';

  var ART_FACTORY =
    '<svg viewBox="0 0 480 340" width="100%"><rect width="480" height="340" rx="16" fill="#0d2a4d"/>' +
    '<rect x="40" y="70" width="170" height="200" fill="#1b3f70" stroke="#2f6fb5"/>' +
    '<rect x="60" y="100" width="130" height="40" fill="#0a1830"/><rect x="72" y="114" width="100" height="6" rx="3" fill="#3aa0ff"/>' +
    '<rect x="60" y="160" width="130" height="40" fill="#0a1830"/><rect x="72" y="174" width="80" height="6" rx="3" fill="#27c08a"/>' +
    '<rect x="250" y="40" width="190" height="230" rx="10" fill="#fff"/><rect x="272" y="66" width="146" height="80" rx="6" fill="#0d2a4d"/>' +
    '<rect x="284" y="88" width="120" height="8" rx="4" fill="#3aa0ff"/><rect x="284" y="108" width="80" height="8" rx="4" fill="#27c08a"/>' +
    '<rect x="272" y="166" width="146" height="8" rx="4" fill="#c6d4e6"/><rect x="272" y="188" width="110" height="8" rx="4" fill="#c6d4e6"/></svg>';

  var ART_CITY =
    '<svg viewBox="0 0 480 300" width="100%"><rect width="480" height="300" rx="16" fill="#0d2a4d"/><circle cx="380" cy="70" r="40" fill="#f6c445"/>' +
    '<rect x="40" y="120" width="90" height="130" fill="#1b3f70" stroke="#2f6fb5"/><rect x="150" y="90" width="90" height="160" fill="#1b3f70" stroke="#2f6fb5"/>' +
    '<rect x="260" y="140" width="90" height="110" fill="#1b3f70" stroke="#2f6fb5"/><path d="M60 250h360" stroke="#2f6fb5" stroke-width="2"/></svg>';

  var ART_LIST = [ART_SOLAR, ART_CITY, ART_FACTORY];
  var artIdx = 0;
  function nextArt() { var a = ART_LIST[artIdx % ART_LIST.length]; artIdx++; return a; }

  function cardHTML(c) {
    var thumb = "";
    if (c.image) thumb = '<div class="thumb"><img src="' + esc(c.image) + '" alt="' + esc(c.title || "") + '"/></div>';
    else if (c.icon) thumb = '<div class="thumb thumb-emoji">' + esc(c.icon) + "</div>";
    var k = c.kicker ? '<div class="k">' + esc(c.kicker) + "</div>" : "";
    var ul = (c.bullets && c.bullets.length)
      ? "<ul>" + c.bullets.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>"
      : "";
    return '<div class="card">' + thumb + '<div class="body">' + k +
      "<h3>" + esc(c.title || "") + "</h3><p>" + nl2br(c.text || "") + "</p>" + ul + "</div></div>";
  }

  /* 已发布的数据缓存（用于：产品库/新闻库自动区块、站点信息、导航、样式） */
  var DATA = { site: null, nav: null, products: null, news: null, style: null };

  /* ------------------------------------------------------------------
     2) 12 种板块渲染器（与前台 render.js 一致）
     ------------------------------------------------------------------ */
  var BLOCKS = {
    hero: function (b) {
      var photo = b.image ? " photo" : "";
      var style = "padding:0";
      if (b.image) style += ";background-image:linear-gradient(rgba(8,21,44,.62), rgba(8,21,44,.78)), url(" + esc(b.image) + ");background-size:cover;background-position:center";
      var btns = "";
      if (b.btn1Text) btns += '<a href="' + esc(b.btn1Link || "#") + '" class="btn light">' + esc(b.btn1Text) + "</a>";
      if (b.btn2Text) btns += '<a href="' + esc(b.btn2Link || "#") + '" class="btn outline">' + esc(b.btn2Text) + "</a>";
      var art = b.image ? "" : '<div class="art">' + ART_MACHINE + "</div>";
      return '<section class="hero' + photo + '" style="' + style + '">' +
        '<span class="globe"></span><span class="arc"></span>' +
        '<div class="wrap"><div class="inner">' +
        "<div><h1>" + nl2br(b.title || "") + "</h1>" +
        (b.subtitle ? "<p>" + nl2br(b.subtitle) + "</p>" : "") +
        (btns ? '<div class="btns">' + btns + "</div>" : "") +
        "</div>" + art + "</div></div></section>";
    },
    phead: function (b) {
      return '<section class="phead"><span class="arc"></span><div class="wrap">' +
        (b.crumb ? '<div class="crumb">' + esc(b.crumb) + "</div>" : "") +
        "<h1>" + esc(b.title || "") + "</h1>" +
        (b.text ? "<p>" + esc(b.text) + "</p>" : "") +
        "</div></section>";
    },
    stats: function (b) {
      var items = (b.items || []).map(function (x) {
        return '<div><div class="num">' + esc(x.num) + '</div><div class="lbl">' + esc(x.label) + "</div></div>";
      }).join("");
      return '<section class="stats" style="padding:40px 0"><div class="wrap"><div class="grid">' + items + "</div></div></section>";
    },
    cards: function (b) {
      var cls = "cards" + (b.columns === "2" ? " c2" : b.columns === "4" ? " c4" : "");
      var cards = (b.cards || []).map(cardHTML).join("");
      return '<section class="' + themeClass(b.theme) + '"><div class="wrap">' + secHead(b) +
        '<div class="' + cls + '">' + cards + "</div>" + centerBtn(b.btnText, b.btnLink) + "</div></section>";
    },
    split: function (b) {
      var media = b.image
        ? '<div class="gt-media"><img class="gt-img" src="' + esc(b.image) + '" alt="' + esc(b.title || "") + '"/></div>'
        : '<div class="gt-media">' + nextArt() + "</div>";
      var ul = (b.bullets && b.bullets.length)
        ? '<ul class="checks">' + b.bullets.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>"
        : "";
      var btn = b.btnText ? '<a href="' + esc(b.btnLink || "#") + '" class="btn blue">' + esc(b.btnText) + "</a>" : "";
      var txt = "<div>" +
        (b.kicker ? '<div class="kick" style="color:var(--blue);font-weight:800;letter-spacing:2px;font-size:13px">' + esc(b.kicker) + "</div>" : "") +
        "<h2>" + esc(b.title || "") + "</h2>" + paras(b.text) + ul + btn + "</div>";
      return '<section class="' + themeClass(b.theme) + '"><div class="wrap">' +
        '<div class="split' + (b.imageSide === "left" ? " rev" : "") + '">' + txt + media + "</div></div></section>";
    },
    table: function (b) {
      var th = (b.headers || []).map(function (x) { return "<th>" + esc(x) + "</th>"; }).join("");
      var rows = (b.rows || []).map(function (r) {
        return "<tr>" + ((r.cells || []).map(function (c) { return "<td>" + esc(c) + "</td>"; }).join("")) + "</tr>";
      }).join("");
      var note = b.text ? '<p style="color:var(--muted);margin-top:16px;font-size:14px">' + nl2br(b.text) + "</p>" : "";
      return '<section class="' + themeClass(b.theme) + '"><div class="wrap">' + secHead(b) +
        '<table class="spec-table">' + (th ? "<tr>" + th + "</tr>" : "") + rows + "</table>" + note + "</div></section>";
    },
    products: function (b) {
      var items = DATA.products && DATA.products.items;
      var inner = (items && items.length)
        ? '<div class="cards">' + items.map(function (p) {
            return cardHTML({ kicker: p.category, title: p.name, text: p.description, icon: p.icon || "🔌", bullets: p.specs });
          }).join("") + "</div>"
        : '<div class="cards"></div><p style="color:var(--muted);font-size:13px">（此处自动读取「产品库」，发布后显示你填的产品）</p>';
      return '<section class="' + themeClass(b.theme) + '"><div class="wrap">' + secHead(b) + inner + centerBtn(b.btnText, b.btnLink) + "</div></section>";
    },
    newslist: function (b) {
      var items = DATA.news && DATA.news.items;
      var inner = (items && items.length)
        ? '<div class="cards">' + items.map(function (n) {
            return cardHTML({ kicker: n.date, title: n.title, text: n.body, icon: "📰" });
          }).join("") + "</div>"
        : '<div class="cards"></div><p style="color:var(--muted);font-size:13px">（此处自动读取「新闻库」，发布后显示你填的新闻）</p>';
      return '<section class="' + themeClass(b.theme) + '"><div class="wrap">' + secHead(b) + inner + centerBtn(b.btnText, b.btnLink) + "</div></section>";
    },
    text: function (b) {
      return '<section class="' + themeClass(b.theme) + '"><div class="wrap"><div class="gt-text" style="max-width:860px;margin:0 auto">' +
        secHead(b) + paras(b.body) + "</div></div></section>";
    },
    gallery: function (b) {
      var cls = "gallery" + (b.columns === "2" ? " c2" : b.columns === "4" ? " c4" : "");
      var items = (b.images || []).map(function (im) {
        return '<figure class="gt-fig"><img src="' + esc(im.image) + '" alt="' + esc(im.caption || "") + '"/>' +
          (im.caption ? "<figcaption>" + esc(im.caption) + "</figcaption>" : "") + "</figure>";
      }).join("");
      return '<section class="' + themeClass(b.theme) + '"><div class="wrap">' + secHead(b) +
        '<div class="' + cls + '">' + items + "</div>" + centerBtn(b.btnText, b.btnLink) + "</div></section>";
    },
    band: function (b) {
      return '<section class="band" style="padding:70px 0"><span class="globe"></span><div class="wrap">' +
        "<h2>" + esc(b.title || "") + "</h2>" + (b.text ? "<p>" + nl2br(b.text) + "</p>" : "") +
        '<a href="' + esc(b.btnLink || "#") + '" class="btn light">' + esc(b.btnText || "CONTACT US") + "</a>" +
        "</div></section>";
    },
    contact: function (b) {
      var cards = (b.items || []).map(function (c, i) {
        var lines = (c.lines || []).map(function (l) {
          return '<div class="line"><span class="ic">' + esc(l.icon) + "</span><span>" + esc(l.text) + "</span></div>";
        }).join("");
        return '<div class="contact-card"' + (i > 0 ? ' style="margin-top:20px"' : "") + '><h2 style="font-size:20px;margin-bottom:14px">' + esc(c.title || "") + "</h2>" + lines + "</div>";
      }).join("");
      var form =
        '<form onsubmit="event.preventDefault();">' +
        '<h2 style="font-size:22px;margin-bottom:6px">' + esc(b.formTitle || "Send an Inquiry") + "</h2>" +
        '<p style="color:var(--muted);font-size:14px;margin-bottom:10px">' + esc(b.formNote || "") + "</p>" +
        '<div class="row"><div><label>Name *</label><input type="text" placeholder="Your name"/></div>' +
        '<div><label>Company</label><input type="text" placeholder="Company name"/></div></div>' +
        '<div class="row"><div><label>Email *</label><input type="email" placeholder="you@company.com"/></div>' +
        '<div><label>Phone / WhatsApp</label><input type="text" placeholder="+234 ..."/></div></div>' +
        '<label>Country *</label><select><option value="">Select your country</option><option>Nigeria</option><option>Kenya</option><option>South Africa</option><option>Ghana</option><option>Egypt</option><option>India</option><option>Other</option></select>' +
        '<label>Product Interest</label><select><option>Hybrid Inverter</option><option>Solar Panel</option><option>LiFePO4 Battery</option><option>Complete System</option><option>Distributor / Wholesale</option></select>' +
        '<label>Message *</label><textarea placeholder="Tell us your loads, quantities and target market..."></textarea>' +
        '<br/><br/><button class="btn blue" type="submit" style="width:100%">SEND INQUIRY</button></form>';
      return '<section class="' + themeClass(b.theme) + '"><div class="wrap"><div class="form-grid">' + form +
        "<div>" + cards + "</div></div></div></section>";
    }
  };

  function sectionsHTML(list) {
    if (!list || !list.length) return "";
    var html = "";
    artIdx = 0;
    for (var i = 0; i < list.length; i++) {
      var b = list[i] || {};
      var fn = BLOCKS[b.type];
      if (!fn) continue;
      try { html += fn(b); } catch (e) { /* 单块出错不影响其它 */ }
    }
    if (!html) return "";
    return html + '<div style="height:40px"></div>';
  }

  /* ------------------------------------------------------------------
     3) 预览外壳（真实网站的 顶栏 + 导航 + 页脚）
     ------------------------------------------------------------------ */
  var TOPBAR =
    '<div class="topbar"><div class="wrap"><div>📧 <span data-site="email">sales@gaoteng-energy.com</span> &nbsp;·&nbsp; ☎ <span data-site="phone">+86 xxx xxxx xxxx</span></div>' +
    '<div class="lang"><a class="on" href="#">EN</a>|<a href="#">中文</a>|<a href="#">FR</a></div></div></div>';

  var HEADER_HTML =
    '<header><div class="wrap"><nav><a class="brand" href="#"><span class="mark"></span>' +
    '<span><b data-site="company">Gaoteng Energy</b><small data-site="tagline">Solar · Inverter · LiFePO4 Storage</small></span></a>' +
    '<div class="menu" id="gt-preview-menu"></div>' +
    '<button class="hamb">☰</button></nav></div></header>';

  var FOOTER_HTML =
    '<footer><div class="wrap"><div class="fgrid">' +
    '<div><a class="brand" href="#" style="margin-bottom:16px"><span class="mark"></span><span><b data-site="company">Gaoteng Energy</b><small data-site="tagline">Solar · Inverter · LiFePO4 Storage</small></span></a>' +
    '<p style="color:#8aa2c4" data-site="footerAbout">Reliable solar, inverter and LiFePO4 storage systems for homes, business and industry worldwide.</p></div>' +
    '<div><h4>Company</h4><a href="#">About Us</a><a href="#">Cases</a><a href="#">News</a><a href="#">Contact</a></div>' +
    '<div><h4>Products</h4><a href="#">Hybrid Inverter</a><a href="#">Solar Panel</a><a href="#">LiFePO4 Battery</a><a href="#">Solutions</a></div>' +
    '<div><h4>Contact</h4><a href="#">📧 <span data-site="email">sales@gaoteng-energy.com</span></a><a href="#">☎ <span data-site="phone">+86 xxx xxxx xxxx</span></a><a href="#">📍 <span data-site="address">[Your City], China</span></a><a href="#">💬 WhatsApp: <span data-site="whatsapp">+86 xxx xxxx xxxx</span></a></div>' +
    '</div><div class="fbottom"><span>© 2026 Gaoteng Energy. All rights reserved.</span><span>Privacy Policy · Terms of Service</span></div></div></footer>';

  var SHELL = '<!doctype html><html lang="en"><head><meta charset="utf-8"/>' +
    '<base href="/"/>' +
    '<meta name="viewport" content="width=device-width, initial-scale=1"/>' +
    '<link rel="stylesheet" href="/styles.css"/>' +
    '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Noto+Sans+SC:wght@400;500;700&family=Poppins:wght@400;500;600;700&display=swap"/>' +
    '<style>body{margin:0;-webkit-font-smoothing:antialiased}.gt-chrome{pointer-events:none}' +
    '.gt-badge{position:fixed;right:14px;bottom:14px;z-index:9999;background:rgba(13,42,77,.85);color:#fff;font:600 11px/1 -apple-system,"Segoe UI",sans-serif;padding:8px 12px;border-radius:999px;letter-spacing:.6px}</style>' +
    '</head><body>' +
    '<div class="gt-chrome">' + TOPBAR + '</div>' +
    '<div class="gt-chrome">' + HEADER_HTML + '</div>' +
    '<main id="gt-preview-main"></main>' +
    '<div class="gt-chrome">' + FOOTER_HTML + '</div>' +
    '<div class="gt-badge">实时预览 · 未发布草稿</div>' +
    '</body></html>';

  /* 默认导航（数据未加载前的占位） */
  var DEFAULT_NAV = [
    { label: "Home", link: "index.html" }, { label: "About", link: "about.html" },
    { label: "Products", link: "products.html" }, { label: "Solutions", link: "solutions.html" },
    { label: "Markets", link: "markets.html" }, { label: "Cases", link: "cases.html" },
    { label: "News", link: "news.html" }, { label: "Contact Us", link: "contact.html", highlight: true }
  ];

  function fillChrome(doc, siteOverride, navOverride) {
    var site = siteOverride || DATA.site || {};
    var nav = navOverride || DATA.nav || {};
    var nodes = doc.querySelectorAll("[data-site]");
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var k = el.getAttribute("data-site");
      if (site[k]) el.textContent = site[k];
    }
    var items = (nav.items && nav.items.length) ? nav.items : DEFAULT_NAV;
    var menu = doc.getElementById("gt-preview-menu");
    if (menu) {
      menu.innerHTML = items.map(function (it) {
        return '<a' + (it.highlight ? ' class="cta"' : '') + ' href="#">' + esc(it.label) + "</a>";
      }).join("");
    }
    var fp = doc.querySelector('[data-site="footerAbout"]');
    if (fp && nav.footerAbout) fp.textContent = nav.footerAbout;
  }

  function applyStyle(doc, style) {
    style = style || DATA.style || {};
    var root = doc.documentElement, body = doc.body;
    if (!body) return;
    if (style.fontFamily) body.style.fontFamily = style.fontFamily;
    if (style.fontSize) body.style.fontSize = style.fontSize + "px";
    if (style.bgColor) body.style.background = style.bgColor;
    if (style.primaryColor) {
      root.style.setProperty("--blue", style.primaryColor);
      root.style.setProperty("--blue2", darken(style.primaryColor, 0.15));
    }
    if (style.heroBg) {
      var hero = doc.querySelector(".hero");
      if (hero && !/photo/.test(hero.className)) {
        hero.style.backgroundImage = "linear-gradient(rgba(8,21,44,.55), rgba(8,21,44,.72)), url(" + style.heroBg + ")";
        hero.style.backgroundSize = "cover";
        hero.style.backgroundPosition = "center";
      }
    }
  }

  /* 样式预览用的示例板块 */
  var DEMO_SECTIONS = [
    { type: "hero", title: "Reliable Power for\nCommercial & Industrial Energy", subtitle: "样式预览：字体、字号、主色、背景色会实时作用到这一页。", btn1Text: "EXPLORE OUR SOLUTIONS", btn2Text: "GET A QUOTE" },
    { type: "stats", items: [{ num: "30+", label: "Years Manufacturing" }, { num: "500+", label: "Projects Delivered" }, { num: "20+", label: "Countries Served" }, { num: "5yr", label: "Product Warranty" }] },
    { type: "cards", kicker: "Style Preview", title: "Typography & Buttons", text: "下面是按钮和卡片的样式效果。", theme: "soft", columns: "3", cards: [
      { icon: "⚡", title: "Primary color", text: "按钮、链接、强调色都使用你设置的主色。" },
      { icon: "🔤", title: "Font & size", text: "整站字体与基础字号会立即变化。" },
      { icon: "🎨", title: "Page background", text: "页面背景色也跟着变。" }
    ], btnText: "BUTTON SAMPLE", btnLink: "#" },
    { type: "band", title: "Ready to Power Your Project?", text: "底部横幅与按钮同样使用主色。", btnText: "REQUEST A QUOTE" }
  ];

  /* ------------------------------------------------------------------
     4) 按栏目决定预览内容
     ------------------------------------------------------------------ */
  function previewHTML(mode, d) {
    d = d || {};
    if (mode === "style") return sectionsHTML(DEMO_SECTIONS);
    if (mode === "site" || mode === "nav") {
      return '<div style="padding:70px 0;text-align:center;color:#5b6b83;font:600 14px/1.8 -apple-system,\'Segoe UI\',sans-serif">' +
        '<div style="font-size:44px;margin-bottom:10px">⬆️</div>' +
        (mode === "site" ? "上面是导航与页脚区域 —— 这里显示你填写的公司名、电话、邮箱等。" : "上面是导航菜单 —— 这里显示你增删/排序后的菜单项。") +
        "</div>";
    }
    if (mode === "products") {
      var items = d.items || [];
      var cards = items.map(function (p) {
        return cardHTML({ kicker: p.category, title: p.name, text: p.description, icon: p.icon || "🔌", bullets: p.specs });
      }).join("");
      return BLOCKS.phead({ crumb: "实时预览", title: "产品库", text: "下面就是首页 / 产品页里自动展示的效果" }) +
        '<section style="padding:50px 0"><div class="wrap"><div class="cards">' + cards + "</div></div></section>";
    }
    if (mode === "news") {
      var arr = d.items || [];
      var h = arr.map(function (n) {
        return cardHTML({ kicker: n.date, title: n.title, text: n.body, icon: "📰" });
      }).join("");
      return BLOCKS.phead({ crumb: "实时预览", title: "新闻列表预览", text: "新闻页 / 首页新闻区块的展示效果" }) +
        '<section style="padding:50px 0"><div class="wrap"><div class="cards">' + h + "</div></div></section>";
    }
    return sectionsHTML(d.sections);
  }

  /* ------------------------------------------------------------------
     5) React 预览组件（不依赖 JSX / 打包工具）
     ------------------------------------------------------------------ */
  function makePreview(mode) {
    function Preview(props) { React.Component.call(this, props); }
    Preview.prototype = Object.create(React.Component.prototype);
    Preview.prototype.constructor = Preview;

    Preview.prototype.data = function () {
      var e = this.props && this.props.entry;
      var d = e && e.get ? e.get("data") : null;
      if (d && d.toJS) d = d.toJS();
      return d || {};
    };
    Preview.prototype.componentDidMount = function () {
      var self = this;
      this._onData = function () { self.paint(); };
      window.addEventListener("gt-preview-data", this._onData);
      setTimeout(function () { self.paint(); }, 60);
    };
    Preview.prototype.componentWillUnmount = function () {
      if (this._onData) window.removeEventListener("gt-preview-data", this._onData);
      if (this._t) clearTimeout(this._t);
    };
    Preview.prototype.componentDidUpdate = function () {
      var self = this;
      if (this._t) clearTimeout(this._t);
      this._t = setTimeout(function () { self.paint(); }, 180);
    };
    Preview.prototype.paint = function () {
      var f = this._frame;
      if (!f) return;
      var doc = null;
      try { doc = f.contentDocument; } catch (e) { return; }
      if (!doc) return;
      var main = doc.getElementById("gt-preview-main");
      if (!main) return;
      var d = this.data();
      var site = mode === "site" ? d : null;
      var nav = mode === "nav" ? d : null;
      var style = mode === "style" ? d : null;
      fillChrome(doc, site, nav);
      applyStyle(doc, style);
      main.innerHTML = previewHTML(mode, d);
    };
    Preview.prototype.render = function () {
      var self = this;
      return React.createElement("div", {
        style: { width: "100%", height: "calc(100vh - 130px)", minHeight: "620px", background: "#fff", borderRadius: "6px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,.12)" }
      }, React.createElement("iframe", {
        title: "实时预览",
        srcDoc: SHELL,
        ref: function (el) { self._frame = el; },
        onLoad: function () { self.paint(); },
        style: { width: "100%", height: "100%", border: "0", display: "block", background: "#fff" }
      }));
    };
    return Preview;
  }

  /* ------------------------------------------------------------------
     6) 预加载已发布数据（产品/新闻/站点/导航/样式）
     ------------------------------------------------------------------ */
  function loadData() {
    ["site", "nav", "products", "news", "style"].forEach(function (k) {
      fetch("/content/" + k + ".json", { cache: "no-store" })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (v) { DATA[k] = v; })
        .catch(function () { })
        .then(function () {
          try {
            window.dispatchEvent(new Event("gt-preview-data"));
          } catch (e) { }
        });
    });
  }

  /* ------------------------------------------------------------------
     7) 注册到 Decap CMS
     ------------------------------------------------------------------ */
  /* 重要（2026-09-22 修正）：
     Decap 对 type: files 的集合，查预览模板时用的是「文件的 name（slug）」，
     不是集合名（源码：selectTemplateName -> files 类型直接返回 slug）。
     所以必须按每个文件的 name 注册，否则会静默退回 Decap 自带预览。 */
  var BY_FILE = {
    "page-home": "page", "page-about": "page", "page-products": "page", "page-solutions": "page",
    "page-markets": "page", "page-cases": "page", "page-news": "page", "page-contact": "page",
    "nav-config": "nav",
    "site-config": "site",
    "products": "products",
    "news": "news",
    "style-config": "style"
  };
  /* 兼容：同时按集合名注册（以后若把集合改成 folder 类型仍然有效） */
  var BY_COLLECTION = { pages: "page", nav: "nav", site: "site", products: "products", news: "news", style: "style" };

  var REGISTER = {};
  Object.keys(BY_FILE).forEach(function (k) { REGISTER[k] = BY_FILE[k]; });
  Object.keys(BY_COLLECTION).forEach(function (k) { if (!REGISTER[k]) REGISTER[k] = BY_COLLECTION[k]; });

  G.GT_PREVIEW = { sectionsHTML: sectionsHTML, previewHTML: previewHTML, SHELL: SHELL, BLOCKS: BLOCKS, makePreview: makePreview, REGISTER: REGISTER };

  if (typeof CMS !== "undefined" && CMS && CMS.registerPreviewTemplate) {
    Object.keys(REGISTER).forEach(function (key) {
      try { CMS.registerPreviewTemplate(key, makePreview(REGISTER[key])); } catch (e) { }
    });
    if (typeof G.CMS_REGISTERED === "undefined") G.CMS_REGISTERED = true;
    try {
      console.log("[GT preview] 已注册预览模板 " + Object.keys(REGISTER).length + " 个：" + Object.keys(REGISTER).join(", "));
    } catch (e) { }
    loadData();
  }
})();
