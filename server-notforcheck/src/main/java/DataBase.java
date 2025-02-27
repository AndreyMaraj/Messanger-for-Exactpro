import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;

import java.sql.*;
import java.util.ArrayList;
import java.util.Arrays;

import static consts.Constants.*;

public class DataBase {

    private Connection connection;

    public void open() {
        try {
            Class.forName("org.sqlite.JDBC");
            connection = DriverManager.getConnection("jdbc:sqlite:users.db");
        } catch (Exception e) {
            System.out.println("not Connected!");
            System.out.println(e.getMessage());
        }
    }

    public boolean checkDataExistsInTable(String table, String column, String data) {
        try {
            Statement statement = connection.createStatement();
            ResultSet resultSet = statement.executeQuery("SELECT count(*) FROM " + table + " WHERE " + column + " = '" + data + "'");
            if (resultSet.getBoolean(1)) {
                statement.close();
                return true;
            } else {
                statement.close();
                return false;
            }
        } catch (Exception e) {
            System.out.println("-----------------------------------------------  ERROR in checkDataExistsInTable: " + e.getMessage());
            return false;
        }
    }

    public String getValueFromTable(String table, String column, String value, String targetColumn) {
        try {
            Statement statement = connection.createStatement();
            String res = statement.executeQuery("SELECT * FROM '" + table + "' WHERE " + column + " = '" + value + "'").getString(targetColumn);
            statement.close();
            return res;
        } catch (Exception e) {
            System.out.println("-----------------------------------------------  ERROR in getValueFromString1: " + e.getMessage() + "\n" + "SELECT * FROM '" + table + "' WHERE " + column + " = '" + value + "' " + targetColumn);
            return null;
        }
    }

    public String getValueFromTable(String table, String column) {
        try {
            Statement statement = connection.createStatement();
            //System.out.println("SELECT * FROM '" + table + "' WHERE flag='1' " + column);
            String res = statement.executeQuery("SELECT * FROM '" + table + "' WHERE flag='1'").getString(column);
            statement.close();
            return res;
        } catch (Exception e) {
            System.out.println("----------------------------------------------- ERROR in GetValueFromColumn2: " + "SELECT * FROM '" + table + "' WHERE flag='1' " + column + "/n" + e.getMessage());
            return null;
        }
    }

    public void createChat(String chatId, String chatName, String type, String owner) {
        try {
            Statement statement = connection.createStatement();
            statement.execute("CREATE TABLE '" + chatId + "'(" +
                    NAME + " TEXT PRIMARY KEY NOT NULL,\n" +
                    USER + " TEXT,\n" +
                    PICTURE + " TEXT,\n" +
                    OWNER + " TEXT,\n" +
                    ADMINS + " TEXT,\n" +
                    TYPE + " TEXT,\n" +
                    BIO + " TEXT,\n" +
                    FILES + " TEXT,\n" +
                    FLAG + " TEXT)");
            statement.executeUpdate("insert into '" + chatId + "' (name,type,admins) values ('" + chatName + "','" + type + "','');");
            statement.executeUpdate("UPDATE '" + chatId + "' SET flag  = ('1') WHERE name = '" + chatName + "'");
            statement.executeUpdate("UPDATE '" + chatId + "' SET owner  = ('" + owner + "') WHERE name = '" + chatName + "'");
            createChatMessagesStorageTable(chatId);
            createChatFilesStorageTable(chatId);
            statement.close();
        } catch (Exception e) {
            System.out.println("----------------------------------------------- DataBaseClass: Ошибка при создании чата " + e.getMessage());
        }
    }

    public void createChatMessagesStorageTable(String chatId) {
        try {
            Statement statement = connection.createStatement();
            statement.execute("CREATE TABLE '" + MESSAGE_ + chatId + "' (" +
                    ID + " TEXT PRIMARY KEY NOT NULL,\n" +
                    CHAT_ID + " TEXT,\n" +
                    TEXT + " TEXT,\n" +
                    SENDER + " TEXT,\n" +
                    ROLE + " TEXT,\n" +
                    TIME + " TEXT,\n" +
                    DATE + " TEXT,\n" +
                    FILES + " TEXT,\n" +
                    LINKS + " TEXT,\n" +
                    EDITED + " TEXT,\n" +
                    READ + " TEXT,\n" +
                    SENT + " TEXT,\n" +
                    FLAG + " TEXT)");
            statement.close();
        } catch (Exception e) {
            System.out.println("----------------------------------------------- createChatMessagesStorageTable: Ошибка " + e.getMessage());
        }
    }

