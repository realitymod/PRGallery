import * as angular from 'angular';
import * as router from '@uirouter/angularjs';
import { Layout } from '../../model/Layout';
import { ToolbarService } from '../../service/ToolbarService/ToolbarService';
import { SearchEvent } from '../search/search';
import { UrlUtils } from '../../utils/UrlUtils';

class ToolbarComponent implements ng.IComponentController {

    public static $inject = ["ToolbarService", "$state"];
    private useFullSearchBar;

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

    public get ShowSearch():boolean{
        // Reset the full search bar if the search is not avaiable
        // this way when the user goes back to the main page
        // the search bar is not visible
        if(this.useFullSearchBar && !this.ToolbarService.SearchAvailable)
        {
            this.useFullSearchBar = false;
        }
        
        return this.ToolbarService.SearchAvailable;
    }

    public get UseFullSearchBar():boolean{
        return this.useFullSearchBar;
    }

    public set UseFullSearchBar(value:boolean){
        this.useFullSearchBar = value;
    }

    public OnSearch(event: SearchEvent) : void
    {
        this.mState.go("browser", {
            "name": event.Name,
            "size": UrlUtils.ArrayToUrl(event.Size),
            "mode": UrlUtils.ArrayToUrl(event.Mode),
            "layer": UrlUtils.ArrayToUrl(event.Layer),
        });   
    }
}

angular
    .module('reality-gallery')
    .component('toolbar', {
        templateUrl: './component/toolbar/toolbar.html',
        controller: ToolbarComponent,
        
    });
