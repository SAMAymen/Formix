import NextAuth, { 
  type NextAuthOptions,
  type User,
  type Account,
  type Session,
} from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import { ExtendedSession, SessionUser } from "@/lib/types";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  useSecureCookies: process.env.NODE_ENV === "production",
  cookies: {
    sessionToken: {
      name: `${process.env.NODE_ENV === "production" ? "__Secure-" : ""}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          access_type: "offline",
          response_type: "code",
          prompt: "consent",
          scope: [
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email',
          ].join(' '),
        },
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  pages: {
    signIn: '/login',
    error: '/login/error',
  },
  callbacks: {
    async session({ session, token }): Promise<Session> {
      try {
        const extendedSession: ExtendedSession = {
          ...session,
          expires: session.expires,
          user: {
            ...session.user,
            id: token.sub || "",
            accessToken: token.accessToken as string || "",
            refreshToken: token.refreshToken as string || "",
            expiresAt: token.expiresAt as number || 0,
            email: token.email as string || "",
            googleAuthUser: token.googleAuthUser as string || "",
          }
        };
        return extendedSession as Session;
      } catch (error) {
        console.error("Session callback error:", error);
        // Return a minimal valid session to prevent crashes
        return {
          ...session,
          user: {
            ...session.user,
            id: token.sub || ""
          }
        } as Session;
      }
    },

    async jwt({ token, user, account, profile }) {
      // Initial sign-in
      if (account && user) {
        try {
          const primaryEmail = profile?.email;
          
          if (primaryEmail) {
            // Upsert user and account in a single transaction
            await prisma.$transaction(async (tx: any) => {
              await tx.user.update({
                where: { id: user.id },
                data: { 
                  email: primaryEmail,
                  googleAuthUser: primaryEmail 
                }
              });

              // Fixed update query using correct compound index
              await tx.account.update({
                where: { 
                  provider_providerAccountId: {
                    provider: "google",
                    providerAccountId: account.providerAccountId
                  }
                },
                data: {
                  access_token: account.access_token,
                  refresh_token: account.refresh_token,
                  expires_at: account.expires_at
                }
              });
            });

            return {
              ...token,
              sub: user.id,
              accessToken: account.access_token || '',
              refreshToken: account.refresh_token || '',
              expiresAt: account.expires_at || Math.floor(Date.now() / 1000) + 3600,
              email: primaryEmail,
              googleAuthUser: primaryEmail,
              providerAccountId: account.providerAccountId, // Store for token refresh
            };
          }
        } catch (error) {
          console.error('Initial sign-in error:', error);
        }
      }

      // Token refresh
      if (token.expiresAt && Date.now() < (token.expiresAt as number) * 1000) {
        return token;
      }

      if (token.refreshToken) {
        try {
          const account = await prisma.account.findFirst({
            where: { 
              userId: token.sub,
              provider: "google"
            },
            select: { refresh_token: true, providerAccountId: true }
          });

          if (!account?.refresh_token) {
            throw new Error("No refresh token available");
          }

          const response = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
              client_id: process.env.GOOGLE_CLIENT_ID!,
              client_secret: process.env.GOOGLE_CLIENT_SECRET!,
              grant_type: "refresh_token",
              refresh_token: account.refresh_token,
            }),
          });

          const data = await response.json();
          if (!response.ok) throw new Error("Token refresh failed");

          // Fixed update query using correct compound index
          await prisma.account.update({
            where: { 
              provider_providerAccountId: {
                provider: "google",
                providerAccountId: account.providerAccountId
              }
            },
            data: {
              access_token: data.access_token,
              expires_at: Math.floor(Date.now() / 1000) + (data.expires_in || 3600)
            }
          });

          return {
            ...token,
            accessToken: data.access_token,
            expiresAt: Math.floor(Date.now() / 1000) + (data.expires_in || 3600),
          };
        } catch (error) {
          console.error("Token refresh error:", error);
          return { ...token, error: "RefreshError" };
        }
      }

      return token;
    },

    async signIn({ user, account, profile, email }) {
      // Allow Google sign-in and link admin privileges for configured email
      if (account?.provider === 'google') {
        // Check if this is the configured admin email
        try {
          const configuredAdmin = await prisma.user.findUnique({
            where: {
              email: user.email || undefined, // Fix null issue by using undefined
              role: 'ADMIN'
            }
          });

          if (configuredAdmin) {
            // This is the admin user - ensure the account is properly linked
            const existingAccount = await prisma.account.findFirst({
              where: {
                userId: configuredAdmin.id,
                provider: 'google'
              }
            });
            
            if (!existingAccount && account) {
              // Link this Google account to the admin user
              await prisma.account.create({
                data: {
                  userId: configuredAdmin.id,
                  type: account.type,
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                  access_token: account.access_token,
                  refresh_token: account.refresh_token,
                  expires_at: account.expires_at,
                  token_type: account.token_type,
                  scope: account.scope,
                  id_token: account.id_token,
                }
              });
            }
          }

          // Always allow Google sign-in
          return true;
        } catch (error) {
          console.error("Error during admin authorization:", error);
          return true; // Still allow signin, even if admin check fails
        }
      }
      
      return true;
    },
  },
  
  logger: {
    error: (code, metadata) => console.error(`Auth error: ${code}`, metadata),
    warn: (code) => console.warn(`Auth warning: ${code}`),
    debug: (code, metadata) => console.log(`Auth debug: ${code}`, metadata),
  },
  events: {
    signOut: ({ token }) => {
      console.log('SignOut:', token?.email || token?.sub || 'Unknown user');
    },
    createUser: async ({ user }) => {
      await prisma.user.update({
        where: { id: user.id },
        data: { googleAuthUser: '0' }
      });
    }
  },
};