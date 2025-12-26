pub fn polynomial(x: &[f64], y: &[f64], degree: u32, coef0: f64) -> f64 {
    let mut dot = 0.0;
    for (a, b) in x.iter().zip(y.iter()) {
        dot += a * b;
    }
    (dot + coef0).powi(degree as i32)
}

#[cfg(test)]
mod tests {
    use super::polynomial;
    #[test]
    fn test_polynomial_basic() {
        let x = [1.0, 2.0];
        let y = [1.0, 0.0];
        assert_eq!(polynomial(&x, &y, 2, 0.0), 1.0);
    }
}
