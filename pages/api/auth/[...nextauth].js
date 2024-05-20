// next-auth.config.js

import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import { getServerSession } from 'next-auth';
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import clientPromise from "@/lib/mongodb";

// Define a list of admin email addresses
const adminEmails = ['tharuuxofc@gmail.com', 'info@neo.lk'];

const authOptions = {
  // Use the value of SECRET from environment variables
  secret: process.env.SECRET,
  // Define authentication providers
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET
    }),
  ],
  // Use MongoDBAdapter for session storage
  adapter: MongoDBAdapter(clientPromise),
  // Callback to check if the user is an admin
  callbacks: {
    session: async ({ session, token, user }) => {
      // If user is in the admin list, allow access
      if (adminEmails.includes(session?.user?.email)) {
        return session;
      } else {
        // Otherwise, disallow access
        return false;
      }
    },
  },
};

// Export NextAuth instance with configured options
export default NextAuth(authOptions);

// Function to check if a request is from an admin user
export async function isAdminRequest(req, res) {
  // Get the session using getServerSession
  const session = await getServerSession(req, res, authOptions);
  // If session is not found or user is not admin, respond with 401 Unauthorized
  if (!session?.user || !adminEmails.includes(session.user.email)) {
    res.status(401).end();
    throw new Error('Unauthorized');
  }
}
