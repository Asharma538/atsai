import React, { useMemo, useState } from "react";
import "./App.css";
import { Type } from "@google/genai";
import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const getResponseSchema = () => ({
  type: Type.OBJECT,
  required: ["checks", "improvement_scope"],
  properties: {
    checks: {
      type: Type.OBJECT,
      required: [
        "commas_have_space",
        "bullets_end_with_period",
        "tech_stack_present",
        "projects_links",
        "technical_skills_present",
        "metrics_in_bullets",
        "spelling_correct",
        "dates_durations_chronological_past",
        "linkedin_github_phone_present",
        "bullets_semantic_not_stuffed",
        "education_section_complete",
      ],
      properties: {
        commas_have_space: {
          type: Type.OBJECT,
          required: ["passed", "details", "detected_in"],
          properties: {
            passed: { type: Type.BOOLEAN },
            details: { type: Type.STRING },
            detected_in: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
        },
        bullets_end_with_period: {
          type: Type.OBJECT,
          required: ["passed", "details", "detected_in"],
          properties: {
            passed: { type: Type.BOOLEAN },
            details: { type: Type.STRING },
            detected_in: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
        },
        tech_stack_present: {
          type: Type.OBJECT,
          required: ["passed", "details", "detected_in"],
          properties: {
            passed: { type: Type.BOOLEAN },
            details: { type: Type.STRING },
            detected_in: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
        },
        projects_links: {
          type: Type.OBJECT,
          required: ["passed", "details", "detected_in"],
          properties: {
            passed: { type: Type.BOOLEAN },
            details: { type: Type.STRING },
            detected_in: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
        },
        technical_skills_present: {
          type: Type.OBJECT,
          required: ["passed", "details", "detected_in"],
          properties: {
            passed: { type: Type.BOOLEAN },
            details: { type: Type.STRING },
            detected_in: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
        },
        metrics_in_bullets: {
          type: Type.OBJECT,
          required: ["passed", "details", "detected_in"],
          properties: {
            passed: { type: Type.BOOLEAN },
            details: { type: Type.STRING },
            detected_in: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
        },
        spelling_correct: {
          type: Type.OBJECT,
          required: ["passed", "details", "detected_in"],
          properties: {
            passed: { type: Type.BOOLEAN },
            details: { type: Type.STRING },
            detected_in: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
        },
        dates_durations_chronological_past: {
          type: Type.OBJECT,
          required: ["passed", "details", "detected_in"],
          properties: {
            passed: { type: Type.BOOLEAN },
            details: { type: Type.STRING },
            detected_in: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
        },
        linkedin_github_phone_present: {
          type: Type.OBJECT,
          required: ["passed", "details", "detected_in"],
          properties: {
            passed: { type: Type.BOOLEAN },
            details: { type: Type.STRING },
            detected_in: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
        },
        bullets_semantic_not_stuffed: {
          type: Type.OBJECT,
          required: ["passed", "details", "detected_in"],
          properties: {
            passed: { type: Type.BOOLEAN },
            details: { type: Type.STRING },
            detected_in: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
        },
        education_section_complete: {
          type: Type.OBJECT,
          required: ["passed", "details", "detected_in"],
          properties: {
            passed: { type: Type.BOOLEAN },
            details: { type: Type.STRING },
            detected_in: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
        },
      },
    },
    improvement_scope: {
      type: Type.OBJECT,
      required: ["details"],
      properties: {
        details: { type: Type.STRING },
      },
    }
  },
});

export default function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const humanize = (key) =>
    key
      .replace(/_/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/\b\w/g, (c) => c.toUpperCase());

  const scoreColor = useMemo(() => {
    if (!result || typeof result.score !== "number") return "neutral";
    if (result.score >= 85) return "success";
    if (result.score >= 70) return "warning";
    return "danger";
  }, [result]);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files?.[0] || null);
    setError("");
  };

  const evaluateResume = async () => {
    setError("");
    setResult(null);
    if (!selectedFile) {
      setError("Please select a resume file");
      return;
    }
    if (!/\.(pdf|doc|docx)$/i.test(selectedFile.name)) {
      setError("Only PDF, DOC, DOCX files are supported");
      return;
    }
    setIsLoading(true);

    const reader = new FileReader();
    reader.readAsDataURL(selectedFile);
    reader.onload = async () => {
      const base64String = String(reader.result).split(",")[1];
      console.log(base64String);
      console.log("File read successfully, starting evaluation...");
      try {
        const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
        const config = {
          responseMimeType: "application/json",
          responseSchema: getResponseSchema(),
        };
        const model = "gemini-2.5-pro";
        const prompt = `
            You are an expert resume evaluator. Please evaluate the following resume based on these specific criteria and return the required details.

            EVALUATION CRITERIA:
            1. **Commas have space after them** - Check if all commas are followed by a space
            2. **Bullets end with period** - All bullet points should end with a period
            3. **Tech stack present** - Resume should contain relevant technical keywords and skills
            4. **Projects have links** - Projects should include links (GitHub, demo, live, Website, Google Playstore, Product Hunt, etc. )
            5. **Technical skills section present** - Should have a dedicated technical skills section
            6. **Metrics in bullets** - At least 50% of bullet points should contain quantifiable metrics (numbers, percentages, improvements)
            7. **Spelling is correct** - Resume should be free of spelling errors
            8. **Dates/Durations in chronological order** - Dates/Durations in reverse order (most recent first).
            9. **Contact links present** - Should have LinkedIn, GitHub, and phone number, Portfolio website URL
            10. **Bullets are semantic and not stuffed** - Bullet points should be meaningful (avg 5+ words) and not keyword stuffed
            11. **Education section complete** - Should have education with years, scores/GPA, and location

            IMPORTANT: 
            - Return ONLY the JSON response, no additional text
            - Be thorough in your evaluation, confirm twise before any conclusion
            - For "detected_in", include specific examples from the resume text when issues are found
            - For tech stack, look for programming languages, frameworks, tools, databases, cloud platforms, etc.
            - For metrics, look for numbers, percentages, improvements, reductions, etc.
            - Be strict but fair in your evaluation
            - Include an improvement scope that will benefit the candidate in shortlisting. If it's good enough say "you're good to go!".
            - Ongoing roles should be shown similar to “Month YYYY — Present.” Do not validate dates against today's actual calendar date — simply ensure ordering within the resume. Future start dates (e.g., next month) are acceptable if marked correctly.
            - Today's Date: ${new Date().toLocaleDateString()}
        `;
        const contents = [
          {
            role: "user",
            parts: [
              {
                inlineData: {
                  data: base64String,
                  mimeType: "application/pdf",
                },
              },
              { text: prompt },
            ],
          },
        ];

        const response = await ai.models.generateContentStream({
          model,
          config,
          contents,
        });

        const fullResponse = [];
        let i = 0;
        console.log("Receiving response...");
        for await (const chunk of response) {
          const text = chunk?.candidates?.[0]?.content?.parts?.[0]?.text || "";
          if (text) fullResponse.push(text);
          console.log("received chunk:", i++);
        }
        const parsedData = JSON.parse(fullResponse.join(""));
        console.log(parsedData);
        parsedData["score"] = Math.round(
          Object.values(parsedData.checks).filter((c) => c.passed).length *
            (100 / Object.keys(parsedData.checks).length)
        );

        setResult(parsedData);
        // console.log(parsedData);
      } catch (e) {
        console.error(e);
        setError("Failed to analyze resume. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    reader.onerror = () => {
      setIsLoading(false);
      setError("Unable to read file. Please try again.");
    };
  };

  const checksArray = useMemo(() => {
    const checks = result?.checks || {};
    return Object.entries(checks).map(([key, value]) => ({ key, ...value }));
  }, [result]);

  return (
    <div className="app">
      <nav className="nav">
        <div className="brand">
          <div className="logo">🧭</div>
          <div className="brand-text">
            <h1>ATS AI</h1>
            <p>AI-powered resume evaluation for ATS optimization</p>
          </div>
        </div>
        <a className="cta-link" href="https://github.com/" target="_blank" rel="noreferrer">Star on GitHub</a>
      </nav>

      <header className="hero">
        <h2>Get your resume ATS-ready in minutes</h2>
        <p>Upload your resume and receive an instant, detailed report with actionable fixes.</p>
      </header>

      <main className="container">
        <section className="card uploader">
          <div className="uploader-row">
            <input
              className="file-input"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              disabled={isLoading}
            />
            <button className="btn primary" onClick={evaluateResume} disabled={isLoading}>
              {isLoading ? "Evaluating..." : "Evaluate"}
            </button>
          </div>
          {selectedFile && (
            <div className="file-meta">
              <span className="file-name">{selectedFile.name}</span>
              <span className="file-size">{Math.ceil(selectedFile.size / 1024)} KB</span>
            </div>
          )}
          {error && <div className="alert error">{error}</div>}
        </section>

        {isLoading && (
          <section className="card loading">
            <div className="loader" />
            <p>Analyzing your resume. This will take a few seconds…</p>
          </section>
        )}

        {result && (
          <section className="results">
            <div className="score-card card">
              <div className={`score-badge ${scoreColor}`}>
                {typeof result.score === "number" ? `${Math.round(result.score)} / 100` : "N/A"}
              </div>
              <div>
                <h3>Overall ATS Score</h3>
                <p>A higher score indicates better ATS readiness and clarity.</p>
              </div>
            </div>

            {result?.improvement_scope?.details && (
              <div className="card improvement">
                <h3>Improvement Suggestions</h3>
                <p>{result.improvement_scope.details}</p>
              </div>
            )}

            <div className="card">
              <h3>Detailed Checks</h3>
              <div className="table-wrap">
                <table className="results-table">
                  <thead>
                    <tr>
                      <th>Check</th>
                      <th>Status</th>
                      <th>Details</th>
                      <th>Detected In</th>
                    </tr>
                  </thead>
                  <tbody>
                    {checksArray.map((c) => (
                      <tr key={c.key}>
                        <td>{humanize(c.key)}</td>
                        <td>
                          <span className={`chip ${c.passed ? "chip-success" : "chip-danger"}`}>
                            {c.passed ? "Passed" : "Needs Work"}
                          </span>
                        </td>
                        <td className="details-cell">{c.details || "—"}</td>
                        <td className="detected-cell">
                          {Array.isArray(c.detected_in) && c.detected_in.length > 0 ? (
                            <ul>
                              {c.detected_in.slice(0, 3).map((t, i) => (
                                <li key={i}>{t}</li>
                              ))}
                              {c.detected_in.length > 3 && <li>…and more</li>}
                            </ul>
                          ) : (
                            "—"
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="footer">
        <p>
          Built with <span role="img" aria-label="sparkles">✨</span> by ATS AI. Keep iterating and improving.
        </p>
      </footer>
    </div>
  );
}
