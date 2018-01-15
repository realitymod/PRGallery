import * as angular from 'angular';
import * as route from '@uirouter/angularjs';
import { Level } from '../../model/Level';
import { MapService } from '../../service/MapService/MapService';

class MapBrowserComponent  {

    public static $inject = ["MapService", "$state", "$transitions",];
    private mMaps;

    constructor(private MapService: MapService, private $state: route.StateService, $transitions) {
        this.MapService.getLevels().then( (res) => {this.mMaps = res} );


        /* 
        console.log("Add listener");
        $transitions.onEnter({}, (trans: route.Transition, state: route.StateDeclaration) => {
            console.log("MapBrowserComponent filter by " + trans.params().q);
        });
        */

    }

    public get Maps() {
        return this.mMaps;
    }

    public getKey(name:string)
    {
        return name.replace(/\s|_/g, "").toLowerCase();
    }

    public OpenDetails(map: Level)
    {
        this.$state.go("details", {
            map: this.getKey(map.Name),
            gamemode: map.Layouts[0].Key,
            layout:map.Layouts[0].Value
        });
    }



}

angular
    .module('reality-gallery')
    .component('mapBrowser', {
        templateUrl: './component/mapBrowser/mapBrowser.html',
        controller: MapBrowserComponent
    });