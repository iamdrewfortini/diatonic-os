# Public showcase on Hostinger node 1

**Live:** https://diatonic-os.chromatixstudios.com/

[GitHub Pages](https://iamdrewfortini.github.io/diatonic-os/) is the persistent fallback. The node 1 service and Pages use the same four static application files. The named tunnel replaces the temporary Quick Tunnel used during initial verification.

## Apply

The operator first provisions the `diatonic-demo-low` PriorityClass, scoped cluster admission, enforced NetworkPolicies and node label `chromatixstudios.com/public-host=node1`. Provision `cloudflare-showcase-connector` with a `token` key through the authorized secret-management connection. The credential remains outside the repository and public CI.

Copy this `deploy` tree to the labeled native k3s node, review it, then run:

```sh
sudo python3 deploy/apply-on-node1.py --mode named
```

The stdlib helper checks node identity/readiness, renders the overlay, constrains resource kinds and namespace, and derives public IPv4 exclusions from the node's interfaces. It patches the rendered connector policy before applying any workload. Namespace and deny policies are installed first; a server dry-run and the full apply use the same patched payload. Reapplying preserves site-specific egress exclusions. Both deployments must become Ready.

Render the portable source for inspection with `kubectl kustomize deploy/showcase-named-tunnel`. The optional `--mode quick` uses the temporary, accountless overlay; its URL changes on restart and has no uptime guarantee.

## Runtime

The digest-pinned nginx container serves only static files through a ClusterIP Service. It has no service account token, credentials or egress. The separate digest-pinned cloudflared container mounts the connector Secret read-only and uses `--token-file`. Its remote configuration maps only the branded hostname to the showcase Service and returns 404 for other hosts. DNS is published after connector readiness.

Both containers run without root, with read-only root filesystems, dropped capabilities and bounded resources. Web requests 25m CPU/32Mi memory; connector requests 25m/64Mi. Their -300 priority is below private CI. No PVC or production agent control endpoint is exposed. The web is reachable only from the tunnel; tunnel egress permits DNS, the web and public Cloudflare transport, with private and node addresses excluded.

## Verification and rollback

Public CI checks source/asset parity, nginx configuration and two browser workflows. The manually dispatched `Hosted showcase acceptance` workflow runs those browser scenarios against the actual HTTPS endpoint without cluster credentials. Live asset hashes were compared with repository files after activation. Local hashing and media preview run in the visitor's browser; cluster cards are synthetic.

Rollback removes the dedicated public DNS record and these two deployments. Preserve unrelated platform routes and private CI resources. Keep GitHub Pages available during maintenance.
