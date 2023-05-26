/**
 * base64, file, blob, arrayBuffer, canvas 互转
 */
declare class StreamConversion {

    /**
     * @param streamData 流数据对象
     * @param fileName 自定义的文件名, 注意: 要带文件后缀的文件名
     */
    constructor(streamData: any, fileName: any);

    /**
     * 获取 File 对象
     * @return File
     */
    getFile(): File;

    /**
     * 获取 Blob 对象
     * @return Blob
     */
    getBlob(): Blob;

    /**
     * 获取 ArrayBuffer 对象
     * @return ArrayBuffer
     */
    getArrayBuffer(): ArrayBuffer;

    /**
     * 获取 dataURL (即 base64) 字符串
     * @return String
     */
    getDataURL(): String;

    /**
     * Canvas 转 dataUrl (即 base64) 字符串
     * @param canvas 
     */
    static canvasToDataUrl(canvas: any): String;

    /**
     * dataUrl(base64) 转 image
     * @param dataUrl 
     * @return 
     */
    static dataURLtoImage(dataUrl: String): any;

    /**
     * image 对象转 Canvas
     * @param ctx 
     * @param documentElement 
     * @param x 
     * @param y 
     * @param width 
     * @param height 
     */
    static imageTocanvas(ctx: any, documentElement: any, x: any, y: any, width: any, height: any): void;

    /**
     * Canvas 转 Blob
     * @param canvas 
     * @return
     */
    static canvasToblob(canvas: Object): Blob;

    /**
     * Blob 或 File 转 dataUrl (即 base64) 字符串
     * @param paramsObj 
     * @return
     */
    static blobORfileTodataURL(paramsObj: Blob | File): String;

    /**
     * Blob 或 File 转 ArrayBuffer
     * @param paramsObj 
     * @return  
     */
    static blobORfileToAffter(paramsObj: Blob | File): ArrayBuffer;

    /**
     * Blob 或 File 转 text 文本
     * @param paramsObj 
     * @return  
     */
    static blobORfileToText(paramsObj: Blob | File): String;

    /**
     * dataUrl (即 base64) 字符串 转 File
     * @param dataurl 
     * @param filename 
     */
    static dataURLtoFile(dataurl: String, filename: String): File;

    /**
     * dataUrl (即 base64) 字符串 转 Blob
     * @param dataurl 
     */
    static dataURLtoBlob(dataurl: String): Blob;

    /**
     * dataUrl (即 base64) 字符串 转 ArrayBuffer
     * @param base64 
     * @return  
     */
    static dataURLToArrayBuffer(base64: String): ArrayBuffer;

    /**
     * Blob 转 File
     * @param blob 
     * @param filename 
     */
    static blobToFile(blob: any, filename: any): File;

    /**
     * File 转 Blob
     * @param file 
     */
    static fileToBlob(file: any): Blob;

    /**
     * ArrayBuffer 转 Blob
     * @param arrayBuffer 
     */
    static arrayBufferToBlob(arrayBuffer: ArrayBuffer): Blob;

    /**
     * ArrayBuffer 转 File
     * @param arrayBuffer 
     * @param filename 
     */
    static arrayBufferToFile(arrayBuffer: ArrayBuffer, filename: String): File;

    /**
     * ArrayBuffer 转 dataUrl (即 base64) 字符串
     * @param buffer 
     */
    static arrayBufferToDataURL(buffer: ArrayBuffer): String;
}

export default StreamConversion;