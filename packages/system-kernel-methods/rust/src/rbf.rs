use std::f64;

pub fn rbf(x: &[f64], y: &[f64], gamma: f64) -> f64 {
    let mut sum = 0.0;
    for (a, b) in x.iter().zip(y.iter()) {
        let d = a - b;
        sum += d * d;
    }
    (-gamma * sum).exp()
}

#[cfg(test)]
mod tests {
    use super::rbf;
    #[test]
    fn test_rbf_same() {
        let x = [1.0, 2.0, 3.0];
        assert!((rbf(&x, &x, 0.5) - 1.0).abs() < 1e-12);
    }
}
