// Информация о сообщении
export interface MessagesUpdate{
    chatId: string,
    id: string,
    sender: string,
    senderRole: string,
    senderPicture: string,
    files: {
        name: string,
        type: string,
        id: string
    }[]
    text: string,
    time: string,
    date: string,
    mine: boolean,
    edited: boolean,
    sent: boolean,
    read: boolean
}