# Solidity & Blockchain Learning Platform

A comprehensive React/TypeScript learning application for Solidity and blockchain development, featuring interactive modules, quizzes, and AI-powered chat assistance.

## 🚀 Live Demo

Visit the live application: [https://ezekaj.github.io/learning_sol/](https://ezekaj.github.io/learning_sol/)

## 🛠️ Features

- **Interactive Learning Modules**: Structured lessons on Solidity and blockchain concepts
- **Progress Tracking**: Keep track of your learning journey with achievements
- **AI-Powered Chat**: Get instant help with Gemini AI integration
- **Quiz System**: Test your knowledge with interactive quizzes
- **Modern UI**: Clean, responsive design built with React and TypeScript

## 📋 Prerequisites

- Node.js (version 16 or higher)
- npm or yarn package manager
- Gemini API key (for AI features)

## 🔧 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/ezekaj/learning_sol.git
   cd learning_sol
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## 🌐 Deployment

### GitHub Pages (Automatic)

This project is configured for automatic deployment to GitHub Pages using GitHub Actions:

1. Push your changes to the `main` branch
2. GitHub Actions will automatically build and deploy the site
3. The site will be available at `https://ezekaj.github.io/learning_sol/`

### Manual Deployment

You can also deploy manually using:

```bash
npm run deploy
```

## 🔑 API Configuration

To enable AI features, you need to:

1. Get a Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add the API key to your environment variables
3. For production deployment, add the API key as a GitHub secret named `GEMINI_API_KEY`

## 📁 Project Structure

```
├── components/          # React components
│   ├── icons/          # Icon components
│   ├── AchievementsPage.tsx
│   ├── GeminiChat.tsx
│   ├── LandingPage.tsx
│   ├── ModuleContent.tsx
│   ├── QuizComponent.tsx
│   └── Sidebar.tsx
├── hooks/              # Custom React hooks
├── services/           # API services
├── .github/workflows/  # GitHub Actions
└── dist/              # Build output
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

### Third-Party Attributions

- **Placeholder Image**: Photo by [Eaters Collective](https://unsplash.com/@eaterscollective) on [Unsplash](https://unsplash.com)
- **YouTube Videos**: Embedded educational content used for fair use/educational purposes
- **External Libraries**: React, TypeScript, Vite, and other dependencies used under their respective open source licenses

## 🆘 Support

If you encounter any issues or have questions, please open an issue on GitHub.

### Contact Information

- **GitHub**: [https://github.com/ezekaj](https://github.com/ezekaj)
- **LinkedIn**: [https://www.linkedin.com/in/elvi-zekaj-240b10243/](https://www.linkedin.com/in/elvi-zekaj-240b10243/)
- **Email**: [elvizekaj02@gmail.com](mailto:elvizekaj02@gmail.com)

---

Built with ❤️ using React, TypeScript, and Vite  
© 2025 Ezekaj. Licensed under MIT License.
