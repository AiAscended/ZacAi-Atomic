const fs = require('fs');
const crypto = require('crypto');

exports.encryptAndWrite = function(path, data, key) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(data, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  const out = Buffer.concat([iv, tag, encrypted]);
  fs.writeFileSync(path, out);
};

exports.readAndDecrypt = function(path, key) {
  const raw = fs.readFileSync(path);
  const iv = raw.slice(0, 16);
  const tag = raw.slice(16, 32);
  const encrypted = raw.slice(32);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  const out = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return out.toString('utf8');
};
