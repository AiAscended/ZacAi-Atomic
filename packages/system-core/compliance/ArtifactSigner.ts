import crypto from 'crypto';
import fs from 'fs';

export default class ArtifactSigner {
  static signArtifact(path: string, privateKeyPem: string): string {
    const data = fs.readFileSync(path);
    const sign = crypto.createSign('SHA256');
    sign.update(data);
    sign.end();
    const sig = sign.sign(privateKeyPem, 'base64');
    return sig;
  }

  static verifyArtifact(path: string, publicKeyPem: string, signatureBase64: string): boolean {
    const data = fs.readFileSync(path);
    const verify = crypto.createVerify('SHA256');
    verify.update(data);
    verify.end();
    return verify.verify(publicKeyPem, signatureBase64, 'base64');
  }
}
