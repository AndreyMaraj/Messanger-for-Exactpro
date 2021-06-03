import React, {ChangeEvent, useState} from 'react'
import { observer } from 'mobx-react'
import Requests from '../Requests'
import Profile from './Profile'
import UserAvatar from './UserAvatar'
import OnlineStatusStore from '../stores/OnlineStatusStore'
import ProfileStore from '../stores/ProfileStore'
import { UserInfo } from '../interfaces/UserInfo'
import { AppBar, Avatar, Button, Checkbox, Container, CssBaseline, FormControlLabel, Grid, IconButton, List, ListItem, ListItemAvatar, ListItemSecondaryAction, ListItemText, Switch, TextField, Toolbar, Typography } from '@material-ui/core'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'
import MessageIcon from '@material-ui/icons/Message'
import DeleteIcon from '@material-ui/icons/Delete'

var userProfile: string = ''

// Создание чата 
const CreateChat = observer(({users, profileStore, onlineStatusStore, Done}: { users: UserInfo[], profileStore: ProfileStore, onlineStatusStore: OnlineStatusStore, Done: (chatId: string | null) => void}) => {

  const createDirect = 'CreateDirect' // элемент
  const profile = 'Profile' // элемент
  const createGroupChat = 'CreateGroupChat' // элемент 
  const [item, setItem] = useState<string>(createDirect) // Отобаражаемый элемент
  const [lastItem, setLastItem] = useState<string>('') // Последний отображаемый элемент
  const [groupChatName, setGroupChatName] = useState<string>("") // Навзание
  const [groupChatBio, setGroupChatBio] = useState<string>("") // Био
  const [groupChatPicture, setGroupChatPicture] = useState<string>('') // Фото
  const [groupChatSmartType, setGroupChatSmartType] = useState<boolean>(false) // Тип
  const [groupChatUsers, setGroupChatUsers] = useState<boolean[]>(users.map(()=>{ return false })) // Пользователи
  const smartChat = 'SmartChat' // умный чат
  const simpleChat = 'SimpleChat' // простой чат

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
      headerButton: {
          marginLeft: theme.spacing(2),
          color: 'white',
          background: '#3d50b6'
      },
      createPrivateChat: {
        width: '100%',
        position: 'relative',
        overflow: 'scroll',
        height: '90%'
      },
      profileInfo: {
        marginTop: theme.spacing(8),
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        alignItems: 'center'
      },
      root: {
        flexGrow: 1
      },
      root1: {
        width: '100%',
        position: 'relative',
        overflow: 'auto',
        height: 500
      },  
      paper: {
        marginTop: theme.spacing(4),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        height: '100%'
      },
      addButton: {
        textAlign: 'right'
      },
      title: {
        flexGrow: 1
      },
      smallAvatar: {
        width: theme.spacing(5),
        height: theme.spacing(5)
      },
      largeAvatar: {
        width: theme.spacing(15),
        height: theme.spacing(15)
      },
      cancelButton: {
        marginRight: theme.spacing(2),
        color: 'white',
        background: '#3d50b6'
      },
      saveButton: {
        marginRight: theme.spacing(2),
        color: 'white',
        background: '#3d50b6'
      },  
      createNewGroupButton: {
        variant: "contained",
        color: "primary"
      },
      createNewDialogButton: {
        variant: "contained",
        color: "primary"
      },
      setNewPhotoButton: {

      },
      editNameButton: {

      },
      editBioButton: {

      },
      nameInput: {

      },
      deletePhotoButton: {
        background: 'red'
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
  const classes = useStyles() // классы для стилей

  // открытие профиля
  function OpenProfile(): void {
    profileStore.Clear() // очитска данных о предыдущем профиле
    var request: {responseText: string, status: number} | null = Requests.OpenProfile(userProfile) // запрос на открытие профиля
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

  // загрузка файла
  function LoadPic(event: any){
    const reader: FileReader = new FileReader()
    reader.addEventListener("load", ()=>{ // событие при загрузки файла
      var file: string | undefined = reader.result?.toString()
      if(file){
        setGroupChatPicture(file)
      }
    })
    reader.onerror = (error) => { // событие при ошибке при загрузке файла
      alert('Error: ' + error)
    }
    reader.readAsDataURL(event.target.files[0]) // загрузка файла
  }

  // создание личного диалога
  function CreatePrivateChat(user: string): void{
    let data = { // подготовка данных для отправки на сервер
      user: user
    }
    var request: {responseText: string, status: number} | null = Requests.CratePrivateChat(data) // запрос на сервер о создании личного диалога
    switch(request?.status){
      case 200:
        Done(JSON.parse(request.responseText).chatId) // открытие диалога
        break
      case 401:
        alert("User is not logged in.")
        break
      case 409:
        Done(JSON.parse(request.responseText).chatId) // открытие диалога, если он уже создан
        break
      default:
        alert("Error.")
        break
    }
  }

  // создание группового чата
  function CreateGroupChat(): void{
    var chatUsers: string [] = []
    users.map((user: UserInfo, index: number)=>{ // определение отмеченных пользователей для добавления в чат
      if (groupChatUsers[index]){
        chatUsers.push(user.name) 
      }
    })
    if (chatUsers.length !== 0 && groupChatName !== ""){ // если выбраны пользователи и задано имя чата
      let data: {users: string[], chatName: string, picture: string, type: string, bio: string} = { // подготовка данных для отправки на сервер
        users: chatUsers,
        chatName: groupChatName,
        picture: groupChatPicture,
        type: groupChatSmartType ? smartChat : simpleChat,
        bio: groupChatBio
      }
      var request: {responseText: string, status: number} | null = Requests.CreateGroupChat(data) // запрос на сервер о создании группового чата
      switch(request?.status){
        case 200:
          Done(JSON.parse(request.responseText).chatId) // Открытие чата
          break
        case 401:
          alert("User is not logged in.")
          break
        case 409:
          alert("Chat creation error.")
          break
        default:
          alert("Error.")
          break
      }
    }
    else{
      alert('Name the chat and add users.')
    }
  }

  function SetItem(): JSX.Element {
    switch(item){
        case createDirect:
          return(
              <div 
                className={classes.content}
              >
                <AppBar 
                  className={classes.header}
                >
                  <Toolbar>
                    <Button
                      onClick={()=>Done(null)}
                      className={classes.headerButton}
                      variant="outlined"
                    >
                      Cancel
                    </Button>
                  </Toolbar>
                </AppBar>
                <List 
                  dense={true}
                  className={classes.createPrivateChat}
                >
                  <ListItem>
                    <Button 
                      onClick={()=>setItem(createGroupChat)}
                      className={classes.createNewGroupButton}
                      fullWidth
                    >
                      New group
                    </Button>
                  </ListItem>
                  {users.map((user: UserInfo, index: number) =>
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
                        onClick={()=>{userProfile = user.name; setLastItem(createDirect); setItem(profile)}}
                      />
                      <ListItemSecondaryAction>
                        <IconButton 
                          edge="end" 
                          aria-label="add"
                          onClick={()=>CreatePrivateChat(user.name)}
                        >
                          <MessageIcon/>
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  )}
                </List>
              </div>
          )
        case createGroupChat:
          return(
            <div>
              <AppBar position="static">
                <Toolbar>
                  <Button
                    onClick={()=>Done(null)}
                    className={classes.cancelButton}
                    variant="outlined"
                  >
                    Cancel
                  </Button>
                  <Typography 
                    className={classes.title}
                    variant="h6" 
                    noWrap
                  />
                  <Button
                    onClick={()=>CreateGroupChat()}
                    className={classes.saveButton}
                    variant="outlined"
                  >
                    Done
                  </Button>
                </Toolbar>
              </AppBar>
              <Container
                className={classes.profileInfo}
              >
                  <Grid
                    container
                  >
                    <Grid
                      item
                      xs
                      className={classes.paper}
                    >
                      <Avatar 
                        src={groupChatPicture} 
                        className={classes.largeAvatar}
                      />
                      <Button
                        variant="outlined"
                        component="label"
                        className={classes.setNewPhotoButton}
                      >
                        <input
                            type="file"
                            onChange={event=>LoadPic(event)}
                            hidden
                            accept=".png, .jpg, .jpeg, .svg"
                        />
                        Set A Photo
                      </Button>
                      {groupChatPicture !== '' ?
                        <Button
                          variant="contained"
                          className={classes.deletePhotoButton}
                          onClick={()=>setGroupChatPicture('')}
                        >
                          <DeleteIcon />
                          Delete
                        </Button>
                      : null
                      }
                      <div>
                        <TextField
                          label="Name"
                          variant="standard"
                          value={groupChatName}
                          className={classes.editNameButton}
                          onChange={event=>setGroupChatName(event.target.value)}
                        />
                      </div>
                      <div>
                        <TextField
                          label="Bio"
                          variant="standard"
                          value={groupChatBio}
                          className={classes.editBioButton}
                          onChange={event=>setGroupChatBio(event.target.value)}
                        />
                      </div>
                      <div>
                        <FormControlLabel
                          control={<Switch color="primary" checked={groupChatSmartType} onChange={(event: ChangeEvent<HTMLInputElement>)=>setGroupChatSmartType(event.target.checked)} />}
                          label="Smart Type"
                          labelPlacement="start"
                        />
                      </div>
                    </Grid>
                    <Grid
                      item
                      xs
                      className={classes.paper}
                    >
                      <Grid 
                        item
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
                            {users.map((user: UserInfo, index: number) =>
                              <ListItem key={index}>
                                <ListItemAvatar>
                                  <UserAvatar 
                                    user={{name: user.name, picture: user.picture}} 
                                    onlineStatusStore={onlineStatusStore}
                                    size={5}
                                  />
                                </ListItemAvatar>
                                <ListItemText
                                  primary={user.name}
                                  onClick={()=>{userProfile = user.name; setLastItem(createGroupChat); setItem(profile)}}
                                />
                                <ListItemSecondaryAction>
                                  <Checkbox
                                    color="primary"
                                    edge="end"
                                    checked={groupChatUsers[index]} 
                                    onChange={()=>setGroupChatUsers(groupChatUsers.map((user: boolean,index1: number)=>{if(index1 === index) {return !groupChatUsers[index1]} else{ return groupChatUsers[index1]}}))}
                                  />
                                </ListItemSecondaryAction>
                              </ListItem>,
                            )}
                          </List>
                        </div>
                      </Grid>
                    </Grid>
                  </Grid>
              </Container>
            </div>
          )
        case profile:
          OpenProfile()
          return(
            <Profile 
              profileStore={profileStore} 
              onlineStatusStore={onlineStatusStore}
              Change={false} 
              Done={()=>{lastItem === createGroupChat ? setItem(createGroupChat) : setItem(createDirect)}}
            />
          )
        default:
          return(
            <React.Fragment/>
          )
    }
  }
  
  return(
    SetItem()
  )
})

export default CreateChat