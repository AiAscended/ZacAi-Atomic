const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const EncryptedAuditStore = require('../packages/system-core/compliance/encrypted_audit_store');
const ArtifactSigner = require('../packages/system-core/compliance/artifact_signer');

(async ()=>{
  const key = crypto.randomBytes(32);
  const audit = JSON.stringify({timestamp:Date.now(), actor:'tester', action:'test', resource:'unit', checksum:'abc123'});
  const p = path.join(__dirname,'test_audit.enc');
  EncryptedAuditStore.encryptAndWrite(p, audit, key);
  const out = EncryptedAuditStore.readAndDecrypt(p, key);
  console.log('Decrypted:', out);

  // Key pair
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {modulusLength: 2048});
  const privPem = privateKey.export({type:'pkcs1', format:'pem'});
  const pubPem = publicKey.export({type:'pkcs1', format:'pem'});

  // Create sample artifact
  const artPath = path.join(__dirname,'test_art.bin');
  fs.writeFileSync(artPath, Buffer.from('hello-artifact'));
  const sig = ArtifactSigner.signArtifact(artPath, privPem);
  const ok = ArtifactSigner.verifyArtifact(artPath, pubPem, sig);
  console.log('Signature OK?', ok);
})();
