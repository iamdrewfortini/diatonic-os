export const MAX_BYTES = 100 * 1024 * 1024;
export const sample = Object.freeze({cluster:'Demo cluster',nodes:3,services:8,mode:'Synthetic infrastructure fixture'});
export function planAsset(asset) {
  if (!asset || typeof asset.name !== 'string' || !Number.isSafeInteger(asset.size) || asset.size < 0 || asset.size > MAX_BYTES) throw new Error('Choose an asset no larger than 100 MiB.');
  const kind = asset.type?.startsWith('video/') ? 'video' : asset.type?.startsWith('audio/') ? 'audio' : 'file';
  return {scope:'local-browser-demo',kind,name:asset.name,bytes:asset.size,steps:['Observe local metadata','Check the demo resource budget','Compute SHA-256 locally','Verify the original bytes'],externalEffects:false};
}
export async function digestBytes(bytes, cryptoProvider=globalThis.crypto) {
  if (!(bytes instanceof ArrayBuffer) || bytes.byteLength > MAX_BYTES) throw new Error('Bounded local asset required.');
  return Array.from(new Uint8Array(await cryptoProvider.subtle.digest('SHA-256',bytes)),b=>b.toString(16).padStart(2,'0')).join('');
}
export function verifyDigest(expected, actual) { return typeof expected==='string' && /^[a-f0-9]{64}$/.test(expected) && expected===actual; }
export function receipt(plan, hash, verified) {
  if(plan.scope!=='local-browser-demo' || plan.externalEffects!==false || !/^[a-f0-9]{64}$/.test(hash)) throw new Error('A bounded demo plan and digest are required.');
  return {schema:'diatonic-showcase-v1',project:'Diatonic OS',studio:'Chromatix Studios',scope:plan.scope,asset:{name:plan.name,bytes:plan.bytes,kind:plan.kind},sha256:hash,verified:verified===true,providerCalls:0,productionActions:0};
}
