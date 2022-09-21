import * as angular from 'angular';
import * as router from '@uirouter/angularjs';
import * as L from 'leaflet';
import 'leaflet-rotatedmarker';
import { PRGraticule, IOptions } from '../../libs/PRGraticule';
import { Layout, GameMode, Layer } from '../../model/Layout';
import { Level } from '../../model/Level';
import { Spawner } from '../../model/Spawner';
import { ControlPoint } from '../../model/ControlPoint';
import { Vector3, Vector2 } from '../../model/Vector';
import { MapService } from '../../service/MapService/MapService';
import { ToolbarService } from '../../service/ToolbarService/ToolbarService';
import { AASv4Utils } from '../../utils/AASv4Utils';


let COLORS = [
    "#003aad",
    "#d56c00",
    "#8c59ff",
    "#008a39",
    "#ff58a1",
    "#617100",
    "#63185e"
]

export interface VehicleMarkerOptions extends L.MarkerOptions {
    bf2properties: {
        name: string,
        code: string,
        uid: number
    },
    rotationAngle?: number,
    rotationOrigin?: string,
    interactive: boolean
}

export class VehicleMarker extends L.Marker {
    constructor(latlng: L.LatLngExpression, options?: VehicleMarkerOptions) {
        super(latlng, options);
    };
    // Properties
    options: VehicleMarkerOptions;
}

class MapDetailsComponent implements router.Ng1Controller {

    public static $inject = ["$q", "MapService", "$state", "ToolbarService", "$scope"];

    public level: Level;            // The level (injected when doing the transition)
    public layout: Layout;          // The layout (injected when doing the transition)

    private mMap: L.Map;            // The (map) leaflet object
    private mScale: number;         // The correct size of the map (1024, 2048, 8196)
    private mTiles: L.TileLayer;    // The layer with the map tiles
    private mMaxRoutes: number;     // The number of routes that this layout has
    private mRouteLayer: L.LayerGroup[];
    private mVehicleLayer: L.LayerGroup;
    private mGrid: L.LayerGroup;
    private mSubGrid: L.LayerGroup;
    private mCombatAreaLayer: L.LayerGroup;
    private mNumberOfRoutes = -1;
    private mMaxZoomAdd = 4;
    private mIconManager: IconManager = new IconManager();
    private $transition$;
    private spawnerhover : number[];
    private spawnerjumper : number;
    constructor(private $q: angular.IQService, private MapService: MapService, private $state: router.StateService, private mToolbarService: ToolbarService, private $scope: angular.IScope, $transition) {
        // Do nothing...  

    }

