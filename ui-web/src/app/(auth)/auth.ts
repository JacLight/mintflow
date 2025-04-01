// app/lib/auth.ts
import { authConfig } from './auth.config';
import { loginWithAppMint, validateSocialLoginWithAppMint } from '@/lib/appmint-auth-integration';

// Declare module augmentation for next-auth



// Credentials({
//   credentials: {},
//   async authorize({ email, password }: any) {
//     try {
//       // Use AppMint for username/password login
//       const response = await loginWithAppMint(email, password);

//       if (response && response.token) {
//         // Return user data in the format expected by NextAuth
//         return {
//           id: response.user?.id || response.userId || 'appmint-user',
//           email: email,
//           name: response.user?.name || response.user?.firstName || '',
//           image: response.user?.image || '',
//           // Store AppMint token for future use
//           appmintToken: response.token,
//         };
//       }

//       return null;
//     } catch (error) {
//       console.error('AppMint login error:', error);
//       return null;
//     }
//   },
// }),
//   ],

// const callbacks = () => {
//     async signIn({ user, account, profile }) {
//     // For social logins, validate with AppMint
//     if (account && account.provider !== 'credentials' && user.email) {
//       try {
//         // Validate social login with AppMint, passing both user and account info
//         const validatedUser = await validateSocialLoginWithAppMint(user, account);

//         // Update user with AppMint data if available
//         if (validatedUser.appmintUser) {
//           user.appmintToken = validatedUser.appmintUser.token;
//         }

//         return true;
//       } catch (error) {
//         console.error('Error validating social login with AppMint:', error);
//         // Allow sign in even if AppMint validation fails
//         return true;
//       }
//     }

//     return true;
//   },
//     async jwt({ token, user, account }) {
//     // Add AppMint token to JWT token
//     if (user && user.appmintToken) {
//       token.appmintToken = user.appmintToken;
//     }

//     if (user) {
//       token.id = user.id;
//     }

//     return token;
//   },
//     async session({
//     session,
//     token,
//   }: {
//     session: ExtendedSession;
//     token: any;
//   }) {
//     if (session.user) {
//       session.user.id = token.id as string;
//       // Add AppMint token to session
//       (session as any).appmintToken = token.appmintToken;
//     }

//     return session;
//   },
// },
