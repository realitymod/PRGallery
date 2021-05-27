
export class UrlUtils  {

    public static ArrayFromUrl<T>(data: string): T[]
    {
        if(!data || data.length == 0) { return []; }

        return <T[]> <unknown>data.split(',');
    }

    public static ArrayToUrl<T>(data: T[]): string
    {
        if(!data || data.length == 0) {return undefined;}
        
        var param = "";
        for(var element of data)
        {
            param += element;
            param += ',';
        }
        return param.substring(0, param.length - 1);
    }
}