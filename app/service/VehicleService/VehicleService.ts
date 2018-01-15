import * as angular from 'angular';
import { Vehicle } from '../../model/Vehicle';

export class VehicleService {
    private mVehicles: { [key: string]: Vehicle };

    public static $inject = ["$q", "$http"];
    constructor(private $q: angular.IQService, private $http: angular.IHttpService) {
        // Do Nothing...
    }


    public getVehicles(): angular.IPromise<{ [key: string]: Vehicle }> {
        return this.$q((resolve, reject) => {

            if (this.mVehicles === undefined) {

                this.$http.get("./json/vehicles.json")
                    .then((response: angular.IHttpResponse<Vehicle[]>) => {
                        if (response.data === undefined) {
                            reject("Downloaded data is undefined");
                            
                        } else {
                            this.mVehicles = {};
                            for (let k = 0; k < response.data.length; k++) {
                                let vehicle = response.data[k];
                                this.mVehicles[vehicle.Key] = vehicle;
                            }

                            resolve(this.mVehicles)
                        }
                    }, reject);

            } else {
               
                resolve(this.mVehicles)
            }
        });
    }
}


angular
    .module("vehicle-service", [])
    .service("VehicleService", VehicleService);