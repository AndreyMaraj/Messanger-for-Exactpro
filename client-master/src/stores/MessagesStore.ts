import {action, makeObservable, observable} from 'mobx';
import {MessagesUpdate} from '../interfaces/MessagesUpdate'

// хранилище информации о сообщения
export default class MessagesStore{
    
    messagesData: MessagesUpdate[] = [];
    byId: Map<string, string> = new Map<string, string>();
    addEntry = (data: MessagesUpdate) => {
        this.messagesData.push(data)
        this.byId.set(data.chatId, data.sender)
    }

    constructor(){
        makeObservable(this, {
            messagesData: observable,
            byId: observable,
            addEntry: action
        })
    }
}