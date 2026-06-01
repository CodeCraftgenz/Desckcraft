# Auto-Update + Code Signing — Guia Portátil

Use este guia para adicionar **auto-update** + **assinatura digital** a qualquer app Tauri v2 do ecossistema CraftApps. Tudo aqui foi validado no DeskCraft 1.2.0.

---

## Pré-requisitos (uma única vez na máquina de build)

1. **Chave Tauri (rsign)** em `D:\tauri-codecraft.key` + pub em `D:\tauri-codecraft.key.pub` — **compartilhada entre todos os apps Craft**
2. **Certificado code signing** em `D:\codecraft-codesign.pfx` (self-signed por enquanto, senha `CodeCraftGenZ@2026`)
3. **Backend** em `https://api.codecraftgenz.com.br` com endpoint `/api/updates/{slug}` (já no ar)

---

## PASSO 1 — Cargo.toml

Em `src-tauri/Cargo.toml` adicione a dependência:

```toml
[dependencies]
tauri-plugin-updater = "2"
tauri-plugin-dialog = "2"
tokio = { version = "1", features = ["full"] }
log = "0.4"
```

---

## PASSO 2 — tauri.conf.json

```json
{
  "version": "1.0.0",
  "bundle": {
    "createUpdaterArtifacts": true,
    "windows": {
      "signCommand": {
        "cmd": "powershell",
        "args": [
          "-NoProfile",
          "-ExecutionPolicy", "Bypass",
          "-File", "../scripts/sign-windows.ps1",
          "%1"
        ]
      },
      "nsis": {
        "installMode": "currentUser",
        "displayLanguageSelector": false,
        "installerHooks": "./installer.nsh"
      }
    }
  },
  "plugins": {
    "updater": {
      "endpoints": ["https://api.codecraftgenz.com.br/api/updates/SEU-SLUG"],
      "pubkey": "dW50cnVzdGVkIGNvbW1lbnQ6IG1pbmlzaWduIHB1YmxpYyBrZXk6IDVBRUIxQTA3RTk0MjIyMUEKUldRYUlrTHBCeHJyV3F6T1NZNEV6WFFDREZCcHQ3cTd3cVVPOVA4TTlNNGgyTHJLWktXeGxJZmwK"
    }
  }
}
```

Substitua `SEU-SLUG` por `reflexcraft`, `vaultcraft`, etc.

---

## PASSO 3 — capabilities/default.json

```json
{
  "$schema": "https://raw.githubusercontent.com/tauri-apps/tauri/dev/crates/tauri-utils/schema/capability.json",
  "identifier": "default",
  "windows": ["main"],
  "permissions": [
    "core:default",
    "updater:default",
    "dialog:default"
  ]
}
```

---

## PASSO 4 — src-tauri/installer.nsh

Cria atalho na área de trabalho mesmo em updates silenciosos:

```nsis
!macro NSIS_HOOK_POSTINSTALL
  CreateShortCut "$DESKTOP\NOME_DO_APP.lnk" "$INSTDIR\nome-do-exe.exe" "" "$INSTDIR\nome-do-exe.exe" 0
!macroend

!macro NSIS_HOOK_POSTUNINSTALL
  Delete "$DESKTOP\NOME_DO_APP.lnk"
!macroend
```

---

## PASSO 5 — scripts/sign-windows.ps1

Copie `scripts/sign-windows.ps1` deste projeto. É genérico, funciona em qualquer app — lê `CERT_PATH` e `CERT_PASSWORD` das env vars.

---

## PASSO 6 — Rust (src-tauri/src/lib.rs)

