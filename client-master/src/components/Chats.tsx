import React, {useState} from 'react'
import { observer } from 'mobx-react'
import Requests from '../Requests'
import Chat from './Chat'
import CreateChat from './CreateChat'
import UserAvatar from './UserAvatar'
import ChatsStore from '../stores/ChatsStore'
import MessagesStore from '../stores/MessagesStore'
import OnlineStatusStore from '../stores/OnlineStatusStore'
import ProfileStore from '../stores/ProfileStore'
import GroupUsersStore from '../stores/GroupUsersStore'
import {ChatsUpdate} from '../interfaces/ChatsUpdate'
import { UserInfo } from '../interfaces/UserInfo'
import { MessagesUpdate } from '../interfaces/MessagesUpdate'
import { AppBar, Avatar, IconButton, List, ListItem, ListItemAvatar, ListItemSecondaryAction, ListItemText, Toolbar, Typography } from '@material-ui/core'
import DeleteIcon from '@material-ui/icons/Delete'
import AddIcon  from '@material-ui/icons/Add'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'

var ChatId: string

// Чаты пользователя
const Chats = observer(({chatsStore, messagesStore, groupUsersStore,  profileStore, onlineStatusStore}:{chatsStore: ChatsStore, messagesStore: MessagesStore, groupUsersStore: GroupUsersStore,  profileStore: ProfileStore, onlineStatusStore: OnlineStatusStore}) => {

    const chats: string = 'Chats'
    const chat: string = 'Chat'
    const addChat: string = 'AddChat'
    const [item, setItem] = useState<string>(chats) // Отображаемый элемент
    const useStyles = makeStyles((theme: Theme) => // стили
        createStyles({
            content: {
                width: '100%',
                height: '100%',
                overflow: 'hidden'
            },
            header: {
                position: "static",
                flexGrow: 1,
                height: '10%'
            },
            headerTitle: {
                flexGrow: 1
            },
            headerButton: {
                marginLeft: theme.spacing(2),
                color: 'white',
                background: '#3d50b6'
            },
            chats: {
                width: '100%',
                position: 'relative',
                overflow: 'scroll',
                height: '90%'
            },
            smallAvatar: {
                width: theme.spacing(5),
                height: theme.spacing(5)
            }
        })
    )
    const classes = useStyles() // классы стилей

    // Открытие чата
    function OpenChat(): ChatsUpdate {
        groupUsersStore.usersData = [] // очитска информации о пользователях чата
        groupUsersStore.chatId = ChatId 
        var request: {responseText: string, status: number} | null = Requests.OpenChat(ChatId) // запрос на сервер об открытии чата
        var Chat: ChatsUpdate = { // создание информации о чате
            id: '',
            type: '',
            title: '',
            bio: '',
            picture: '',
            role: '',
            lastReadIdMessage: ''
        }
        switch(request?.status){
            case 200:
                chatsStore.chatsData.map((chat: ChatsUpdate)=>{ // заполнение информации о чате
                    if(chat.id === ChatId){
                        Chat = chat
                    }
                })
                return Chat
            case 401:
                alert("User is not logged in.")
                return Chat
            default:
                alert("Error.")
                return Chat
        }  
    }

    // Удаление чата
    function DeleteChat(dialog: ChatsUpdate): void {
        let data = { // подготовка данных для отправки на сервер
            chatId: dialog.id
        }
        var request: {responseText: string, status: number} | null = Requests.DeleteChat(data) // запрос на удаление чата
        switch(request?.status){
            case 200:
                break
            case 401:
                alert("User is not logged in.")
                break
            default:
                alert("Error.")
                break
        }
    }

    // Получение всех пользователей мессенджера 
    function GetUsers(): UserInfo[]{
        var request: {responseText: string, status: number} | null = Requests.GetAllUsers() // запрос на получение всех пользователей мессенджера 
        switch(request?.status){
          case 200:
            return JSON.parse(request.responseText) as UserInfo[]
          case 401:
            alert("User is not logged in.")
            return [];
          default:
            alert("Error.")
            return []
        }
    }

    // Отображение элмента
    function SetItem(): JSX.Element {
        switch(item){
            case addChat:
                return(
                    <CreateChat 
                        users={GetUsers()}
                        profileStore={profileStore}
                        onlineStatusStore={onlineStatusStore}
                        Done={(chatId: string | null) => {if(chatId === null) {setItem(chats)} else{ChatId = chatId; setItem(chat)}}}
                    />
                )
            case chat:
                return(
                    <Chat 
                        messagesStore={messagesStore} 
                        groupUsersStore={groupUsersStore} 
                        chatInfo={OpenChat()} 
                        profileStore={profileStore}
                        onlineStatusStore={onlineStatusStore} 
                        Done={()=>setItem(chats)}
                    />
                )
            case chats:
                return(
                    <div 
                        className={classes.content}
                    >
                        <AppBar
                            className={classes.header}
                        >
                            <Toolbar>
                                <Typography 
                                    className={classes.headerTitle} 
                                    variant="h6" 
                                    noWrap
                                >
                                    Chats
                                </Typography>
                                <IconButton
                                    onClick={()=>setItem(addChat)}
                                    edge="start"
                                    className={classes.headerButton}
                                >
                                    <AddIcon/>
                                </IconButton>
                            </Toolbar>
                        </AppBar>
                        <List 
                            dense={true}
                            className={classes.chats}
                        >
                            {chatsStore.chatsData.map((dialog: ChatsUpdate, index: number) =>{
                                var count: number = 0
                                var newMessage: boolean = false
                                messagesStore.messagesData.map((message: MessagesUpdate) =>{
                                    if(message.chatId === dialog.id){
                                        if(newMessage){
                                            count++
                                        }
                                        if(message.id === dialog.lastReadIdMessage){
                                            newMessage = true
                                        }
                                    }
                                })
                                return(
                                    <ListItem 
                                        key={index}
                                    >
                                        <ListItemAvatar>
                                            {dialog.type === '1' ?
                                                <UserAvatar 
                                                    user={{name: dialog.title, picture: dialog.picture}} 
                                                    onlineStatusStore={onlineStatusStore}
                                                    size={5}
                                                />
                                            :
                                                <Avatar
                                                    src={dialog.picture}
                                                    className={classes.smallAvatar}
                                                />
                                            }
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={dialog.title}
                                            secondary={count === 0 ? null : count + " Unread Message"}
                                            onClick={()=>{ChatId = dialog.id; setItem(chat)}}
                                        />
                                        <ListItemSecondaryAction>
                                            <IconButton 
                                                edge="end" 
                                                aria-label="delete"
                                                onClick={()=>DeleteChat(dialog)}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                )
                            })}
                        </List>
                    </div>
                )
            default:
                return(
                    <React.Fragment/>
                )
        }
    }

    return (
        SetItem()
    )
})

export default Chats