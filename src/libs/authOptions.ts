import NextAuth, { NextAuthOptions, AuthOptions, Session, User } from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt';
import prisma from '@/libs/prismadb';

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
      CredentialsProvider({
        name: 'credentials',
        credentials: {
          email: { label: 'email', type: 'text' },
          password: { label: 'password', type: 'password' }
        },
        async authorize(credentials) {
          if (!credentials?.email || !credentials?.password) {
            throw new Error('Invalid Credentials');
          }
          
          console.log('logging in')
  
          const user = await prisma.staffs.findFirst({
            where: {
              emailId: credentials.email
            },
            include: {
              permissions: true
            }
          });
  
  
          console.log(user)
  
          if (!user) {
            throw new Error('User does not exist!');
          }
  
          const valid = await bcrypt.compare(
            credentials.password,
            user.hash
          );
  
          if (!valid) {
            throw new Error('Invalid Credentials!');
          }
  
          return {
            emailId: user.emailId,
            id: user.id,
            name: user.name,
            post: user.post,
            admin: user.permissions.admin,
            support: user.permissions.support,
            slaEntry: user.permissions.slaEntry,
            slaReport: user.permissions.slaReport,
            funnel: user.permissions.funnel,
            updatedAt: user.updatedAt
          };
        }
      })
    ],
    debug: process.env.NODE_ENV === 'development',
    session: {
      strategy: "jwt"
    },
    callbacks: {
      async jwt({token,user}){
        if(user){
              token.id = user.id
              token.email = user.emailId
              token.admin = user.admin
              token.support = user.support
              token.slaEntry = user.slaEntry
              token.slaReport = user.slaReport
              token.funnel = user.funnel
              token.post = user.post
              token.updatedAt = user.updatedAt
          }
          return token
      },
      async session({session, token}){
        session.user.id = token.id
        session.user.email = token.email
        session.user.admin = token.admin
        session.user.support = token.support
        session.user.slaEntry = token.slaEntry
        session.user.slaReport = token.slaReport
        session.user.funnel = token.funnel  
        session.user.post = token.post      
        session.user.updatedAt = token.updatedAt
        return session;
      }
    },
    secret: process.env.NEXTAUTH_SECRET
  }