```rust
use tauri_plugin_dialog::{DialogExt, MessageDialogButtons, MessageDialogKind};
use tauri_plugin_updater::UpdaterExt;

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            let handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                check_for_updates(handle).await;
            });
            Ok(())
        })
        // ... resto da config (.manage, .invoke_handler, etc.)
        .run(tauri::generate_context!())
        .expect("error while running app");
}

async fn check_for_updates(handle: tauri::AppHandle) {
    tokio::time::sleep(std::time::Duration::from_secs(3)).await;

    let updater = match handle.updater() {
        Ok(u) => u,
        Err(e) => { log::warn!("Updater unavailable: {}", e); return; }
    };

    let update = match updater.check().await {
        Ok(Some(u)) => u,
        Ok(None) => { log::info!("App is up to date"); return; }
        Err(e) => { log::warn!("Update check failed: {}", e); return; }
    };

    let version = update.version.clone();
    let body = update.body.clone().unwrap_or_default();
    let msg = format!(
        "Nova versão {} disponível!\n\n{}\n\nDeseja baixar e instalar agora?",
        version, body
    );

    let (tx, rx) = tokio::sync::oneshot::channel::<bool>();
    handle
        .dialog()
        .message(msg)
        .title("Atualização disponível")
        .kind(MessageDialogKind::Info)
        .buttons(MessageDialogButtons::OkCancelCustom(
            "Atualizar".to_string(),
            "Depois".to_string(),
        ))
        .show(move |answer| { let _ = tx.send(answer); });

    if !rx.await.unwrap_or(false) { return; }

    if let Err(e) = update.download_and_install(|_, _| {}, || {}).await {
        log::error!("Update install failed: {}", e);
        return;
    }
    handle.exit(0);
}
```

---

## PASSO 7 — Frontend (mostrar versão no app)

### vite.config.ts

```ts
import pkg from './package.json';

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  // ...
});
```

### Em qualquer componente React

```tsx
declare const __APP_VERSION__: string;
const APP_VERSION = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '0.0.0';

<Badge>v{APP_VERSION}</Badge>
```

---

## 🚀 COMANDOS DE RELEASE (todo app)

### Bump de versão (4 lugares)

```powershell
# Edite manualmente OU use sed/replace:
$NEW_VERSION = "1.3.0"
# package.json → "version"
# src-tauri/tauri.conf.json → "version"
# src-tauri/Cargo.toml → version
# installer/<app>.iss → #define MyAppVersion
```

### Build assinado (Tauri sign + NSIS)

```powershell
# Env vars necessárias (set uma vez, persistem no User scope):
[Environment]::SetEnvironmentVariable("TAURI_SIGNING_PRIVATE_KEY", (Get-Content "D:\tauri-codecraft.key" -Raw).Trim(), "User")
[Environment]::SetEnvironmentVariable("CERT_PATH", "D:\codecraft-codesign.pfx", "User")
[Environment]::SetEnvironmentVariable("CERT_PASSWORD", "CodeCraftGenZ@2026", "User")

# Recarregar na sessão atual:
$env:TAURI_SIGNING_PRIVATE_KEY = [Environment]::GetEnvironmentVariable("TAURI_SIGNING_PRIVATE_KEY","User")
$env:TAURI_SIGNING_PRIVATE_KEY_PASSWORD = ""
$env:CERT_PATH = [Environment]::GetEnvironmentVariable("CERT_PATH","User")
$env:CERT_PASSWORD = [Environment]::GetEnvironmentVariable("CERT_PASSWORD","User")

# Build (Tauri assina o .exe e gera .sig)
npm run tauri build
```

### Assinar Tauri signature manualmente (se não saiu automático)

```powershell
$key = (Get-Content "D:\tauri-codecraft.key" -Raw).Trim()
$exe = "src-tauri\target\release\bundle\nsis\<App>_X.Y.Z_x64-setup.exe"
npx @tauri-apps/cli signer sign "--private-key=$key" "--password=" $exe
```

### Compilar Inno Setup (instalador de primeira instalação)

```powershell
& "C:\Program Files (x86)\Inno Setup 6\ISCC.exe" installer\<app>.iss
```

### Upload SFTP para Hostinger

```python
import paramiko
exe = r'D:\CraftApps\<App>\src-tauri\target\release\bundle\nsis\<App>_X.Y.Z_x64-setup.exe'
remote = '/domains/codecraftgenz.com.br/public_html/downloads/<App>_X.Y.Z_x64-setup.exe'

t = paramiko.Transport(('147.93.37.67', 65002))
t.connect(username='u984096926', password='MafagafaGenZ@23')
sftp = paramiko.SFTPClient.from_transport(t)
sftp.put(exe, remote)
sftp.close(); t.close()
```

### Publicar release na API

