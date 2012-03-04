/*! Javascript plotting library for Raphael v. 0.7.
 *
 * Released under the MIT license by Xavier Basty, March 2012.
 *
 * Based on the flot plotting library (http://code.google.com/p/flot/)
 * Color management based on jquery.colorhelpers by Ole Laursen
 *
 */

(function ($, undefined) {
  "use strict";
  var R = Raphael;

  function Color (r, g, b, a) {
    if (this instanceof Color) {
      this.r = r || 0;
      this.g = g || 0;
      this.b = b || 0;
      this.a = a != null ? a : 1;
      return this.normalize();
    } else {
      return new Color(r, g, b, a);
    }
  }

  Color.prototype = {
    constructor: Color,
    scale: function (c, f) {
      var ci, cl;
      for (ci = 0, cl = c.length; ci < cl; ci++) {
        this[c.charAt(ci)] *= f;
      }
      return this.normalize();
    },
    normalize: function () {
      var c = this;
      function clamp(min, value, max) {
        return value < min ? min: (value > max ? max: value);
      }

      c.r = clamp(0, parseInt(c.r, 10), 255);
      c.g = clamp(0, parseInt(c.g, 10), 255);
      c.b = clamp(0, parseInt(c.b, 10), 255);
      c.a = clamp(0, c.a, 1);

      return c;
    },
    toString: function () {
      var c = this;
      if (c.a >= 1.0) {
        return "rgb("+[c.r, c.g, c.b].join(",")+")";
      } else {
        return "rgba("+[c.r, c.g, c.b, c.a].join(",")+")";
      }
    }
  };

  Color.LookupColors = {
    aqua:[0,255,255],
    azure:[240,255,255],
    beige:[245,245,220],
    black:[0,0,0],
    blue:[0,0,255],
    brown:[165,42,42],
    cyan:[0,255,255],
    darkblue:[0,0,139],
    darkcyan:[0,139,139],
    darkgrey:[169,169,169],
    darkgreen:[0,100,0],
    darkkhaki:[189,183,107],
    darkmagenta:[139,0,139],
    darkolivegreen:[85,107,47],
    darkorange:[255,140,0],
    darkorchid:[153,50,204],
    darkred:[139,0,0],
    darksalmon:[233,150,122],
    darkviolet:[148,0,211],
    fuchsia:[255,0,255],
    gold:[255,215,0],
    green:[0,128,0],
    indigo:[75,0,130],
    khaki:[240,230,140],
    lightblue:[173,216,230],
    lightcyan:[224,255,255],
    lightgreen:[144,238,144],
    lightgrey:[211,211,211],
    lightpink:[255,182,193],
    lightyellow:[255,255,224],
    lime:[0,255,0],
    magenta:[255,0,255],
    maroon:[128,0,0],
    navy:[0,0,128],
    olive:[128,128,0],
    orange:[255,165,0],
    pink:[255,192,203],
    purple:[128,0,128],
    violet:[128,0,128],
    red:[255,0,0],
    silver:[192,192,192],
    white:[255,255,255],
    yellow:[255,255,0]
  };

  /**
   * Parse CSS color string (like "rgb(10, 32, 43)" or "#fff")
   * @param {!String} str
   * @return {!Color} The {@link Color} object representing the parsed string
   */
  Color.parse = function (str) {
    var res, name, c = Color;

    // Look for rgb(num,num,num)
    if (res = /rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)/.exec(str)) {
      return c(parseInt(res[1], 10), parseInt(res[2], 10), parseInt(res[3], 10));
    }

    // Look for rgba(num,num,num,num)
    if (res = /rgba\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]+(?:\.[0-9]+)?)\s*\)/.exec(str)) {
      return c(parseInt(res[1], 10), parseInt(res[2], 10), parseInt(res[3], 10), parseFloat(res[4]));
    }

    // Look for rgb(num%,num%,num%)
    if (res = /rgb\(\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*\)/.exec(str)) {
      return c(parseFloat(res[1]) * 2.55, parseFloat(res[2]) * 2.55, parseFloat(res[3]) * 2.55);
    }

    // Look for rgba(num%,num%,num%,num)
    if (res = /rgba\(\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\s*\)/.exec(str)) {
      return c(parseFloat(res[1]) * 2.55, parseFloat(res[2]) * 2.55, parseFloat(res[3]) * 2.55, parseFloat(res[4]));
    }

    // Look for #a0b1c2
    if (res = /#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/.exec(str)) {
      return c(parseInt(res[1], 16), parseInt(res[2], 16), parseInt(res[3], 16));
    }

    // Look for #fff
    if (res = /#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])/.exec(str)) {
      return c(parseInt(res[1] + res[1], 16), parseInt(res[2] + res[2], 16), parseInt(res[3] + res[3], 16));
    }

    // Otherwise, we're most likely dealing with a named color
    name = str.replace(/^\s+/, '').replace(/\s+$/, '').toLowerCase();
    if (name == 'transparent') {
      return c(255, 255, 255, 0);
    } else {
      res = Color.LookupColors[name];
      return c(res[0], res[1], res[2]);
    }
  };

  /**
   * Extract CSS color property from element, going up in the DOM if it's "transparent"
   * TODO: Remove jQuery dependency
   *
   * @param elem
   * @param css
   * @return {!Color}
   */
  Color.extract = function (elem, css) {
    var c;
    do {
      c = elem.css(css).toLowerCase();

      // keep going until we find an element that has color, or we hit the body
      if (c != '' && c != 'transparent') {
        break;
      }
      elem = elem.parent();
    } while (!jQuery.nodeName(elem.get(0), 'body'));

    // catch Safari's way of signalling transparent
    if (c == 'rgba(0, 0, 0, 0)') {
      c = 'transparent';
    }

    return Color.parse(c);
  };

  /**
   * Round to nearby lower multiple of base
   *
   * @param {Number} n
   * @param {Number} base
   * @return {Number}
   */
  function floorInBase(n, base) {
    return base * Math.floor(n / base);
  }

  function arc(centerX, centerY, startAngle, endAngle, innerR, outerR) {
    var
      largeArc = +(endAngle - startAngle > Math.PI),
      outerX1 = centerX + outerR * Math.cos(startAngle),
      outerY1 = centerY + outerR * Math.sin(startAngle),
      outerX2 = centerX + outerR * Math.cos(endAngle),
      outerY2 = centerY + outerR * Math.sin(endAngle),
      innerX1 = centerX + innerR * Math.cos(endAngle),
      innerY1 = centerY + innerR * Math.sin(endAngle),
      innerX2 = centerX + innerR * Math.cos(startAngle),
      innerY2 = centerY + innerR * Math.sin(startAngle),
      path = [
        'M', innerX1, ' ', innerY1,
        'A', innerR, ' ', innerR, ' ', 0, ' ', largeArc, ' ', 0, ' ', innerX2, ' ', innerY2       //draw the inner arc
      ];


    if (outerR != null) {
      path.push(
        'L', ' ', outerX1, ' ', outerY1,                                                          //draw a line inwards to the start of the inner edge of the arc
        'A', ' ', outerR, ' ', outerR, ' ', 0, ' ', largeArc, ' ', 1, ' ', outerX2, ' ', outerY2, //draw the outer edge of the arc
        'z'                                                                                       //close the path
      );
    }

    return path.join('');
  }

  function getOrCreateAxis(axes, number, base, direction) {
    number--;
    if (!axes[number]) {
      axes[number] = {
        n: number + 1, // save the number for future reference
        direction: direction,
        options: $.extend(true, {}, base)
      };
    }

    return axes[number];
  }

  function onHoverIn() {
    var
      set = this.data('set'),
      fill,
      si, sl, e;
    for (si = 0, sl = set.length; si < sl; si++) {
      e = set[si];
      fill = e.attrs.fill;
      if (fill && fill !== 'none') {
        e.attr({fill: Color.parse(fill).scale('a', 0.5).toString()});
      }
    }
  }

  function onHoverOut() {
    var
      set = this.data('set'),
      fill,
      si, sl, e;
    for (si = 0, sl = set.length; si < sl; si++) {
      e = set[si];
      fill = e.attrs.fill;
      if (fill && fill !== 'none') {
        e.attr({fill: Color.parse(fill).scale('a', 2).toString()});
      }
    }
 }

  function onClick() {
    console.debug(this);
  }

  /**
   * Return a flat array of all the axes without annoying null entries.
   *
   * @param {!Plotr} plotr
   * @return {!Array}
   */
  function allAxes(plotr) {
    var
      axes = plotr.xAxes.concat(plotr.yAxes),
      ret = [],
      i, l;
    for (i = 0, l = axes.length; i < l; i++) {
      axes[i] && ret.push(axes[i]);
    }
    return ret;
  }

  function executeHooks(plotr, hooks, args) {
    var i, l;
    for (i = 0, l = hooks.length; i < l; ++i) {
      hooks[i].apply(plotr, args);
    }
  }

  function parseData(plotr, d) {
    var
      res = [],
      series,
      i, l;

    for (i = 0, l = d.length; i < l; ++i) {
      series = $.extend(true, {}, plotr.options.series);

      if (d[i].data != null) {
        series.data = d[i].data; // move the data instead of deep-copy
        delete d[i].data;

        $.extend(true, series, d[i]);

        d[i].data = series.data;
      } else {
        series.data = d[i];
      }

      res.push(series);
    }

    return res;
  }

  function axisNumber(obj, coord) {
    var a = obj[coord + 'axis'];

    if (typeof a === 'object') { // if we got a real axis, extract number
      a = a.n;
    }

    if (typeof a !== 'number') {
      a = 1; // default to first axis
    }

    return a;
  }

  /**
   *
   * @param {!Plotr} plotr
   */
  function fillInSeriesOptions(plotr) {
    var
      series = plotr.series,
      options = plotr.options,
      xAxes = plotr.xAxes,
      yAxes = plotr.yAxes,
      i, l,
      sc,
      c,
      s,
      neededColors = series.length,
      usedColors = [],
      assignedColors = [],
      colors = [],
      variation = 0,
      sign,
      colorIndex,
      v,
      show;

    for (i = 0, l = series.length; i < l; ++i) {
      sc = series[i].color;

      if (sc != null) {
        neededColors--;
        if (typeof sc === 'number') {
          assignedColors.push(sc);
        }
        else {
          usedColors.push(Color.parse(series[i].color));
        }
      }
    }

    // We might need to generate more colors if higher indices are assigned
    for (i = 0, l = assignedColors.length; i < l; ++i) {
      neededColors = Math.max(neededColors, assignedColors[i] + 1);
    }

    // produce colors as needed
    i = 0;
    l = options.colors.length;
    while (colors.length < neededColors) {
      if (l === i) {  // check degenerate case
        c = Color(100, 100, 100);
      } else {
        c = Color.parse(options.colors[i]);
      }

      // vary color if needed
      sign = variation % 2 === 1 ? -1 : 1;
      c.scale('rgb', 1 + sign * Math.ceil(variation / 2) * 0.2);

      // FIXME: if we're getting to close to something else, we should probably skip this one
      colors.push(c);

      ++i;
      if (i >= l) {
        i = 0;
        ++variation;
      }
    }

    // Fill in the options
    for (i = 0, colorIndex = 0, l = series.length; i < l; ++i) {
      s = series[i];

      // assign colors
      if (s.color == null) {
        s.color = colors[colorIndex].toString();
        ++colorIndex;
      } else if (typeof s.color === 'number') {
        s.color = colors[s.color].toString();
      }

      // Turn on lines automatically in case nothing is set
      if (s.lines.show == null) {
        show = true;
        for (v in s) {
          if (s.hasOwnProperty(v) && s[v] && s[v].show) {
            show = false;
            break;
          }
        }
        if (show) {
          s.lines.show = true;
        }
      }

      // Setup axes
      s.xaxis = getOrCreateAxis(xAxes, axisNumber(s, 'x'), options.xaxes, 'x');
      s.yaxis = getOrCreateAxis(yAxes, axisNumber(s, 'y'), options.yaxes, 'y');
    }
  }

  /**
   *
   * @param {!Plotr} plotr
   */
  function processData(plotr) {
    var
      series = plotr.series,
      hooks = plotr.hooks,

      topSentry = Number.POSITIVE_INFINITY,
      bottomSentry = Number.NEGATIVE_INFINITY,
      fakeInfinity = Number.MAX_VALUE,

      axes,
      axis, ai, al,

      s, si,
      sl = series.length,
      di, dl,
      pi,
      dpi,

      data,
      format,
      insertSteps,
      nullify,
      delta,

      points,
      pointSize,

      xMin, yMin,
      xMax, yMax,

      val,
      f,
      dataPoint;

    function updateAxis(axis, min, max) {
      if (min < axis.datamin && min != -fakeInfinity) { axis.datamin = min; }
      if (max > axis.datamax && max != fakeInfinity) { axis.datamax = max; }
    }

    axes = allAxes(plotr);
    for (ai = 0, al = axes.length; ai < al; ai++) {
      // init axis
      axis = axes[ai];
      axis.datamin = topSentry;
      axis.datamax = bottomSentry;
      axis.used = false;
    }

    for (si = 0; si < sl; si++) {
      s = series[si];
      s.datapoints = { points: [] };

      executeHooks(plotr, hooks.processRawData, [ s, s.data, s.datapoints ]);
    }

    // First pass: clean and copy data
    for (si = 0; si < sl; si++) {
      s = series[si];

      data = s.data;
      format = s.datapoints.format;

      if (!format) {
        format = [];

        // Find out how to copy
        format.push({ x: true, number: true, required: true });
        format.push({ y: true, number: true, required: true });

        if (s.bars.show || (s.lines.show && s.lines.fill)) {
          format.push({ y: true, number: true, required: false, defaultValue: 0 });
          if (s.bars.horizontal) {
            delete format[format.length - 1].y;
            format[format.length - 1].x = true;
          }
        }

        s.datapoints.format = format;
      }

      if (s.datapoints.pointsize != null) {
        continue;
      } // already filled in

      s.datapoints.pointsize = format.length;

      pointSize = s.datapoints.pointsize;
      points = s.datapoints.points;

      insertSteps = s.lines.show && s.lines.steps;
      s.xaxis.used = s.yaxis.used = true;

      for (di = pi = 0, dl = data.length; di < data.length; di++, pi += pointSize) {
        dataPoint = data[di];

        nullify = dataPoint == null;
        if (!nullify) {
          for (dpi = 0; dpi < pointSize; dpi++) {
            val = dataPoint[dpi];
            f = format[dpi];

            if (f) {
              if (f.number && val != null) {
                val = +val; // convert to number
                if (isNaN(val)) {
                  val = null;
                } else if (val == Infinity) {
                  val = fakeInfinity;
                } else if (val == -Infinity) {
                  val = -fakeInfinity;
                }
              }

              if (val == null) {
                if (f.required) {
                  nullify = true;
                }

                if (f.defaultValue != null) {
                  val = f.defaultValue;
                }
              }
            }

            points[pi + dpi] = val;
          }
        }

        if (nullify) {
          for (dpi = 0; dpi < pointSize; dpi++) {
            val = points[pi + dpi];
            if (val != null) {
              f = format[dpi];
              // extract min/max info
              f.x && updateAxis(s.xaxis, val, val);
              f.y && updateAxis(s.yaxis, val, val);
            }
            points[pi + dpi] = null;
          }
        } else {
          // A little bit of line specific stuff that perhaps shouldn't be here,
          // but lacking better means...
          if (
            insertSteps &&
            pi > 0 &&
            points[pi - pointSize] != null &&
            points[pi - pointSize] != points[pi] &&
            points[pi - pointSize + 1] != points[pi + 1]
            ) {
            // copy the point to make room for a middle point
            for (dpi = 0; dpi < pointSize; ++dpi) {
              points[pi + pointSize + dpi] = points[pi + dpi];
            }

            // middle point has same y
            points[pi + 1] = points[pi - pointSize + 1];

            // we've added a point, better reflect that
            pi += pointSize;
          }
        }
      }
    }

    // Give the hooks a chance to run
    for (si = 0; si < sl; si++) {
      s = series[si];
      executeHooks(plotr, hooks.processDatapoints, [ s, s.datapoints]);
    }

    // Second pass: find datamax/datamin for auto-scaling
    for (si = 0; si < sl; ++si) {
      s = series[si];
      points = s.datapoints.points;
      pointSize = s.datapoints.pointsize;

      xMin = yMin = topSentry;
      xMax = yMax = bottomSentry;

      for (pi = 0; pi < points.length; pi += pointSize) {
        if (points[pi] == null) {
          continue;
        }

        for (dpi = 0; dpi < pointSize; ++dpi) {
          val = points[pi + dpi];
          f = format[dpi];
          if (!f || val == fakeInfinity || val == -fakeInfinity) {
            continue;
          }

          if (f.x) {
            if (val < xMin) { xMin = val; }
            if (val > xMax) { xMax = val; }
          }
          if (f.y) {
            if (val < yMin) { yMin = val; }
            if (val > yMax) { yMax = val; }
          }
        }
      }

      if (s.bars.show) {
        // make sure we got room for the bar on the dancing floor
        delta = s.bars.align == 'left'
          ? 0
          : -s.bars.barWidth / 2;

        if (s.bars.horizontal) {
          yMin += delta;
          yMax += delta + s.bars.barWidth;
        }
        else {
          xMin += delta;
          xMax += delta + s.bars.barWidth;
        }
      }

      updateAxis(s.xaxis, xMin, xMax);
      updateAxis(s.yaxis, yMin, yMax);
    }

    for (ai = 0, al = axes.length; ai > al; ai++) {
      axis = axes[ai];
      if (axis.datamin == topSentry) {
        axis.datamin = null;
      }
      if (axis.datamax == bottomSentry) {
        axis.datamax = null;
      }
    }
  }

  function setRange(axis) {
    var
      options = axis.options,
      min = +(options.min != null ? options.min : axis.datamin),
      max = +(options.max != null ? options.max : axis.datamax),
      delta = max - min,
      widen,
      margin;

    if (delta == 0.0) {
      // degenerate case
      widen = max == 0 ? 1 : 0.01;

      if (options.min == null) {
        min -= widen;
      }
      // always widen max if we couldn't widen min to ensure we
      // don't fall into min == max which doesn't work
      if (options.max == null || options.min != null) {
        max += widen;
      }
    } else {
      // consider autoscaling
      margin = options.autoscaleMargin;
      if (margin != null) {
        if (options.min == null) {
          min -= delta * margin;
          // make sure we don't go below zero if all values
          // are positive
          if (min < 0 && axis.datamin != null && axis.datamin >= 0) {
            min = 0;
          }
        }
        if (options.max == null) {
          max += delta * margin;
          if (max > 0 && axis.datamax != null && axis.datamax <= 0) {
            max = 0;
          }
        }
      }
    }
    axis.min = min;
    axis.max = max;
  }

  function setupTickGeneration(plotr, axis) {
    var
      opts = axis.options,
      noTicks,
      delta,
      size,
      generator,
      unit,
      formatter,
      i, l,
      magnitude,
      norm,
      timeUnitSize, spec,
      minSize,
      maxDec, dec,
      otherAxis,
      niceTicks,
      extraDec, ts;


    // estimate number of ticks
    if (typeof opts.ticks === 'number' && opts.ticks > 0) {
      noTicks = opts.ticks;
    } else {
      // heuristic based on the model a*sqrt(x) fitted to
      // some data points that seemed reasonable
      noTicks = 0.3 * Math.sqrt(axis.direction === 'x' ? plotr.canvasWidth : plotr.canvasHeight);
    }

    delta = (axis.max - axis.min) / noTicks;

    if (opts.mode === 'time') {  // pretty handling of time
      // map of app. size of time units in milliseconds
      timeUnitSize = {
        'second': 1000,
        'minute': 60 * 1000,
        'hour': 60 * 60 * 1000,
        'day': 24 * 60 * 60 * 1000,
        'month': 30 * 24 * 60 * 60 * 1000,
        'year': 365.2425 * 24 * 60 * 60 * 1000
      };


      // The allowed tick sizes, after 1 year we use an integer algorithm
      spec = [
        [1, 'second'],
        [2, 'second'],
        [5, 'second'],
        [10, 'second'],
        [30, 'second'],
        [1, 'minute'],
        [2, 'minute'],
        [5, 'minute'],
        [10, 'minute'],
        [30, 'minute'],
        [1, 'hour'],
        [2, 'hour'],
        [4, 'hour'],
        [8, 'hour'],
        [12, 'hour'],
        [1, 'day'],
        [2, 'day'],
        [3, 'day'],
        [0.25, 'month'],
        [0.5, 'month'],
        [1, 'month'],
        [2, 'month'],
        [3, 'month'],
        [6, 'month'],
        [1, 'year']
      ];

      minSize = 0;
      if (opts.minTickSize != null) {
        if (typeof opts.tickSize === 'number') {
          minSize = opts.tickSize;
        } else {
          minSize = opts.minTickSize[0] * timeUnitSize[opts.minTickSize[1]];
        }
      }

      for (i = 0, l = spec.length - 1; i < l; i++) {
        if (delta < (spec[i][0] * timeUnitSize[spec[i][1]] + spec[i + 1][0] * timeUnitSize[spec[i + 1][1]]) / 2 &&
          spec[i][0] * timeUnitSize[spec[i][1]] >= minSize) {
          break;
        }
      }
      size = spec[i][0];
      unit = spec[i][1];

      // special-case the possibility of several years
      if (unit === 'year') {
        magnitude = Math.pow(10, Math.floor(Math.log(delta / timeUnitSize.year) / Math.LN10));
        norm = (delta / timeUnitSize.year) / magnitude;
        if (norm < 1.5) {
          size = 1;
        } else if (norm < 3) {
          size = 2;
        } else if (norm < 7.5) {
          size = 5;
        } else {
          size = 10;
        }

        size *= magnitude;
      }

      axis.tickSize = opts.tickSize || [size, unit];

      generator = function (axis) {
        var
          ticks = [],
          tickSize = axis.tickSize[0],
          unit = axis.tickSize[1],
          d = new Date(axis.min),
          step = tickSize * timeUnitSize[unit],
          carry = 0,
          v = Number.NaN,
          prev,
          start, end;

        if (unit === 'second') {
          d.setUTCSeconds(floorInBase(d.getUTCSeconds(), tickSize));
        }
        if (unit === 'minute') {
          d.setUTCMinutes(floorInBase(d.getUTCMinutes(), tickSize));
        }
        if (unit === 'hour') {
          d.setUTCHours(floorInBase(d.getUTCHours(), tickSize));
        }
        if (unit === 'month') {
          d.setUTCMonth(floorInBase(d.getUTCMonth(), tickSize));
        }
        if (unit === 'year') {
          d.setUTCFullYear(floorInBase(d.getUTCFullYear(), tickSize));
        }

        // reset smaller components
        d.setUTCMilliseconds(0);
        if (step >= timeUnitSize.minute) {
          d.setUTCSeconds(0);
        }
        if (step >= timeUnitSize.hour) {
          d.setUTCMinutes(0);
        }
        if (step >= timeUnitSize.day) {
          d.setUTCHours(0);
        }
        if (step >= timeUnitSize.day * 4) {
          d.setUTCDate(1);
        }
        if (step >= timeUnitSize.year) {
          d.setUTCMonth(0);
        }

        do {
          prev = v;
          v = d.getTime();
          ticks.push(v);
          if (unit === 'month') {
            if (tickSize < 1) {
              // a bit complicated - we'll divide the month up but we need to take care of fractions
              // so we don't end up in the middle of a day.
              d.setUTCDate(1);
              start = d.getTime();
              d.setUTCMonth(d.getUTCMonth() + 1);
              end = d.getTime();
              d.setTime(v + carry * timeUnitSize.hour + (end - start) * tickSize);
              carry = d.getUTCHours();
              d.setUTCHours(0);
            } else {
              d.setUTCMonth(d.getUTCMonth() + tickSize);
            }
          } else if (unit === "year") {
            d.setUTCFullYear(d.getUTCFullYear() + tickSize);
          } else {
            d.setTime(v + step);
          }
        } while (v < axis.max && v !== prev);

        return ticks;
      };

      formatter = function (v, axis) {
        var
          d = new Date(v),
          t,
          span,
          suffix,
          fmt;

        // first check global format
        if (opts.timeformat != null) {
          return $.plot.formatDate(d, opts.timeformat, opts.monthNames);
        }

        t = axis.tickSize[0] * timeUnitSize[axis.tickSize[1]];
        span = axis.max - axis.min;
        suffix = (opts.twelveHourClock) ? ' %p' : '';

        if (t < timeUnitSize.minute) {
          fmt = '%h:%M:%S' + suffix;
        } else if (t < timeUnitSize.day) {
          if (span < 2 * timeUnitSize.day) {
            fmt = '%h:%M' + suffix;
          } else {
            fmt = '%b %d %h:%M' + suffix;
          }
        } else if (t < timeUnitSize.month) {
          fmt = '%b %d';
        } else if (t < timeUnitSize.year) {
          if (span < timeUnitSize.year) {
            fmt = '%b';
          } else {
            fmt = '%b %y';
          }
        } else {
          fmt = '%y';
        }

        return $.plot.formatDate(d, fmt, opts.monthNames);
      };
    } else {
      // pretty rounding of base-10 numbers
      maxDec = opts.tickDecimals;
      dec = -Math.floor(Math.log(delta) / Math.LN10);

      if (maxDec != null && dec > maxDec) {
        dec = maxDec;
      }

      magnitude = Math.pow(10, -dec);
      norm = delta / magnitude; // norm is between 1.0 and 10.0

      if (norm < 1.5) {
        size = 1;
      } else if (norm < 3) {
        size = 2;
        // special case for 2.5, requires an extra decimal
        if (norm > 2.25 && (maxDec == null || dec + 1 <= maxDec)) {
          size = 2.5;
          ++dec;
        }
      } else if (norm < 7.5) {
        size = 5;
      } else {
        size = 10;
      }

      size *= magnitude;

      if (opts.minTickSize != null && size < opts.minTickSize) {
        size = opts.minTickSize;
      }

      axis.tickDecimals = Math.max(0, maxDec != null ? maxDec : dec);
      axis.tickSize = opts.tickSize || size;

      generator = function (axis) {
        var
          ticks = [],
          start = floorInBase(axis.min, axis.tickSize), // spew out all possible ticks
          i = 0,
          v = Number.NaN,
          prev;

        do {
          prev = v;
          v = start + i * axis.tickSize;
          ticks.push(v);
          ++i;
        } while (v < axis.max && v !== prev);
        return ticks;
      };

      formatter = function (v, axis) {
        return v.toFixed(axis.tickDecimals);
      };
    }

    if (opts.alignTicksWithAxis != null) {
      otherAxis = (axis.direction === 'x' ? plotr.xAxes : plotr.yAxes)[opts.alignTicksWithAxis - 1];
      if (otherAxis && otherAxis.used && otherAxis !== axis) {
        // consider snapping min/max to outermost nice ticks
        niceTicks = generator(axis);
        if (niceTicks.length > 0) {
          if (opts.min == null) {
            axis.min = Math.min(axis.min, niceTicks[0]);
          }
          if (opts.max == null && niceTicks.length > 1) {
            axis.max = Math.max(axis.max, niceTicks[niceTicks.length - 1]);
          }
        }

        generator = function (axis) {
          // copy ticks, scaled to this axis
          var ticks = [], v, i, l;
          for (i = 0, l = otherAxis.ticks.length; i < l; ++i) {
            v = (otherAxis.ticks[i].v - otherAxis.min) / (otherAxis.max - otherAxis.min);
            v = axis.min + v * (axis.max - axis.min);
            ticks.push(v);
          }
          return ticks;
        };

        // We might need an extra decimal since forced
        // ticks don't necessarily fit naturally
        if (!axis.mode && opts.tickDecimals == null) {
          extraDec = Math.max(0, -Math.floor(Math.log(delta) / Math.LN10) + 1);
          ts = generator(axis);

          // only proceed if the tick interval rounded
          // with an extra decimal doesn't give us a
          // zero at end
          if (!(ts.length > 1 && /\..*0$/.test((ts[1] - ts[0]).toFixed(extraDec)))) {
            axis.tickDecimals = extraDec;
          }
        }
      }
    }

    axis.tickGenerator = generator;
    axis.tickFormatter = $.isFunction(opts.tickFormatter)
      ? function (v, axis) { return '' + opts.tickFormatter(v, axis); }
      : formatter;
  }

  function setTicks(axis) {
    var
      optionTicks = axis.options.ticks,
      ticks = [],
      i, l,
      v,
      label,
      t;

    if (optionTicks == null || (typeof optionTicks === 'number' && optionTicks > 0)) {
      ticks = axis.tickGenerator(axis);
    } else if (optionTicks) {
      ticks = $.isFunction(optionTicks)
        ? optionTicks(axis)
        : optionTicks;
    }

    // clean up/labelify the supplied ticks, copy them over
    axis.ticks = [];
    for (i = 0, l = ticks.length; i < l; i++) {
      label = null;
      t = ticks[i];
      if (typeof t === 'object') {
        v = +t[0];
        if (t.length > 1) {
          label = t[1];
        }
      } else {
        v = +t;
      }

      if (label == null) {
        label = axis.tickFormatter(v, axis);
      }

      if (!isNaN(v)) {
        axis.ticks.push({ v: v, label: label });
      }
    }
  }

  function snapRangeToTicks(axis, ticks) {
    if (axis.options.autoscaleMargin && ticks.length > 0) {
      // snap to ticks
      if (axis.options.min == null) {
        axis.min = Math.min(axis.min, ticks[0].v);
      }
      if (axis.options.max == null && ticks.length > 1) {
        axis.max = Math.max(axis.max, ticks[ticks.length - 1].v);
      }
    }
  }

  function measureTickLabels(plotr, axis) {
    var
      canvas = plotr.canvas,
      opts = axis.options,
      ticks = axis.ticks || [],
      axisWidth = opts.labelWidth || 0,
      axisHeight = opts.labelHeight || 0,
      ti, tl,
      tick,
      lines, line,
      li, ll,
      box,
      text,
      fontAttributes = {
        'font-family': axis.font.family,
        'font-style': axis.font.style,
        'font-weight': axis.font.weight
      };

    for (ti = 0, tl = ticks.length; ti < tl; ti++) {
      tick = ticks[ti];

      tick.lines = [];
      tick.width = tick.height = 0;

      if (!tick.label) {
        continue;
      }

      // Accept various kinds of newlines, including HTML ones
      // (you can actually split directly on regexps in Javascript, but IE is unfortunately broken)
      lines = tick.label.replace(/<br ?\/?>|\r\n|\r/g, '\n').split('\n');
      for (li = 0, ll = lines.length; li < ll; ++li) {
        line = { text: lines[li] };

        text = canvas
          .text(0, 0, line.text)
          .attr(fontAttributes);
        box = text.getBBox();
        text.remove();

        line.width = box.width;
        line.height = box.height;

        // Add a bit of margin since font rendering is not pixel perfect and cut off letters look bad,
        // this also doubles as spacing between lines
        line.height += Math.round(axis.font.size * 0.15);

        tick.width = Math.max(line.width, tick.width);
        tick.height += line.height;

        tick.lines.push(line);
      }

      if (opts.labelWidth == null) {
        axisWidth = Math.max(axisWidth, tick.width);
      }
      if (opts.labelHeight == null) {
        axisHeight = Math.max(axisHeight, tick.height);
      }
    }

    axis.labelWidth = Math.ceil(axisWidth);
    axis.labelHeight = Math.ceil(axisHeight);
  }

  /**
   * Find the bounding box of the axis by looking at label widths/heights and ticks, make room by diminishing the
   * plotOffset; this first phase only looks at one dimension per axis, the other dimension depends on the
   * other axes so will have to wait
   *
   * @param plotr
   * @param axis
   */
  function allocateAxisBoxFirstPhase(plotr, axis) {
    var
      lw = axis.labelWidth,
      lh = axis.labelHeight,
      pos = axis.options.position,
      tickLength = axis.options.tickLength,
      axisMargin = plotr.options.grid.axisMargin,
      padding = plotr.options.grid.labelMargin,
      all = axis.direction === 'x' ? plotr.xAxes : plotr.yAxes,
      samePosition,
      sameDirection,
      innermost;

    // Determine axis margin
    samePosition = $.grep(all, function (a) { return a && a.options.position === pos && a.reserveSpace; });
    if ($.inArray(axis, samePosition) === samePosition.length - 1) {
      axisMargin = 0; // outermost
    }

    // Determine tick length - if we're innermost, we can use "full"
    if (tickLength == null) {
      sameDirection = $.grep(all, function (a) { return a && a.reserveSpace; });
      innermost = $.inArray(axis, sameDirection) === 0;
      tickLength = innermost ? 'full' : 5;
    }

    if (!isNaN(+tickLength)) {
      padding += +tickLength;
    }

    // Compute box
    if (axis.direction === 'x') {
      lh += padding;

      if (pos === 'bottom') {
        plotr.plotOffset.bottom += lh + axisMargin;
        axis.box = { top: plotr.canvasHeight - plotr.plotOffset.bottom, height: lh };
      } else {
        axis.box = { top: plotr.plotOffset.top + axisMargin, height: lh };
        plotr.plotOffset.top += lh + axisMargin;
      }
    } else {
      lw += padding;

      if (pos === 'left') {
        axis.box = { left: plotr.plotOffset.left + axisMargin, width: lw };
        plotr.plotOffset.left += lw + axisMargin;
      } else {
        plotr.plotOffset.right += lw + axisMargin;
        axis.box = { left: plotr.canvasWidth - plotr.plotOffset.right, width: lw };
      }
    }

    // Save for future reference
    axis.position = pos;
    axis.tickLength = tickLength;
    axis.box.padding = padding;
    axis.innermost = innermost;
  }

  /**
   * When all axis boxes have been placed in one dimension, we can set the remaining dimension coordinates
   *
   * @param plotr
   * @param axis
   */
  function allocateAxisBoxSecondPhase(plotr, axis) {
    if (axis.direction === "x") {
      axis.box.left = plotr.plotOffset.left - axis.labelWidth / 2;
      axis.box.width = plotr.canvasWidth - plotr.plotOffset.left - plotr.plotOffset.right + axis.labelWidth;
    }
    else {
      axis.box.top = plotr.plotOffset.top - axis.labelHeight / 2;
      axis.box.height = plotr.canvasHeight - plotr.plotOffset.bottom - plotr.plotOffset.top + axis.labelHeight;
    }
  }

  /**
   * Possibly adjust plot offset to ensure everything stays inside the canvas and isn't clipped off
   * @param plotr
   */
  function adjustLayoutForThingsStickingOut(plotr) {
    var
      options = plotr.options,
      series = plotr.series,
      plotOffset = plotr.plotOffset,
      minMargin = options.grid.minBorderMargin,
      margins = { x: 0, y: 0 },
      i, l;

    // check stuff from the plot (FIXME: this should just read
    // a value from the series, otherwise it's impossible to
    // customize)
    if (minMargin == null) {
      minMargin = 0;
      for (i = 0, l = series.length; i < l; ++i) {
        minMargin = Math.max(minMargin, 2 * (series[i].points.radius + series[i].points.lineWidth / 2));
      }
    }

    margins.x = margins.y = Math.ceil(minMargin);

    // Check axis labels,
    // note we don't check the actual labels but instead use the overall width/height to not
    // jump as much around with replots
    $.each(allAxes(plotr), function (_, axis) {
      var dir = axis.direction;
      if (axis.reserveSpace) {
        margins[dir] = Math.ceil(Math.max(margins[dir], (dir === 'x' ? axis.labelWidth : axis.labelHeight) / 2));
      }
    });

    plotOffset.left = Math.max(margins.x, plotOffset.left);
    plotOffset.right = Math.max(margins.x, plotOffset.right);
    plotOffset.top = Math.max(margins.y, plotOffset.top);
    plotOffset.bottom = Math.max(margins.y, plotOffset.bottom);
  }

  /**
   * Set helper functions on the axis,
   * assumes plot area has been computed already
   *
   * @param axis
   */
  function setTransformationHelpers(plotr, axis) {
    function identity(x) { return x; }

    var
      scale,
      m,
      t = axis.options.transform || identity,
      it = axis.options.inverseTransform;

    // Precompute how much the axis is scaling a point in canvas space
    if (axis.direction === 'x') {
      scale = axis.scale = plotr.plotWidth / Math.abs(t(axis.max) - t(axis.min));
      m = Math.min(t(axis.max), t(axis.min));
    } else {
      scale = axis.scale = plotr.plotHeight / Math.abs(t(axis.max) - t(axis.min));
      scale = -scale;
      m = Math.max(t(axis.max), t(axis.min));
    }

    // Data point to canvas coordinate
    if (t === identity) {  // slight optimization
      axis.p2c = function (p) {
        return (p - m) * scale;
      };
    } else {
      axis.p2c = function (p) { return (t(p) - m) * scale; };
    }

    // Canvas coordinate to data point
    if (!it) {
      axis.c2p = function (c) { return m + c / scale; };
    } else {
      axis.c2p = function (c) { return it(m + c / scale); };
    }
  }

  function insertLegend(plotr) {
    var
      options = plotr.options,
      series = plotr.series,
      plotOffset = plotr.plotOffset,
      fragments = [],
      rowStarted = false,
      labelFormatter = options.legend.labelFormatter,
      s, si, sl,
      label,
      table,
      pos,
      position,
      margin,
      legend,
      color,
      div;

    plotr.placeholder.find('.legend').remove();

    if (!options.legend.show) {
      return;
    }

    for (si = 0, sl = series.length; si < sl; si++) {
      s = series[si];
      label = s.label;
      if (!label) {
        continue;
      }

      if (si % options.legend.noColumns === 0) {
        if (rowStarted) {
          fragments.push('</tr>');
        }
        fragments.push('<tr>');
        rowStarted = true;
      }

      if (labelFormatter) {
        label = labelFormatter(label, s);
      }

      fragments.push(
        '<td class="legendColorBox"><div style="border:1px solid '
          + options.legend.labelBoxBorderColor
          + ';padding:1px"><div style="width:4px;height:0;border:5px solid '
          + s.color
          + ';overflow:hidden"></div></div></td>'
          + '<td class="legendLabel">'
          + label
          + '</td>'
      );
    }
    if (rowStarted) {
      fragments.push('</tr>');
    }

    if (fragments.length === 0) {
      return;
    }

    table = '<table style="font-size:smaller;color:' + options.grid.color + '">' + fragments.join("") + '</table>';

    if (options.legend.container != null) {
      $(options.legend.container).html(table);
    } else {
      pos = '';
      position = options.legend.position;
      margin = options.legend.margin;

      if (margin[0] == null) {
        margin = [margin, margin];
      }

      if (position.charAt(0) === 'n') {
        pos += 'top:' + (margin[1] + plotOffset.top) + 'px;';
      } else if (position.charAt(0) === 's') {
        pos += 'bottom:' + (margin[1] + plotOffset.bottom) + 'px;';
      }

      if (position.charAt(1) === 'e') {
        pos += 'right:' + (margin[0] + plotOffset.right) + 'px;';
      } else if (position.charAt(1) === 'w') {
        pos += 'left:' + (margin[0] + plotOffset.left) + 'px;';
      }

      legend = $('<div class="legend">' + table.replace('style="', 'style="position:absolute;' + pos + ';') + '</div>').appendTo(plotr.placeholder);
      if (options.legend.backgroundOpacity != 0.0) {
        // put in the transparent background separately to avoid blended labels and label boxes
        color = options.legend.backgroundColor;
        if (color == null) {
          color = options.grid.backgroundColor;
          color = color && typeof color === 'string'
            ? Color.parse(color)
            : Color.extract(legend, 'background-color');
          color.a = 1;
          color = color.toString();
        }

        div = legend.children();
        $('<div style="position:absolute;width:' + div.width() + 'px;height:' + div.height() + 'px;' + pos + 'background-color:' + color + ';"> </div>')
          .prependTo(legend)
          .css('opacity', options.legend.backgroundOpacity);
      }
    }
  }

  function getColorOrGradient(spec, defaultColor) {
    if (typeof spec == "string") {
      return spec;
    }

    var
      ci, cl,
      c, co,
      a = spec.angle == null ? 270 : spec.angle,
      g = [a];

    for (ci = 0, cl = spec.colors.length; ci < cl; ci++) {
      c = spec.colors[ci];

      if (typeof c !== 'string') {
        co = Color.parse(defaultColor);
        if (c.brightness != null) {
          co = co.scale('rgb', c.brightness);
        }
        if (c.opacity != null) {
          co.a *= c.opacity;
        }
        c = co.toString();
      }

      if (ci !== 0 && ci !== cl-1) {
        g.push([ci / (cl - 1) * 100, c].join(':'));
      } else {
        g.push(c);
      }
    }

    return g.join('-');
  }

  function getFillStyle(fillOptions, seriesColor) {
    var
      fill = fillOptions.fill,
      color;

    if (!fill) {
      return null;
    }

    if (fillOptions.fillColor) {
      return getColorOrGradient(fillOptions.fillColor, seriesColor);
    }

    color = Color.parse(seriesColor);
    color.a = typeof fill == 'number' ? fill : 0.4;
    color.normalize();
    return color.toString();
  }

  function extractRange(plotr, ranges, coord) {
    var
      axis, ai, al,
      from, to,
      key,
      axes = allAxes(plotr),
      tmp;

    for (ai = 0, al = axes.length; ai < al; ai++) {
      axis = axes[ai];

      if (axis.direction == coord) {
        key = coord + axis.n + 'axis';

        if (!ranges[key] && axis.n == 1) {
          key = coord + "axis";
        } // support x1axis as xaxis
        if (ranges[key]) {
          from = ranges[key].from;
          to = ranges[key].to;
          break;
        }
      }
    }

    // backwards-compat stuff - to be removed in future
    if (!ranges[key]) {
      axis = coord === 'x' ? plotr.xAxes[0] : plotr.yAxes[0];
      from = ranges[coord + '1'];
      to = ranges[coord + '2'];
    }

    // auto-reverse as an added bonus
    if (from != null && to != null && from > to) {
      tmp = from;
      from = to;
      to = tmp;
    }

    return {
      from: from,
      to: to,
      axis: axis
    };
  }

  function drawBackground(plotr) {
    var fillStyle = getColorOrGradient(plotr.options.grid.backgroundColor, 'rgba(255, 255, 255, 0)');
    //TODO: reuse background element.

    return plotr.canvas
      .rect(plotr.plotOffset.left, plotr.plotOffset.top, plotr.plotWidth, plotr.plotHeight)
      .attr({fill: fillStyle, stroke: null});
  }

  function drawGrid(plotr) {
    var
      m, mi, ml,
      markings = plotr.options.grid.markings,
      axes,
      axis, ai, al,
      v, ti, tl,
      box,
      tickLength,
      x, y, xOff, yOff,
      xRange, yRange,
      borderWidth,
      path,
      transform = 't' + plotr.plotOffset.left + ',' + plotr.plotOffset.top,
      color;

    // draw markings
    if (markings) {
      if ($.isFunction(markings)) {
        axes = plotr.getAxes();

        // xmin etc. is backwards compatibility, to be removed in the future
        axes.xmin = axes.xaxis.min;
        axes.xmax = axes.xaxis.max;
        axes.ymin = axes.yaxis.min;
        axes.ymax = axes.yaxis.max;

        markings = markings(axes);
      }

      for (mi = 0, ml = markings.length; mi < ml; mi++) {
        m = markings[mi];
        xRange = extractRange(plotr, m, 'x');
        yRange = extractRange(plotr, m, 'y');

        // fill in missing
        if (xRange.from == null) {
          xRange.from = xRange.axis.min;
        }
        if (xRange.to == null) {
          xRange.to = xRange.axis.max;
        }
        if (yRange.from == null) {
          yRange.from = yRange.axis.min;
        }
        if (yRange.to == null) {
          yRange.to = yRange.axis.max;
        }

        // clip
        if (xRange.to < xRange.axis.min || xRange.from > xRange.axis.max ||
          yRange.to < yRange.axis.min || yRange.from > yRange.axis.max) {
          continue;
        }

        xRange.from = Math.max(xRange.from, xRange.axis.min);
        xRange.to = Math.min(xRange.to, xRange.axis.max);
        yRange.from = Math.max(yRange.from, yRange.axis.min);
        yRange.to = Math.min(yRange.to, yRange.axis.max);

        if (xRange.from == xRange.to && yRange.from == yRange.to) {
          continue;
        }

        // then draw
        xRange.from = xRange.axis.p2c(xRange.from);
        xRange.to = xRange.axis.p2c(xRange.to);
        yRange.from = yRange.axis.p2c(yRange.from);
        yRange.to = yRange.axis.p2c(yRange.to);

        if (xRange.from == xRange.to || yRange.from == yRange.to) {
          // draw line
          path = [
            'M', xRange.from, ',', yRange.from,
            'L', xRange.to, ',', yRange.to
          ].join('');
          plotr.canvas
            .path(path)
            .transform(transform)
            .attr({
              'stroke': m.color || plotr.options.grid.markingsColor,
              'stroke-width': m.lineWidth || plotr.options.grid.markingsLineWidth
            });
        } else {
          // fill area
          plotr.canvas
            .rect(xRange.from, yRange.to, xRange.to - xRange.from, yRange.from - yRange.to)
            .transform(transform)
            .attr({
              'fill': m.color || plotr.options.grid.markingsColor
            });
        }
      }
    }

    // draw the ticks
    axes = allAxes(plotr);
    borderWidth = plotr.options.grid.borderWidth;

    for (ai = 0, al = axes.length; ai < al; ai++) {
      axis = axes[ai];
      box = axis.box;
      tickLength = axis.tickLength;

      if (!axis.show || axis.ticks.length == 0) {
        continue;
      }

      // Find the edges
      if (axis.direction == 'x') {
        x = 0;
        y = tickLength == 'full'
          ? (axis.position == 'top' ? 0 : plotr.plotHeight)
          : box.top - plotr.plotOffset.top + (axis.position == 'top' ? box.height : 0);
      } else {
        y = 0;
        x = tickLength == 'full'
          ? (axis.position == "left" ? 0 : plotr.plotWidth)
          : box.left - plotr.plotOffset.left + (axis.position == "left" ? box.width : 0);
      }

      color = axis.options.tickColor || Color.parse(axis.options.color).scale('a', 0.22).toString();

      // Draw tick bar
      if (!axis.innermost) {
        xOff = yOff = 0;
        if (axis.direction == 'x') {
          xOff = plotr.plotWidth;
        } else {
          yOff = plotr.plotHeight;
        }

        x = Math.floor(x) + 0.5;
        y = Math.floor(y) + 0.5;

        path = [
          'M', x, ',', y,
          'L', x + xOff, ',', y + yOff
        ].join('');

        plotr.canvas
          .path(path)
          .transform(transform)
          .attr({
            'stroke': color
          });
      }

      // draw ticks
      path = [];
      for (ti = 0, tl = axis.ticks.length; ti < tl; ti++) {
        v = axis.ticks[ti].v;

        xOff = yOff = 0;

        if (v < axis.min || v > axis.max
          // skip those lying on the axes if we got a border
          || (tickLength == 'full' && borderWidth > 0
          && (v == axis.min || v == axis.max))) {
          continue;
        }

        if (axis.direction == 'x') {
          x = axis.p2c(v);
          yOff = tickLength == 'full' ? -plotr.plotHeight : tickLength;

          if (axis.position == 'top') {
            yOff = -yOff;
          }
        } else {
          y = axis.p2c(v);
          xOff = tickLength == 'full' ? -plotr.plotWidth : tickLength;

          if (axis.position == 'left') {
            xOff = -xOff;
          }
        }

        if (axis.direction == 'x') { x = Math.floor(x) + 0.5; }
        else { y = Math.floor(y) + 0.5; }

        path.push(
          'M', x, ' ', y,
          'L', x + xOff, ' ', y + yOff
        );
      }
      path = path.join('');
      plotr.canvas
        .path(path)
        .transform(transform)
        .attr({
          'stroke': color
        });
    }


    // Draw border
    if (borderWidth) {
      plotr.canvas
        .rect(-borderWidth / 2, -borderWidth / 2, plotr.plotWidth + borderWidth, plotr.plotHeight + borderWidth)
        .transform(transform)
        .attr({
          'stroke': plotr.options.grid.borderColor,
          'stroke-width': borderWidth
        });
    }
  }

  function drawAxisLabels(plotr) {
    var
      canvas = plotr.canvas,
      axes = allAxes(plotr),
      axis, ai, al,
      tick, ti, tl,
      line, li, ll,
      box,
      font, fontAttributes,
      x, y,
      offset;

    for (ai = 0, al = axes.length; ai < al; ai++) {
      axis = axes[ai];

      if (!axis.show || axis.ticks.length == 0) {
        continue;
      }

      box = axis.box;
      font = axis.font;
      fontAttributes = {
        'text-anchor': 'start',
        'font-family': font.family,
        'font-style': font.style,
        'font-weight': font.weight,
        'fill': axis.options.color
      };

      for (ti = 0, tl = axis.ticks.length; ti < tl; ti++) {
        tick = axis.ticks[ti];
        if (!tick.label || tick.v < axis.min || tick.v > axis.max) {
          continue;
        }

        offset = 0;
        for (li = 0, ll = tick.lines.length; li < ll; li++) {
          line = tick.lines[li];

          if (axis.direction == 'x') {
            x = plotr.plotOffset.left + axis.p2c(tick.v) - line.width / 2;
            y = axis.position == 'bottom'
              ? box.top + box.padding
              : box.top + box.height - box.padding - tick.height;
          } else {
            y = plotr.plotOffset.top + axis.p2c(tick.v) - tick.height / 2;
            x = axis.position == 'left'
              ? box.left + box.width - box.padding - line.width
              : box.left + box.padding;
          }

          // account for middle aligning and line number
          y += line.height / 2 + offset;
          offset += line.height;

          canvas
            .text(x, y, line.text)
            .attr(fontAttributes);
        }
      }
    }
  }

  function drawSeriesLines(plotr, series) {
    var
      lineWidth = series.lines.lineWidth,
      shadowSize = series.shadowSize,
      angle,
      fillStyle,
      transform = 't' + plotr.plotOffset.left + ',' + plotr.plotOffset.top,
      lineAttr = {
        'stroke-linejoin': 'round',
        'stroke-width': 1,
        'stroke': '#000'
      };

    function plotLine(datapoints, drawAttr, xOffset, yOffset, axisX, axisY) {
      var
        points = datapoints.points,
        pointSize = datapoints.pointsize,
        prevX = null,
        prevY = null,
        pi, pl,
        x1, y1,
        x2, y2,
        path = [];

      for (pi = pointSize, pl = points.length; pi < pl; pi += pointSize) {
        x1 = points[pi - pointSize];
        y1 = points[pi - pointSize + 1];
        x2 = points[pi];
        y2 = points[pi + 1];

        if (x1 == null || x2 == null) {
          continue;
        }

        // clip with y min
        if (y1 <= y2 && y1 < axisY.min) {
          if (y2 < axisY.min) {
            continue;
          }   // line segment is outside

          // compute new intersection point
          x1 = (axisY.min - y1) / (y2 - y1) * (x2 - x1) + x1;
          y1 = axisY.min;
        } else if (y2 <= y1 && y2 < axisY.min) {
          if (y1 < axisY.min) {
            continue;
          }
          x2 = (axisY.min - y1) / (y2 - y1) * (x2 - x1) + x1;
          y2 = axisY.min;
        }

        // clip with y max
        if (y1 >= y2 && y1 > axisY.max) {
          if (y2 > axisY.max) {
            continue;
          }
          x1 = (axisY.max - y1) / (y2 - y1) * (x2 - x1) + x1;
          y1 = axisY.max;
        } else if (y2 >= y1 && y2 > axisY.max) {
          if (y1 > axisY.max) {
            continue;
          }
          x2 = (axisY.max - y1) / (y2 - y1) * (x2 - x1) + x1;
          y2 = axisY.max;
        }

        // clip with x min
        if (x1 <= x2 && x1 < axisX.min) {
          if (x2 < axisX.min) {
            continue;
          }
          y1 = (axisX.min - x1) / (x2 - x1) * (y2 - y1) + y1;
          x1 = axisX.min;
        } else if (x2 <= x1 && x2 < axisX.min) {
          if (x1 < axisX.min) {
            continue;
          }
          y2 = (axisX.min - x1) / (x2 - x1) * (y2 - y1) + y1;
          x2 = axisX.min;
        }

        // clip with x max
        if (x1 >= x2 && x1 > axisX.max) {
          if (x2 > axisX.max) {
            continue;
          }
          y1 = (axisX.max - x1) / (x2 - x1) * (y2 - y1) + y1;
          x1 = axisX.max;
        } else if (x2 >= x1 && x2 > axisX.max) {
          if (x1 > axisX.max) {
            continue;
          }
          y2 = (axisX.max - x1) / (x2 - x1) * (y2 - y1) + y1;
          x2 = axisX.max;
        }

        if (x1 != prevX || y1 != prevY) {
          path.push('M', axisX.p2c(x1) + xOffset, ' ', axisY.p2c(y1) + yOffset);
        }

        prevX = x2;
        prevY = y2;
        path.push('L', axisX.p2c(x2) + xOffset, ' ', axisY.p2c(y2) + yOffset);
      }

      plotr.canvas
        .path(path)
        .transform(transform)
        .attr(drawAttr);
    }

    function plotLineArea(datapoints, drawAttr, axisX, axisY) {
      var
        points = datapoints.points,
        pointSize = datapoints.pointsize,
        bottom = Math.min(Math.max(0, axisY.min), axisY.max),
        pi = 0,
        x1, y1,
        x2, y2,
        oldX1 = x1, oldX2 = x2,
        top,
        areaOpen = false,
        yPos = 1,
        segmentStart = 0, segmentEnd = 0,
        path = [];

      // We process each segment in two turns, first forward direction to sketch out top, then once we hit the
      // end we go backwards to sketch the bottom
      while (true) {
        if (pointSize > 0 && pi > points.length + pointSize) {
          break;
        }

        pi += pointSize; // ps is negative if going backwards

        x1 = points[pi - pointSize];
        y1 = points[pi - pointSize + yPos];
        x2 = points[pi];
        y2 = points[pi + yPos];

        if (areaOpen) {
          if (pointSize > 0 && x1 != null && x2 == null) {
            // at turning point
            segmentEnd = pi;
            pointSize = -pointSize;
            yPos = 2;
            continue;
          }

          if (pointSize < 0 && pi == segmentStart + pointSize) {
            // done with the reverse sweep
            plotr.canvas
              .path(path.join(''))
              .transform(transform)
              .attr(drawAttr);

            areaOpen = false;
            pointSize = -pointSize;
            yPos = 1;
            pi = segmentStart = segmentEnd + pointSize;
            continue;
          }
        }

        if (x1 == null || x2 == null) {
          continue;
        }

        // clip x values

        // clip with x min
        if (x1 <= x2 && x1 < axisX.min) {
          if (x2 < axisX.min) {
            continue;
          }
          y1 = (axisX.min - x1) / (x2 - x1) * (y2 - y1) + y1;
          x1 = axisX.min;
        } else if (x2 <= x1 && x2 < axisX.min) {
          if (x1 < axisX.min) {
            continue;
          }
          y2 = (axisX.min - x1) / (x2 - x1) * (y2 - y1) + y1;
          x2 = axisX.min;
        }

        // clip with x max
        if (x1 >= x2 && x1 > axisX.max) {
          if (x2 > axisX.max) {
            continue;
          }
          y1 = (axisX.max - x1) / (x2 - x1) * (y2 - y1) + y1;
          x1 = axisX.max;
        } else if (x2 >= x1 && x2 > axisX.max) {
          if (x1 > axisX.max) {
            continue;
          }
          y2 = (axisX.max - x1) / (x2 - x1) * (y2 - y1) + y1;
          x2 = axisX.max;
        }

        if (!areaOpen) {
          // open area
          path = ['M', axisX.p2c(x1), ' ', axisY.p2c(bottom)];
          areaOpen = true;
        }

        // now first check the case where both is outside
        if (y1 >= axisY.max && y2 >= axisY.max) {
          path.push('L', axisX.p2c(x1), ' ', axisY.p2c(axisY.max));
          path.push('L', axisX.p2c(x2), ' ', axisY.p2c(axisY.max));
          continue;
        } else if (y1 <= axisY.min && y2 <= axisY.min) {
          path.push('L', axisX.p2c(x1), ' ', axisY.p2c(axisY.min));
          path.push('L', axisX.p2c(x2), ' ', axisY.p2c(axisY.min));
          continue;
        }

        // else it's a bit more complicated, there might be a flat maxed out rectangle first, then a
        // triangular cutout or reverse; to find these keep track of the current x values
        oldX1 = x1;
        oldX2 = x2;

        // clip the y values, without shortcutting, we go through all cases in turn

        // clip with y min
        if (y1 <= y2 && y1 < axisY.min && y2 >= axisY.min) {
          x1 = (axisY.min - y1) / (y2 - y1) * (x2 - x1) + x1;
          y1 = axisY.min;
        } else if (y2 <= y1 && y2 < axisY.min && y1 >= axisY.min) {
          x2 = (axisY.min - y1) / (y2 - y1) * (x2 - x1) + x1;
          y2 = axisY.min;
        }

        // clip with y max
        if (y1 >= y2 && y1 > axisY.max && y2 <= axisY.max) {
          x1 = (axisY.max - y1) / (y2 - y1) * (x2 - x1) + x1;
          y1 = axisY.max;
        } else if (y2 >= y1 && y2 > axisY.max && y1 <= axisY.max) {
          x2 = (axisY.max - y1) / (y2 - y1) * (x2 - x1) + x1;
          y2 = axisY.max;
        }

        // if the x value was changed we got a rectangle to fill
        if (x1 != oldX1) {
          path.push('L', axisX.p2c(oldX1), ' ', axisY.p2c(y1));
          // it goes to (x1, y1), but we fill that below
        }

        // fill triangular section, this sometimes result
        // in redundant points if (x1, y1) hasn't changed
        // from previous line to, but we just ignore that
        path.push('L', axisX.p2c(x1), ' ', axisY.p2c(y1));
        path.push('L', axisX.p2c(x2), ' ', axisY.p2c(y2));

        // fill the other rectangle if it's there
        if (x2 != oldX2) {
          path.push('L', axisX.p2c(x2), ' ', axisY.p2c(y2));
          path.push('L', axisX.p2c(oldX2), ' ', axisY.p2c(y2));
        }
      }
    }

    // FIXME: consider another form of shadow when filling is turned on
    if (lineWidth > 0 && shadowSize > 0) {
      // draw shadow as a thick and thin line with transparency
      lineAttr['stroke-width'] = shadowSize;
      lineAttr['stroke'] = 'rgba(0,0,0,0.1)';

      // position shadow at angle from the mid of line
      angle = Math.PI / 18;
      plotLine(series.datapoints, lineAttr, Math.sin(angle) * (lineWidth / 2 + shadowSize / 2), Math.cos(angle) * (lineWidth / 2 + shadowSize / 2), series.xaxis, series.yaxis);
      lineAttr['stroke-width'] = shadowSize / 2;
      plotLine(series.datapoints, lineAttr, Math.sin(angle) * (lineWidth / 2 + shadowSize / 4), Math.cos(angle) * (lineWidth / 2 + shadowSize / 4), series.xaxis, series.yaxis);
    }

    lineAttr['stroke-width'] = lineWidth;
    lineAttr['stroke'] = series.color;

    fillStyle = getFillStyle(series.lines, series.color);
    if (fillStyle) {
      lineAttr['fill'] = fillStyle;
      plotLineArea(series.datapoints, lineAttr, series.xaxis, series.yaxis);
    }

    if (lineWidth > 0) {
      plotLine(series.datapoints, lineAttr, 0, 0, series.xaxis, series.yaxis);
    }
  }

  function drawBar(plotr, x, y, b, barLeft, barRight, offset, fillStyle, strokeStyle, axisX, axisY, horizontal, lineWidth, transform) {
    var
      left, right, bottom, top,
      drawLeft, drawRight, drawTop, drawBottom,
      path, set,
      hover,
      tmp;

    // In horizontal mode, we start the bar from the left instead of from the bottom so it appears to be
    // horizontal rather than vertical
    if (horizontal) {
      drawBottom = drawRight = drawTop = true;
      drawLeft = false;
      left = b;
      right = x;
      top = y + barLeft;
      bottom = y + barRight;

      // Account for negative bars
      if (right < left) {
        tmp = right;
        right = left;
        left = tmp;
        drawLeft = true;
        drawRight = false;
      }
    } else {
      drawLeft = drawRight = drawTop = true;
      drawBottom = false;
      left = x + barLeft;
      right = x + barRight;
      bottom = b;
      top = y;

      // Account for negative bars
      if (top < bottom) {
        tmp = top;
        top = bottom;
        bottom = tmp;
        drawBottom = true;
        drawTop = false;
      }
    }

    // clip
    if (right < axisX.min || left > axisX.max || top < axisY.min || bottom > axisY.max) {
      return;
    }

    if (left < axisX.min) {
      left = axisX.min;
      drawLeft = false;
    }
    if (right > axisX.max) {
      right = axisX.max;
      drawRight = false;
    }
    if (bottom < axisY.min) {
      bottom = axisY.min;
      drawBottom = false;
    }
    if (top > axisY.max) {
      top = axisY.max;
      drawTop = false;
    }

    left = axisX.p2c(left);
    bottom = axisY.p2c(bottom);
    right = axisX.p2c(right);
    top = axisY.p2c(top);

    plotr.canvas.setStart();

    // Fill the bar
    if (fillStyle) {
      path = [
        'M', left, ' ', bottom,
        'L', left, ' ', top,
        'L', right, ' ', top,
        'L', right, ' ', bottom
      ];
      plotr.canvas
        .path(path.join(''))
        .transform(transform)
        .attr({fill: fillStyle});
    }

    // draw outline
    if (lineWidth > 0 && (drawLeft || drawRight || drawTop || drawBottom)) {
      path = [
        'M', left, ' ', bottom + offset,
        drawLeft ? 'L' : 'M', left, ' ', top + offset,
        drawTop ? 'L' : 'M', right, ' ', top + offset,
        drawRight ? 'L' : 'M', right, ' ', bottom + offset,
        drawBottom ? 'L' : 'M', left, ' ', bottom + offset
      ];

      plotr.canvas
        .path(path.join(''))
        .transform(transform)
        .attr(strokeStyle);
    }

    set = plotr.canvas.setFinish();

    if (plotr.options.grid.hoverable) {
      hover = plotr.canvas.rect(
        left - (drawLeft ? lineWidth/2 : 0),
        top - (drawTop ? lineWidth/2 : 0),
        right - left + (drawRight || drawLeft ? lineWidth : 0),
        bottom - top + (drawBottom || drawTop ? lineWidth : 0)
      );

      hover
        .transform(transform)
        .attr({stroke: null, fill: 'rgba(255, 255, 255, 0)'})
        .data('set', set)
        .hover(onHoverIn, onHoverOut)
        .click(onClick);

      strokeStyle && hover.data('stroke', strokeStyle.stroke);
      fillStyle && hover.data('fill', fillStyle);
    }
  }

  function drawSeriesBars(plotr, series) {
    var
      datapoints = series.datapoints,
      points = datapoints.points,
      pointSize = datapoints.pointsize,
      barLeft, barRight,
      pi, pl,
      transform = 't' + plotr.plotOffset.left + ',' + plotr.plotOffset.top,
      fillStyle = series.bars.fill ? getFillStyle(series.bars, series.color) : null,
      strokeStyle = {
        'stroke-width': series.bars.lineWidth,
        'stroke': series.color
      };


    // FIXME: figure out a way to add shadows (for instance along the right edge)
    barLeft = series.bars.align == 'left' ? 0 : -series.bars.barWidth / 2;
    barRight = barLeft + series.bars.barWidth;

    for (pi = 0, pl = points.length; pi < pl; pi += pointSize) {
      if (points[pi] != null) {
        drawBar(
          plotr,
          points[pi], points[pi + 1],
          points[pi + 2],
          barLeft, barRight,
          0,
          fillStyle, strokeStyle,
          series.xaxis, series.yaxis,
          series.bars.horizontal,
          series.bars.lineWidth,
          transform
        );
      }
    }
  }

  function drawSeriesPoints(plotr, series) {
    var
      lineWidth = series.points.lineWidth,
      shadowSize = series.shadowSize,
      radius = series.points.radius,
      symbol = series.points.symbol,
      width,
      drawStyle = {
        'stroke-width': series.bars.lineWidth,
        'stroke': series.color
      },
      transform = 't' + plotr.plotOffset.left + ',' + plotr.plotOffset.top;

    function plotPoints(canvas, datapoints, radius, drawStyle, offset, shadow, axisX, axisY, symbol) {
      var
        points = datapoints.points,
        pointSize = datapoints.pointsize,
        pi, pl,
        x, y,
        element;

      for (pi = 0, pl = points.length ; pi < pl; pi += pointSize) {
        x = points[pi];
        y = points[pi + 1];

        if (x == null || x < axisX.min || x > axisX.max || y < axisY.min || y > axisY.max) {
          continue;
        }

        x = axisX.p2c(x);
        y = axisY.p2c(y) + offset;

        if (symbol == 'circle') {
          element = shadow
            ? canvas.path(arc(x, y, 0, 180, radius))
            : canvas.circle(x, y, radius);
        } else {
          element = canvas.path(symbol(x, y, radius, shadow));
        }

        element
          .transform(transform)
          .attr(drawStyle);
      }
    }

    if (lineWidth > 0 && shadowSize > 0) {
      // draw shadow in two steps
      width = shadowSize / 2;

      drawStyle = {
        'stroke-width': width,
        'stroke': 'rgba(0,0,0,0.1)'
      };

      plotPoints(
        plotr.canvas,
        series.datapoints,
        radius,
        drawStyle,
        width + width / 2,
        true,
        series.xaxis, series.yaxis,
        symbol
      );

      drawStyle.stroke = 'rgba(0,0,0,0.2)';
      plotPoints(
        plotr.canvas,
        series.datapoints,
        radius,
        drawStyle,
        width / 2,
        true,
        series.xaxis, series.yaxis,
        symbol
      );
    }

    drawStyle = {
      'stroke-width': lineWidth,
      'stroke': series.color,
      'fill': getFillStyle(series.points, series.color)
    };

    plotPoints(
      plotr.canvas,
      series.datapoints,
      radius,
      drawStyle,
      0,
      false,
      series.xaxis, series.yaxis,
      symbol
    );
  }

  function drawSeries(plotr, series) {
    if (series.lines.show) {
      drawSeriesLines(plotr, series);
    }
    if (series.bars.show) {
      drawSeriesBars(plotr, series);
    }
    if (series.points.show) {
      drawSeriesPoints(plotr, series);
    }
  }


  function Plotr(placeholder, data_, options_, plugins) {
    this.placeholder = null;
    this.series = [];
    this.options = {
      colors: ['#edc240', '#afd8f8', '#cb4b4b', '#4da74d', '#9440ed'],
      legend: {
        show: true,
        noColumns: 1, // number of columns in legend table
        labelFormatter: null, // fn: string -> string
        labelBoxBorderColor: '#ccc', // border color for the little label boxes
        container: null, // container (as jQuery object) to put legend in, null means default on top of graph
        position: 'ne', // position of default legend container within plot
        margin: 5, // distance from grid edge to default legend container within plot
        backgroundColor: null, // null means auto-detect
        backgroundOpacity: 0.85         // set to 0 to avoid background
      },
      xaxis: {
        show: null, // null = auto-detect, true = always, false = never
        position: 'bottom', // or "top"
        mode: null, // null or "time"
        font: null, // null (derived from CSS in placeholder) or object like { size: 11, style: "italic", weight: "bold", family: "sans-serif", variant: "small-caps" }
        color: null, // base color, labels, ticks
        tickColor: null, // possibly different color of ticks, e.g. "rgba(0,0,0,0.15)"
        transform: null, // null or f: number -> number to transform axis
        inverseTransform: null, // if transform is set, this should be the inverse function
        min: null, // min. value to show, null means set automatically
        max: null, // max. value to show, null means set automatically
        autoscaleMargin: null, // margin in % to add if auto-setting min/max
        ticks: null, // either [1, 3] or [[1, "a"], 3] or (fn: axis info -> ticks) or app. number of ticks for auto-ticks
        tickFormatter: null, // fn: number -> string
        labelWidth: null, // size of tick labels in pixels
        labelHeight: null,
        reserveSpace: null, // whether to reserve space even if axis isn't shown
        tickLength: null, // size in pixels of ticks, or "full" for whole line
        alignTicksWithAxis: null, // axis number or null for no sync

        // mode specific options
        tickDecimals: null, // no. of decimals, null means auto
        tickSize: null, // number or [number, "unit"]
        minTickSize: null, // number or [number, "unit"]
        monthNames: null, // list of names of months
        timeformat: null, // format string to use
        twelveHourClock: false          // 12 or 24 time in time mode
      },
      yaxis: {
        autoscaleMargin: 0.02,
        position: "left"                // or "right"
      },
      xaxes: [],
      yaxes: [],
      series: {
        points: {
          show: false,
          radius: 3,
          lineWidth: 2, // in pixels
          fill: true,
          fillColor: '#ffffff',
          symbol: 'circle'            // or callback
        },
        lines: {
          // we don't put in show: false so we can see whether lines were actively disabled
          lineWidth: 2, // in pixels
          fill: false,
          fillColor: null,
          steps: false
        },
        bars: {
          show: false,
          lineWidth: 2, // in pixels
          barWidth: 1, // in units of the x axis
          fill: true,
          fillColor: null,
          align: 'left', // or "center"
          horizontal: false
        },
        shadowSize: 3
      },
      grid: {
        show: true,
        aboveData: false,
        color: '#545454', // primary color used for outline and labels
        backgroundColor: null, // null for transparent, else color
        borderColor: null, // set if different from the grid color
        tickColor: null, // color for the ticks, e.g. 'rgba(0,0,0,0.15)'
        labelMargin: 5, // in pixels
        axisMargin: 8, // in pixels
        borderWidth: 2, // in pixels
        minBorderMargin: null, // in pixels, null means taken from points radius
        markings: null, // array of ranges or fn: axes -> array of ranges
        markingsColor: '#f4f4f4',
        markingsLineWidth: 2,

        // interactive stuff
        clickable: false,
        hoverable: false,
        autoHighlight: true, // highlight in case mouse is near
        mouseActiveRadius: 10           // how far the mouse can be away to activate an item
      },
      interaction: {
        redrawOverlayInterval: 1000 / 60  // time between updates, -1 means in same flow
      },
      hooks: {}
    };
    this.hooks = {
      processOptions: [],
      processRawData: [],
      processDatapoints: [],
      drawSeries: [],
      draw: [],
      bindEvents: [],
      drawOverlay: [],
      shutdown: []
    };
    this.plotOffset = {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0
    };
    this.xAxes = [];
    this.yAxes = [];
    this.canvasWidth = 0;
    this.canvasHeight = 0;
    this.plotWidth = 0;
    this.plotHeight = 0;
    this.canvas = null;

      // Initialize
    this.initPlugins(plugins);
    this.parseOptions(options_);
    this.setupCanvas(placeholder);
    this.setData(data_);
    this.setupGrid();
    this.draw();
    this.bindEvents();
  }

  Plotr.prototype = {
    constructor: Plotr,

    setupGrid: function () {
      var
        options = this.options,
        plotOffset = this.plotOffset,
        placeholder = this.placeholder,
        axes = allAxes(this),
        showGrid = options.grid.show,
        offset,
        fontDefaults,
        allocatedAxes,
        ai, al, axis;

      // init plot offset
      for (offset in plotOffset) {
        if (plotOffset.hasOwnProperty(offset)) {
          plotOffset[offset] = showGrid ? options.grid.borderWidth : 0;
        }
      }

      // init axes
      for (ai = 0, al = axes.length; ai < al; ai++) {
        axis = axes[ai];
        axis.show = axis.options.show;
        if (axis.show == null) {
          axis.show = axis.used;
        } // by default an axis is visible if it's got data

        axis.reserveSpace = axis.show || axis.options.reserveSpace;

        setRange(axis);
      }

      if (showGrid) {
        // determine from the placeholder the font size ~ height of font ~ 1 em
        fontDefaults = {
          style: placeholder.css('font-style'),
          size: Math.round(0.8 * (+placeholder.css('font-size').replace('px', '') || 13)),
          variant: placeholder.css('font-variant'),
          weight: placeholder.css('font-weight'),
          family: placeholder.css('font-family')
        };

        allocatedAxes = $.grep(axes, function (axis) { return axis.reserveSpace; });


        for (ai = 0, al = axes.length; ai < al; ai++) {
          // make the ticks
          axis = axes[ai];
          setupTickGeneration(this, axis);
          setTicks(axis);
          snapRangeToTicks(axis, axis.ticks);

          // find labelWidth/Height for axis
          axis.font = $.extend({}, fontDefaults, axis.options.font);
          measureTickLabels(this, axis);
        }

        // with all dimensions calculated, we can compute the
        // axis bounding boxes, start from the outside
        // (reverse order)
        for (ai = allocatedAxes.length - 1; ai >= 0; ai--) {
          allocateAxisBoxFirstPhase(this, allocatedAxes[ai]);
        }

        // make sure we've got enough space for things that
        // might stick out
        adjustLayoutForThingsStickingOut(this);

        for (ai = 0, al = allocatedAxes.length; ai < al; ai++) {
          allocateAxisBoxSecondPhase(this, allocatedAxes[ai]);
        }
      }

      this.plotWidth = this.canvasWidth - plotOffset.left - plotOffset.right;
      this.plotHeight = this.canvasHeight - plotOffset.bottom - plotOffset.top;

      // now we got the proper plot dimensions, we can compute the scaling
      for (ai = 0, al = axes.length; ai < al; ai++) {
        setTransformationHelpers(this, axes[ai]);
      }

      insertLegend(this);
    },

    draw: function () {
      var
        series = this.series,
        grid = this.options.grid,
        canvas = this.canvas,
        i, sl;

      canvas.clear();

      // draw background, if any
      if (grid.show && grid.backgroundColor) {
        drawBackground(this);
      }

      if (grid.show && !grid.aboveData) {
        drawGrid(this);
        drawAxisLabels(this);
      }

      for (i = 0, sl = series.length; i < sl; ++i) {
        executeHooks(this, this.hooks.drawSeries, [canvas, series[i]]);
        drawSeries(this, series[i]);
      }

      executeHooks(this, this.hooks.draw, [canvas]);

      if (grid.show && grid.aboveData) {
        drawGrid(this);
        drawAxisLabels(this);
      }
    },

    bindEvents: function () {
/*
      // bind events
      if (options.grid.hoverable) {
        eventHolder.mousemove(onMouseMove);
        eventHolder.mouseleave(onMouseLeave);
      }

      if (options.grid.clickable) {
        eventHolder.click(onClick);
      }

      executeHooks(hooks.bindEvents, [eventHolder]);
*/
    },

    initPlugins: function (plugins) {
      var i, l, p;
      for (i = 0, l = plugins.length, p = null; i < l; ++i) {
        p = plugins[i];
        p.init(this);
        p.options && $.extend(true, this.options, p.options);
      }
    },

    parseOptions: function (opts) {
      var
        i, l,
        hook,
        options = this.options,
        hooks = this.hooks,
        xAxes = this.xAxes,
        yAxes = this.yAxes;

      $.extend(true, options, opts);

      options.xaxis.color = options.xaxis.color || options.grid.color;
      options.yaxis.color = options.yaxis.color || options.grid.color;

      // backwards-compatibility
      options.xaxis.tickColor = options.xaxis.tickColor || options.grid.tickColor;
      options.yaxis.tickColor = options.yaxis.tickColor || options.grid.tickColor;

      options.grid.borderColor = options.grid.borderColor || options.grid.color;
      options.grid.tickColor = options.grid.tickColor || Color.parse(options.grid.color).scale('a', 0.22).toString();

      // Fill in defaults in axes,
      // copy at least always the first as the rest of the code assumes it'll be there
      for (i = 0, l = Math.max(1, options.xaxes.length); i < l; ++i) {
        options.xaxes[i] = $.extend(true, {}, options.xaxis, options.xaxes[i]);
      }
      for (i = 0, l = Math.max(1, options.yaxes.length); i < l; ++i) {
        options.yaxes[i] = $.extend(true, {}, options.yaxis, options.yaxes[i]);
      }

      if (options.xaxis.noTicks && options.xaxis.ticks == null) {
        options.xaxis.ticks = options.xaxis.noTicks;
      }
      if (options.yaxis.noTicks && options.yaxis.ticks == null) {
        options.yaxis.ticks = options.yaxis.noTicks;
      }
      if (options.x2axis) {
        options.xaxes[1] = $.extend(true, {}, options.xaxis, options.x2axis);
        options.xaxes[1].position = 'top';
      }
      if (options.y2axis) {
        options.yaxes[1] = $.extend(true, {}, options.yaxis, options.y2axis);
        options.yaxes[1].position = 'right';
      }
      if (options.grid.coloredAreas) {
        options.grid.markings = options.grid.coloredAreas;
      }
      if (options.grid.coloredAreasColor) {
        options.grid.markingsColor = options.grid.coloredAreasColor;
      }
      if (options.lines) {
        $.extend(true, options.series.lines, options.lines);
      }
      if (options.points) {
        $.extend(true, options.series.points, options.points);
      }
      if (options.bars) {
        $.extend(true, options.series.bars, options.bars);
      }
      if (options.shadowSize != null) {
        options.series.shadowSize = options.shadowSize;
      }

      // Save options on axes for future reference
      for (i = 0, l = options.xaxes.length; i < l; ++i) {
        getOrCreateAxis(xAxes, i + 1, options.xaxes, 'x').options = options.xaxes[i];
      }
      for (i = 0, l = options.yaxes.length; i < l; ++i) {
        getOrCreateAxis(yAxes, i + 1, options.yaxes, 'y').options = options.yaxes[i];
      }

      // Add hooks from options
      for (hook in hooks) {
        if (hooks.hasOwnProperty(hook) && (options.hooks[hook] && options.hooks[hook].length)) {
          hooks[hook] = hooks[hook].concat(options.hooks[hook]);
        }
      }

      executeHooks(this, hooks.processOptions, [options]);
    },

    setupCanvas: function (placeholder) {
      this.placeholder = placeholder = $(placeholder);
      this.canvasWidth = placeholder.width();
      this.canvasHeight = placeholder.height();
      this.canvas = R(placeholder.get(0), this.canvasWidth, this.canvasHeight);

      //TODO: Handle reuse?
    },

    setData: function (data) {
      this.series = parseData(this, data);
      fillInSeriesOptions(this);
      processData(this);
    },

    getAxes: function () {
      var
        res = {},
        xAxes = this.xAxes,
        yAxes = this.yAxes,
        axis, ai, al;

      for (ai = 0, al = xAxes.length; ai < al; ai++) {
        axis = xAxes[ai];
        if (axis) {
          res[axis.direction + (axis.n != 1 ? axis.n : '') + 'axis'] = axis;
        }
      }
      for (ai = 0, al = yAxes.length; ai < al; ai++) {
        axis = yAxes[ai];
        if (axis) {
          res[axis.direction + (axis.n != 1 ? axis.n : '') + 'axis'] = axis;
        }
      }

      return res;
    },

    /**
     * Return an object with x/y corresponding to all used axes
     *
     * @param pos
     * @return {Object}
     */
    canvasToAxisCoords: function (pos) {
      var
        res = {},
        ai, al,
        axis;

      for (ai = 0, al = this.xAxes.length; ai < al; ai++) {
        axis = this.xAxes[ai];
        if (axis && axis.used) {
          res['x' + axis.n] = axis.c2p(pos.left);
        }
      }

      for (ai = 0, al = this.yAxes.length; ai < al; ++ai) {
        axis = this.yAxes[ai];
        if (axis && axis.used) {
          res["y" + axis.n] = axis.c2p(pos.top);
        }
      }

      if (res.x1 !== undefined) {
        res.x = res.x1;
      }
      if (res.y1 !== undefined) {
        res.y = res.y1;
      }

      return res;
    },

    /**
     * Get canvas coords from the first pair of x/y found in pos
     *
     * @param pos
     * @return {Object}
     */
    axisToCanvasCoords: function (pos) {
      var
        res = {},
        key,
        ai, al,
        axis;

      for (ai = 0, al = this.xAxes.length; ai < al; ai++) {
        axis = this.xAxes[ai];
        if (axis && axis.used) {
          key = 'x' + axis.n;
          if (pos[key] == null && axis.n == 1) {
            key = 'x';
          }

          if (pos[key] != null) {
            res.left = axis.p2c(pos[key]);
            break;
          }
        }
      }

      for (ai = 0, al = this.yAxes.length; ai < al; ++ai) {
        axis = this.yAxes[ai];
        if (axis && axis.used) {
          key = 'y' + axis.n;
          if (pos[key] == null && axis.n == 1) {
            key = 'y';
          }

          if (pos[key] != null) {
            res.top = axis.p2c(pos[key]);
            break;
          }
        }
      }

      return res;
    },

    getPlaceholder: function () { return this.placeholder; },
    getCanvas: function () { return this.canvas;  },
    getPlotOffset: function () { return this.plotOffset;  },
    getData: function () { return this.series; },
    getXAxes: function () { return this.xAxes; },
    getYAxes: function () { return this.yAxes; },
    getOptions: function () { return this.options; },

    __dbgend: 0
  };

  //TODO: Make placeholder declaration compatible with flot
  $.plotr = function (placeholder, data, options) {
    return new Plotr(placeholder, data, options, $.plotr.plugins);
  };

  $.plotr.version = '0.1';
  $.plotr.plugins = [];

  /**
   * Returns a string with the date d formatted according to fmt
   *
   * @param d
   * @param {!String} fmt
   * @param {String=} monthNames
   * @return {!String}
   */
  $.plotr.formatDate = function (d, fmt, monthNames) {
    var
      r = [],
      escape = false,
      padNext = false,
      hours = d.getUTCHours(),
      isAM = hours < 12,
      i, c, l,
      leftPad = function (n) {
        n = '' + n;
        return n.length === 1 ? '0' + n : n;
      };

    monthNames = monthNames || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    if (fmt.search(/%p|%P/) !== -1) {
      if (hours > 12) {
        hours = hours - 12;
      } else if (hours === 0) {
        hours = 12;
      }
    }

    for (i = 0, l = fmt.length; i < l; ++i) {
      c = fmt.charAt(i);

      if (escape) {
        switch (c) {
          case 'h':
            c = '' + hours;
            break;
          case 'H':
            c = leftPad(hours);
            break;
          case 'M':
            c = leftPad(d.getUTCMinutes());
            break;
          case 'S':
            c = leftPad(d.getUTCSeconds());
            break;
          case 'd':
            c = '' + d.getUTCDate();
            break;
          case 'm':
            c = '' + (d.getUTCMonth() + 1);
            break;
          case 'y':
            c = '' + d.getUTCFullYear();
            break;
          case 'b':
            c = '' + monthNames[d.getUTCMonth()];
            break;
          case 'p':
            c = (isAM) ? ('' + 'am') : ('' + 'pm');
            break;
          case 'P':
            c = (isAM) ? ('' + 'AM') : ('' + 'PM');
            break;
          case '0':
            c = '';
            padNext = true;
            break;
        }

        if (c && padNext) {
          c = leftPad(c);
          padNext = false;
        }

        r.push(c);

        if (!padNext) {
          escape = false;
        }
      } else {
        if (c === '%') {
          escape = true;
        }
        else {
          r.push(c);
        }
      }
    }

    return r.join('');
  };
})(jQuery);
