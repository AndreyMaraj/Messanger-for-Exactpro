import {action, makeObservable, observable} from 'mobx';
import { ChatUser } from "../interfaces/ChatUser";

// хранилище о пользователях в чате
export default class GroupUsersStore{
    
    usersData: ChatUser[] = [];
    chatId: string = ''; 
    addEntry = (data: ChatUser) => {
        this.usersData.push(data)
    }

    constructor(){
        makeObservable(this, {
            usersData: observable,
            chatId: observable,
            addEntry: action
        })
    }
}