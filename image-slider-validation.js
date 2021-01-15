/*!
 * canvas 图片滑块验证插件
 * @author Jiang Yang (Bestime)
 * @QQ 1174295440
 * @see https://github.com/bestime/image-slider-validation
 * @update 2020-12-09 13:58
 * 
 * y坐标范围：0~320
 * x坐标范围：0~150
 */
var ImageSliderValidation = (function () {
  var dpr = isMobile ? window.devicePixelRatio : 1
  var PI = Math.PI
  var r = 10  
  var sliderWidth = 42*dpr
  var realSliderWidth = sliderWidth + r * 2*dpr
  var tipMsg = '向右拖动滑块填充拼图'
  var sliderOffsetY = 19
  var isMobile = 'ontouchstart' in document.documentElement

  //移除节点
  function removeElement (el) {
    try {
      el.parentNode.removeChild(el)
    } catch(e) {
      
    }
  }


  //阻止冒泡及默认行为
  function prevent (ev, bubble, stop) {
    ev = ev || window.event
    bubble = bubble === false ? false : true
    stop = stop === false ? false : true
    bubble && window.event ? window.event.cancelBubble = true : ev.stopPropagation()
    stop && window.event ? window.event.returnValue = false : ev.preventDefault()
  }
  
  function getRandomImg () {
    return 'https://picsum.photos/300/150/?image=500'
  }
  function createImage (mode, onGetImage, onload) {
    if(onGetImage) {
      onGetImage(onImageUrlReady)
    } else {
      onImageUrlReady({
        src: getRandomImg(),
        x: 0,
        y: 0
      })
    }

    function onImageUrlReady (res) {
      if(mode==='canvas') {
        var oImg = document.createElement('img')
        oImg.crossOrigin = "Anonymous"
        oImg.onload = function () {
          onload(oImg, res.x, res.y)
        }
        oImg.src = res.src
      } else {
        createTwoImage(res.src, function (oImgs) {
          onload(oImgs, res.x, res.y)
        })
      }
    }    
  }

  function createTwoImage (srcList, callback) {
    var oImg01 = document.createElement('img')
    oImg01.onload = checkLoad
    oImg01.crossOrigin = "Anonymous"
    oImg01.className = 'isv-back'
    oImg01.src = srcList[0]

    var oImg02 = document.createElement('img')
    oImg02.onload = checkLoad
    oImg02.crossOrigin = "Anonymous"
    oImg02.className = 'isv-slider'
    oImg02.src = srcList[1]
    
    var count = 0;
    function checkLoad () {
      count++
      if(count===srcList.length) {
        callback([oImg01, oImg02])
      }
    }
  }

  function createBackgroundCanvas (width, height) {
    var canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    return canvas
  }

  function createLoading () {
    return '\
    <div class="isv-loading">\
      <svg class="isvg" x="0px" y="0px" viewBox="0 0 150 150">\
        <circle class="isvg-inner" cx="75" cy="75" r="60"/>\
      </svg>\
    </div>\
    ';
  }

  



  function createHandleBox (sliderButtonWidth, onPositionChange, onConfirm, onMouseDown) {
    var oHandle = document.createElement('div')
    oHandle.className = 'isv_handler_box'
    oHandle.innerHTML = '<span></span><b>'+ tipMsg +'</b><i></i>';
    var downX = 0, currentX = 0;
    var oSpan, oI, oB;
    setTimeout(function () {
      oSpan = oHandle.getElementsByTagName('span')[0]
      oI = oHandle.getElementsByTagName('i')[0]
      oB = oHandle.getElementsByTagName('b')[0]
      if(isMobile) {
        oSpan.ontouchstart = function (ev) {
          ev = ev.targetTouches[0];
          downX = ev.clientX - currentX
          document.addEventListener('touchmove', onMove)
          document.addEventListener('touchend', onUp)
          document.addEventListener('touchcancel', onUp)
          onMouseDown()
        }
      } else {
        oSpan.onmousedown = function (ev) {
          ev = ev || window.event
          downX = ev.clientX - currentX
          document.addEventListener('mousemove', onMove)
          document.addEventListener('mouseup', onUp)
          onMouseDown()
        }
      }
    }, 50)

    function onMove (ev) {
      if(isMobile) {
        ev = ev.targetTouches[0];
      } else {
        ev = ev || window.event
      }      
      upateX(ev.clientX - downX)
    }

    function onUp () {
      onConfirm(currentX)      
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      document.removeEventListener('touchmove', onMove)
      document.removeEventListener('touchend', onUp)
      document.removeEventListener('touchcancel', onUp)
    }

    function upateX (x) {
      var maxX = oHandle.offsetWidth - sliderButtonWidth
      if(maxX<0) {
        maxX = 0
      }
      if(x>maxX) {
        x = maxX
      } else if(x<0) {
        x = 0
      }
      currentX = x
      oSpan.style.left = currentX + 'px'
      oI.style.width = currentX + sliderButtonWidth-2+'px'
      onPositionChange(currentX)
    }

    return {
      el: oHandle,
      updateLabel: function (str) {
        oB.innerHTML = str
      },
      reset: function () {
        upateX(0)
        oB.innerHTML = tipMsg
      },
      setSuccess: function () {
        
        oB.innerHTML = '验证成功'
      },
      setError: function () {
        oB.innerHTML = '验证失败'
      }
    }
  }

  

  return function (options) {
    var cssWidth = options.width || 100
    var cssHeight = options.height || 100
    var width = cssWidth * dpr
    var height = cssHeight * dpr
    
    var oWrapper = options.wrapper
    var mode = options.mode || 'canvas'
    var pinnedX = 0
    var pinnedY = 0
    var sliderButtonWidth = options.sliderButtonWidth || 40
    var oPaddingBox = document.createElement('div')
    var oCanvasWrapper = document.createElement('div')
    var oRefresh = document.createElement('div')
    var oClose = document.createElement('div')
    var drawing;
    oRefresh.className = 'isv-refresh'
    oClose.className = 'isv-close'
    oCanvasWrapper.className = 'isv-canvas'
    oCanvasWrapper.style.width = cssWidth + 'px'
    oCanvasWrapper.style.height = cssHeight + 'px'
    oPaddingBox.className = 'image-slider-validation loading'
    oPaddingBox.onclick = prevent
    var timer02, timer01, backgroundCanvas, sliderCanvas, backgroundCtx, sliderCtx;

    if(mode==='canvas') {
      backgroundCanvas = createBackgroundCanvas(width, height)
      sliderCanvas = backgroundCanvas.cloneNode(true)
      backgroundCanvas.style.width = cssWidth + 'px'
      backgroundCanvas.style.height = cssHeight + 'px'
      sliderCanvas.style.width = realSliderWidth/dpr + 'px'
      sliderCanvas.style.height = cssHeight + 'px'

      backgroundCtx = backgroundCanvas.getContext('2d')
      sliderCtx = sliderCanvas.getContext('2d')
      backgroundCanvas.className = 'isv-back'
      sliderCanvas.className = 'isv-slider'
      oCanvasWrapper.appendChild(backgroundCanvas)
      oCanvasWrapper.appendChild(sliderCanvas)
    }

    
    
    oCanvasWrapper.appendChild(oRefresh)
    oCanvasWrapper.appendChild(oClose)
    oPaddingBox.innerHTML += createLoading()
    oPaddingBox.appendChild(oCanvasWrapper)

    function checkSuccess (stopX) {
      oPaddingBox.classList.add("success");
      iHandle.setSuccess()
      timer01 = setTimeout(function () {
        options.success && options.success(stopX,pinnedY,close)
      }, 1000)
    }

    function checkFail (needNewImage) {
      needNewImage=needNewImage===true
      oPaddingBox.classList.add('fail')
      iHandle.setError()
      timer02 = setTimeout(function () {
        reset(needNewImage)
        options.error && options.error(close)
      }, 1000)
    }

    var iHandle = createHandleBox(sliderButtonWidth, function (toX) {
      sliderCanvas.style.left = toX + 'px'
    }, function (stopX) {
      
      
      if(mode==='canvas') {
        clearTimeout(timer01)
        clearTimeout(timer02)
        if(Math.abs(stopX-pinnedX)<=2) {
          checkSuccess(stopX)
        } else {
          checkFail()
        }
      } else {
        options.onMouseUp && options.onMouseUp(stopX, function () {
          clearTimeout(timer01)
          clearTimeout(timer02)
          checkSuccess(stopX)
        }, checkFail)
      }
      
    },function () {
      resetTimer_fail_success()
    })

    oPaddingBox.appendChild(iHandle.el)
    oWrapper.appendChild(oPaddingBox)
    

    reDrawCanvas()    


    function reDrawCanvas() {
      drawing = true;
      
      oPaddingBox.classList.add('loading')
      if(mode==='canvas') {
        backgroundCtx.clearRect(0, 0, width, height)
        sliderCtx.clearRect(0, 0, width, height)
        sliderCanvas.width = width
      } else {
        removeElement(backgroundCanvas)
        removeElement(sliderCanvas)
      }
      
      createImage(mode, options.onGetImage, function (image, x, y) {
        
        if(mode==='canvas') {
          pinnedX = x
          pinnedY = y + sliderOffsetY
          updatePinnedPosition() 
          drawClipImage(backgroundCtx, 'fill', pinnedX, pinnedY)
          drawClipImage(sliderCtx, 'clip', pinnedX, pinnedY)
          
          backgroundCtx.drawImage(image, 0, 0, width, height)
          sliderCtx.drawImage(image, 0, 0, width, height)
          var y = pinnedY - r * 2 + 2    
          var ImageData = sliderCtx.getImageData(pinnedX, y, realSliderWidth, realSliderWidth)
          sliderCanvas.width = realSliderWidth
          sliderCtx.putImageData(ImageData, 0, y)
        } else {
          backgroundCanvas = image[0]
          sliderCanvas = image[1]
          oCanvasWrapper.appendChild(image[0])
          oCanvasWrapper.appendChild(image[1])
        }
        drawing = false
        oPaddingBox.classList.remove('loading')
      })
    }

    oClose.onclick = function () {
      close()
      options.close && options.close()
    }

    function drawClipImage (ctx, operation, x, y) {
      x = x + 1

      ctx.strokeStyle='rgba(255,255,255,0.5)';      
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x + sliderWidth / 2, y)
      
      ctx.arc(x + sliderWidth / 2, y - r+8, r-2, 0.5*PI, 2.5 * PI)

      ctx.lineTo(x + sliderWidth / 2, y)
      ctx.lineTo(x + sliderWidth, y)
      ctx.lineTo(x + sliderWidth, y + sliderWidth / 2)
      
      ctx.arc(x + sliderWidth + r-8, y + sliderWidth / 2, r-2, PI, 3 * PI)

      ctx.lineTo(x + sliderWidth, y + sliderWidth / 2)
      ctx.lineTo(x + sliderWidth, y + sliderWidth)
      ctx.lineTo(x + 26, y + 29)
      ctx.lineTo(x, y + sliderWidth)
      ctx.lineTo(x+15, y + 15)
      ctx.lineTo(x, y)
      ctx.stroke()
      ctx.fillStyle = '#fff'
      ctx[operation]()
      
      ctx.beginPath()
      
      // ctx.arc(x, y + l / 2, r, 1.5 * PI, 0.5 * PI)
      
      
      // ctx.lineTo(x, y + l)
      // ctx.lineTo(x, y)
      ctx.globalCompositeOperation = "xor"
      
      ctx.fill() 
      
    }

    function updatePinnedPosition () {
      if(pinnedY<sliderOffsetY) {
        pinnedY = sliderOffsetY
      } else if (pinnedY > height - realSliderWidth+sliderOffsetY) {
        pinnedY = height - realSliderWidth+sliderOffsetY
      }
  
      if (pinnedX < realSliderWidth) {
        pinnedX = realSliderWidth
      } else if(pinnedX > width - realSliderWidth) {
        pinnedX = width - realSliderWidth
      }
    }

    oRefresh.onclick = function () {
      reset(true)
    }


    function resetTimer_fail_success () {
      clearTimeout(timer01)
      clearTimeout(timer02)
      oPaddingBox.classList.remove("success");
      oPaddingBox.classList.remove("fail");
      iHandle.updateLabel(tipMsg)
    }

    function reset (needNewPic) {
      needNewPic = needNewPic === true
      if(needNewPic) {
        if(drawing) return;        
      }
      resetTimer_fail_success()
      
      sliderCanvas.style.left = '0px'      
      iHandle.reset()
      if(needNewPic) {
        reDrawCanvas() 
      }
    }

    function show () {
      oPaddingBox.classList.add('active')
    }

    function close () {
      oPaddingBox.classList.remove('active')
    }

    return {
      show: show,
      close: close,
      reLoad: function () {
        reset(true)
      }
    }
  }
})();