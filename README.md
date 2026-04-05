# 🌱 Green Coding Score – VS Code Extension

> Bringing sustainability awareness into everyday developer workflows

---

## 🚀 Overview

As AI-assisted development becomes the norm, we optimize for speed and productivity—but rarely for efficiency.

This extension introduces a new lens:

👉 **How much compute (and implied energy/carbon) does your prompt consume?**

**Green Coding Score** helps developers measure and improve the efficiency of their AI usage directly inside VS Code.

---

## ✨ Features

- 🧠 Analyze prompt efficiency  
- 🔢 Estimate token usage  
- ⚡ Infer energy consumption (approximation)  
- 🌍 Estimate carbon impact (derived signal)  
- 🏆 Generate a Green Coding Score (0–100)  
- 📊 Visual feedback inside VS Code  

---

## 🧩 How It Works

1. Developer enters a prompt  
2. Extension estimates token usage  
3. Sends data to backend scoring API  
4. Backend computes:
   - Energy (tokens × factor)
   - Carbon (energy × intensity)
   - Composite score  
5. Results displayed in a VS Code panel  

---

## 🖥️ Demo

Run command:

```bash
🌱 Analyze Prompt Sustainability