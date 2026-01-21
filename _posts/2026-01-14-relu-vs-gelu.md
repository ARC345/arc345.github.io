---
layout: post
title: ReLU vs GELU
date: 2026-01-07 02:12
description: "Impact of Activation Curvature on Transformer Stability: GELU vs. ReLU"
tags: ai, llm, gpt, gelu, relu
categories: ai
giscus_comments: true
---

# Impact of Activation Curvature on Transformer Stability: GELU vs. ReLU

## Abstract

This study investigates the stability and performance of Gaussian Error Linear Unit (GELU) versus Rectified Linear Unit (ReLU) in a decoder-only Transformer trained on the TinyStories dataset. By subjecting both activation functions to a range of learning rates ($1e-4$, $1e-3$, $3e-3$), we empirically demonstrate that **GELU exhibits significantly greater robustness at high learning rates**. While both perform comparably at lower rates, ReLU suffers from gradient instability and degradation at $3e-3$, whereas GELU maintains stable convergence.

## 1. Methodology

### 1.1 Architecture
We utilize a 6-layer GPT model with the following configuration:
- **Embedding Dimension ($d_{model}$)**: 384
- **Heads**: 6
- **Context Window**: 128 tokens
- **Vocabulary**: 50,304 (GPT-2 tokenizer)
- **Parameters**: ~10.7M

### 1.2 Training Configuration
- **Optimizer**: AdamW ($\beta_1=0.9, \beta_2=0.95$)
- **Schedule**: Cosine Annealing (warmup not specified)
- **Iterations**: 5,000 steps per run
- **Seed**: 1337 (Fixed for deterministic reproducibility)
- **Precision**: FP32 (default)

### 1.3 Variables
We compare `nn.GELU` vs `nn.ReLU` across three learning rate regimes:
1.  **Conservative**: $\eta = 1e-4$
2.  **Aggressive**: $\eta = 1e-3$
3.  **Extreme**: $\eta = 3e-3$

## 2. Experimental Results

### 2.1 Quantitative Summary (Step 5000)

| Learning Rate | Model | Val Loss | Dead % | Act Mean | Grad Norm | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1e-4** | ReLU | **1.12** | 59.0% | 0.19 | 0.60 | Stable |
| | GELU | 1.13 | 60.5% | 0.07 | 0.57 | Stable |
| **1e-3** | ReLU | 0.87 | 92.1% | 0.08 | 0.32 | High Sparsity |
| | GELU | **0.85** | 90.4% | 0.04 | 0.31 | Optimal |
| **3e-3** | ReLU | 1.68 | 88.8% | **0.70** | **2.14** | **Unstable** |
| | GELU | **1.09** | 94.0% | 0.16 | 0.29 | Robust |

{% include figure.liquid path="assets/img/blog_embeds/reluvsgelu_trainloss.png" title="Training Loss Comparison" class="img-fluid rounded z-depth-1" %}

### 2.2 Analysis

#### Regime 1: Conservative ($1e-4$)
At lower learning rates, the performance difference is negligible. ReLU actually achieved a marginally lower validation loss (1.12 vs 1.13). Both models maintain healthy activation statistics with moderate sparsity (~60%).

#### Regime 2: Aggressive ($1e-3$)
This appears to be the "sweet spot" for this architecture/dataset. Both models improved significantly over the $1e-4$ baseline.
- **GELU** outperformed ReLU (0.85 vs 0.87).
- Sparsity increased dramatically for both (>90%), suggesting the models learned a highly efficient, sparse representation of the simple TinyStories grammar.

{% include figure.liquid path="assets/img/blog_embeds/reluvsgelu_dead_neurons.png" title="Dead Neurons Percentage" class="img-fluid rounded z-depth-1" %}

#### Regime 3: Extreme ($3e-3$)
This regime reveals the critical difference in stability.
- **ReLU Breakdown**: The ReLU model's validation loss degraded to **1.68**. 
    - **Gradient Explosion**: The final gradient norm spiked to **2.14** (vs 0.29 for GELU), indicating instability.
    - **Activation Shift**: The mean activation value jumped to 0.70, suggesting internal covariate shift.
- **GELU Robustness**: The GELU model remained perfectly stable (Val Loss 1.09), with a healthy gradient norm (0.29). The smooth curvature of GELU likely prevents the "sharp edge" gradient issues that destabilize ReLU at high step sizes.

{% include figure.liquid path="assets/img/blog_embeds/reluvsgelu_globalgradientnorm.png" title="Global Gradient Norm" class="img-fluid rounded z-depth-1" %}

{% include figure.liquid path="assets/img/blog_embeds/reluvsgelu_activationmean.png" title="Activation Mean" class="img-fluid rounded z-depth-1" %}

{% include figure.liquid path="assets/img/blog_embeds/reluvsgelu_activationstddev.png" title="Activation Standard Deviation" class="img-fluid rounded z-depth-1" %}

## 3. Conclusion

**GELU is superior for training stability.**

While ReLU is competitive and slightly faster in conservative settings, it is brittle under aggressive optimization. GELU's smooth manifold allows the optimizer to use larger learning rates ($3e-3$) without diverging, potentially accelerating training or allowing for larger batch sizes. For robust LLM training, **GELU is the safer recommendation.**

## 4. Code Availability

The code for these experiments is available in the [`experiment/relu-vs-gelu`](https://github.com/ARC345/llm-lab/tree/experiment/relu-vs-gelu) branch of the following repository:

{% include repository/repo.liquid repository="ARC345/llm-lab" %}