    public void createChatFilesStorageTable(String chatId) {
        try {
            Statement statement = connection.createStatement();
            statement.execute("CREATE TABLE '" + FILES_ + chatId + "' (" +
                    ID + " TEXT PRIMARY KEY NOT NULL,\n" +
                    MESSAGE + " TEXT,\n" +
                    NAME + " TEXT,\n" +
                    TYPE + " TEXT,\n" +
                    BYTES + " TEXT,\n" +
                    FLAG + " TEXT)");
            statement.close();
        } catch (Exception e) {
            System.out.println("----------------------------------------------- createChatFilesStorageTable: Ошибка " + e.getMessage());
        }
    }

    public void addMessageToStorage(String chatId, JsonObject message) {
        try {
            Statement statement = connection.createStatement();
            statement.executeUpdate("INSERT or REPLACE into '" + MESSAGE_ + chatId + "' (" + ID + "," + CHAT_ID + "," + DATE + "," + TIME + "," + SENDER + "," + ROLE + "," + TEXT + "," + EDITED + "," + SENT + "," + READ + "," + FLAG + ") " +
                    "VALUES ('" + message.get(ID).getAsString() + "','"
                    + message.get(CHAT_ID).getAsString() + "','"
                    + message.get(DATE).getAsString() + "','"
                    + message.get(TIME).getAsString() + "','"
                    + message.get(SENDER).getAsString() + "','"
                    + message.get(ROLE).getAsString() + "','"
                    + message.get(TEXT).getAsString() + "'," + FALSE + "," + TRUE + "," + FALSE + ", '1')");
            if (message.get(FILES).getAsJsonArray().size() > 0) {
                System.out.println("ADD FILES");
                addFilesIntoMessage(chatId, message.get(ID).getAsString(), message.get(FILES).getAsJsonArray());
            }
            statement.close();
        } catch (Exception e) {
            System.out.println("----------------------------------------------- addMessageToStorage: Ошибка " + message.toString() + e.getMessage());
        }
    }

    public void setTrueReadIndicatorIntoMessage(String chatId, JsonObject message) {
        try {
            Statement statement = connection.createStatement();
            statement.executeUpdate("UPDATE '" + MESSAGE_ + chatId + "' set " + READ + "=" + true + " where id = '" + message.get(ID).getAsString() + "'");
            statement.close();
        } catch (Exception e) {
            System.out.println("----------------------------------------------- setTrueReadIndicatorIntoMessage: Ошибка " + message.toString() + "\n" + e.getMessage());
        }
    }

    public void changeSenderNameInMessage(String chatId, String newName, JsonObject message) {
        try {
            Statement statement = connection.createStatement();
            statement.executeUpdate("UPDATE '" + MESSAGE_ + chatId + "' set " + SENDER + "='" + newName + "' where id = '" + message.get(ID).getAsString() + "'");
            statement.close();
        } catch (Exception e) {
            System.out.println("----------------------------------------------- changeSenderNameInMessage: Ошибка " + message.toString() + "\n" + e.getMessage());
        }
    }

    public void editMessageInStorage(String chatId, JsonObject message) {
        System.out.println("IN editMessageInStorage");
        try {
            Statement statement = connection.createStatement();
            //System.out.println("message to edit " + message);
            statement.executeUpdate("UPDATE '" + MESSAGE_ + chatId + "' SET (" + TEXT + "," + EDITED + "," + SENT + "," + READ + ") = ('"
                    + message.get(TEXT).getAsString() + "'," + TRUE + "," + TRUE + "," + FALSE + ") where " + ID + "='" + message.get(ID).getAsString() + "'");
            updateValueInTable(MESSAGE_ + chatId, FILES, "[]", ID, message.get(ID).getAsString());
            deleteFromTable(FILES_ + chatId, ID, chatId);
            addFilesIntoMessage(chatId, message.get(ID).getAsString(), message.get(FILES).getAsJsonArray());
            statement.close();
        } catch (Exception e) {
            System.out.println("----------------------------------------------- editMessageInStorage: Ошибка " + e.getMessage());
        }
    }

