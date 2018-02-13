
import * as L from 'leaflet';
import { LatLngBounds } from 'leaflet';


export interface PRGraticuleMarkerLabelOptions extends L.MarkerOptions {
    prgraticule : {
        axis: string,
        pos : number
    }
}

export class PRGraticuleMarkerLabel extends L.Marker {
    constructor(latlng: L.LatLngExpression, options?: PRGraticuleMarkerLabelOptions) {
        super(latlng, options);
    };
    // Properties
    options: PRGraticuleMarkerLabelOptions;
}

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
    private lines : L.LayerGroup;
    private labels : L.LayerGroup;
    private labelmarker;

    constructor(options: IOptions) {
        super();
        this.mOptions = options;
        this.mBounds = options.bounds;
        this.lines = new L.LayerGroup();
        this.labels = new L.LayerGroup();
    }

    public onAdd(map: L.Map) : this {
        this.mMap = map;
        this.mMap.on('viewreset ' + this.mOptions.redraw, this.redraw.bind(this));
        this.mOptions.interval = this.getInterval();
        this.constructLabels();
        this.constructLines();
        this.redraw();
        this.labels.eachLayer(map.addLayer, map);
        this.lines.eachLayer(map.addLayer, map);
        return this;
    }

    public onRemove(map:L.Map) {
        console.log('remove')
        map.off('viewreset '+ this.mOptions.redraw, undefined, this);
        this.labels.eachLayer(map.removeLayer, map);
        this.lines.eachLayer(map.removeLayer, map);

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

    /**
     * This gets called roughly a gazillion times per second (bound to move event), so performance is critical
     * @param ev 
     */
    public redraw(event = null) {
        if (typeof this.mOptions.bounds === 'undefined') {
            this.mBounds = this.mMap.getBounds().pad(0.5); 
        }

        if (!this.mOptions.hidden) {

            var currentZoom = this.mMap.getZoom();

            let newinterval = this.getInterval();
            // Only redraw lines when actually necessary, as in: when the interval changes
            if (this.mOptions.interval !== newinterval) {
                this.mOptions.interval = newinterval;
                this.constructLines(this.getMins(), this.getLineCounts());
                }

            if (typeof this.mOptions.label !== 'undefined') {
                this.updateLabelsPos();
            }
            if (this.mOptions.showOriginLabel) {
                this.addLayer(this.addOriginLabel());
            }
        }
    }

    private getInterval() : number {
        let currentZoom = this.mMap.getZoom();
        for(var i = 0 ; i < this.mOptions.zoomIntervals.length ; i++) {
            let zoominterval = this.mOptions.zoomIntervals[i];
            if(currentZoom >= zoominterval.start && currentZoom <= zoominterval.end){
                    return zoominterval.interval;
    }
        }
    }

    public getLineCounts() {
        return {
            x: Math.floor((this.mBounds.getEast() - this.mBounds.getWest()) /
                this.mOptions.interval),
            y: Math.floor((this.mBounds.getNorth() - this.mBounds.getSouth()) /
                this.mOptions.interval)
        };
    }

    public getMins() : L.LatLng {
        //rounds up to nearest multiple of x
        var s = this.mOptions.interval;
        return new L.LatLng(
            (Math.floor(this.mBounds.getNorth() / s) * s) - this.mOptions.padding,
            (Math.floor(this.mBounds.getWest() / s) * s) + this.mOptions.padding,
        )
    }

    public constructLines(mins:L.LatLng = this.getMins(), counts = this.getLineCounts()) {
        var lines = new Array(counts.x + counts.y);

        //for horizontal lines
        for (var i = 0; i <= counts.x; i++) {
            var x = mins.lng + i * this.mOptions.interval;
            lines[i] = this.buildXLine(x);
        }

        //for vertical lines
        for (var j = 0; j <= counts.y; j++) {
            var y = mins.lat - j * this.mOptions.interval;
            lines[j + i] = this.buildYLine(y);
        }

        this.lines.clearLayers();
        lines.forEach(this.addLayer, this.lines);
    }

    /**
     * Constructing objects is expensvie, so call this as little as possible
     * @param mins 
     * @param counts 
     */
    public constructLabels(mins:L.LatLng = this.getMins(), counts = this.getLineCounts()) {
        if (typeof this.mOptions.label === 'undefined')
            return;
        let labels = new Array(counts.x + counts.y);

        //for horizontal lines
        for (var i = 0; i <= counts.x; i++) {
            var x = mins.lng + i * this.mOptions.interval;
            labels[i] = this.buildLabel('gridlabel-horiz', x, i);
        }

        //for vertical lines
        for (var j = 0; j <= counts.y; j++) {
            var y = mins.lat - j * this.mOptions.interval;
            labels[j + i] = this.buildLabel('gridlabel-vert', y, j);
        }

        this.labels.clearLayers();
        labels.forEach(this.addLayer, this.labels);
        this.updateLabelsPos();
    }

    public buildXLine(x:number) : L.Polyline {
        var bottomLL = new L.LatLng(this.mBounds.getSouth(), x);
        var topLL = new L.LatLng(this.mBounds.getNorth(), x);

        return new L.Polyline([bottomLL, topLL], this.mOptions.lineStyle);
    }

    public buildYLine(y:number): L.Polyline {
        var leftLL = new L.LatLng(y, this.mBounds.getWest());
        var rightLL = new L.LatLng(y, this.mBounds.getEast());

        return new L.Polyline([leftLL, rightLL], this.mOptions.lineStyle);
    }

    public buildLabel(axis, pos, rowColumn) : PRGraticuleMarkerLabel {
        let val = rowColumn;
        if(this.mOptions.label){
            val = this.mOptions.label( axis, pos, rowColumn, this.mMap.getZoom() );
        }

        let marker =  new PRGraticuleMarkerLabel(new L.LatLng(0,0), {
            interactive: false,
            keyboard: false,
            prgraticule: {
                axis: axis,
                pos: pos,
            },
            icon: L.divIcon()
            })
        marker.bindTooltip(val.toString(), {
            direction: 'center',
            permanent: true,
            className: 'leaflet-grid-label'
        });
        return marker;
    }

    /** 
     * Updates existing markers by moving them inside map or screen bounds.
     * Is called with every redraw, so performance is important.
    */
    private updateLabelsPos() {
        var mapBounds = this.mBounds;
        var screenBounds = this.mMap.getBounds();

        // Always keep the labels in the screen but never outside the defined bounds
        let north = Math.min(mapBounds.getNorth() - 8 / this.mMap.getZoom() + 1, screenBounds.getNorth()- 8 / this.mMap.getZoom() + 1);
        let west = Math.max(mapBounds.getWest() + 2 / this.mMap.getZoom() + 1 , screenBounds.getWest()+ 2 / this.mMap.getZoom() + 1);
        this.labels.eachLayer(function( layer) {
            let marker = <PRGraticuleMarkerLabel> layer; // Gotta cast it so TS is happy
            let latLng;
            let pos = marker.options.prgraticule.pos;
            if (marker.options.prgraticule.axis == 'gridlabel-horiz') {
                marker.setLatLng(new L.LatLng(north, pos + (this.mOptions.interval/2)));
            } else {
                marker.setLatLng(new L.LatLng(pos - (this.mOptions.interval/2), west));
    }
        }, this)
    };
  
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
    showOriginLabel?: boolean;
    redraw: string;
    hidden?: boolean;
    bounds: LatLngBounds;
    zoomIntervals : IZoomIntervals[];
    padding: number;
    label?:(axis, pos, rowColumn, zoom)=>string;
    lineStyle: object
};

export interface IZoomIntervals{
    start: number;
    end: number;
    interval: number;
}