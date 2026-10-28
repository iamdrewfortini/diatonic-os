# Hostinger node 1 showcase

The stable showcase is https://diatonic-os.chromatixstudios.com. GitHub Pages remains available at https://iamdrewfortini.github.io/diatonic-os/. Both serve the same four static files.

The base runs unprivileged nginx behind a ClusterIP Service. The named-tunnel overlay adds a separate Cloudflare connector; the web container has no credentials, service account token, egress or production API connection. Local hashing and media preview run in the visitor’s browser. Cluster cards are synthetic.

Render for review with `kubectl kustomize deploy/showcase-named-tunnel`. The operator must first install the bounded `diatonic-demo-low` PriorityClass, the cluster’s scoped admission exception, enforced NetworkPolicies and the node label `chromatixstudios.com/public-host=node1`. Apply the namespace and policies before workloads. Create `cloudflare-showcase-connector` with a `token` key through the authorized secret-management connection, then apply the overlay. Never commit the connector token or expose it through CI logs.

The connector mounts that Secret read-only and uses `--token-file`. Its remote tunnel configuration maps the public hostname to `http://diatonic-showcase.diatonic-showcase.svc.cluster.local:8080` and returns 404 for every other hostname. DNS is published only after both pods report ready. Rollback removes the dedicated DNS record and these two deployments; unrelated platform routes remain intact.

Both containers use pinned image digests, read-only root filesystems, dropped capabilities and bounded resources. The web requests 25m CPU/32Mi memory; the connector requests 25m/64Mi. Their priority is below private CI. This deployment uses no PVC, production worker credentials or production agent control endpoint. Asset parity and nginx configuration checks run in public CI.
