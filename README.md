# Jonas AI Agent - Angular Multi-Chat Interface

A modern, responsive multi-chat interface built with Angular that mimics the ChatGPT user experience with enhanced features. This application supports multiple chat sessions, persistent storage, and real-time messaging simulation.

## 🚀 Features

### 💬 **Multi-Chat Functionality**
- **Multiple Chat Sessions**: Create and manage unlimited chat conversations
- **Chat Sidebar**: Collapsible sidebar with all your chat sessions
- **Session Management**: Rename, delete, and search through your chats
- **Backend Integration**: Chat history automatically loaded from backend API
- **Real-time Persistence**: Conversations saved in real-time to backend

### 🎨 **Modern UI/UX**
- **ChatGPT-like Interface**: Clean, professional design inspired by popular AI chat applications
- **Dark/Light Theme**: Toggle between themes with smooth transitions
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Mobile-First**: Collapsible sidebar and touch-friendly interface
- **Smooth Animations**: Elegant transitions and loading states

### ⚡ **Enhanced Features**
- **Real-time Messaging**: Simulated AI responses with typing indicators
- **Search Functionality**: Find specific chats instantly
- **Keyboard Shortcuts**: 
  - `Ctrl/Cmd + N`: New chat
  - `Ctrl/Cmd + /`: Toggle sidebar
  - `Escape`: Close sidebar (mobile)
- **Message Management**: View message counts and timestamps
- **Suggested Prompts**: Quick start options for new conversations
- **Character Counter**: Track message length with visual feedback

### 🔧 **Technical Features**
- **TypeScript**: Full type safety and modern development
- **Reactive Programming**: RxJS for state management
- **Standalone Components**: Modern Angular 17+ architecture
- **Service-based Architecture**: Clean separation of concerns
- **Local Storage**: Theme persistence and app preferences
- **Backend API**: Real-time chat history synchronization
- **Export/Import**: Backup and restore chat data

## 🛠️ Technologies Used

- **Angular 17+**: Modern Angular with standalone components
- **TypeScript**: Type-safe development with strict mode
- **RxJS**: Reactive programming for state management
- **CSS3**: Modern styling with flexbox, grid, and custom properties
- **LocalStorage API**: Client-side data persistence
- **Google Fonts**: Inter font family for excellent typography

## 📦 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Azure_Board_Web_App
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:4200`

## 🎯 Usage

### Basic Chat Operations
- **Start New Chat**: Click "New Chat" button or use `Ctrl/Cmd + N`
- **Send Messages**: Type your message and press Enter or click the send button
- **Switch Chats**: Click on any chat in the sidebar to switch between conversations
- **Theme Toggle**: Click the moon/sun icon in the header

### Chat Management
- **Rename Chat**: Click the edit icon next to active chat or double-click chat title
- **Delete Chat**: Click the delete icon next to active chat
- **Search Chats**: Use the search box in the sidebar to find specific conversations
- **Clear All**: Use the "Clear All" button at the bottom of the sidebar

### Keyboard Shortcuts
- **Enter**: Send message
- **Shift + Enter**: Add new line in message
- **Ctrl/Cmd + N**: Create new chat
- **Ctrl/Cmd + /**: Toggle sidebar
- **Escape**: Close sidebar on mobile

## 📁 Project Structure

```
src/
├── app/
│   ├── components/
│   │   └── chat-sidebar/           # Sidebar with chat list
│   │       ├── chat-sidebar.component.ts
│   │       └── chat-sidebar.component.css
│   ├── services/
│   │   └── chat.service.ts         # Chat state management
│   ├── models/
│   │   └── chat.models.ts          # TypeScript interfaces
│   ├── app.component.ts            # Main application component
│   └── app.component.css           # Main application styles
├── assets/                         # Static assets
├── styles.css                      # Global styles
├── index.html                      # Main HTML file
└── main.ts                         # Application bootstrap
```

## 🎨 Customization

### Changing Colors
The application uses CSS custom properties for easy theme customization:

```css
/* Primary gradient */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Theme colors */
--primary-color: #667eea;
--secondary-color: #764ba2;
```

### Adding New Features
The modular architecture makes it easy to extend:
- **New Message Types**: Extend the `Message` interface
- **Custom AI Responses**: Modify the `generateAIResponse()` method
- **Additional Themes**: Extend the `UserPreferences` interface
- **API Integration**: Replace localStorage calls in `ChatService`

## 🌐 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Azure Static Web Apps
The application is ready for deployment to Azure Static Web Apps or any static hosting service.

```bash
# Example Azure Static Web Apps deployment
az staticwebapp create \
  --name jonas-ai-agent \
  --resource-group myResourceGroup \
  --source . \
  --location "East US 2" \
  --branch main \
  --app-location "/" \
  --output-location "dist/jonas-ai-agent"
```

## 🔧 Development

### Available Scripts
- `npm start`: Start development server with hot reload
- `npm run build`: Build for production
- `npm run watch`: Build in watch mode for development
- `npm test`: Run unit tests

### State Management
The application uses a service-based architecture with RxJS:
- **ChatService**: Manages all chat-related state and operations
- **Reactive State**: Uses BehaviorSubjects for real-time updates
- **Local Storage**: Automatic persistence with configurable auto-save

### Data Models
```typescript
interface ChatSession {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messages: Message[];
  messageCount: number;
}

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  tokenCount?: number;
}
```

## 🔮 Future Enhancements (Ready for FastAPI Backend)

### Backend Integration Ready
- **RESTful API**: Service methods designed for easy API integration
- **Authentication**: User management system ready
- **Real AI Integration**: Replace mock responses with actual AI services
- **Cloud Storage**: Replace localStorage with cloud database
- **Real-time Updates**: WebSocket support for live collaboration

### Planned Features
- **File Attachments**: Upload and share files in chats
- **Voice Messages**: Record and send voice notes
- **Chat Sharing**: Share conversations with others
- **Advanced Search**: Full-text search across all messages
- **Message Reactions**: React to messages with emojis
- **Conversation Templates**: Pre-built conversation starters

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎊 Acknowledgments

- Design inspired by OpenAI's ChatGPT interface
- Built with Angular and modern web standards
- Icons and typography from Google Fonts and Material Design
- Responsive design patterns from modern web applications

---

**Jonas AI Agent** - A comprehensive multi-chat interface ready for AI integration and cloud deployment! 🚀

### 🏗️ Architecture Highlights

- **Modular Design**: Each component has a single responsibility
- **Type Safety**: Full TypeScript coverage with strict mode
- **Performance**: Efficient change detection and virtual scrolling ready
- **Accessibility**: WCAG 2.1 compliant with keyboard navigation
- **Scalability**: Ready for thousands of chat sessions and messages