    public void addFileToFilesJsonArray(String table, String columnToAdd, String pointColumn, String value, JsonObject file) {
        try {
            JsonObject fileCopy = file.deepCopy();
            fileCopy.remove(BYTES);
            if (file.has(BYTES)) {
                String files = getValueFromTable(table, pointColumn, value, columnToAdd);
                JsonArray filesArray;
                if (files != null && !files.equals("")) {
                    filesArray = new Gson().fromJson(files, JsonArray.class);
                    filesArray.add(fileCopy);
                } else {
                    filesArray = new JsonArray();
                    if (!filesArray.contains(fileCopy)) {
                        filesArray.add(fileCopy);
                    }
                }
                updateValueInTable(table, columnToAdd, filesArray.toString(), pointColumn, value);
            }
        } catch (Exception e) {
            System.out.println(e.getMessage());
        }
    }

    public void addFilesIntoMessage(String chatId, String messageId, JsonArray files) {
        try {
            Statement statement = connection.createStatement();
            for (int i = 0; i < files.size(); i++) {
                JsonObject file = files.get(i).getAsJsonObject();
                String fileBytes = file.get(BYTES).getAsString();
                String fileType = fileBytes.substring(fileBytes.indexOf(':') + 1, fileBytes.indexOf(';'));
                System.out.println("TYPE = " + fileType);
                file.addProperty(TYPE, fileType);
                try {
                    String fileId;
                    if (!file.has(ID)) {
                        fileId = Server.getIdString();
                        file.addProperty(ID, fileId);
                        System.out.println("ADDING ID TO FILE = " + fileId);
                    } else {
                        fileId = file.get(ID).getAsString();
                        System.out.println("ID IS EXIST = " + fileId);
                    }
                    System.out.println("INSERT or REPLACE into '" + FILES_ + chatId + "' (" + ID + "," + MESSAGE + ") values ('" + fileId + "','" + messageId + "')");
                    addFileToFilesJsonArray(MESSAGE_ + chatId, FILES, ID, messageId, file);
                    statement.executeUpdate("INSERT or REPLACE into '" + FILES_ + chatId + "' ('" + ID + "','" + MESSAGE + "') values ('" + fileId + "','" + messageId + "')");
                    statement.executeUpdate("UPDATE '" + FILES_ + chatId + "' SET " + TYPE + " = ('" + fileType + "') WHERE " + ID + " = '" + fileId + "'");
                    statement.executeUpdate("UPDATE '" + FILES_ + chatId + "' SET " + BYTES + " = ('" + fileBytes + "') WHERE " + ID + " = '" + fileId + "'");
                    statement.executeUpdate("UPDATE '" + FILES_ + chatId + "' SET " + NAME + " = ('" + file.get(NAME).getAsString() + "') WHERE " + ID + " = '" + fileId + "'");
                } catch (SQLException e) {
                    e.printStackTrace();
                }
            }
            statement.close();
        } catch (Exception e) {
            System.out.println("----------------------------------------------- addFilesIntoMessage: Ошибка " + e.getMessage());
        }
    }

    public JsonObject getMessageFromTable(String chatId, String messageId) {
        try {
            JsonObject message = new JsonObject();
            String sender = getValueFromTable(MESSAGE_ + chatId, ID, messageId, SENDER);
            message.addProperty(ID, getValueFromTable(MESSAGE_ + chatId, ID, messageId, ID));
            message.addProperty(CHAT_ID, getValueFromTable(MESSAGE_ + chatId, ID, messageId, CHAT_ID));
            message.addProperty(DATE, getValueFromTable(MESSAGE_ + chatId, ID, messageId, DATE));
            message.addProperty(TIME, getValueFromTable(MESSAGE_ + chatId, ID, messageId, TIME));
            message.addProperty(SENDER, sender);
            message.addProperty(TEXT, getValueFromTable(MESSAGE_ + chatId, ID, messageId, TEXT));
            if (getValueFromTable(MESSAGE_ + chatId, ID, messageId, FILES) != null &&
                    !getValueFromTable(MESSAGE_ + chatId, ID, messageId, FILES).equals("[]") && !getValueFromTable(MESSAGE_ + chatId, ID, messageId, FILES).equals("")) {
                message.add(FILES, new Gson().fromJson(getValueFromTable(MESSAGE_ + chatId, ID, messageId, FILES), JsonArray.class));
            } else {
                message.add(FILES, null);
            }
            message.addProperty(READ, getValueFromTable(MESSAGE_ + chatId, ID, messageId, READ).equals("1"));
            message.addProperty(SENT, getValueFromTable(MESSAGE_ + chatId, ID, messageId, SENT).equals("1"));
            message.addProperty(EDITED, getValueFromTable(MESSAGE_ + chatId, ID, messageId, EDITED).equals("1"));
            message.addProperty(SENDER_PICTURE, getValueFromTable(sender, PICTURE));
            return message;
        } catch (Exception e) {
            System.out.println("----------------------------------------------- getMessageFromTable: Ошибка " + e.getMessage());
            return null;
        }
    }

