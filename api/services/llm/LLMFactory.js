const config = require("../../config/config");
const ChatGPTProvider = require("./providers/ChatGPTProvider");
const GeminiProvider = require("./providers/GeminiProvider");

class LLMFactory {
  constructor() {
    this.provider = null;
  }

  /**
   * Initializes and returns the configured LLM provider.
   * Singleton pattern ensures we don't recreate the provider repeatedly.
   */
  getProvider() {
    if (this.provider) {
      return this.provider;
    }

    const providerType = config.llm.provider
      ? config.llm.provider.toUpperCase()
      : "CHATGPT";

    console.log(`[LLMFactory] Initializing provider: ${providerType}`);

    switch (providerType) {
      case "CHATGPT":
        this.provider = new ChatGPTProvider();
        break;
      case "GEMINI":
        this.provider = new GeminiProvider();
        break;
      default:
        console.warn(
          `[LLMFactory] Unknown provider '${providerType}', defaulting to ChatGPT`,
        );
        this.provider = new ChatGPTProvider();
    }

    return this.provider;
  }
}

// Export a singleton instance of the factory
module.exports = new LLMFactory();
