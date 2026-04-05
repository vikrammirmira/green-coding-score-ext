import * as vscode from 'vscode';
import fetch from 'node-fetch';

function estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
}

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

            try {
                // Send event to backend
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

                // Fetch score
                const res = await fetch('http://localhost:8000/score/dev_local');
                const data: any = await res.json();

                const score = data.total_score || 0;

                // Create panel
                const panel = vscode.window.createWebviewPanel(
                    'greenScore',
                    '🌱 Green Coding Score',
                    vscode.ViewColumn.One,
                    {}
                );

                // Simple color logic
                const scoreColor = score > 80 ? 'green' : score > 50 ? 'orange' : 'red';

                panel.webview.html = `
                    <html>
                    <body style="font-family: Arial; padding: 20px;">
                        <h2>🌱 Green Coding Score</h2>
                        <hr/>
                        <p><strong>Prompt:</strong></p>
                        <p style="background:#f3f3f3;padding:10px;border-radius:5px;">
                            ${prompt}
                        </p>

                        <h3>📊 Metrics</h3>
                        <p><strong>Input Tokens:</strong> ${tokens}</p>
                        <p><strong>Output Tokens:</strong> ${outputTokens}</p>

                        <h3>🏆 Score</h3>
                        <p style="font-size:24px;color:${scoreColor};">
                            ${score}
                        </p>

                        <hr/>
                        <p style="color:${scoreColor};">
                            ${score > 80 ? "Efficient prompt 👍" :
                              score > 50 ? "Could be optimized ⚡" :
                              "High compute usage ⚠️"}
                        </p>
                    </body>
                    </html>
                `;

            } catch (err) {
                vscode.window.showErrorMessage(
                    "❌ Backend not reachable. Make sure your API is running on localhost:8000"
                );
            }
        }
    );

    context.subscriptions.push(command);
}

export function deactivate() {}