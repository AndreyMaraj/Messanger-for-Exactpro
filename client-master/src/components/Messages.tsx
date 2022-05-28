import {observer} from 'mobx-react-lite'
import Cookie from '../Cookie'
import Requests from '../Requests'
import MessagesStore from '../stores/MessagesStore'
import {MessagesUpdate} from "../interfaces/MessagesUpdate"
import { Avatar, Button, createStyles, IconButton, List, ListItem, ListItemAvatar, ListItemSecondaryAction, ListItemText, makeStyles, Theme } from '@material-ui/core'
import { ChatsUpdate } from '../interfaces/ChatsUpdate'
import DoneAllIcon from '@material-ui/icons/DoneAll';
import EditIcon from '@material-ui/icons/Edit';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import GetAppIcon from '@material-ui/icons/GetApp';

// сообщения чата
const Messages = observer(({messagesStore, chatInfo, EditMessage}:{messagesStore: MessagesStore, chatInfo: ChatsUpdate, EditMessage: (message: MessagesUpdate)=> void})=>{

    const useStyles = makeStyles((theme: Theme) => // стили
        createStyles({
            messages: {
                overflow: 'auto',
                width: '100%',
                height: 500
            },
            myMessage: {
                backgroundColor: '#00cfff'
            },
            anyMessage: {

            },
            smallAvatar: {
                width: theme.spacing(5),
                height: theme.spacing(5)
            },
            root: {
                width: '100%',
                backgroundColor: theme.palette.background.paper,
            },
            img: {
                width: 300,
                height: 300,
                objectFit: 'cover'
            }
        })
    )
    const classes = useStyles() // классы стилей

    // прочтение сообщения
    function ReadMessage(message: MessagesUpdate): void{
        let data: {chatId: string, id: string} = { // подготовка данных для отправки на сервер 
            chatId: chatInfo.id, 
            id: message.id
        }
        var request: {responseText: string, status: number} | null = Requests.ReadMessage(data) // отправка запроса на сервер о прочтении сообщения
        switch(request?.status){
            case 200:
                break
            case 400:
                alert("")
                break
            default:
                break
        }
    }

    // Удаление сообщения
    function DeleteMessage(messageId: string): void{
        let data: {chatId: string, id: string} = { // подготовка данных  для отправки на сервер
            chatId: chatInfo.id, 
            id: messageId
        }
        var request: {responseText: string, status: number} | null = Requests.DeleteMessage(data) // отправка запроса на сервер об удалении сообщения
        switch(request?.status){
            case 200:
                break
            case 400:
                alert("")
                break
            default:
                break
        }
    }

    // проверка строки на URL
    function isURL(str: string): boolean{
        try {
            var url = new URL(str)
            return url.toString().indexOf('.') !== -1
        } 
        catch {
            return false
        }
    }

    // запрос на файл
    function FileRequest(src: string): string{
        var request: XMLHttpRequest = new XMLHttpRequest()
        request.open("GET", src, false)
        request.send()
        switch(request.status){
            case 200:
                break
            case 400:
                alert("Данные некорректны!")
                break
            default:
                break
        }
        return request.responseText
    }

    return (
        <div className={classes.messages}>
            <List className={classes.root}>
            {messagesStore.messagesData.map((message: MessagesUpdate, index: number) => {
                if (chatInfo.id === message.chatId){ // если сообщение из этого чата
                    var messageWithSources: any[] = []
                    var sources: string[] = []
                    var sourcesAttachments: string[] = []
                    var messageTextCopy = message.text
                    // обрезаем строку на составляющие (строка, ссылка)
                    messageTextCopy.replace(/(https?:\/\/[^\s]+)/g, (url) => {
                        sources[sources.length] = url
                        messageWithSources[messageWithSources.length] = messageTextCopy.substring(0, messageTextCopy.indexOf(url))
                        messageWithSources[messageWithSources.length] = <a href={url} target="_blank">{url}</a>
                        if (isURL(url)){
                            sourcesAttachments[sourcesAttachments.length] = url
                        }
                        messageTextCopy = messageTextCopy.substring(messageTextCopy.indexOf(url) + url.length)
                        return ''
                    })
                    messageWithSources[messageWithSources.length] = messageTextCopy
                    if(!message.read && !message.mine){
                        ReadMessage(message) // прочтение сообщения
                    }
                    return(
                        <ListItem key={index} className={message.mine ? classes.myMessage : classes.anyMessage}>
                            <ListItemAvatar>
                                <Avatar 
                                    src={message.senderPicture} 
                                    className={classes.smallAvatar} />
                            </ListItemAvatar>
                            <ListItemText primary={<div>
                                {messageWithSources}
                                {sourcesAttachments.map((source: string, i: number)=>{
                                    if(source.substring(source.lastIndexOf('.')) === '.png' || source.substring(source.lastIndexOf('.')) === '.jpg' || source.substring(source.lastIndexOf('.')) === '.jpeg' || source.substring(source.lastIndexOf('.')) === '.svg'){
                                        return <img key={i} src={source}/>
                                    }
                                    if(source.substring(source.lastIndexOf('.')) === '.mp3'){
                                        return <audio key={i} controls src={source}/>
                                    }
                                    if(source.substring(source.lastIndexOf('.')) === '.mp4'){
                                        return <video key={i} autoPlay loop muted controls src={source}/>
                                    }
                                })}
                                {message.files?.map((file: {name: string, type: string, id: string}, i: number)=>{
                                    var cookieKeySession: string | null = Cookie.Get('key') // Достаем из куки данные
                                    if(cookieKeySession){
                                        return(
                                            file.type?.slice(0, file.type?.indexOf('/')) === 'image' ?
                                                <img key={i} src={FileRequest("http://127.0.0.1:8081/get-file?key=" + cookieKeySession + "&chatId=" + message.chatId + "&id=" + file.id)} className={classes.img}/>
                                            : file.type?.slice(0, file.type?.indexOf('/')) === 'video' ?
                                                <div>
                                                    <video key={i} autoPlay loop muted controls src={FileRequest("http://127.0.0.1:8081/get-file?key=" + cookieKeySession + "&chatId=" + message.chatId + "&id=" + file.id)} className={classes.img}></video>
                                                    <a href={FileRequest("http://127.0.0.1:8081/get-file?key=" + cookieKeySession + "&chatId=" + message.chatId + "&id=" + file.id)} download={file.name}><GetAppIcon/></a>
                                                </div>
                                            : file.type?.slice(0, file.type?.indexOf('/')) === 'audio' ?
                                                <div>
                                                    <audio key={i} controls src={FileRequest("http://127.0.0.1:8081/get-file?key=" + cookieKeySession + "&chatId=" + message.chatId + "&id=" + file.id)} />
                                                    <a href={FileRequest("http://127.0.0.1:8081/get-file?key=" + cookieKeySession + "&chatId=" + message.chatId + "&id=" + file.id)} download={file.name}><GetAppIcon/></a>
                                                </div>
                                            :
                                                <a key={i} href={FileRequest("http://127.0.0.1:8081/get-file?key=" + cookieKeySession + "&chatId=" + message.chatId + "&id=" + file.id)} download={file.name}><button>{file.name}</button></a>
                                        )
                                    }
                                })} </div>} secondary={
                                    <div>
                                        {message.time}
                                        {message.edited ?
                                            <EditIcon />
                                        : null
                                        }
                                        {message.mine && message.read ?
                                            <DoneAllIcon />
                                        : null
                                        }
                                    </div>
                            } />
                            {message.mine ? 
                                <ListItemSecondaryAction>
                                    <IconButton edge="end" onClick={()=>EditMessage(message)}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton edge="end" onClick={()=>DeleteMessage(message.id)}>
                                        <DeleteForeverIcon />
                                    </IconButton>
                                </ListItemSecondaryAction>
                            : null}
                        </ListItem>
                    )
                }
            })}
            </List>
        </div>
    )
})

export default Messages