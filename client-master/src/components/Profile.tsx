import React, {useState} from 'react'
import {observer} from 'mobx-react-lite'
import Requests from '../Requests'
import ChangeProfileInfo from './ChangeProfileInfo'
import ProfileStore from '../stores/ProfileStore'
import OnlineStatusStore from '../stores/OnlineStatusStore'
import UserAvatar from './UserAvatar'
import { AppBar, Button, Container, createStyles, IconButton, makeStyles, Theme, Toolbar, Typography } from '@material-ui/core'
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos'

// Профиль пользователя
const Profile = observer(({profileStore, onlineStatusStore, Change, Done}: {profileStore: ProfileStore, onlineStatusStore: OnlineStatusStore, Change: boolean, Done: ()=> void}, ) => {

    const [item, setItem] = useState<string>('Profile') // Отображаемый элемент
    const profile = 'Profile' // элемент
    const changeProfileInfo = 'ChangeProfileInfo' // элемент
    
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
            profileInfo: {
                marginTop: theme.spacing(8),
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                alignItems: 'center'
            },
            largeAvatar: {
                width: theme.spacing(15),
                height: theme.spacing(15)
            },
            nameInput: {

            },
            bioInput: {

            },
            logoutButton: {
                background: 'red'
            }
        })
    )
    const classes = useStyles() // классы стилей
    
    // Выход из мессенджера
    function Disconnect(): void {
        var request: {responseText: string, status: number} | null = Requests.Disconnect() // отправка запроса на выход
        switch(request?.status){
            case 200:
                Done()
                break
            case 401:
                alert("User is not logged in.")
                break
            default:
                alert("Error.")
                break
        }
    }

    // отображение элемента
    function SetItem(): JSX.Element {
        switch(item){
            case profile:
                return(
                    <div
                        className={classes.content}
                    >
                        <AppBar 
                            className={classes.header}
                        >
                            <Toolbar>
                                {Change ?
                                    <Typography 
                                        className={classes.headerTitle}
                                        variant="h6" 
                                        noWrap
                                    />
                                : null
                                }
                                {Change ? 
                                    <Button
                                        onClick={()=>setItem(changeProfileInfo)}
                                        className={classes.headerButton}
                                        variant="outlined"
                                    >
                                        Edit
                                    </Button>
                                :
                                    <IconButton
                                        onClick={()=> Done()}
                                        edge="start"
                                        className={classes.headerButton}
                                    >
                                        <ArrowBackIosIcon />
                                    </IconButton>}
                            </Toolbar>
                        </AppBar>
                        <Container
                            className={classes.profileInfo}
                        >
                            <UserAvatar 
                                user={{name: profileStore.profileData.name, picture: profileStore.profileData.picture}} 
                                onlineStatusStore={onlineStatusStore}
                                size={15}
                            />
                            <Typography
                                className={classes.nameInput}
                            >
                                {profileStore.profileData.name}
                            </Typography>
                            <Typography
                                className={classes.bioInput}
                            >
                                {profileStore.profileData.bio}
                            </Typography>
                            {Change ?
                                <Button 
                                    onClick={()=>Disconnect()}
                                    className={classes.logoutButton}
                                    variant="contained"
                                >
                                    Logout
                                </Button>
                            : null}
                        </Container>
                    </div>
                )
            case changeProfileInfo:
                return(
                    <ChangeProfileInfo
                        profileInfo={profileStore.profileData} 
                        Done={()=> setItem(profile)}
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

export default Profile