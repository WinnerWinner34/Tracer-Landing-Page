[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/your-repo/tracer-landing-page)

# Tracer Fleet Tracking - Next.js Landing Page

Tracer Fleet Tracking is a modern, responsive landing page built with **Next.js 14**, **TypeScript**, and **Tailwind CSS**. It features email capture functionality with Brevo integration for lead generation, optimized for deployment on Netlify.

---

## Features

- **Next.js 14** app router with **TypeScript**
- **Tailwind CSS** v3 for flexible styling customization
- **Email capture form** with Brevo email integration
- **Netlify Functions** for serverless backend
- Smooth transitions powered by **Framer Motion**
- Built-in **font optimization** with [next/font](https://nextjs.org/docs/app/api-reference/components/font)
- Automatic **image optimization** via [next/image](https://nextjs.org/docs/app/building-your-application/optimizing/images)
- Access to **31+ icon packs** via [React Icons](https://react-icons.github.io/react-icons/)
- Near-perfect **Lighthouse score**
- Modular, responsive, and **scalable components**

---

## Sections

- Hero
- Features (Benefits)
- Testimonials
- FAQ
- CTA with Email Capture Form
- Footer

---

## Getting Started

### Prerequisites

Before starting, make sure you have the following installed:

- **Node.js**: Version 18 or later
- **npm**: Version 8 or later (bundled with Node.js)
- **Netlify CLI** (optional): For local testing with functions
- **Code editor**: [VS Code](https://code.visualstudio.com/) is recommended

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-repo/tracer-landing-page.git
   cd tracer-landing-page
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables** (for local development):
   Create a `.env.local` file in the root directory:
   ```env
   BREVO_API_KEY=xkeysib-your-api-key-here
   CONTACT_TO_EMAIL=admin@yourcompany.com
   FROM_EMAIL=noreply@yourcompany.com
   FROM_NAME=Tracer Fleet Tracking
   SITE_URL=http://localhost:3000
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```
   Or with Netlify CLI (to test functions locally):
   ```bash
   npm run netlify:dev
   ```

5. **View your project**: Open [localhost:3000](http://localhost:3000)

---

## Environment Variables

The following environment variables are required for the contact form to work:

| Variable | Description | Required |
|----------|-------------|----------|
| `BREVO_API_KEY` | Your Brevo API key (format: xkeysib-...) | Yes |
| `CONTACT_TO_EMAIL` | Email address to receive form submissions | Yes |
| `FROM_EMAIL` | Sender email address | No (defaults to noreply@tracerfleet.com) |
| `FROM_NAME` | Sender name for emails | No (defaults to Tracer Fleet Tracking) |
| `SITE_URL` | Your website URL | No (defaults to https://tracerfleet.com) |

---

## Deploying on Netlify

### Quick Deploy

Click the "Deploy to Netlify" button at the top of this README for instant deployment.

### Manual Deployment

1. **Push to GitHub**: Push your code to a GitHub repository

2. **Import to Netlify**: 
   - Go to [Netlify](https://app.netlify.com)
   - Click "Add new site" > "Import an existing project"
   - Connect your GitHub account and select your repository

3. **Configure Build Settings**:
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Functions directory: `netlify/functions` (automatically detected)

4. **Add Environment Variables**:
   - Go to Site Settings > Environment Variables
   - Add all required variables listed above

5. **Deploy**: Click "Deploy site"

### Using Netlify CLI

1. **Install Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**:
   ```bash
   netlify login
   ```

3. **Initialize site**:
   ```bash
   netlify init
   ```

4. **Set environment variables**:
   ```bash
   netlify env:set BREVO_API_KEY "xkeysib-your-api-key"
   netlify env:set CONTACT_TO_EMAIL "admin@yourcompany.com"
   ```

5. **Deploy**:
   ```bash
   netlify deploy --prod
   ```

---

## Local Development with Netlify Dev

For testing Netlify Functions locally:

```bash
# Install Netlify CLI globally
npm install -g netlify-cli

# Run with Netlify Dev
netlify dev
```

This will:
- Start the Next.js dev server
- Serve Netlify Functions locally
- Inject environment variables from Netlify

---

## Customization

1. **Edit colors**: Update `globals.css` for primary, secondary, background, and accent colors
2. **Update site details**: Customize `siteDetails.ts` in `/src/data` to reflect your brand
3. **Modify content**: Files in `/src/data` handle data for navigation, features, testimonials, and more
4. **Replace favicon**: Add your icon to `/src/app/favicon.ico`
5. **Add images**: Update `public/images` for Open Graph metadata

---

## Project Structure

```
tracer-landing-page/
├── src/
│   ├── app/          # Next.js app router pages
│   ├── components/   # React components
│   │   └── ContactForm.tsx  # Email capture form
│   ├── data/         # Content data files
│   └── styles/       # Global styles
├── netlify/
│   └── functions/    # Serverless functions
│       └── send-email.ts  # Brevo email handler
├── public/           # Static assets
└── netlify.toml      # Netlify configuration
```

---

## Troubleshooting

### Contact Form Not Working

1. **Check environment variables**: Ensure all required variables are set in Netlify
2. **Verify Brevo API key**: Make sure your API key is valid and has proper permissions
3. **Check function logs**: View logs in Netlify dashboard > Functions tab
4. **Test locally**: Use `netlify dev` to test functions locally

### Build Errors

1. **Clear cache**: `rm -rf .next node_modules && npm install`
2. **Check Node version**: Ensure you're using Node.js 18+
3. **Review build logs**: Check Netlify deploy logs for specific errors

---

## Contributing

We welcome contributions! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## Support

For issues and questions:
- Create an issue on GitHub
- Check existing issues for solutions
- Review the documentation

---

## License

This project is open-source and available under the MIT License. Feel free to use, modify, and distribute it for personal or commercial projects.