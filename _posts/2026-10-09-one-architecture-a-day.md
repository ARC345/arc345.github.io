---
layout: post
title: One Architecture a Day
date: 2026-10-09 12:00
description: "Implementing the major LLM architectures from scratch at mini scale, one per day, and comparing them on equal terms"
tags: ai, llm, transformers, moe, ssm, bitnet, architectures
categories: ai
giscus_comments: true
---

# One Architecture a Day

Starting today I'm implementing the major LLM architectures from scratch, one per day, at mini scale, on Kaggle GPUs. Every model uses a character-level tokenizer.

---

## Why bother

The goal isn't a pile of "build X from scratch" tutorials. It's a fair comparison. If two models differ in data, token budget, or size as well as architecture, you can't tell which of those made the difference.

So every architecture goes through the same setup:

- one shared training harness
- the same data <!-- TODO: dataset -->
- the same token budget
- matched parameter counts
- the same evaluation

The first day or two go into building the harness and a GPT-2 baseline, and checking that baseline against published character-level transformer results. If the baseline is off, everything compared to it is off too. After that, it's one architecture a day.

---

## Planned lineup

This is the plan. It may change.

| #   | Architecture                         | Notes                      |
| :-- | :----------------------------------- | :------------------------- |
| 1   | GPT-2                                | Baseline                   |
| 2   | Llama-style                          | RoPE, SwiGLU, RMSNorm, GQA |
| 3   | Mixture-of-Experts                   |                            |
| 4   | Mamba-2                              |                            |
| 5   | RWKV / linear attention              |                            |
| 6   | Hybrid attention + SSM               | Jamba-style                |
| 7   | BitNet b1.58                         |                            |
| 8   | Looped / recurrent-depth transformer |                            |

---

## What I'll measure

- **Loss**, in bits per character
- **Throughput and memory** on Kaggle hardware
- **A few small probing tasks**, e.g. associative recall, copying, and length extrapolation

---

## Why character level

Character level takes the tokenizer out of the comparison: every model sees exactly the same input. It also makes sequences long, which puts pressure on how each architecture handles context, whether that's attention's cost, a recurrent state that has to carry everything, or experts routing on single characters.

The obvious limitation: these results are at small scale and character level, so they may not transfer to large BPE-tokenized models. I'll treat them as directional, not as verdicts.

---

## Following along

I'll post short notes here as each architecture lands. The code will be public.

<!-- TODO: repo link goes here once the repository exists -->

---

_Previous: [Can Mamba Learn, Unlearn, and Retain Noise?]({% post_url 2026-02-12-mamba-noise-learning-unlearning %})_