    // @Override from ??
    public $onInit() {
        //console.log("$onInit");

        // Create the Map object
        this.mMap = new L.Map('Map', {
            center: new L.LatLng(0, 0),
            crs: L.CRS.Simple,
            zoom: 0,
            zoomControl: false,
        });

        // Set the scale and maximum zoom acording to the level
        this.mScale = MapDetailsComponent.GetScale(this.level);
        this.mMap.setMaxZoom(this.MaxZoom + this.mMaxZoomAdd);
        // Create the tile layer
        this.mTiles = L.tileLayer(`./images/maps/${MapService.cleanName(this.level.Name)}/tiles/{z}/{x}/{y}.jpg`, {
            noWrap: true,
            maxNativeZoom: this.MaxZoom,
            maxZoom : this.MaxZoom + this.mMaxZoomAdd,
            bounds: new L.LatLngBounds(this.mMap.unproject(L.point(0, 0), this.MaxZoom), this.mMap.unproject(L.point(this.mScale, this.mScale), this.MaxZoom))
        }).addTo(this.mMap);

        // Center the map with a proper zoom level
        this.mMap.setView(this.mMap.unproject(L.point(this.mScale / 2, this.mScale / 2), this.MaxZoom), 2);

        // We need to manually make angular enter a digest cycle to update the CanZoom() 
        this.mMap.on("zoomend", (e) => {
            this.$scope.$apply();
        });

        // Lets define 13 cells centered  
        let gridInterval = 18.75;
        let gridPadding = 6.125;

        // Since leaflet.d.ts does not have the definition of our "simpleGraticule" we cast it to any to avoid errors
        let l: any = L;

        // Create the options for our grid
        let options: IOptions = {
            redraw: 'move',
            bounds: new L.LatLngBounds(this.mMap.unproject(L.point(0, 0), this.MaxZoom), this.mMap.unproject(L.point(this.mScale, this.mScale), this.MaxZoom)),
            label: (axis, pos, rowColumn, zoom) => {
                // we draw 14 lines (13 0-based)
                // we want to label 13 cells (12 0-based)
                if (rowColumn > 12)
                    return '';

                if (axis === 'gridlabel-vert')
                    return rowColumn + 1; // We want it indice based 1
                else
                    return String.fromCharCode(65 + rowColumn);
            },
            padding: gridPadding,
            lineStyle : {
                stroke: true,
                color: '#000000',
                opacity: 0.6,
                weight: 2,
                interactive: false,
                clickable: false //legacy support
            },
            zoomIntervals: [
                { start: 0, end: this.MaxZoom + this.mMaxZoomAdd, interval: gridInterval },
            ]
        };

        // Create the Grid layer
        this.mGrid = new PRGraticule(options).addTo(this.mMap);

        // Create the options for our subgrid
        let optionsSub : IOptions = {
            redraw: 'move',
            bounds: new L.LatLngBounds(this.mMap.unproject(L.point(0, 0), this.MaxZoom), this.mMap.unproject(L.point(this.mScale, this.mScale), this.MaxZoom)),
            padding: gridPadding,
            lineStyle : {
                stroke: true,
                color: '#000000',
                opacity: 0.4,
                weight: 1,
                interactive: false,
                clickable: false //legacy support
            },
            zoomIntervals: [
                { start: 0, end: this.MaxZoom + this.mMaxZoomAdd, interval: gridInterval / 3 },
            ]
        };
        
        // Create the Grid layer
        this.mSubGrid = new PRGraticule(optionsSub);

        // Render the layout
        this.RenderLayout();

        
        this.$scope.$watch(() => this.spawnerhover, function(newValue, oldValue) {
            this.mVehicleLayer.eachLayer(function(layer) {
                layer = <VehicleMarker> layer;
                if (this.spawnerhover == undefined ||this.spawnerhover.indexOf(layer.options.bf2properties.uid) !== -1) {
                    layer.setOpacity(1);
                    layer.setIc
                } else {
                    layer.setOpacity(0.2);
                }
            }, this);
        }.bind(this));
        
        this.$scope.$on('spawnerjump', (e, args)=>{
            if (args.length > 1 && this.spawnerjumper !== undefined) {
                let currentid = args.indexOf(this.spawnerjumper);
                if (currentid > -1 && currentid < args.length - 1)
                    this.spawnerjumper = args[currentid+1];
                else
                    this.spawnerjumper = args[0];
            } else {
                this.spawnerjumper = args[0];
            }
            this.mVehicleLayer.eachLayer(function(layer) {
                let marker = <VehicleMarker> layer;
                if (marker.options.bf2properties.uid == this.spawnerjumper) {
                    this.mMap.flyTo(marker.getLatLng(), this.mMap.getMaxZoom() - Math.round(this.mMap.getMaxZoom() /3));
                }
            }, this)
            
        });

        // Zoom to fit
        //this.mMap.fitWorld();
        this.mMap.fitBounds(new L.LatLngBounds(this.mMap.unproject(L.point(0, 0), this.MaxZoom), this.mMap.unproject(L.point(this.mScale, this.mScale), this.MaxZoom)));
    }


    public UpdateMap() {
        setTimeout(() => {
            this.mMap.invalidateSize();
        }, 500);
    }

