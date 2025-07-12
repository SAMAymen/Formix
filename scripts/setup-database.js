const { PrismaClient } = require('@prisma/client');
const { randomUUID } = require('crypto');

async function setupDatabase() {
  console.log('Setting up database...');
  
  const prisma = new PrismaClient();
  
  try {
    // Create admin user
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    
    const adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'Admin',
        role: 'ADMIN'
      }
    });
    
    console.log(`Admin placeholder created with email: ${adminEmail}`);
    console.log('Note: You must sign in with this Google account to gain admin privileges');
    
    // Create default template forms
    const templateForm1 = await prisma.form.create({
      data: {
        title: 'Contact Form Template',
        description: 'A simple contact form template',
        userId: adminUser.id,
        isArchived: false,
        fields: {
          fields: [
            {
              type: 'text',
              label: 'Full Name',
              required: true,
              order: 1,
              placeholder: 'Enter your full name'
            },
            {
              type: 'email',
              label: 'Email Address',
              required: true,
              order: 2,
              placeholder: 'your@email.com'
            },
            {
              type: 'textarea',
              label: 'Message',
              required: true,
              order: 3,
              placeholder: 'Your message here...'
            }
          ]
        }
      }
    });
    
    // Create system settings if the model exists
    try {
      const initialSettings = await prisma.systemSettings.create({
        data: {
          siteTitle: 'Formix',
          primaryColor: '#16a34a',
          secondaryColor: '#15803d',
          accentColor: '#86efac',
          logoUrl: '/logo.png',
          faviconUrl: '/favicon.ico',
          companyName: 'Your Company',
          contactEmail: 'support@example.com',
          websiteUrl: 'https://example.com',
          setupCompleted: false,
          licenseKey: randomUUID(),
          maxForms: 9999,
          allowedDomains: '*'
        }
      });
      console.log('System settings initialized');
    } catch (e) {
      console.log('SystemSettings model may not exist yet. Skipping...');
    }
    
    console.log('Database setup complete!');
  } catch (error) {
    console.error('Database setup error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupDatabase();