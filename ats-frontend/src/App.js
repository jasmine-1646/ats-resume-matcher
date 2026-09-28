import React, { useState } from "react";
import "./App.css";

function App() {
  const [resume, setResume] = useState(null);
  const [jobDescription, setJobDescription] = useState("");

  const [score, setScore] = useState(null);
  const [breakdown, setBreakdown] = useState(null);

  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const [analysis, setAnalysis] = useState("");

  const [insights, setInsights] = useState({
    strengths: [],
    matchingSkills: [],
    missingSkills: [],
    missingKeywords: [],
    recommendations: [],
  });

  const [keywordData, setKeywordData] = useState({
    matched: [],
    missing: [],
    important: [],
  });

  const [highlightData, setHighlightData] = useState({
    resume: [],
    jobDescription: [],
  });

  // ---------------------------------------------------------
  // RESET
  // ---------------------------------------------------------

  const resetInsights = () => {
    setInsights({
      strengths: [],
      matchingSkills: [],
      missingSkills: [],
      missingKeywords: [],
      recommendations: [],
    });
  };

  const resetKeywords = () => {
    setKeywordData({
      matched: [],
      missing: [],
      important: [],
    });

    setHighlightData({
      resume: [],
      jobDescription: [],
    });
  };

  // ---------------------------------------------------------
  // RESUME UPLOAD
  // ---------------------------------------------------------

  const handleResumeChange = (event) => {
    const file = event.target.files[0];

    if (file) {
      setResume(file);
      setScore(null);
      setBreakdown(null);
      setAnalysis("");

      resetInsights();
      resetKeywords();
    }
  };

  // ---------------------------------------------------------
  // CALCULATE MATCH
  // ---------------------------------------------------------

  const handleMatch = async () => {
    if (!resume) {
      alert("Please upload your resume PDF.");
      return;
    }

    if (!jobDescription.trim()) {
      alert("Please enter the job description.");
      return;
    }

    setLoading(true);
    setScore(null);
    setBreakdown(null);
    setAnalysis("");

    resetInsights();
    resetKeywords();

    try {
      const formData = new FormData();

      formData.append("resume", resume);
      formData.append("jobDescription", jobDescription);

      const response = await fetch(
        "http://localhost:5000/match",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Unable to calculate match."
        );
      }

      setScore(data.score);
      setBreakdown(data.breakdown);
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------
  // EXTRACT ANALYSIS SECTION
  // ---------------------------------------------------------

  const extractInsightSection = (
    text,
    heading,
    nextHeading
  ) => {
    if (!text) return [];

    const startIndex = text.indexOf(heading);

    if (startIndex === -1) return [];

    let section = text.substring(
      startIndex + heading.length
    );

    if (nextHeading) {
      const endIndex = section.indexOf(nextHeading);

      if (endIndex !== -1) {
        section = section.substring(0, endIndex);
      }
    }

    return section
      .split("\n")
      .map((line) =>
        line
          .replace(/^[-•]\s*/, "")
          .trim()
      )
      .filter(Boolean);
  };

  // ---------------------------------------------------------
  // ASK AI / ANALYZE
  // ---------------------------------------------------------

  const handleAskAI = async () => {
    if (!resume) {
      alert("Please upload your resume PDF.");
      return;
    }

    if (!jobDescription.trim()) {
      alert("Please enter the job description.");
      return;
    }

    setAiLoading(true);

    try {
      const formData = new FormData();

      formData.append("resume", resume);
      formData.append("jobDescription", jobDescription);

      const response = await fetch(
        "http://localhost:5000/analyze",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Analysis failed."
        );
      }

      setAnalysis(data.analysis || "");

      setScore(data.score);

      setBreakdown(data.breakdown);

      // Keywords
      if (data.keywords) {
        setKeywordData({
          matched: data.keywords.matched || [],
          missing: data.keywords.missing || [],
          important: data.keywords.important || [],
        });
      }

      // Highlighting
      if (data.keywordHighlights) {
        setHighlightData({
          resume:
            data.keywordHighlights.resume || [],

          jobDescription:
            data.keywordHighlights.jobDescription || [],
        });
      }

      // Insights
      const strengths =
        extractInsightSection(
          data.analysis,
          "1. Resume Strengths",
          "2. Matching Skills"
        );

      const matchingSkills =
        extractInsightSection(
          data.analysis,
          "2. Matching Skills",
          "3. Missing Skills"
        );

      const missingSkills =
        extractInsightSection(
          data.analysis,
          "3. Missing Skills",
          "4. Missing Keywords"
        );

      const missingKeywords =
        extractInsightSection(
          data.analysis,
          "4. Missing Keywords",
          "5. Resume Improvements"
        );

      const recommendations =
        extractInsightSection(
          data.analysis,
          "7. Final Recommendations",
          "Note:"
        );

      setInsights({
        strengths,
        matchingSkills,
        missingSkills,
        missingKeywords,
        recommendations,
      });
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setAiLoading(false);
    }
  };

  // ---------------------------------------------------------
  // FORMAT ANALYSIS
  // ---------------------------------------------------------

  const formatAnalysis = (text) => {
    if (!text) return null;

    return text.split("\n").map(
      (line, index) => {

        if (
          /^\d+\./.test(line.trim())
        ) {
          return (
            <h3
              key={index}
              className="analysis-heading"
            >
              {line}
            </h3>
          );
        }

        if (
          line.trim().startsWith("-")
        ) {
          return (
            <p
              key={index}
              className="analysis-bullet"
            >
              {line}
            </p>
          );
        }

        if (!line.trim()) {
          return (
            <div
              key={index}
              className="analysis-space"
            />
          );
        }

        return (
          <p key={index}>
            {line}
          </p>
        );
      }
    );
  };

  // ---------------------------------------------------------
  // SCORE MESSAGE
  // ---------------------------------------------------------

  const getScoreMessage = () => {
    if (score === null) {
      return "Upload your resume and job description to calculate your ATS match.";
    }

    if (score >= 80) {
      return "Strong alignment with the job description.";
    }

    if (score >= 60) {
      return "Good alignment. A few improvements can increase your match.";
    }

    if (score >= 40) {
      return "Moderate alignment. Review the missing skills and keywords.";
    }

    return "Low alignment. Consider tailoring your resume to the job description.";
  };

  // ---------------------------------------------------------
  // SCORE BAR
  // ---------------------------------------------------------

  const ScoreBar = ({
    label,
    value,
    weight,
  }) => (
    <div className="score-row">
      <div className="score-row-header">
        <span>{label}</span>
        <span>
          {value ?? 0}%{" "}
          <small>
            ({weight}% weight)
          </small>
        </span>
      </div>

      <div className="score-track">
        <div
          className="score-fill"
          style={{
            width: `${Math.min(
              value || 0,
              100
            )}%`,
          }}
        />
      </div>
    </div>
  );

  // ---------------------------------------------------------
  // INSIGHT ITEM
  // ---------------------------------------------------------

  const InsightItem = ({
    children,
  }) => (
    <div className="insight-item">
      <span className="insight-dot">
        ✓
      </span>

      <span>{children}</span>
    </div>
  );

  // ---------------------------------------------------------
  // KEYWORD CHIP
  // ---------------------------------------------------------

  const KeywordChip = ({
    children,
    type,
  }) => (
    <span
      className={`keyword-chip ${type}`}
    >
      {children}
    </span>
  );

  // ---------------------------------------------------------
  // HIGHLIGHTED TEXT
  // ---------------------------------------------------------

  const renderHighlightedText = (
    segments,
    emptyMessage
  ) => {
    if (
      !segments ||
      segments.length === 0
    ) {
      return (
        <p className="highlight-empty">
          {emptyMessage}
        </p>
      );
    }

    return segments.map(
      (segment, index) => (
        <span
          key={index}
          className={
            segment.type === "matched"
              ? "highlight-matched"
              : segment.type === "missing"
              ? "highlight-missing"
              : ""
          }
        >
          {segment.text}
        </span>
      )
    );
  };

  return (
    <div className="app">

      {/* -------------------------------------------------
          HEADER
      ------------------------------------------------- */}

      <header className="header">
        <div className="header-inner">

          <div className="brand">
            <div className="brand-icon">
              ATS
            </div>

            <div>
              <h1>
                ATS Resume Matcher
              </h1>

              <p>
                Smart Resume & Job Matching
              </p>
            </div>
          </div>

          <div className="header-status">
            <span className="status-dot" />
            NLP Engine Online
          </div>

        </div>
      </header>


      {/* -------------------------------------------------
          MAIN
      ------------------------------------------------- */}

      <main className="main-container">

        <section className="hero">

          <div className="hero-badge">
            ⚡ Smart ATS Analysis
          </div>

          <h2>
            Optimize Your Resume
            <br />
            <span>
              For Your Dream Job
            </span>
          </h2>

          <p>
            Analyze your resume against a job
            description and discover the skills
            and keywords that can improve your
            ATS compatibility.
          </p>

        </section>


        {/* -------------------------------------------------
            INPUT SECTION
        ------------------------------------------------- */}

        <section className="input-grid">

          {/* Resume */}

          <div className="input-card">

            <div className="card-title">
              <span className="title-icon">
                📄
              </span>

              <div>
                <h3>
                  Upload Resume
                </h3>

                <p>
                  PDF format supported
                </p>
              </div>
            </div>

            <label className="upload-area">

              <input
                type="file"
                accept=".pdf"
                onChange={
                  handleResumeChange
                }
              />

              <div className="upload-icon">
                ↑
              </div>

              <strong>
                {resume
                  ? resume.name
                  : "Choose your resume"}
              </strong>

              <span>
                {resume
                  ? `${(
                      resume.size /
                      1024
                    ).toFixed(1)} KB`
                  : "Click to browse PDF files"}
              </span>

            </label>

          </div>


          {/* Job Description */}

          <div className="input-card">

            <div className="card-title">
              <span className="title-icon">
                💼
              </span>

              <div>
                <h3>
                  Job Description
                </h3>

                <p>
                  Paste the target job description
                </p>
              </div>
            </div>

            <textarea
              className="job-input"
              placeholder="Paste the job description here..."
              value={jobDescription}
              onChange={(e) =>
                setJobDescription(
                  e.target.value
                )
              }
            />

            <div className="character-count">
              {jobDescription.length} characters
            </div>

          </div>

        </section>


        {/* -------------------------------------------------
            BUTTONS
        ------------------------------------------------- */}

        <div className="action-area">

          <button
            className="primary-button"
            onClick={handleMatch}
            disabled={loading}
          >
            {loading
              ? "Analyzing Resume..."
              : "Calculate ATS Match"}
          </button>

          <button
            className="ai-button"
            onClick={handleAskAI}
            disabled={aiLoading}
          >
            {aiLoading
              ? "Analyzing..."
              : "✨ Ask AI to Analyze"}
          </button>

        </div>


        {/* -------------------------------------------------
            SCORE
        ------------------------------------------------- */}

        {score !== null && (

          <section className="score-section">

            <div className="score-card">

              <div className="score-circle">

                <span>
                  {Math.round(score)}
                </span>

                <small>
                  /100
                </small>

              </div>

              <div className="score-content">

                <span className="section-label">
                  SMART ATS SCORE
                </span>

                <h2>
                  {Math.round(score)}%
                </h2>

                <p>
                  {getScoreMessage()}
                </p>

              </div>

            </div>


            {/* Score Breakdown */}

            {breakdown && (

              <div className="breakdown-card">

                <div className="section-heading">
                  <h3>
                    Score Breakdown
                  </h3>

                  <span>
                    Weighted analysis
                  </span>
                </div>

                <ScoreBar
                  label="Text Similarity"
                  value={
                    breakdown.textSimilarity
                  }
                  weight={40}
                />

                <ScoreBar
                  label="Skill Match"
                  value={
                    breakdown.skillMatch
                  }
                  weight={30}
                />

                <ScoreBar
                  label="Keyword Match"
                  value={
                    breakdown.keywordMatch
                  }
                  weight={20}
                />

                <ScoreBar
                  label="Content Relevance"
                  value={
                    breakdown.contentRelevance
                  }
                  weight={10}
                />

              </div>
            )}

          </section>
        )}


        {/* -------------------------------------------------
            ATS INSIGHTS
        ------------------------------------------------- */}

        {(insights.strengths.length > 0 ||
          insights.matchingSkills.length > 0 ||
          insights.missingSkills.length > 0 ||
          insights.recommendations.length > 0) && (

          <section className="insights-section">

            <div className="section-heading main-heading">
              <div>
                <span className="section-label">
                  INTELLIGENT INSIGHTS
                </span>

                <h2>
                  ATS Insights
                </h2>
              </div>

              <span className="insight-badge">
                Local NLP Analysis
              </span>
            </div>


            <div className="insights-grid">

              {/* Strengths */}

              {insights.strengths.length > 0 && (

                <div className="insight-card success-card">

                  <h3>
                    🟢 Resume Strengths
                  </h3>

                  {insights.strengths.map(
                    (item, index) => (
                      <InsightItem
                        key={index}
                      >
                        {item}
                      </InsightItem>
                    )
                  )}

                </div>
              )}


              {/* Matching Skills */}

              {insights.matchingSkills.length > 0 && (

                <div className="insight-card">

                  <h3>
                    🔵 Matching Skills
                  </h3>

                  {insights.matchingSkills.map(
                    (item, index) => (
                      <InsightItem
                        key={index}
                      >
                        {item}
                      </InsightItem>
                    )
                  )}

                </div>
              )}


              {/* Missing Skills */}

              {insights.missingSkills.length > 0 && (

                <div className="insight-card warning-card">

                  <h3>
                    🟠 Missing Skills
                  </h3>

                  {insights.missingSkills.map(
                    (item, index) => (
                      <InsightItem
                        key={index}
                      >
                        {item}
                      </InsightItem>
                    )
                  )}

                </div>
              )}


              {/* Recommendations */}

              {insights.recommendations.length > 0 && (

                <div className="insight-card purple-card">

                  <h3>
                    💡 Recommendations
                  </h3>

                  {insights.recommendations.map(
                    (item, index) => (
                      <InsightItem
                        key={index}
                      >
                        {item}
                      </InsightItem>
                    )
                  )}

                </div>
              )}

            </div>

          </section>
        )}


        {/* -------------------------------------------------
            KEYWORD ANALYSIS
        ------------------------------------------------- */}

        {(keywordData.matched.length > 0 ||
          keywordData.missing.length > 0 ||
          keywordData.important.length > 0) && (

          <section className="keyword-section">

            <div className="section-heading main-heading">

              <div>
                <span className="section-label">
                  ATS KEYWORD INTELLIGENCE
                </span>

                <h2>
                  Keyword Analysis
                </h2>
              </div>

              <span className="insight-badge">
                Keyword Matching
              </span>

            </div>


            <div className="keyword-summary">

              <div className="keyword-stat matched-stat">
                <strong>
                  {keywordData.matched.length}
                </strong>

                <span>
                  Matched
                </span>
              </div>

              <div className="keyword-stat missing-stat">
                <strong>
                  {keywordData.missing.length}
                </strong>

                <span>
                  Missing
                </span>
              </div>

              <div className="keyword-stat important-stat">
                <strong>
                  {keywordData.important.length}
                </strong>

                <span>
                  Job Keywords
                </span>
              </div>

            </div>


            <div className="keyword-panels">

              {/* Matched */}

              <div className="keyword-panel">

                <h3>
                  🟢 Matched Keywords
                </h3>

                <div className="keyword-list">

                  {keywordData.matched.length > 0
                    ? keywordData.matched.map(
                        (keyword, index) => (
                          <KeywordChip
                            key={index}
                            type="matched"
                          >
                            {keyword}
                          </KeywordChip>
                        )
                      )
                    : (
                      <span className="empty-keyword">
                        No matched keywords
                      </span>
                    )}

                </div>

              </div>


              {/* Missing */}

              <div className="keyword-panel">

                <h3>
                  🔴 Missing Keywords
                </h3>

                <div className="keyword-list">

                  {keywordData.missing.length > 0
                    ? keywordData.missing.map(
                        (keyword, index) => (
                          <KeywordChip
                            key={index}
                            type="missing"
                          >
                            {keyword}
                          </KeywordChip>
                        )
                      )
                    : (
                      <span className="empty-keyword">
                        No major missing keywords
                      </span>
                    )}

                </div>

              </div>


              {/* Important */}

              <div className="keyword-panel">

                <h3>
                  🟡 Important Job Keywords
                </h3>

                <div className="keyword-list">

                  {keywordData.important.map(
                    (keyword, index) => (
                      <KeywordChip
                        key={index}
                        type="important"
                      >
                        {keyword}
                      </KeywordChip>
                    )
                  )}

                </div>

              </div>

            </div>

          </section>
        )}


        {/* -------------------------------------------------
            KEYWORD HIGHLIGHTING
        ------------------------------------------------- */}

        {(highlightData.resume.length > 0 ||
          highlightData.jobDescription.length > 0) && (

          <section className="highlight-section">

            <div className="section-heading main-heading">

              <div>
                <span className="section-label">
                  VISUAL KEYWORD MATCHING
                </span>

                <h2>
                  Resume vs Job Description
                </h2>
              </div>

              <span className="insight-badge">
                Live Comparison
              </span>

            </div>


            {/* Legend */}

            <div className="highlight-legend">

              <span>
                <i className="legend-dot matched-dot" />
                Matched Keyword
              </span>

              <span>
                <i className="legend-dot missing-dot" />
                Missing Keyword
              </span>

            </div>


            <div className="highlight-grid">

              {/* Resume */}

              <div className="highlight-card">

                <div className="highlight-header">

                  <div>
                    <h3>
                      📄 Your Resume
                    </h3>

                    <p>
                      Keywords found in your resume
                    </p>
                  </div>

                  <span className="highlight-count matched-count">
                    {keywordData.matched.length} matched
                  </span>

                </div>

                <div className="highlight-text">

                  {renderHighlightedText(
                    highlightData.resume,
                    "No resume keyword highlights available."
                  )}

                </div>

              </div>


              {/* Job Description */}

              <div className="highlight-card">

                <div className="highlight-header">

                  <div>
                    <h3>
                      💼 Job Description
                    </h3>

                    <p>
                      Required keywords compared with your resume
                    </p>
                  </div>

                  <span className="highlight-count missing-count">
                    {keywordData.missing.length} missing
                  </span>

                </div>

                <div className="highlight-text">

                  {renderHighlightedText(
                    highlightData.jobDescription,
                    "No job description highlights available."
                  )}

                </div>

              </div>

            </div>

          </section>
        )}


        {/* -------------------------------------------------
            ANALYSIS REPORT
        ------------------------------------------------- */}

        {analysis && (

          <section className="report-section">

            <div className="section-heading main-heading">

              <div>
                <span className="section-label">
                  DETAILED REPORT
                </span>

                <h2>
                  Resume Analysis Report
                </h2>
              </div>

            </div>

            <div className="report-card">
              {formatAnalysis(analysis)}
            </div>

          </section>
        )}


        {/* -------------------------------------------------
            BOTTOM CTA
        ------------------------------------------------- */}

        <section className="bottom-cta">

          <div>
            <span>
              READY TO IMPROVE?
            </span>

            <h2>
              Tailor your resume.
              <br />
              Increase your ATS compatibility.
            </h2>
          </div>

          <div className="cta-icon">
            ↑
          </div>

        </section>

      </main>


      {/* -------------------------------------------------
          FOOTER
      ------------------------------------------------- */}

      <footer className="footer">

        <p>
          ATS Resume Matcher
        </p>

        <span>
          Built with React • Flask • NLP •
          Machine Learning
        </span>

      </footer>

    </div>
  );
}

export default App;