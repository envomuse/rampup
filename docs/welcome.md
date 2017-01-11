# sic3中使用的客户端shell  
## 功能  
1. 打开某个url
2. refresh当前url
3. 关闭webview
4. 链接报警


## ioPackage接入指南  
在你的页面中引入该链接  
```
  <script src="http://localhost:3000/static/ioPackage.bundle.js"></script>
```

## ioPackage SDK使用方法    
1. 需要进行初始化，注入你申请的命令，比如‘GOT’    
2. 监听事件  
    - gSockIO.ioRegister
    - gSockIO.ioUnregister
    - gSockIO.ioCmd: 广播指令
3. 事件类型
    - msg
    - join
    - left
    - groupInfo
4. 获得组信息和组成员信息
    - getGroupInfo()
5. 组内发送广播
    - ioCmd(msg)
6. 更新group的meta信息，meta信息会保存在服务器
    - updateGroupMeta(deltaMeta, extraInfo)
    - deltaMeta会和原有的group meta信息合并
    - extraInfo只会广播，不会存储在服务器

```
  const gSockIO = ioPackage.init('GOT', 'yourNickName', (groupInfo)=> (groupInfo.meta) );]
  gSockIO.ioRegister(data => {
    console.log('receive data:', data.type, data.data);
     // type can be ['join', 'left', 'msg', 'meta']
    ...
  });
  gSockIO.ioCmd('myOwnData')
  gSockIO.updateGroupMeta('myOwnData')
``` 
