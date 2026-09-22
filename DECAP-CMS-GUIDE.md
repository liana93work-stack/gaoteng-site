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

### 3. Cloudflare Pages 改成"连 GitHub 自动部署"
- Cloudflare 控制台 → Workers & Pages → 删掉之前那个 `gaoteng-site`（Direct Upload 项目）。
- 新建 **Create → Pages → 连 GitHub**（授权 Cloudflare 访问 GitHub）→ 选刚建的仓库 → Framework preset 选 **None** → 构建命令留空 → 部署。
- 此后你一改内容并提交，Cloudflare 自动重新上线。

### 4. 建 GitHub OAuth App（让后台能登录）
- GitHub 头像 → Settings → Developer settings → OAuth Apps → **New OAuth App**。
- Application name：Gaoteng CMS（随意）
- Homepage URL：`https://gaoteng-site.pages.dev`（换成你最终网址）
- **Authorization callback URL：`https://decap-cms.github.io/auth.html`**
- 创建后拿到 **Client ID**，并 Generate 拿到 **Client secret**（都先记下）。
- 打开本地的 `website/admin/config.yml`，改两处：
  - `repo: YOUR_GITHUB_USERNAME/YOUR_REPO_NAME` → 改成你的 `用户名/仓库名`
  - `base_url: https://gaoteng-site.pages.dev` → 改成你最终网址（用了自定义域名就填自定义域名）
- 把改好的 `config.yml` 重新上传覆盖到 GitHub 仓库。

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
- 后台打不开 / 登录转圈：检查 `config.yml` 的 `repo`、`base_url` 是否填对；OAuth App 的 callback 是否 `https://decap-cms.github.io/auth.html`。
- 改了内容网站没变：等 1–2 分钟自动部署；或在 Cloudflare Pages 看部署是否成功（红色=失败，看日志）。
- 国内访问 / 登 GitHub 后台：开 VPN。

## 文件清单（新增的后台相关）
- `admin/index.html` — 后台入口页
- `admin/config.yml` — 后台配置（**上线前需填 repo / base_url**）
- `content/site.json` — 站点设置数据源
- `content/products.json` — 产品数据源
- `content/news.json` — 新闻数据源
- `render.js` — 把上面 JSON 渲染到网页的桥梁（无需改动）
