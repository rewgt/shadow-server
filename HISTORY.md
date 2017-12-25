v1.1.0 / 2017-09-11
============

从本版本起不再支持 react v15.4.x 以前旧版本，Shadow Widget v1.1 以后版本只与 react v15.5+ 配套使用。

  * v1.1.0 / 2017-09-09
    - 优化：React.createClass 在 react v15.5 以后版本改用 create-react-class，本系统随之升级
    - 优化：重构用户手册，Shadow Widget 原理介绍与 UI 构件介绍分开到两本手册

  * v1.1.1 / 2017-10-11
    - 优化：为避免专利问题，把内置的 React 依赖库升级到采用 MIT 协议的 15.6.2 版本
    - 改错：侦听 NavPanel 或 NavDiv 的 duals.checkedId 未起作用
    - 改错：构件在 unmount 时，有 unlisten 函数不存在的报错
    - 优化：增加 T.Style 定义
    - 改错：shadow-server 提供的 page/default.html 中，引入 create-react-class.min.js 位置有误
    - 改错：特定情况下传入 props.$onClick 函数，导致无限递归

  * v1.1.2 / 2017-10-19
    - 优化：增加 utils.update(comp,attr,modifier) 函数
    - 优化：增加 utils.waitAll(comp1,attr1, ... callback,waitCount) 函数

  * v1.1.3 / 2017-12-23
    - 优化：可视编辑器在选中任意构件后可按 cmd+s 或 ctrl+s 热键可存盘
    - 优化：原 ex.time() 扩展规格，增加 ex.time(sId) 支持
    - 优化：将内置的 React 依赖库升级到最新 16.2 版本

v1.0.0 / 2017-05-31
============

首个稳定版本。

  * v1.0.1 / 2017-06-07
    - 优化：对拼文 zip 打包时将 markdown 文本按注释方式保存到 html 文件中
    - 优化：增加 `WTC._createClass(def)` 接口，手册 3.3.2 节增加使用说明
  * v1.0.2 / 2017-06-09
    - 优化：`T.Fieldset` 增加 `props.style={borderColor:'#bbb'}` 缺省属性
    - 改错：`Textarea, Input, OptInput, Select` 构件的 `duals.value = 'text'` 未修改 `node.value`
    - 改错：`setup__, teardown__` 调用错误
    - 优化：在手册 3.5.3 节补充 `W.$dataSrc` 的使用方法
  * v1.0.3 / 2017-07-04
    - 优化：当 `utils.eachElement` 与 `utils.eachComponent` 的 `callbace` 参数为 `null` 时直接返回子项列表
    - 优化：通过给 `comp.state['tagName.']` 赋值，让 `comp` 节点的 render 输出能改变 tag
    - 改错：用 `comp.setChildren()` 安装子节点时，可能报 `keyid.` 属性不支持的错误
    - 优化：增加 `utils.bindMountData(data)` 函数用于捆绑调测数据
  * v1.0.4 / 2017-07-31
    - 优化：增加 `Div2, VirtualDiv, VirtualSpan` 节点 
    - 优化：增加用 `utils.setChildren()` 设置虚拟节点与插入节点
    - 优化：增加接口 `childOf(sKey,noVirtual)`，给 `parentOf(noVirtual,sRole)` 增加 2 个参数
    - 优化：增加接口 `utils.containKlass(), utils.clearKlass(), utils.klassNames()`
    - 优化：为选项构件统一增加 `disabled` 双源属性
    - 优化：非行内构件的 `left/top/margin/padding/borderWidth` 支持用 null 表示省略 inline css
    - 优化：`defineDual(attr)` 的 attr 参数允许传 array，便于一次设置多个双源属性
    - 改错：原有 `Input/TextArea/Select` 的 value 同步处理不符合 controlled input 要求
  * v1.0.5 / 2017-09-09
    - 改错：构件 `Select` 在 multiple 为 '1' 时，`duals.value` 改用 React 要求的 array 格式
    - 优化：增加接口 `utils.setupKlass()`
    - 优化：markdown 中的源码块增加首部行号与指定高亮行的功能
    - 改错：特定情况下 Select 下 Option 的 `selected` 未被正确同步
    - 优化：增加对虚节点的 `duals.style = value` 赋值，将转接至其下实节点
    - 优化：增加用多个 `"//"` 表达连续多次取父节点
    - 改错：在面板下计算剩余像素数未排除 margin
    - 优化：选项构件用于切换导航面板时 isolated 缺省视作 false，其它情况缺省视作 true 
    - 优化：增加接口 `ex.elementOf()`
    - 改错：在可视设计器选中引用 `P` 的节点改属性，存盘后节点却变为 `Div`

v0.1.4 / 2017-04-05
============

首个供试用的 Beta 版本。

v0.1.2 / 2017-01-24
============

首个供内部测试的 Alpha 版本。
