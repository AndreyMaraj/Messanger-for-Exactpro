import Cookie from './Cookie'
import { ProfileInfo } from './interfaces/ProfileInfo'

// Запросы на сервер 
export default class Requests{

    private static Addres: string = 'http://127.0.0.1:8081/' // адрес сервера
    private static Get: string = 'GET' 
    private static Post: string = 'POST'
    private static Put: string = 'PUT'
    private static Sse: EventSource 

    // Проверка ключа сессии на null
    private static CheckingNullKeySession(): string | null{
        var cookieKeySession: string | null = Cookie.Get('key') // Достаем из куки данные
        if(cookieKeySession){
            return cookieKeySession
        }
        else{
            // alert('Session key error.')
            return null
        }
    }

    // Общий запрос на сервер
    private static Request(type: string, url: string, data: any | null): {responseText: string, status: number}{
        var request: XMLHttpRequest = new XMLHttpRequest()
        request.open(type, Requests.Addres + url, false)
        data === null ? request.send() : request.send(JSON.stringify(data))
        return {responseText: request.responseText, status: request.status}
    }

    // Вход в мессенджер
    public static LogIn(username: string, password: string): {responseText: string, status: number}{
        var url = "login?username=" + username + "&password=" + password
        var request = this.Request(Requests.Get, url, null)
        return {responseText: request.responseText, status: request.status}
    }

    // Регистрация 
    public static SignIn(data: {name: string, password: string}): {responseText: string, status: number}{
        var url = "registration"
        var request = this.Request(Requests.Post, url, data)
        return {responseText: request.responseText, status: request.status}
    }

    // Оповещение сервера о том, что клиент на сайте
    public static Alive(): {responseText: string, status: number} | null{
        var sessionKey = Requests.CheckingNullKeySession()
        if(sessionKey){
            var url = "alive?key=" + sessionKey
            var request = this.Request(Requests.Put, url, null)
            return {responseText: request.responseText, status: request.status}
        }
        else{
            return null
        }
    }

    // Открытие профиля
    public static OpenProfile(username: string): {responseText: string, status: number} | null{
        var sessionKey = Requests.CheckingNullKeySession()
        if(sessionKey){
            var url = "get-user-info?key=" + sessionKey + "&name=" + username
            var request = this.Request(Requests.Get, url, null)
            return {responseText: request.responseText, status: request.status}
        }
        else{
            return null
        }
    }

    // Редактирование данных профиля
    public static ChangeProfileInfo(data: ProfileInfo): {responseText: string, status: number} | null{
        var sessionKey = Requests.CheckingNullKeySession()
        if(sessionKey){
            var url = "set-user-info?key=" + sessionKey
            var request = this.Request(Requests.Post, url, data)
            return {responseText: request.responseText, status: request.status}
        }
        else{
            return null
        }
    }

    // Выход из мессенджера
    public static Disconnect(): {responseText: string, status: number} | null{
        var sessionKey = Requests.CheckingNullKeySession()
        if(sessionKey){
            var url = "disconnect-client?key=" + sessionKey
            var request = this.Request(Requests.Post, url, null)
            return {responseText: request.responseText, status: request.status}
        }
        else{
            return null
        }
    }

    // Запрос на всех пользователей в мессенджере
    public static GetAllUsers(): {responseText: string, status: number} | null{
        var sessionKey = Requests.CheckingNullKeySession()
        if(sessionKey){
            var url = "all-users?key=" + sessionKey
            var request = this.Request(Requests.Get, url, null)
            return {responseText: request.responseText, status: request.status}
        }
        else{
            return null
        }
    }
    
    // Создание личного диалога
    public static CratePrivateChat(data: {user: string}): {responseText: string, status: number} | null{
        var sessionKey = Requests.CheckingNullKeySession()
        if(sessionKey){
            var url = "create-private-chat?key=" + sessionKey
            var request = this.Request(Requests.Post, url, data)
            return {responseText: request.responseText, status: request.status}
        }
        else{
            return null
        }
    }

    // Создание группового чата
    public static CreateGroupChat(data: {users: string[], chatName: string, picture: string, type: string, bio: string}): {responseText: string, status: number} | null{
        var sessionKey = Requests.CheckingNullKeySession()
        if(sessionKey){
            var url = "create-chat?key=" + sessionKey
            var request = this.Request(Requests.Post, url, data)
            return {responseText: request.responseText, status: request.status}
        }
        else{
            return null
        }
    }

    // Открытие чата
    public static OpenChat(chatId: string): {responseText: string, status: number} | null{
        var sessionKey = Requests.CheckingNullKeySession()
        if(sessionKey){
            var url = "open-chat?key=" + sessionKey + "&chatId=" + chatId
            var request = this.Request(Requests.Get, url, null)
            return {responseText: request.responseText, status: request.status}
        }
        else{
            return null
        }
    }

