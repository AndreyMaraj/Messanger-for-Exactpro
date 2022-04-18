// Работка с файлами 
export default class Files{

    public static LoadFiles(event: any): void{
        const reader: FileReader = new FileReader()
        reader.addEventListener("load", ()=>{
            var file: string | undefined = reader.result?.toString()
            if(file){
                
            }
            return file
        })
        reader.onerror = (error) => {
            console.log('Error: ' + error)
        }
        reader.readAsDataURL(event.target.files[0])
    }

}