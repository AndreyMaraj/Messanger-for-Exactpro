import {action, makeObservable, observable} from 'mobx';
import {ProfileInfo} from '../interfaces/ProfileInfo'

// хранилище информации о профиле
export default class ProfileStore{
    
    profileData: ProfileInfo = {
        name: '',
        bio: '',
        picture: '',
    };
    addEntry = (data: ProfileInfo) => {
        this.profileData = data
    }

    constructor(){
        makeObservable(this, {
            profileData: observable,
            addEntry: action
        })
    }

    public Clear(){
        this.profileData = {
            name: '',
            bio: '',
            picture: '',
        }
    }
}