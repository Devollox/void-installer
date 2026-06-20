export namespace main {
	
	export class DownloadResult {
	    path: string;
	
	    static createFrom(source: any = {}) {
	        return new DownloadResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.path = source["path"];
	    }
	}
	export class LatestReleaseInfo {
	    tag: string;
	    assetName: string;
	
	    static createFrom(source: any = {}) {
	        return new LatestReleaseInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.tag = source["tag"];
	        this.assetName = source["assetName"];
	    }
	}

}

