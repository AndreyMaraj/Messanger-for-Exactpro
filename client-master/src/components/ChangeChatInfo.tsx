import {ChangeEvent, useState} from 'react'
import Requests from '../Requests'
import { ChatsUpdate } from "../interfaces/ChatsUpdate"
import { AppBar, Avatar, Button, Container, createStyles, FormControlLabel, IconButton, makeStyles, Snackbar, Switch, TextField, Theme, Toolbar, Typography } from '@material-ui/core'
import DeleteIcon from '@material-ui/icons/Delete'
import React from 'react'
import { Close } from '@material-ui/icons'

// Редактирование информации чата
const ChangeChatInfo = (props: {chatInfo: ChatsUpdate, Done: ()=> void}) => {
    
    const [newGroupChatName, setNewGroupChatName] = useState<string>(props.chatInfo.title)  // название
    const [newGroupChatBio, setNewGroupChatBio] = useState<string>(props.chatInfo.bio) // био
    const [newGroupChatPicture, setNewGroupChatPicture] = useState<string>(props.chatInfo.picture) // фото
    const [newGroupChatSmartType, setNewGroupChatSmartType] = useState<boolean>(props.chatInfo.type === '2' ? true : false) //тип
    const [open, setOpen] = React.useState(false);
    const [message, setMessage] = React.useState('');

    function handleClose() {
        setOpen(false);
    };
    const useStyles = makeStyles((theme: Theme) => //стили
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
            changeChatInfo: {
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
            setNewPhotoButton: {

            },
            deletePhotoButton: {
                background: 'red'
            },
            editNameButton: {

            },
            editBioButton: {

            }
        })
    )
    const classes = useStyles() // классы стилей

    // Загрузка файла
    function LoadPic(event: any): void {
        const reader: FileReader = new FileReader()
        reader.addEventListener("load", () =>{
            var file: string | undefined = reader.result?.toString()
            if(file){
                setNewGroupChatPicture(file)
            }
        })
        reader.onerror = (error) => {
            setMessage('Error: ' + error);
            setOpen(true);
        }
        reader.readAsDataURL(event.target.files[0])
    }

    // Сохранение изменений
    function SaveChanges(): void {
        let data: {chatId: string, chatName: string, bio: string, picture: string, type: string} = { // формирование данных для запроса на сервер
            chatId: props.chatInfo.id,
            chatName: newGroupChatName,
            bio: newGroupChatBio,
            picture: newGroupChatPicture,
            type: newGroupChatSmartType ? '2' : '3'
        }
        var request: {responseText: string, status: number} | null = Requests.ChangeChatInfo(data) // запрос на сохранение данных о профиле
        switch(request?.status){
            case 200:
                props.Done()
                break
            case 401:
                setMessage("User is not logged in.");
                setOpen(true);
                break
            case 403:
                setMessage("User has insufficient rights.");
                setOpen(true);
                break
            default:
                setMessage("Error.");
                setOpen(true);
                break
        }
    }

    return (
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
                        <Typography 
                            className={classes.headerTitle}
                            variant="h6" 
                            noWrap
                        />
                        <Button
                            onClick={()=>SaveChanges()}
                            variant="outlined"
                            className={classes.headerButton}
                        >
                            Done
                        </Button>
                    </Toolbar>
                </AppBar>
                <Container
                    className={classes.changeChatInfo}
                >
                    <Avatar 
                        src={newGroupChatPicture} 
                        className={classes.largeAvatar}
                    />
                    <Button
                        variant="outlined"
                        component="label"
                        className={classes.setNewPhotoButton}
                    >
                        <input
                            type="file"
                            onChange={(event: ChangeEvent<HTMLInputElement>)=>LoadPic(event)}
                            hidden
                            accept=".png, .jpg, .jpeg, .svg"
                        />
                        Set New Photo
                    </Button>
                    {newGroupChatPicture !== null ?
                        <Button
                            variant="contained"
                            className={classes.deletePhotoButton}
                            onClick={()=>setNewGroupChatPicture('')}
                        >
                            <DeleteIcon />
                            Delete
                        </Button>
                    : null}
                    <TextField
                        label="Name"
                        variant="standard"
                        value={newGroupChatName}
                        className={classes.editNameButton}
                        onChange={event=>setNewGroupChatName(event.target.value)}
                    />
                    <TextField
                        label="Bio"
                        variant="standard"
                        value={newGroupChatBio}
                        className={classes.editBioButton}
                        onChange={event=>setNewGroupChatBio(event.target.value)}
                    />
                    {props.chatInfo.role === 'owner' ? 
                        <FormControlLabel
                            control={<Switch color="primary" checked={newGroupChatSmartType} onChange={(event: ChangeEvent<HTMLInputElement>)=>setNewGroupChatSmartType(event.target.checked)} />}
                            label="Smart Type"
                            labelPlacement="start"
                        />
                    : null}
                </Container>
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
            </div>
    )
}

export default ChangeChatInfo