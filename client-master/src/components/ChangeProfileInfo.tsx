import { ChangeEvent, useState } from 'react'
import Requests from '../Requests'
import { ProfileInfo } from "../interfaces/ProfileInfo"
import { AppBar, Avatar, Button, Container, createStyles, makeStyles, TextField, Theme, Toolbar, Typography } from '@material-ui/core'
import DeleteIcon from '@material-ui/icons/Delete'

// Форма редактирования профиля пользователя
const ChangeProfileInfo = (props: {profileInfo: ProfileInfo, Done: ()=> void}) => {

    const [newUsername, setNewUsername] = useState<string>(props.profileInfo.name) // имя пользователя
    const [newBio, setNewBio] = useState<string>(props.profileInfo.bio) // био
    const [newPicture, setNewPicture] = useState<string>(props.profileInfo.picture) // фото пользователя

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
            changeProfileInfo: {
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
        debugger
        reader.addEventListener("load", ()=>{ // обработка события чтения файла 
            var file: string | undefined = reader.result?.toString()
            if(file){
                setNewPicture(file)
            }
        })
        reader.onerror = (error) => { // обрабокта ошибки чтения файла
            alert('Error: ' + error)
        }
        reader.readAsDataURL(event.target.files[0]) // чтение файла
    }

    // Сохранение данных 
    function SaveChanges(): void {
        let data: ProfileInfo = { // подготвка данных к отправке на сервер
            name: newUsername,
            bio: newBio,
            picture: newPicture
        }
        var request: {responseText: string, status: number} | null = Requests.ChangeProfileInfo(data) // Отправка запроса о редактировании данных профиля
        switch(request?.status){
            case 200:
                props.Done()
                break
            case 401:
                alert("User is not logged in.")
                break
            default:
                alert("Error.")
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
                        variant="outlined"
                        className={classes.headerButton}
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
                className={classes.changeProfileInfo}
            >
                <Avatar 
                    src={newPicture} 
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
                {newPicture !== '' ?
                    <Button
                        variant="contained"
                        className={classes.deletePhotoButton}
                        onClick={()=>setNewPicture('')}
                    >
                        <DeleteIcon />
                        Delete
                    </Button>
                : null
                }
                <TextField
                    label="Name"
                    variant="standard"
                    value={newUsername}
                    className={classes.editNameButton}
                    onChange={event=>setNewUsername(event.target.value)}
                />
                <TextField
                    label="Bio"
                    variant="standard"
                    value={newBio}
                    className={classes.editBioButton}
                    onChange={event=>setNewBio(event.target.value)}
                />
            </Container>
        </div>
    )
}

export default ChangeProfileInfo