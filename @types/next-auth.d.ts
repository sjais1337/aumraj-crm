import { DefaultSession } from "next-auth";
  


declare module 'next-auth' {
    interface User {
        id: string;
        emailId: string;
        name: string;
        admin: boolean?;
        support: boolean?;
        funnel: boolean?;
        slaEntry: boolean?;
        slaReport: boolean?;
        post: string;
        updatedAt: Date
    }

    interface Session {
        user: {
            id: string;
            emailId: string;
            name: string;
            admin: boolean?;
            support: boolean?;
            funnel: boolean?;
            slaEntry: boolean?;
            slaReport: boolean?;
            post: string;
            updatedAt: Date
        } & DefaultSession['user'];
    }

    interface Account { 
        name: string;
        id: string;
        emailId: string;
        admin: boolean?;
        support: boolean?;
        funnel: boolean?;
        slaEntry: boolean?;
        slaReport: boolean?;
        post: string;
        updatedAt: Date
    }
}

declare module 'next-auth/jwt' {
    export interface JWT extends Record<string, unknown> {
        name: string;
        id: string;
        emailId: string;
        admin: boolean?;
        support: boolean?;
        funnel: boolean?;
        slaEntry: boolean?;
        slaReport: boolean?;
        post: string;
        updatedAt: Date
    }
  }