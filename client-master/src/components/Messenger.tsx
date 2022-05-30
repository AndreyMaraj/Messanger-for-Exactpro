import React, {useState} from 'react'
import Requests from '../Requests'
import Chats from './Chats'
import Profile from './Profile'
import ChatsStore from '../stores/ChatsStore'
import GroupUsersStore from '../stores/GroupUsersStore'
import MessagesStore from '../stores/MessagesStore'
import ProfileStore from '../stores/ProfileStore'
import OnlineStatusStore from '../stores/OnlineStatusStore'
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'
import { BottomNavigation, BottomNavigationAction, Container, IconButton, Snackbar } from '@material-ui/core'
import AccountCircleIcon from '@material-ui/icons/AccountCircle'
import ChatBubbleOutlineIcon from '@material-ui/icons/ChatBubbleOutline'
import { Close } from '@material-ui/icons'

const Messenger = (props: {chatsStore: ChatsStore, messagesStore: MessagesStore, groupUsersStore: GroupUsersStore, profileStore: ProfileStore, onlineStatusStore: OnlineStatusStore, Disconnect: ()=> void}) => {

    const [item, setItem] = useState<string>('Chats') // Отображаемый элемент
    const [open, setOpen] = React.useState(false);
    const [message, setMessage] = React.useState('');

    function handleClose() {
        setOpen(false);
    }; 

    // Стили 
    const useStyles: any = makeStyles((theme: Theme) =>
        createStyles({
            main: {
                display: 'flex',
                flexDirection: 'column',
                height: '100%'
            },
            footer: {
                marginTop: 'auto',
                height: '10%'
            }
        })
    )
    const classes: any = useStyles() // Классы стилей 

    // Открытие профиля
    function OpenProfile(): void {
        // Очистка данных о профиле
        props.profileStore.Clear()
        var request: {responseText: string, status: number} | null = Requests.OpenProfile('') // запорс на открытие порфиля
        switch(request?.status){
            case 200:
                break
            case 401:
                setMessage("User is not logged in.");
                setOpen(true);
                break
            default:
                setMessage("Error.");
                setOpen(true);
                break
        }
    }

    // Отображение элемента
    function SetItem(): JSX.Element {
        switch(item){
            case 'Profile':
                OpenProfile()
                return(
                    <Profile 
                        profileStore={props.profileStore} 
                        onlineStatusStore={props.onlineStatusStore} 
                        Change={true} 
                        Done={()=>props.Disconnect()}
                    />
                )
            case 'Chats':
                return(
                    <Chats 
                        chatsStore={props.chatsStore} 
                        groupUsersStore={props.groupUsersStore} 
                        messagesStore={props.messagesStore} 
                        profileStore={props.profileStore} 
                        onlineStatusStore={props.onlineStatusStore}
                    />
                )
            default:
                return(
                    <React.Fragment/>
                )
        }
    }

    return (
            <Container
                className={classes.main}
            >
                {SetItem()}
                <BottomNavigation
                    value={item === 'Profile' ? 0 : 1}
                    onChange={(event, newValue) => {
                        setItem(newValue === 0 ? 'Profile' : 'Chats');
                    }}
                    showLabels
                    className={classes.footer}
                >
                    <BottomNavigationAction 
                        label="Profile" 
                        icon={<AccountCircleIcon />} 
                    />
                    <BottomNavigationAction 
                        label="Chats" 
                        icon={<ChatBubbleOutlineIcon />} 
                    />
                </BottomNavigation>
                <div>
                    <Snackbar
                        anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'right'
                        }}
                        
                        open={open}
                        autoHideDuration={6000}
                        onClose={()=>handleClose()}
                        message={message}
                        action={
                        <React.Fragment>
                            <IconButton size="small" aria-label="close" color="inherit" onClick={()=>handleClose()}>
                                <Close fontSize="small" />
                            </IconButton>
                        </React.Fragment>
                        }
                    />
                </div>
            </Container>
    )
}

export default Messenger