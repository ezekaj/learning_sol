# 🚀 Solana Learning Platform

> Next-generation Solidity learning platform with AI-powered features, interactive coding, and immersive blockchain education.

[![Deploy to GitHub Pages](https://github.com/ezekaj/learning_sol/actions/workflows/deploy.yml/badge.svg)](https://github.com/ezekaj/learning_sol/actions/workflows/deploy.yml)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20Site-blue)](https://ezekaj.github.io/learning_sol)
[![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15.1.0-black)](https://nextjs.org/)

## ✨ Features

### 🎮 Interactive Learning Experience
- **Monaco Code Editor** with Solidity syntax highlighting and auto-completion
- **Real-time Compilation** with instant feedback and error detection
- **Interactive Tutorials** with step-by-step guided learning
- **Gamification System** with XP, levels, achievements, and badges

### 🤖 AI-Powered Features
- **Google Gemini Integration** for personalized tutoring and code review
- **Intelligent Code Analysis** with security vulnerability detection
- **Adaptive Learning Paths** based on user progress and skill assessment
- **AI Assistant** with conversation history and context-aware responses

### 🌐 Blockchain Integration
- **Web3 Wallet Support** with MetaMask integration
- **Multi-Testnet Support** (Sepolia, Goerli, Mumbai)
- **Contract Deployment** with gas estimation and transaction monitoring
- **Real-time Blockchain Visualization** using Three.js

### 🎨 Modern UI/UX
- **Glassmorphism & Neumorphism** design patterns
- **Advanced Animations** with GSAP, Lottie, and Framer Motion
- **Responsive Design** optimized for all devices
- **Dark/Light Theme** support

### 🔄 Real-Time Collaboration
- **Live Coding Sessions** with Socket.io
- **Collaborative Editor** with cursor tracking
- **Team Challenges** and group projects
- **Community Chat** and Q&A system

## 🚀 Quick Start

### Prerequisites
- Node.js 18.0.0 or higher
- npm 9.0.0 or higher
- Git

### Installation

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
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Initialize the database**
   ```bash
   npm run db:generate
   npm run db:push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage

### Database Commands

- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio

### Docker Support

```bash
# Build Docker image
npm run docker:build

# Run Docker container
npm run docker:run
```

## 📁 Project Structure

```
learning_sol/
├── app/                    # Next.js App Router
├── components/             # React components
│   ├── ai/                # AI-related components
│   ├── auth/              # Authentication components
│   ├── blockchain/        # Web3 components
│   ├── code/              # Code editor components
│   ├── learning/          # Learning platform components
│   └── ui/                # UI components
├── lib/                   # Utility libraries
├── prisma/                # Database schema
├── public/                # Static assets
├── services/              # External services
├── types/                 # TypeScript type definitions
└── docs/                  # Documentation
```

## 🎯 Competitive Advantages

Our platform surpasses existing solutions by combining:

- **Superior Learning Experience** with multi-modal learning approaches
- **Advanced Technical Features** including integrated IDE and debugging tools
- **Innovative Gamification** with blockchain-native rewards
- **Comprehensive Ecosystem** with job board integration and mentorship

See our [Competitive Analysis](docs/competitive-analysis.md) for detailed comparisons.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [CryptoZombies](https://cryptozombies.io/) for gamification inspiration
- [Alchemy University](https://university.alchemy.com/) for curriculum structure
- [OpenZeppelin](https://openzeppelin.com/) for security best practices
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) for the code editor
- [Three.js](https://threejs.org/) for 3D visualizations

## 📞 Support

- 📧 Email: [elvizekaj02@gmail.com](mailto:elvizekaj02@gmail.com)
- 🐛 Issues: [GitHub Issues](https://github.com/ezekaj/learning_sol/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/ezekaj/learning_sol/discussions)

---

<div align="center">
  <strong>Built with ❤️ for the blockchain community</strong>
</div>
