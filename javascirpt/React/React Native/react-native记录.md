## 其他

### Exp 

exp发送的链接在iphone中需要用safari打开才会跳转到exp app.

### 模拟器

应该先打开模拟器，因为可能，程序无法主动打开模拟器。

如果安卓的打开了，还是不行，有可能是这个模拟器不行，一定要使用官网文档中建议使用的安卓模拟器。

## 报错处理

### 错误一

运行`react-native run-ios`，如果报下面的错误：

```sh
Command failed: /usr/libexec/PlistBuddy -c Print:CFBundleIdentifier build/Build/Products/Debug-iphonesimulator/AwesomeProject.app/Info.plist
Print: Entry, ":CFBundleIdentifier", Does Not Exist
```

有三种尝试处理：

> 可以先删掉ios文件夹下的build文件夹，避免可能的影响，build文件夹初始化是没有的。

- 尝试看下端口有没有占用

  ```sh
  sudo lsof -n -i4TCP:8081
  #sudo lsof -i :8081
  kill -9 7601 #kill -9 pid
  ```

- 尝试`sudo react-native run-ios` `

- 尝试`react-native upgrade`升级试试。

### 错误二

```sh
Runtime is not ready for debugging! 
```

![](https://cloud.githubusercontent.com/assets/15122958/14065057/460ea9fa-f444-11e5-885c-1216dff0c80b.png)

看这里https://github.com/facebook/react-native/issues/6682
我发现按照上面的处理还是，有时会有问题，尝试stop remote debugging，start remote debugging，停止后重新打开就ok了，如果还出现，dimiss，然后使用reaload js，而不是refresh。

### 错误三

```sh
Incremental java compilation is an incubating feature.
File /Users/Sam/.android/repositories.cfg could not be loaded.

FAILURE: Build failed with an exception.
```

尝试

```sh
touch ~/.android/repositories.cfg
```

## 问题

### KeyboardAvoidingView no working on Android

> I was using expo (24.0.0) and my code was working fine. Than I had to move away from expo (for many reasons) and created a new vanilla react-native (0.51.0) project and I started to get this problem. (I did not change my javascript code at all, weird...)
>
> **Edit:**
> In `AndroidManifest.xml`, changing `android:windowSoftInputMode="adjustResize"`, to `android:windowSoftInputMode="adjustPan"` solved the issue for me.

### 生成安卓Apk问题

使用-x ./gradlew assembleRelease -x bundleReleaseJsAndAssets可以生成，否则可能会报错

```sh
./gradlew assembleRelease -x bundleReleaseJsAndAssets
```

