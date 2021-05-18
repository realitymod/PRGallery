import * as angular from 'angular';
import * as route from '@uirouter/angularjs';
import { MapService } from './service/MapService/MapService';
import { ToolbarService } from './service/ToolbarService/ToolbarService';
import { GameMode, Layer } from './model/Layout';
import { Level } from './model/Level';
import '@uirouter/angularjs';


class App {
    public static $inject = ["$transitions", "ToolbarService"];

    constructor($transitions, ToolbarService: ToolbarService) {

        $transitions.onEnter({/*Any State*/ }, (trans: route.Transition, state: route.StateDeclaration) => {

            if (state.name == "browser") {
                ToolbarService.Title = "Project Reality: Map Gallery"
                ToolbarService.Subtitle = undefined;
                ToolbarService.CanGoBack = false;
                ToolbarService.SearchAvailable = true;

            } else if (state.name == "details") {
                ToolbarService.CanGoBack = true;
                ToolbarService.SearchAvailable = false;
                
                let level: Level = trans.injector().get('level');
                ToolbarService.Title = `${level.Name} (${level.Size}Km)`;

                let layer: number = parseInt(trans.params().layout);
                ToolbarService.Subtitle = `${GameMode.ProperName(trans.params().gamemode)} ${Layer.ProperName(layer)}`;
            }
        });
    }
}

angular
    .module('reality-gallery', ['ui.router', 'map-service', 'vehicle-service', 'toolbar-service'])
    .config(["$stateProvider", "$urlRouterProvider", ($stateProvider: route.StateProvider, $urlRouterProvider: route.UrlRouterProvider) => {


        $stateProvider.state({
            name: 'browser',
            url: '/?name&size&mode&layer',
            component: 'mapBrowser',
            reloadOnSearch: false,
        }).state({
            name: 'details',
            url: '/{map}/{gamemode}/{layout}?routes',
            params: {
                gamemode: {
                    dynamic: true
                },
                layout: {
                    dynamic: true
                },
                routes: {
                    dynamic: true
                }
            },
            component: 'mapDetails',
            resolve: {
                level: ["$transition$", "MapService", function ($transition$, MapService: MapService) {
                    //console.log("resolving " + $transition$.params().map);
                    return MapService.getLevel($transition$.params().map);
                }],

                layout: ["$transition$", "MapService", function ($transition$, MapService: MapService) {
                    //console.log(`resolving ${$transition$.params().map} ${$transition$.params().gamemode} ${$transition$.params().layout}`);
                    return MapService.getLayout($transition$.params().map, $transition$.params().gamemode, $transition$.params().layout);
                }]
            }
        });

        $urlRouterProvider.otherwise("/");
    }])
    .run(App);
