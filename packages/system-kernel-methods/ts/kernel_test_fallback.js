// Quick JS fallback kernel test (node)
function sqDist(a, b) {
  let s = 0.0;
  for (let i = 0; i < a.length; i++) {
    const d = a[i] - b[i];
    s += d * d;
  }
  return s;
}

function rbf(a, b, sigma = 1.0) {
  const d2 = sqDist(a, b);
  return Math.exp(-d2 / (2 * sigma * sigma));
}

function polynomial(a, b, degree = 2, coef0 = 1) {
  let dot = 0.0;
  for (let i = 0; i < a.length; i++) dot += a[i] * b[i];
  return Math.pow(dot + coef0, degree);
}

const a = [1,2,3];
const b = [1,2,2];
console.log('RBF:', rbf(a,b,1.0));
console.log('Poly:', polynomial(a,b,2,1));
