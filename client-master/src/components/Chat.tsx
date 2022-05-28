import React, {ChangeEvent, useState} from 'react'
import {observer} from 'mobx-react-lite'
import Cookie from '../Cookie'
import Requests from '../Requests'
import Profile from './Profile'
import UserAvatar from './UserAvatar'
import Messages from './Messages'
import ChatInformation from './ChatInformation'
import MessagesStore from '../stores/MessagesStore'
import ProfileStore from '../stores/ProfileStore'
import OnlineStatusStore from '../stores/OnlineStatusStore'
import GroupUsersStore from '../stores/GroupUsersStore'
import { ChatsUpdate } from "../interfaces/ChatsUpdate"
import { MessagesUpdate } from '../interfaces/MessagesUpdate'
import { AppBar, Avatar, Button, TextField, Toolbar, Typography, createStyles, makeStyles, Theme, Container, Icon, IconButton } from '@material-ui/core'
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos'
import AttachFileIcon from '@material-ui/icons/AttachFile'
import SendIcon from '@material-ui/icons/Send';
import DeleteIcon from '@material-ui/icons/Delete';

var profile: string = ''

// Чат 
const Chat = observer(({messagesStore, chatInfo, groupUsersStore, profileStore, onlineStatusStore, Done}:{messagesStore: MessagesStore, chatInfo: ChatsUpdate, groupUsersStore: GroupUsersStore, profileStore: ProfileStore, onlineStatusStore: OnlineStatusStore, Done: ()=> void}) => {
    
    const [message, setMessage] = useState<string>('') // сообщение
    const [files, setFiles] = useState<{name: string, bytes: string}[]>([]) // файлы
    const [editMessage, setEditMessage] = useState<MessagesUpdate | null>(null) // измененное сообщение 
    const [item, setItem] = useState<string>('Chat') // отображаемый элемент 
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
                marginRight: theme.spacing(2),
                color: 'white',
                background: '#3d50b6'
            },
            chat: {
                marginTop: theme.spacing(8),
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                alignItems: 'center'
            },
            paper: {
                marginTop: theme.spacing(4),
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                height: 500
            },
            smallAvatar: {
                width: theme.spacing(5),
                height: theme.spacing(5)
            },
            addAttachButton: {
                variant: "contained",
                color: "primary"
            },
            sendMessageButton: {
                variant: "contained",
                color: "primary",
                margin: theme.spacing(1)
            },
            messageInput: {

            },
            files: {
                height: 100,
                width: 300,
                overflow: 'auto'
            }
        })
    )
    const classes = useStyles() // классы стилей

    // Открытие профиля
    function OpenProfile(): void {
        profileStore.Clear() // очистка данных о старом профиле 
        var request: {responseText: string, status: number} | null = Requests.OpenProfile(profile) // отправка запроса на сервер об открытии профиля
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

    // Добавление файлов 
    function AddAttachment(event: any): void {
        let reader: FileReader = new FileReader()
        reader.onload = () => {
            setFiles(()=>{
                var array: {name: string, bytes: string}[] = []
                for(var index: number = 0; index < files.length; index++){
                    array[array.length] = files[index]
                }
                array[array.length] = {
                    name: event.target.files[0].name,
                    bytes: reader.result as string
                }
                console.log(array)
                return array
            })
        }
        reader.onerror = (error) => {
            alert('Error: ' + error)
        }
        reader.readAsDataURL(event.target.files[0])
    }

    // Удаление файла
    function DeleteAttachment(file: {name: string, bytes: string}): void{
        setFiles(()=>{
            var array: {name: string, bytes: string}[] = []
            for(var index: number = 0; index < files.length; index++){
                if (file !== files[index]){
                    array[array.length] = files[index]
                }
            }
            return array
        })
    }

    // Изменение файла
    function EditMessage(): void{
        if (editMessage) {
            let data: {chatId: string, id: string, text: string, files: {name: string, bytes: string}[]} = { // подготовак данных для отправки на сервер 
                chatId: chatInfo.id,
                id: editMessage.id,
                text: message,
                files: files
            }
            var request: {responseText: string, status: number} | null = Requests.EditMesssage(data) // отправка запроса на сервер о редактировании сообщения
            switch(request?.status){
                case 200:
                    // очискта данных о сообщении 
                    setFiles([]) 
                    setMessage("")
                    setEditMessage(null)
                    break
                case 401:
                    alert("User is not logged in.")
                    break
                case 403:
                    alert("User has insufficient rights.")
                    break
                default:
                    alert("Error.")
                    break
            }
        }
    }

    // Отправка сообщений
    function SendMessage(): void{
        if (message === "" && files === []) {}
        else{
            var date: Date = new Date()
            let data: {chatId: string, text: string, time: string, date: string, files: {name: string, bytes: string}[]} = { // подготовка данных джля отправки на сервер 
                chatId: chatInfo.id,
                text: message,
                time: date.getHours().toString() + ":" + date.getMinutes().toString(),
                date: date.getDate().toString() + "/" + date.getMonth().toString() + "/" + date.getFullYear().toString(),
                files: files
            }
            var request: {responseText: string, status: number} | null = Requests.SendMessage(data) // отправка запроса на отправку сообщения
            switch(request?.status){
                case 200:
                    // очистка сообщения
                    setFiles([])
                    setMessage("")
                    break
                case 401:
                    alert("User is not logged in.")
                    break
                case 403:
                    alert("User has insufficient rights.")
                    break
                default:
                    alert("Error.")
                    break
            }
        }
    }

    // Запрос на файл
    function FileRequest(src: string): string{
        var request: XMLHttpRequest = new XMLHttpRequest()
        request.open("GET", src, false)
        request.send()
        switch(request.status){
            case 200:
                break
            case 401:
                alert("User is not logged in.")
                break
            default:
                alert("Error.")
                break
        }
        return request.responseText
    }

    // Изменение режима на "редактирование сообщения"
    function SetEditMessage(message: MessagesUpdate): void{
        var cookieKeySession: string | null = Cookie.Get('key') // Достаем из куки данные
        if(cookieKeySession){
            setEditMessage(message)
            setMessage(message.text)
            if(message.files){
                setFiles(message.files.map((file: {name: string, type: string, id: string})=>{
                    return {name: file.name, bytes: FileRequest("http://127.0.0.1:8081/get-file?key=" + cookieKeySession + "&chatId=" + message.chatId + "&id=" + file.id)}
                }))
            }
            else{
                setFiles([])
            }
        }
    }

    function SetItem(): JSX.Element {
        switch(item){
            case 'Chat':
                return(
                    <div
                    className={classes.content}
                    >
                        <AppBar 
                            className={classes.header}
                        >
                            <Toolbar>
                                <IconButton
                                    onClick={()=>Done()}
                                    edge="start"
                                    className={classes.headerButton}
                                >
                                    <ArrowBackIosIcon />
                                </IconButton>
                                {chatInfo.type === '1' ?
                                    <Typography 
                                        onClick={()=>{profile = chatInfo.title; setItem('Profile')}} 
                                        className={classes.headerTitle}
                                        variant="h6" 
                                        noWrap
                                    >
                                        {chatInfo.title}
                                    </Typography>
                                :
                                    <Typography 
                                        onClick={()=>setItem('Information')} 
                                        className={classes.headerTitle} 
                                        variant="h6" 
                                        noWrap
                                    >
                                        {chatInfo.title}
                                    </Typography>
                                }
                                {chatInfo.type === '1' ?
                                    <IconButton
                                        onClick={()=>{profile = chatInfo.title; setItem('Profile')}}
                                        edge="start"
                                        className={classes.headerButton}
                                    >
                                        <UserAvatar 
                                            user={{name: chatInfo.title, picture: chatInfo.picture}} 
                                            onlineStatusStore={onlineStatusStore}
                                            size={5}
                                        />
                                    </IconButton>
                                :
                                    <IconButton
                                        onClick={()=>setItem('Information')}
                                        edge="start"
                                        className={classes.headerButton}
                                    >
                                        <Avatar 
                                            src={chatInfo.picture}
                                            className={classes.smallAvatar}
                                        />
                                    </IconButton>
                                }
                            </Toolbar>
                        </AppBar>
                        <Container
                            className={classes.chat}
                        >
                            <Messages 
                                messagesStore={messagesStore} 
                                chatInfo={chatInfo}
                                EditMessage={(message: MessagesUpdate)=>SetEditMessage(message)}
                            />
                            <div>
                                <Button
                                    variant="contained"
                                    component="label"
                                    color="inherit"
                                    className={classes.addAttachButton}
                                    >
                                    <input
                                        type="file"
                                        onChange={(event: ChangeEvent<HTMLInputElement>)=>AddAttachment(event)}
                                        hidden
                                    />
                                    <AttachFileIcon />
                                </Button>
                                <TextField
                                    label="Message"
                                    multiline
                                    rowsMax={3}
                                    value={message}
                                    className={classes.messageInput}
                                    onChange={(event: ChangeEvent<HTMLInputElement>)=>setMessage(event.target.value)}
                                />
                                {editMessage ?
                                    <Button
                                        variant="contained"
                                        component="label"
                                        className={classes.sendMessageButton}
                                        onClick={()=>{setMessage(''); setFiles([]); setEditMessage(null)}}
                                    >
                                        Cancel Edit
                                    </Button>
                                : null
                                }
                                {editMessage ? 
                                    <Button
                                        variant="contained"
                                        component="label"
                                        className={classes.sendMessageButton}
                                        endIcon={<SendIcon/>}
                                        onClick={()=>EditMessage()}
                                    >
                                        Send
                                    </Button>
                                :
                                    <Button
                                        variant="contained"
                                        component="label"
                                        className={classes.sendMessageButton}
                                        endIcon={<SendIcon/>}
                                        onClick={()=>SendMessage()}
                                    >
                                        Send
                                    </Button>
                                }
                                
                            </div>
                            <div className={classes.files}>
                                {files.map((file, index: number)=>{
                                    return(
                                        <div key={index}>
                                            {file.bytes?.slice(file.bytes?.indexOf('data') + 5, file.bytes?.indexOf('/')) === 'image' ?
                                                <img height={50} width={50} src={file.bytes}/>
                                            : file.bytes?.slice(file.bytes?.indexOf('data') + 5, file.bytes?.indexOf('/')) === 'video' ?
                                                <video height={50} width={50} autoPlay loop muted controls src={file.bytes}></video>
                                            : file.bytes?.slice(file.bytes?.indexOf('data') + 5, file.bytes?.indexOf('/')) === 'audio' ?
                                                <audio controls src={file.bytes} />
                                            : file.bytes?.indexOf('data') !== -1 ?
                                                <a href={file.bytes} download={file.name}><button>{file.name}</button></a>
                                            : null}
                                            <IconButton onClick={()=>DeleteAttachment(file)}>
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </div>
                                    )
                                })}
                            </div>
                        </Container>
                    </div>
                )
            case 'Information':
                return(
                    <ChatInformation 
                        chatInfo={chatInfo} 
                        groupUsersStore={groupUsersStore} 
                        profileStore={profileStore} 
                        onlineStatusStore={onlineStatusStore} 
                        Done={()=>setItem('Chat')}
                    />
                )
            case 'Profile':
                OpenProfile();
                return(
                    <Profile 
                        profileStore={profileStore} 
                        onlineStatusStore={onlineStatusStore}
                        Change={false} 
                        Done={()=>setItem('Chat')}
                    />
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

export default Chat
