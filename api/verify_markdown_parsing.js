const assert = require("assert");

// The function logic extracted from GeminiProvider.js for testing
function parseStudyNotes(text) {
  // Clean up potential markdown code blocks wrapping the output
  text = text
    .replace(/^```markdown\s*/, "")
    .replace(/^```\s*/, "")
    .replace(/```$/, "");

  // PARSE MARKDOWN TO EXTRACT SCHEMA FIELDS
  // 1. Extract Summary (from "Why This Needs Attention")
  let summary = "Remedial notes for weak areas.";
  const summaryMatch = text.match(
    /## 🧠 Why This Needs Attention\s+([\s\S]*?)(?=\n\n---|\n\n##)/,
  );
  if (summaryMatch && summaryMatch[1]) {
    summary = summaryMatch[1].trim();
  }

  // 2. Extract Key Points (from "Common Mistakes Identified")
  let keyPoints = ["Review the concepts below carefully."];
  const mistakesMatch = text.match(
    /## ⚠️ Common Mistakes Identified\s+([\s\S]*?)(?=\n\n---|\n\n##)/,
  );
  if (mistakesMatch && mistakesMatch[1]) {
    // Extract bullet points
    const points = mistakesMatch[1]
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.startsWith("- ") || line.startsWith("* "))
      .map((line) => line.replace(/^[-*]\s+/, ""));

    if (points.length > 0) {
      keyPoints = points;
    }
  }

  // 3. Detailed Content is the full markdown
  const detailedContent = text;

  return { summary, keyPoints, detailedContent };
}

// Simulated LLM Response in Markdown
const sampleMarkdown = `---
type: weak-area-notes
subject: Computer Science
unit: Algorithms
weakTopics:
  - Sorting
  - Searching
generatedAt: 2026-02-17T14:30:00Z
---

# 📘 Weak-Area Revision Notes
## Unit: Algorithms

---

## 🧠 Why This Needs Attention
Understanding sorting and searching algorithms is fundamental to computer science. 
Mistakes here often lead to inefficient code and poor performance in applications.

---

## ⚠️ Common Mistakes Identified
- Confusing worst-case time complexity of QuickSort with MergeSort
- forgetting to handle the base case in recursive functions
- attempting to modify arrays while iterating over them

---

## 🔧 Concept Repair (Only What’s Broken)

### QuickSort Complexity
QuickSort has an average case of O(n log n), but a worst case of O(n^2) when the pivot is poorly chosen.
`;

console.log("Testing Markdown Parsing...");

const result = parseStudyNotes(sampleMarkdown);

console.log("Summary Extracted:", result.summary);
console.log("Key Points Extracted:", result.keyPoints);

// assertions
assert.strictEqual(
  result.summary,
  "Understanding sorting and searching algorithms is fundamental to computer science. \nMistakes here often lead to inefficient code and poor performance in applications.",
);
assert.strictEqual(result.keyPoints.length, 3);
assert.strictEqual(
  result.keyPoints[0],
  "Confusing worst-case time complexity of QuickSort with MergeSort",
);
assert.strictEqual(
  result.keyPoints[1],
  "forgetting to handle the base case in recursive functions",
);
assert.strictEqual(result.detailedContent, sampleMarkdown);

console.log("✅ Parsing Logic Verified Successfully!");
