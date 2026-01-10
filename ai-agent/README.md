# AI Agent Pro

An intelligent AI agent platform for task execution, code generation, research, and data analysis.

## Features

- 🤖 **Multiple AI Agents** - Specialized agents for different tasks
- 💻 **Code Generation** - Generate production-ready code
- 🔍 **Research** - Deep research with comprehensive reports
- 📊 **Data Analysis** - Analyze and visualize data
- ✍️ **Content Writing** - Professional content creation
- 🎯 **Task Planning** - Multi-step task execution
- 💾 **Memory** - Context retention across conversations

## Quick Start

### Option 1: Deploy to Vercel (Recommended)

1. Fork this repository
2. Go to [Vercel](https://vercel.com)
3. Import your forked repository
4. Deploy (no configuration needed)
5. Your site will be live at `your-project.vercel.app`

### Option 2: Deploy to Netlify

1. Go to [Netlify](https://netlify.com)
2. Drag and drop the project folder
3. Your site will be live instantly

### Option 3: Run Locally

```bash
# No build required - just open in browser
python -m http.server 8000
# Or
npx serve .
```

Then open `http://localhost:8000`

## Configuration

### Adding AI Capabilities

The app supports multiple AI providers:

1. **OpenAI**
   - Click Settings (⚙️) in the app
   - Enter your OpenAI API key
   - Start chatting with full AI capabilities

2. **Custom Backend**
   - Modify `script.js` to connect to your backend
   - Update the `getAIResponse()` function

### Customization

- **Branding**: Edit colors in `style.css` (`:root` variables)
- **Agents**: Modify `agentConfigs` in `script.js`
- **Features**: Update content in `index.html`

## Tech Stack

- **Frontend**: Pure HTML, CSS, JavaScript (no build step required)
- **Styling**: Custom CSS with modern gradients and animations
- **AI Integration**: OpenAI API (configurable)
- **Deployment**: Vercel, Netlify, or any static host

## Inspired By

This project is inspired by [Lemon AI](https://github.com/hexdocom/lemonai), an open-source AI agent platform.

## License

MIT License - Feel free to use and modify for your needs

## Support

For issues or questions, please open an issue on GitHub.