    public void deleteChatMessageStorage(String chatId) {
        try {
            System.out.println("deleteChatMessageStorage chatId = " + chatId);
            deleteTable(MESSAGE_ + chatId);
            deleteTable(FILES_ + chatId);
        } catch (Exception e) {
            System.out.println("----------------------------------------------- deleteChatMessageStorage: Ошибка " + e.getMessage());
        }
    }

    public ArrayList<String> getAllIdMessages(String chatId) {
        try {
            Statement statement = connection.createStatement();
            ResultSet names = statement.executeQuery("SELECT * FROM " + MESSAGE_ + chatId);
            ArrayList<String> result = new ArrayList<>();
            while (names.next()) {
                result.add(names.getString(ID));
            }
            statement.close();
            return result;
        } catch (Exception e) {
            System.out.println("----------------------------------------------- ERROR: getAllIdMessages " + e.getMessage());
            return null;
        }
    }

    public void addItemIntoList(String table, String columnToUpdate, String newValue, String pointColumn, String pointValue) {
        try {
            Statement statement = connection.createStatement();
            String oldValue = getValueFromTable(table, pointColumn, pointValue, columnToUpdate);
            if (oldValue != null && !oldValue.equals("")) {
                statement.executeUpdate("UPDATE '" + table + "' SET " + columnToUpdate + " = ('" + oldValue + "," + newValue + "') WHERE " + pointColumn + " = '" + pointValue + "'");
            } else {
                statement.executeUpdate("UPDATE '" + table + "' SET " + columnToUpdate + " = ('" + newValue + "') WHERE " + pointColumn + " = '" + pointValue + "'");
            }
            statement.close();
        } catch (Exception e) {
            System.out.println("----------------------------------------------- addItemIntoList: Ошибка " + e.getMessage());
        }
    }

    public void deleteItemFromList(String table, String columnToUpdate, String valueToDelete, String pointColumn, String pointValue) {
        try {
            Statement statement = connection.createStatement();
            String old_chats = getValueFromTable(table, pointColumn, pointValue, columnToUpdate);
            if (old_chats != null && !old_chats.equals("")) {
                ArrayList<String> chats = new ArrayList<>(Arrays.asList(old_chats.split(","))); // массив чатов
                if (chats.contains(valueToDelete)) {
                    chats.remove(valueToDelete); // новый список
                    String newValue = chats.toString()
                            .replace("[", "")
                            .replace('"', ' ')
                            .replace(" ", "")
                            .replace("]", "");
                    // удаляем из БД старый список
                    System.out.println("UPDATE '" + table + "' SET " + columnToUpdate + " =  ('') WHERE " + pointColumn + " = '" + pointValue + "'");
                    System.out.println("UPDATE '" + table + "' SET " + columnToUpdate + " = ('" + newValue + "') WHERE " + pointColumn + " = '" + pointValue + "'");
                    statement.executeUpdate("UPDATE '" + table + "' SET " + columnToUpdate + " =  ('') WHERE " + pointColumn + " = '" + pointValue + "'");
                    statement.executeUpdate("UPDATE '" + table + "' SET " + columnToUpdate + " = ('" + newValue + "') WHERE " + pointColumn + " = '" + pointValue + "'");
                }
            } else {
                System.out.println("----------------------------------------------- ERROR: deleteItemFromList: Список был пуст");
            }
            statement.close();
        } catch (Exception e) {
            System.out.println("----------------------------------------------- deleteItemFromList: Ошибка " + e.getMessage());
        }
    }

