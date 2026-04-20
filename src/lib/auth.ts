import { betterAuth } from 'better-auth'
import { magicLink } from 'better-auth/plugins'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import { Resend } from 'resend'
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from '#/db';
import { env } from '#/env';

const resend = new Resend(process.env.RESEND_API_KEY)

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg", // or "sqlite" or "mysql"
  }),
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
  plugins: [
    tanstackStartCookies(),
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        await resend.emails.send({
          from: 'login@syncmate.xyz',
          to: email,
          subject: '🎤 Your magic link to BARS.AI',
          html: `<p>Click <a href="${url}">here</a> to sign in to BARS.AI.</p><p>This link expires in 10 minutes.</p>`,
        })
      },
    }),
  ],
})
