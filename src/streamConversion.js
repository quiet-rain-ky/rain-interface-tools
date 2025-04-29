/**
 * @author   作者: Rain
 * @date 创建于 2023年 02月25日  11:23:35  星期六
 * @file_path  文件磁盘路径: E:\repository\rain-interface-tools\src\streamConversion.js
 * @file_path  文件项目路径: src\streamConversion.js
 * @description 流转换对象
 */
import rain_logs from "./logs.js";

// base64, file, blob, arrayBuffer, canvas 互转
export default class StreamConversion {
    // Canvas 转 DataURL
    static canvasToDataUrl(canvas) {
        return canvas.toDataUrl("image/png");
    }

    // DataURL 转 Image(即file)
    static dataURLtoImage(dataUrl) {
        return (new Image().src = dataUrl);
    }

    // Image 转 canvas (即把图片渲染到 传入的 ctx [即 canvas 的] 操作对象中), 此函数没有返回值
    static imageTocanvas(ctx, imageElement, x, y, width, height) {
        ctx.drawImage(imageElement, x, y, width, height); // 截取视频中的片段, 参数: (imageElement, x, y, width, height)
    }

    // canvas 转 blob
    static canvasToblob(canvas) {
        return new Promise((resolve, reject) => {
            canvas.toBlob((blob) => {
                resolve(blob);
            });
        });
    }

    // blob 转 file
    static blobToFile(blob, filename) {
        return new File([blob], filename, { type: blob.type });
    }

    // blob 字符串路径 转 Blob
    static blobStrUrlToBlob(blobStr) {
        return new Promise((resolve, reject) => {
            fetch(blobStr).then((res) => {
                res.blob()
                    .then((blob) => {
                        resolve(blob);
                    })
                    .catch((err) => {
                        reject(err);
                    });
            });
        });
    }

    // FileReader 对象读取 blob||File 转 " DataURL base64
    static blobORfileTodataURL(paramsObj) {
        return new Promise((resolve, reject) => {
            let h = new FileReader();
            h.readAsDataURL(paramsObj);
            h.onloadend = () => {
                // blob 字节流, 读取结束时触发事件
                resolve(h.result); // 获取 FileReader 对象读取 blob 并转成 " DataUrl base64 " 的字符串
            };
        });
    }

    // blob 或 File 对象 转 affter
    static blobORfileToAffter(paramsObj) {
        return new Promise((resolve, reject) => {
            let h = new FileReader();
            h.readAsArrayBuffer(paramsObj);
            h.onloadend = () => {
                // blob 字节流, 读取结束时触发事件
                resolve(h.result); // 获取 FileReader 对象读取 blob 并转成 readAsArrayBuffer 的字节流
            };
        });
    }

