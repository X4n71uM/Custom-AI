# Xantium AI Chat

Xantium AI Chat is an intelligent, dual-personality conversational interface powered by the Google Gemini API. Built with React and TypeScript, it offers a sophisticated dark-mode UI designed for both deep philosophical analysis and quick, actionable support.

## 🌟 Features

- **Dual Personality System**:
  - **Pro Mode (Weiser Rat)**: A wise, empathetic counselor designed for deep analysis, ethical reflection, and creative problem-solving.
  - **Flash Mode (Schneller Impuls)**: A fast, practical assistant focused on conciseness, sustainability, and everyday tasks.
- **Multimodal Capabilities**: Support for both text and image inputs (vision capabilities).
- **Voice Integration**: Native Speech-to-Text support for hands-free prompting.
- **Persistent History**: Chat sessions are automatically saved to LocalStorage.
- **Responsive Design**: Fully responsive UI built with Tailwind CSS, featuring a sidebar history and mobile-friendly navigation.
- **German Language Native**: System instructions are optimized for German language interaction.

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS
- **AI Integration**: Google GenAI SDK (`@google/genai`)
- **Models**: Gemini 2.5 Flash (configured dynamically for different personas)
- **Icons**: Custom SVG Icons

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- A Google Gemini API Key. You can get one from [Google AI Studio](https://aistudio.google.com/).

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/xantium-ai-chat.git
   cd xantium-ai-chat
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory and add your API key:
   ```env
   API_KEY=your_google_gemini_api_key_here
   ```

   *Note: Ensure your build tool (e.g., Vite/Webpack) is configured to expose this variable as `process.env.API_KEY`, or adjust `services/geminiService.ts` to match your environment variable prefix (e.g., `import.meta.env.VITE_API_KEY` for Vite).*

4. **Run the Application**
   ```bash
   npm start
   # or
   npm run dev
   ```

## 📂 Project Structure

```text
.
├── components/        # UI Components
│   ├── ChatView.tsx   # Main chat interface and logic
│   ├── Message.tsx    # Individual message bubble component
│   ├── ModelSelector.tsx # Toggle between Pro and Flash modes
│   ├── Sidebar.tsx    # Chat history navigation
│   └── icons.tsx      # SVG Icon assets
├── hooks/
│   └── useLocalStorage.ts # Custom hook for data persistence
├── services/
│   └── geminiService.ts   # Google GenAI SDK integration and persona configs
├── utils/
│   └── helpers.ts     # ID generation and date formatting
├── types.ts           # TypeScript interfaces
├── App.tsx            # Main application layout
├── index.tsx          # Entry point
└── index.html         # HTML template
```

## 🧠 AI Configuration

The application uses specific system instructions to define the two personas:

- **Pro Mode**: Configured for high-quality, thoughtful responses (`gemini-2.5-flash` with specific empathetic prompting).
- **Flash Mode**: Configured for speed and brevity, with `thinkingBudget` set to 0 for lower latency.

## 📄 License

[MIT](LICENSE)
