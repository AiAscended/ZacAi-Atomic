pub trait Kernel {
    fn compute(&self, x: &[f64], y: &[f64]) -> f64;
}

pub trait FitKernel {
    fn fit(&mut self, data: &[Vec<f64>]);
}

pub trait TransformKernel {
    fn transform(&self, data: &[Vec<f64>]) -> Vec<Vec<f64>>;
}
