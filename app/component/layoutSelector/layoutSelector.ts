import * as angular from 'angular';
import { Layout, LayoutReference, GameMode, Layer } from '../../model/Layout';

let _AAS = 0;
let _INS = 1;
let _CNC = 2;
let _SKI = 3;
let _COP = 4;
let _VEH = 5;

let _INF = 1;
let _ALT = 2;
let _STD = 4;
let _LRG = 8;


class LayoutSelectorComponent implements ng.IComponentController {

    public AAS = _AAS;
    public INS = _INS;
    public CNC = _CNC;
    public SKI = _SKI;
    public COP = _COP;
    public VEH = _VEH;

    public INF = _INF;
    public ALT = _ALT;
    public STD = _STD;
    public LRG = _LRG;

    // binding properties
    public onLayoutSelected: ({ gamemode: string, layer: number }) => {};
    public layouts: LayoutReference[];
    public currentLayout: Layout;

    private mAvailableLayouts: number[] = [];
    private mSelectedMode: number = -1;
    private mSelectedLayer: number = -1;

    private static SELECT_LAYOUT_DELAY = 1000; // ms
    public static $inject = ["$scope"];

    constructor($scope) {
        $scope.$watch(() => { return this.layouts; }, (newValue: LayoutReference[], oldValue: LayoutReference[]) => {

            if (newValue === undefined)
                return;

            // Reset the Assets
            for (var i = 0; i < newValue.length; i++) {
                let layout = newValue[i];

                var mode = LayoutSelectorComponent.EvaluateMode(layout);
                var layer = LayoutSelectorComponent.EvaluateLayer(layout);

                if (mode === -1 || layer === -1)
                    continue;

                if (!this.mAvailableLayouts[mode])
                    this.mAvailableLayouts[mode] = 0;

                this.mAvailableLayouts[mode] += layer;

                if (this.mSelectedMode == -1)
                    this.mSelectedMode = mode;

                if (this.mSelectedLayer == -1)
                    this.mSelectedLayer = layer;

            }
        });
    }

    private SelectLayout(mode: number, layer: number) {
        let gamemode;
        switch (mode) {
            case _VEH:
                gamemode = GameMode.VehicleWarfare;
                break;
            case _COP:
                gamemode = GameMode.Cooperative;
                break;
            case _SKI:
                gamemode = GameMode.Skirmish;
                break;
            case _CNC:
                gamemode = GameMode.CNC;
                break;
            case _INS:
                gamemode = GameMode.Insurgency;
                break;
            case _AAS:
            default:
                gamemode = GameMode.AssaultAndSecure;
        }


        let gamelayer;
        switch (layer) {
            case _INF:
                gamelayer = Layer.Infantry;
                break;
            case _ALT:
                gamelayer = Layer.Alternative;
                break;
            case _LRG:
                gamelayer = Layer.Large;
                break;
            case _STD:
            default:
                gamelayer = Layer.Standard;
        }



        this.onLayoutSelected({ "gamemode": gamemode, "layer": gamelayer }, );
    }

    public IsModeAvailable(mode: number): boolean {
        return this.mAvailableLayouts[mode] !== undefined;
    }

    public IsModeSelected(mode: number): boolean {
        return this.mSelectedMode === mode;
    }

    public SelectMode(mode: number): void {
        if (!this.IsModeAvailable(mode) || this.mSelectedMode == mode)
            return;

        this.mSelectedMode = mode;

        // if we can keep the same layer, we keep it, else...
        if ((this.mSelectedLayer & this.mAvailableLayouts[this.mSelectedMode]) === 0) {

            let layer = _INF;

            // We try to cheat and immediatly attempt to select Standard
            if ((this.mAvailableLayouts[this.mSelectedMode] & _STD) !== 0) {
                layer = _STD;

            } else { // else we iterate all layers starting from INF (yes we'll repeat the standard check but who cares)
                while ((layer & this.mAvailableLayouts[this.mSelectedMode]) === 0 && layer <= _LRG) {
                    layer *= 2;
                }
            }

            this.mSelectedLayer = layer;
        }

        // Disclaimer: I had a 1s delay here to allow changing mode and then the layer w/o costing an extra HTTP request
        // but was seen as an uncessary micro optimization
        this.SelectLayout(this.mSelectedMode, this.mSelectedLayer);
    }

    public IsLayerAvailable(layer: number): boolean {

        return (this.mAvailableLayouts[this.mSelectedMode] & layer) != 0;
    }

    public IsLayerSelected(layer: number): boolean {
        //console.log(`IsLayerSelected mode(${this.mSelectedLayer}) layer(${layer})`);
        return this.mSelectedLayer === layer;
    }

    public SelectLayer(layer: number): void {
        if (!this.IsLayerAvailable(layer) || this.mSelectedLayer == layer)
            return;

        this.mSelectedLayer = layer;

        this.SelectLayout(this.mSelectedMode, this.mSelectedLayer);
    }

    public static EvaluateMode(layout: LayoutReference): number {
        switch (layout.Key) {
            case GameMode.VehicleWarfare:
                return _VEH;
            case GameMode.Cooperative:
                return _COP;

            case GameMode.Skirmish:
                return _SKI;
            case GameMode.CNC:
                return _CNC;
            /*case GameMode.Objective:
                return LayoutSelectorComponent.Objective_Name;*/
            case GameMode.Insurgency:
                return _INS;
            case GameMode.AssaultAndSecure:
                return _AAS;
            default:
                return -1;
        }
    }

    public static EvaluateLayer(layout: LayoutReference): number {
        switch (layout.Value) {
            case Layer.Infantry:
                return _INF;
            case Layer.Alternative:
                return _ALT;
            case Layer.Large:
                return _LRG;
            case Layer.Standard:
                return _STD;
            default:
                return -1;
        }
    }
}

angular
    .module('reality-gallery')
    .component('layoutSelector', {
        templateUrl: './component/layoutSelector/layoutSelector.html',
        controller: LayoutSelectorComponent,
        bindings: {
            layouts: '<',
            currentLayout: '<',
            onLayoutSelected: "&"
        }
    });