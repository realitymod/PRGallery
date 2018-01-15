
import * as L from 'leaflet';
import { LatLngBounds } from 'leaflet';

/**
 * A Graticule system to represent the Project reality grid system
 *
 *
 * Based on L.SimpleGraticule.by Andrew Blakey (ablakey@gmail.com)
 */
export class PRGraticule extends L.LayerGroup{
    private mMap : L.Map;
    private mOptions : IOptions;
    private mBounds: L.LatLngBounds;
    private lineStyle = {
        stroke: true,
        color: '#000000',
        opacity: 0.6,
        weight: 3,
        interactive: false,
        clickable: false //legacy support
    };

    constructor(options: IOptions) {
        super();
        //L.Util.setOptions(this, options);
        this.mOptions = options;
    }

    public onAdd(map: L.Map) : this {
        this.mMap = map;

        var graticule = this.redraw();
        this.mMap.on('viewreset ' + this.mOptions.redraw, graticule.redraw, graticule);

        this.eachLayer(map.addLayer, map);

        return this;
    }

    public onRemove(map:L.Map) {
        map.off('viewreset '+ this.mOptions.redraw, undefined);
        this.eachLayer(this.removeLayer, this);

        return this;
    }

    public hide() {
        this.mOptions.hidden = true;
        this.redraw();
    }

    public show() {
        this.mOptions.hidden = false;
        this.redraw();
    }

    public redraw() {
        this.mBounds = this.mOptions.bounds === undefined ? this.mMap.getBounds().pad(0.5) : this.mOptions.bounds; 

        this.clearLayers();

        if (!this.mOptions.hidden) {

            var currentZoom = this.mMap.getZoom();

            for(var i = 0 ; i < this.mOptions.zoomIntervals.length ; i++) {
                if(currentZoom >= this.mOptions.zoomIntervals[i].start && currentZoom <= this.mOptions.zoomIntervals[i].end){
                    this.mOptions.interval = this.mOptions.zoomIntervals[i].interval;
                    break;
                }
            }

            this.constructLines(this.getMins(), this.getLineCounts());

            if (this.mOptions.showOriginLabel) {
                this.addLayer(this.addOriginLabel());
            }
        }

        return this;
    }

    public getLineCounts() {
        return {
            x: Math.floor((this.mBounds.getEast() - this.mBounds.getWest()) /
                this.mOptions.interval),
            y: Math.floor((this.mBounds.getNorth() - this.mBounds.getSouth()) /
                this.mOptions.interval)
        };
    }

    public getMins() {
        //rounds up to nearest multiple of x
        var s = this.mOptions.interval;

        return {
            x: (Math.floor(this.mBounds.getWest() / s) * s) + this.mOptions.padding,
            y: (Math.floor(this.mBounds.getNorth() / s) * s) - this.mOptions.padding
        };
    }

    public constructLines(mins, counts) {
        var lines = new Array(counts.x + counts.y);
        var labels = new Array(counts.x + counts.y);

        //for horizontal lines
        for (var i = 0; i <= counts.x; i++) {
            var x = mins.x + i * this.mOptions.interval;
            lines[i] = this.buildXLine(x);
            labels[i] = this.buildLabel('gridlabel-horiz', x, i);
        }

        //for vertical lines
        for (var j = 0; j <= counts.y; j++) {
            var y = mins.y - j * this.mOptions.interval;
            lines[j + i] = this.buildYLine(y);
            labels[j + i] = this.buildLabel('gridlabel-vert', y, j);
        }

        lines.forEach(this.addLayer, this);
        labels.forEach(this.addLayer, this);
    }

    public buildXLine(x:number) {
        var bottomLL = new L.LatLng(this.mBounds.getSouth(), x);
        var topLL = new L.LatLng(this.mBounds.getNorth(), x);

        return new L.Polyline([bottomLL, topLL], this.lineStyle);
    }

    public buildYLine(y:number) {
        var leftLL = new L.LatLng(y, this.mBounds.getWest());
        var rightLL = new L.LatLng(y, this.mBounds.getEast());

        return new L.Polyline([leftLL, rightLL], this.lineStyle);

    }

    public buildLabel(axis, pos, rowColumn) {
        var mapBounds = this.mBounds.pad(-0.003);
        var screenBounds = this.mMap.getBounds().pad(-0.003);

        // Always keep the labels in the screen but never outside the defined bounds
        let north = Math.min(mapBounds.getNorth(), screenBounds.getNorth());
        let west = Math.max(mapBounds.getWest(), screenBounds.getWest());

        var latLng;
        if (axis == 'gridlabel-horiz') {
            latLng = new L.LatLng(north, pos + (this.mOptions.interval/2));
        } else {
            latLng = new L.LatLng(pos - (this.mOptions.interval/2), west);
        }

        let val = rowColumn;
        if(this.mOptions.label){
            val = this.mOptions.label( axis, pos, rowColumn, this.mMap.getZoom() );
        }

        return L.marker(latLng, {
            interactive: false,
            clickable: false, //legacy support
            icon: L.divIcon({
                iconSize: [0, 0],
                className: 'leaflet-grid-label',
                html: '<div class="' + axis + '">' + val + '</div>'
            })
        });
    }
  
    public addOriginLabel() {
        return L.marker([0, 0], {
            interactive: false,
            clickable: false, //legacy support
            icon: L.divIcon({
                iconSize: [0, 0],
                className: 'leaflet-grid-label',
                html: '<div class="gridlabel-horiz">(0,0)</div>'
            })
        });
    }
}
      
export interface IOptions {
    interval?: number;
    showOriginLabel: boolean;
    redraw: string;
    hidden?: boolean;
    bounds: LatLngBounds;
    zoomIntervals : IZoomIntervals[];
    padding: number;
    label:(axis, pos, rowColumn, zoom)=>string;
};

export interface IZoomIntervals{
    start: number;
    end: number;
    interval: number;
}