/*******************************************************************************
The MIT License (MIT)

Copyright (c) 2016 Matchbox Mobile Limited <info@matchboxmobile.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*******************************************************************************/

// =============================================================================
// Utils - some utility functions, used in othe part of the plugin
// =============================================================================
var Utils = {
    convertStringIntoProperCsharpName: function(src) {
        // uppercase for any word start
        src = src.trim().replace(/\s\w/gi, function myFunction(x){return x.toUpperCase().trim();});
        // remove all non-word characters
        src = src.replace(/\W|\s/gi, "");
        return src;
    },
    logger: {
        current : 0,
        intentSize : 3,
        prefix : "",
        intentCharacter : " ",
        enabled : true,
        additionalPrefix : "",
        currentCache : "",
        intent : function() {
            this.current += this.intentSize;
            this.updatePrefix();
            return this;
        },
        unintent : function() {
            this.current -= this.intentSize;
            if(this.current < 0) this.current = 0;
            return this.updatePrefix();
        },
        resetIntentation : function() {
            this.current = 0;
            return this.updatePrefix();
        },
        updatePrefix : function() {
            this.prefix = Array(this.current+1).join(this.intentCharacter);
            return this;
        },
        enable : function() {
            this.enabled = true;
            return this;
        },
        disable : function() {
            this.enabled = false;
            return this;
        },
        setEnabled : function(state) {
            this.enabled = state;
            return this;
        },
        d : function(txt) {
            if (this.enabled) {
                log(this.additionalPrefix + this.prefix + txt);
            }
            return this;
        },
        newLine : function() {
            return this.d("\n");
        },
        setPrefix : function(txt) {
            this.additionalPrefix = "[" + txt + "]: ";
            return this;
        },
        clearPrefix : function() {
            this.additionalPrefix = "";
            return this;
        },
        cache : function(txt) {
            this.currentCache = this.currentCache + this.additionalPrefix + this.prefix + txt + "\n";
            return this;
        },
        cacheNewLine : function(txt) {
            this.currentCache = this.currentCache + "\n";
            return this;
        },
        flushCache : function() {
            if (this.enabled) {
                log(this.currentCache);
            }
            this.currentCache = "";
            return this;
        }
    }
}
// Extending functionality of some of the built-in types:
Date.prototype.toSimpleDate = function() {
    var mon = this.getUTCMonth() + 1;
    if(mon < 10) mon = "0" + mon;
    var day = this.getUTCDate();
    if(day < 10) day = "0" + day;
    return this.getUTCFullYear() + "." + mon + "." + day;
}
Date.prototype.toSimpleDateWithTime = function() {
    var d = this.toSimpleDate() + " ";
    var h = this.getUTCHours();
    if(h < 10) h = "0" + h;
    var m = this.getUTCMinutes();
    if(m < 10) m = "0" + m;
    return d + h + ":" + m;
}
String.prototype.endsWith = String.prototype.endsWith || function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
}
