function rand() {
    return ~~(Math.random() * 1000000000)
}

function range(e, t, n) {
    arguments.length <= 1 && (t = e || 0, e = 0), n = n || 1;
    var r = Math.max(Math.ceil((t - e) / n), 0),
        i = Array(r);
    for (var s = 0; s < r; s++, e += n) i[s] = e;
    return i
}

function random(e, t) { return t == null && (t = e, e = 0), e + Math.floor(Math.random() * (t - e + 1)) }

if (!Array.prototype.fill) {
    Array.prototype.fill = function(s) {
        var i;
        for (i = 0; i < this.length; i++) {
            this[i] = s;
        }
        return this;
    };
}

function CWaterEffect() {
    this.m_iBuffer1 = null;
    this.m_iBuffer2 = null;

    this.m_iWidth = 0;
    this.m_iHeight = 0;

    this.m_iLightModifier = 10;
    this.m_iHpage = 0;
    this.m_iDensity = 2;
}

CWaterEffect.prototype = {
    Create: function(iWidth, iHeight) {
        if (this.m_iBuffer1 != null)
            delete this.m_iBuffer1;
        if (this.m_iBuffer2 != null)
            delete this.m_iBuffer2;

        this.m_iBuffer1 = Array(iWidth * iHeight).fill(0);
        this.m_iBuffer2 = Array(iWidth * iHeight).fill(0);

        this.m_iWidth = iWidth;
        this.m_iHeight = iHeight;

        this.ClearWater();

        this.m_iHpage = 0;
    },

    Blob: function(x, y, radius, height, page) {
        var rquad;
        var cx, cy, cyq;
        var left, top, right, bottom;

        var pNew;
        var pOld;

        var m_iWidth = this.m_iWidth,
            m_iHeight = this.m_iHeight;

        if (page == 0) {
            pNew = this.m_iBuffer1;
            pOld = this.m_iBuffer2;
        } else {
            pNew = this.m_iBuffer2;
            pOld = this.m_iBuffer1;
        }

        rquad = radius * radius;

        if (x < 0)
            x = 1 + radius + rand() % (m_iWidth - 2 * radius - 1);
        if (y < 0)
            y = 1 + radius + rand() % (m_iHeight - 2 * radius - 1);

        left = -radius;
        right = radius;
        top = -radius;
        bottom = radius;

        // clip edges
        if (x - radius < 1)
            left -= (x - radius - 1);
        if (y - radius < 1)
            top -= (y - radius - 1);
        if (x + radius > m_iWidth - 1)
            right -= (x + radius - m_iWidth + 1);
        if (y + radius > m_iHeight - 1)
            bottom -= (y + radius - m_iHeight + 1);

        for (cy = top; cy < bottom; cy++) {
            cyq = cy * cy;
            for (cx = left; cx < right; cx++) {
                if (cx * cx + cyq < rquad) {
                    pNew[m_iWidth * (cy + y) + (cx + x)] += height;
                }
            }
        }
    },

    ClearWater: function() {

    },

    Render: function(pSrcImage, pTargetImage) {
        this.DrawWater(this.m_iHpage, this.m_iLightModifier, pSrcImage, pTargetImage);

        this.CalcWater(this.m_iHpage, this.m_iDensity);

        //change the field from 0 to 1 and vice versa
        this.m_iHpage ^= 1;
    },

    CalcWater: function(npage, density) {
        var m_iHeight = this.m_iHeight,
            m_iWidth = this.m_iWidth;
        var newh;
        var count = m_iWidth + 1;
        var pNew;
        var pOld;

        if (npage == 0) {
            pNew = this.m_iBuffer1;
            pOld = this.m_iBuffer2;
        } else {
            pNew = this.m_iBuffer2;
            pOld = this.m_iBuffer1;
        }

        var x, y;

        // a description of the algorithm and an implementation
        // in 'pseudocode' can be found here:
        // http://freespace.virgin.net/hugo.elias/graphics/x_water.htm
        for (y = (m_iHeight - 1) * m_iWidth; count < y; count += 2) {
            for (x = count + m_iWidth - 2; count < x; count++) {
                // use eight pixels
                newh = ((pOld[count + m_iWidth] +
                        pOld[count - m_iWidth] +
                        pOld[count + 1] +
                        pOld[count - 1] +
                        pOld[count - m_iWidth - 1] +
                        pOld[count - m_iWidth + 1] +
                        pOld[count + m_iWidth - 1] +
                        pOld[count + m_iWidth + 1]
                    ) >> 2) -
                    pNew[count];

                pNew[count] = newh - (newh >> density);
            }
        }
    },

    SmoothWater: function(npage) {
        var m_iHeight = this.m_iHeight,
            m_iWidth = this.m_iWidth;
        //flatten and spread the waves
        var newh;
        var count = m_iWidth + 1;

        var pNew;
        var pOld;

        if (npage == 0) {
            pNew = this.m_iBuffer1;
            pOld = this.m_iBuffer2;
        } else {
            pNew = this.m_iBuffer2;
            pOld = this.m_iBuffer1;
        }

        var x, y;

        // a description of the algorithm and an implementation
        // in 'pseudocode' can be found here:
        // http://freespace.virgin.net/hugo.elias/graphics/x_water.htm
        for (y = 1; y < m_iHeight - 1; y++) {
            for (x = 1; x < m_iWidth - 1; x++) {
                newh = ((pOld[count + m_iWidth] +
                        pOld[count - m_iWidth] +
                        pOld[count + 1] +
                        pOld[count - 1] +
                        pOld[count - m_iWidth - 1] +
                        pOld[count - m_iWidth + 1] +
                        pOld[count + m_iWidth - 1] +
                        pOld[count + m_iWidth + 1]
                    ) >> 3) +
                    pNew[count];

                pNew[count] = newh >> 1;
                count++;
            }
            count += 2;
        }
    },

    DrawWater: function(page, LightModifier, pSrcImage, pTargetImage) {
        var m_iHeight = this.m_iHeight,
            m_iWidth = this.m_iWidth;
        var dx, dy;
        var x, y;
        var c;

        var offset = m_iWidth + 1;
        var lIndex;
        var lBreak = m_iWidth * m_iHeight;

        var ptr = this.m_iBuffer1;

        for (y = (m_iHeight - 1) * m_iWidth; offset < y; offset += 2) {
            for (x = offset + m_iWidth - 2; offset < x; offset++) {
                dx = ptr[offset] - ptr[offset + 1];
                dy = ptr[offset] - ptr[offset + m_iWidth];

                lIndex = offset + m_iWidth * (dy >> 3) + (dx >> 3);
                if (lIndex < lBreak && lIndex > 0) {
                    c = pSrcImage[lIndex];
                    c = this.GetShiftedColor(c, dx);
                    pTargetImage[offset] = c;
                }

                offset++;
                dx = ptr[offset] - ptr[offset + 1];
                dy = ptr[offset] - ptr[offset + m_iWidth];

                lIndex = offset + m_iWidth * (dy >> 3) + (dx >> 3);
                if (lIndex < lBreak && lIndex > 0) {
                    c = pSrcImage[lIndex];
                    c = this.GetShiftedColor(c, dx);
                    pTargetImage[offset] = c;
                }
            }
        }
    },

    GetShiftedColor: function(color, shift) {
        var R;
        var G;
        var B;
        var ir;
        var ig;
        var ib;

        R = color.r - shift;
        G = color.g - shift;
        B = color.b - shift;

        ir = (R < 0) ? 0 : (R > 255) ? 255 : R;
        ig = (G < 0) ? 0 : (G > 255) ? 255 : G;
        ib = (B < 0) ? 0 : (B > 255) ? 255 : B;

        return {
            r: ir,
            g: ig,
            b: ib,
            a: color.a
        };
    }

};