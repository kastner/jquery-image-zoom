(function ($) {
    $.fn.gangZoom = function (options) {
        var opts = $.extend({}, $.fn.gangZoom.defaults, options);

        if (! $.fn.gangZoom.styleAdded && opts.defaultStyle) {
            $("<style type='text/css'>" + opts.defaultStyle + "</style>").appendTo("head");
            $.fn.gangZoom.styleAdded = true;
        }

        return this.each(function() {
            var self = this;
            self.img = $(self);
            self.mouseDown = false;

            self.getTimes = function () {
                var timeSpan = opts.endTime - opts.startTime;
                var graphWidth = self.img.width() - (opts.paddingLeft + opts.paddingRight);
                var secondsPerPixel = timeSpan / graphWidth;
                var selWidth = self.float.width();
                var selStart = self.float.position().left - self.img.offset().left;
                var selStartTime = opts.startTime + ((selStart - opts.paddingLeft) * secondsPerPixel);
                var selEndTime = selWidth * secondsPerPixel + selStartTime;

                return { startTime: selStartTime, endTime: selEndTime };
            }

            self.cancel = function () {
                self.mouseDown = false;
                var box = self.getTimes();
                opts.cancel(box.startTime, box.endTime);
            };

            self.go = function () {
                self.mouseDown = false;
                var box = self.getTimes();
                opts.done(box.startTime, box.endTime);
            };

            self.updateOverlay = function (evt) {
                var curX = evt.pageX;
                if (self.startX > curX) {
                    self.float.css({ left: curX });
                }

                self.float.width(Math.abs(curX - self.startX));
            };

            $(document.body).mouseup(function (event) {
                if (self.mouseDown) {
                    if (event.target == self.img || event.target == self.float[0]) {
                        self.go();
                    } else {
                        self.cancel();
                    }
                }
            })
            .mousemove(function (event) {
                if (self.mouseDown) {
                    if (event.target == self.float[0]) {
                        self.updateOverlay(event);
                    }
                }
            })
            .keyup(function (event) {
                if (event.keyCode == 27 && self.mouseDown) {
                    self.cancel();
                }
            });

            self.img.mousedown(function (event) {
                event.preventDefault();
                self.shouldStopClick = false;
                var evt = event;

                setTimeout(function () {
                    evt.stopPropagation();

                    self.shouldStopClick = true;
                    self.mouseDown = true;

                    $("#" + opts.floatId).remove();

                    var clickX = evt.pageX;
                    var clickY = evt.pageY;

                    self.startX = clickX;

                    var float = $("<div id='" + opts.floatId + "'>")
                        .css({
                          position: "absolute", left: clickX,
                          top: self.img.position().top + opts.paddingTop, zIndex: 1000,
                          height: self.img.height() - (opts.paddingBottom + opts.paddingTop)
                        })
                        .width(10)
                        .mousemove(function(evt) { return true; })
                        .mouseup(function() { return true; })
                        .keyup(function() { return true; })
                        .appendTo(document.body);

                    self.float = float;

                }, opts.clickTimeout);
            })
            .mousemove(function (evt) {
                if (self.mouseDown && self.float) {
                    self.updateOverlay(evt);
                }
            })
            .mouseup(function (evt) {
                if (self.mouseDown) {
                    self.go();
                }
            })
            .click(function (event) {
                if (self.shouldStopClick) {
                    event.preventDefault();
                }
            });
        });
    }

    $.fn.gangZoom.defStyle = "#gangZoomFloater {";
    $.fn.gangZoom.defStyle += "border: 1px solid black;";
    $.fn.gangZoom.defStyle += "background: white;";
    $.fn.gangZoom.defStyle += "opacity: 0.7;";
    $.fn.gangZoom.defStyle += "position: absolute;";
    $.fn.gangZoom.defStyle += "top: 0;";
    $.fn.gangZoom.defStyle += "height: 100%;";

    $.fn.gangZoom.defaults = {
        clickTimeout: 500,
        floatId: 'gangZoomFloater',
        defaultStyle: $.fn.gangZoom.defStyle,
        startTime: ((new Date()).getTime() / 1000) - 3600,
        endTime: (new Date()).getTime() / 1000,
        paddingLeft: 20,
        paddingRight: 20,
        paddingTop: 20,
        paddingBottom: 40,
        done: function (startTime, endTime) {},
        cancel: function (startTime, endTime) {}
    }

    $.fn.gangZoom.styleAdded = false;
})(jQuery);