```powershell
# 1. Gerar JWT admin localmente (não precisa fazer login)
$TOKEN = node -e "const jwt=require('C:/Users/ricardo.moretti/Documents/codecraftgenz-monorepo/backend/node_modules/jsonwebtoken'); console.log(jwt.sign({id:1,email:'admin@codecraft.dev',role:'admin'},'y5dsBArCHKjmihUmM5UxFtO+Vw1KTdKv9y/dj2AhZHE=',{algorithm:'HS256',expiresIn:'2h'}));"

# 2. Descobrir o ID do app
curl https://api.codecraftgenz.com.br/api/apps -H "Authorization: Bearer $TOKEN"

# 3. POST da release (substitua {ID}, version, signature)
$SIG = Get-Content "src-tauri\target\release\bundle\nsis\<App>_X.Y.Z_x64-setup.exe.sig" -Raw
$PAYLOAD = @{
  version = "X.Y.Z"
  executableUrl = "https://codecraftgenz.com.br/downloads/<App>_X.Y.Z_x64-setup.exe"
  changelog = "- Item 1`n- Item 2"
  signature = $SIG
  slug = "seu-slug"
} | ConvertTo-Json
$PAYLOAD | curl -X POST "https://api.codecraftgenz.com.br/api/apps/{ID}/release" `
  -H "Authorization: Bearer $TOKEN" `
  -H "Content-Type: application/json" `
  -d "@-"
```

---

## Atalho — só falar "craftinfra, publica X versão Y"

O agente `craft-infra` (em `~/.claude/agents/craft-infra.md`) tem **todas essas instruções** registradas. Em vez de fazer manual, basta:

> *"craftinfra, publica ReflexCraft 0.3.0"*

Ele executa os 7 passos sozinho.

---

---

## 🪟 Apps .NET (WPF / WinForms) — auto-update simplificado

Aplicável a **CoinCraft, QuizCraft, StudyCraft, PresenceCraft** e qualquer .NET novo.
**Não usam assinatura Tauri** (só Tauri exige `.sig`) — campo `signature` pode ser string vazia.

### PASSO A — `Services/UpdateService.cs` (WPF .NET 6/7/8/9)

```csharp
using System;
using System.Diagnostics;
using System.Net.Http;
using System.Reflection;
using System.Text.Json;
using System.Threading.Tasks;
using System.Windows;

namespace SeuApp.Services
{
    public class UpdateService
    {
        private static readonly HttpClient _http = new HttpClient { Timeout = TimeSpan.FromSeconds(10) };
        private readonly string _slug;
        private const string BaseUrl = "https://api.codecraftgenz.com.br/api/updates/";

        public UpdateService(string slug) { _slug = slug; }

        public async Task CheckForUpdatesAsync()
        {
            try
            {
                var response = await _http.GetAsync($"{BaseUrl}{_slug}");
                if (!response.IsSuccessStatusCode) return;

                using var doc = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
                var root = doc.RootElement;

                if (!root.TryGetProperty("version", out var versionEl)) return;
                var remoteVersionStr = versionEl.GetString();
                if (string.IsNullOrEmpty(remoteVersionStr)) return;
                if (!Version.TryParse(remoteVersionStr, out var remoteVersion)) return;

                var currentVersion = Assembly.GetExecutingAssembly().GetName().Version;
                if (currentVersion == null || remoteVersion <= currentVersion) return;

                string? downloadUrl = null;
                if (root.TryGetProperty("platforms", out var platforms) &&
                    platforms.TryGetProperty("windows-x86_64", out var winPlatform) &&
                    winPlatform.TryGetProperty("url", out var urlEl))
                    downloadUrl = urlEl.GetString();

                if (string.IsNullOrEmpty(downloadUrl)) return;

                string notes = root.TryGetProperty("notes", out var notesEl) ? notesEl.GetString() ?? "" : "";

                var result = MessageBox.Show(
                    $"Nova versão {remoteVersionStr} disponível!\n\n{notes}\n\nDeseja baixar e instalar agora?",
                    "Atualização disponível",
                    MessageBoxButton.YesNo,
                    MessageBoxImage.Information);

                if (result == MessageBoxResult.Yes)
                    Process.Start(new ProcessStartInfo { FileName = downloadUrl, UseShellExecute = true });
            }
            catch { /* falha silenciosa — update nunca trava o app */ }
        }
    }
}
```

### PASSO B — WinForms .NET 6+

Mesmo código, trocando os `using` e dialog:
- `System.Windows` → `System.Windows.Forms`
- `MessageBoxButton.YesNo` → `MessageBoxButtons.YesNo`
- `MessageBoxImage.Information` → `MessageBoxIcon.Information`
- `MessageBoxResult.Yes` → `DialogResult.Yes`

