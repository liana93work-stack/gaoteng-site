# 储能官网 · Google 收录与投放图文教程

> 适用：太阳能逆变器 / 光伏板 / 磷酸铁锂电池，目标市场 非洲（尼日利亚、肯尼亚等）+ 印度
> 站点已含：robots.txt、sitemap.xml、每页标题/描述、结构化数据、GA4/Search Console 代码位

---

## 一、上线前：SEO 地基（已帮你做好 ✅）
- `robots.txt` — 告诉 Google 可抓取全部页面
- `sitemap.xml` — 列出全部 8 个页面，提交后收录更快
- 每页都有 `<title>` / `<meta description>` / 结构化数据（Organization JSON-LD）
- `index.html` 等已预留 **GA4** 与 **Google Search Console** 代码位（替换占位符即可）

---

## 二、5 步让 Google 收录你的站
1. **买域名**：Namecheap / GoDaddy / Cloudflare Registrar，如 `yourdomain.com`（约 $10/年，建议 .com）
2. **托管网站**：用 **Cloudflare Pages**（免费）→ Create project → 把 `website/` 文件夹拖拽上传
3. **绑定域名**：Cloudflare 里 *Custom domains* 添加你的域名 → 自动配 DNS + 免费 HTTPS
4. **提交 Google**：打开 [Google Search Console](https://search.google.com/search-console) → 添加属性（你的域名）→ 验证（把 GSC 验证码填进站点 `<head>` 的 `google-site-verification`）→ 左侧 *Sitemaps* 提交 `sitemap.xml`
5. **等待收录**：1–7 天后搜 `site:yourdomain.com` 能看到页面，搜产品词开始有排名

---

## 三、看数据：装 GA4
1. 打开 [analytics.google.com](https://analytics.google.com) 新建媒体资源 → 拿到 ID 形如 `G-XXXXXXX`
2. 把网站里所有 `G-XXXXXXX` 替换成你的真实 ID
3. 即可在 GA4 看：访客国家、来源、停留、哪个产品页最热

---

## 四、投广告：Google Ads（最快来询盘）
1. 注册 [ads.google.com](https://ads.google.com)（需 Visa / Master 信用卡）
2. 选 **搜索广告**，关键词示例：
   - `solar inverter Nigeria`
   - `LiFePO4 battery price`
   - `solar panel Kenya`
   - `home battery storage India`
3. 落地页指向 `products.html` / `contact.html`
4. ⚠️ **电池/能源类目注意**：避免夸大储能参数、夸大省电效果，文案要合规，否则广告易拒登

---

## 五、英文关键词 & 博客选题（直接影响谷歌排名）
**核心词**：solar inverter · LiFePO4 battery · solar panel · energy storage · off-grid solar · home battery
**长尾词**：
- solar inverter price in Nigeria
- best LiFePO4 battery India
- 5kWh home battery Kenya
- off-grid solar system for home
- BIS certified solar panel India

**建议博客选题**（每周 1 篇，≥800 词，自然带关键词）：
1. How to Size a Home Battery System (Step by Step)
2. Solar Inverter Buying Guide 2026
3. LiFePO4 vs Lead-Acid: Why LiFePO4 Wins
4. Off-Grid Solar for Nigerian Homes
5. BIS Certification for Solar Products in India
6. Reduce Your Electricity Bill with Solar + Storage

---

## 六、每周固定动作
- 发 1 篇博客（带关键词，图文并茂）
- 看 GA4：哪个国家 / 哪类产品带来询盘
- 询盘客户加 WhatsApp 跟进，沉淀到客户表
- 每月更新一次 `sitemap.xml` 里的 `changefreq` 不必改，内容更新即可

> 提示：你在中国需要用 VPN 才能登录 Google 后台、看 Analytics；但你的网站托管在海外，非洲/印度客户用 Google 正常访问、正常搜索到。