    // base64 转 file
    static dataURLtoFile(dataurl, filename) {
        var arr = dataurl.split(","),
            mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]),
            n = bstr.length,
            u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, { type: mime });
    }

    // base64 转 blob
    static dataURLtoBlob(dataurl) {
        var arr = dataurl.split(","),
            mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]),
            n = bstr.length,
            u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
    }

    // base64 转 ArrayBuffer
    static dataURLToArrayBuffer(base64) {
        const binaryStr = window.atob(base64.replace(/^data:image\/(png|jpeg|jpg);base64,/, ""));
        const byteLength = binaryStr.length;
        const bytes = new Uint8Array(byteLength);
        for (let i = 0; i < byteLength; i++) {
            bytes[i] = binaryStr.charCodeAt(i);
        }
        return bytes.buffer;
    }

    // file 转 blob
    static fileToBlob(file) {
        return new Blob([file], { type: file.type });
    }

    // ArrayBuffer 字节流 转 File 对象
    static arrayBufferToFile(arrayBuffer, filename) {
        return new File([arrayBuffer], filename, { type: "application/json; charset-UTF-8" });
    }

    // ArrayBuffer 字节流 转 Blob 对象
    static arrayBufferToBlob(arrayBuffer) {
        return new Blob([arrayBuffer], { type: "application/json; charset-UTF-8" });
    }

    // ArrayBuffer 字节流 转 base64 对象
    static arrayBufferToDataURL(buffer) {
        //第一步，将ArrayBuffer转为二进制字符串
        var binary = "";
        var bytes = new Uint8Array(buffer);
        for (var len = bytes.byteLength, i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        //将二进制字符串转为base64字符串
        return btoa(binary);
    }

    // blob 或 File 对象 转 字符串文本
    static blobORfileToText(paramsObj) {
        return new Promise((resolve, reject) => {
            let h = new FileReader();
            h.readAsText(paramsObj);
            h.onloadend = () => {
                // blob 字节流, 读取结束时触发事件
                resolve(h.result); // 获取 FileReader 对象读取 blob 并转成 readAsText 的字符串
            };
        });
    }

    constructor(streamData, fileName) {
        if (fileName == null || fileName == undefined) {
            rain_logs.ERROR("对象创建失败, 没有传入 fileName");
            return;
        }
        this.streamData = streamData;
    }

    // 获取 File 对象
    getFile(streamData = this.streamData) {
        if (this.fileObj != null && this.fileObj != undefined) {
            return this.fileObj;
        } else {
            if (streamData instanceof File) {
                this.fileObj = streamData;
            } else if (streamData instanceof Blob) {
                this.fileObj = StreamConversion.blobToFile(streamData, fileName);
            } else if (streamData instanceof ArrayBuffer) {
                this.fileObj = StreamConversion.arrayBufferToFile(streamData, fileName);
            } else if (streamData instanceof String || typeof streamData === "string") {
                this.fileObj = StreamConversion.dataURLtoFile(streamData, fileName);
            } else {
                rain_logs.WARN("不支持此流媒体转换", streamData);
                return null;
            }
            return this.fileObj;
        }
    }

    // 获取 Blob 对象
    getBlob(streamData = this.streamData) {
        if (this.blobObj != null && this.blobObj != undefined) {
            return this.blobObj;
        } else {
            if (streamData instanceof File) {
                this.blobObj = StreamConversion.fileToBlob(streamData);
            } else if (streamData instanceof Blob) {
                this.blobObj = streamData;
            } else if (streamData instanceof ArrayBuffer) {
                this.blobObj = StreamConversion.arrayBufferToBlob(streamData);
            } else if (streamData instanceof String || typeof streamData === "string") {
                this.blobObj = StreamConversion.dataURLtoBlob(streamData);
            } else {
                rain_logs.WARN("不支持此流媒体转换", streamData);
                return null;
            }
            return this.blobObj;
        }
    }

    // 获取 ArrayBuffer 对象
    getArrayBuffer(streamData = this.streamData) {
        if (this.ArrayBufferObj != null && this.ArrayBufferObj != undefined) {
            return this.ArrayBufferObj;
        } else {
            if (streamData instanceof File) {
                this.ArrayBufferObj = StreamConversion.blobORfileToAffter(streamData);
            } else if (streamData instanceof Blob) {
                this.ArrayBufferObj = StreamConversion.blobORfileToAffter(streamData);
            } else if (streamData instanceof ArrayBuffer) {
                this.ArrayBufferObj = streamData;
            } else if (streamData instanceof String || typeof streamData === "string") {
                this.ArrayBufferObj = StreamConversion.dataURLToArrayBuffer(streamData);
            } else {
                rain_logs.WARN("不支持此流媒体转换", streamData);
                return null;
            }
            return this.ArrayBufferObj;
        }
    }

    // base64 字符串
    getDataURL(streamData = this.streamData) {
        if (this.DataURLString != null && this.DataURLString != undefined) {
            return this.DataURLString;
        } else {
            if (streamData instanceof File) {
                this.DataURLString = StreamConversion.blobORfileTodataURL(streamData);
            } else if (streamData instanceof Blob) {
                this.DataURLString = StreamConversion.blobORfileTodataURL(streamData);
            } else if (streamData instanceof ArrayBuffer) {
                this.DataURLString = StreamConversion.arrayBufferToDataURL(streamData);
            } else if (streamData instanceof String || typeof streamData === "string") {
                this.DataURLString = streamData;
            } else {
                rain_logs.WARN("不支持此流媒体转换", streamData);
                return null;
            }
            return this.DataURLString;
        }
    }
}
