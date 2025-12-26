/// Simple PCA implementation (power iteration for first principal component)
pub fn first_principal_component(data: &[Vec<f64>], iterations: usize) -> Vec<f64> {
    let n = data.len();
    if n == 0 { return vec![]; }
    let dim = data[0].len();

    // compute mean
    let mut mean = vec![0.0; dim];
    for v in data {
        for i in 0..dim { mean[i] += v[i]; }
    }
    for i in 0..dim { mean[i] /= n as f64; }

    // center data
    let mut centered: Vec<Vec<f64>> = Vec::with_capacity(n);
    for v in data {
        let mut cv = vec![0.0; dim];
        for i in 0..dim { cv[i] = v[i] - mean[i]; }
        centered.push(cv);
    }

    // initialize random vector deterministically
    let mut b = vec![1.0; dim];

    for _ in 0..iterations {
        // multiply covariance matrix by b: C * b
        let mut cb = vec![0.0; dim];
        for v in &centered {
            // compute dot = v . b
            let mut dot = 0.0;
            for i in 0..dim { dot += v[i] * b[i]; }
            for i in 0..dim { cb[i] += v[i] * dot; }
        }
        // normalize
        let norm = cb.iter().map(|x| x*x).sum::<f64>().sqrt();
        if norm == 0.0 { break; }
        for i in 0..dim { b[i] = cb[i] / norm; }
    }

    b
}

#[cfg(test)]
mod tests {
    use super::first_principal_component;
    #[test]
    fn test_pca_simple() {
        // two-dimensional data along x-axis
        let data = vec![vec![1.0, 0.0], vec![2.0, 0.0], vec![3.0, 0.0]];
        let pc = first_principal_component(&data, 20);
        assert!(pc[0].abs() > 0.9);
    }
}