    public void deleteFromTable(String table, String column, String value) {
        try {
            Statement statement = connection.createStatement();
            statement.execute("DELETE FROM '" + table + "' WHERE " + column + " = '" + value + "'");
            statement.close();
        } catch (Exception e) {
            System.out.println("----------------------------------------------- ERROR in DeleteStringFromTable:  " + e.getMessage());
        }
    }

    public void addUserInChat(String chatId, String user) {
        addItemIntoList(chatId, USER, user, FLAG, "1");
        addItemIntoList(user, CHAT_LIST, chatId, FLAG, "1");
        setLastReadId(chatId, "", user);
    }

    public void deleteUserFromChat(String chatId, String users) {
        Arrays.stream(users.split(",")).forEach(user -> {
            if (user.equals(getValueFromTable(chatId, OWNER))) {
                updateValueInTable(chatId, OWNER, "", FLAG, "1");
            }
            deleteItemFromList(user, CHAT_LIST, chatId, FLAG, "1");
            deleteItemFromList(chatId, USER, user, FLAG, "1");
            updateValueInTable(user + "_" + LAST_READ_ID, ID, "", CHAT_ID, chatId);
        });
    }

    public void changeChatType(String chatId, String type) {
        if (type.equals(SIMPLE_CHAT)) {
            updateValueInTable(chatId, ADMINS, "", FLAG, "1");
        }
        updateValueInTable(chatId, TYPE, type, FLAG, "1");
    }

    // внесение данных в БД (имя и пароль)
    public void registerUser(String login, String password, String session) {
        try {
            Statement statement = connection.createStatement();
            statement.executeUpdate("INSERT or REPLACE into user (login, password, session) " +
                    "VALUES ('" + login + "','" + password + "','" + session + "')");
            statement.close();
        } catch (Exception e) {
            System.out.println("----------------------------------------------- ERROR addIntoUsersTable: " + e.getMessage());
        }
    }

    public void updateValueInTable(String table, String column_to_update, String update_data, String point_column, String data) {
        try {
            Statement statement = connection.createStatement();
            statement.executeUpdate("UPDATE '" + table + "' SET "
                    + column_to_update + " = ('" + update_data + "') WHERE " + point_column + " = '" + data + "'");
            statement.close();
        } catch (Exception e) {
            System.out.println("----------------------------------------------- ERROR: updateValueInTable " + e.getMessage());
        }
    }

    public void updateValueInTable(String table, String column_to_update, String update_data, String point_column1, String data1,
                                   String point_column2, String data2) {
        try {
            Statement statement = connection.createStatement();
            statement.executeUpdate("UPDATE '" + table + "' SET "
                    + column_to_update + " = ('" + update_data + "') WHERE " + point_column1 + " = '" + data1 + "' AND " + point_column2 + " = '" + data2 + "'");
            statement.close();
        } catch (Exception e) {
            System.out.println("----------------------------------------------- ERROR: updateValueInTable " + e.getMessage());
        }
    }

    private Integer countFolders() {
        try {
            Statement statement = connection.createStatement();
            return statement.executeQuery("SELECT * FROM folder").getFetchSize();
        } catch (Exception e) {
            return null;
        }
    }

    public Integer addNewFolder(String folderName) {
        try {
            Statement statement = connection.createStatement();
            int id = countFolders();
            statement.executeUpdate("INSERT INTO folder (id, name) VALUES (" + (id + 1) + ", " + folderName + ")");
            statement.close();
            return id+1;
        } catch (Exception e) {
            System.out.println("----------------------------------------------- ERROR: addNewFolder " + e.getMessage());
            return null;
        }
    }

    public ArrayList<String> getAllFoldersByUser(String login){
        try {
            Statement statement = connection.createStatement();
            ResultSet names = statement.executeQuery("SELECT folder FROM " + USER_CHAT + " WHERE user = " + login);
            ArrayList<String> result = new ArrayList<>();
            while (names.next()) {
                result.add(names.getString(ID));
            }
            statement.close();
            return result;
        } catch (Exception e) {
            System.out.println("----------------------------------------------- ERROR: getAllFoldersByUser " + e.getMessage());
            return null;
        }
    }

