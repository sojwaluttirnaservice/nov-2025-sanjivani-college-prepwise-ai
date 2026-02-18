/**
 * Constructs the prompt for generating personalized study notes based on weak topics.
 */
const constructStudyNotesPrompt = (input) => {
  const { topics, mistakes = [], context = {} } = input;

  const subject = context.subject || "General";
  const unit = context.unit || "General Unit";

  const systemPrompt = `You are an adaptive AI study notes generator for a learning platform.

This is NOT a textbook summary.
This is NOT a full chapter explanation.

This is a corrective note generated from specific weak areas identified in an assessment.

You MUST:
- Focus ONLY on the exact misconceptions listed.
- Prioritize correction over explanation.
- Avoid covering unrelated subtopics.
- Avoid long theory.
- Keep content tight and practical.
- Format strictly for Markdown UI rendering.

OUTPUT FORMAT (MANDATORY):
Return ONLY Markdown. Do not wrap in code blocks.

Structure EXACTLY as follows:

---
type: weak-area-notes
subject: ${subject}
unit: ${unit}
generatedAt: ${new Date().toISOString()}
---

# 📘 Targeted Weak-Area Correction

## 🔎 What You Got Wrong
Brief 2–3 line summary directly referencing the student's actual mistakes.

---

## ❌ Mistake Breakdown

### 1. <Mistake Title>
**Why it's wrong:**
Short correction (clear, direct).

**Correct Understanding:**
Precise explanation with minimal example if needed.

\`\`\`c
// Minimal code example (only if relevant)
\`\`\`

### 2. <Next Mistake>
(same structure)

---

## ⚡ Quick Mental Rules
List 3-5 SHORT mental rules to memorize:
- ✔ Rule 1
- ✔ Rule 2
- ✔ Rule 3

---

## 🧪 Micro Practice
One quick predict-output or fix-error example:

\`\`\`c
// Code snippet
\`\`\`

**Answer:** Expected output or fix

---

## 🎯 Immediate Fix Strategy
3-4 concrete, actionable next steps:
- Action 1
- Action 2
`;

  const mistakeContext =
    mistakes.length > 0
      ? `\n\nSpecific Mistakes Made by Student:\n${mistakes.map((m) => `- Q: "${m.question}"\n  Student Wrote: "${m.userAnswer}"\n  Topic: ${m.topic}`).join("\n")}`
      : "\n\n(No specific mistake details available, infer likely misconceptions from weak topics)";

  const userPrompt = `The student is weak in the following topics:
${topics.join(", ")}

${mistakeContext}

Generate targeted corrective notes following the EXACT structure defined in the system prompt. Be specific to these mistakes.`;

  return { systemPrompt, userPrompt };
};

module.exports = { constructStudyNotesPrompt };
