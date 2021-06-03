import {action, makeObservable, observable} from 'mobx';
import {ChatsUpdate} from "../interfaces/ChatsUpdate";

//хранилище чатов
export default class ChatsStore{
    
    chatsData: ChatsUpdate[] = [];
    byId: Map<string, string> = new Map<string, string>();
    addEntry = (data: ChatsUpdate) => {
        this.chatsData.push(data)
        this.byId.set(data.id, data.title)
    }

    constructor(){
        makeObservable(this, {
            chatsData: observable,
            byId: observable,
            addEntry: action
        })
    }
}