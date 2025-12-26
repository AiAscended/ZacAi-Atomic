import fs from 'fs';
import crypto from 'crypto';

export default class EncryptedAuditStore {
  static encryptAndWrite(path: string, data: string, key: Buffer) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    const encrypted = Buffer.concat([cipher.update(data, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    const out = Buffer.concat([iv, tag, encrypted]);
    fs.writeFileSync(path, out);
  }

  static readAndDecrypt(path: string, key: Buffer): string {
    const raw = fs.readFileSync(path);
    const iv = raw.slice(0, 16);
    const tag = raw.slice(16, 32);
    const encrypted = raw.slice(32);
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);
    const out = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return out.toString('utf8');
  }
}
