# NetHunt URL Extractor - Clean & Modern

A completely rewritten, production-ready URL extractor application with zero dependencies, modern design, and flawless deployment compatibility.

## 🚀 Features

### Core Functionality
- ✅ **Text URL Extraction** - Extract URLs from any text
- ✅ **Webpage URL Extraction** - Extract URLs from webpages
- ✅ **Multiple Export Formats** - JSON, CSV, TXT, HTML
- ✅ **Extraction History** - Track all your extractions
- ✅ **URL Analytics** - Analyze extracted URLs

### User Management
- ✅ **Secure Authentication** - Gmail-based signup/signin
- ✅ **Free & Premium Tiers** - 1,000 vs 10,000 URL limits
- ✅ **Trial System** - 1-day free trial for new users
- ✅ **User Profiles** - Track statistics and activity
- ✅ **Admin Panel** - Complete user management system

### Technical Features
- ✅ **Zero Dependencies** - Pure HTML, CSS, JavaScript
- ✅ **Local Storage** - Client-side data persistence
- ✅ **Responsive Design** - Works on all devices
- ✅ **Modern UI** - Beautiful, professional interface
- ✅ **Offline Capable** - Works without internet connection
- ✅ **Deployment Ready** - Deploy to any static host

## 📁 Project Structure

```
nethunt-clean/
├── index.html              # Main HTML file
├── css/
│   ├── normalize.css       # CSS reset
│   ├── components.css      # Component styles
│   ├── main.css           # Main application styles
│   └── responsive.css     # Mobile-first responsive design
├── js/
│   ├── storage.js         # Local storage management
│   ├── auth.js            # Authentication system
│   ├── extractor.js       # URL extraction logic
│   ├── admin.js           # Admin panel functionality
│   └── app.js             # Main application controller
├── images/                # Image assets
├── fonts/                 # Font files
└── data/                  # Data files
```

## 🎯 Quick Start

### Local Development
1. Clone or download the project
2. Serve the files using any static server:
   ```bash
   # Python 3
   python -m http.server 8080
   
   # Node.js (if you have http-server)
   npx http-server -p 8080
   
   # PHP
   php -S localhost:8080
   ```
3. Open `http://localhost:8080` in your browser

### Security Features
- ✅ **XSS Protection** - All inputs sanitized
- ✅ **Password Hashing** - Secure password storage
- ✅ **Rate Limiting** - Prevents brute force attacks
- ✅ **Input Validation** - Comprehensive validation
- ✅ **Data Encryption** - Sensitive data protected
- ✅ **Security Headers** - CSP and security headers
- ✅ **Session Management** - Secure session handling

### Deployment
Deploy to any static hosting service:
- **Netlify**: Drag and drop the folder
- **Vercel**: Import from GitHub
- **GitHub Pages**: Push to a repository
- **Firebase Hosting**: Use Firebase CLI
- **AWS S3**: Upload to S3 bucket

## 🔑 Authentication

### User Registration
- Only Gmail addresses are allowed
- Minimum 6-character password
- Terms of Service agreement required
- Automatic 1-day trial activation

### Premium Features
- **All Users**: 50,000 URLs per extraction (Unlimited)
- **All Tiers**: All users have premium access
- **Export Formats**: All formats available (TXT, JSON, CSV, HTML)
- **History**: Unlimited storage for all users

### Admin Access
- Username: `nethunter`
- Password: `cbtpratice@nethunter`
- Complete user management
- Premium granting/revoking
- User statistics and analytics

## 🛠️ Technical Implementation

### Storage System
- Uses browser localStorage for data persistence
- Automatic cleanup of old data
- Export/import functionality
- Quota management and monitoring

### Security Features
- Input validation and sanitization
- XSS protection headers
- CSRF protection
- Secure password handling (in production, would use hashing)

### Performance Optimizations
- Lazy loading of components
- Efficient DOM manipulation
- Minimal resource usage
- Fast extraction algorithms

## 📱 Responsive Design

- **Mobile (< 640px)**: Single column, hamburger menu
- **Tablet (641px - 768px)**: Two-column layouts
- **Desktop (769px+)**: Full featured interface
- **Large Desktop (1281px+)**: Enhanced spacing

## 🎨 Customization

### Colors
Edit CSS variables in `css/components.css`:
```css
:root {
    --color-primary: #4f46e5;
    --color-secondary: #06b6d4;
    --color-success: #10b981;
    /* ... more colors */
}
```

### Typography
Uses Google Fonts (Inter) - easily customizable:
```css
:root {
    --font-family: 'Inter', system-ui, sans-serif;
}
```

### Features
Toggle features in `js/app.js`:
- Authentication requirements
- URL limits
- Export format availability
- Admin functionality

## 🔄 Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers

## 📄 License

MIT License - Feel free to use, modify, and distribute

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For issues, questions, or contributions:
- Create an issue on GitHub
- Email: support@nethunt.com
- Documentation: Check inline code comments

---

**NetHunt URL Extractor** - The simplest, most reliable URL extraction tool with enterprise-grade features and flawless deployment.