# Gaoteng Energy 可视化后台（Decap CMS）使用与上线指南

> 这个后台让你**不用写代码、在浏览器里填表就能改网站**：联系方式、首页文案、主题色、产品、新闻，改完点发布自动上线。

## 后台能改什么
登录 `/admin` 后，可修改：
- **站点设置**：公司名、标语、邮箱、电话、WhatsApp、地址、主题色、首页大标题/副标题/按钮、底部行动文案、数据指标、优势三点
- **产品**：首页与产品页的卡片（类别、名称、图标、描述、参数）
- **新闻 / 博客**：新闻列表（日期、标题、正文）

> 说明：关于我们 / 解决方案 / 市场 / 案例 这四个页面的文字目前还不在后台（它们在独立文件里），要改就发给我，或我后续帮你也接进后台。其余页面（页眉、页脚的联系方式）已接入，**在后台改一次，全站同步更新**。

## 首次上线后台的 4 步（必须做，否则后台无法登录/自动上线）
后台要"改完自动上线"，必须用 **GitHub 自动部署**（不能再走"直接上传文件夹"那种方式）。

### 1. 注册 GitHub（免费，不要钱、不要国际卡）
打开 github.com → 右上 **Sign up** → 邮箱填 **liana93work@gmail.com** → 设置密码 → 验证邮箱（去收件箱点验证链接）。
> 注册成功后你会得到一个 **GitHub 用户名（username）**，长得像 `liana93work` 或你自定的名字——**把用户名告诉我**，我帮你把 `config.yml` 的 `repo:` 和 `base_url` 预填好，你后面只差做 OAuth 那步。

### 2. 建仓库并上传网站文件
- 右上角 `+` → New repository → 名字如 `gaoteng-site` → 选 **Public** → Create。
- 把 `website/` 文件夹里的**全部内容**上传到仓库，保持结构：
  `index.html`、`styles.css`、`content/`（含 site.json / products.json / news.json）、`admin/`（后台入口）、各 html、`robots.txt`、`sitemap.xml`。
- 仓库里**必须包含 `content/` 和 `admin/` 两个文件夹**，后台才工作。

### 3. Cloudflare Pages 连上 GitHub（网站自动上线）★ 本项目当前进行到这里
> ⚠️ **新版 Cloudflare 控制台菜单变了**：`Workers & Pages` 不再直接显示在左侧，它现在在 **Build → Compute** 里面。
> 两条路找到它：① 点左侧 **Compute**；② 点顶部搜索框输入 `Pages`，选 **Workers & Pages**。

1. 开 VPN，打开 **dash.cloudflare.com** 登录 → 左侧 **Compute** → 进入 **Workers & Pages**。
2. 如果里面已经有一个叫 `gaoteng-site` 的项目（之前"直接上传"建的），**先删掉它**（进项目 → Settings → 拉到最底 Delete）——否则名字会冲突。没有就跳过。

> ⚠️ 控制台首页那个「Drop a folder, or a zip」是 **Direct Upload（直接上传）**。虽然也能上线拿到免费域名，但那样第 4 步的后台**无法自动部署**，所以**不要走这条路**，要走下面的 **Connect to Git**。
3. 点 **Create** → 选 **Pages** 标签 → **Connect to Git** → 授权 Cloudflare 访问 GitHub（Authorize）。
4. 选中仓库 **`liana93work-stack/gaoteng-site`** → **Begin setup**。
5. 填表（照抄）：
   - Project name：`gaoteng-site`
   - Production branch：`main`
   - Framework preset：**None**
   - Build command：**留空**
   - Build output directory：**留空**（或填 `/`）
6. 点 **Save and Deploy** → 等 1 分钟左右 → 得到网址 **`https://gaoteng-site.pages.dev`**。

✅ 到这里网站已经正式上线。以后你（或后台）一改内容并提交，Cloudflare 会自动重新上线。

### 4. 配置后台登录（自建 OAuth 中转服务）
Decap 后台要能登录，需要一个"中转服务"把 GitHub 的登录结果传回后台。这个服务用 Cloudflare Worker 免费搭（本项目已写好代码：`oauth-worker/worker.js`）。

