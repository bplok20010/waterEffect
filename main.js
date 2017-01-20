var c = document.getElementById("myCanvas");
var ctx = c.getContext("2d");

var m_renderSrc, m_renderDest;
var m_waterEffect = new CWaterEffect;
var tmpPic = new Image();
var width, height;

tmpPic.onload = function() {
    c.width = width = tmpPic.width;
    c.height = height = tmpPic.height;
    ctx.drawImage(tmpPic, 0, 0);
    main();
}
tmpPic.src = './pic.jpg';

function InvertedImage(bitData, width, height) {
    var after = Array(bitData.length);
    for (var i = 0; i < bitData.length; i++) {
        var ch = ~~(i / width);
        var hc = height - ch - 1;
        var lIndex = (i - ch * width) % width;
        after[hc * width + lIndex] = bitData[i];
    }

    return after;
}

function Create32BitFromPicture(ctx, width, height) {
    var imageData = ctx.getImageData(0, 0, width, height).data;
    var toPix = [];
    for (var i = 0; i < imageData.length; i += 4) {
        toPix.push({
            r: imageData[i],
            g: imageData[i + 1],
            b: imageData[i + 2],
            a: imageData[i + 3]
        });
    }

    return toPix;
}

function toImageData(m_renderDest) {
    var imageData = ctx.createImageData(width, height);
    for (var i = 0; i < m_renderDest.length; i++) {
        var pix = m_renderDest[i];
        var s = i * 4;
        imageData.data[s] = pix.r;
        imageData.data[s + 1] = pix.g;
        imageData.data[s + 2] = pix.b;
        imageData.data[s + 3] = pix.a;
    }

    return imageData;
}

function main() {
    m_renderSrc = Create32BitFromPicture(ctx, width, height);
    m_renderDest = Create32BitFromPicture(ctx, width, height);

    m_waterEffect.Create(width, height);
    m_waterEffect.Blob(random(15, width), random(20, height), 5, 800, m_waterEffect.m_iHpage);

    c.addEventListener('mousemove', function(e) {
        var x = e.pageX - 50,
            y = e.pageY - 50;
        if (e.which == 1) {
            m_waterEffect.Blob(x, y, 10, 1600, m_waterEffect.m_iHpage);
        } else {
            m_waterEffect.Blob(x, y, 5, 50, m_waterEffect.m_iHpage);
        }
    })
}


setInterval(function() {
    m_waterEffect.Render(m_renderSrc, m_renderDest);
    ctx.putImageData(toImageData(m_renderDest), 0, 0)
}, 40);

setInterval(function() {
    m_waterEffect.Blob(random(15, width), random(20, height), 5, 800, m_waterEffect.m_iHpage);
}, 1000);