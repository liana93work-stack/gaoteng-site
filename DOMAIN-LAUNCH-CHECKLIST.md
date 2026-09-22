# 高腾能源 · 域名购买与上线完整清单（无国际卡也能做）

> 目标：把做好的官网（`website/` 文件夹）挂到你自己的网址上
> 关键事实：**建站 + Cloudflare Pages 托管完全免费，不需要任何银行卡**
> 只有"买正式 .com 域名"要花钱——而这个可以**用支付宝/微信在国内买**，不需要国际卡
> 全程需要 **开 VPN**（Cloudflare / Google 在中国被墙，仅你在中国登录后台时需要）

---

## 零、先说清楚：没有国际卡，怎么办？

两条路，按你的情况选：

### 🟢 路 A（推荐，今天就能上线，零成本零卡）
- **不买域名**，直接用 Cloudflare Pages 送的免费子域，例如 `gaoteng-site.pages.dev`
- 不需要任何卡、不花一分钱，部署完立刻有网址、能接询盘
- 等以后办了国际卡 / 找亲友代付，再买正式 `.com` 绑上去（几分钟切换）

### 🟡 路 B（要正式 .com，但没国际卡）
- 在**国内平台（阿里云 / 腾讯云）用支付宝 / 微信**买 `.com` 域名（约 **¥70–80/年**）
- 做一次**身份证实名认证**（上传身份证，约 1 天审核；这不是 ICP 备案，不影响海外访问）
- 把域名的 DNS 改成 Cloudflare 的（免费、不需卡），再绑到 Pages
- 同样不需要国际卡

> 结论：你**现在就能把站建起来**。先走路 A 最省事；想要正式网址就走路 B。

---

## 一、域名方案（被占就换，路 B 用）
> gtsolar.com / gtpower.com / gaotengenergy.com / gaotengsolar.com 已被占，重起一批：

**A 类·纯品牌（先查，pinyin 域名常空着）：** `gaoteng.com`、`gaotengtech.com`、`gaotengglobal.com`
**B 类·长组合（越具体越可能空）：** `gaoteng-inverter.com`、`gaotenglifepo4.com`、`gtsolarafrica.com`、`gtsolarindia.com`
**C 类·英文子品牌：** `volteng.com`、`gaovolt.com`、`powergao.com`

查域名方式：开 VPN → Namecheap / Cloudflare Registrar 搜框输入 → 显示 **Available** 即未注册。

---

## 二、整体流程（路 A / 路 B 对照）

```
路 A（无卡立刻上）：
  注册 Cloudflare(免费邮箱) → Workers & Pages 上传 website/ → 得到 xxx.pages.dev → 上线！

路 B（无卡但要 .com）：
  阿里云/腾讯云 支付宝买域名 → 实名认证 → DNS 改到 Cloudflare → Pages 上传 → Custom domains 绑域名 → 上线
```

---

## 三、Step 1 — 部署网站到 Cloudflare Pages（免费，不需要卡）★ 关键一步

> 这一步路 A、路 B 都要做，且**完全免费、无需银行卡**。

1. 开 VPN，浏览器打开 **dash.cloudflare.com**，用邮箱注册/登录（免费套餐即可）。
2. 左侧 **Workers & Pages** → **Create** → 选 **Pages**。
3. 来源选 **Upload assets / Direct Upload（直接上传）**，项目名填 `gaoteng-site`（这决定免费子域 `gaoteng-site.pages.dev`）。
4. 把本地 `website/` 整个文件夹**拖拽**到上传区（里面对应有 `index.html`、`styles.css` 和各 html 页）。
5. **不用**填构建命令，直接点 **Deploy**。
6. 部署完给一个预览地址 **`https://gaoteng-site.pages.dev`** → 这就是你的官网网址（路 A 到此完成）！

> 你这套文件已含 SEO 地基（sitemap.xml / robots.txt / GA4 位 / GSC 位 / 结构化数据），直接传即可。

---

