// @ts-ignore
import OSS from 'ali-oss'

export async function filePutBlob(fileToken: FileToken, file: File, storeName: string) {
    let client = new OSS({
        accessKeyId: fileToken.AccessKeyId,
        accessKeySecret: fileToken.AccessKeySecret,
        bucket: 'metaknew',
        region: 'oss-cn-beijing',
        stsToken: fileToken.SecurityToken
    });

    return client.put(
        storeName,
        file
    )
}