### PASSO C — WinForms .NET Framework 4.x (PresenceCraft)

Usar `Newtonsoft.Json` em vez de `System.Text.Json`:
```csharp
using Newtonsoft.Json.Linq;

var obj = JObject.Parse(json);
var remoteVersionStr = obj["version"]?.ToString();
// ... lógica equivalente
```

### PASSO D — `.csproj` precisa de `<AssemblyVersion>`

```xml
<PropertyGroup>
  <AssemblyVersion>1.0.0.0</AssemblyVersion>
</PropertyGroup>
```

Formato semver de 4 partes: `MAJOR.MINOR.PATCH.BUILD`.

### PASSO E — Disparar no startup

#### WPF (`App.xaml.cs`)
```csharp
protected override async void OnStartup(StartupEventArgs e)
{
    base.OnStartup(e);
    // ... resto do startup
    _ = Task.Run(async () =>
    {
        await Task.Delay(3000);
        await new SeuApp.Services.UpdateService("seu-slug").CheckForUpdatesAsync();
    });
}
```

#### WinForms .NET 6+ (`Program.cs`)
```csharp
Task.Run(async () =>
{
    await Task.Delay(3000);
    await new UpdateService("seu-slug").CheckForUpdatesAsync();
});
Application.Run(new Form1());
```

#### WinForms .NET 4.x (`Program.cs`)
```csharp
Task.Run(() => new UpdateService("seu-slug").CheckForUpdatesAsync());
Application.Run(new Form1());
```

### Release de .NET — POST simplificado (sem signature)

```bash
curl -X POST https://api.codecraftgenz.com.br/api/apps/{ID}/release \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "version": "1.1.0",
    "executableUrl": "https://codecraftgenz.com.br/downloads/QuizCraft-Setup-1.1.0.exe",
    "changelog": "- Item 1\n- Item 2",
    "signature": "",
    "slug": "quizcraft"
  }'
```

> ⚠️ **Diferença crítica vs Tauri:** apps .NET **abrem o instalador no navegador** (via `Process.Start` + URL). O usuário precisa rodar o setup manualmente. Tauri faz download + instala automático.
>
> Para .NET dar UX igual ao Tauri, seria preciso baixar o .exe + executar em silent mode — não está nesta versão do template.

---

## Slugs dos apps

| App | Slug | ID API |
|---|---|---|
| DeskCraft | `deskcraft` | 11 |
| ReflexCraft | `reflexcraft` | (descobrir via `/api/apps`) |
| VaultCraft | `vaultcraft` | (descobrir via `/api/apps`) |
| SnippetCraft | `snippetcraft` | (descobrir via `/api/apps`) |
| CoinCraft2 | `coincraft2` | (descobrir via `/api/apps`) |

---

## Pegadinhas que custaram horas (já resolvidas)

1. **`dialog: true`** no plugins.updater é Tauri v1, **atrapalha o v2**. Não use.
2. **`createUpdaterArtifacts: true`** é OBRIGATÓRIO em Tauri v2 para gerar `.sig`.
3. `tauri signer sign --private-key=<path>` causa `failed to decode base64: Invalid symbol 58` — passe o **CONTEÚDO** da chave, não o path. E use sintaxe `--flag=valor` com `=`.
4. `TAURI_SIGNING_PRIVATE_KEY` env var sozinha **não basta** para o subcomando `signer sign`. Funciona só para `tauri build`.
5. **Tauri não expande `%VAR%` em signCommand** — use wrapper PowerShell que lê env vars (como `scripts/sign-windows.ps1`).
6. **NSIS template padrão não cria atalho no desktop em silent install** (caminho do auto-update) — use `installerHooks` + `NSIS_HOOK_POSTINSTALL`.
7. Path correto SFTP: `~/domains/codecraftgenz.com.br/public_html/downloads/` (não `~/downloads/` — Hostinger nginx serve estático de lá).
8. Bug do backend: a rota `/api/auth/users/admin/reset-password` exige `authorizeAdmin` antes do controller que valida o token de bypass, então o `ADMIN_RESET_TOKEN` é inacessível. Gerar JWT localmente com o `JWT_SECRET` resolve.
