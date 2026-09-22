/* =====================================================================
   Gaoteng Energy — 页面渲染引擎
   1) 全局：站点信息 / 导航菜单 / 样式（字体·颜色·背景图）
   2) 页面：按 content/pages/<页面>.json 里的 sections 顺序拼装板块
      支持板块类型：hero / phead / stats / cards / split / table /
                    products / newslist / text / gallery / band / contact
   ===================================================================== */
(function () {
  "use strict";

  var SITE_URL = "content/site.json";
  var NAV_URL = "content/nav.json";
  var PROD_URL = "content/products.json";
  var NEWS_URL = "content/news.json";
  var STYLE_URL = "content/style.json";
  var PAGES_DIR = "content/pages/";

  /* ---------------- 工具 ---------------- */
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
  function get(u) {
    return fetch(u, { cache: "no-store" })
      .then(function (r) { return r.ok ? r.json() : null; })
      .catch(function () { return null; });
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

  /* ---------------- 内置插图（未上传图片时使用） ---------------- */
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

  /* ---------------- 卡片 ---------------- */
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

  /* ---------------- 板块渲染器 ---------------- */
  var BLOCKS = {
    hero: function (b) {
      var photo = b.image ? " photo" : "";
      var style = 'padding:0';
      if (b.image) style += ';background-image:linear-gradient(rgba(8,21,44,.62), rgba(8,21,44,.78)), url(' + esc(b.image) + ");background-size:cover;background-position:center";
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
      var th = (b.headers || []).map(function (h) { return "<th>" + esc(h) + "</th>"; }).join("");
      var rows = (b.rows || []).map(function (r) {
        return "<tr>" + ((r.cells || []).map(function (c) { return "<td>" + esc(c) + "</td>"; }).join("")) + "</tr>";
      }).join("");
      var note = b.text ? '<p style="color:var(--muted);margin-top:16px;font-size:14px">' + nl2br(b.text) + "</p>" : "";
      return '<section class="' + themeClass(b.theme) + '"><div class="wrap">' + secHead(b) +
        '<table class="spec-table">' + (th ? "<tr>" + th + "</tr>" : "") + rows + "</table>" + note + "</div></section>";
    },

    products: function (b) {
      return '<section class="' + themeClass(b.theme) + '"><div class="wrap">' + secHead(b) +
        '<div class="cards" data-gt-products></div>' + centerBtn(b.btnText, b.btnLink) + "</div></section>";
    },

    newslist: function (b) {
      return '<section class="' + themeClass(b.theme) + '"><div class="wrap">' + secHead(b) +
        '<div class="cards" data-gt-news></div>' + centerBtn(b.btnText, b.btnLink) + "</div></section>";
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
        '<a href="' + esc(b.btnLink || "contact.html") + '" class="btn light">' + esc(b.btnText || "CONTACT US") + "</a>" +
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
        '<form onsubmit="event.preventDefault();alert(\'Thank you! In the live site this form sends your message to our sales inbox.\');">' +
        '<h2 style="font-size:22px;margin-bottom:6px">' + esc(b.formTitle || "Send an Inquiry") + "</h2>" +
        '<p style="color:var(--muted);font-size:14px;margin-bottom:10px">' + esc(b.formNote || "") + "</p>" +
        '<div class="row"><div><label>Name *</label><input type="text" required placeholder="Your name"/></div>' +
        '<div><label>Company</label><input type="text" placeholder="Company name"/></div></div>' +
        '<div class="row"><div><label>Email *</label><input type="email" required placeholder="you@company.com"/></div>' +
        '<div><label>Phone / WhatsApp</label><input type="text" placeholder="+234 ..."/></div></div>' +
        '<label>Country *</label><select required><option value="">Select your country</option><option>Nigeria</option><option>Kenya</option><option>South Africa</option><option>Ghana</option><option>Egypt</option><option>India</option><option>Other</option></select>' +
        '<label>Product Interest</label><select><option>Hybrid Inverter</option><option>Solar Panel</option><option>LiFePO4 Battery</option><option>Complete System</option><option>Distributor / Wholesale</option></select>' +
        '<label>Message *</label><textarea required placeholder="Tell us your loads, quantities and target market..."></textarea>' +
        '<br/><br/><button class="btn blue" type="submit" style="width:100%">SEND INQUIRY</button></form>';
      return '<section class="' + themeClass(b.theme) + '"><div class="wrap"><div class="form-grid">' + form +
        "<div>" + cards + "</div></div></div></section>";
    }
  };

  function renderSections(list) {
    var main = document.getElementById("gt-page");
    if (!main) return;
    if (!list || !list.length) return; /* 数据为空时保留静态兜底内容 */
    var html = "";
    for (var i = 0; i < list.length; i++) {
      var b = list[i] || {};
      var fn = BLOCKS[b.type];
      if (fn) {
        try { html += fn(b); } catch (e) { /* 单个板块出错不影响其它板块 */ }
      }
    }
    if (html) main.innerHTML = html;
  }

  /* ---------------- 全局：站点信息 / 导航 ---------------- */
  function fillSite(s) {
    if (!s) return;
    var nodes = document.querySelectorAll("[data-site]");
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var k = el.getAttribute("data-site");
      if (Object.prototype.hasOwnProperty.call(s, k) && typeof s[k] === "string" && s[k]) {
        var v = s[k];
        el.textContent = v;
        var a = el.closest("a");
        if (a) {
          if (k === "email") a.href = "mailto:" + v;
          if (k === "phone") a.href = "tel:" + v.replace(/\s+/g, "");
          if (k === "whatsapp") a.href = "https://wa.me/" + v.replace(/[^\d]/g, "");
        }
      }
    }
  }

  function fillNav(n) {
    if (!n) return;
    var menu = document.getElementById("menu");
    if (menu && n.items && n.items.length) {
      var here = (location.pathname.split("/").pop() || "index.html").toLowerCase();
      menu.innerHTML = n.items.map(function (it) {
        var link = it.link || "#";
        var cls = [];
        if (it.highlight) cls.push("cta");
        if (link.toLowerCase() === here) cls.push("active");
        return '<a' + (cls.length ? ' class="' + cls.join(" ") + '"' : "") + ' href="' + esc(link) + '">' + esc(it.label) + "</a>";
      }).join("");
    }
    var fp = document.querySelector('[data-site="footerAbout"]');
    if (fp && n.footerAbout) fp.textContent = n.footerAbout;
  }

  /* ---------------- 全局：样式 ---------------- */
  function ensureFonts() {
    if (document.getElementById("gt-fonts")) return;
    var l = document.createElement("link");
    l.id = "gt-fonts";
    l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Noto+Sans+SC:wght@400;500;700&family=Poppins:wght@400;500;600;700&display=swap";
    document.head.appendChild(l);
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

  function applyStyle(s) {
    if (!s) return;
    var root = document.documentElement;
    if (s.fontFamily) document.body.style.fontFamily = s.fontFamily;
    if (s.fontSize) document.body.style.fontSize = s.fontSize + "px";
    if (s.bgColor) document.body.style.background = s.bgColor;
    if (s.primaryColor) {
      root.style.setProperty("--blue", s.primaryColor);
      root.style.setProperty("--blue2", darken(s.primaryColor, 0.15));
    }
  }

  /* 首页背景图（未在 hero 板块单独设置时生效） */
  function applyHeroFallback(s) {
    if (!s || !s.heroBg) return;
    var hero = document.querySelector(".hero");
    if (hero && !hero.className.match(/photo/)) {
      hero.style.backgroundImage = "linear-gradient(rgba(8,21,44,.55), rgba(8,21,44,.72)), url(" + s.heroBg + ")";
      hero.style.backgroundSize = "cover";
      hero.style.backgroundPosition = "center";
    }
  }

  /* ---------------- 产品 / 新闻 ---------------- */
  function productCard(p) { return cardHTML({ kicker: p.category, title: p.name, text: p.description, icon: p.icon || "🔌", bullets: p.specs }); }

  function fillProducts(arr) {
    if (!arr) return;
    var hosts = document.querySelectorAll("[data-gt-products]");
    for (var i = 0; i < hosts.length; i++) hosts[i].innerHTML = arr.map(productCard).join("");
  }

  function fillNews(arr) {
    if (!arr) return;
    var hosts = document.querySelectorAll("[data-gt-news]");
    var html = arr.map(function (n) {
      return cardHTML({ kicker: n.date, title: n.title, text: n.body, icon: "📰" });
    }).join("");
    for (var i = 0; i < hosts.length; i++) hosts[i].innerHTML = html;
  }

  /* ---------------- 启动 ---------------- */
  ensureFonts();

  var main = document.getElementById("gt-page");
  var page = main ? main.getAttribute("data-page") : "";

  var jobs = [get(SITE_URL), get(NAV_URL), get(PROD_URL), get(NEWS_URL), get(STYLE_URL)];
  if (page) jobs.push(get(PAGES_DIR + page + ".json"));

  Promise.all(jobs).then(function (res) {
    fillSite(res[0]);
    fillNav(res[1]);
    applyStyle(res[4]);
    if (page && res[5] && res[5].sections) renderSections(res[5].sections);
    fillProducts(res[2] && res[2].items);
    fillNews(res[3] && res[3].items);
    applyHeroFallback(res[4]);
  });
})();
