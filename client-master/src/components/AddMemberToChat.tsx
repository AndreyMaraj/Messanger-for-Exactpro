import React, {useState} from 'react'
import Requests from '../Requests'
import UserAvatar from './UserAvatar'
import Profile from './Profile'
import OnlineStatusStore from '../stores/OnlineStatusStore'
import ProfileStore from '../stores/ProfileStore'
import { ChatsUpdate } from "../interfaces/ChatsUpdate"
import { UserInfo } from '../interfaces/UserInfo'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'
import { AppBar, Button, IconButton, List, ListItem, ListItemAvatar, ListItemSecondaryAction, ListItemText, Toolbar } from '@material-ui/core'
import AddIcon  from '@material-ui/icons/Add'

var profile: string = ''

// Добавить пользователя в чат
const AddMemberToChat = (props: {chatInfo: ChatsUpdate, users: UserInfo[], profileStore: ProfileStore, onlineStatusStore: OnlineStatusStore, Done: ()=> void}) => {
    
    const [item, setItem] = useState<string>('AddMember') // отображаемый элемент
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

    // Добавление пользователя в чат
    function AddMember(user: UserInfo): void {
        let data: {chatId: string, user: string} = { // создание данных для отправки на сервер
            chatId: props.chatInfo.id,
            user: user.name
        }
        var request: {responseText: string, status: number} | null = Requests.AddMemberToChat(data) // отправка запроса на добавление пользователя в чат
        switch(request?.status){
            case 200:
                props.Done()
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

    // открытие порфиля пользователя
    function OpenProfile(): void {
        props.profileStore.Clear() // очитска данных о предыдущем профиле
        var request: {responseText: string, status: number} | null = Requests.OpenProfile(profile) // отправка запроса об открытии профиля
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
    
    function SetItem(): JSX.Element {
        switch(item){
            case 'AddMember':
                return(
                    <div
                        className={classes.content}
                    >
                        <AppBar 
                            className={classes.header}
                        >
                            <Toolbar>
                                <Button
                                    onClick={()=>props.Done()}
                                    className={classes.headerButton}
                                    variant="outlined"
                                >
                                    Cancel
                                </Button>
                            </Toolbar>
                        </AppBar>
                        <List 
                            dense={true}
                            className={classes.addMember}
                        >
                            {props.users.map((user: UserInfo, index: number) =>
                                <ListItem 
                                    key={index}
                                >
                                    <ListItemAvatar>
                                        <UserAvatar 
                                            user={{name: user.name, picture: user.picture}} 
                                            onlineStatusStore={props.onlineStatusStore}
                                            size={5}
                                        />
                                    </ListItemAvatar>
                                        <ListItemText
                                            primary={user.name}
                                            onClick={()=>{profile = user.name; setItem('Profile')}}
                                        />
                                    <ListItemSecondaryAction>
                                        <IconButton 
                                            edge="end" 
                                            aria-label="add"
                                            onClick={()=>AddMember(user)}
                                        >
                                            <AddIcon/>
                                        </IconButton>
                                    </ListItemSecondaryAction>
                                </ListItem>
                            )}
                        </List>
                    </div>
                )
            case 'Profile':
                OpenProfile()
                return(
                    <Profile 
                        profileStore={props.profileStore} 
                        onlineStatusStore={props.onlineStatusStore} 
                        Change={false} 
                        Done={()=>setItem('AddMember')}
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
}

export default AddMemberToChat