    // Удаление чата 
    public static DeleteChat (data: {chatId: string}): {responseText: string, status: number} | null{
        var sessionKey = Requests.CheckingNullKeySession()
        if(sessionKey){
            var url = "exit-from-chat?key=" + sessionKey
            var request = this.Request(Requests.Post, url, data)
            return {responseText: request.responseText, status: request.status}
        }
        else{
            return null
        }
    }

    // Редактирование сообщения
    public static EditMesssage(data: {chatId: string, id: string, text: string, files: {name: string, bytes: string}[]}): {responseText: string, status: number} | null{
        var sessionKey = Requests.CheckingNullKeySession()
        if(sessionKey){
            var url = "edit-message?key=" + sessionKey
            var request = this.Request(Requests.Post, url, data)
            return {responseText: request.responseText, status: request.status}
        }
        else{
            return null
        }
    }

    // Отправка сообщения
    public static SendMessage(data: {chatId: string, text: string, time: string, date: string, files: {name: string, bytes: string}[]}): {responseText: string, status: number} | null{
        var sessionKey = Requests.CheckingNullKeySession()
        if(sessionKey){
            var url = "send-message?key=" + sessionKey
            var request = this.Request(Requests.Post, url, data)
            return {responseText: request.responseText, status: request.status}
        }
        else{
            return null
        }
    }
    
    // Прочтение сообщения
    public static ReadMessage(data: {chatId: string, id: string}): {responseText: string, status: number} | null{
        var sessionKey = Requests.CheckingNullKeySession()
        if(sessionKey){
            var url = "message-read?key=" + sessionKey
            var request = this.Request(Requests.Post, url, data)
            return {responseText: request.responseText, status: request.status}
        }
        else{
            return null
        }
    }

    // Удаление сообщения
    public static DeleteMessage(data: {chatId: string, id: string}): {responseText: string, status: number} | null{
        var sessionKey = Requests.CheckingNullKeySession()
        if(sessionKey){
            var url = "delete-message?key=" + sessionKey
            var request = this.Request(Requests.Post, url, data)
            return {responseText: request.responseText, status: request.status}
        }
        else{
            return null
        }
    }

    // Добавление пользователя в чат
    public static AddMemberToChat(data: {chatId: string, user: string}): {responseText: string, status: number} | null{
        var sessionKey = Requests.CheckingNullKeySession()
        if(sessionKey){
            var url = "add-user-in-chat?key=" + sessionKey
            var request = this.Request(Requests.Post, url, data)
            return {responseText: request.responseText, status: request.status}
        }
        else{
            return null
        }
    }

    // Удаление пользователя из чата
    public static RemoveMemberFromChat(data: {chatId: string, user: string}): {responseText: string, status: number} | null{
        var sessionKey = Requests.CheckingNullKeySession()
        if(sessionKey){
            var url = "delete-user-from-chat?key=" + sessionKey
            var request = this.Request(Requests.Post, url, data)
            return {responseText: request.responseText, status: request.status}
        }
        else{
            return null
        }
    }

    // Добавление администратора в чат
    public static AddChatAdministrator(data: {chatId: string, user: string}): {responseText: string, status: number} | null{
        var sessionKey = Requests.CheckingNullKeySession()
        if(sessionKey){
            var url = "add-admin?key=" + sessionKey
            var request = this.Request(Requests.Post, url, data)
            return {responseText: request.responseText, status: request.status}
        }
        else{
            return null
        }
    }

    // Удаление администратора из чата
    public static RemoveChatAdministrator(data: {chatId: string, user: string}): {responseText: string, status: number} | null{
        var sessionKey = Requests.CheckingNullKeySession()
        if(sessionKey){
            var url = "delete-admin?key=" + sessionKey
            var request = this.Request(Requests.Post, url, data)
            return {responseText: request.responseText, status: request.status}
        }
        else{
            return null
        }
    }

    // Запрос на пользователей, которых нет в чате
    public static UsersToAddToChat(chatId: string): {responseText: string, status: number} | null{
        var sessionKey = Requests.CheckingNullKeySession()
        if(sessionKey){
            var url = "users-to-add-in-chat?key=" + sessionKey + '&chatId=' + chatId
            var request = this.Request(Requests.Get, url, null)
            return {responseText: request.responseText, status: request.status}
        }
        else{
            return null
        }
    }

    // Редактирование данных чата
    public static ChangeChatInfo(data: {chatId: string, chatName: string, bio: string, picture: string, type: string}): {responseText: string, status: number} | null{
        var sessionKey = Requests.CheckingNullKeySession()
        if(sessionKey){
            var url = "set-chat-settings?key=" + sessionKey
            var request = this.Request(Requests.Post, url, data)
            return {responseText: request.responseText, status: request.status}
        }
        else{
            return null
        }
    }

    // Подписка на ссе 
    public static SseSubscribe(): EventSource{
        var sessionKey = Requests.CheckingNullKeySession()
        if(sessionKey){
            Requests.Sse = new EventSource(Requests.Addres + "sse?key=" + sessionKey, {withCredentials:true })
        }
        return Requests.Sse
    }
}