## 四、Step 2 —（仅路 B）在国内买 .com 域名（支付宝/微信，无卡）

1. 不开 VPN 也行。打开 **阿里云万网**（wanwang.aliyun.com）或 **腾讯云域名**。
2. 搜上面「一」里的名字（建议先搜 `gaoteng.com` / `volteng.com`）。
3. 显示「可注册」→ 加入购物车 → 结算时选 **支付宝 / 微信支付**（¥70–80/年）。
4. **实名认证**：按提示上传身份证照片，等待审核（通常几小时–1 天）。
5. 审核通过后域名归你。

> 为什么能在国内买？域名不分国内外，只要在 DNS 解析到海外托管（下一步），老外访问一样快、一样正常。

---

## 五、Step 3 —（仅路 B）把域名交给 Cloudflare 管理（免费，不需卡）

1. Cloudflare 控制台 → **Websites → Add a Site** → 输入你买的域名（如 `gaoteng.com`）。
2. 选免费套餐 → Cloudflare 会给出 **2 个 NS 地址**（如 `xxx.ns.cloudflare.com`）。
3. 回到阿里云/腾讯云的域名管理 → **修改 DNS / 修改 nameserver** → 填 Cloudflare 给的 2 个 NS。
4. 等 10 分钟–24 小时生效（Cloudflare 状态变 Active）。

> 改 NS 后，域名就用 Cloudflare 的免费 DNS + 免费 HTTPS，不再走国内平台解析。

---

## 六、Step 4 — 绑定域名（路 B）或 收尾（路 A）

**路 B：在 Pages 项目里绑定正式域名**
1. 进入 `gaoteng-site` Pages 项目 → 顶部 **Custom domains** → **Set up a custom domain**。
2. 输入 `gaoteng.com` → 确认 → Cloudflare **自动加 DNS 记录**，几分钟生效。
3. 打开 **https://gaoteng.com** → 官网已上线，自动 HTTPS 绿锁。

**路 A：直接收尾即可**，网址就是 `https://gaoteng-site.pages.dev`。

---

## 七、Step 5 — 替换占位 → 接 Google（两条路都要）

1. **换品牌/域名占位**（二选一）：
   - 自己改：文件里 `VoltSun Energy` → `Gaoteng Energy`，`yourdomain.com` → 你的网址；
   - 或**让我一键替换**，改完重新上传 Pages。
2. **接统计**：每个 html 里的 `G-XXXXXXX` 换成你的真实 **GA4 ID**。
3. **接收录**：`REPLACE_WITH_YOUR_GSC_VERIFICATION_CODE` 换成 **Google Search Console** 验证码。
4. **提交收录**：打开 search.google.com/search-console → 添加你的网址 → 左侧 *Sitemaps* → 提交 `sitemap.xml`。
5. **自测**：逐个点开首页/产品/联系，填一次表单看能否收到（接邮箱/WhatsApp 转发）。

---

## 八、常见坑
- **打不开 Cloudflare / Google**：确认 VPN 已开，换节点。
- **没有国际卡**：按本文「路 A / 路 B」走，根本不需要卡（买域名用支付宝）。
- **国内买域名要实名**：上传身份证即可，不是备案，不影响海外访问。
- **.com 全被占**：用 `.energy`/`.tech` 后缀，或加连字符 `gaoteng-energy.com`。
- **广告拒登**：电池/储能类目避免夸大参数，文案合规（见 `SEO-GUIDE.md`）。
- **你在国内看自己站慢/打不开**：正常，客户在非洲/印度访问很快；你看需开 VPN。

---

## 九、30 分钟速通版
路 A：Cloudflare 注册邮箱 → Pages 拖文件夹上传 → 得到 `xxx.pages.dev` → 已上线。
路 B：阿里云支付宝买 `gaoteng.com` → 实名 → DNS 改 Cloudflare NS → Pages 上传 → Custom domains 填 `gaoteng.com` → 上线。
最后统一换品牌占位 + 填 GA4/GSC + 提交 sitemap。
