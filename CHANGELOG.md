# 1.0.15 (2022-09-18)
* 兼容RN0.69.x

# 1.0.14 (2021-05-22)
* 添加`activeTextFontWeight`、`inactiveTextFontWeight`属性
* 将`ScrollableTabBar`改写为class组件

# 1.0.11 (2021-05-22)
android始终存在一个bug，是从react-native-pager-view里面的
解锁屏幕后，会被重置到tab=0的位置

# 1.0.9 (2021-05-03)

* 将`ScrollableTabView`改写为class组件

# 1.0.6 (2021-03-17)

* 修复对`@react-native-community/viewpager`高版本的兼容

# 1.0.5 (2020-08-04)

* scrollableTabBar的underline改为非撑满模式

# 1.0.4

* 修复RN0.62版本下，报getNode的警告问题

# 1.0.3

* 修复RN0.62版本下，报getNode的警告问题
* 修复ScrollableTabBar的`activeTextFontSize`与`inactiveTextFontSize`

# 1.0.1

* 添加activeTextFontSize和inactiveTextFontSize两个属性
* 改造ScrollableTabBar的underline结构，保持跟DefaultTabBar一致
* 导入ts文件，并更新定义
