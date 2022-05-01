import React, { useState } from 'react'
import Authorization from "./components/Authorization"
import Messenger from './components/Messenger'
import UpdateListener from './components/UpdateListener'
import ChatsStore from './stores/ChatsStore'
import OnlineStatusStore from './stores/OnlineStatusStore'
import MessagesStore from './stores/MessagesStore'
import GroupUsersStore from './stores/GroupUsersStore'
import ProfileStore from './stores/ProfileStore'
import { BrowserRouter, Route, Routes} from 'react-router-dom'
import { Redirect } from 'react-router'

const App = () => {

  const chatsStore: ChatsStore = new ChatsStore() // хранилище диалогов
  const messagesStore: MessagesStore = new MessagesStore() // хранилище сообщений
  const groupUsersStore: GroupUsersStore = new GroupUsersStore() // хранилище пользователей беседы
  const profileStore: ProfileStore = new ProfileStore() // хранилище инофрмации о профиле пользователя
  const onlineStatusStore: OnlineStatusStore = new OnlineStatusStore() // хранилище информации о последнем отправки статуса "онлайн" на сервер пользователями
  const [item, setItem] = useState<string>('Authorization') // отображаемый элемент
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  if(isLoggedIn) {
    <Redirect to='/profile' />
  } else {
    <Redirect to='/authorization' />
  }

  // Отображение элемента
  function SetItem(): JSX.Element {
    switch (item) {
      case 'Authorization': // форма авторизации
        return (
          <Authorization />
        )
      case 'Messenger': // Мессенджер
        return (
          <div id='root'>
            <UpdateListener chatsStore={chatsStore} messagesStore={messagesStore} groupUsersStore={groupUsersStore} profileStore={profileStore} onlineStatusStore={onlineStatusStore} />
            <Messenger chatsStore={chatsStore} messagesStore={messagesStore} groupUsersStore={groupUsersStore} profileStore={profileStore} onlineStatusStore={onlineStatusStore} Disconnect={() => setItem('Authorization')} />
          </div>
        )
      default:
        return (
          <React.Fragment />
        )
    }
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="authorization" element={<Authorization />} />
        <Route path="messenger" element={<Messenger chatsStore={chatsStore} messagesStore={messagesStore} groupUsersStore={groupUsersStore} profileStore={profileStore} onlineStatusStore={onlineStatusStore} Disconnect={() => setItem('Authorization')}/>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App