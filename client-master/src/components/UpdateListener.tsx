import React, {useEffect} from 'react'
import Requests from '../Requests'
import ChatsStore from '../stores/ChatsStore'
import MessagesStore from '../stores/MessagesStore'
import GroupUsersStore from '../stores/GroupUsersStore'
import ProfileStore from '../stores/ProfileStore'
import OnlineStatusStore from '../stores/OnlineStatusStore'
import {ChatsUpdate} from '../interfaces/ChatsUpdate'
import {MessagesUpdate} from '../interfaces/MessagesUpdate'
import { ChatUser } from "../interfaces/ChatUser"
import {ProfileInfo} from '../interfaces/ProfileInfo'

// Обработка подписок Sse
const UpdateListener = ({chatsStore, messagesStore, groupUsersStore, profileStore, onlineStatusStore}:{chatsStore: ChatsStore, messagesStore: MessagesStore, groupUsersStore: GroupUsersStore, profileStore: ProfileStore, onlineStatusStore: OnlineStatusStore}) =>{

    useEffect(()=>{
        
        // Оповещение сервера о том, что пользователь "онлайн"
        const online = setInterval(()=>{
            var request: {responseText: string, status: number} | null = Requests.Alive()
            switch(request?.status){
                case 0:
                    break
                case 200:
                    break
                case 401:
                    alert("User is not logged in.")
                    break
                default:
                    alert("Error.")
                    break
            }
        }, 15000)

        const sse: EventSource = Requests.SseSubscribe() // Подписка на ссе
        console.log("subscribe to sse channel")

        sse.addEventListener("update", upd =>{ // обработка новых и измененных чатов
            console.log(upd)
            if((typeof upd) != 'string'){
                const data: ChatsUpdate = JSON.parse((upd as MessageEvent).data) as ChatsUpdate
                console.log(data)
                var newChat: boolean = true
                for(var i = 0; i < chatsStore.chatsData.length; i++){
                    if (data.id === chatsStore.chatsData[i].id){ // если чат уже есть - изменяем его данные 
                        chatsStore.chatsData[i].title = data.title
                        chatsStore.chatsData[i].bio = data.bio
                        chatsStore.chatsData[i].type = data.type
                        chatsStore.chatsData[i].picture = data.picture
                        chatsStore.chatsData[i].role = data.role
                        newChat = false
                        break
                    }
                }
                if (newChat){ // если чата нет - добавляем
                    chatsStore.addEntry(data)
                }
            }
            })
            
           

        sse.addEventListener("chat-is-deleted", data =>{ // обработка удаленных чатов
            var chatId: string = JSON.parse((data as MessageEvent).data).id
            console.log(data)
            for(var i = 0; i < chatsStore.chatsData.length; i++){ 
                if (chatId === chatsStore.chatsData[i].id){ // если чат есть - удаляем
                    chatsStore.chatsData.splice(i, 1)
                    break
                }
            }
        })

        sse.addEventListener("message-is-deleted", data =>{ // обработка удаленных сообщений
            var messageId: string = JSON.parse((data as MessageEvent).data).id
            console.log(messageId)
            for(var i = 0; i < messagesStore.messagesData.length; i++){
                if (messageId === messagesStore.messagesData[i].id){ // если сообщение есть - удаляем
                    messagesStore.messagesData.splice(i, 1)
                    break
                }
            }
        })

        sse.addEventListener("user-is-deleted", data =>{ // обработка удаленного пользователя из чата
            var chatId: string = JSON.parse((data as MessageEvent).data).id
            var userName: string = JSON.parse((data as MessageEvent).data).name
            console.log(userName)
            console.log(groupUsersStore.usersData.length)
            if (chatId === groupUsersStore.chatId){ // если открыт данный чат
                for(var i = 0; i < groupUsersStore.usersData.length; i++){
                    console.log(groupUsersStore.usersData[i].name)
                    if (userName === groupUsersStore.usersData[i].name){ // если в нем был пользователь - удаляем его из чата
                        groupUsersStore.usersData.splice(i, 1)
                        break
                    }
                }
            }
        })

        sse.addEventListener("message", msg =>{ // обрботка сообщений чата
            const data: MessagesUpdate = JSON.parse((msg as MessageEvent).data) as MessagesUpdate
            console.log(data)
            var newMessage: boolean = true
            messagesStore.messagesData.map((message: MessagesUpdate, index: number)=>{
                if(message.id === data.id){ // если уже такое сообщение есть - обновить его
                    messagesStore.messagesData[index] = data
                    newMessage = false
                }
            })
            if (newMessage){ // если сообщение новое - добавить в хранилище
                messagesStore.addEntry(data)
            }
        })

        sse.addEventListener("user-in-chat", user =>{ // обработка добавления пользователей в чат
            const data: ChatUser = JSON.parse((user as MessageEvent).data) as ChatUser
            const oldName: string = JSON.parse((user as MessageEvent).data).oldName
            console.log(data)
            var newUser: boolean = true
            if (data.id === groupUsersStore.chatId){
                for(var i = 0; i < groupUsersStore.usersData.length; i++){
                    if (data.name === groupUsersStore.usersData[i].name){  // если данные о профиле пользователя были изменены (кроме имени), пока мы посещали чат - обновить информацию
                        groupUsersStore.usersData[i].picture = data.picture
                        groupUsersStore.usersData[i].time = data.time
                        groupUsersStore.usersData[i].role = data.role
                        newUser = false
                        break
                    }
                    else{
                        if (oldName === groupUsersStore.usersData[i].name){ // если было изменено имя пользователя, пока мы посещали чат - обновить информацию
                            groupUsersStore.usersData[i].name = data.name
                            groupUsersStore.usersData[i].picture = data.picture
                            groupUsersStore.usersData[i].time = data.time
                            groupUsersStore.usersData[i].role = data.role
                            newUser = false
                            break
                        }
                    }
                }
                if (newUser){ // если пользователь новый - добавить в чат
                    groupUsersStore.addEntry(data)
                }
            }
        })

        sse.addEventListener("user-info", user =>{ // обработка информации о данных профиля пользователя
            const data: ProfileInfo = JSON.parse((user as MessageEvent).data) as ProfileInfo
            const oldName: string = JSON.parse((user as MessageEvent).data).oldName
            console.log(data)
            if (profileStore.profileData.name === ''){ // если данные о профиле новые - добавляем информацию
                profileStore.profileData = data;
            }
            else{
                if (data.name === profileStore.profileData.name){ // если данные о профиле были изменены (кроме имени), пока мы посещали страницу - обновить информацию
                    profileStore.profileData.picture = data.picture
                    profileStore.profileData.bio = data.bio
                }
                else{
                    if (oldName === profileStore.profileData.name){ // если было изменено имя пользователя, пока мы посещали страницу - обновить информацию
                        profileStore.profileData.name = data.name
                        profileStore.profileData.picture = data.picture
                        profileStore.profileData.bio = data.bio
                    }
                }
            }
        })

        sse.addEventListener("user-status", user =>{ // обработка информации о последнем времени пребывания пользователя "онлайн"
            const name = JSON.parse((user as MessageEvent).data).name
            const time = new Date(JSON.parse((user as MessageEvent).data).time)
            onlineStatusStore.userTimes.set(name, time) // обновляем / добавлям информацию о последнем пребывании пользователяв "онлайн" 
        })

        sse.onerror = (e) => { // обработка ошибки отключения от ссе
            clearInterval(online) // прекращение отсылки на сервер сообщения о том, что польщователь "онлайн"
            console.error("closing sse chanel because ofan error", e)
            sse.close() 
        }

        return() => { // отключение от ссе
            clearInterval(online) // прекращение отсылки на сервер сообщения о том, что польщователь "онлайн"
            console.log("closing sse chanel")
            sse.close() 
        }
    }, []
    )

    return (
        <React.Fragment/>
    )
}

export default UpdateListener