import React, {useState} from 'react'
import Authorization from "./components/Authorization"
import Messenger from './components/Messenger'
import UpdateListener from './components/UpdateListener'
import ChatsStore from './stores/ChatsStore'
import OnlineStatusStore from './stores/OnlineStatusStore'
import MessagesStore from './stores/MessagesStore'
import GroupUsersStore from './stores/GroupUsersStore'
import ProfileStore from './stores/ProfileStore'

const App = () => {

  const chatsStore: ChatsStore = new ChatsStore() // хранилище диалогов
  const messagesStore: MessagesStore = new MessagesStore() // хранилище сообщений
  const groupUsersStore: GroupUsersStore = new GroupUsersStore() // хранилище пользователей беседы
  const profileStore: ProfileStore = new ProfileStore() // хранилище инофрмации о профиле пользователя
  const onlineStatusStore: OnlineStatusStore = new OnlineStatusStore() // хранилище информации о последнем отправки статуса "онлайн" на сервер пользователями
  const [item, setItem] = useState<string>('Authorization') // отображаемый элемент 
  
  // Отображение элемента
  function SetItem(): JSX.Element {
    switch(item){
      case 'Authorization': // форма авторизации
        return(
          <Authorization LogIn={()=>setItem('Messenger')}/>
        )
      case 'Messenger': // Мессенджер
        return(
          <div id='root'>
            <UpdateListener chatsStore={chatsStore} messagesStore={messagesStore} groupUsersStore={groupUsersStore} profileStore={profileStore} onlineStatusStore={onlineStatusStore}/>
            <Messenger chatsStore={chatsStore} messagesStore={messagesStore} groupUsersStore={groupUsersStore} profileStore={profileStore} onlineStatusStore={onlineStatusStore} Disconnect={()=>setItem('Authorization')}/>
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
}

export default App