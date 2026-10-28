#!/usr/bin/env python3
"""Apply the static showcase on its labeled native k3s node, preserving host egress exclusions."""
import argparse, ipaddress, json, pathlib, socket, subprocess

def require(condition, message):
    if not condition:
        raise RuntimeError(message)

def command(args, data=None):
    result = subprocess.run(args, input=data, text=True, capture_output=True, timeout=150)
    if result.returncode:
        raise RuntimeError('Command failed: ' + ' '.join(args[:5]) + '\n' + result.stderr)
    return result.stdout

def decode_documents(text):
    decoder, documents = json.JSONDecoder(), []
    while text.strip():
        value, end = decoder.raw_decode(text.lstrip())
        documents.extend(value['items'] if value.get('kind') == 'List' else [value])
        text = text.lstrip()[end:]
    return documents

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--mode', choices=('quick', 'named'), required=True)
    args = parser.parse_args()
    root = pathlib.Path(__file__).resolve().parent
    kubectl = ['k3s', 'kubectl']
    nodes = json.loads(command(kubectl + ['get', 'nodes', '-l', 'chromatixstudios.com/public-host=node1', '-o', 'json']))['items']
    require(len(nodes) == 1 and nodes[0]['metadata']['name'] in {socket.gethostname(), socket.gethostname().split('.')[0]}, 'Run on the labeled node itself')
    require(not nodes[0].get('spec', {}).get('unschedulable', False), 'The selected node is unschedulable')
    require(any(c.get('type') == 'Ready' and c.get('status') == 'True' for c in nodes[0].get('status', {}).get('conditions', [])), 'The selected node is not Ready')
    interfaces = json.loads(command(['ip', '-j', '-4', 'addr']))
    addresses = sorted({str(ipaddress.ip_address(a['local'])) + '/32'
        for interface in interfaces for a in interface.get('addr_info', [])
        if a.get('family') == 'inet' and ipaddress.ip_address(a['local']).is_global})
    require(addresses, 'Cannot establish public node address exclusions')
    overlay = root / ('showcase-quick-tunnel' if args.mode == 'quick' else 'showcase-named-tunnel')
    rendered = command(kubectl + ['kustomize', str(overlay)])
    resources = decode_documents(command(kubectl + ['create', '--dry-run=client', '--validate=false', '-f', '-', '-o', 'json'], rendered))
    allowed = {'Namespace', 'ResourceQuota', 'ConfigMap', 'Service', 'Deployment', 'NetworkPolicy'}
    require(all(r['kind'] in allowed for r in resources), 'Only showcase resources may be applied; provision credentials separately')
    require(all(r['kind'] == 'Namespace' or r['metadata'].get('namespace') == 'diatonic-showcase' for r in resources), 'All resources must target the showcase namespace')
    policies = [r for r in resources if r['kind'] == 'NetworkPolicy']
    target = [r for r in policies if r['metadata']['name'] == 'showcase-tunnel-egress']
    require(len(target) == 1, 'Expected one connector egress policy')
    blocks = [dst['ipBlock'] for rule in target[0]['spec']['egress'] for dst in rule.get('to', []) if dst.get('ipBlock', {}).get('cidr') == '0.0.0.0/0']
    require(len(blocks) == 1, 'Expected one public egress block')
    blocks[0]['except'] = sorted(set(blocks[0]['except'] + addresses))
    namespace = [r for r in resources if r['kind'] == 'Namespace']
    require(len(namespace) == 1 and namespace[0]['metadata']['name'] == 'diatonic-showcase', 'Expected the showcase namespace only')
    def apply(objects):
        payload = json.dumps({'apiVersion': 'v1', 'kind': 'List', 'items': objects})
        command(kubectl + ['apply', '--dry-run=server', '-f', '-'], payload)
        command(kubectl + ['apply', '-f', '-'], payload)
    apply(namespace)
    # Establish deny rules before creating any workloads; the full apply uses the SAME patched policies.
    apply(policies)
    apply(resources)
    for deployment in ('diatonic-showcase-web', 'diatonic-showcase-tunnel'):
        command(kubectl + ['-n', 'diatonic-showcase', 'rollout', 'status', 'deployment/' + deployment, '--timeout=120s'])
    print(json.dumps({'status': 'ready', 'mode': args.mode, 'host_public_addresses_excluded': len(addresses), 'rendered_policy_patched': True}))

if __name__ == '__main__':
    main()
