import test from 'node:test';
import assert from 'node:assert/strict';
import {webcrypto} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {planAsset,digestBytes,verifyDigest,receipt,MAX_BYTES} from '../showcase/core.mjs';
test('local hashing verifies known bytes and reports no external effects',async()=>{const bytes=new TextEncoder().encode('abc').buffer;const hash=await digestBytes(bytes,webcrypto);assert.equal(hash,'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');const plan=planAsset({name:'clip.wav',size:3,type:'audio/wav'});const result=receipt(plan,hash,verifyDigest(hash,hash));assert.equal(result.asset.kind,'audio');assert.equal(result.verified,true);assert.equal(result.providerCalls,0);assert.equal(result.productionActions,0);});
test('changed bytes fail verification',async()=>{const a=await digestBytes(new TextEncoder().encode('a').buffer,webcrypto);const b=await digestBytes(new TextEncoder().encode('b').buffer,webcrypto);assert.equal(verifyDigest(a,b),false);assert.equal(verifyDigest('bad','bad'),false);});
test('budgets and production scopes fail closed',()=>{for(const size of [-1,MAX_BYTES+1,NaN,Infinity,1.5])assert.throws(()=>planAsset({name:'asset',size,type:'video/mp4'}));assert.throws(()=>receipt({scope:'production',externalEffects:true},'a'.repeat(64),true));});
test('showcase has no remote asset dependencies or external network permission',async()=>{const html=await readFile(new URL('../showcase/index.html',import.meta.url),'utf8');assert.match(html,/connect-src 'none'/);assert.match(html,/Drew Fortini, Founder/);assert.match(html,/10-DAY BUILD EXPLORATION/);assert.doesNotMatch(html,/<(?:script|link)[^>]+(?:src|href)=["']https?:/i);});
