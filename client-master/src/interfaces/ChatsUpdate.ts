// Информация о чате
export interface ChatsUpdate{
    id: string,
    type: string,
    title: string,
    bio: string,
    picture: string,
    role: string,
    lastReadIdMessage: string
}