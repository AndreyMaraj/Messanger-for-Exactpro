import com.google.gson.Gson;
import com.google.gson.JsonObject;
import consts.SseEvents;
import io.javalin.http.Context;
import io.javalin.http.sse.SseClient;
import org.eclipse.jetty.http.HttpStatus;
import org.jetbrains.annotations.NotNull;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;

import static consts.Constants.*;

public class SseConnectionsManager {
    private static final HashMap<String, SseClient> SSE_CLIENTS_NAMES = new HashMap<>(); // ключ - имя, значение - юзер ссе
    private static final DataBase DATABASE = Server.getDatabase();
    ChatManager chatManager = new ChatManager();

    public static HashMap<String, SseClient> getSseClientsNames() {
        return SSE_CLIENTS_NAMES;
    }

    public void login(@NotNull Context ctx) {
        String login = ctx.queryParam(USERNAME);
        String password = ctx.queryParam(PASSWORD);
        if (DATABASE.checkDataExistsInTable(USER, LOGIN, login) && DATABASE.getValueFromTable(USER, LOGIN, login, PASSWORD).equals(password)) {
            String session = Server.getIdString();
            DATABASE.updateValueInTable(USER, SESSION, session, LOGIN, login);
            ctx.status(HttpStatus.OK_200);
            ctx.result(getStringAsJson(SESSION, session).toString());
        } else {
            ctx.status(HttpStatus.UNAUTHORIZED_401);
            System.out.println("name = " + login + " pass = " + password + " -> такого пользователя нет в базе данных");
        }
    }

    public void registerUser(@NotNull Context ctx) {
        JsonObject requestBody = new Gson().fromJson(ctx.body(), JsonObject.class);
        String name = requestBody.get(NAME).getAsString();
        String password = requestBody.get(PASSWORD).getAsString();
        if (Arrays.asList(WRONG_NAMES).contains(name) || name.equals("") || DATABASE.checkDataExistsInTable(USER, NAME, name)) {
            System.out.println("ERROR: registration: Такое имя " + name + " уже есть в БД");
            ctx.status(HttpStatus.NOT_ACCEPTABLE_406);
        } else {
            String session = Server.getIdString();
            DATABASE.registerUser(name, password, session);
            ctx.result(getStringAsJson(SESSION, session).toString());
            ctx.status(HttpStatus.OK_200);
        }
    }

    /**
     * Отключение ссе клиента
     */
    public void disconnectClient(@NotNull Context ctx) {
        String session = ctx.queryParam(SESSION);
        if (SseConnectionsManager.checkValidSessionKey(session, ctx)) {
            String username = DATABASE.getValueFromTable(USER, SESSION, session, LOGIN);
            if (getSseClientsNames().containsKey(username)) {
                ctx.status(HttpStatus.OK_200);
                getSseClientsNames().remove(username);
                System.out.println("Юзер " + username + " успешно отключен");
            } else {
                ctx.status(HttpStatus.UNAUTHORIZED_401);
                System.out.println("disconnect-client: Не удалось отключить пользователя: clientsInfo не содержит " + session);
            }
        }
    }

    /**
     * Устанавливает новый timeStamp клиенту
     */
    public void setClientOnlineStatus(@NotNull Context ctx) {
        String session = ctx.queryParam(SESSION);
        if (checkValidSessionKey(session, ctx)) {
            String timeStamp = java.time.LocalDateTime.now().toString();
            String login = DATABASE.getValueFromTable(USER, SESSION, session, LOGIN);
            System.out.println(login + " is online");
            DATABASE.updateValueInTable(USER, TIMESTAMP, timeStamp, LOGIN, login);
            ArrayList<String> allUsers = DATABASE.getAllUserNames();
            JsonObject userOnlineStatus = new JsonObject();
            userOnlineStatus.addProperty(NAME, login);
            userOnlineStatus.addProperty(TIME, timeStamp);
            if (allUsers != null) {
                for (String user : allUsers) {
                    if (getSseClientsNames().containsKey(user)) {
                        getSseClientsNames().get(user).sendEvent(SseEvents.USER_STATUS, userOnlineStatus.toString());
                    }
                }
            }
            ctx.status(HttpStatus.OK_200);
        }
    }

    /**
     * Отправка события ссе клиентам
     */
    public static void sendEvent(String sseClientsNames, String event, String eventData) {
        if (sseClientsNames != null) {
            Arrays.stream(sseClientsNames.split(",")).forEach(client -> {
                if (!client.equals("") && getSseClientsNames().containsKey(client)) {
                    getSseClientsNames().get(client).sendEvent(event, eventData);
                }else{
                    System.out.println("Sse client " + client + " is null");
                }
            });
        }
    }

    public void setSseConnection(SseClient client) {
        System.out.println("SSE");
        String session = client.ctx.queryParam(SESSION);
        if (session != null && DATABASE.checkDataExistsInTable(USER, SESSION, session)) {
            String user = DATABASE.getValueFromTable(USER, SESSION, session, LOGIN);
            System.out.println("sse " + user);
            getSseClientsNames().put(user, client);
            client.onClose(() -> {
                getSseClientsNames().remove(user, client);
                System.out.println("sse: client disconnected");
            });
            String chatsFromDataBase = DATABASE.getValueFromTable(user, CHAT_LIST);
            if (chatsFromDataBase != null && !chatsFromDataBase.equals("")) {
                Arrays.stream(chatsFromDataBase.split(",")).forEach(chatId -> {
                    sendEvent(user, SseEvents.UPDATE, chatManager.getChatInfoAsJson(chatId, user).toString());
                    MessageManager.sendMessageHistory(chatId, session);
                });
            }
            client.ctx.status(HttpStatus.OK_200);
        } else {
            client.ctx.status(HttpStatus.UNAUTHORIZED_401);
            System.out.println("ERROR: sse: Пользователь с ключем " + session + " не авторизован");
        }
    }

    /**
     * Перезаписывает имя ссе клиента
     */
    public void updateSseClientName(String oldName, String newName) {
        getSseClientsNames().put(newName, getSseClientsNames().get(oldName));
        getSseClientsNames().remove(oldName);
    }

    public static JsonObject getStringAsJson(String key, String value) {
        JsonObject jsonObject = new JsonObject();
        jsonObject.addProperty(key, value);
        return jsonObject;
    }

    public static boolean checkValidSessionKey(String key, @NotNull Context ctx) {
        if (key != null && DATABASE.checkDataExistsInTable(USER, SESSION, key)) {
            return true;
        } else {
            ctx.status(HttpStatus.UNAUTHORIZED_401);
            return false;
        }
    }
}