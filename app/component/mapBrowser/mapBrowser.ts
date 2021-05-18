import * as angular from 'angular';
import * as route from '@uirouter/angularjs';
import { Level } from '../../model/Level';
import { MapService } from '../../service/MapService/MapService';
import { isNumber } from 'angular';
import { GameMode, Layer } from '../../model/Layout';
import { SearchModel } from '../search/search';

class MapBrowserComponent {

    public static $inject = ["MapService", "$state", "$rootScope"];
    private mMaps: Level[];
    private mFilteredMaps: Level[];
    private mSearchQuery = new SearchModel();

    constructor(private MapService: MapService, private $state, private $rootScope) {
        this.MapService.getLevels().then((res) => {
            this.mMaps = res;
            this.OnMapQueriesFilterChanged();
        });

        $rootScope.$on('$locationChangeSuccess', () => this.OnMapQueriesFilterChanged());
    }

    public get Maps() {
        return this.mFilteredMaps;
    }

    public getKey(name: string) {
        return name.replace(/\s|_/g, "").toLowerCase();
    }

    public OpenDetails(map: Level) {
        this.$state.go("details", {
            map: this.getKey(map.Name),
            gamemode: map.Layouts[0].Key,
            layout: map.Layouts[0].Value
        });
    }

    private OnMapQueriesFilterChanged() {
        this.mSearchQuery.Name = this.$state.params.name;
        this.mSearchQuery.Size = this.$state.params.size;
        this.mSearchQuery.Mode = this.$state.params.mode;
        this.mSearchQuery.Layer = this.$state.params.layer;

        if (!this.mMaps) {
            return;
        }

        // If there's no query then we show all maps;
        if (!this.mSearchQuery) {
            this.mFilteredMaps = this.mMaps;
            return;
        }

        this.mFilteredMaps = MapBrowserComponent.Filter(this.mSearchQuery, this.mMaps);
    }

    private static Filter(searchQuery: SearchModel, maps: Level[]): Level[] {
        if (!searchQuery) { return maps; }
        if (!searchQuery.Name && !searchQuery.Size && !searchQuery.Layer && !searchQuery.Mode) { return maps; }

        var mapsThatMatchAllRules = [];
        for(var map of maps)
        {
            if(searchQuery.Name && map.Name.toLowerCase().indexOf(searchQuery.Name.toLowerCase()) == -1)
            {
                continue;
            }

            if(searchQuery.Size && map.Size != searchQuery.Size)
            {
                continue;
            }

            if(searchQuery.Layer || searchQuery.Mode)
            {
                var containsFilteredLayer = !searchQuery.Layer;
                var containsFilteredMode = !searchQuery.Mode ;
                for(var layout of map.Layouts)
                {
                    if(layout.Key == searchQuery.Mode)
                    {
                        containsFilteredMode = true;
                    }

                    if(layout.Value == searchQuery.Layer)
                    {
                        containsFilteredLayer = true;
                    }

                    if(containsFilteredMode && containsFilteredLayer)
                    {
                        break;
                    }
                }

                if(!containsFilteredMode || !containsFilteredLayer)
                {
                    continue;
                }
            }

            mapsThatMatchAllRules.push(map);
        }

        return mapsThatMatchAllRules;
    }
}

angular
    .module('reality-gallery')
    .component('mapBrowser', {
        templateUrl: './component/mapBrowser/mapBrowser.html',
        controller: MapBrowserComponent
    });