// Работка с куками браузера
export default class Cookie{

    // Добавление куки
    public static Set(key: string, value: string): void{
        document.cookie = key + "=" + value
    }

    // Берем значение из куки
    public static Get(key: string): string | null{
        var results = document.cookie.match ( '(^|;) ?' + key + '=([^;]*)(;|$)' )
        return results ? unescape(results[2]) : null
    }
    
    // Удаление значения куки 
    public static Clear(key: string): void{
        var cookies = document.cookie.split(";")
        for (var i = 0; i < cookies.length; i++){
            var cookie = cookies[i]
            var eqPos = cookie.indexOf("=");
            var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie
            if(key === name){
                document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT"
            }
        }
    }

    // Удаление всех куки 
    public static ClearAll(): void{
        var cookies = document.cookie.split(";")
        for (var i = 0; i < cookies.length; i++){
            var cookie = cookies[i]
            var eqPos = cookie.indexOf("=");
            var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie
            document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT"
        }
    }
}