# go笔记

本人在mac下学习go，所有环境和相关都是和windows无关，windows是否可行并未知。

go参考了很多语言的语法，定义了一套简单使用的语法，学起来会简单很多，同时环境搭建也简单多了。

GO语言没有老一代语言的缺点，整合了一些新语言的优点，再加上一些新特性。

## 环境安装

环境中最重要的就是`GOPATH`，`GOPATH`是go语言中跟工作空间相关的环境变量，这个变量指定go语言的工作空间位置，所有的go项目都必须在`$GOPATH/src`的目录下开发。

`GOPATH`一般包含以下三个目录：

```sh
.
├── bin #go可这行文件目录，项目中go install会安装到这里
├── pkg 
└── src #依赖包项目和自己的项目都放在这个目录
```

一般我们都只管src目录下的项目就ok了。

设置模板：

```sh
$ export GOPATH=你的工作空间路径
$ export PATH=$PATH:$GOPATH/bin
```

需要安装上面在`./.bashrc`或者`./.zshrc`设置`GOPATH`和go可执行目录。

本人的设置如下：

```sh
export GOPATH_1=$HOME/go
export GOPATH_2=$HOME/go-project 
export GOPATH=$GOPATH_1:$GOPATH_2
export PATH=$PATH:$GOPATH_1/bin:$GOPATH_2/bin 
```

我这里设置了两个`GOPATH`，一个是默认的`GOPATH`通过`go get`安装的依赖包都是安装在第一个`GOPATH`，这个目录的依赖包最好只安装GO工具包。而项目依赖包会使用go依赖管理工具去安装在当前的项目的vendor目录下，需要了解go依赖管理工具。

### vscode go插件安装

vscode go插件安装会有部分不成功的，需要手动安装。