    // @Override from Ng1Controller
    public uiOnParamsChanged(newValues: any, $transition$: router.Transition): void {
        //console.log("uiOnParamsChanged " + JSON.stringify(newValues));
        if (!newValues)
            return;

        if (newValues.gamemode || newValues.layout) {
            let map = $transition$.params().map;
            let gamemode = $transition$.params().gamemode;
            let layer = parseInt($transition$.params().layout);

            this.MapService
                .getLayout(map, gamemode, layer)
                .then((layout) => {
                    if (layout !== undefined) {

                        this.layout = layout;       // 1st: change the layout
                        this.mNumberOfRoutes = -1;  // 2nd: reset cached value of number of routes 
                        this.RenderLayout();        // 3rd: Update the UI
                        this.mToolbarService.Subtitle = `${GameMode.ProperName(gamemode)} ${Layer.ProperName(layer)}`;

                        // Broadcast the layout has changed
                        this.$scope.$broadcast('change-layout');
                    }
                });
        }
    }

    // @Override from Ng1Controller
    public uiCanExit(transition: router.Transition): router.HookResult {
        return true;    // We don't care about this, just need to implement it
    }

    /**
     * Returns the number of routes in the current defined layout
     */
    public GetNumberOfRoutes() {
        if (this.mNumberOfRoutes !== -1)
            return this.mNumberOfRoutes;

        let nRoutes = 1;

        for (let k = 0; k < this.layout.ControlPoints.length; k++) {
            let cp = this.layout.ControlPoints[k];

            let flagInfo = AASv4Utils.ParseRoute(cp.SupplyGroupId);
            nRoutes = Math.max(nRoutes, flagInfo.Route);
        }

        this.mNumberOfRoutes = nRoutes;
        return nRoutes;
    }

    /**
     * 
     * @param gamemode 
     * @param layer 
     */
    public onLayoutSelected(gamemode: string, layer: number) {
        let map = MapService.cleanName(this.level.Name);
        this.mToolbarService.Busy = true;

        this.$state.go("details", {
            "map": map,
            "gamemode": gamemode,
            "layout": layer
        });
    }

    public Zoom(scale: number) {
        if (scale > 0)
            this.mMap.zoomIn();
        else
            this.mMap.zoomOut();
    }

    public CanZoom(scale: number): boolean {
        if (scale > 0)
            return this.mMap.getMaxZoom() > this.mMap.getZoom();
        else
            return this.mMap.getMinZoom() < this.mMap.getZoom();
    }


    public IsGridVisible() {
        return this.mMap.hasLayer(this.mGrid) || this.mMap.hasLayer(this.mSubGrid);
    }

    public ToggleGrid() {
        if (this.mMap.hasLayer(this.mGrid))
            if (this.mMap.hasLayer(this.mSubGrid)) {
                this.mMap.removeLayer(this.mSubGrid);
                this.mMap.removeLayer(this.mGrid);
            } else {
                this.mMap.addLayer(this.mSubGrid);
            }
        else
            this.mGrid.addTo(this.mMap);
    }

    public SetRoute(route: number, state: boolean) {
        //console.log("SetRoute " + route+" " + state);
        let routeLayer = this.mRouteLayer[route];

        if (state) {
            routeLayer.addTo(this.mMap);

        } else {
            this.mMap.removeLayer(routeLayer);
        }
    }

