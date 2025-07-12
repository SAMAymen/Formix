import { NextResponse } from "next/server";
import { getLicenseFromDb, verifyLicense } from "@/lib/licensing";

export async function POST(req: Request) {
  try {
    const { licenseKey, domain } = await req.json();
    
    if (!licenseKey || !domain) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check license validity
    const licenseStatus = await verifyLicense(licenseKey, domain);
    
    return NextResponse.json(licenseStatus);
  } catch (error) {
    console.error('License verification error:', error);
    return NextResponse.json(
      { error: "License verification failed" },
      { status: 500 }
    );
  }
}