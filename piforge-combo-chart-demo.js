/**
 * PIForge Combo Chart - Free Edition
 * Up to 3 Trend Lines + 1 Bar Series · Single Y-Axis · Display Time Mode
 * Full version: https://piforge.app
 */

(function (PV) {
    "use strict";

    function symbolVis() { }
    PV.deriveVisualizationFromBase(symbolVis);

    var definition = {
        typeName: "piforge-combo-chart-demo",
        displayName: "Combo Chart (Free)",
        datasourceBehavior: PV.Extensibility.Enums.DatasourceBehaviors.Multiple,
        visObjectType: symbolVis,
        iconUrl: "Scripts/app/editor/symbols/ext/piforge-combo-chart-demo.svg",
        templateUrl: "Scripts/app/editor/symbols/ext/piforge-combo-chart-demo-template.html?v=1.2",
        configTemplateUrl: "Scripts/app/editor/symbols/ext/piforge-combo-chart-demo-config.html?v=1.2",

        getDefaultConfig: function () {
            return {
                DataShape: 'TimeSeries',
                Height: 400,
                Width: 800,

                // Up to 3 trend lines
                TrendStreams: [
                    { enabled: true,  stream: "0", label: "Trend 1", color: "#4fc3f7" },
                    { enabled: false, stream: "",  label: "Trend 2", color: "#66bb6a" },
                    { enabled: false, stream: "",  label: "Trend 3", color: "#ef5350" }
                ],

                // Single bar series
                BarEnabled: true,
                BarStream: "1",
                BarLabel: "Bar",
                BarColor: "#ff7043",
                BarOpacity: 0.8,

                ShowLegend: true,
                ShowGrid: true,
                ShowLeftAxis: true,
                BackgroundColor: 'transparent',
                TextColor: '#ffffff',
                GridColor: 'rgba(255,255,255,0.1)',

                Tags: []
            };
        },
        configOptions: function (context, clickedElement, menuOptions, layoutOptions) {
            // Match the proven health-symbol pattern for this PI Vision build
            menuOptions.push({ title: 'Format Symbol', mode: 'format' });
        }
    };

    symbolVis.$inject = ['scope', 'elem'];
    symbolVis.prototype.init = function (scope, elem) {
        this.onDataUpdate = dataUpdate;
        this.onConfigChange = configChange;
        this.onResize = resize;

        var _width = 800, _height = 400;
        var _availableStreams = [];

        scope.viewBox = "0 0 " + _width + " " + _height;
        scope.trendPaths = [];
        scope.barRects = [];
        scope.xTicks = [];
        scope.yTicksLeft = [];
        scope.legendItems = [];
        scope.clipRect = { x: 80, y: 40, width: 640, height: 310 };
        scope.hasData = false;

        // Re-render when series settings change
        scope.$watch('config.TrendStreams', function (n, o) { if (n !== o) render(); }, true);
        scope.$watchGroup(
            ['config.BarEnabled', 'config.BarStream', 'config.BarColor', 'config.BarOpacity'],
            function (n, o) { if (n !== o) render(); }
        );

        function extract(stream) {
            if (!stream || !stream.Values) return [];
            var arr = [];
            stream.Values.forEach(function (d) {
                var v = parseFloat(d.Value);
                if (!isNaN(v) && d.Time) {
                    arr.push({ t: d.Time, v: v, ts: new Date(d.Time).getTime() });
                }
            });
            return arr.sort(function (a, b) { return a.ts - b.ts; });
        }

        function streamLabel(s, idx) {
            if (s && s.Label) return s.Label;
            var key = s && s.Path;
            if (key && key.indexOf && key.indexOf('\\\\') !== -1) {
                var p = key.split('\\\\');
                var nm = p[p.length - 1];
                if (nm.indexOf('|') !== -1) nm = nm.split('|')[1];
                return nm;
            }
            return "Stream " + (idx + 1);
        }

        function dataUpdate(data) {
            if (!data) return;
            var streams = [];
            if (data.Data && Array.isArray(data.Data)) streams = data.Data;
            else if (data.Values) streams = [data];
            if (streams.length === 0) return;

            _availableStreams = streams;

            // Populate Tags for the config panel stream selectors
            scope.config.Tags = streams.map(streamLabel);

            render();
        }

        function resize(w, h) {
            _width = w || 800;
            _height = h || 400;
            scope.viewBox = "0 0 " + _width + " " + _height;
            render();
        }

        function configChange() { render(); }

        function render() {
            // Build active trend series from config
            var trendSeries = [];
            (scope.config.TrendStreams || []).forEach(function (cfg) {
                if (cfg.enabled && cfg.stream !== "") {
                    var idx = parseInt(cfg.stream, 10);
                    if (!isNaN(idx) && idx >= 0 && idx < _availableStreams.length) {
                        trendSeries.push({ data: extract(_availableStreams[idx]), config: cfg });
                    }
                }
            });

            // Build bar series from config
            var barData = [];
            if (scope.config.BarEnabled && scope.config.BarStream !== "") {
                var bidx = parseInt(scope.config.BarStream, 10);
                if (!isNaN(bidx) && bidx >= 0 && bidx < _availableStreams.length) {
                    barData = extract(_availableStreams[bidx]);
                }
            }

            var trendCount = trendSeries.reduce(function (a, s) { return a + s.data.length; }, 0);
            scope.hasData = (trendCount > 0 || barData.length > 0);
            if (!scope.hasData) {
                scope.trendPaths = []; scope.barRects = [];
                scope.xTicks = []; scope.yTicksLeft = []; scope.legendItems = [];
                return;
            }

            var margin = { top: 40, right: 40, bottom: 50, left: 80 };
            var chartW = _width  - margin.left - margin.right;
            var chartH = _height - margin.top  - margin.bottom;
            if (chartH < 50) chartH = 50;

            scope.viewBox = "0 0 " + _width + " " + _height;
            scope.clipRect = { x: margin.left, y: margin.top, width: chartW, height: chartH };

            // Time extent across all series
            var allTs = [];
            trendSeries.forEach(function (s) { s.data.forEach(function (d) { allTs.push(d.ts); }); });
            barData.forEach(function (d) { allTs.push(d.ts); });
            if (allTs.length === 0) return;
            var tMin = Math.min.apply(null, allTs);
            var tMax = Math.max.apply(null, allTs);
            var tSpan = tMax - tMin || 1;

            function xScale(ts) { return margin.left + ((ts - tMin) / tSpan) * chartW; }

            // Value extent (single shared Y-axis)
            var allVals = [];
            trendSeries.forEach(function (s) { s.data.forEach(function (d) { allVals.push(d.v); }); });
            barData.forEach(function (d) { allVals.push(d.v); });
            var vMin = Math.min.apply(null, allVals);
            var vMax = Math.max.apply(null, allVals);
            if (barData.length > 0 && vMin > 0) vMin = 0;
            var pad = (vMax - vMin) * 0.1 || 1;
            vMin -= pad; vMax += pad;
            if (vMax === vMin) vMax = vMin + 1;

            function yScale(v) { return margin.top + chartH - ((v - vMin) / (vMax - vMin)) * chartH; }

            // Trend lines
            scope.trendPaths = [];
            trendSeries.forEach(function (s) {
                if (s.data.length === 0) return;
                var path = "";
                s.data.forEach(function (d, i) {
                    path += (i === 0 ? "M" : "L") + xScale(d.ts) + "," + yScale(d.v);
                });
                scope.trendPaths.push({ d: path, stroke: s.config.color });
            });

            // Bars
            scope.barRects = [];
            if (barData.length > 0) {
                var barW = Math.max(2, Math.min(20, chartW / (barData.length * 1.5)));
                barData.forEach(function (d) {
                    var x = xScale(d.ts) - barW / 2;
                    var y = yScale(d.v);
                    var h = yScale(0) - y;
                    if (h > 0) scope.barRects.push({ x: x, y: y, width: barW, height: h });
                });
            }

            // Y ticks
            scope.yTicksLeft = [];
            if (scope.config.ShowLeftAxis) {
                for (var i = 0; i <= 5; i++) {
                    var val = vMin + (vMax - vMin) * i / 5;
                    scope.yTicksLeft.push({
                        x1: margin.left, x2: margin.left + chartW,
                        y: yScale(val), label: val.toFixed(1)
                    });
                }
            }

            // X ticks
            scope.xTicks = [];
            for (var i = 0; i <= 5; i++) {
                var ts = tMin + tSpan * i / 5;
                var dt = new Date(ts);
                var h = String(dt.getHours()).padStart(2, '0');
                var m = String(dt.getMinutes()).padStart(2, '0');
                var label = (i === 0 || i === 5)
                    ? (String(dt.getFullYear()).slice(-2) + '-' + String(dt.getMonth()+1).padStart(2,'0') + '-' + String(dt.getDate()).padStart(2,'0') + ' ' + h + ':' + m)
                    : (h + ':' + m);
                scope.xTicks.push({ x: xScale(ts), y1: margin.top, y2: margin.top + chartH, label: label });
            }

            // Legend
            scope.legendItems = [];
            trendSeries.forEach(function (s) {
                if (s.data.length > 0) scope.legendItems.push({ label: s.config.label, color: s.config.color, type: 'line' });
            });
            if (barData.length > 0) scope.legendItems.push({ label: scope.config.BarLabel, color: scope.config.BarColor, type: 'rect' });
        }
    };

    PV.symbolCatalog.register(definition);
    console.log('[PIForge] piforge-combo-chart-demo registered OK');

})(window.PIVisualization);
