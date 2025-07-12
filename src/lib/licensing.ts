import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

// Cache license info to reduce DB calls
let licenseCache: any = null;
let lastCacheTime = 0;
const CACHE_TTL = 3600000; // 1 hour cache

interface LicenseStatus {
  isValid: boolean;
  message?: string;
  expiresAt?: Date;
  restrictions?: {
    maxForms?: number;
    allowedDomains?: string[];
  };
}

/**
 * Gets the license info from the database
 */
export async function getLicenseFromDb() {
  // Return from cache if available and not expired
  const now = Date.now();
  if (licenseCache && (now - lastCacheTime < CACHE_TTL)) {
    return licenseCache;
  }
  
  // Fetch fresh license data
  const settings = await prisma.systemSettings.findFirst();
  if (!settings) {
    throw new Error('System settings not found');
  }
  
  // Update cache
  licenseCache = {
    licenseKey: settings.licenseKey,
    maxForms: settings.maxForms,
    allowedDomains: settings.allowedDomains ? 
      settings.allowedDomains.split(',').map(d => d.trim()) : 
      ['*'],
    expiresAt: settings.licenseExpiresAt
  };
  lastCacheTime = now;
  
  return licenseCache;
}

/**
 * Generates a hash from license key and domain
 */
function generateLicenseHash(licenseKey: string, domain: string) {
  return crypto
    .createHash('sha256')
    .update(`${licenseKey}-${domain}-formix`)
    .digest('hex');
}

/**
 * Verifies if a license is valid for a specific domain
 */
export async function verifyLicense(licenseKey: string, domain: string): Promise<LicenseStatus> {
  try {
    // Get license data
    const license = await getLicenseFromDb();
    
    // Check if license key matches
    if (license.licenseKey !== licenseKey) {
      return { 
        isValid: false, 
        message: 'Invalid license key' 
      };
    }
    
    // Check if license is expired
    if (license.expiresAt && new Date() > new Date(license.expiresAt)) {
      return { 
        isValid: false, 
        message: 'License has expired',
        expiresAt: license.expiresAt
      };
    }
    
    // Check domain restrictions
    if (license.allowedDomains.includes('*')) {
      // Any domain is allowed
    } else {
      const domainIsAllowed = license.allowedDomains.some((allowedDomain: string) => {
        // Exact match
        if (domain === allowedDomain) return true;
        
        // Subdomain wildcard match
        if (allowedDomain.startsWith('*.')) {
          const baseDomain = allowedDomain.substring(2);
          if (domain.endsWith(baseDomain)) return true;
        }
        
        return false;
      });
      
      if (!domainIsAllowed) {
        return { 
          isValid: false, 
          message: 'Domain not authorized for this license'
        };
      }
    }
    
    // License is valid
    return {
      isValid: true,
      expiresAt: license.expiresAt,
      restrictions: {
        maxForms: license.maxForms,
        allowedDomains: license.allowedDomains
      }
    };
  } catch (error) {
    console.error('License verification error:', error);
    return { 
      isValid: false, 
      message: 'License verification failed'
    };
  }
}