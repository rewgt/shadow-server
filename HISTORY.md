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

v0.1.4 / 2017-04-05
============

首个供试用的 Beta 版本。

v0.1.2 / 2017-01-24
============

首个供内部测试的 Alpha 版本。
