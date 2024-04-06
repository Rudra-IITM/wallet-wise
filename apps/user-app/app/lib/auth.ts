import db from "@repo/db/client";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";

export const authOptions = {
    providers: [
    CredentialsProvider({
        name: 'Credentials',
        credentials: {
        email: { label: "Email", type: "text", placeholder: "email" },
        password: { label: "Password", type: "password" }
        },
        async authorize(credentials: any) {
            const hashedPassword = await  bcrypt.hash(credentials.password, 10);
            const existingUser = await db.user.findFirst({
                where: {
                    email: credentials.email,
                    password: hashedPassword
                }
            });

            if (existingUser) {
                const passwordMatch = await bcrypt.compare(credentials.password, existingUser.password);
                if (!passwordMatch) {
                    return null;
                }
                return {id: existingUser.id, email: existingUser.email};
            } 

            try {
                const newUser = await db.user.create({
                    data: {
                        email: credentials.email,
                        password: hashedPassword
                    }
                });
                return {id: newUser.id, email: newUser.email};
            } catch (error) {
                console.log(error);
            }
            return null;
        },  
    })
    ],
    // eslint-disable-next-line turbo/no-undeclared-env-vars
    secret: process.env.JWT_SECRET || "default-secret",
    callbacks: {
        async session({token, session}: any) {
            session.user.id = token.sub
            return session
        }
    }
}
