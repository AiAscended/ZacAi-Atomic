pub fn gram_matrix(data: &[Vec<f64>], kernel: &dyn Fn(&[f64], &[f64]) -> f64) -> Vec<Vec<f64>> {
    let n = data.len();
    let mut g = vec![vec![0.0; n]; n];
    for i in 0..n {
        for j in 0..n {
            g[i][j] = kernel(&data[i], &data[j]);
        }
    }
    g
}
