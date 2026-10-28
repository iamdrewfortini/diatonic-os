# Public assembly

The public release separates product source from operational history:

- `diatonic-os`: product overview, demo, architecture and component assembly.
- `diatonic-agent-sdk`: reviewed SDK, native cell source, synthetic examples and tests.
- `diatonic-rmm`: reviewed observer/API/edge source and its tests.

GitHub is published under Drew Fortini's `iamdrewfortini` account. GitLab carries corresponding public product repositories. Both carry the same source commits. Component CI uses public dependencies and does not require access to the private estate or private package registry.

The original eight-folder workspace remains a private archive and development record. Credentials, raw infrastructure inventories, private vendor archives, system backups, deployment state, production signing material and original operational Git history are outside the public export. Public repositories start with reviewed clean histories.

Public-source sanitization may change configurable endpoints and remove private-only data from example matrices. Historical test counts from the originating environment are therefore identified as historical; the public pipelines establish the exported sources' reproducibility. Optional/private-reference tests must report their actual skip status.

The SDK distribution name remains `diatonic-meta-pipeline` for compatibility. “Diatonic Agent SDK” is its product-facing name. Publishing a source repository or unsigned candidate wheel does not authorize a production update.
