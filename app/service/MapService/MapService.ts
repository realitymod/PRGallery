import * as angular from 'angular';
import { VehicleService } from '../../service/VehicleService/VehicleService';
import { Vehicle } from '../../model/Vehicle';
import { Level } from '../../model/Level';
import { Layout, GameMode, Layer } from '../../model/Layout';
import { Spawner } from '../../model/Spawner';

export class MapService {
    private mLevelsMap: { [key: string]: Level };
    private mLevels: Level[];
    private mLayouts: { [key: string]: Layout } = {};

    public static $inject = ["$q", "$http", "VehicleService"];
    constructor(private $q: angular.IQService, private $http: angular.IHttpService, private mVehicleService: VehicleService) {
        // Do Nothing...
    }



    public static cleanName(name: string) {
        return name.replace(/\s|_/g, "").toLowerCase();
    }

    public getLevels(): angular.IPromise<Level[]> {
        return this.$q((resolve, reject) => {
            if (this.mLevels !== undefined) {
                resolve(this.mLevels);
            }
            else {
                this.$http
                    .get("./json/levels.json")
                    .then((response: angular.IHttpResponse<Level[]>) => {

                        this.mLevelsMap = {};
                        this.mLevels = response.data;

                        // We 
                        for (let k = 0; k < response.data.length; k++) {
                            var level = response.data[k];
                            level.Layouts.sort(MapService.SortLayouts)

                            this.mLevelsMap[MapService.cleanName(level.Name)] = level;
                        }


                        resolve(this.mLevels);
                    });
            }
        });
    }

    public getLevel(key: string): angular.IPromise<Level> {
        return this.$q((resolve, reject) => {
            this.getLevels().then((levels) => {
                resolve(this.mLevelsMap[key]);
            });
        });
    }

    public getLayout(map: string, mode: string, size: number): angular.IPromise<Layout> {
        return this.$q((resolve, reject) => {
            let key = `${map}_${mode}_${size}`;

            if (this.mLayouts[key] !== undefined) {
                resolve(this.mLayouts[key]);

            } else {

                this.$q
                    .all([this.mVehicleService.getVehicles(), this.$http.get<Layout>(`./json/${map}/${mode}_${size}.json`)])
                    .then((values) => {

                        let vehicles: { [key: string]: Vehicle } = values[0];
                        let level: Layout = values[1].data;

                        for (let k = 0; k < level.Assets.length; k++) {
                            let spawner: Spawner = level.Assets[k];
                            spawner.uid = k+1;
                            spawner.Vehicle = vehicles[spawner.Key];
                        }

                        this.mLayouts[key] = level;
                        resolve(this.mLayouts[key]);
                    });
            }
        });
    }

    private static SortLayouts(a: { Key: string, Value: number }, b: { Key: string, Value: number }): number {
        let aValue = MapService.EvalGameMode(a.Key) + a.Value;
        let bValue = MapService.EvalGameMode(b.Key) + b.Value;

        // We want to sort from lower to higher
        return bValue - aValue;
    }


    public static EvalGameMode(gamemode: string) {
        switch (gamemode) {
            case GameMode.AdvanceAndSecure:
                return 7000;
            case GameMode.Insurgency:
                return 6000;
            case GameMode.Skirmish:
                return 5000;
            case GameMode.CNC:
                return 4000;
            case GameMode.VehicleWarfare:
                return 3000;
            case GameMode.Objective:
                return 2000;
            case GameMode.Cooperative:
                return 1000;
            default:
                return 0;
        }
    }
}


angular
    .module("map-service", [])
    .service("MapService", MapService);