安装[go插件](https://marketplace.visualstudio.com/items?itemName=ms-vscode.Go)，然后保存.go文件vscode会提示缺少依赖安装包，这就是需要手动安装了。

手动安装步骤：

- 第一步，在第一个`%GOPATH%/src/golang.org/x`目录下`git clone http://github.com/golang/tools`到当前x目录下，如果没有此目录，需要新建。
- 第二步，进入`%GOPATH%/src/golang.org/x/tools/cmd/gorename`，运行`go install`安装gorename到`%GOPATH%/bin`目录，请确保bin目录有gorename文件才是成功。
- 第三步，进入`%GOPATH%/src/golang.org/x/tools/cmd/go-symbols`，运行`go install`安装gorename到`%GOPATH%/bin`目录，请确保bin目录有go-symbols文件才是成功。
- 第四步，在`%GOPATH%/src/golang.org/x`目录下安装lint，`git clone github.com/golang/lint `进入`%GOPATH%/src/golang.org/x/lint/golint`目录`go install`请确保bin目录有golint文件才是成功。

至此就完成了，如果还有提示没安装的，可以安装第二第三部的方法处理，进入cmd的的目录或者tool的其他目录看看有没有对应的依赖。

## go依赖管理

go依赖管理并没有那么先进，特别是版本控制方面。

网上比较常用的go依赖管理工具如下：

- #### godep

  [godep](https://github.com/tools/godep)的使用者众多，如docker，kubernetes， coreos等go项目很多都是使用godep来管理其依赖，当然原因可能是早期也没的工具可选。

- dep

  [dep](https://github.com/golang/dep)是一个比较新的依赖管理工具，它计划成为Go的标准工具。

- glide

  [glide](https://github.com/Masterminds/glide)也是在vendor之后出来的。glide的依赖包信息在glide.yaml和glide.lock中，前者记录了所有依赖的包，后者记录了依赖包的版本信息。

- gvt

  glide/godep/govendor都只会拉import的依赖包，对于依赖包的依赖包则不会管。这种情况可以用gvt把所有的依赖全部拉到vendor目录下。是不是很酸爽，但对于解决golang.org库无法访问的问题还是很有帮助的，并且也可以拉平团队使用的**所有**依赖包。

本人推荐使用glide，因为这个比较符合大众，如官网所说：

> Are you used to tools such as Cargo, npm, Composer, Nuget, Pip, Maven, Bundler, or other modern package managers? If so, Glide is the comparable Go tool.

## 特性和异同

### 数据类型

- 基础类型
  - number(数字)
  - string(字符串)
  - boolean(布尔型)
- 聚合类型
  - array(数组)
  - struct(结构体)
- 引用类型
  - pointer(指针)
  - slice(切片)
  - map(散列)
  - function(函数)
  - channel(通道)
- 接口类型

### 函数

#### 函数参数

每个传入的函数参数都是**创建一个副本**，所以函数参数不是原始传进了的值，对参数的修改也不会影响原先的值。这个是跟其他语言不一样的，如其他语言数组参数是`隐式引用传递`，数组参数某项被修改，原始值也会被修改。

所以为了更高效，一些复杂的参数，最好使用**引用类型**参数进行传递，这样参数就可以修改原始值。

**只要参数是引用类型，参数的修改都会影响原值**。

没有函数体的函数是用go以外的语言实现的，如：

```go
func Sin(x float64) float64 //使用汇编语言实现的。
```

**GO的函数调用栈使用了可变长度栈，可达1GB左右上限，所有GO基本不用担心递归函数溢出问题。**

GO函数可以返回多个返回值

```go
func test() (int,string) {
  x := 2
  y := "test"
  return x,y
}
```

#### 函数变量

这个用法跟javascript的函数变量有点类似。

#### 匿名函数

`匿名函数`只能在包级别的作用域中进行声明，但我们能够在使用函数字面量在任何表达式内指定函数变量（跟javascript的匿名函数也挺类似）。

```go
//return了一个匿名函数
func squares(x int) func() int {
  return func() int {
    x++
    return x * x
  }
}
```

有匿名函数自然有`闭包`这个概念了（javascript程序员会特别熟悉），上面的例子就是闭包，返回的匿名函数还可以访问上层的局部变量`x`。

当一个匿名函数需要递归的时候，必须定义一个变量，然后将匿名函数赋值给这个变量。

```go
//test := func(x int) int {//如果这样定义，这里面是无法访问test变量的，所以要拆分}
var test func(int) int
test = func(x int) int {
  if x == 16 {
    return x
  }
  return test(x * x)
}
fmt.Println(test(2))
```

不过不用担心，如果编辑器有golint插件，这个是会报语法错误的。

#### 变长函数

`变长函数`就是被调用的时候可以有可变参数个数。最令人熟知的例子就是`fmt.Printf`了，`Printf`需要开头提供一个固定的参数，后续便可以接受任意数目的参数。

`变长函数`的关键操作符`...`:

```go
test := func(params ...int) []int {
  return params
}
fmt.Println(test(22, 33)) //输出[22 33]
values := []int{22,33}
fmt.Println(test(values...))//输出[22 33]，这个是有`...`在后面了。
```

尽管`..int`像slice，但是`变长函数`的类型和一个带有普通slice参数的函数类型是不同的

```go
func f(...int){}
func g([]int){}
fmt.Printf("%T\n",f) //"func(...int)"
fmt.Printf("%T\n",g) //"func([]int)"
```

#### 延迟函数调用(defer)

`defer`语句在return语句之后执行，并且可以更新函数的结果变量。`defer`语句经常用于成对操作，比如打开和关闭，连接和断开，加锁和解锁，即使再复杂的控制流，资源在任何情况下都能正常释放。

不要在循环语句中，这行`defer`语句。

```go
for _,filename := range filenams {
  f,err := os.Open(filename)
  if err != nil {
    return err
  }
  defer f.Close()
  //这样是没有文件关闭的
}
```

需要改成这样，把`defer`语句放进函数里：

```go
func doFile(filename) error {
  f,err := os.Open(filename)
  if err != nil {
    return err
  }
  defer f.Close()
}
for _,filename := range filenams {
  if err := doFile(filename); err != nil {
  	return err
  }
}
```

### 方法

这个比较特别，方法的生命和普通函数类似，只是在函数名字前面多了一个参数，这个参数把这个方法绑定到这个参数对应的类型上。

这种用法就是面向对象（OOP）的思想（Go是没有类这个概念的），好像没有类方便。

**Go和许多其他面向对象的语言不同，它可以将方法版本定在任何类型上**。同一个包下的任何类型都可以声明方法，只要它的类型既不是指针类型也不是接口类新。

类型相同的所有方法必须是唯一的，但是不同类型的方法可以使用相同的方法名。

```go
package main

import (
	"fmt"
	"math"
)

func main() {
	p := Point{1, 2}
	q := Point{4, 6}
	fmt.Println(distance(p, q)) //输出"5",函数调用
	fmt.Println(p.distance(q))  //输出"5"，Point类型方法调用，这样的用法就是面向对象思想。
	perim := Path{
		{1, 1},
		{5, 1},
		{5, 4},
		{1, 1},
	}
	fmt.Println(perim.distance()) //输出"12"，这个是[]Point类型的方法调用
}

// Point test
type Point struct{ X, Y float64 }

//普通函数定义，包级别的函数
func distance(p, q Point) float64 {
	return math.Hypot(q.X-p.X, q.Y-p.Y)
}

//方法定义，point类型方法。
func (p Point) distance(q Point) float64 {
	return math.Hypot(q.X-p.X, q.Y-p.Y)
}

// Path 连接过个点的直线段
type Path []Point

// distance方法返回路径长度
func (path Path) distance() float64 {
	sum := 0.0
	for i := range path {
		if i > 0 {
			sum += path[i-1].distance(path[i])
		}
	}
	return sum
}
```

### 零值

零值就是默认值（定义而不赋值的默认值）

- 数值类型为 `0`
- 布尔类型为 `false`
- 字符串为 `""`（空字符串）

其他的数据类型零值为`nli`，复合类型的子项也遵循零值默认值（如array、maps）。

```go
bool      -> false                              
numbers -> 0                                 
string    -> ""      
array -> nil
pointers -> nil
slices -> nil
maps -> nil
channels -> nil
functions -> nil
interfaces -> nil
```

### slice

> slice是引用类型

`slice`表示一个拥有相同类型元素的可变长度序列（可以用其他语言数组剪切slice方法来理解）

适用于数组、字符串。

`slice`有三个属性：指针、长度(len)、和容量(cap)，**slice本身已经是一个引用类型，所以它本身就是一个指针**。

两种定义slice方式

```go
s := []int{5, 6, 7, 8, 9} //没有指定数组长度
// s := [5]int{5, 6, 7, 8, 9} //指定数组长度的是数组
```

```go
s := [5]int{5, 6, 7, 8, 9}  //数组
s2 := s[:] //s[begin:end] begin和end可以空，默认值为0和len(s)
```

数组：

```go
test := [...]int{1,2,3,4,5,6,7}
fmt.Println(test[3:5]) //输出值为[4,5]
```

字符串

```go
test := "hello world"
fmt.Println(test[6:]) //输出值为 world，右边值留空默认使用数组cap长度。
```

`slice操作符`虽然是`[]`但是却是**左闭右开**。

> slice是无法作比较的，因此不能使用`==`（除了和`nil`作比较）。

### map

> map是引用类型

map必须初始化才可以设置元素：

下面会报错：

```go
var ages2 map[string]int
ages2["test"] = 22 //会报错
```

这样才不会报错

```go
var ages2 = map[string]int{} //初始化
ages2["test"] = 22 //会报错
```

map的具体项是不能获取地址的，即不可以使用`&`语法。

```go
ages := map[string]int {
  "alice": 31,
  "charlie": 22,
}
_ = ages //这样是正确的
_ = &ages["alice"] // 编译错误，无法获取map元素的地址
```

判断map元素是否存在

```go
ages := map[string]int {
  "alice": 31,
  "charlie": 22,
}
age, ok := ages["blob"] //通过这种方式访问map元素输出的两个值，第二个是boolean值，用来报告该元素是否存在
if !ok {/**/}
```

map也是不可比较的（处理和nil比交）。

### struct

如果结构体的所有成员变量都可比较，那么这个结构体也是可以比较的。

```go
type Point struct {
  x,y int
}
p := Point{1,2}
q := Point{2,1}
fmt.Println(p == q) //false
```

和其他可比较的类型一样，**可比较**的结构体都可以作为map的键类型：

```go
type address struct {
  hostname string
  port     int
}
hits := make(map[address]int)
hits[address{"golang.org",443}]++
```

#### 嵌套和匿名成员

Go允许我们定义不带名称的结构体成员，只需指定类型即可；这种结构体成员称为**匿名成员**。

**匿名成员类型必须是一个命名类型或者指向命名类型的指针**。

> 匿名成员有个限制，就是不能在同一个结构体中定义两个相同类型的匿名成员，如果要使用两个相同类型的成员，就不能用匿名成员了。

通过匿名成员方面结构体变量可以省略大串中间变量，例子如下：

```go
type Point struct {
  X, Y int
}
type Circle struct {
  Point  //匿名成员，不带名称的结构体成员
  Radius int
}
type Wheel struct {
  Circle //匿名成员，不带名称的结构体成员
  Spokes int
}
var w Wheel
w.X = 8      //等价于w.Circle.Point.X = 8
w.Y = 8      //等价于w.Circle.Point.Y = 8
w.Radius = 8 //等价于w.Circle.Radius = 8
w.Spokes = 8
//注意副词#如何使得Printf的格式符号%v以类似go语言的方式输出对象
fmt.Printf("%#v\n", w)
```

但是没有上面的快捷方式初始化结构体，所以下面的语句是无法编译通过的：

```go
w := Wheel{8,8,8,8} //编译出错，未知成员变量
w := Wheel{X: 8,Y: 8,Radius: 8,Spokes: 8} //编译出错，未知成员变量
```

所以结构体字面量必须遵循类型定义，下面两种方式初始化是可以的：

```go
w := Wheel{Circle{Pointer{8,8},5},20}
//或者
w := Wheel{
  Circle: Circle{
    Point: Point{
      X: 8,
      Y: 8,
    },
    Radius: 5,
  },
  Spokes: 20,
}
```

### JSON

#### map转JSON

```go
s := []map[string]interface{}{}

m1 := map[string]interface{}{"name": "John", "age": 10}
m2 := map[string]interface{}{"name": "Alex", "age": 12}

s = append(s, m1, m2)
s = append(s, m2)

b, err := json.MarshalIndent(s, "", "  ")
if err != nil {
  fmt.Println("json.Marshal failed:", err)
  return
}

fmt.Println(string(b))
```

#### struct转JSON

> struct成员变量必须首字母大写，才能转成`JSON`
> 即只有可导出的成员才可以转换成`JSON`
>
> 所有才有了`json:"xxname,xxtype（可选）"`这个用法（成员标签定义），可以通过成员标签定义输出的json字段名。

```go
type Movie struct {
  Title  string   `json:"title"`
  Year   int      `json:"year"`
  Color  bool     `json:"color,omitempty"` //omitempty表示值为空或者零值，则不输出到json
  Actors []string `json:"actors"`
}
var movies = []Movie{
  {
    Title:  "Casablanca",
    Year:   1942,
    Color:  false,
    Actors: []string{"Humphrey Bogart", "Ingrid Bergman"},
  },
  {
    Title:  "Casablanca2",
    Year:   1943,
    Actors: []string{"Humphrey Bogart1", "Ingrid Bergman2"},
  },
}
data, err := json.MarshalIndent(movies, "", "  ")
//json.Marshal是不会有缩进和换行，全部一行显示
if err != nil {
  log.Fatalf("JSON marshaling faild: %s", err)
}
//data的类型是[]byte
fmt.Printf("%s\n", data)
```

**omitempty表示值为空或者零值，则不输出到json**

#### JSON转struct

`json.Unmarshal`

```go
type Movie struct {
  Title  string   `json:"title"`
  Year   int      `json:"year"`
  Color  bool     `json:"color,omitempty"`
  Actors []string `json:"actors"`
}
jsonString := `
		[
			{
				"title": "Casablanca",
				"year": 1942,
				"color": true,
				"actors": [
					"Humphrey Bogart",
					"Ingrid Bergman"
				]
			},
			{
				"title": "Casablanca2",
				"year": 1943,
				"color": false,
				"actors": [
					"Humphrey Bogart1",
					"Ingrid Bergman3"
				]
			}
		]
	`
var movies = []Movie{}
if err := json.Unmarshal([]byte(jsonString), &movies); err != nil {
  log.Fatalf("JSON unmarshaling failed: %s", err)
}
fmt.Printf("%#v\n", movies)
```

**JSON字段关联到Go结构体成员名称是忽略大小写的。**

### 接口（interface）

一个接口定义了一套**方法**，如果一个具体类型实现该接口，那么必须实现接口类型定义的**所有方法**。

接口可以实现任意类型的参数，如fmt.Println是可以接受任意类型的参数。

```go
package main

import (
	"fmt"
)

func main() {
	println("a", 22)
}

func println(a ...interface{}) {
	fmt.Println(a...)
}
```



### make函数

### new函数

> 这里的`new`并不是面向对象的new，这里的new是可以被变量new覆盖的，并不是go预留名称，但还是建议不要覆盖。

new 可以用来声明指针引用

```go
b := new(int)
*b = 2
fmt.Println(*b)
```

等价于：

```go
var a = 2
b := &a
fmt.Println(*b)
```

### 并发编程

> 如果我们无法确认一个事件肯定先于另一事件，那么这两个事件就是并发的。

Go有两种并发编程风格，`goroutint`和`channel`。她们支持通信顺序进程（CSP），CSP是一个并发模式。

#### goroutine

在Go中每一个并发执行的活动称为`goroutine`。

当一个程序启动时，只有一个`goroutine`来调用main函数，称它为主`goroutine`。新的`goroutine`通过go语句进行创建。

**当main函数返回时，所有的`goroutine`都会被暴力的直接终结。**

```go
package main

import (
	"fmt"
	"time"
)

func main() {
	go spinner(100 * time.Millisecond)
	const n = 45
	fibN := fib(n) //这个计算比较耗时，所以需要再计算期间提供一个spinner来指示程序依然在运行
	fmt.Printf("\rFibonacci(%d) = %d\n", n, fibN)
}

func spinner(delay time.Duration) {
	for {
		for _, r := range `_\|/` {
			fmt.Printf("\r%c", r)
			time.Sleep(delay)
		}
	}
}

func fib(x int) int {
	if x < 2 {
		return x
	}
	return fib(x-1) + fib(x-2)
}
```

#### channel

如果说`goroutine`是Go程序的并发执行体，`channel`就是他们之间的连接。



### 宕机机制（down）

Go语言的类型系统会捕获编译异常，但有些错误（比如数组越界访问）都需要运行时进行检查，当Go语言运行时检测到这些错误，就会发生`宕机`。

Go语言追求简洁优雅，所以，Go语言不支持传统的 try…catch…finally 这种异常，因为Go语言的设计者们认为，将异常与控制结构混在一起会很容易使得代码变得混乱。因为开发者很容易滥用异常，甚至一个小小的错误都抛出一个异常。在Go语言中，使用多值返回来返回错误。不要用异常代替错误，更不要用来控制流程。在极个别的情况下，也就是说，遇到真正的异常的情况下（比如除数为0了）。才使用Go中引入的Exception处理：`panic`, `recover`。

当发生宕机，`defer`语句也是倒序执行的。

```go
package main

import (
	"fmt"
)

func main() {
	f(3)
}

func f(x int) {
	fmt.Printf("f(%d)\n", x+0/x) //除数为0，发生宕机
	defer fmt.Printf("defer %d\n", x)
	f(x - 1)
}
```

输出信息如下：

```sh
$ go run index.go
f(3)
f(2)
f(1)
defer 1
defer 2
defer 3
panic: runtime error: integer divide by zero

goroutine 1 [running]:
main.f(0x0)
        /Users/Sam/go-project/src/demo17/index.go:12 +0x19d
main.f(0x1)
        /Users/Sam/go-project/src/demo17/index.go:14 +0x16c
main.f(0x2)
        /Users/Sam/go-project/src/demo17/index.go:14 +0x16c
main.f(0x3)
        /Users/Sam/go-project/src/demo17/index.go:14 +0x16c
main.main()
        /Users/Sam/go-project/src/demo17/index.go:8 +0x2a
exit status 2
```



## 注意和警告

### 迭代变量

for循环都有迭代变量问题。

这个跟`javascript`有点类似，看下面例子：

```go
var rmdirs []func()
//假设创建了一系列目录，然后又会删除它们。tempDirs()假设的
for _,dir := range tempDirs(){
  os.MkdirAll(dir,0755)
  rmdirs = append(rmdirs, func(){
    os.RemoveAll(dir)
  })
}
for _, rmdir := range rmdirs {
  rmdir() //清理
}
```

但是上面的清理操作，只清理了最后一个tempDir，从作用域范围来说，定义在for上面的变量属于跟for是同一级的作用域，而for自己又形成了新的一个作用域，所以**上面的`dir`变量在所有的rmdir函数中是公用一个变量的**。

下面的方法可以解决这个问题：

```go
var rmdirs []func()
//假设创建了一系列目录，然后又会删除它们。tempDirs()假设的
for _,d := range tempDirs(){
  dir := d //这样赋值，这里的就属于for里面的作用域了，d值的改变不影响dir。
  os.MkdirAll(dir,0755)
  rmdirs = append(rmdirs, func(){
    os.RemoveAll(dir)
  })
}
for _, rmdir := range rmdirs {
  rmdir() //清理
}
```

把dir值赋值到for作用域里面，内部变量解决办法，说白了就是拷贝了一个副本。

## 参考文章

[VSCode+golang 安装配置](https://blog.csdn.net/u013295518/article/details/78766086)

[Go项目的依赖管理工具](http://www.lijiaocn.com/book-go/chapter04/2017/12/25/chapter04-01-dependency.html)

[理解Go语言的nil](https://www.jianshu.com/p/dd80f6be7969)