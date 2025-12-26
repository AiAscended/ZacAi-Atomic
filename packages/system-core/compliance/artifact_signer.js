const fs = require('fs');
const crypto = require('crypto');

exports.signArtifact = function(path, privateKeyPem) {
  const data = fs.readFileSync(path);
  const sign = crypto.createSign('SHA256');
  sign.update(data);
  sign.end();
  const sig = sign.sign(privateKeyPem, 'base64');
  return sig;
};

exports.verifyArtifact = function(path, publicKeyPem, signatureBase64) {
  const data = fs.readFileSync(path);
  const verify = crypto.createVerify('SHA256');
  verify.update(data);
  verify.end();
  return verify.verify(publicKeyPem, signatureBase64, 'base64');
};