    public ArrayList<String> getAllChatsInFolder(String login, String folder){
        try {
            Statement statement = connection.createStatement();
            ResultSet names = statement.executeQuery("SELECT chat FROM " + USER_CHAT + " WHERE user = " + login + " AND folder = " + folder);
            ArrayList<String> result = new ArrayList<>();
            while (names.next()) {
                result.add(names.getString(ID));
            }
            statement.close();
            return result;
        } catch (Exception e) {
            System.out.println("----------------------------------------------- ERROR: getAllFoldersByUser " + e.getMessage());
            return null;
        }
    }

    public ArrayList<String> getAllUserNames() {
        try {
            Statement statement = connection.createStatement();
            ResultSet names = statement.executeQuery("SELECT name FROM users");
            ArrayList<String> result = new ArrayList<>();
            while (names.next()) {
                result.add(names.getString(NAME));
            }
            statement.close();
            return result;
        } catch (Exception e) {
            System.out.println("----------------------------------------------- ERROR: GetAllUserNames: Не удалось получить имена юзеров  " + e.getMessage());
            return null;
        }
    }

    public String getAllUserNamesAsString() {
        try {
            return getAllUserNames().toString().replace(" ", "").replace("[", "").replace("]", "");
        } catch (Exception e) {
            System.out.println("----------------------------------------------- ERROR: getAllUserNamesAsString: Не удалось получить имена юзеров  " + e.getMessage());
            return null;
        }
    }

    public void deleteChat(String chatId) {
        try {
            Statement statement = connection.createStatement();
            System.out.println("DROP TABLE '" + chatId + "'");
            statement.execute("DROP TABLE '" + chatId + "'");
            deleteChatMessageStorage(chatId);
            statement.close();
        } catch (Exception e) {
            System.out.println("----------------------------------------------- DeleteChat: Ошибка при удалении чата " + e.getMessage());
        }
    }

    public void deleteTable(String tableName) {
        try {
            Statement statement = connection.createStatement();
            System.out.println("DROP TABLE '" + tableName + "'");
            statement.execute("DROP TABLE '" + tableName + "'");
            statement.close();
        } catch (Exception e) {
            System.out.println("----------------------------------------------- deleteTable: Ошибка при удалении таблицы " + e.getMessage());
        }
    }

    public void renameTable(String oldName, String newName) {
        try {
            Statement statement = connection.createStatement();
            if (!oldName.equals(newName)) {
                statement.execute("ALTER TABLE '" + oldName + "' RENAME TO '" + newName + "';");
            }
            statement.close();
        } catch (Exception e) {
            System.out.println("----------------------------------------------- ERROR: RenameTable: не удалось переименовать таблицу  " + e.getMessage());
        }
    }

    public void createLastReadMessageIdTables(String usersInChat) {
        try {
            Statement statement = connection.createStatement();
            Arrays.stream(usersInChat.split(",")).forEach(user -> {
                try {
                    statement.execute("create table '" + user + "_" + LAST_READ_ID + "' (" +
                            CHAT_ID + " TEXT PRIMARY KEY NOT NULL,\n" +
                            ID + " TEXT);");
                } catch (SQLException throwables) {
                    throwables.printStackTrace();
                }
            });
            statement.close();
        } catch (Exception e) {
            System.out.println("----------------------------------------------- ERROR: createLastMessageIdTables: " + e.getMessage());
        }
    }

    public void setLastReadId(String chatId, String messageId, String userName) {
        try {
            Statement statement = connection.createStatement();
            System.out.println("chatId = " + chatId + " messageId = " + messageId);
            System.out.println("INSERT or REPLACE into '" + userName + "_" + LAST_READ_ID + "' ('" + CHAT_ID + "','" + ID + "') values ('" + chatId + "','" + messageId + "')");
            statement.executeUpdate("INSERT or REPLACE into '" + userName + "_" + LAST_READ_ID + "' ('" + CHAT_ID + "','" + ID + "') values ('" + chatId + "','" + messageId + "')");
            statement.close();
        } catch (Exception e) {
            System.out.println("----------------------------------------------- ERROR: setLastReadId: " + e.getMessage());
        }
    }

    public String getLastReadId(String chatId, String userName) {
        return getValueFromTable(userName + "_" + LAST_READ_ID, CHAT_ID, chatId, ID);
    }
}