**顺序很重要，按 ①→②→③→④ 走：**

**① 先建 Worker（中转服务）**
- Cloudflare 左侧 **Compute** → **Workers & Pages** → **Create** → 选 **Workers** → **Create Worker**。
- 名字填 **`gaoteng-cms-auth`** → 点 **Deploy**。
- 部署后点 **Edit code** → 把 `oauth-worker/worker.js` 的**全部内容**粘贴替换进去 → 右上角 **Deploy**。
- 记下它的网址，形如：`https://gaoteng-cms-auth.你的子域.workers.dev`

**② 再去建 GitHub OAuth App**
- GitHub 头像 → **Settings** → 最左拉到底 **Developer settings** → **OAuth Apps** → **New OAuth App**。
- Application name：`Gaoteng CMS`
- Homepage URL：`https://gaoteng-site.pages.dev`
- **Authorization callback URL**：`https://gaoteng-cms-auth.你的子域.workers.dev/callback`（⚠️ 必须和第①步 Worker 网址一致，结尾是 `/callback`）
- 点 **Register application** → 记下 **Client ID** → 点 **Generate a new client secret** → 记下 **Client secret**（只显示一次，务必先存好）。

**③ 把 ID / Secret 塞回 Worker**
- 回到 Cloudflare → 打开 `gaoteng-cms-auth` 这个 Worker → **Settings** → **Variables and Secrets** → **Add**：
  - 名称 `GITHUB_CLIENT_ID`，值 = 第②步的 Client ID，类型选 **Secret**
  - 名称 `GITHUB_CLIENT_SECRET`，值 = 第②步的 Client Secret，类型选 **Secret**
- 两个都加好后，回 Worker 的代码页再点一次 **Deploy**（让变量生效）。

**④ 把 Worker 网址写进网站配置**
- 改 `website/admin/config.yml` 的第一段：
  ```yaml
  backend:
    name: github
    repo: liana93work-stack/gaoteng-site
    branch: main
    base_url: https://gaoteng-cms-auth.你的子域.workers.dev   # ← 换成第①步的真实网址
  ```
- 把改好的 `config.yml` 提交到 GitHub 仓库（覆盖原来的）→ Cloudflare 自动重新部署 → 后台就能登录了。

> 这步稍复杂，卡住就把页面截图发我，我一步步带你。

## 日常使用（上线后天天用）
1. 浏览器打开 `你的网址/admin`（如 `https://gaoteng-site.pages.dev/admin`）。
2. 点 **Login with GitHub** → 授权。
3. 左侧选「站点设置 / 产品 / 新闻」→ 改内容 → 右上角 **Publish**（发布）。
4. 等 1–2 分钟，网站自动更新。

## 改样式（颜色 / 字体）
- **主题色**：后台「站点设置 → 主题色」填十六进制（如 `#1f6dff`），全站主色立刻变。
- 其他样式（字体、间距、布局）：改 `styles.css`（不在后台，发我或你用记事本改后重新上传仓库）。

## 排错
- 后台打不开 / 登录转圈：检查 `config.yml` 的 `repo` 是否 `liana93work-stack/gaoteng-site`；`base_url` 必须是**你自己的 Worker 网址**（形如 `https://gaoteng-cms-auth.xxx.workers.dev`，**不是** pages.dev）；OAuth App 的 callback 必须是 `你的Worker网址/callback`。
- 改了内容网站没变：等 1–2 分钟自动部署；或在 Cloudflare Pages 看部署是否成功（红色=失败，看日志）。
- 国内访问 / 登 GitHub 后台：开 VPN。

## 文件清单（新增的后台相关）
- `admin/index.html` — 后台入口页
- `admin/config.yml` — 后台配置（**上线前需填 repo / base_url**）
- `content/site.json` — 站点设置数据源
- `content/products.json` — 产品数据源
- `content/news.json` — 新闻数据源
- `render.js` — 把上面 JSON 渲染到网页的桥梁（无需改动）
