export const MB = 1000000

export function fileHandle (file, size, formats, pool) {
  let status = true
  let reason = ''
  let fileName = ''
  let fileFormat = ''
  // 文件是否存在
  if (!file) {
    status = false
    reason = '文件上传失败'
  } else {
    // 文件名检查
    let name = file.name.split('.')
    if (name.length !== 2) {
      status = false
      reason = '文件名不合法，存在多个 .'
    } else {
      fileName = name[0]
      fileFormat = name[1].toLowerCase()
      // 格式检查
      if (!checkExist(formats, fileFormat)) {
        status = false
        reason = '文件格式不符合要求'
      } else {
        // 文件池检查
        if (checkExist(pool, file.name)) {
          status = false
          reason = '已经有同名文件存在于文件集合中'
        } else {
          // 文件名检查
          if (fileName === '') {
            status = false
            reason = '文件名不能为空'
          } else {
            let reg = new RegExp('[\\\\:*?"<>|]')
            if (reg.test({ vm: fileName })) {
              status = false
              reason = '文件名包含非法字符'
            }
          }
        }
      }
    }
  }

  if (status) {
    file.status = true
    file.reason = ''
    file.fileName = fileName
    file.fileFormat = fileFormat
    file.hasAlert = false
    file.hasResolve = false
    return file
  } else {
    file.status = status
    file.reason = reason
    file.fileName = 'unknown'
    file.fileFormat = 'unknown'
    file.hasAlert = false
    file.hasResolve = false
    return file
  }
}

export const checkExist = (arr, item) => arr.indexOf('$_any') > -1
  ? true
  : arr.indexOf('$_none') > -1
    ? false
    : arr.indexOf(item) > -1

export function getColor (bool) {
  let status = ''
  bool ? (status = 'success') : (status = 'error')
  return status
}

export const checkDuplicate = (arr, checkItem) => arr.filter(item => item === checkItem).length >= 2
