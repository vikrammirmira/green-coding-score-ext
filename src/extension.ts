import * as vscode from 'vscode';
import fetch from 'node-fetch';

function estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
}

let previousTokens: number | null = null;
let previousScore: number | null = null;

export function activate(context: vscode.ExtensionContext) {

    const command = vscode.commands.registerCommand(
        'greenCodingScore.analyzePrompt',
        async () => {

            const prompt = await vscode.window.showInputBox({
                prompt: "Enter your AI prompt"
            });

            if (!prompt) return;

            const tokens = estimateTokens(prompt);
            const outputTokens = Math.floor(tokens * 0.5);

            const prev = previousTokens;  // store BEFORE update

            let improvement = 0;
            let improvementText = "—";

            if (prev !== null) {
                improvement = ((prev - tokens) / prev) * 100;

                if (improvement > 0) {
                    improvementText = `+${improvement.toFixed(1)}% 🔥`;
                } else {
                    improvementText = `${improvement.toFixed(1)}% 📉`;
                }
            }

            // UPDATE AFTER calculation
            previousTokens = tokens;

            let scoreDelta = "";
            
            let computeSaved = "";

            if (prev !== null) {
                const saved = prev - tokens;
                computeSaved = `${saved} tokens saved ⚡`;
            }

            try {
                // Send event
                await fetch('http://localhost:8000/events/llm', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        user_id: "dev_local",
                        input_tokens: tokens,
                        output_tokens: outputTokens,
                        model: "gpt-4"
                    })
                });

                // Get score
                const res = await fetch('http://localhost:8000/score/dev_local');
                const data: any = await res.json();

                const score = data.total_score || 0;

                const prevScore = previousScore;

                let scoreDelta = "";

                if (prevScore !== null) {
                    const diff = score - prevScore;

                    scoreDelta = diff > 0
                        ? `(+${diff.toFixed(1)}) 🔥`
                        : `(${diff.toFixed(1)}) 📉`;
                }

                // update AFTER calculation
                previousScore = score;

                const energy = data.energy || 0;
                const carbon = data.carbon || 0;

                const panel = vscode.window.createWebviewPanel(
                    'greenScore',
                    '🌱 Green Coding Score',
                    vscode.ViewColumn.One,
                    {}
                );

                const scoreColor =
                    score > 85 ? '#4CAF50' :
                    score > 60 ? '#FFC107' :
                    '#F44336';

                const message =
                    score > 85 ? "🌱 Highly efficient" :
                    score > 65 ? "⚡ Good, but can improve" :
                    score > 45 ? "⚠️ Needs optimization" :
                    "❌ High compute usage";

                panel.webview.html = `
                    <html>
                    <body style="font-family: Arial; padding: 20px; background:#1e1e1e; color:white;">
                        
                        <h2>🌱 Green Coding Score</h2>
                        <hr/>

                        <div style="background:#2a2a2a;padding:12px;border-radius:8px;margin-bottom:15px;">
                            <strong>Prompt</strong>
                            <p style="margin-top:8px;">${prompt}</p>
                        </div>

                        <h3>📊 Metrics</h3>


                         ${prev !== null ? `
                            <h3 style="color:#4CAF50;">🚀 Optimization Impact</h3>

                            <div style="background:#1f3d2b;padding:15px;border-radius:10px;margin-top:10px;">
                                <p style="font-size:20px;font-weight:bold;color:#4CAF50;">
                                    ${improvementText}
                                </p>
                                <p style="opacity:0.8;">
                                    Reduced token usage from ${prev} → ${tokens}
                                </p>
                                <p style="opacity:0.7; margin-top:8px;">
                                    Same outcome, significantly less compute
                                </p>

                            </div>
                            ` : ""}

                            <div style="display:flex; gap:10px;">
                                <div style="flex:1;background:#2a2a2a;padding:10px;border-radius:8px;">
                                    <strong>Previous Tokens</strong>
                                    <p>${prev ?? "—"}</p>
                                </div>

                                <div style="flex:1;background:#2a2a2a;padding:10px;border-radius:8px;">
                                    <strong>Current Tokens</strong>
                                    <p>${tokens}</p>
                                </div>
                            </div>

                            <div style="margin-top:10px;background:#2a2a2a;padding:12px;border-radius:8px;">
                                <strong>Improvement</strong>
                                <p style="font-size:18px;font-weight:bold;">
                                    ${improvementText}
                                </p>
                            </div>

                        <div style="display:flex; gap:10px;">
                            <div style="flex:1;background:#2a2a2a;padding:10px;border-radius:8px;">
                                <strong>Input Tokens</strong>
                                <p>${tokens}</p>
                            </div>
                            <div style="flex:1;background:#2a2a2a;padding:10px;border-radius:8px;">
                                <strong>Output Tokens</strong>
                                <p>${outputTokens}</p>
                            </div>
                        </div>

                        <div style="display:flex; gap:10px; margin-top:10px;">
                            <div style="flex:1;background:#2a2a2a;padding:10px;border-radius:8px;">
                                <strong>⚡ Energy</strong>
                                <p>${energy.toFixed(6)} kWh</p>
                            </div>
                            <div style="flex:1;background:#2a2a2a;padding:10px;border-radius:8px;">
                                <strong>🌍 Carbon</strong>
                                <p>${carbon.toFixed(4)} gCO₂</p>
                            </div>
                        </div>

                        <h3 style="margin-top:20px;">🏆 Score</h3>

                      <span style="font-size:14px;opacity:0.6;">
                        ${scoreDelta}
                    </span>


                        <div style="font-size:14px;opacity:0.8;">
                            Efficiency Level
                        </div>

                        <p style="margin-top:10px;color:${scoreColor};font-weight:bold;">
                            ${message}
                        </p>
                        <div style="font-size:14px;opacity:0.8;">
                            Compute Saved
                        </div>
                        <p style="color:#4CAF50;font-weight:bold;">
                            ${computeSaved}
                        </p>

                    </body>
                    </html>
                `;

            } catch (err) {
                vscode.window.showErrorMessage(
                    "❌ Backend not reachable. Ensure API is running on localhost:8000"
                );
            }
        }
    );

    context.subscriptions.push(command);
}

export function deactivate() {}