import React, {useState} from 'react'
import {observer} from 'mobx-react-lite'
import Requests from '../Requests'
import Profile from './Profile'
import AddMemberToChat from './AddMemberToChat'
import ChangeChatInfo from './ChangeChatInfo'
import UserAvatar from './UserAvatar'
import OnlineStatusStore from '../stores/OnlineStatusStore'
import GroupUsersStore from '../stores/GroupUsersStore'
import ProfileStore from '../stores/ProfileStore'
import { ChatsUpdate } from "../interfaces/ChatsUpdate"
import { ChatUser } from '../interfaces/ChatUser'
import { UserInfo } from '../interfaces/UserInfo'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'
import { AppBar, Avatar, Button, Checkbox, Container, CssBaseline, Grid, IconButton, List, ListItem, ListItemAvatar, ListItemSecondaryAction, ListItemText, Toolbar, Typography } from '@material-ui/core'
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos'
import DeleteIcon from '@material-ui/icons/Delete'

var profile: string = ''

// информация о чате
const Chat = observer(({chatInfo, groupUsersStore, profileStore, onlineStatusStore, Done}:{chatInfo: ChatsUpdate, groupUsersStore: GroupUsersStore, profileStore: ProfileStore, onlineStatusStore: OnlineStatusStore, Done: ()=> void}) => {
    
    const [item, setItem] = useState<string>('Information') // отображаемый элемент
    const [lastItem, setLastItem] = useState<string>('') // предыдущий отображаемый элемент
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
            addMember: {
                width: '100%',
                position: 'relative',
                overflow: 'scroll',
                height: '90%'
            },
            root: {
                flexGrow: 1
            },
            root1: {
                width: '100%',
                backgroundColor: theme.palette.background.paper,
                position: 'relative',
                overflow: 'auto'
            },
            paper: {
                marginTop: theme.spacing(8),
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
            },
            title: {
                flexGrow: 1
            },
            userNameLabel: {

            },
            backButton: {
                marginRight: theme.spacing(2),
                color: 'white',
                background: '#3d50b6'
            },
            editButton: {
                marginRight: theme.spacing(2),
                color: 'white',
                background: '#3d50b6'
            },
            cancelButton: {
                marginRight: theme.spacing(2),
                color: 'white',
                background: '#3d50b6'
            },
            addMemberButton: {
                variant: "contained",
                color: "primary"
            },
            smallAvatar: {
                width: theme.spacing(5),
                height: theme.spacing(5)
            },
            largeAvatar: {
                width: theme.spacing(15),
                height: theme.spacing(15)
            },
            groupNameInput: {

            },
            groupBioInput: {
      
            },
            nameInput: {

            },
            formControl: {
                margin: theme.spacing(3)
            },
            members: {
                overflow: 'auto',
                width: 100
            },
            demo: {
                backgroundColor: theme.palette.background.paper
            }
        })
    )
    const classes = useStyles() // классы стилей

    // удалить пользователя из чата
    function RemoveMember(user: ChatUser): void { 
        let data: {chatId: string, user: string} = { // формирование данных  для отправки на сервер
            chatId: chatInfo.id,
            user: user.name
        }
        var request: {responseText: string, status: number} | null = Requests.RemoveMemberFromChat(data) // отправка запроса об удалении пользователя из чата
        switch(request?.status){
            case 200:
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

    // открытие профиля 
    function OpenProfile(): void {
        profileStore.Clear() // удаление информации о предыдущем профил
        var request: {responseText: string, status: number} | null = Requests.OpenProfile(profile) // запрос на открытие профиля
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

    // Добавление администратора
    function AddAdmin(name: string) {
        let data: {chatId: string, user: string} = { // формирование данных  для отправки на сервер
            chatId: chatInfo.id,
            user: name
        }
        var request: {responseText: string, status: number} | null = Requests.AddChatAdministrator(data) // отправка запроса на добавление администратора
        switch(request?.status){
            case 200:
                groupUsersStore.usersData.map((user: ChatUser, index: number)=>{
                    if(user.name === name){
                        groupUsersStore.usersData[index].role = 'admin'
                    }
                })
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

    //Удаление администратора
    function DeleteAdmin(name: string) {
        let data: {chatId: string, user: string} = { // формирование данных  для отправки на сервер
            chatId: chatInfo.id,
            user: name
        }
        var request: {responseText: string, status: number} | null = Requests.RemoveChatAdministrator(data) // запрос на удаление администратора 
        switch(request?.status){
            case 200:
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

    // Пользователей которых нет в чате
    function UsersToAddToChat(): UserInfo[] | null {
        var request: {responseText: string, status: number} | null = Requests.UsersToAddToChat(chatInfo.id) // отправка запроса о пользователях, которых нет в чате
        switch(request?.status){
            case 200:
                return JSON.parse(request.responseText) as UserInfo[]
            case 401:
                alert("User is not logged in.")
                return null
            default:
                alert("Error.")
                return null
        }
    }
    
    function SetItem(): JSX.Element {
        switch(item){
            case 'Information':
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
                                <Typography 
                                    className={classes.headerTitle} 
                                    variant="h6" 
                                    noWrap
                                >
                                    Information
                                </Typography>
                                {chatInfo.type === '3' || chatInfo.type === '2' && (chatInfo.role === 'admin' || chatInfo.role === 'owner') ?
                                    <Button
                                        onClick={()=>setItem('ChangeChatInfo')}
                                        className={classes.headerButton}
                                        variant="outlined"
                                    >
                                        Edit
                                    </Button>
                                : null
                                }
                            </Toolbar>
                        </AppBar>
                        <Container>
                            <CssBaseline />
                            <div
                                className={classes.paper}
                            >
                                <Grid
                                    container
                                >
                                    <Grid
                                        item
                                        xs={5}
                                        className={classes.paper}
                                    >
                                        <Avatar 
                                            src={chatInfo.picture} 
                                            className={classes.largeAvatar}
                                        />
                                        <Typography
                                            className={classes.groupNameInput}
                                        >
                                            {chatInfo.title}
                                        </Typography>
                                        <Typography
                                            className={classes.groupBioInput}
                                        >
                                            {chatInfo.bio}
                                        </Typography>
                                    </Grid>
                                    <Grid
                                        item
                                        xs={5}
                                        className={classes.paper}
                                    >
                                        <Typography
                                            variant="h6" 
                                            className={classes.title}
                                        >
                                            Members
                                        </Typography>
                                        <div 
                                            className={classes.demo}
                                        >
                                            <List 
                                                dense={true}
                                                className={classes.root1}
                                            >
                                                {chatInfo.role !== 'none' ?
                                                    <ListItem>
                                                        <Button 
                                                            onClick={()=>setItem('AddMember')}
                                                            className={classes.addMemberButton}
                                                            fullWidth
                                                        >
                                                            Add Member
                                                        </Button>
                                                    </ListItem>
                                                : null
                                                }
                                                {groupUsersStore.usersData.map((user: ChatUser, index: number) => {
                                                    if (chatInfo.id === user.id){
                                                        return(
                                                            <ListItem 
                                                                key={index}
                                                            >
                                                                <ListItemAvatar>
                                                                    <UserAvatar 
                                                                        user={{name: user.name, picture: user.picture}} 
                                                                        onlineStatusStore={onlineStatusStore}
                                                                        size={5}
                                                                    />
                                                                </ListItemAvatar>
                                                                <ListItemText
                                                                    primary={user.name}
                                                                    secondary={chatInfo.role !== 'owner' && user.role!== 'none' ? user.role : null}
                                                                    onClick={()=>{profile = user.name; setLastItem('Information'); setItem('Profile');}}
                                                                />
                                                                {chatInfo.type === '3' ||  (chatInfo.type === '2' && (chatInfo.role === 'owner' || (chatInfo.role === 'admin' && user.role === 'none'))) ?
                                                                    <ListItemSecondaryAction>
                                                                        <IconButton 
                                                                            edge="end" 
                                                                            aria-label="delete"
                                                                            onClick={()=>RemoveMember(user)}
                                                                        >
                                                                            <DeleteIcon />
                                                                        </IconButton>
                                                                    </ListItemSecondaryAction>
                                                                : null
                                                                }
                                                            </ListItem>
                                                        )
                                                    }
                                                })}
                                            </List>
                                        </div>
                                    </Grid>
                                    {chatInfo.type === '2' && chatInfo.role === 'owner' ?
                                        <Grid
                                            item
                                            xs={2}
                                            className={classes.paper}
                                        >
                                            <Typography
                                                variant="h6" 
                                                className={classes.title}
                                            >
                                                Admins
                                            </Typography>
                                            <div 
                                                className={classes.demo}
                                            >
                                                <List 
                                                    dense={true}
                                                >
                                                    {groupUsersStore.usersData.map((user: ChatUser, index: number) => {
                                                        return(
                                                            <ListItem 
                                                                key={index}
                                                            >
                                                                {chatInfo.type === '2' && chatInfo.role === 'owner' ?
                                                                    user.role !== 'owner' ?
                                                                        <Checkbox
                                                                            color="primary"
                                                                            checked={user.role==='admin'} 
                                                                            onChange={()=>{user.role !== 'admin' ? AddAdmin(user.name) : DeleteAdmin(user.name)}}
                                                                        />
                                                                    :
                                                                        <Checkbox
                                                                            checked
                                                                            disabled
                                                                        />
                                                                : null
                                                                }
                                                            </ListItem>
                                                        )
                                                    })}
                                                </List>
                                            </div>
                                        </Grid>
                                    : null
                                    }
                                </Grid>
                            </div>
                        </Container>
                    </div>
                )
            case 'ChangeChatInfo':
                return(
                    <ChangeChatInfo 
                        chatInfo={chatInfo} 
                        Done={()=>setItem('Information')}
                    />
                )
            case 'AddMember':
                var users: UserInfo[] | null = UsersToAddToChat()
                if(!users){
                    users = []
                }
                return(
                    <AddMemberToChat
                        chatInfo={chatInfo} 
                        users={users}
                        profileStore={profileStore}
                        onlineStatusStore={onlineStatusStore}
                        Done={()=>setItem('Information')}
                    />
                )
            case 'Profile':
                OpenProfile()
                return(
                    <Profile 
                        profileStore={profileStore} 
                        onlineStatusStore={onlineStatusStore} 
                        Change={false} 
                        Done={()=>{lastItem === 'Information' ? setItem('Information') : setItem('AddMember')}}
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
