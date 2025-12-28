#![allow(dead_code)]

pub mod traits;
pub mod kernel_matrix;
pub mod rbf;
pub mod polynomial;
pub mod pca;

pub use traits::*;
pub use kernel_matrix::*;
pub use rbf::*;
pub use polynomial::*;
pub use pca::*;

// Simple convenience exports
pub fn rbf_kernel_batch(x: &[f64], y: &[f64], gamma: f64) -> f64 {
    rbf::rbf(x, y, gamma)
}

pub fn polynomial_kernel(x: &[f64], y: &[f64], degree: u32, coef0: f64) -> f64 {
    polynomial::polynomial(x, y, degree, coef0)
}

#[cfg(feature = "wasm")]
use wasm_bindgen::prelude::*;

#[cfg(feature = "wasm")]
#[wasm_bindgen]
pub fn wasm_rbf(x: Box<[f64]>, y: Box<[f64]>, gamma: f64) -> f64 {
    rbf::rbf(&x, &y, gamma)
}

#[cfg(feature = "wasm")]
#[wasm_bindgen]
pub fn wasm_polynomial(x: Box<[f64]>, y: Box<[f64]>, degree: u32, coef0: f64) -> f64 {
    polynomial::polynomial(&x, &y, degree, coef0)
}
