function getApiKey() {
  const key = document.querySelector("#api_key").value.trim();
  return key;
}

class GeminiSearch {
  constructor() {
    this.apiKey = getApiKey();
    this.apiUrl =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent";

    this.searchInput = document.getElementById("searchInput");
    this.searchButton = document.getElementById("searchButton");
    this.resultDiv = document.getElementById("result");
    this.loadingDiv = document.getElementById("loading");

    this.init();
  }

  init() {
    this.searchButton.addEventListener("click", () => this.handleSearch());
    // Add enter key support
    this.searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        this.handleSearch();
      }
    });
  }

  async handleSearch() {
    const query = this.searchInput.value.trim();
    if (!query) {
      alert("Please enter a search query");
      return;
    }

    this.setLoading(true);
    try {
      const response = await this.searchGemini(query);
      this.displayResult(response);
    } catch (error) {
      this.displayError(error);
    } finally {
      this.setLoading(false);
    }
  }

  async searchGemini(query) {
    const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `You are an advanced search and research assistant.

                      Your role is to:

                      1. Thoroughly analyze user queries and provide comprehensive, factual responses
                      2. Present information in a clear, organized manner with relevant examples
                      3. Break down complex topics into understandable sections
                      4. Include relevant statistics, facts, and data when applicable
                      5. Provide balanced perspectives on topics with multiple viewpoints
                      6. Cite sources when possible

                      For example:
                      - If asked about technology: Include latest developments, key players, and real-world applications
                      - If asked about history: Provide dates, key events, and historical context
                      - If asked about science: Explain concepts with practical examples and current research
                      - If asked about current events: Present multiple perspectives and verified information
                      - If asked about how-to topics: Give step-by-step instructions with practical tips

                      Maintain a professional, informative tone while being engaging and accessible.`,
              },
              {
                text: query,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  }

  displayResult(response) {
    if (response.error) {
      this.displayError(new Error(response.error.message));
      return;
    }

    const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      this.displayError(new Error("No results found"));
      return;
    }

    const htmlContent = marked.parse(text);
    const promptTokens = response.usageMetadata?.promptTokenCount || 0;
    const responseTokens = response.usageMetadata?.candidatesTokenCount || 0;
    const totalTokens = response.usageMetadata?.totalTokenCount || 0;

    this.resultDiv.innerHTML = `
            <div class="result-content">
                ${htmlContent}
                <div class="metadata">
                    <div>Model: ${response.modelVersion || "Unknown"}</div>
                    <div>Tokens: ${promptTokens} (prompt) + ${responseTokens} (response) = ${totalTokens} total</div>
                </div>
            </div>
        `;
  }

  displayError(error) {
    this.resultDiv.innerHTML = `
            <div class="alert alert-danger">
                ${error.message}
            </div>
        `;
  }

  setLoading(isLoading) {
    this.loadingDiv.classList.toggle("d-none", !isLoading);
    this.searchButton.disabled = isLoading;
  }
}

// Initialize the application
new GeminiSearch();
