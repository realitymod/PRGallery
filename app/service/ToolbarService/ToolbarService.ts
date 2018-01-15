import * as angular from 'angular';

export class ToolbarService {
    private mTitle: string;
    private mSubTitle: string;
    private mShowArrow: boolean;
    private mIsBusy: boolean;

    public static $inject = [];
    constructor() {
        // Do Nothing...
    }

    public get Title() {
        return this.mTitle;
    }

    public set Title(value: string) {
        this.mTitle = value;
    }

    public get Subtitle() {
        return this.mSubTitle;
    }

    public set Subtitle(value: string) {
        this.mSubTitle = value;
    }

    public get CanGoBack(){
        return this.mShowArrow;
    }

    public set CanGoBack(value: boolean){
        this.mShowArrow = value;
    }

    public get Busy(){
        return this.mIsBusy;
    }

    public set Busy(value: boolean){
        this.mIsBusy = value;
    }
}


angular
    .module("toolbar-service", [])
    .service("ToolbarService", ToolbarService);