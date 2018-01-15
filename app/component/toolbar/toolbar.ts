import * as angular from 'angular';
import * as router from '@uirouter/angularjs';
import { Layout } from '../../model/Layout';
import { ToolbarService } from '../../service/ToolbarService/ToolbarService';

class ToolbarComponent implements ng.IComponentController {

    public static $inject = ["ToolbarService", "$state"];
    public Query: string;

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

    public OnQueryChange(){
        //console.log("OnQueryChange: " + this.Query);
        this.mState.go("browser", {
            "q": this.Query,
        });
    }
}

angular
    .module('reality-gallery')
    .component('toolbar', {
        templateUrl: './component/toolbar/toolbar.html',
        controller: ToolbarComponent,
        
    });