    private RenderVehicles(layer: L.LayerGroup) {


        for (let k = 0; k < this.layout.Assets.length; k++) {
            let spawner: Spawner = this.layout.Assets[k];

            if (!spawner.Vehicle)
                continue;


            let icon = this.mIconManager.GetIcon('asset', spawner.Vehicle.Icon);

            // We need to cast 'L.MarkerOptions' cause we use a plugin that adds 'rotationAngle' and TS cant handle that
            var markerOptions: VehicleMarkerOptions = {
                icon: icon,
                title: spawner.Vehicle.Name,
                bf2properties: {
                    name: spawner.Vehicle.Name,
                    code: spawner.Vehicle.Key,
                    uid: spawner.uid
                },
                rotationAngle: spawner.Rotation.X,
                rotationOrigin: 'center center',
                interactive: true
            };
            let marker = new VehicleMarker(this.Unproject(spawner.Position.X, spawner.Position.Z), markerOptions);
            marker.on('mouseover',function(ev) {
                this.spawnerhover = [ev.target.options.bf2properties.uid];
                this.$scope.$apply();
            }, this);
            marker.on('mouseout',function(ev) {
                this.spawnerhover = undefined;
                this.$scope.$apply();
            }, this);
            marker.addTo(layer);
        }
    }
    private RenderLayout() {

        if (this.mRouteLayer !== undefined) {
            // Remove Route layers
            for (var k = 0; k < this.mRouteLayer.length; k++) {
                this.mMap.removeLayer(this.mRouteLayer[k]);
            }
        }

        if (this.mCombatAreaLayer !== undefined) {
            // Remove Combat Area Layers
            this.mMap.removeLayer(this.mCombatAreaLayer);
        }


        if (this.mVehicleLayer !== undefined) {
            // Remove Vehicles Layers
            this.mMap.removeLayer(this.mVehicleLayer);
        }

        // Render the vehicles
        this.mVehicleLayer = new L.LayerGroup();
        this.RenderVehicles(this.mVehicleLayer);
        this.mVehicleLayer.addTo(this.mMap);

        // Render the layouts
        this.mRouteLayer = new Array(this.GetNumberOfRoutes());
        for (let k = 0; k < this.GetNumberOfRoutes(); k++) {
            this.mRouteLayer[k] = new L.LayerGroup();
            // Routes are indice based 1
            this.RenderRoute(k + 1, this.mRouteLayer[k]);
            this.mRouteLayer[k].addTo(this.mMap);
        }

        // Render the combat areas
        this.mCombatAreaLayer = new L.LayerGroup();
        this.RenderCombatAreas(this.mCombatAreaLayer);
        this.mCombatAreaLayer.addTo(this.mMap);

        this.mToolbarService.Busy = false;
    }

    private RenderControlPoint(cp: ControlPoint, layer: L.LayerGroup, route: number) {

        let icon;
        if (cp.Team == 0) { // Its neutral
            icon = this.mIconManager.GetIcon('flag', `neutral_cp`);

        } else {
            let team = cp.Team - 1; // Change to index based 0;
            let faction = this.layout.Team[team].Code.toLowerCase();
            let type = cp.UnableToChangeTeam ? "cpbase" : "cp";

            icon = this.mIconManager.GetIcon('flag', `${faction}_${type}`);
        }

        L.marker(this.Unproject(cp.Position.X, cp.Position.Z), { icon: icon, interactive: true, title: cp.Name }).addTo(layer);

        // We'll only add a cap radius if indeed we can cap it
        if (!cp.UnableToChangeTeam) {
            let radius = (cp.Radius * 256) / this.mScale;

            L.circle(this.Unproject(cp.Position.X, cp.Position.Z), {
                radius: radius, 
                color: COLORS[route - 1], 
                stroke: true, 
                weight: 1,
                opacity: 0.5,
                fillOpacity: 0.1,
                interactive: false
            }).addTo(layer);
        }

    }


