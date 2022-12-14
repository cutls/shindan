export interface CredentialNew {
    mail?: string
    token: string
    validUntilUnix: number
}
export interface IUserDB {
    name: string
    email: string
}
export interface IShindanList {
    id: string
    userMail: string
    shindanId: string
}
export interface IShindan {
    id: string
    listId: string
    status: 'draft' | 'public' | 'private'
    name: string
    resultText: string
    results: IResult[]
    questions: IQuestion[]
}
export interface IResult {
    id: string
    image: string
    title: string
    description: string
}
export interface IQuestion {
    id: string
    text: string
    selections: ISelection[]
}
export interface ISelection {
    id: string
    name: string
    image: string
    weight: IWeight[]
}
interface IWeight {
    for: string //result id
    weight: number
}
export interface ILogs {
    [id: string]: ILog
}
interface ILog {
    createdAt: number
    selection: {
        questionIndex: number
        selectIndex: number
    }[]
}