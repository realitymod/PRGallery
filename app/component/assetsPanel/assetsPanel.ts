import * as angular from 'angular';
import { Spawner } from '../../model/Spawner';
import { Team } from '../../model/Team';

interface SpawnerExtended extends Spawner {
    Quantity: number;
}

class AssetsPanelComponent implements ng.IComponentController {

    // binding properties
    private assets: Spawner[];
    private mTeam: number;
    private teams: Team[];

    private mOpforAssets: SpawnerExtended[];
    private mBluforAssets: SpawnerExtended[]; 

    public static $inject = ["$scope"];

    constructor(scope: ng.IScope) {
        this.mOpforAssets = [];
        this.mBluforAssets = [];
        this.mTeam = 0;

        scope.$watch<Spawner[]>(() => { return this.assets; }, (newValue, oldValue) => {
            if (newValue === undefined)
                return;

            // Reset the Assets
            this.mOpforAssets = [];
            this.mBluforAssets = [];

            // Temporary structure to convert the full asset list into a compact one
            let extendedAssets: { [key: number]: SpawnerExtended }[] = [];
            extendedAssets[0] = {};
            extendedAssets[1] = {};

            // Populate the list properly
            for (let k = 0; k < newValue.length; k++) {
                let spawner = newValue[k];

                if (!spawner.Vehicle)
                    continue;

                let key = `${spawner.Vehicle.Name.toLowerCase()} ${spawner.InitialDelay} ${spawner.RespawnDelay}`;

                if (extendedAssets[spawner.Team][key] === undefined) {
                    extendedAssets[spawner.Team][key] = <SpawnerExtended>spawner;
                    extendedAssets[spawner.Team][key].Quantity = 1;
                } else
                    extendedAssets[spawner.Team][key].Quantity += 1;
            }

            // Get all values from dictionary, sort them and set the variable
            this.mOpforAssets = Object.keys(extendedAssets[0]).map((v) => { return extendedAssets[0][v]; }).sort(AssetsPanelComponent.AssetsSorter);
            this.mBluforAssets = Object.keys(extendedAssets[1]).map((v) => { return extendedAssets[1][v]; }).sort(AssetsPanelComponent.AssetsSorter);
        });
    }



    public GetAssets(team) {

        return team == 0 ? this.mOpforAssets : this.mBluforAssets;
    }

    public set Team(value: number) {
        this.mTeam = value;
    }

    public get Team() {
        return this.mTeam;
    }


    private static AssetsSorter(a: SpawnerExtended, b: SpawnerExtended): number {
        var valueOfA = AssetsPanelComponent.EvaluateIcon(a.Vehicle.Icon);
        var valueOfB = AssetsPanelComponent.EvaluateIcon(b.Vehicle.Icon);

        let val = valueOfB - valueOfA;
        // console.log(`AssetsSorter: ${a.Vehicle.Icon}(${valueOfA}) - ${b.Vehicle.Icon}(${valueOfB}) = ${val}`);
        return val;
    }

    public static EvaluateIcon(icon: string): number {

        switch (icon) {
            case "mini_jet_attack_heavy":
            case "mini_jet_attack_light":
            case "mini_jet_figherbomber":
            case "mini_jet_strikefighter":
            case "mini_jet_strikefighter2":
            case "mini_jet_attack_light2":
            case "mini_jet_asf":
            case "mini_jet_antiship":
            case "mini_jet_plane":
                return 11;

            case "mini_ahe_heavy":
            case "mini_ahe_light":
            case "mini_ahe_medium":
            case "mini_ahe_scout":
                return 10;

            case "mini_the_light":
            case "mini_the_medium":
            case "mini_the_heavy_mv22":
            case "mini_the_heavy":
            case "mini_the_light_escort":
            case "mini_the_heavy_chinook":
                return 9;

            case "mini_tank_heavy":
            case "mini_tank_medium":
                return 8;

            case "mini_apc_medium":
            case "mini_apc_heavy":
            case "mini_apc_light":
            case "mini_apc_logistics":
            case "mini_apc_medium_aavp7":
                return 7;


            case "mini_rec_medium":
            case "mini_rec_atgm":
            case "mini_rec_light":
                return 6;


            case "mini_adv_heavy":
            case "mini_adv_medium":
            case "mini_adv_light":
                return 5;

            case "mini_trk_support":
            case "mini_trk_logistics":
                return 4;

            case "mini_jep_light":
            case "mini_jep_atgm":
            case "mini_jep_support":
            case "mini_jep_medium":
            case "mini_jep_logistics":
                return 3;

            case "mini_civ_car_bomb":
            case "mini_civ_dirtbike":
            case "mini_civ_atv":
            case "mini_civ_truck_bomb":
            case "mini_civ_truck_semi":
            case "mini_civ_car":
            case "mini_civ_forklift":
                return 2;

            case "mini_shp_light":
            case "mini_shp_ssac":
            case "mini_shp_light_sampan":
            case "mini_shp_heavy":
            case "mini_shp_medium":
            default:
                return 0;
        }
    }
}

angular
    .module('reality-gallery')
    .component('assetsPanel', {
        templateUrl: './component/assetsPanel/assetsPanel.html',
        controller: AssetsPanelComponent,
        bindings: {
            assets: '<',
            teams: '<'
        }
    });