    private RenderRoute(route: number, layer: L.LayerGroup) {

        if (this.layout.Mode !== GameMode.Skirmish && this.layout.Mode !== GameMode.AdvanceAndSecure && this.layout.Mode !== GameMode.Cooperative)
        {
            return;
        }

        let points: ControlPoint[][] = this.GetControlPointsOfRoute(route);

        // We start in the main bases with SGID of 1
        let previousCenter: Vector3 = {
            X: points[1][0].Position.X,
            Y: points[1][0].Position.Y,
            Z: points[1][0].Position.Z
        }

        // Create the flag for the initial base
        this.RenderControlPoint(points[1][0], layer, route);

        // For each step of the route
        for (let k = 2; k < points.length; k++) {
            let cps = points[k];

            if (cps === undefined || cps.length == 0) {
                continue;
            }

            // Initialize the center
            let center: Vector3 = {
                X: cps[0].Position.X,
                Y: cps[0].Position.Y,
                Z: cps[0].Position.Z
            };

            // Add all points, if there's any
            for (let j = 1; j < cps.length; j++) {
                center.X += cps[j].Position.X;
                center.Y += cps[j].Position.Y;
                center.Z += cps[j].Position.Z;
            }

            // Calculate the average
            center.X = center.X / cps.length;
            center.Y = center.Y / cps.length;
            center.Z = center.Z / cps.length;

            // Transform center into leaflet coordinates
            var leafletCenter = this.Unproject(center.X, center.Z);

            if (cps.length > 1) {
                // Draw the line from all these flags to center
                for (let j = 0; j < cps.length; j++) {
                    var leafletFlag: L.LatLng = this.Unproject(cps[j].Position.X, cps[j].Position.Z);
                    L.polyline([leafletFlag, leafletCenter], {
                        color: COLORS[route - 1],
                        dashArray: "5, 10",
                        weight: 2,
                        interactive: false
                    }).addTo(layer);

                    // Draw each of the control points in this section
                    this.RenderControlPoint(cps[j], layer, route);
                }

            } else {
                // Draw the only CP in this section
                this.RenderControlPoint(cps[0], layer, route);
            }

            // Draw the line from the previous center to this center
            var leafletCenter = this.Unproject(center.X, center.Z);
            var leafletPrevCenter = this.Unproject(previousCenter.X, previousCenter.Z);
            var polyline = L.polyline([leafletCenter, leafletPrevCenter], { weight: 2, color: COLORS[route - 1] }).addTo(layer);

            // Update previous center
            previousCenter = center;
        }

        // The last firebase may have SGID of -1 and we put it in "points[0]""
        if (points[0] !== undefined) {
            let cp = points[0][0];

            var leafletCenter = this.Unproject(points[0][0].Position.X, points[0][0].Position.Z);
            var leafletPrevCenter = this.Unproject(previousCenter.X, previousCenter.Z);

            // Create the line between this base and the last flag section
            L.polyline([leafletCenter, leafletPrevCenter], { color: COLORS[route - 1], interactive: false }).addTo(layer);

            // Create the flag for this base
            this.RenderControlPoint(cp, layer, route);
        }
    }

    private RenderCombatAreas(layer: L.LayerGroup) {
        // Combat areas (CAs) come in two varieties: Inverted and NonInverted
        // In both, the CA's points define a polygon but while in the inverted we
        // need to paint the inside, in the NonInverted CA we need to paint everyhing else
        // but the polygon's inside.

        let [boundingBox, combatAreaLinkedToBox] = this.GetCombatAreaBoundingBox();
        let combatAreaHoles :L.LatLng[][] = [];
        for (let k = 0; k < this.layout.CombatAreas.length; k++) {
            let dod = this.layout.CombatAreas[k];
            
            // If we're using this combat area as a bounding box, then
            // no need to do anything more with it
            if(k == combatAreaLinkedToBox){ continue; }

            // A polygon needs at least 3 vertives
            if(dod.Points.length < 3){ continue; }

            let polygon: L.LatLng[] = [] ;
            for (let j = 0; j < dod.Points.length; j++) {
                polygon.push(this.Unproject(dod.Points[j].X, dod.Points[j].Y));
            }

            if (!dod.Inverted) {
                combatAreaHoles.push(polygon);
                continue;
            }

            // Add the Inverted Combat area polygin to the  layer
            L.polygon(polygon, MapDetailsComponent.CreateCombatAreaPolygonOptions(dod.Team)).addTo(layer);
        }

        // Render a "combat area" all over the map
        // except in the safe zones (defined by the NonInverted CAs)
        var pol = [boundingBox];
        pol = pol.concat(combatAreaHoles);
        L.polygon(pol, MapDetailsComponent.CreateCombatAreaPolygonOptions(0)).addTo(layer);
    }

    private GetCombatAreaBoundingBox() : [L.LatLng[], number]{
        var halfSize = this.mScale/2;
        let boundinxBox = {Top: halfSize, Bottom: -halfSize, Right: halfSize, Left: -halfSize};
        let boundingBoxCombatArea = -1;

        for (let k = 0; k < this.layout.CombatAreas.length; k++) {
            let dod = this.layout.CombatAreas[k];
            
            // A boundinx box needs to be a square and can't be inverted
            if(dod.Points.length != 4 || dod.Inverted) {continue;}

            let box = {Top: 0, Bottom: 0, Right: 0, Left: 0};
            for (let j = 0; j < dod.Points.length; j++) {   
                box.Top = Math.max(box.Top, dod.Points[j].Y);
                box.Bottom = Math.min(box.Bottom, dod.Points[j].Y);
                box.Right = Math.max(box.Right, dod.Points[j].X);
                box.Left = Math.min(box.Left, dod.Points[j].X);
            }

            // Trusting that we're dealing with perfectly centered squares
            if(box.Top > boundinxBox.Top){
                boundinxBox = box;
                boundingBoxCombatArea = k;
            }
        }

        let coordsOfBoundingBox = [
            this.Unproject(boundinxBox.Right, boundinxBox.Top),
            this.Unproject(boundinxBox.Left, boundinxBox.Top),
            this.Unproject(boundinxBox.Left, boundinxBox.Bottom),
            this.Unproject(boundinxBox.Right, boundinxBox.Bottom),
        ];

        return [coordsOfBoundingBox, boundingBoxCombatArea];
    }
    public get MaxZoom() {
        if (this.level !== undefined)
            return Math.log2(this.mScale) - 8;

        return 0;
    }

