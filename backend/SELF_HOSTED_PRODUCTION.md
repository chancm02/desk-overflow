# Desk Overflow — Permanent self-hosted lead receiver (no subscription)

**Status: production readiness plan.** This is NOT a verified deployment. Keep the public website's manual-email fallback in place until the safety and connectivity checks pass. The Cloudflare Quick Tunnel used in tests is intentionally **not** the production connection.

## Architecture

Desk Overflow GitHub Pages `<form method="POST" action="https://YOURNAME.duckdns.org/submit">`
 → internet HTTPS 443 → router forwards only 80 and 443 to the server PC
 → Caddy reverse proxy → localhost `127.0.0.1:8765`
 → local Python lead server → SQLite at `%LOCALAPPDATA%\DeskOverflow\leads.sqlite3`.

DuckDNS is only the DNS name, not the database. Caddy handles free TLS certificates. No paid hosting or per-lead charges. You still depend on your ISP's network, DuckDNS's free DNS service, and certificate authorities.

## Prerequisites, before router changes

1. A Windows computer that is running Python and passed the Cloudflare Quick Tunnel public-to-PC test.
2. Reliable broadband connectivity and permissions to update the home router.
3. A **publicly routable address** on the WAN side of the router. Some home/mobile ISPs use **carrier-grade NAT (CGNAT)**. If your router's WAN IPv4 is in 100.64.0.0/10, 10.0.0.0/8, 172.16.0.0/12 or 192.168.0.0/16, or differs from the public external address due to provider NAT, simple IPv4 port forwarding may not work. *Do not expose router credentials to ChatGPT.*
4. ISP allows running a small web service and incoming TCP ports 80 and 443.
5. Decide whether to run on a separate, patched PC instead of an everyday workstation.

**Stop here** if you do not have a routable address, cannot edit the router, or cannot maintain the PC and a secure backup. Use a production-grade named tunnel with a domain or another suitable hosting solution instead.

## Create a free stable hostname

1. Visit https://www.duckdns.org/ and register a free name, such as `deskovflw-example.duckdns.org` (the exact name must be chosen and available).
2. In DuckDNS, set your subdomain's IPv4 record to the correct public WAN IPv4 of your internet connection.
3. Configure a periodic DNS update on the PC or router to handle changing public IPs. DuckDNS officially provides a secure HTTPS update API:
   `https://www.duckdns.org/update?domains=YOUR_SUBDOMAIN&token=YOUR_SECRET_TOKEN`
4. **Never paste your DuckDNS token in chat, website source code, or GitHub**. Run the updater locally with its token in a private configuration, not in public scripts. Never include tokens in a copied screenshot.

Reference: https://www.duckdns.org/spec.jsp

## Configure a secure reverse proxy

1. Download Caddy for Windows from https://caddyserver.com/download and use the Windows x64 build for the matching PC. Keep the executable in a protected local folder.
2. Create a `Caddyfile` in that folder. Replace `YOUR_SUBDOMAIN` with your actual registered DuckDNS name:

```caddyfile
YOUR_SUBDOMAIN.duckdns.org {
    @allowed {
        path / /health /submit
    }
    handle @allowed {
        reverse_proxy 127.0.0.1:8765
    }
    handle {
        respond "Not Found" 404
    }
}
```

3. Launch the Python server normally so that `http://127.0.0.1:8765/health` works locally.
4. Run Caddy from a local Command Prompt in the same folder as `Caddyfile`: `caddy.exe run --config Caddyfile`.
5. Caddy automatically requests and renews HTTPS certificates for public DNS hostnames when publicly reachable. That requires DNS resolving to your network and inbound TCP ports 80/443 reaching Caddy. Do not use an insecure self-signed certificate or disable certificate verification for your lead-capture endpoint.

Caddy docs: https://caddyserver.com/docs/quick-starts/reverse-proxy

## Router and firewall (manual)

1. Give the server PC a **DHCP reservation** on your local network so its internal IPv4 does not change.
2. Forward inbound **TCP 80 and 443 only** from the router to that server PC's internal IPv4 and the corresponding 80/443 TCP ports. Allow only the necessary ports in Windows Firewall.
3. **Never forward port 8765 to the internet.** Python binds only to localhost and should remain that way.
4. Avoid UPnP rules, DMZ mode, exposing database or file shares, or turning off the firewall.
5. Review the ISP's restrictions and router's current WAN address. If CGNAT prevents incoming connections, **do not continue with port forwarding workarounds blindly**.

## End-to-end verification before going live

1. From your PC, confirm: `http://127.0.0.1:8765/health` returns `Desk Overflow local intake running`.
2. From a **separate network** (e.g. phone using cellular, not Wi-Fi), open `https://YOUR_SUBDOMAIN.duckdns.org/health`, with a valid HTTPS lock and the same health result. The temporary Cloudflare tunnel must NOT be the endpoint.
3. Submit a fake contact record using a test HTML form with method POST and action `https://YOUR_SUBDOMAIN.duckdns.org/submit`; confirm you get the branded success page and the new test record appears with `py -3 view_leads.py`.
4. Restart the PC and router separately; verify the backend and Caddy restart automatically and DNS keeps working. Verify that certificate renewal and SQLite backups can be maintained.
5. Check invalid field, repeat submission, oversized payload, and direct-path requests remain rejected.
6. Introduce spam protection and operational monitoring before buying ads. The starter server has basic rate limiting and a honeypot but is not production-hardened. Make regular SQLite backups and restore-test them.
7. When those checks pass, provide the stable `https://YOUR_SUBDOMAIN.duckdns.org` URL (without any DuckDNS token) to ChatGPT. The assistant can then change the website form action to the **permanent** `/submit`, remove the manual email-draft fallback, update the website privacy policy, and retest it.

## Uptime, privacy, and alerts

- The computer and your internet must be running all day, every day. PC sleep, power failure, router restart, DNS outage or ISP downtime means **no leads will be accepted**. This setup does not queue submissions while offline.
- SQLite stores private inquiries on the PC. Protect it with OS account security/full-disk encryption and local backups.
- The provided backend does **not** send email alerts. Review leads on the PC using `view_leads.py`. Desktop notifications can be added later; delivering email to an external inbox still requires access to an email server/provider.
- Before production use, evaluate whether disclosing your home IP through DuckDNS creates a security or privacy concern. A named outbound tunnel avoids incoming ports and publicizing the WAN IP, but involves a network intermediary and stable DNS domain.
- A free DuckDNS subdomain or internet access is not a promise of 100% uptime; production use is at your own risk.

## Official references

- DuckDNS free DNS: https://www.duckdns.org/
- DuckDNS update API: https://www.duckdns.org/spec.jsp
- Caddy reverse proxy and HTTPS: https://caddyserver.com/docs/quick-starts/reverse-proxy
- Cloudflare Quick Tunnels are only for testing: https://developers.cloudflare.com/tunnel/get-started/quick-tunnels/
