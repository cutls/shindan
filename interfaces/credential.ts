export interface IGoogleCredential {
	accessToken: string
	expires: string
	user: {
		email: string
	}
}

export interface Credential {
	login: boolean
}
