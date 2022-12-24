import { NextApiRequest, NextApiResponse } from 'next'
import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
const authorizationUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
authorizationUrl.searchParams.set('prompt', 'consent')
authorizationUrl.searchParams.set('access_type', 'offline')
authorizationUrl.searchParams.set('response_type', 'code')

const options = {
	secret: process.env.SECRET,
	jwt: {
		encryption: true,
		secret: process.env.SECRET,
	},

	pages: {
		signIn: '/auth/signin',
	},
	providers: [
		GoogleProvider({
			authorization: {
				url: authorizationUrl.toString(),
				params: {
					scope: 'https://www.googleapis.com/auth/userinfo.email',
					prompt: 'consent',
					access_type: 'offline',
					response_type: 'code',
				},
			},
			clientId: process.env.GOOGLE_CLIENT_ID || '',
			clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
		}),
	],
	callbacks: {
		async jwt({ token, account }: any) {
			// Persist the OAuth access_token to the token right after signin
			if (account) {
				token.accessToken = account.access_token
				token.refreshToken = account.refresh_token
			}
			return token
		},
		async session({ session, token, user }: any) {
			// Send properties to the client, like an access_token from a provider.
			session.accessToken = token.accessToken
			session.refreshToken = token.refreshToken
			return session
		},
	},
}

export default (req: NextApiRequest, res: NextApiResponse) => NextAuth(req, res, options)
