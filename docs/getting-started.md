# Getting Started with Formix

Welcome to **Formix** - the professional form builder with seamless Google Sheets integration! This comprehensive guide will have you up and running in minutes.

## 🚀 Quick Start

### System Requirements

- **Node.js**: Version 16 or higher
- **Package Manager**: npm or yarn
- **Database**: MongoDB (Atlas recommended)
- **Cloud Platform**: Google Cloud Platform account

### Installation Steps

1. **Extract Files**
  ```bash
  # Extract Formix to your project directory
  unzip formix-package.zip
  cd formix
  ```

2. **Install Dependencies**
  ```bash
  npm install
  # or for yarn users
  yarn install
  ```

3. **Launch Setup Wizard**
  ```bash
  npm run dev
  ```

4. **Complete Configuration**
  - Open your browser to `http://localhost:3000/setup`
  - Follow the guided setup process

## ⚙️ Configuration Guide

### MongoDB Database Setup

**Recommended: MongoDB Atlas (Cloud)**

1. Create your free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (M0 Sandbox is free)
3. Create database user: `Database Access` → `Add New Database User`
4. Configure network access: `Network Access` → `Add IP Address`
5. Get connection string: `Clusters` → `Connect` → `Connect your application`

**Local MongoDB Installation**
```bash
# For local development
mongodb://localhost:27017/formix
```

### Google Cloud Integration

**Enable Required APIs**
1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select your project
3. Navigate to `APIs & Services` → `Library`
4. Enable:
  - Google Sheets API
  - Google Drive API
  - Google+ API (for authentication)

**OAuth 2.0 Configuration**
1. Go to `APIs & Services` → `Credentials`
2. Create `OAuth 2.0 Client ID`
3. Configure consent screen with your app details
4. Add authorized origins:
  ```
  http://localhost:3000
  https://yourdomain.com
  ```
5. Add redirect URIs:
  ```
  http://localhost:3000/api/auth/callback/google
  https://yourdomain.com/api/auth/callback/google
  ```

## 🎨 Customization Options

### Brand Personalization

Access the admin dashboard to customize:

- **Visual Identity**
  - Upload custom logo and favicon
  - Configure color palette and themes
  - Set typography preferences

- **Company Information**
  - Product name and tagline
  - Company details and contact info
  - Terms of service and privacy policy URLs

### Email Template Customization

Located in `src/emails/templates/`:
- `welcome.html` - User welcome emails
- `notification.html` - Form submission alerts
- `password-reset.html` - Password recovery emails

**Pro Tip**: Use your brand colors and logo in email templates for consistent branding.

## 📋 License Management

### Activating Your License

1. Navigate to **Admin Dashboard** → **Settings** → **License**
2. Enter your purchase license key
3. Verify domain binding
4. Save configuration

### Domain Transfer

To move your license to a new domain:
1. Contact support for domain release
2. Update license key with new domain
3. Update OAuth redirect URIs in Google Cloud Console

## 🛠️ Advanced Configuration

### Environment Variables

Create `.env.local` for custom settings:
```bash
# Database
MONGODB_URI=your_mongodb_connection_string

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Application
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# Email (Optional)
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASS=your_password
```

### Performance Optimization

- Enable MongoDB indexing for large datasets
- Configure CDN for static assets
- Set up Redis for session management (production)

## 🆘 Troubleshooting

### Database Connection Issues

**Problem**: Cannot connect to MongoDB
- ✅ Verify connection string format
- ✅ Check network connectivity and firewall settings
- ✅ Confirm database user permissions
- ✅ Ensure IP address is whitelisted (Atlas)

### Google Integration Problems

**Problem**: OAuth authentication failing
- ✅ Verify client ID and secret are correct
- ✅ Check that APIs are enabled in Google Cloud
- ✅ Confirm redirect URIs match exactly
- ✅ Ensure OAuth consent screen is published

**Problem**: Google Sheets access denied
- ✅ Verify Google Drive API is enabled
- ✅ Check OAuth scopes include Sheets access
- ✅ Confirm user has granted necessary permissions

### Common Setup Issues

**Port Already in Use**
```bash
# Kill process on port 3000
npx kill-port 3000
# Or use different port
npm run dev -- -p 3001
```

**Missing Dependencies**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📞 Support & Resources

### Getting Help

- **Email Support**: support@formix.com
- **Documentation**: [https://docs.formix.com](https://docs.formix.com)
- **Video Tutorials**: Available in the admin dashboard
- **Community Forum**: Connect with other users

### What's Included

✅ **Complete Setup Wizard** - Guided configuration process  
✅ **Database Migration Tools** - Automated schema setup  
✅ **Licensing System** - Secure domain-based activation  
✅ **White-label Ready** - Full branding customization  
✅ **Email Templates** - Professional notification system  
✅ **Google Integration** - Seamless Sheets connectivity  
✅ **Admin Dashboard** - Comprehensive management interface  
✅ **API Documentation** - Complete endpoint reference  

---

**Ready to build amazing forms?** Start with the setup wizard and you'll be creating professional forms with Google Sheets integration in under 10 minutes!
