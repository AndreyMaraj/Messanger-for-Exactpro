import {action, makeObservable, observable} from 'mobx';

// хранилище об информации о стаутсах пользователей
export default class OnlineStatusStore{
    
    userTimes: Map<string, Date> = new Map<string, Date>();
    addEntry = (userName: string, lastTime: Date) => {
        this.userTimes.set(userName, lastTime)
    }

    constructor(){
        makeObservable(this, {
            userTimes: observable,
            addEntry: action
        })
    }
}