    /**
     * Converts BF2 coordinates into a L.LatLng object that can be used in the leaflet map
     * 
     * @param X the coordinate in the X axis
     * @param Z the coordinate in the Z axis
     */
    private Unproject(X: number, Z: number): L.LatLng {

        X += (this.mScale / 2);
        Z = Z * -1;
        Z += (this.mScale / 2);

        return this.mMap.unproject(new L.Point(X, Z), this.MaxZoom);
    }

    /**
     * Given a route index it returns a matrix of ControlPoint with the first indice representing their order in the route
     * @param intededRoute the inteded route to obtain the CPs between 0 and the MaxRoutes allowed in this Layout
     */
    private GetControlPointsOfRoute(intededRoute: number) {
        let points: ControlPoint[][] = [];

        for (let k = 0; k < this.layout.ControlPoints.length; k++) {
            let cp: ControlPoint = this.layout.ControlPoints[k];
            let flagInfo = AASv4Utils.ParseRoute(cp.SupplyGroupId);

            // Make sure the matrix is read
            if (points[flagInfo.Sequence] === undefined){
                points[flagInfo.Sequence] = [];
            }

            // We must include any control point that is explicitly set to this route and
            // any other cp that does not have a route defined
            if (flagInfo.Route == intededRoute || flagInfo.Route == 0) {
                points[flagInfo.Sequence].push(cp);
            }
        }

        return points;
    }

    /**
     * Converts the simplistic information of the level's size to the correct
     * level size.
     * 
     * Carefull, that #Level object contains a resolution field, which provides the 
     * image resolution and NOT the size of the map
     * 
     * @param level level object to obtain the correct size
     */
    private static GetScale(level: Level) {
        switch (level.Size) {
            case 8:
                return 8192;
            case 4:
                return 4096;
            case 2:
                return 2048;
            case 1:
            default:
                return 1024;
        }
    }

    private static CreateCombatAreaPolygonOptions(team: number){
        let color: string;
            let fillOpacity = 0.2;

        switch (team) {
            case 0:
                color = "black";
                fillOpacity = 0.5;
                break;
            case 1:
                color = "#2c99af";
                break;
            case 2:
                color = "rgb(148, 27, 12)";
                break;
        }
        
        return { 
            color: color, 
            stroke: true,
            weight: 1,
            opacity: 0.7,
            fillOpacity: fillOpacity,
            interactive: false
        }
    }
}

/**
 * A manager class to create and manage the icons for vehicles
 */
class IconManager {
    private mIcons: { [key: string]: L.DivIcon } = {};



    public GetIcon(type: string, key: string): L.DivIcon {
        if (this.mIcons[key] !== undefined)
            return this.mIcons[key];
        let icon = L.divIcon({
            className: `icon-${type} ${key}`,
            iconSize: IconManager.GetSize(type)
        });

        this.mIcons[key] = icon;
        return icon;
    }


    public static GetSize(type): L.Point {
        if (type === 'flag')
            return L.point(33, 33);
        else if (type == "asset")
            return L.point(16, 16);

        return L.point(0, 0);
    }
}

angular
    .module('reality-gallery')
    .component('mapDetails', {
        templateUrl: './component/mapDetails/mapDetails.html',
        controller: MapDetailsComponent,
        bindings: {
            level: '<',
            layout: '<'
        },
    });