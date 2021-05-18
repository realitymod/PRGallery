import * as angular from 'angular';
import * as router from '@uirouter/angularjs';
import { Layout } from '../../model/Layout';
import { ToolbarService } from '../../service/ToolbarService/ToolbarService';
import { SearchEvent } from '../search/search';

class ToolbarComponent implements ng.IComponentController {

    public static $inject = ["ToolbarService", "$state"];

    constructor(private ToolbarService: ToolbarService, private mState: router.StateService) {
    }

    public get Title(){
        return this.ToolbarService.Title;
    }
    public get Subtitle(){
        return this.ToolbarService.Subtitle;
    }

    public get ShowArrow(){
        return this.ToolbarService.CanGoBack;
    }

    public get Busy():boolean{
        return this.ToolbarService.Busy;
    }

    public OnSearch(event: SearchEvent) : void
    {
        this.mState.go("browser", {
            "name": event.Name,
            "size": event.Size,
            "mode": event.Mode,
            "layer": event.Layer,
        });   
    }
}

angular
    .module('reality-gallery')
    .component('toolbar', {
        templateUrl: './component/toolbar/toolbar.html',
        controller: ToolbarComponent,
        
    });
