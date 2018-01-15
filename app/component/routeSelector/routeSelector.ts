import * as angular from 'angular';
import * as router from '@uirouter/angularjs';
import { Layout } from '../../model/Layout';

class RouteSelectorComponent implements ng.IComponentController {

    // binding properties
    public onRouteToggle: ({ route: number, state: boolean }) => {};
    public mStates: boolean[];
    public routes: number;


    public static $inject = ["$scope", "$state"];

    constructor($scope, private $state: router.StateService,) {

        $scope.$on('change-layout', (e)=>{
            //console.log("On change-layout: " + this.routes);
            this.updateRoutes(this.routes);
        });

        $scope.$watch(() => this.routes, (newValue, oldValue) => {
            //console.log("watch routes " +newValue)
            if (newValue === undefined)
                return;

            this.updateRoutes(newValue);
        });
    }

    // @Override from Ng1Controller
    public uiOnParamsChanged(newValues: any, $transition$: router.Transition): void {
        //console.log("uiOnParamsChanged " + JSON.stringify(newValues));
        if(!newValues)
            return;

        if(newValues.routes){
            this.ApplyRouteMask(newValues.routes);
        }
    }

    private ApplyRouteMask(routeMask: number){
        //console.log("ApplyRouteMask " + routeMask);
        let route = 0;

        while(route != this.routes){
            
            this.mStates[route] = (routeMask & 1) === 0;
            this.onRouteToggle({ "route": route, state: this.mStates[route] });

            route++;
            routeMask = routeMask >> 1;
        }
    }

  

    private updateRoutes(numberOfRoutes: number) {
        this.mStates = [];

        
        for (let k = 0; k < numberOfRoutes; k++) {
            this.mStates.push(true);
        }

        if(this.$state.params.routes)
            this.ApplyRouteMask(this.$state.params.routes);
    }


    public ToggleRoute(indice: number) {
        let state = !this.mStates[indice];
        this.mStates[indice] = state;


        let routes = parseInt(this.$state.params.routes);
        if(!routes)
            routes = 0;

        if (state) {
            routes = routes & ~Math.pow(2, indice);

        } else {
            routes += Math.pow(2, indice);
        }

        this.$state.go("details", {
            "map": this.$state.params.map,
            "gamemode": this.$state.params.gamemode,
            "layout": this.$state.params.layout,
            "routes" : routes 
        });

        this.onRouteToggle({ "route": indice, state: this.mStates[indice] });
    }

    public get Routes() {
        return this.mStates;
    }
}

angular
    .module('reality-gallery')
    .component('routeSelector', {
        templateUrl: './component/routeSelector/routeSelector.html',
        controller: RouteSelectorComponent,
        bindings: {
            routes: '<',
            onRouteToggle: "&"
        }
    });