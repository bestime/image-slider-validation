# 图片滑块验证

```javascript
var oISV = ImageSliderValidation({
  mode: 'canvas',
  // 装载容器
  wrapper: oDemoButton,

  // 图片宽度
  width: 380, 

  // 图片高度
  height: 210,

  // 滑块宽度
  sliderButtonWidth: 40,

  // 验证成功回调
  success: function (x, y, fnClosePlugin) { },

  // 验证失败回调
  error: function (fnClosePlugin) { },

  // 获取图片的回调，这里可以调用自己的接口，callback数据参照此例子
  onGetImage (callback) {
    var imgWidth = getRandom(380, 500)
    var imgHeight = Math.round(imgWidth * 210 / 380)
    var imgUrl = `https://picsum.photos/${imgWidth}/${imgHeight}/?blur=10`
    callback({
      src: imgUrl,
      x: getRandom(100, 320), // 镂空坐标X 0~248
      y: getRandom(0, 150), // 镂空坐标Y 0~112
    })
  }
})
```

![示例图片](./other/demo.png "example")